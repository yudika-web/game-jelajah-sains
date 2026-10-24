import { chromium, expect } from '@playwright/test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
const origin = process.env.EVIDENCE_ORIGIN || 'http://127.0.0.1:4173';
const output = path.resolve('docs/evidence/running');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [], samples = [];
async function go(page, id, title) {
  await page.locator('#map').click(); await page.locator(`[data-destination=${id}]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title, { timeout: 30_000 });
}
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true'); await page.locator('#start').click();
  await go(page, 'nara', 'Halo, penjelajah muda!'); await page.locator('#accept-mission').click();
  await page.locator('#settings').click(); await page.locator('#camera-distance').selectOption('near'); await page.locator('#home').click();
  await page.addStyleTag({ content: '#toast{display:none!important}' });
  const cdp = await context.newCDPSession(page), dir = await mkdtemp(path.join(tmpdir(), 'jelajah-run-'));
  const frames = [], writes = [];
  cdp.on('Page.screencastFrame', data => {
    const file = path.join(dir, `${String(frames.length).padStart(6, '0')}.jpg`);
    frames.push({ file, time: data.metadata.timestamp }); writes.push(writeFile(file, Buffer.from(data.data, 'base64')));
    void cdp.send('Page.screencastFrameAck', { sessionId: data.sessionId });
  });
  async function caption(text) {
    await page.evaluate(text => {
      let el = document.getElementById('motion-caption');
      if (!el) { el = document.createElement('div'); el.id = 'motion-caption'; el.style.cssText = 'position:fixed;left:50%;top:84px;transform:translateX(-30%);background:#fffbedf5;color:#23463d;border-radius:10px;padding:10px 16px;z-index:30;font:14px sans-serif;pointer-events:none'; document.body.append(el); }
      el.textContent = text;
    }, text);
  }
  async function sample(name) {
    samples.push({ name, time: +(Date.now()/1000 - frames[0].time).toFixed(3), ...await page.locator('#world').evaluate(c => ({ x: c.dataset.x, z: c.dataset.z, speed: c.dataset.speed, state: c.dataset.locomotion, mode: c.dataset.runMode, yaw: c.dataset.cameraYaw })) });
  }
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: 960, maxHeight: 675, everyNthFrame: 1 });
  await caption('Jalan · WASD · 5,2 unit/detik'); await page.keyboard.down('w'); await page.waitForTimeout(500); await sample('walk');
  await caption('Tahan Shift · Lari · 8,0 unit/detik'); await page.keyboard.down('ShiftLeft'); await page.waitForTimeout(550); await sample('run');
  await caption('Lepas Shift · kembali Jalan'); await page.keyboard.up('ShiftLeft'); await page.waitForTimeout(350); await sample('walk-again');
  await page.keyboard.up('w'); await caption('Lepas arah · berhenti dengan transisi singkat'); await page.waitForTimeout(650); await sample('stop');
  await caption('Berbelok · putaran halus, kamera tetap'); await page.keyboard.down('d'); await page.waitForTimeout(450); await page.keyboard.up('d'); await page.waitForTimeout(400);
  await caption('Perjalanan otomatis · mengikuti jalur aman'); await go(page, 'book', 'Ke mana air hujan mengalir?'); await page.locator('#close-panel').click();
  await page.locator('#camera-reset').click();
  await page.mouse.move(1000, 600); await page.mouse.down(); await page.mouse.move(1000 + (.25 + Math.PI/4) / .006, 600); await page.mouse.up();
  await caption('Lari ke tembok · tabrakan tetap menghentikan langkah');
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('w'); await page.keyboard.down('a'); await page.waitForTimeout(1400); await sample('wall');
  await page.screenshot({ path: path.join(output, 'running-wall.png') });
  await page.keyboard.up('w'); await page.keyboard.up('a'); await page.keyboard.up('ShiftLeft'); await page.waitForTimeout(350);
  await caption('IFP · pilih Lari lalu ketuk tujuan');
  await page.locator('#settings').click(); await page.locator('#settings-mode').selectOption('ifp'); await page.locator('#close-panel').click();
  await page.locator('#run-toggle').click(); await page.locator('#map').click(); await page.locator('[data-destination=nara]').click();
  await page.waitForTimeout(350); await sample('automatic-run');
  await expect(page.locator('#panel-title')).toHaveText('Ikuti bukti, satu per satu', { timeout: 20_000 });
  await caption('Tiba tepat di tujuan · dialog terbuka · mode kembali Jalan'); await page.waitForTimeout(900); await sample('arrived');
  await cdp.send('Page.stopScreencast'); await Promise.all(writes);
  expect(Number(samples.find(s => s.name === 'walk').speed)).toBeGreaterThan(5);
  expect(Number(samples.find(s => s.name === 'run').speed)).toBeGreaterThan(7.5);
  expect(samples.find(s => s.name === 'wall').state).toBe('idle');
  expect(samples.find(s => s.name === 'arrived').mode).toBe('walk');
  expect(errors).toEqual([]);
  const concat = frames.map((frame, i) => `file '${frame.file}'\nduration ${i + 1 < frames.length ? Math.max(.01, frames[i + 1].time - frame.time) : .1}\n`).join('');
  await writeFile(path.join(dir, 'frames.txt'), concat);
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'frames.txt'), '-vf', 'fps=20,scale=960:-2', '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-an', '-y', path.join(output, 'walk-run-navigation.webm')], { timeout: 60_000 });
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', String(samples.find(s => s.name === 'run').time), '-i', path.join(output, 'walk-run-navigation.webm'), '-frames:v', '1', '-y', path.join(output, 'laptop-running.png')]);
  const hp = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const phone = await hp.newPage(); phone.on('pageerror', e => errors.push(e.message));
  await phone.goto(origin); await expect(phone.locator('#world')).toHaveAttribute('data-ready', 'true');
  await phone.locator('#input-mode').selectOption('hp'); await phone.locator('#start').click();
  await phone.locator('#run-toggle').tap(); await expect(phone.locator('#run-toggle')).toHaveAttribute('aria-pressed', 'true');
  await phone.addStyleTag({content:'#toast{display:none!important}'}); await phone.waitForTimeout(400);
  await phone.screenshot({ path: path.join(output, 'hp-portrait-running.png') }); await hp.close();
  const metadata = { origin, browser: browser.version(), renderer: 'Chromium SwiftShader', viewport: [1280, 900], camera: 'near (8.5); yaw .25, then -PI/4 for an unobstructed wall view through manual controls', frames: frames.length, seconds: +(frames.at(-1).time - frames[0].time).toFixed(2), samples, errors, note: 'Real browser input and WebGL frames. Recording cadence is not a physical-device FPS benchmark.' };
  await writeFile(path.join(output, 'recording.json'), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata)); await context.close();
} finally { await browser.close(); }
