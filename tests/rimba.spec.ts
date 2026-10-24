import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { makeBackup, initialGame } from '../src/game/gameState';
import { preparedRimba, transfer } from './helpers/rimba';
const output=process.env.CAPTURE_RIMBA_EVIDENCE==='1'?'docs/evidence/rimba':'test-results/rimba';mkdirSync(output,{recursive:true});
async function start(page:Page,mode='ifp') {await page.goto('/?avatar=siswi');await expect(page.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});await page.locator('#input-mode').selectOption(mode);await page.locator('#start').click();}
async function go(page:Page,id:string,title:string|RegExp) {
 if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();
 if(await page.locator('#run-toggle').isVisible()&&await page.locator('#run-toggle').getAttribute('aria-pressed')==='false')await page.locator('#run-toggle').click();
 await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();await expect(page.locator('#panel-title')).toHaveText(title,{timeout:35_000});
}
async function shot(page:Page,name:string){await page.waitForTimeout(650);await page.screenshot({path:`${output}/${name}.png`});}
async function state(page:Page) {await expect(page.locator('#save-status')).toContainText(/Tersimpan|Progres sebelumnya/);return page.evaluate(async()=>await new Promise<any>((resolve,reject)=>{const request=indexedDB.open('jelajah-sains',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves'),out:Record<string,unknown>={};for(const key of ['M01','M14','W03-LOG01','world']){const r=tx.objectStore('saves').get(key);r.onsuccess=()=>{out[key]=r.result;};}tx.oncomplete=()=>{db.close();resolve(out);};tx.onerror=()=>reject(tx.error);};}));}
async function load(page:Page,raw:unknown) {if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();await page.locator('#settings').click();await page.locator('#import-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});await expect(page.locator('#settings-feedback')).toContainText('Cadangan valid');await page.locator('#close-panel').click();}
async function fill(page:Page,ml:number,double=false) {
 await go(page,'forestSource','Tandon sumber Pos Rimba');await page.locator('#rimba-fill').click();await page.locator('#rimba-amount').selectOption(String(ml));
 if(double)await page.locator('#rimba-confirm-transfer').evaluate(b=>{(b as HTMLButtonElement).click();(b as HTMLButtonElement).click();});else await page.locator('#rimba-confirm-transfer').click();
 await expect(page.locator('#panel-title')).toHaveText('Transfer air tercatat');
}
async function pour(page:Page,target:'A'|'B'|'C',ml:number) {
 await go(page,`receiver${target}`,`Penampung ${target}`);await page.locator('#rimba-pour').click();await page.locator('#rimba-amount').selectOption(String(ml));
 await expect(page.locator('#rimba-preview')).toContainText(`Tuang ${ml/1000} L`);await page.locator('#rimba-confirm-transfer').click();await expect(page.locator('#panel-title')).toHaveText('Transfer air tercatat');
}

test('W03 IFP: enter from Town, repair real cart, two loaded journeys, conclude, habitat, reload and legacy-compatible backup',async({page})=>{
 test.setTimeout(360_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 const legacy=JSON.parse(readFileSync(new URL('./fixtures/m01-m14-v2.json',import.meta.url),'utf8'));await load(page,legacy);
 await page.locator('#active-mission').selectOption('W03-LOG01');await expect(page.locator('[data-guide=rimbaGate]').first()).toBeVisible();
 await go(page,'rimbaGate','Gerbang menuju Rimba dan Gambut');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','rimba');
 await page.addStyleTag({content:'#toast{display:none!important}'});await page.waitForTimeout(350);await shot(page,'01-rimba-region');
 await go(page,'damar','Pak Damar · Pos Rimba');await page.locator('#rimba-accept').click();
 await go(page,'forestMap','Peta aman Pos Rimba');await page.locator('#rimba-read-map').click();await page.locator('#rimba-inspect-c').click();
 await page.locator('#rimba-total').selectOption('20000');await page.locator('#rimba-record-total').click();await expect(page.locator('#rimba-feedback')).toContainText('jumlahkan');
 await go(page,'capacityBook','Kapasitas dan Volume');await page.locator('#rimba-read-source').click();
 await go(page,'supplyNotes','Rencana Persediaan Pos');await page.locator('#rimba-read-source').click();
 for(const target of ['A','B']){await go(page,`receiver${target}`,`Penampung ${target}`);await page.locator('#rimba-inspect').click();}
 await go(page,'forestMap','Peta aman Pos Rimba');await page.locator('#rimba-total').selectOption('24000');await page.locator('#rimba-record-total').click();
 await go(page,'workshop','Bengkel Pos Rimba');await shot(page,'02-broken-cart');await page.locator('#rimba-parts').click();await page.locator('#rimba-repair').click();await expect(page.locator('#world')).toHaveAttribute('data-cart-repaired','true');await shot(page,'03-repaired-cart');await page.locator('#rimba-push').click();await expect(page.locator('#world')).toHaveAttribute('data-pushing','true');
 await fill(page,12000,true);let save=(await state(page))['W03-LOG01'];expect(save.source).toBe(28000);expect(save.cart).toBe(12000);expect(save.transfers).toHaveLength(1);await shot(page,'04-fill-receipt');
 await page.reload();await expect(page.locator('#start')).toContainText('Lanjutkan');await page.locator('#input-mode').selectOption('ifp');await page.locator('#start').click();await expect(page.locator('#world')).toHaveAttribute('data-pushing','false');await expect(page.locator('#world')).toHaveAttribute('data-cart-water','12000');await expect(page.locator('#run-toggle')).toHaveAttribute('aria-pressed','false');
 await go(page,'workshop','Bengkel Pos Rimba');await page.locator('#rimba-push').click();
 await pour(page,'A',8000);await shot(page,'05-delivery-A');await pour(page,'B',4000);
 await go(page,'damar','Pak Damar · Pos Rimba');await page.locator('#rimba-open-c').click();await expect(page.locator('#rimba-open-c')).toBeDisabled();
 await fill(page,12000);await pour(page,'B',2000);await pour(page,'C',10000);await shot(page,'06-delivery-C');
 save=(await state(page))['W03-LOG01'];expect(save.source).toBe(16000);expect(save.targets).toEqual({A:8000,B:6000,C:10000});expect(save.cart).toBe(0);expect(save.trips).toHaveLength(2);expect(save.trips.every((t:any)=>t.distanceMm>0&&t.movingMs>0)).toBe(true);
 await go(page,'habitatBoard','Habitat Setelah Kebakaran');await page.locator('#rimba-read-source').click();
 await go(page,'damar','Pak Damar · Pos Rimba');await page.locator('#rimba-conclusion').click();
 await page.locator('[name=claim]').selectOption('always-full');await page.locator('[name=evidence]').selectOption(String(save.transfers.find((t:any)=>t.kind==='pour').id));await page.locator('[name=efficiency]').selectOption('cart-always');await page.locator('#rimba-submit-conclusion').click();await expect(page.locator('#rimba-feedback')).toContainText('Jawaban awal tetap dicatat');
 await page.locator('[name=claim]').selectOption('capacity-not-content');await page.locator('[name=efficiency]').selectOption('one-tool');await page.locator('#rimba-submit-conclusion').click();await page.locator('#rimba-report').click();await page.locator('#rimba-restoration').selectOption('native-restore');await page.locator('#rimba-restore').click();await expect(page.locator('.success-banner')).toContainText('100 XP');await shot(page,'07-complete');
 await page.locator('#close-panel').click();await page.locator('#journal').click();await expect(page.locator('#rimba-trips')).toContainText('12 L');await expect(page.locator('#panel-content')).toContainText('Perhitungan kapasitas, bukan hasil uji alat lain');await page.locator('#rimba-trips').scrollIntoViewIfNeeded();await shot(page,'08-journal');
 const all=await state(page);writeFileSync(`${output}/final-state.json`,JSON.stringify({viewport:page.viewportSize(),mode:'IFP browser emulation',physicalDevice:false,...all},null,2));expect(all.M01.samples.A.value).toBe(70);expect(all.M14.day).toBe(4);expect(all['W03-LOG01'].attempts.map((a:any)=>a.correct)).toEqual([false,true]);
 await page.locator('#close-panel').click();await page.locator('#settings').click();const downloadEvent=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadEvent;expect(download.suggestedFilename()).toContain('v5');const backup=JSON.parse(readFileSync((await download.path())!,'utf8'));expect(backup.missions['W03-LOG01'].reward).toBe(100);
 const bad=structuredClone(backup);bad.missions['W03-LOG01'].source=-1;await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await expect(page.locator('#settings-feedback')).toContainText('tidak valid');expect((await state(page))['W03-LOG01'].source).toBe(16000);
 await page.locator('#import-file').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(page.locator('#settings-feedback')).toContainText('Pos Rimba');
 await page.locator('#reset-rimba').click();await page.locator('#confirm-rimba-reset').click();save=(await state(page))['W03-LOG01'];expect(save.source).toBe(40000);expect(save.reward).toBe(100);expect(save.completed).toBe(false);expect((await state(page)).M14.day).toBe(4);
 await go(page,'forestTownGate','Gerbang menuju Kota Sains');await shot(page,'10-return-gate');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','town');await expect(page.locator('#world')).toHaveAttribute('data-player-height','1.600');expect(errors).toEqual([]);
});

test('HP Rimba: real bucket carry, two-finger camera, partial transfer and safe C route in portrait/landscape',async({browser})=>{
 test.setTimeout(180_000);
 for(const [name,width,height]of [['portrait',390,844],['landscape',844,390]] as const){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});const page=await context.newPage();await start(page,'hp');
  const p=transfer(preparedRimba(),'fill',4000);await load(page,makeBackup({...initialGame(),Rimba:p,world:{region:'rimba',activeMission:'W03-LOG01'}}));
  await go(page,'bucketRack','Rak ember Pos Rimba');await page.locator('#rimba-carry-bucket').click();
  const cdp=await context.newCDPSession(page),r=(await page.locator('#joystick').boundingBox())!;const stick={id:1,x:r.x+r.width/2,y:r.y+r.height/2-25},camera={id:2,x:width-55,y:height*.55};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick]});await page.waitForTimeout(180);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick,camera]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[stick,{...camera,x:camera.x-30}]});await page.waitForTimeout(150);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await expect(page.locator('#world')).toHaveAttribute('data-bucket-water','4000');await pour(page,'A',2000);let save=(await state(page))['W03-LOG01'];expect(save.bucket).toBe(2000);expect(save.targets.A).toBe(2000);
  await go(page,'receiverC','Pak Damar · Pos Rimba');await page.locator('#rimba-open-c').click();await pour(page,'C',2000);save=(await state(page))['W03-LOG01'];expect(save.targets.C).toBe(2000);expect(save.bucket).toBe(0);
  await page.locator('#close-panel').click();await page.addStyleTag({content:'#toast{display:none!important}'});await shot(page,`09-hp-${name}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
 }
});

test('IFP bucket can complete six loads without repairing the cart',async({page})=>{
 test.setTimeout(240_000);await start(page);await load(page,makeBackup({...initialGame(),Rimba:preparedRimba('bucket',false),world:{region:'rimba',activeMission:'W03-LOG01'}}));
 await go(page,'bucketRack','Rak ember Pos Rimba');await page.locator('#rimba-carry-bucket').click();
 const routes:[('A'|'B'|'C'),number][]=[['A',4000],['A',4000],['B',4000],['B',2000],['C',4000],['C',4000]];
 for(let i=0;i<routes.length;i++){
  await fill(page,4000);await pour(page,routes[i][0],routes[i][1]);
  if(i===0){await go(page,'damar','Pak Damar · Pos Rimba');await page.locator('#rimba-open-c').click();}
  if(i===3)await pour(page,'C',2000);
 }
 const save=(await state(page))['W03-LOG01'];expect(save.trips).toHaveLength(6);expect(save.repaired).toBe(false);expect(save.source).toBe(16000);
 await go(page,'damar','Pak Damar · Pos Rimba');await page.locator('#rimba-conclusion').click();await page.locator('[name=claim]').selectOption('capacity-not-content');await page.locator('[name=evidence]').selectOption(String(save.transfers.find((t:any)=>t.kind==='pour').id));await page.locator('[name=efficiency]').selectOption('one-tool');await page.locator('#rimba-submit-conclusion').click();await page.locator('#rimba-report').click();await page.locator('#rimba-restoration').selectOption('native-restore');await page.locator('#rimba-restore').click();await expect(page.locator('.success-banner')).toContainText('100 XP');
});

test('laptop cart: real wheel distance, controlled Shift speed, enlarged collision, park restores normal running',async({page})=>{
 test.setTimeout(90_000);await start(page,'laptop');await load(page,makeBackup({...initialGame(),Rimba:transfer(preparedRimba('cart'),'fill',12000),world:{region:'rimba',activeMission:'W03-LOG01'}}));
 await go(page,'workshop','Bengkel Pos Rimba');await page.locator('#rimba-push').click();const canvas=page.locator('#world');await expect(canvas).toHaveAttribute('data-pushing','true');
 await page.mouse.move(1000,600);await page.mouse.down();await page.mouse.move(1000+.25/.006,600);await page.mouse.up();
 await page.keyboard.down('w');await page.keyboard.down('ShiftRight');await expect.poll(async()=>Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(4.05);expect(Number(await canvas.getAttribute('data-speed'))).toBeLessThan(4.3);
 await page.keyboard.up('ShiftRight');await expect.poll(async()=>Number(await canvas.getAttribute('data-speed'))).toBeLessThan(3.6);
 await expect.poll(async()=>Number(await canvas.getAttribute('data-z')),{timeout:10_000}).toBeLessThan(3.15);await page.waitForTimeout(400);expect(Number(await canvas.getAttribute('data-z'))).toBeGreaterThanOrEqual(3.1);
 const angle=Number(await canvas.getAttribute('data-cart-wheel-angle'));expect(Math.abs(angle)).toBeGreaterThan(1);await page.waitForTimeout(300);expect(Number(await canvas.getAttribute('data-cart-wheel-angle'))).toBe(angle);await expect(canvas).toHaveAttribute('data-locomotion','idle');await page.keyboard.up('w');
 await go(page,'workshop','Bengkel Pos Rimba');await page.locator('#rimba-park').click();await expect(canvas).toHaveAttribute('data-pushing','false');await expect(canvas).toHaveAttribute('data-cart-water','12000');
 await page.keyboard.down('a');await page.keyboard.down('ShiftLeft');await expect.poll(async()=>Number(await canvas.getAttribute('data-speed'))).toBeGreaterThan(7.7);await page.keyboard.up('a');await page.keyboard.up('ShiftLeft');
 await page.locator('#settings').click();await page.locator('#home').click();await expect(canvas).toHaveAttribute('data-run-mode','walk');await expect(canvas).toHaveAttribute('data-camera-distance','normal');
});
