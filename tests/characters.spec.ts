import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ viewport: { width: 1280, height: 900 } });
async function enter(page: Page) {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.locator('#start').click();
}
async function installOldSave(page: Page) {
  const oldSave = JSON.parse(readFileSync(new URL('./fixtures/m01-v1.json', import.meta.url), 'utf8'));
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async save => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('jelajah-sains', 1);
      request.onsuccess = () => {
        const db = request.result, tx = db.transaction('saves', 'readwrite');
        tx.objectStore('saves').put(save, 'M01');
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  }, oldSave);
  await page.reload(); await expect(page.locator('#start')).toContainText('Lanjutkan');
  await page.locator('#start').click();
}
async function go(page: Page, id: string, title: string) {
  if (await page.locator('#panel').isVisible()) await page.locator('#close-panel').click();
  await page.locator('#map').click(); await page.locator(`[data-destination=${id}]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title, { timeout: 30_000 });
}

test('NPC label raycast starts a real approach, greeting and relaxed recovery', async ({ page }) => {
  await enter(page);
  // Click the actual projected label: model height may change without changing the mission ID.
  await expect(page.locator('#world')).toHaveAttribute('data-nara-label-x', /\d/);
  const x = Number(await page.locator('#world').getAttribute('data-nara-label-x'));
  const y = Number(await page.locator('#world').getAttribute('data-nara-label-y'));
  await page.locator('#world').click({ position: { x, y } });
  await expect(page.locator('#accept-mission')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#world')).toHaveAttribute('data-pose', 'greet');
  const z = await page.locator('#world').getAttribute('data-z');
  await page.keyboard.down('w'); await page.waitForTimeout(200); await page.keyboard.up('w');
  expect(await page.locator('#world').getAttribute('data-z')).toBe(z);
  await page.locator('#close-panel').click();
  await expect(page.locator('#world')).toHaveAttribute('data-pose', 'none');
  await page.locator('#mission-details').click();
  await expect(page.locator('[data-guide=barrier]')).toBeVisible();
});

test('old M01 save resumes, camera preferences survive separately, mission can finish', async ({ page }) => {
  test.setTimeout(90_000);
  await installOldSave(page);
  await page.locator('#settings').click();
  await page.locator('#camera-distance').selectOption('near');
  await page.locator('#reduced-motion').check();
  await page.locator('#close-panel').click();
  await expect(page.locator('#world')).toHaveAttribute('data-camera-distance', 'near');
  await expect(page.locator('#world')).toHaveAttribute('data-reduced-motion', 'true');
  await page.reload(); await expect(page.locator('#start')).toContainText('Lanjutkan'); await page.locator('#start').click();
  await expect(page.locator('#world')).toHaveAttribute('data-camera-distance', 'near');
  await expect(page.locator('#world')).toHaveAttribute('data-reduced-motion', 'true');
  await page.locator('#journal').click();
  await expect(page.locator('table')).toContainText('70'); await expect(page.locator('table')).toContainText('20');
  await expect(page.locator('#world')).toHaveAttribute('data-pose', 'read');
  await go(page, 'barrier', 'Uji jalur limpasan');
  await expect(page.locator('#world')).toHaveAttribute('data-pose', 'measure');
  await page.locator('#run-trial').click();
  await expect(page.locator('.comparison')).toContainText('35');
  await go(page, 'nara', 'Apa yang didukung bukti?');
  await page.locator('[data-answer=sediment]').click();
  await expect(page.locator('.success-banner')).toContainText('100 XP');
});

test('actual displacement drives gait at a wall; blur cancels input; manual camera is retained', async ({ page }) => {
  test.setTimeout(60_000);
  await installOldSave(page);
  await go(page, 'book', 'Ke mana air hujan mengalir?');
  await page.locator('#close-panel').click();
  // Remove the initial .25 rad orbit with a pointer drag so W approaches the flat south wall.
  await page.mouse.move(900, 600); await page.mouse.down(); await page.mouse.move(900 + .25 / .006, 600); await page.mouse.up();
  await expect.poll(async () => Math.abs(Number(await page.locator('#world').getAttribute('data-camera-yaw')))).toBeLessThan(.01);
  const yaw = Number(await page.locator('#world').getAttribute('data-camera-yaw'));
  await page.keyboard.down('w');
  // Swept movement stops at -5.55; allow the brief gait settling transition.
  await expect.poll(async () => Number(await page.locator('#world').getAttribute('data-z')), { timeout: 12_000 }).toBeLessThan(-5.25);
  await page.waitForTimeout(600);
  const stride = Number(await page.locator('#world').getAttribute('data-stride'));
  await page.waitForTimeout(350);
  expect(Number(await page.locator('#world').getAttribute('data-speed'))).toBeLessThan(.025);
  expect(Number(await page.locator('#world').getAttribute('data-z'))).toBeGreaterThanOrEqual(-5.56);
  expect(Number(await page.locator('#world').getAttribute('data-stride'))).toBeCloseTo(stride, 2);
  await page.keyboard.up('w');
  expect(Number(await page.locator('#world').getAttribute('data-camera-yaw'))).toBeCloseTo(yaw, 2);
  // A tap route must remain available when standing against that wall.
  await go(page, 'rain', 'Catatan lapangan · setelah hujan');
  await page.locator('#close-panel').click();
  await page.keyboard.down('s'); await page.waitForTimeout(200);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(150);
  const stopped = await page.locator('#world').getAttribute('data-z');
  await page.waitForTimeout(250);
  expect(await page.locator('#world').getAttribute('data-z')).toBe(stopped);
  await page.keyboard.up('s');
});
