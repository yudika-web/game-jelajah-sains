import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createStaticServer, validateDist, probeServer, listenOrReuse } from '../../scripts/local/static-server.mjs';
import { SERVER_ID, STATUS_PATH, requireNode } from '../../scripts/local/common.mjs';
import { lanAddresses } from '../../scripts/local/launch.mjs';

let root, server, port, identity;
const listen = server => new Promise(resolve => server.listen(0, '0.0.0.0', () => resolve(server.address().port)));
const close = server => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
const request = (url, method = 'GET') => new Promise((resolve, reject) => {
  const req = http.request({ host: '127.0.0.1', port, path: url, method }, response => {
    let body = ''; response.on('data', data => body += data); response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
  }); req.on('error', reject); req.end();
});
before(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'Jelajah Sains - Ruang belajar é '));
  await mkdir(path.join(root, 'dist', 'assets'), { recursive: true });
  await writeFile(path.join(root, 'dist', 'index.html'), '<h1>Game</h1>');
  await writeFile(path.join(root, 'dist', 'character.html'), '<h1>Galeri</h1>');
  await writeFile(path.join(root, 'dist', 'assets', 'game.js'), 'export const local = true;');
  await writeFile(path.join(root, 'dist', 'assets', 'game.css'), 'canvas {}');
  await writeFile(path.join(root, 'dist', 'assets', 'ruang sains.svg'), '<svg/>');
  await writeFile(path.join(root, 'private.txt'), 'private');
  await writeFile(path.join(root, 'dist', '.hidden'), 'hidden');
  ({ server, identity } = await createStaticServer({ root: path.join(root, 'dist'), appRoot: root }));
  port = await listen(server);
});
after(async () => { await close(server); await rm(root, { recursive: true, force: true }); });

test('both production pages, asset MIME, query strings and HEAD work from a Unicode/spaced folder', async () => {
  for (const [url, type] of [['/', 'text/html'], ['/index.html?avatar=siswi', 'text/html'], ['/character.html', 'text/html'], ['/assets/game.js', 'text/javascript'], ['/assets/game.css', 'text/css'], ['/assets/ruang%20sains.svg', 'image/svg+xml']]) {
    const response = await request(url); assert.equal(response.status, 200); assert.ok(response.headers['content-type'].startsWith(type));
  }
  const head = await request('/character.html', 'HEAD'); assert.equal(head.status, 200); assert.equal(head.body, ''); assert.ok(Number(head.headers['content-length']) > 0);
});

test('only dist is served; invalid URLs, traversal, hidden files and unsupported methods are rejected', async () => {
  for (const url of ['/../private.txt', '/%2e%2e/private.txt', '/assets/%2e%2e/%2e%2e/private.txt', '/.hidden']) assert.equal((await request(url)).status, 403, url);
  for (const url of ['/%', '/%00', '/%5c..%5cprivate.txt', '//other/path', '/C:/private']) assert.equal((await request(url)).status, 400, url);
  for (const url of ['/package.json', '/scripts/local/launch.mjs', '/private.txt', '/assets/', '/missing.html']) assert.equal((await request(url)).status, 404, url);
  assert.equal((await request('/', 'POST')).status, 405);
});

test('symbolic links cannot serve outside the build', async context => {
  try { await symlink(path.join(root, 'private.txt'), path.join(root, 'dist', 'linked.txt')); }
  catch (error) { if (error.code === 'EPERM') return context.skip('Symlink permission unavailable'); throw error; }
  assert.equal((await request('/linked.txt')).status, 403);
});

test('identity endpoint has no paths, environmental secrets, or player data', async () => {
  const response = await request(STATUS_PATH); const body = JSON.parse(response.body);
  assert.deepEqual(body, identity); assert.equal(body.server, SERVER_ID); assert.deepEqual(Object.keys(body).sort(), ['build', 'instance', 'server']);
  assert.ok(!response.body.includes(root)); assert.deepEqual((await probeServer(port)).identity, identity);
});

test('a second launcher reuses only the same application folder and build', async () => {
  const second = await createStaticServer({ root: path.join(root, 'dist'), appRoot: root });
  assert.deepEqual(await listenOrReuse(second.server, second.identity, port), { reused: true });
  const other = await createStaticServer({ root: path.join(root, 'dist'), appRoot: `${root}-other` });
  await assert.rejects(listenOrReuse(other.server, other.identity, port), /Port .* sudah dipakai/);
  const changed = await createStaticServer({ root: path.join(root, 'dist'), appRoot: root });
  await assert.rejects(listenOrReuse(changed.server, { ...changed.identity, build: 'different' }, port), /Port .* sudah dipakai/);
  assert.equal((await request('/')).status, 200); // Existing process was never killed.
});

test('foreign HTTP and non-HTTP services are reported without killing or switching ports', async () => {
  const other = http.createServer((req, res) => res.end('another application'));
  const otherPort = await listen(other);
  try {
    const candidate = await createStaticServer({ root: path.join(root, 'dist'), appRoot: root });
    await assert.rejects(listenOrReuse(candidate.server, candidate.identity, otherPort), /Port .* sudah dipakai/);
    assert.equal(other.listening, true);
  } finally { await close(other); }
  const silent = http.createServer(() => {}); const silentPort = await listen(silent);
  try { assert.deepEqual(await probeServer(silentPort, { timeout: 50 }), { occupied: true, identity: null }); }
  finally { await close(silent); }
});

test('missing or partial dist gives preparation instructions', async () => {
  await assert.rejects(validateDist(path.join(root, 'absent')), /SIAPKAN_ATAU_PERBARUI.bat/);
  const partial = path.join(root, 'partial'); await mkdir(partial); await writeFile(path.join(partial, 'index.html'), 'partial');
  await assert.rejects(validateDist(partial), /character.html/);
  await writeFile(path.join(partial, 'character.html'), '<script src="/assets/missing.js"></script>');
  await assert.rejects(validateDist(partial), /Aset build belum lengkap/);
});

test('supported Node versions and private IPv4 LAN candidates only', () => {
  for (const version of ['22.12.0', '22.22.0', '24.0.0']) assert.doesNotThrow(() => requireNode(version));
  for (const version of ['18.20.0', '22.11.9']) assert.throws(() => requireNode(version), /nodejs.org/);
  const entry = (address, internal = false, family = 'IPv4') => ({ address, internal, family });
  assert.deepEqual(lanAddresses({ a: [entry('127.0.0.1', true), entry('192.168.1.4'), entry('192.168.1.4')], b: [entry('172.20.0.2'), entry('10.0.0.4'), entry('169.254.1.1'), entry('0.0.0.0'), entry('8.8.8.8'), entry('::1', false, 'IPv6')] }), ['192.168.1.4', '172.20.0.2', '10.0.0.4']);
});


test('relocated launcher runs from another working directory without npm/node_modules or internet setup', async () => {
  const relocated = path.join(root, 'Salinan Pelajaran é & IPA');
  await mkdir(path.join(relocated, 'scripts'), { recursive: true });
  await cp(new URL('../../scripts/local/', import.meta.url), path.join(relocated, 'scripts/local'), { recursive: true });
  await cp(path.join(root, 'dist'), path.join(relocated, 'dist'), { recursive: true, dereference: false });
  const reservation = http.createServer(); const freePort = await listen(reservation); await close(reservation);
  const script = `
    import assert from 'node:assert/strict';
    import { existsSync } from 'node:fs';
    import { launch } from ${JSON.stringify(pathToFileURL(path.join(relocated, 'scripts/local/launch.mjs')).href)};
    const options = { port: ${freePort}, browser: false, log: { file: 'test-only', write() {} } };
    const first = await launch(options);
    try {
      assert.equal(first.reused, false);
      const second = await launch(options);
      assert.equal(second.reused, true);
      const response = await fetch('http://localhost:${freePort}/character.html');
      assert.equal(response.status, 200);
      assert.equal(existsSync(${JSON.stringify(path.join(relocated, 'node_modules'))}), false);
    } finally { await new Promise(resolve => { first.server.close(resolve); first.server.closeAllConnections(); }); }
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: tmpdir(), env: { ...process.env, PATH: '' }, encoding: 'utf8', timeout: 15_000,
  });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /Server aktif; biarkan/); assert.match(result.stdout, /sudah aktif/);
});
