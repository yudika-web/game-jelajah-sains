import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOSTNAME = 'localhost';
export const PORT = 5173;
export const LOCAL_URL = `http://${HOSTNAME}:${PORT}`;
export const STATUS_PATH = '/__jelajah_sains__/status';
export const SERVER_ID = 'jelajah-sains-static-v1';
export const digest = value => createHash('sha256').update(value).digest('hex');
export const instanceId = root => digest(path.resolve(root));
export const buildId = root => digest(['index.html', 'character.html'].map(file => readFileSync(path.join(root, file))).join('\n'));

export function requireNode(version = process.versions.node) {
  const [major, minor] = version.split('.').map(Number);
  if (!(major > 22 || (major === 22 && minor >= 12))) {
    throw new Error(`Node.js ${version} belum memenuhi syarat >=22.12. Pasang Node.js 24 LTS dari https://nodejs.org/ lalu buka ulang peluncur.`);
  }
}

export function createLog(task) {
  const candidates = [process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Jelajah-Sains', 'logs'), path.join(tmpdir(), 'Jelajah-Sains', 'logs')].filter(Boolean);
  for (const directory of candidates) {
    try {
      mkdirSync(directory, { recursive: true });
      const file = path.join(directory, `${task}-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.log`);
      appendFileSync(file, `Jelajah Sains | ${task}\n`);
      return { file, write: message => appendFileSync(file, `${message}\n`) };
    } catch { /* Try another writable directory, never the player's storage. */ }
  }
  throw new Error('Folder log tidak dapat ditulis. Periksa izin folder sementara Windows (TEMP).');
}

export function reporter(log) {
  return message => { console.log(message); log.write(message); };
}

export function npmVersion(cwd = APP_ROOT) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], {
    cwd, encoding: 'utf8', shell: process.platform === 'win32', windowsHide: true,
    timeout: 30_000,
  });
  if (result.error || result.status !== 0) throw new Error('npm tidak tersedia atau gagal dijalankan. Pasang ulang Node.js LTS beserta npm: https://nodejs.org/');
  const version = result.stdout.trim();
  if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(version) || Number(version.split('.')[0]) < 10) {
    throw new Error(`npm ${version} tidak didukung. Gunakan npm >=10 yang disertakan Node.js 24 LTS.`);
  }
  return version;
}

export function runNpm(args, { cwd = APP_ROOT, log } = {}) {
  return new Promise((resolve, reject) => {
    // All arguments are fixed by this application, including the ASCII staging basename.
    // npm.cmd needs cmd.exe on Windows; cwd is passed separately, never interpolated.
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
      cwd, shell: process.platform === 'win32', windowsHide: true, stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, npm_config_cache: path.join(tmpdir(), 'Jelajah-Sains', 'npm-cache') },
    });
    for (const [stream, target] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      stream?.on('data', data => { target.write(data); log?.write(data.toString()); });
    }
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`npm ${args[0]} gagal (kode ${code ?? 'terhenti'}). Periksa log; build lama tetap dipertahankan.`)));
  });
}

export function openBrowser(url = LOCAL_URL) {
  if (process.platform !== 'win32') return false;
  const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore', windowsHide: true });
  child.on('error', () => console.log(`Browser tidak dapat dibuka otomatis. Buka ${url} secara manual.`));
  child.unref();
  return true;
}


export function writeOutcome(log, task, ok, message) {
  try {
    writeFileSync(path.join(path.dirname(log.file), `${task}-status.json`), JSON.stringify({ ok, at: new Date().toISOString(), message: message.slice(0, 1200) }));
  } catch { /* The action log already contains the result; status is only a diagnostic aid. */ }
}
