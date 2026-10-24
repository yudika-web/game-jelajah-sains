import path from 'node:path';
import { networkInterfaces } from 'node:os';
import { pathToFileURL } from 'node:url';
import { APP_ROOT, PORT, LOCAL_URL, requireNode, createLog, reporter, openBrowser, writeOutcome } from './common.mjs';
import { createStaticServer, listenOrReuse } from './static-server.mjs';

export function lanAddresses(interfaces = networkInterfaces()) {
  return [...new Set(Object.values(interfaces).flat().filter(entry => entry && (entry.family === 'IPv4' || entry.family === 4) && !entry.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(entry.address)).map(entry => entry.address))];
}

export async function launch({ root = APP_ROOT, port = PORT, browser = true, log = createLog('jalankan') } = {}) {
  const say = reporter(log);
  say(`Log: ${log.file}`);
  requireNode();
  const { server, identity } = await createStaticServer({ root: path.join(root, 'dist'), appRoot: root });
  const { reused } = await listenOrReuse(server, identity, port);
  const url = port === PORT ? LOCAL_URL : `http://localhost:${port}`;
  say(reused ? 'Server Jelajah Sains dari folder dan build yang sama sudah aktif.' : 'Server aktif; biarkan jendela ini terbuka selama bermain');
  say(`Laptop: ${url}`);
  {
    const addresses = lanAddresses();
    say(addresses.length ? `Kandidat IPv4 LAN: ${addresses.map(address => `http://${address}:${port}`).join(' | ')}` : 'Tidak ditemukan IPv4 LAN privat. Periksa sambungan Wi-Fi/Ethernet.');
    say('HP/IFP harus berada pada jaringan yang sama. Firewall/isolasi Wi-Fi dapat membatasi akses; koneksi perangkat lain belum dijamin.');
    say(reused ? 'Biarkan jendela server pertama tetap terbuka; jendela peluncur kedua ini boleh ditutup.' : 'Hentikan: tekan Ctrl+C di jendela server, lalu jawab Y bila Windows meminta konfirmasi.');
  }
  say('Progres mengikuti alamat browser. Jika pindah dari 127.0.0.1, port 4173, atau IP LAN: ekspor di alamat lama, lalu impor di alamat ini.');
  if (browser) openBrowser(url);
  if (!reused) {
    const stop = () => { say('Server dihentikan. Progres browser tidak dihapus.'); server.close(); server.closeAllConnections(); };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    server.once('close', () => { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); });
  }
  return { server, reused };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  let log;
  try { log = createLog('jalankan'); await launch({ log }); writeOutcome(log, 'jalankan', true, 'Peluncuran terakhir berhasil.'); }
  catch (error) { console.error(`GAGAL: ${error.message}`); log?.write(`GAGAL: ${error.message}`); if (log) writeOutcome(log, 'jalankan', false, error.message); process.exitCode = 1; }
}
