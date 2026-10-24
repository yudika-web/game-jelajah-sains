import {finishedWorkshop} from './helpers/workshop';
import { test, expect } from '@playwright/test';
import { createStaticServer } from '../scripts/local/static-server.mjs';
import { APP_ROOT } from '../scripts/local/common.mjs';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import type { Server } from 'node:http';

let server: Server;
let origin: string;
test.beforeAll(async () => {
  ({ server } = await createStaticServer({ root: path.join(APP_ROOT, 'dist'), appRoot: APP_ROOT }));
  // An ephemeral port isolates this production-server test from the existing dev server.
  // The public launcher itself always uses localhost:5173 and never falls back.
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://localhost:${(server.address() as { port: number }).port}`;
});
test.afterAll(async () => { await new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); }); });

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1920, height: 1080 }]) {
  test(`production build loads game and every gallery model without internet ${viewport.width}x${viewport.height}`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    const external: string[] = [], errors: string[] = [], failed: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith(origin + '/') || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      external.push(url); return route.abort();
    });
    await page.goto(origin);
    await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
    await page.locator('#start').click();
    await expect(page.locator('#start')).not.toBeVisible();
    // Existing six-mission progress plus completed M17-E1 is loaded from IndexedDB at the production origin, then
    // checked across a real gallery round trip. The server never reads the DB.
    const fixture = {...JSON.parse(readFileSync(path.join(APP_ROOT, 'docs/evidence/boat/final-state.json'), 'utf8')), 'M17-E1':finishedWorkshop(),world:{region:'workshop',activeMission:'M17-E1'}};
    await page.evaluate(async save => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('jelajah-sains', 1);
        request.onsuccess = () => {
          const db = request.result, tx = db.transaction('saves', 'readwrite');
          for (const [key, value] of Object.entries(save).filter(([key]) => ['M01', 'M14', 'W03-LOG01', 'S13', 'S14', 'S15', 'M17-E1'].includes(key))) tx.objectStore('saves').put(value, key);
          tx.objectStore('saves').put(save.world, 'world');
          tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
        }; request.onerror = () => reject(request.error);
      });
    }, fixture);
    await page.reload(); await expect(page.locator('#start')).toContainText('Lanjutkan');
    await page.locator('#input-mode').selectOption('ifp');await page.locator('#start').click();
    await expect(page.locator('#world')).toHaveAttribute('data-region','workshop');
    await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','true');
    await page.locator('#map').click();await page.locator('[data-destination=circuitSwitch]').click();
    await expect(page.locator('#panel-title')).toHaveText('Sakelar model',{timeout:30000});
    await page.locator('#circuit-toggle').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');
    await page.locator('#circuit-toggle').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','true');
    await page.locator('#close-panel').click();await expect(page.locator('#save-status')).toContainText('Tersimpan');
    const savedBefore = await page.evaluate(async () => new Promise(resolve => {
      const request = indexedDB.open('jelajah-sains', 1);
      request.onsuccess = () => { const db = request.result, read = db.transaction('saves').objectStore('saves').getAll(); read.onsuccess = () => { db.close(); resolve(read.result); }; };
    }));
    await page.goto(`${origin}/character.html?avatar=siswi`);
    await expect(page.locator('#gallery-character')).toBeVisible();
    for (const value of ['explorerGirl', 'explorer', 'nara', 'wira', 'sari', 'damar', 'lestari', 'bima']) {
      await page.locator('#gallery-character').selectOption(value);
      await expect(page.locator('canvas')).toHaveAttribute('data-character', value);
      if(value==='bima'&&viewport.width===1280&&process.env.CAPTURE_WORKSHOP_EVIDENCE)await page.screenshot({path:'docs/evidence/workshop/11-bima-gallery.png'});
    }
    await page.locator('#gallery-detail').click();
    await expect(page.locator('#gallery-detail')).toHaveAttribute('aria-pressed', 'true');
    await page.goto(origin);
    await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
    const savedAfter = await page.evaluate(async () => new Promise(resolve => {
      const request = indexedDB.open('jelajah-sains', 1);
      request.onsuccess = () => { const db = request.result, read = db.transaction('saves').objectStore('saves').getAll(); read.onsuccess = () => { db.close(); resolve(read.result); }; };
    }));
    expect(savedAfter).toEqual(savedBefore);
    expect(external).toEqual([]); expect(errors).toEqual([]); expect(failed).toEqual([]);
  });
}
