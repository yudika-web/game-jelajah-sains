import { existsSync } from 'node:fs';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { APP_ROOT, digest, requireNode, npmVersion, runNpm, createLog, reporter, writeOutcome } from './common.mjs';
import { validateDist } from './static-server.mjs';

export async function dependencyFingerprint(root) {
  const [manifest, lock] = await Promise.all(['package.json', 'package-lock.json'].map(file => readFile(path.join(root, file))));
  return digest(Buffer.concat([manifest, lock, Buffer.from(`${process.versions.node.split('.')[0]}|${process.platform}|${process.arch}`)]));
}

export async function needsInstall(root, fingerprint) {
  const marker = await readFile(path.join(root, '.jelajah-local', 'dependencies.sha256'), 'utf8').catch(() => '');
  return marker !== fingerprint || ['vite/bin/vite.js', 'typescript/package.json', 'three/package.json'].some(file => !existsSync(path.join(root, 'node_modules', file)));
}

export async function promoteBuild(root, staging, move = rename) {
  await validateDist(staging); // Never touch a usable dist until the replacement has both pages.
  const dist = path.join(root, 'dist');
  const backup = path.join(root, `.jelajah-build-backup-${randomUUID()}`);
  const hadBuild = existsSync(dist);
  if (hadBuild) {
    try { await move(dist, backup); }
    catch (error) { throw new Error(`Build baru selesai, tetapi dist lama tidak dapat dipindahkan (${error.code ?? 'izin berkas'}). Tutup server dan periksa izin folder. Build lama tetap tersedia.`); }
  }
  try { await move(staging, dist); }
  catch (error) {
    if (hadBuild) {
      try { await move(backup, dist); }
      catch { throw new Error(`Penggantian build gagal; build lama aman di ${backup}. Pulihkan folder tersebut menjadi dist sebelum menjalankan game.`); }
    }
    throw new Error(`Build baru tidak dapat ditempatkan. ${hadBuild ? 'Build lama dipulihkan.' : 'Belum ada build siap pakai.'} ${error.code ?? ''}`);
  }
  if (hadBuild) await rm(backup, { recursive: true, force: true }).catch(() => { /* A retained backup is safer than deleting in-use files. */ });
}

async function preparationLock(directory) {
  const file = path.join(directory, 'prepare.lock');
  try {
    const handle = await open(file, 'wx');
    await handle.writeFile(String(process.pid));
    return async () => { await handle.close(); await rm(file, { force: true }); };
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await readFile(file, 'utf8'));
    if (Number.isSafeInteger(pid) && pid > 0) {
      // Signal 0 only checks existence; it never terminates the process.
      try { process.kill(pid, 0); }
      catch (probeError) { if (probeError.code === 'ESRCH') { await rm(file, { force: true }); return preparationLock(directory); } }
    }
    throw new Error('Persiapan lain masih aktif atau kuncinya belum dapat diverifikasi. Tutup persiapan lain; bila sudah berhenti, hapus hanya .jelajah-local/prepare.lock lalu coba lagi.');
  }
}

export async function prepare({ root = APP_ROOT, log = createLog('persiapan'), command = runNpm } = {}) {
  const say = reporter(log);
  say(`Log: ${log.file}`);
  requireNode();
  say(`Node.js ${process.versions.node} | npm ${npmVersion(root)}`);
  say('Hentikan server permainan sebelum memperbarui. Progres browser tidak diubah.');
  const local = path.join(root, '.jelajah-local');
  await mkdir(local, { recursive: true });
  const release = await preparationLock(local);
  const staging = path.join(root, `.jelajah-build-${randomUUID()}`);
  try {
    const fingerprint = await dependencyFingerprint(root);
    if (await needsInstall(root, fingerprint)) {
      say('Memasang dependensi sesuai package-lock.json. Tahap ini mungkin memerlukan internet.');
      await rm(path.join(local, 'dependencies.sha256'), { force: true });
      await command(['ci', '--include=dev', '--no-audit', '--no-fund'], { cwd: root, log });
      await writeFile(path.join(local, 'dependencies.sha256'), fingerprint);
    } else say('Dependensi sudah sesuai; instalasi dilewati.');
    say('Membangun versi terbaru ke folder sementara. Build lama tetap tersedia jika gagal.');
    await command(['run', 'build', '--', '--outDir', path.basename(staging)], { cwd: root, log });
    await promoteBuild(root, staging);
    say('BERHASIL. Klik ganda JALANKAN_JELAJAH_SAINS.bat untuk bermain.');
  } finally {
    await rm(staging, { recursive: true, force: true }).catch(() => {});
    await release();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  let log;
  try { log = createLog('persiapan'); await prepare({ log }); writeOutcome(log, 'persiapan', true, 'Persiapan terakhir berhasil.'); }
  catch (error) { console.error(`GAGAL: ${error.message}`); log?.write(`GAGAL: ${error.message}`); if (log) writeOutcome(log, 'persiapan', false, error.message); process.exitCode = 1; }
}
