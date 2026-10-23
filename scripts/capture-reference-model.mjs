import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.EVIDENCE_ORIGIN || 'http://127.0.0.1:5173';
const output = 'docs/evidence/reference-model';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [], captures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${origin}/character.html`);
  await expect(page.locator('#model-canvas')).toHaveAttribute('data-ready', 'true', { timeout: 15_000 });
  for (const kind of ['explorer', 'nara', 'wira']) {
    await page.locator('#gallery-character').selectOption(kind);
    await page.screenshot({ path: `${output}/${kind}-three-views.png` });
    await page.locator('#gallery-detail').click();
    await page.screenshot({ path: `${output}/${kind}-face.png` });
    await page.locator('#gallery-detail').click();
    captures.push({ character: kind, views: ['front', 'side', 'back'], animated: false, viewport: [1440,1000] });
  }
  await page.goto(origin); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true', { timeout: 15_000 });
  await page.locator('#start').click(); await page.addStyleTag({content:'#toast{display:none!important}'});
  await page.waitForTimeout(700); await page.screenshot({path:`${output}/in-game-laptop.png`});
  const renderStats = await page.locator('#world').evaluate(c => ({drawCalls:Number(c.dataset.drawCalls), triangles:Number(c.dataset.triangles)}));
  for (const [name,width,height] of [['portrait',390,844],['landscape',844,390]]) {
    const c = await browser.newContext({ viewport:{width,height}, hasTouch:true, isMobile:true });
    const p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
    await p.goto(origin); await expect(p.locator('#world')).toHaveAttribute('data-ready','true', { timeout: 15_000 });
    await p.locator('#input-mode').selectOption('hp'); await p.locator('#start').click();
    await p.addStyleTag({content:'#toast{display:none!important}'}); await p.waitForTimeout(700);
    await p.screenshot({path:`${output}/in-game-hp-${name}.png`});
    await p.goto(`${origin}/character.html`); await expect(p.locator('#model-canvas')).toHaveAttribute('data-ready','true', { timeout: 15_000 });
    await p.screenshot({path:`${output}/gallery-hp-${name}.png`});
    expect(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await c.close();
  }
  await writeFile(`${output}/capture-metadata.json`, JSON.stringify({ renderer:'Chromium SwiftShader', browser:browser.version(), sourceFactory:'createCharacter', cameras:'orthographic, fixed front/side/back', captures, renderStats, errors, note:'Model review is static; animation and gameplay use the existing rig. These are not physical-device FPS measurements.' }, null, 2));
  expect(errors).toEqual([]);
  console.log(JSON.stringify({captures:captures.length, errors, renderStats}));
} finally { await browser.close(); }
