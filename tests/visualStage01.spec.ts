// Learning-record comparisons exclude the separately tested coin ledger and save revision.
import {test,expect,type Page} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const baseline=JSON.parse(readFileSync(new URL('../docs/evidence/market/completed-v17.json',import.meta.url),'utf8'));
async function start(p:Page,mode='ifp'){await p.goto('/');await expect(p.locator('#world')).toHaveAttribute('data-ready','true');await p.locator('#input-mode').selectOption(mode);await p.locator('#start').click();}
async function load(p:Page,region='town',activeMission='M02'){await p.locator('#settings').click();await p.locator('#import-file').setInputFiles({name:'existing-v17.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...baseline,world:{region,activeMission}}))});await expect(p.locator('#settings-feedback')).toContainText('Cadangan valid');await p.locator('#close-panel').click();}
async function go(p:Page,id:string,title:string){await p.locator('#map').click();await p.locator(`[data-destination=${id}]`).click();await expect(p.locator('#panel-title')).toHaveText(title,{timeout:45000});}
async function missions(p:Page){await expect(p.locator('#save-status')).toContainText(/Tersimpan|Progres sebelumnya/);return p.evaluate(()=>new Promise<Record<string,unknown>>(resolve=>{const q=indexedDB.open('jelajah-sains');q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves'),v:Record<string,unknown>={};const c=tx.objectStore('saves').openCursor();c.onsuccess=()=>{if(c.result){if(c.result.key!=='world'){const value=c.result.value;if(c.result.key==='M01')delete value.savedAt;v[String(c.result.key)]=value;}c.result.continue();}};tx.oncomplete=()=>{db.close();for(const key of Object.keys(v))if(key==='economy'||key==='save-meta'||key.startsWith('economy-history:'))delete v[key];resolve(v);};};}));}
for(const[width,height]of [[1440,960],[390,844],[844,390],[1920,1080]])test(`stage 01 quality persists separately from all v17 progress ${width}x${height}`,async({browser})=>{
 test.setTimeout(90000);const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,hasTouch:width!==1440,isMobile:width===390||height===390}),p=await context.newPage(),errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));
 await start(p,width===1440?'laptop':width===1920?'ifp':'hp');await load(p);const before=await missions(p);
 await expect(p.locator('#world')).toHaveAttribute('data-quality','normal');await expect(p.locator('#world')).toHaveAttribute('data-pixel-ratio','1.5');
 await p.locator('#settings').click();await p.locator('#camera-distance').selectOption('near');await p.locator('#reduced-motion').check();await p.locator('#low-quality').check();
 await expect(p.locator('#world')).toHaveAttribute('data-quality','low');await expect(p.locator('#world')).toHaveAttribute('data-pixel-ratio','1');
 if(process.env.CAPTURE_VISUAL_EVIDENCE){mkdirSync('docs/evidence/visual-stage-01',{recursive:true});await p.screenshot({path:`docs/evidence/visual-stage-01/quality-low-${width}x${height}.png`});}
 expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await p.locator('#close-panel').click();
 await p.reload();await p.locator('#start').click();await expect(p.locator('#world')).toHaveAttribute('data-quality','low');await expect(p.locator('#world')).toHaveAttribute('data-camera-distance','near');await expect(p.locator('#world')).toHaveAttribute('data-reduced-motion','true');
 await p.locator('#settings').click();await expect(p.locator('#low-quality')).toBeChecked();await p.locator('#low-quality').uncheck();await expect(p.locator('#world')).toHaveAttribute('data-pixel-ratio','1.5');await p.locator('#close-panel').click();
 expect(await missions(p)).toEqual(before);expect(errors).toEqual([]);await context.close();
});
test('stage 01 joined ground: real routes, moving camera, one active root, repeatable resource disposal, old progress unchanged',async({page})=>{
 test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await load(page,'rimba','M16-E3');const before=await missions(page),cycles:unknown[]=[];
 for(let i=0;i<2;i++){
  await go(page,'solidForce','Pengukur gaya alat');await page.locator('#close-panel').click();await expect(page.locator('#world')).toHaveAttribute('data-moving','false');
  expect(Number(await page.locator('#world').getAttribute('data-z'))).toBeGreaterThan(22.5);
  await page.locator('#rotate-left').click();await page.waitForTimeout(400);await page.locator('#camera-reset').click();
  await go(page,'forestTownGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','town');
  await go(page,'workshopGate','Gerbang menuju Bengkel dan Energi');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','workshop');
  await go(page,'hydraulicLoad','Peti perlengkapan pos · kebutuhan lift');await page.locator('#close-panel').click();await expect(page.locator('#world')).toHaveAttribute('data-moving','false');
  expect(Number(await page.locator('#world').getAttribute('data-z'))).toBeGreaterThan(20);
  await page.locator('#rotate-right').click();await page.waitForTimeout(500);
  cycles.push(await page.locator('#world').evaluate(c=>({roots:c.dataset.regionRoots,geometries:c.dataset.geometries,textures:c.dataset.textures,disposals:c.dataset.regionDisposals,quality:c.dataset.quality})));
  await go(page,'workshopTownGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await go(page,'rimbaGate','Gerbang menuju Rimba dan Gambut');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','rimba');
 }
 expect(cycles.every((c:any)=>c.roots==='1')).toBe(true);expect((cycles[0] as any).geometries).toBe((cycles[1] as any).geometries);expect((cycles[0] as any).textures).toBe((cycles[1] as any).textures);
 expect(await missions(page)).toEqual(before);expect(errors).toEqual([]);mkdirSync('test-results/visual-stage-01',{recursive:true});writeFileSync('test-results/visual-stage-01/resource-cycles.json',JSON.stringify({physicalDevice:false,cycles},null,2));
});
