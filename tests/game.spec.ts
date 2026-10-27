import { test, expect, type Page } from '@playwright/test';

async function start(page: Page, mode = 'laptop') {
  await page.goto('/');
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.locator('#input-mode').selectOption(mode);
  await page.locator('#start').click();
}
async function go(page: Page, place: string, title: string) {
  if (await page.locator('#panel').isVisible()) await page.locator('#close-panel').click();
  await page.locator('#map').click();
  await page.locator(`[data-destination="${place}"]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title, { timeout: 30_000 });
  await expect(page.locator('#panel')).toBeVisible();
}
test('IFP one-pointer mission: measurements, experiment, correction, save/resume, backup', async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await start(page, 'ifp');
  await go(page, 'nara', 'Halo, penjelajah muda!');
  await page.locator('#accept-mission').click();
  await go(page, 'barrier', 'Uji jalur limpasan');
  await page.locator('#run-trial').click();
  await expect(page.locator('#trial-feedback')).toContainText('Belum siap');
  await go(page, 'warga', 'Air keruh setelah hujan');
  await page.locator('#record-hypothesis').click();
  await go(page, 'book', 'Ke mana air hujan mengalir?');
  await page.locator('#record-source').click();
  await go(page, 'rain', 'Catatan lapangan · setelah hujan');
  await page.locator('#record-source').click();
  await go(page, 'sampleA', 'Rancang pengamatanmu');
  await page.locator('[name=tool]').selectOption('thermometer');
  await page.locator('[name=variable]').selectOption('location');
  await page.locator('[name=control]').selectOption('rain');
  await page.locator('#plan-form button').click();
  await expect(page.locator('#plan-feedback')).toContainText('alat kekeruhan');
  await page.locator('[name=tool]').selectOption('turbidity');
  await page.locator('#plan-form button').click();
  await page.locator('#measure').click();
  await expect(page.locator('.instrument > strong')).toContainText('70');
  await go(page, 'sampleB', 'Sampel B · titik pembanding');
  await page.locator('#measure').click();
  await expect(page.locator('.instrument > strong')).toContainText('20');
  await go(page, 'barrier', 'Uji jalur limpasan');
  await page.locator('#run-trial').click();
  await expect(page.locator('.comparison')).toContainText('35');
  await go(page, 'nara', 'Apa yang didukung bukti?');
  await page.locator('[data-answer=drink]').click();
  await expect(page.locator('#conclusion-feedback')).toContainText('belum berarti aman diminum');
  await page.locator('[data-answer=sediment]').click();
  await expect(page.locator('.success-banner')).toContainText('100 XP');
  await page.locator('#close-panel').click();
  await expect(page.locator('#save-status')).toContainText('Tersimpan');
  await page.reload();
  await expect(page.locator('#start')).toContainText('Lanjutkan');
  await page.locator('#start').click();
  await page.locator('#journal').click();
  await expect(page.locator('#panel-content')).toContainText('Penyelidikan selesai');
  await expect(page.locator('#panel-content')).toContainText('Percobaan kesimpulan: 2');
  await expect(page.locator('table')).toContainText('35');
  await page.locator('#close-panel').click();
  await page.locator('#settings').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('jelajah-sains-cadangan-v15.json');
  const backup = await download.path();
  expect(backup).toBeTruthy();
  await page.locator('#import-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":999}') });
  await expect(page.locator('#settings-feedback')).toContainText('tidak didukung');
  await page.locator('#import-file').setInputFiles(backup!);
  await expect(page.locator('#settings-feedback')).toContainText('Cadangan valid dimuat');
  await page.screenshot({ path: 'test-results/m01-completed.png' });
  expect(errors).toEqual([]);
});

test('laptop: WASD, keyboard journal pauses movement, camera reset', async ({ page }) => {
  await start(page);
  const z = Number(await page.locator('#world').getAttribute('data-z'));
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await page.locator('#world').getAttribute('data-z')), { timeout: 5000 }).toBeLessThan(z - 1);
  await page.keyboard.up('w');
  await page.keyboard.press('j');
  await expect(page.locator('#panel-title')).toHaveText('Jurnal Sains');
  const paused = await page.locator('#world').getAttribute('data-z');
  await page.keyboard.down('w'); await page.waitForTimeout(250); await page.keyboard.up('w');
  expect(await page.locator('#world').getAttribute('data-z')).toBe(paused);
  await page.keyboard.press('Escape'); await expect(page.locator('#panel')).not.toBeVisible();
  await page.keyboard.press('r');
  await page.screenshot({ path: 'test-results/laptop-town.png' });
});

test('HP: simultaneous analog and camera, pointer cancel stops movement, portrait layout', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await start(page, 'hp');
  const cdp = await context.newCDPSession(page);
  const rect = await page.locator('#joystick').boundingBox(); expect(rect).toBeTruthy();
  const x = rect!.x + rect!.width / 2, y = rect!.y + rect!.height / 2;
  const initial = Number(await page.locator('#world').getAttribute('data-z'));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y: y - 32 }] });
  await page.waitForTimeout(350);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y: y - 32 }, { id: 2, x: 320, y: 400 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x, y: y - 32 }, { id: 2, x: 270, y: 420 }] });
  await page.waitForTimeout(350);
  expect(Number(await page.locator('#world').getAttribute('data-z'))).toBeLessThan(initial - 0.8);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await page.waitForTimeout(100);
  const stopped = await page.locator('#world').getAttribute('data-z');
  await page.waitForTimeout(250);
  expect(await page.locator('#world').getAttribute('data-z')).toBe(stopped);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/hp-portrait.png' });
  await context.close();
});

test('WebGL unavailable: accessible material fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).includes('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'WebGL 2 belum tersedia.' })).toBeVisible();
  await expect(page.locator('.fallback')).toContainText('Kekeruhan saja tidak mengungkap');
});
