import path from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { APP_ROOT, PORT, LOCAL_URL, SERVER_ID, requireNode, npmVersion, createLog, reporter, instanceId, buildId } from './common.mjs';
import { validateDist, probeServer, sameServer } from './static-server.mjs';
import { lanAddresses } from './launch.mjs';

const log = createLog('diagnostik');
const say = reporter(log);
say(`Log diagnostik: ${log.file}`);
say(`Lokasi aplikasi: ${APP_ROOT}`);
say(`Node.js: ${process.versions.node}`);
let failed = false;
try { requireNode(); } catch (error) { say(error.message); failed = true; }
try { say(`npm: ${npmVersion()}`); } catch (error) { say(error.message); failed = true; }
let identity;
try {
  const dist = await validateDist(path.join(APP_ROOT, 'dist'));
  identity = { server: SERVER_ID, instance: instanceId(APP_ROOT), build: buildId(dist) };
  say(`dist: lengkap (permainan dan galeri), aset: ${(await readdir(path.join(dist, 'assets'))).length} berkas.`);
} catch (error) { say(`dist: ${error.message}`); failed = true; }
say(`Alamat tetap: ${LOCAL_URL} | port ${PORT} (tidak dialihkan otomatis)`);
const probe = await probeServer(PORT);
if (!probe.occupied) say('Port: belum dipakai. Jalankan JALANKAN_JELAJAH_SAINS.bat.');
else if (identity && sameServer(probe.identity, identity)) say('Port: server Jelajah Sains dari folder dan build ini sudah aktif.');
else { say('Port: dipakai aplikasi lain, dev server, atau folder/build berbeda. Tutup server yang sesuai sendiri; tidak ada proses yang dimatikan oleh diagnostik.'); failed = true; }
say(`Kandidat LAN: ${lanAddresses().map(address => `http://${address}:${PORT}`).join(' | ') || 'tidak ditemukan'}`);
say('HP/IFP memerlukan jaringan yang sama dan izin firewall. Kandidat IP bukan bukti koneksi antarperangkat berhasil.');
say('Node.js resmi: https://nodejs.org/ (pilih LTS beserta npm).');
say('Jika layar putih: jangan buka index.html langsung. Gunakan alamat server di atas.');
say('Log tidak membaca IndexedDB, cadangan siswa, cookie, atau variabel lingkungan rahasia.');
for (const task of ['persiapan', 'jalankan']) {
  const previous = await readFile(path.join(path.dirname(log.file), `${task}-status.json`), 'utf8').then(JSON.parse).catch(() => null);
  if (previous && typeof previous.at === 'string' && typeof previous.message === 'string') {
    say(`Hasil ${task} terakhir (${previous.at}): ${previous.ok ? 'berhasil' : 'GAGAL'} — ${previous.message}`);
  }
}
say('Untuk kegagalan persiapan, buka log persiapan-* pada folder log di atas. Log terbaru memuat penyebab instalasi/build gagal.');
say(failed ? 'Ada masalah yang perlu diperbaiki; lihat keterangan di atas.' : 'Pemeriksaan dasar selesai.');
process.exitCode = failed ? 1 : 0;
