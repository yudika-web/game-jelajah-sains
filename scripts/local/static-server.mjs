import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildId, instanceId, SERVER_ID, STATUS_PATH } from './common.mjs';

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.gif': 'image/gif',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
};
const inside = (root, file) => { const relative = path.relative(root, file); return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)); };

export async function validateDist(root) {
  const directory = await realpath(root).catch(() => { throw new Error('dist belum tersedia. Klik SIAPKAN_ATAU_PERBARUI.bat terlebih dahulu.'); });
  for (const entry of ['index.html', 'character.html']) {
    const file = await realpath(path.join(directory, entry)).catch(() => null);
    if (!file || !inside(directory, file) || !(await stat(file)).isFile()) {
      throw new Error(`Build belum lengkap (${entry}). Klik SIAPKAN_ATAU_PERBARUI.bat.`);
    }
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) {
      const reference = match[1];
      if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;
      const assetPath = decodeURIComponent(reference.split(/[?#]/)[0]);
      const asset = await realpath(path.resolve(directory, assetPath.startsWith('/') ? `.${assetPath}` : assetPath)).catch(() => null);
      if (!asset || !inside(directory, asset) || !(await stat(asset)).isFile()) {
        throw new Error(`Aset build belum lengkap (${reference}). Klik SIAPKAN_ATAU_PERBARUI.bat.`);
      }
    }
  }
  return directory;
}

export async function createStaticServer({ root, appRoot }) {
  const directory = await validateDist(root);
  const identity = { server: SERVER_ID, instance: instanceId(appRoot), build: buildId(directory) };
  const server = http.createServer(async (req, res) => {
    const reply = (code, message, type = 'text/plain; charset=utf-8') => {
      res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : message);
    };
    try {
      if (!['GET', 'HEAD'].includes(req.method)) return reply(405, 'Hanya GET dan HEAD tersedia.');
      const raw = req.url ?? '';
      if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('#')) return reply(400, 'URL tidak valid.');
      const pathname = decodeURIComponent(raw.split('?')[0]);
      if (/[\u0000-\u001f\u007f\\:]/.test(pathname)) return reply(400, 'URL tidak valid.');
      if (pathname.split('/').some(part => part === '..' || part === '.' || part.startsWith('.'))) return reply(403, 'Akses ditolak.');
      if (pathname === STATUS_PATH) return reply(200, JSON.stringify(identity), 'application/json; charset=utf-8');
      const filePath = path.resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!inside(directory, filePath)) return reply(403, 'Akses ditolak.');
      let file;
      try { file = await realpath(filePath); } catch { return reply(404, 'Berkas tidak ditemukan dalam build.'); }
      if (!inside(directory, file)) return reply(403, 'Akses ditolak.');
      const details = await stat(file);
      if (!details.isFile()) return reply(404, 'Berkas tidak ditemukan dalam build.');
      res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Content-Length': details.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') return res.end();
      const stream = createReadStream(file);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (!res.headersSent) reply(error instanceof URIError ? 400 : 500, error instanceof URIError ? 'URL tidak valid.' : 'Berkas build tidak dapat dibaca. Jalankan diagnostik.');
      else res.destroy();
    }
  });
  // No console dump of request URLs, cookies, or player information.
  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  return { server, identity };
}

export function probeServer(port, { timeout = 1200 } = {}) {
  return new Promise(resolve => {
    const request = http.get({ host: '127.0.0.1', port, path: STATUS_PATH, timeout }, response => {
      let body = '';
      response.on('data', chunk => { body += chunk; if (body.length > 4096) request.destroy(); });
      response.on('end', () => {
        try { resolve({ occupied: true, identity: response.statusCode === 200 ? JSON.parse(body) : null }); }
        catch { resolve({ occupied: true, identity: null }); }
      });
      response.on('error', () => resolve({ occupied: true, identity: null }));
    });
    request.on('timeout', () => request.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    request.on('error', error => resolve({ occupied: error.code !== 'ECONNREFUSED', identity: null }));
  });
}

export const sameServer = (actual, expected) => actual?.server === expected.server && actual?.instance === expected.instance && actual?.build === expected.build;

export async function listenOrReuse(server, identity, port) {
  const listenError = await new Promise(resolve => {
    server.once('error', resolve);
    server.listen(port, '0.0.0.0', () => { server.removeListener('error', resolve); resolve(null); });
  });
  if (listenError) {
    if (listenError.code !== 'EADDRINUSE') throw listenError;
    const probe = await probeServer(port);
    if (sameServer(probe.identity, identity)) return { reused: true };
    throw new Error(`Port ${port} sudah dipakai aplikasi lain, dev server, atau salinan/build Jelajah Sains berbeda. Tutup server tersebut sendiri, lalu coba lagi. Port tidak diganti dan proses lain tidak dimatikan.`);
  }
  const probe = await probeServer(port);
  if (!sameServer(probe.identity, identity)) {
    await new Promise(resolve => server.close(resolve));
    throw new Error('Server belum siap atau identitasnya tidak sesuai. Jalankan DIAGNOSTIK_JELAJAH_SAINS.bat.');
  }
  return { reused: false };
}
