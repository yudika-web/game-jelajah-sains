import { expect, test, type Page } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const evidence = 'docs/evidence/greenhouse';
const capture = !!process.env.CAPTURE_GREENHOUSE;
const packageOrigin = process.env.GREENHOUSE_ORIGIN;
const old = JSON.parse(readFileSync('tests/fixtures/coin-wallet-stage7.json', 'utf8'));
const station = {
  sari: 'Bu Sari · Rumah Semai Terlalu Panas', heatBook: 'Buku suhu dan kalor', heatNotes: 'Catatan kebutuhan rumah semai',
  heatMeter: 'Termometer digital', heatInside: 'Sensor dalam rumah semai', heatOutside: 'Sensor luar rumah semai',
  heatShade: 'Rak modul peneduh', heatVent: 'Engsel dan pengunci ventilasi',
};
type Station = keyof typeof station;
const click = (page: Page, id: string) => page.locator('#' + id).click();
const world = (page: Page) => page.locator('#world');

async function go(page: Page, id: Station) {
  const previous = await world(page).getAttribute('data-x') + ',' + await world(page).getAttribute('data-z');
  if (await page.locator('#panel').isVisible()) await click(page, 'close-panel');
  await click(page, 'map');
  await page.locator(`[data-destination="${id}"]`).click();
  await expect(page.locator('#panel-title')).toHaveText(station[id], { timeout: 30_000 });
  const current = await world(page).getAttribute('data-x') + ',' + await world(page).getAttribute('data-z');
  expect(current).not.toBe(previous);
}

async function boot(page: Page, mode: string) {
  await page.goto(packageOrigin ?? '/');
  await page.locator('#input-mode').selectOption(mode);
  await page.locator('#start:not([disabled])').click();
  await expect(world(page)).toHaveAttribute('data-ready', 'true');
}

async function loadOld(page: Page, fixture = old) {
  await click(page, 'settings');
  await page.locator('#import-file').setInputFiles({
    name: 'cadangan-lama.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
  });
  const confirm = page.locator('#confirm-profile-restore');
  const feedback = page.locator('#settings-feedback');
  await confirm.or(feedback.filter({ hasText: 'Cadangan valid' })).first().waitFor({ timeout: 10_000 });
  if (await confirm.isVisible()) await confirm.click();
  await expect(page.locator('#settings-feedback')).toContainText('Cadangan valid', { timeout: 10_000 });
  await click(page, 'close-panel');
}

async function saved(page: Page) {
  await expect(page.locator('body:not([data-save-state=pending]):not([data-save-state=failed])')).toHaveCount(1);
  return page.evaluate(() => new Promise<Record<string, any>>((resolve, reject) => {
    const request = indexedDB.open('jelajah-sains', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('saves');
      const store = transaction.objectStore('saves');
      const found: Record<string, unknown> = {};
      for (const key of ['M03', 'M14', 'M02', 'economy', 'appearance'])
        store.get(key).onsuccess = e => { found[key] = (e.target as IDBRequest).result; };
      transaction.oncomplete = () => { db.close(); resolve(found); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
  }));
}

async function shot(page: Page, name: string) {
  if (!capture) return;
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/${name}.jpg`, type: 'jpeg', quality: 83 });
}

async function startFilm(page: Page) {
  if (!capture) return async () => {};
  const folder = mkdtempSync(join(tmpdir(), 'm03-frames-'));
  const cdp = await page.context().newCDPSession(page);
  const frames: { file: string; time: number }[] = [];
  cdp.on('Page.screencastFrame', frame => {
    void cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
    const time = frame.metadata.timestamp ?? 0;
    if (time - (frames.at(-1)?.time ?? 0) < .095) return;
    const file = join(folder, `${frames.length}.jpg`);
    writeFileSync(file, Buffer.from(frame.data, 'base64'));
    frames.push({ file, time });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: 960, maxHeight: 640 });
  return async (keep = true) => {
    try {
      await cdp.send('Page.stopScreencast').catch(() => {});
      await cdp.detach().catch(() => {});
      if (!keep) return;
      const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.min(2, (frames[i + 1]?.time ?? f.time + 1) - f.time)}`).join('\n');
      writeFileSync(join(folder, 'frames.txt'), list + '\n');
      mkdirSync(evidence, { recursive: true });
      const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(folder, 'frames.txt'),
        '-vf', 'setpts=0.38*PTS,fps=12,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libvpx-vp9', '-crf', '39', '-b:v', '0',
        '-deadline', 'realtime', '-cpu-used', '6', `${evidence}/m03-bermain.webm`], { encoding: 'utf8' });
      expect(r.status, r.stderr).toBe(0);
    } finally { rmSync(folder, { recursive: true, force: true }); }
  };
}

async function predict(page: Page, choice: string) {
  await page.locator('#heat-prediction').selectOption(choice);
  await click(page, 'heat-predict');
}

async function finish(page: Page, value: string, correction?: string) {
  for (let i = 0; i < 5; i++) await click(page, 'heat-step');
  await expect(page.locator('#heat-reading')).toHaveText(value);
  await click(page, 'heat-observe');
  if (correction) await page.locator('#heat-correction').selectOption(correction);
  await click(page, 'heat-record');
  await expect(page.locator('#heat-record')).toBeDisabled();
  await click(page, 'heat-prepare');
}

test('M03 full route, fair comparisons, reload, atomic reward, legacy import and reset', async ({ page, context }) => {
  test.setTimeout(360_000);
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  if (packageOrigin) await context.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(packageOrigin + '/') || url.startsWith('blob:') || url.startsWith('data:')) return route.continue();
    external.push(url);
    return route.abort();
  });
  await page.setViewportSize({ width: 1440, height: 960 });
  await boot(page, 'laptop');
  await loadOld(page, { ...old, world: { region: 'town', activeMission: 'M01' } });
  const before = await saved(page);
  const beforeCoins = before.economy.balance;
  await page.locator('#active-mission').selectOption('M03');
  await page.locator('[data-guide=gardenGate]').first().click();
  await expect(page.locator('#enter-region')).toBeVisible({ timeout: 30_000 });
  await click(page, 'enter-region');
  await expect(world(page)).toHaveAttribute('data-region', 'garden');
  await expect(page.locator('#active-mission')).toHaveValue('M03');
  const stopFilm = await startFilm(page);
  let completed = false;
  try {
    await go(page, 'sari');
    await shot(page, '01-tugas');
    await click(page, 'heat-accept');
    await go(page, 'heatBook'); await click(page, 'heat-read');
    await go(page, 'heatNotes'); await click(page, 'heat-read');
    await go(page, 'heatMeter');
    await expect(world(page)).toHaveAttribute('data-heat-meter', 'on-stand');
    await shot(page, '02a-termometer-di-meja');
    await click(page, 'heat-borrow');
    await expect(world(page)).toHaveAttribute('data-pose', 'measure');
    await shot(page, '02-termometer');
    await click(page, 'heat-check');
    await expect(page.locator('#heat-reading')).toHaveText('30,0 °C');
    await go(page, 'heatOutside'); await click(page, 'heat-baseline');
    await expect(page.locator('#heat-reading')).toHaveText('30,0 °C');
    await go(page, 'heatInside'); await click(page, 'heat-baseline');

    await predict(page, 'same');
    await click(page, 'heat-run');
    await expect.poll(async () => parseInt(await page.locator('#heat-clock').textContent() ?? '')).toBeGreaterThan(0);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.locator('#heat-pause')).toBeDisabled();
    const paused = await page.locator('#heat-clock').textContent();
    await page.waitForTimeout(300);
    await expect(page.locator('#heat-clock')).toHaveText(paused!);
    await click(page, 'heat-prepare');
    await expect(page.locator('#heat-clock')).toContainText('0 / 600');
    await predict(page, 'same');
    await finish(page, '55,9 °C', 'more');

    await go(page, 'heatShade'); await click(page, 'heat-shade');
    await expect(world(page)).toHaveAttribute('data-heat-shade', 'true');
    await shot(page, '03-peneduh');
    await go(page, 'heatInside'); await predict(page, 'less');
    await finish(page, '43,0 °C');
    await go(page, 'heatShade'); await click(page, 'heat-shade');
    await go(page, 'heatVent'); await expect(page.locator('#heat-vent')).toBeDisabled();
    await click(page, 'heat-latch'); await click(page, 'heat-vent');
    await expect(world(page)).toHaveAttribute('data-heat-vent', 'true');
    await expect.poll(async () => Number(await world(page).getAttribute('data-heat-flap-angle'))).toBeLessThan(-1.15);
    await shot(page, '04-ventilasi');
    await go(page, 'heatInside'); await predict(page, 'less');
    await finish(page, '40,0 °C');

    await go(page, 'heatShade'); await click(page, 'heat-shade');
    await go(page, 'heatInside'); await predict(page, 'less'); await click(page, 'heat-step');
    // Reload during D retains only A/B/C and safely closes and locks the hardware.
    await page.reload(); await page.locator('#start:not([disabled])').click();
    await expect(world(page)).toHaveAttribute('data-heat-vent', 'false');
    await expect(world(page)).toHaveAttribute('data-heat-unlocked', 'false');
    await expect(world(page)).toHaveAttribute('data-heat-shade', 'false');
    expect((await saved(page)).M03.records.map((r: {key: string}) => r.key)).toEqual(['A', 'B', 'C']);

    await go(page, 'heatShade'); await click(page, 'heat-shade');
    await go(page, 'heatVent'); await click(page, 'heat-latch'); await click(page, 'heat-vent');
    await go(page, 'heatInside'); await predict(page, 'less');
    for (let i = 0; i < 5; i++) await click(page, 'heat-step');
    await click(page, 'heat-observe');
    await expect(page.locator('#heat-reading')).toHaveText('35,0 °C');
    await expect(world(page)).toHaveAttribute('data-heat-inside-reading', '35,0 °C');
    await shot(page, '05-pengukuran');
    await click(page, 'heat-record');
    await click(page, 'close-panel'); await click(page, 'journal');
    const chart = page.locator('.heat-chart');
    await expect(chart.locator('meter')).toHaveCount(4);
    await expect(page.locator('.heat-table tr')).toHaveCount(7);
    await shot(page, '06-grafik');
    await go(page, 'sari');
    await page.locator('#heat-report [name=comparison]').selectOption('one-factor');
    await page.locator('#heat-report [name=solution]').selectOption('combined');
    await page.locator('#heat-report textarea').fill('Peneduh dan ventilasi membantu pada kondisi latihan ini.');
    await page.locator('#heat-report button').click();
    await expect(page.locator('.success-banner')).toContainText('M03 selesai');
    await expect(page.locator('#coin-balance')).toHaveText(String(beforeCoins + 100));
    await shot(page, '07-kesimpulan');
    completed = true;
  } finally { await stopFilm(completed); }
  const first = await saved(page);
  expect(first.M14).toEqual(before.M14);
  expect(first.M02).toEqual(before.M02);
  expect(first.M03.records[0]).toEqual({ key: 'A', prediction: 'same', correction: 'more' });
  expect(first.economy.ledger.filter((r: {missionId: string}) => r.missionId === 'M03')).toHaveLength(1);

  await click(page, 'close-panel');
  await click(page, 'settings');
  const download = page.waitForEvent('download');
  await click(page, 'export');
  const file = await download;
  expect(file.suggestedFilename()).toContain('v22');
  const currentBackup = JSON.parse(readFileSync((await file.path())!, 'utf8'));
  expect(currentBackup.missions.M03).toEqual(first.M03);
  expect(currentBackup.economy).toEqual(first.economy);
  await click(page, 'close-panel');
  await loadOld(page, { ...old, world: { region: 'garden', activeMission: 'M03' } });
  expect((await saved(page)).M03).toEqual(first.M03);
  await click(page, 'settings'); await click(page, 'reset-greenhouse'); await click(page, 'confirm-greenhouse-reset');
  const reset = await saved(page);
  expect(reset.M03).toMatchObject({ accepted: false, completed: false, reward: 100, records: [] });
  expect(reset.M14).toEqual(before.M14);
  expect(reset.appearance).toEqual(first.appearance);
  expect(reset.economy).toEqual(first.economy);
  await page.reload(); await page.locator('#start:not([disabled])').click();
  await expect(page.locator('#coin-balance')).toHaveText(String(beforeCoins + 100));
  await loadOld(page, currentBackup);
  const restored = await saved(page);
  expect(restored.M03).toEqual(first.M03);
  expect(restored.economy).toEqual(first.economy);
  await click(page, 'journal');
  await expect(page.locator('#heat-saved-reflection')).toHaveText('Peneduh dan ventilasi membantu pada kondisi latihan ini.');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

for (const [mode, width, height] of [['hp', 390, 844], ['hp', 844, 390], ['ifp', 1920, 1080]] as const) {
  test(`M03 controls and navigation with reduced motion · ${mode} ${width}×${height}`, async ({ browser }) => {
    test.setTimeout(95_000);
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: mode === 'hp', isMobile: mode === 'hp' });
    const page = await context.newPage();
    await boot(page, mode);
    await loadOld(page, { ...old, world: { region: 'garden', activeMission: 'M03' } });
    await click(page, 'settings');
    await page.locator('#reduced-motion').check();
    await click(page, 'close-panel');
    await go(page, 'sari'); await click(page, 'heat-accept');
    await go(page, 'heatMeter');
    if (mode === 'hp') await page.locator('#heat-borrow').tap();
    else await click(page, 'heat-borrow');
    await click(page, 'heat-check');
    await go(page, 'heatOutside'); await click(page, 'heat-baseline');
    await expect(page.locator('#heat-reading')).toHaveText('30,0 °C');
    await shot(page, `${mode}-${width}`);
    expect(await page.locator('#panel').evaluate(el => el.scrollWidth <= el.clientWidth + 2)).toBe(true);
    await context.close();
  });
}
