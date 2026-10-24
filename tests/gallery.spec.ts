import { test, expect } from '@playwright/test';

test('model gallery renders all four characters and remains static for shape inspection', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/character.html');
  const canvas = page.locator('#model-canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  for (const kind of ['explorer', 'nara', 'wira', 'sari']) {
    await page.locator('#gallery-character').selectOption(kind);
    await expect(canvas).toHaveAttribute('data-character', kind);
    await page.locator('#gallery-detail').click();
    await expect(canvas).toHaveAttribute('data-detail', 'true');
    await page.locator('#gallery-detail').click();
  }
  const before = await canvas.screenshot(); await page.waitForTimeout(250);
  expect((await canvas.screenshot()).equals(before)).toBe(true);
  expect(errors).toEqual([]);
});

test('gallery is accessible from the game and preserves existing M01 progress', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.locator('#start').click();
  await page.locator('#map').click(); await page.locator('[data-destination=nara]').click();
  await expect(page.locator('#accept-mission')).toBeVisible({ timeout: 30_000 });
  await page.locator('#accept-mission').click();
  await expect(page.locator('#save-status')).toContainText('Tersimpan');
  await page.locator('#settings').click(); await page.locator('#character-gallery-link').click();
  await expect(page.locator('#model-canvas')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('link', { name: 'Kembali ke Kota Sains' }).click();
  await expect(page.locator('#start')).toContainText('Lanjutkan'); await page.locator('#start').click();
  await expect(page.locator('#progress-text')).toContainText('1 dari 6');
  await page.locator('#inventory').click(); await expect(page.locator('#panel-content')).toContainText('Botol berlabel A');
});
