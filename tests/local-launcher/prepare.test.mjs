import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { dependencyFingerprint, needsInstall, promoteBuild, prepare } from '../../scripts/local/prepare.mjs';

let root;
const build = async (folder, content) => { await mkdir(folder, { recursive: true }); for (const name of ['index.html', 'character.html']) await writeFile(path.join(folder, name), content); };
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'Persiapan Sains é & ruang '));
  await writeFile(path.join(root, 'package.json'), '{"name":"fixture"}');
  await writeFile(path.join(root, 'package-lock.json'), '{"lockfileVersion":3}');
  await build(path.join(root, 'dist'), 'old build');
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

test('installation stamp tracks lock changes and missing dependencies', async () => {
  const fingerprint = await dependencyFingerprint(root);
  assert.equal(await needsInstall(root, fingerprint), true);
  for (const file of ['vite/bin/vite.js', 'typescript/package.json', 'three/package.json']) {
    const target = path.join(root, 'node_modules', file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, '{}');
  }
  await mkdir(path.join(root, '.jelajah-local')); await writeFile(path.join(root, '.jelajah-local/dependencies.sha256'), fingerprint);
  assert.equal(await needsInstall(root, fingerprint), false);
  await writeFile(path.join(root, 'package-lock.json'), '{"lockfileVersion":3,"changed":true}');
  assert.equal(await needsInstall(root, await dependencyFingerprint(root)), true);
  await rm(path.join(root, 'node_modules/three/package.json'));
  assert.equal(await needsInstall(root, fingerprint), true);
});

test('invalid replacement leaves old production build untouched', async () => {
  const staging = path.join(root, 'stage'); await mkdir(staging); await writeFile(path.join(staging, 'index.html'), 'incomplete');
  await assert.rejects(promoteBuild(root, staging), /character.html/);
  assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), 'old build');
});

test('successful build replaces both pages, failed promotion rolls the old build back', async () => {
  const staging = path.join(root, 'stage'); await build(staging, 'new build');
  await assert.rejects(promoteBuild(root, staging, async (from, to) => {
    if (from === staging) throw Object.assign(new Error('locked'), { code: 'EPERM' });
    await rename(from, to);
  }), /Build lama dipulihkan/);
  assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), 'old build');
  await promoteBuild(root, staging);
  assert.equal(await readFile(path.join(root, 'dist/character.html'), 'utf8'), 'new build');
});

test('failed npm install/build never deletes old dist; retry installation after failure', async () => {
  const messages = []; const log = { file: 'test-log', write: message => messages.push(message) };
  await assert.rejects(prepare({ root, log, command: async () => { throw new Error('installation failed'); } }), /installation failed/);
  assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), 'old build');
  const calls = [];
  await assert.rejects(prepare({ root, log, command: async args => { calls.push(args[0]); if (args[0] === 'run') throw new Error('build failed'); } }), /build failed/);
  assert.deepEqual(calls, ['ci', 'run']);
  assert.equal(await readFile(path.join(root, 'dist/character.html'), 'utf8'), 'old build');
});

test('preparation builds to a separate folder then promotes, and blocks concurrent preparation', async () => {
  const log = { file: 'test-log', write() {} };
  await mkdir(path.join(root, '.jelajah-local')); await writeFile(path.join(root, '.jelajah-local/prepare.lock'), String(process.pid));
  await assert.rejects(prepare({ root, log, command: async () => {} }), /Persiapan lain/);
  await rm(path.join(root, '.jelajah-local/prepare.lock'));
  await prepare({ root, log, command: async args => {
    assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), 'old build');
    if (args[0] === 'run') { assert.equal(args[3], '--outDir'); await build(path.join(root, args[4]), 'verified new build'); }
  } });
  assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), 'verified new build');
});
