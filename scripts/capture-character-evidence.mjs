import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Run against the current dev server. These are real WebGL frames, not mock renders.
const origin = process.env.EVIDENCE_ORIGIN || 'http://127.0.0.1:5173';
const output = path.resolve('docs/evidence');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const positions = {};
async function enter(page, mode = 'laptop') {
  await page.goto(origin);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.locator('#input-mode').selectOption(mode); await page.locator('#start').click();
  await page.addStyleTag({ content: '#toast { display: none !important; }' });
  await page.waitForTimeout(700);
}
async function shot(page, name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(output, `${name}.png`) });
  positions[name] = await page.locator('#world').evaluate(c => ({ x: c.dataset.x, z: c.dataset.z, camera: c.dataset.cameraDistance, yaw: c.dataset.cameraYaw, viewport: [innerWidth, innerHeight] }));
}
async function camera(page, distance) {
  await page.locator('#settings').click(); await page.locator('#camera-distance').selectOption(distance);
  await page.locator('#close-panel').click(); await page.waitForTimeout(700);
}
async function go(page, id, title) {
  await page.locator('#map').click(); await page.locator(`[data-destination=${id}]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title, { timeout: 30_000 });
}
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await enter(page); await shot(page, 'after-laptop');
  await camera(page, 'near'); await shot(page, 'after-player-close');
  await camera(page, 'normal');
  await go(page, 'nara', 'Halo, penjelajah muda!');
  await page.locator('#close-panel').click(); await shot(page, 'after-nara');
  await camera(page, 'near');
  await page.mouse.move(980, 580); await page.mouse.down(); await page.mouse.move(1120, 580); await page.mouse.up();
  await shot(page, 'after-nara-close');
  await page.locator('#interact').click(); await shot(page, 'after-greeting');
  await page.locator('#accept-mission').click();
  await camera(page, 'normal'); await page.locator('#camera-reset').click();
  await go(page, 'warga', 'Air keruh setelah hujan');
  await page.locator('#close-panel').click(); await shot(page, 'after-wira');
  await camera(page, 'near');
  await page.mouse.move(980, 580); await page.mouse.down(); await page.mouse.move(1120, 580); await page.mouse.up();
  await shot(page, 'after-wira-close');
  await page.locator('#settings').click(); await page.locator('#home').click(); await page.waitForTimeout(700);
  await page.locator('#journal').click(); await shot(page, 'after-reading');
  await context.close();
  for (const [name, width, height, mode] of [['hp-portrait', 390, 844, 'hp'], ['hp-landscape', 844, 390, 'hp'], ['ifp', 1280, 900, 'ifp']]) {
    const c = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: mode === 'hp' });
    const p = await c.newPage(); await enter(p, mode); await shot(p, `after-${name}`);
    const rects = await p.evaluate(() => ['#joystick', '.dock', '#interact', '.mission-card'].map(selector => {
      const r = document.querySelector(selector).getBoundingClientRect(); return { selector, x: r.x, y: r.y, width: r.width, height: r.height };
    }));
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      if (Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x) && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y)) throw new Error(`Kontrol bertumpuk pada ${name}: ${a.selector} / ${b.selector}`);
    }
    await c.close();
  }
  await writeFile(path.join(output, 'capture-positions.json'), JSON.stringify(positions, null, 2));

  // CDP screencast + system ffmpeg avoids downloading a second browser/video runtime.
  const c = await browser.newContext({ viewport: { width: 960, height: 675 } });
  const p = await c.newPage(); await enter(p); await camera(p, 'near');
  const renderStats = await p.locator('#world').evaluate(canvas => ({drawCalls: Number(canvas.dataset.drawCalls), triangles: Number(canvas.dataset.triangles)}));
  const cdp = await c.newCDPSession(p), frameDir = await mkdtemp(path.join(tmpdir(), 'jelajah-motion-'));
  const frames = [], pending = [];
  cdp.on('Page.screencastFrame', data => {
    const file = path.join(frameDir, `${String(frames.length).padStart(6, '0')}.jpg`);
    frames.push({ file, time: data.metadata.timestamp });
    pending.push(writeFile(file, Buffer.from(data.data, 'base64')));
    void cdp.send('Page.screencastFrameAck', { sessionId: data.sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: 960, maxHeight: 675, everyNthFrame: 1 });
  async function caption(text) {
    await p.evaluate(text => {
      let el = document.getElementById('recording-caption');
      if (!el) { el = document.createElement('div'); el.id = 'recording-caption'; el.style.cssText = 'position:fixed;top:84px;left:50%;transform:translateX(-50%);padding:10px 18px;border-radius:12px;background:#fffbed;color:#23463d;z-index:30;font:14px sans-serif;pointer-events:none'; document.body.append(el); }
      el.textContent = text;
    }, text);
  }
  await caption('Diam · napas halus & pose santai'); await p.waitForTimeout(1600);
  await caption('Berjalan · langkah mengikuti perpindahan'); await p.keyboard.down('w'); await p.waitForTimeout(850); await p.keyboard.up('w');
  await caption('Berbelok · interpolasi putaran terpendek'); await p.keyboard.down('d'); await p.waitForTimeout(650); await p.keyboard.up('d');
  await p.keyboard.down('s'); await p.waitForTimeout(600); await p.keyboard.up('s');
  await caption('Berhenti · kembali ke pose diam'); await p.waitForTimeout(1000);
  await caption('Menyapa · kepala dan gestur NPC merespons pemain'); await go(p, 'nara', 'Halo, penjelajah muda!'); await p.waitForTimeout(1800);
  await p.locator('#accept-mission').click();
  await p.locator('#settings').click(); await p.locator('#home').click(); await p.waitForTimeout(500);
  await caption('Membaca · buku di titik pemasangan tangan'); await p.locator('#journal').click(); await p.waitForTimeout(1800);
  await cdp.send('Page.stopScreencast'); await Promise.all(pending); await c.close();
  if (frames.length < 10) throw new Error('Rekaman tidak memiliki cukup frame.');
  const concat = frames.map((f, i) => `file '${f.file}'\nduration ${i + 1 < frames.length ? Math.max(.01, frames[i + 1].time - f.time) : .1}\n`).join('');
  await writeFile(path.join(frameDir, 'frames.txt'), concat);
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(frameDir, 'frames.txt'), '-vf', 'fps=20,scale=960:-2', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-an', '-y', path.join(output, 'character-motion.webm')], { timeout: 60_000 });
  const metadata = { screenshots: Object.keys(positions).length, videoFrames: frames.length, recordedSeconds: +(frames.at(-1).time - frames[0].time).toFixed(2), browser: browser.version(), renderer: 'Chromium SwiftShader (software rendering)', renderStats, note: 'Capture cadence is not a physical-device FPS benchmark.' };
  await writeFile(path.join(output, 'capture-metadata.json'), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
} finally { await browser.close(); }
