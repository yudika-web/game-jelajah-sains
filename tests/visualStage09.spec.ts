import {allPlaces} from '../src/data/regions';
import {test,expect,type Page} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const fixture=JSON.parse(readFileSync('tests/fixtures/coin-wallet-stage7.json','utf8'));
const out='docs/evidence/visual-stage-09';mkdirSync(out,{recursive:true});
const routes={garden:['gardenBook','waterTank'],rimba:['capacityBook','damar'],river:['fishBook','lestari'],workshop:['circuitBook','bima'],geopark:['geoBook','raka'],town:['book','nara'],coast:['coastBook','coastLestari'],space:['spaceBook','spaceNara']} as const;
async function start(p:Page,mode='ifp'){await p.goto('/');await expect(p.locator('#coin-wallet')).toBeEnabled();await p.locator('#input-mode').selectOption(mode);await p.locator('#start').click();}
async function load(p:Page,region:string){const b={...structuredClone(fixture),version:18,world:{region,activeMission:'M01'}};delete b.economy;delete b.appearance;await p.locator('#settings').click();await p.locator('#import-file').setInputFiles({name:'legacy-v18.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(b))});await expect(p.locator('#settings-feedback')).toContainText('Cadangan valid');await p.locator('#close-panel').click();await expect(p.locator('#world')).toHaveAttribute('data-region',region);await expect(p.locator('#coin-notice')).toBeHidden({timeout:12000});}
async function saved(p:Page){return p.evaluate(()=>new Promise<any>(resolve=>{const q=indexedDB.open('jelajah-sains');q.onsuccess=()=>{const db=q.result,t=db.transaction('saves'),all:any={},r=t.objectStore('saves').openCursor();r.onsuccess=()=>{if(r.result){all[r.result.key as string]=r.result.value;r.result.continue();}};t.oncomplete=()=>{db.close();delete all.world;delete all['save-meta'];if(all.M01)delete all.M01.savedAt;resolve(all);};};}));}
async function go(p:Page,id:string){await p.locator('#map').click();await p.locator(`[data-destination=${id}]`).click();await expect(p.locator('#world')).toHaveAttribute('data-moving','false',{timeout:45000});await expect(p.locator(id==='cosmeticShop'?'#cosmetic-shop':'#panel')).toBeVisible({timeout:45000});}

test('stage09: eight real map routes preserve paid outfit, wallet, all mission evidence and chapter status through reload',async({page})=>{
 test.setTimeout(360000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await load(page,'town');await go(page,'cosmeticShop');await page.locator('#shop-buy').click();await page.locator('#shop-confirm-buy').click();await expect(page.locator('#shop-status')).toContainText('Pembelian tersimpan');await page.locator('#shop-wear').click();await page.locator('#shop-close').click();const before=await saved(page),personal=await page.locator('#world').getAttribute('data-appearance'),cycles:any[]=[];
 for(const[region,points]of Object.entries(routes)){
  await load(page,region);for(const id of points){await go(page,id);const target=allPlaces.find(p=>p.id===id)!;const pos=await page.locator('#world').evaluate(c=>({x:Number(c.dataset.x),z:Number(c.dataset.z)}));expect(Math.hypot(pos.x-target.x,pos.z-target.z),id).toBeLessThan(2.5);await page.locator('#close-panel').click();}
  // Viewing props or ambient actors must never produce learning evidence or transactions.
  expect(await saved(page)).toEqual(before);expect(await page.locator('#world').getAttribute('data-appearance')).toBe(personal);
  await page.reload();await page.locator('#start').click();await expect(page.locator('#world')).toHaveAttribute('data-region',region);expect(await saved(page)).toEqual(before);
  cycles.push(await page.locator('#world').evaluate(c=>({region:c.dataset.region,roots:c.dataset.regionRoots,avatars:c.dataset.avatarRoots,geometries:c.dataset.geometries,textures:c.dataset.textures})));
 }
 for(const c of cycles){expect(c.roots).toBe('1');expect(c.avatars).toBe('1');}expect(errors).toEqual([]);writeFileSync(`${out}/navigation-preservation.json`,JSON.stringify({physicalDevice:false,method:'Browser UI legacy import, actual map route, interaction, reload; no evidence actions',regions:cycles,preserved:['17 mission records','paid appearance','purchase receipts','wallet','M16/M17 proof'],errors},null,2));
});

test('stage09: three region cycles retain one root/avatar and stable region-owned resources',async({page})=>{
 test.setTimeout(300000);await start(page);const cycles:any[]=[];
 for(let i=0;i<3;i++){const cycle:any={};for(const region of ['garden','rimba','river','workshop','geopark','town','coast','space']){await load(page,region);await page.waitForTimeout(250);cycle[region]=await page.locator('#world').evaluate(c=>({owned:Number(c.dataset.regionGeometryCount),geometries:Number(c.dataset.geometries),textures:Number(c.dataset.textures),roots:c.dataset.regionRoots,avatars:c.dataset.avatarRoots}));}cycles.push(cycle);}
 for(const region of Object.keys(cycles[0])){const a=cycles.map(c=>c[region]);expect(a[2].owned).toBe(a[1].owned);expect(a[2].geometries).toBeLessThanOrEqual(Math.max(a[0].geometries,a[1].geometries));expect(a[2].textures).toBeLessThanOrEqual(Math.max(a[0].textures,a[1].textures));for(const c of a){expect(c.roots).toBe('1');expect(c.avatars).toBe('1');}}
 writeFileSync(`${out}/resource-cycles.json`,JSON.stringify({physicalDevice:false,cycles},null,2));
});

for(const [width,height,mode]of [[1440,960,'laptop'],[390,844,'hp'],[844,390,'hp'],[1920,1080,'ifp']] as const)test(`stage09 viewport ${width}x${height}: map access, paused ambient activity, Low and fresh input`,async({browser})=>{
 test.setTimeout(120000);const c=await browser.newContext({viewport:{width,height},hasTouch:mode!=='laptop',isMobile:mode==='hp'}),p=await c.newPage();await start(p,mode);await load(p,'garden');await p.waitForTimeout(300);
 await p.locator('#settings').click();const t=await p.locator('#world').getAttribute('data-environment-time');await p.waitForTimeout(250);expect(await p.locator('#world').getAttribute('data-environment-time')).toBe(t);await p.locator('#reduced-motion').check();await p.locator('#close-panel').click();await p.waitForTimeout(300);expect(await p.locator('#world').getAttribute('data-environment-time')).toBe(t);
 await p.locator('#settings').click();await p.locator('#low-quality').check();await p.locator('#close-panel').click();await expect(p.locator('#world')).toHaveAttribute('data-environment-actors','0');await go(p,'gardenBook');await p.locator('#close-panel').click();const x=await p.locator('#world').getAttribute('data-x'),z=await p.locator('#world').getAttribute('data-z');await p.waitForTimeout(250);expect(await p.locator('#world').getAttribute('data-x')).toBe(x);expect(await p.locator('#world').getAttribute('data-z')).toBe(z);expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await p.screenshot({path:`${out}/viewport-${width}x${height}.png`});await c.close();
});
