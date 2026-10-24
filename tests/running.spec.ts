import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const evidence = process.env.CAPTURE_RUNNING_EVIDENCE === '1' ? 'docs/evidence/running' : 'test-results/running';
mkdirSync(evidence, { recursive: true });
async function start(page: Page, mode = 'laptop') {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.locator('#input-mode').selectOption(mode); await page.locator('#start').click();
}
async function position(page: Page) { return page.locator('#world').evaluate(c => ({ x: Number(c.dataset.x), z: Number(c.dataset.z) })); }
async function stationary(page: Page) {
  await page.waitForTimeout(180); const p = await position(page); await page.waitForTimeout(200); expect(await position(page)).toEqual(p);
}
async function sampleTravel(page: Page) {
  return page.evaluate(() => new Promise<number>(resolve => {
    const canvas = document.querySelector<HTMLCanvasElement>('#world')!;
    requestAnimationFrame(start => {
      const x = Number(canvas.dataset.x), z = Number(canvas.dataset.z);
      function measure(time: number) {
        if (time - start < 500) { requestAnimationFrame(measure); return; }
        resolve(Math.hypot(Number(canvas.dataset.x) - x, Number(canvas.dataset.z) - z) / ((time - start) / 1000));
      }
      requestAnimationFrame(measure);
    });
  }));
}
async function home(page: Page) { await page.locator('#settings').click(); await page.locator('#home').click(); }
async function go(page: Page, id: string, title: string) {
  await page.locator('#map').click(); await page.locator(`[data-destination=${id}]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title, { timeout: 30_000 });
}
test('keyboard: actual running distance, both Shift keys, release to walk, diagonal normalization', async ({ page }) => {
  await start(page); const canvas = page.locator('#world');
  for (const shift of ['ShiftLeft', 'ShiftRight']) {
    await page.keyboard.down(shift); await stationary(page); // Shift alone never moves
    await expect(canvas).toHaveAttribute('data-run-mode', 'run');
    await page.keyboard.down('w');
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(7.7);
    await expect(canvas).toHaveAttribute('data-locomotion', 'run');
    const runRate = await sampleTravel(page);
    await page.keyboard.up(shift);
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(5);
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeLessThan(5.4);
    await expect(canvas).toHaveAttribute('data-locomotion', 'walk');
    const walkRate = await sampleTravel(page);
    expect(runRate).toBeGreaterThan(walkRate * 1.3);
    await page.keyboard.up('w'); await stationary(page); await home(page);
  }
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('w'); await page.keyboard.down('d');
  await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(7.7);
  expect(Number(await canvas.getAttribute('data-speed'))).toBeLessThan(8.1);
  await page.keyboard.up('w'); await page.keyboard.up('d'); await page.keyboard.up('ShiftLeft');
  await stationary(page);
});
test('panels, editable fields, blur, hidden tab and mode switch clear run and require fresh input', async ({ page }) => {
  await start(page); const canvas = page.locator('#world');
  await page.keyboard.down('w'); await page.keyboard.down('ShiftRight'); await page.waitForTimeout(200);
  await page.keyboard.press('j'); await expect(page.locator('#panel-title')).toHaveText('Jurnal Sains');
  await expect(canvas).toHaveAttribute('data-run-mode', 'walk'); await stationary(page);
  await page.locator('#close-panel').click();
  await page.keyboard.down('w'); await page.keyboard.down('ShiftRight'); // repeated held-key events
  await stationary(page); await expect(canvas).toHaveAttribute('data-run-mode', 'walk');
  await page.keyboard.up('w'); await page.keyboard.up('ShiftRight');
  for (const loss of ['blur', 'hidden']) {
    await page.keyboard.down('w'); await page.keyboard.down('ShiftLeft'); await page.waitForTimeout(180);
    await page.evaluate(loss => {
      if (loss === 'blur') window.dispatchEvent(new Event('blur'));
      else { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); }
    }, loss);
    await expect(canvas).toHaveAttribute('data-run-mode', 'walk'); await stationary(page);
    await page.keyboard.up('w'); await page.keyboard.up('ShiftLeft');
    await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; });
  }
  for (const html of ['<input id="typing">', '<textarea id="typing"></textarea>', '<div id="typing" contenteditable="true"><span id="editable-child">Catatan</span></div>']) {
    await page.evaluate(html => { const host = document.createElement('div'); host.id = 'typing-host'; host.style.cssText = 'position:fixed;top:400px;left:600px;z-index:100'; host.innerHTML = html; document.body.append(host); }, html);
    await page.locator('#typing').focus(); await page.keyboard.type('wasdWASD'); await stationary(page);
    await expect(canvas).toHaveAttribute('data-run-mode', 'walk'); await page.locator('#typing-host').evaluate(el => el.remove());
  }
  await page.locator('#settings').click(); await page.locator('#settings-mode').selectOption('ifp'); await page.locator('#close-panel').click();
  await page.locator('#run-toggle').click(); await expect(canvas).toHaveAttribute('data-run-mode', 'run');
  await page.locator('#settings').click(); await page.locator('#settings-mode').selectOption('hp'); await page.locator('#close-panel').click();
  await expect(page.locator('#run-toggle')).toHaveAttribute('aria-pressed', 'false'); await stationary(page);
});
test('IFP runs a map route exactly, cancels by stop/manual input, and resets on region travel', async ({ page }) => {
  test.setTimeout(100_000); await start(page, 'ifp'); const canvas = page.locator('#world');
  await page.locator('#run-toggle').click(); await stationary(page);
  await page.locator('#map').click(); await page.locator('[data-destination=nara]').click();
  await expect(canvas).toHaveAttribute('data-run-mode', 'run');
  await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(6);
  await expect(page.locator('#panel-title')).toHaveText('Halo, penjelajah muda!', { timeout: 15_000 });
  const p = await position(page); expect(p.x).toBe(-4); expect(p.z).toBeCloseTo(4.4, 2);
  await stationary(page); await expect(canvas).toHaveAttribute('data-run-mode', 'walk');
  await expect.poll(async () => Math.cos(Number(await canvas.getAttribute('data-facing')))).toBeLessThan(-.98);
  await page.locator('#accept-mission').click();
  await page.locator('#run-toggle').click();
  await page.locator('#map').click(); await page.locator('[data-destination=sampleA]').click();
  await expect(canvas).toHaveAttribute('data-moving', 'true'); await page.locator('#stop-walk').click();
  await expect(canvas).toHaveAttribute('data-moving', 'false'); await stationary(page);
  await page.locator('#map').click(); await page.locator('[data-destination=sampleB]').click();
  await expect(canvas).toHaveAttribute('data-moving', 'true'); await page.keyboard.press('d'); // even a pulse entirely between render frames cancels the route
  await expect(canvas).toHaveAttribute('data-moving', 'false', { timeout: 1500 });
  await expect(page.locator('#panel')).not.toBeVisible(); await stationary(page);
  for (const [gate, title, region] of [['gardenGate', 'Gerbang menuju Kebun Kehidupan', 'garden'], ['townGate', 'Gerbang menuju Kota Sains', 'town']] as const) {
    await page.locator('#run-toggle').click(); await go(page, gate, title);
    await page.locator('#enter-region').click(); await expect(canvas).toHaveAttribute('data-region', region);
    await expect(page.locator('#run-toggle')).toHaveAttribute('aria-pressed', 'false'); await stationary(page);
    await expect(canvas).toHaveAttribute('data-player-height', '1.600');
    await page.keyboard.down('s'); await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(5);
    expect(Number(await canvas.getAttribute('data-speed'))).toBeLessThan(5.4); await page.keyboard.up('s');
  }
  await expect(page.locator('#progress-text')).toContainText('1 dari 6');
  await page.addStyleTag({ content: '#toast{display:none!important}' }); await page.screenshot({ path: `${evidence}/ifp-toggle.png` });
});
test('running into the school wall cannot tunnel or keep the gait moving', async ({ page }) => {
  await start(page); await go(page, 'nara', 'Halo, penjelajah muda!'); await page.locator('#accept-mission').click(); await go(page, 'book', 'Ke mana air hujan mengalir?'); await page.locator('#close-panel').click();
  await page.mouse.move(900, 600); await page.mouse.down(); await page.mouse.move(900 + .25 / .006, 600); await page.mouse.up();
  const canvas = page.locator('#world'); await page.keyboard.down('ShiftLeft'); await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-z')), { timeout: 10_000 }).toBeLessThan(-5.5);
  await page.waitForTimeout(500); const p = await position(page), stride = await canvas.getAttribute('data-stride');
  await stationary(page); expect((await position(page)).z).toBeGreaterThanOrEqual(-5.55);
  expect(await canvas.getAttribute('data-stride')).toBe(stride); await expect(canvas).toHaveAttribute('data-locomotion', 'idle');
  expect(p.z).toBeLessThan(-5.5); await page.keyboard.up('w'); await page.keyboard.up('ShiftLeft');
});
test('HP toggle, proportional analog and a second camera finger work in portrait and landscape', async ({ browser }) => {
  test.setTimeout(90_000);
  for (const [name, width, height] of [['portrait', 390, 844], ['landscape', 844, 390]] as const) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
    const page = await context.newPage(); await start(page, 'hp');
    const canvas = page.locator('#world'), toggle = page.locator('#run-toggle');
    await toggle.tap(); await expect(toggle).toHaveAttribute('aria-pressed', 'true'); await stationary(page);
    const cdp = await context.newCDPSession(page), rect = (await page.locator('#joystick').boundingBox())!;
    const stick = { id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 - rect.width * .32 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [stick] });
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(7.7);
    const yaw = Number(await canvas.getAttribute('data-camera-yaw'));
    const camera = { id: 2, x: width - 70, y: Math.round(height * .55) };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [stick, camera] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [stick, { ...camera, x: camera.x - 40 }] });
    await expect.poll(async () => Number(await canvas.getAttribute('data-camera-yaw'))).toBeGreaterThan(yaw + .1);
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(7.7);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await stationary(page);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true'); // pointer release stops motion, not the selected mode
    await toggle.tap(); await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const half = { ...stick, y: rect.y + rect.height / 2 - rect.width * .32 * .53 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [half] });
    await expect.poll(async () => Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(2.4);
    expect(Number(await canvas.getAttribute('data-speed'))).toBeLessThan(2.8);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await stationary(page);
    const rects = await page.evaluate(() => ['#run-toggle', '#joystick', '.dock', '#interact', '.mission-card'].map(selector => {
      const r = document.querySelector(selector)!.getBoundingClientRect(); return { selector, x: r.x, y: r.y, w: r.width, h: r.height };
    }));
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j]; expect(Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) && Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y), `${name}: ${a.selector}/${b.selector}`).toBe(false);
    }
    await page.addStyleTag({ content: '#toast{display:none!important}' }); await page.screenshot({ path: `${evidence}/hp-${name}-toggle.png` });
    await context.close();
  }
});
