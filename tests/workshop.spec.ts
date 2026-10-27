import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {initialGame,makeBackup} from '../src/game/gameState';
import {correctCircuitAnswers} from '../src/game/workshopMission';
import {repairedWorkshop} from './helpers/workshop';
const out='docs/evidence/workshop';mkdirSync(out,{recursive:true});
async function shot(page:Page,name:string){if(process.env.CAPTURE_WORKSHOP_EVIDENCE)await page.screenshot({path:`${out}/${name}.png`});}
async function start(page:Page,mode='ifp'){await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');await page.locator('#input-mode').selectOption(mode);await page.locator('#start').click();}
async function go(page:Page,id:string,title:string){if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();await expect(page.locator('#panel-title')).toHaveText(title,{timeout:30000});}
async function load(page:Page,backup:unknown){if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();await page.locator('#settings').click();await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(page.locator('#settings-feedback')).toContainText('Cadangan valid');await page.locator('#close-panel').click();}
async function state(page:Page){await expect(page.locator('#save-status')).toContainText('Tersimpan');return page.evaluate(()=>new Promise<any>(resolve=>{const request=indexedDB.open('jelajah-sains',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves'),v:Record<string,unknown>={};for(const key of ['M01','M14','W03-LOG01','S13','S14','S15','M17-E1','world']){const read=tx.objectStore('saves').get(key);read.onsuccess=()=>v[key]=read.result;}tx.oncomplete=()=>{db.close();resolve(v);};};}));}

test('W06 IFP complete: investigate, isolate, diagnose, replace, real lamp switching, evidence, migration and reward',async({page})=>{
 test.setTimeout(300000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 await load(page,JSON.parse(readFileSync(new URL('./fixtures/all-through-s15-v6.json',import.meta.url),'utf8')));
 // Preserve old progress while entering from the real Town gate, without mission prerequisites.
 await go(page,'riverTownGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','town');
 await go(page,'workshopGate','Gerbang menuju Bengkel dan Energi');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','workshop');await shot(page,'01-arrival');
 await go(page,'bima','Kak Bima · Nyalakan Lampu Pos Riset');await page.locator('#circuit-accept').click();await expect(page.locator('#circuit-conclusion-open')).toBeDisabled();
 for(const [id,title]of [['circuitBook','Jalur Pergi dan Jalur Kembali'],['faultNotes','Catatan gangguan pos']] as const){await go(page,id,title);await page.locator('#circuit-read').click();}
 await go(page,'bima','Kak Bima · Nyalakan Lampu Pos Riset');await page.locator('#circuit-hypothesis').selectOption('battery');await page.locator('#circuit-save-hypothesis').click();
 for(const [id,title,button]of [['circuitSource','Sumber DC virtual 3 V','circuit-inspect-source'],['circuitSwitch','Sakelar model','circuit-inspect-switch'],['circuitWire','Pemeriksaan kabel S2–L1','circuit-inspect-wire']] as const){await go(page,id,title);await page.locator('#'+button).click();}
 await expect(page.locator('#circuit-continuity')).toBeDisabled();await shot(page,'02-before-isolation');
 await go(page,'researchLamp','Lampu pos riset 3 V');await page.locator('#circuit-test-before').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');await shot(page,'03-lamp-before');
 await go(page,'circuitSource','Sumber DC virtual 3 V');await page.locator('#circuit-isolate').click();await expect(page.locator('#world')).toHaveAttribute('data-circuit-connected','false');
 await go(page,'circuitWire','Pemeriksaan kabel S2–L1');await page.locator('#circuit-continuity').click();await expect(page.locator('#panel-content')).toContainText('terputus');await shot(page,'04-continuity');
 await go(page,'inspectionBench','Meja pemeriksaan lampu');await page.locator('#circuit-inspect-lamp').click();
 await go(page,'componentRack','Rak komponen pengganti');await page.locator('#circuit-take-wire').click();
 await go(page,'circuitBoard','Diagram dan pemasangan kabel');await page.locator('#circuit-pair').selectOption('B+,B-');await page.locator('#circuit-install-pair').click();await expect(page.locator('#circuit-feedback')).toContainText('tidak sah');expect((await state(page))['M17-E1'].connections).toEqual([]);
 // Both accessible assembly methods operate on the same slot: cancel terminal choice, then install.
 await page.locator('[data-terminal="S1"]').click();await page.locator('#circuit-cancel-pair').click();await expect(page.locator('#circuit-selection')).toContainText('dibatalkan');
 await page.locator('[data-terminal="S2"]').click();await page.locator('[data-terminal="L1"]').evaluate(b=>{(b as HTMLButtonElement).click();(b as HTMLButtonElement).click();});await expect(page.locator('#world')).toHaveAttribute('data-circuit-repaired','true');expect((await state(page))['M17-E1'].connections).toHaveLength(1);await shot(page,'05-wire-installed');
 await page.reload();await expect(page.locator('#start')).toContainText('Lanjutkan');await page.locator('#input-mode').selectOption('ifp');await page.locator('#start').click();await expect(page.locator('#world')).toHaveAttribute('data-region','workshop');await expect(page.locator('#world')).toHaveAttribute('data-x','0.00');await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');
 await go(page,'circuitSource','Sumber DC virtual 3 V');await page.locator('#circuit-reconnect').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');
 await go(page,'circuitSwitch','Sakelar model');await page.locator('#circuit-toggle').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','true');
 await go(page,'researchLamp','Lampu pos riset 3 V');await page.locator('#circuit-test-after').click();await page.locator('#circuit-observe').click();await shot(page,'06-lamp-after');
 await page.locator('#close-panel').click();await page.locator('#journal').click();await expect(page.locator('#circuit-tests')).toContainText('Menyala');await page.locator('#circuit-reflection').fill('Dugaan sumber habis berubah setelah uji 3 V dan kontinuitas.');await page.locator('#circuit-save-reflection').click();await shot(page,'07-journal');
 await go(page,'bima','Kak Bima · Nyalakan Lampu Pos Riset');await page.locator('#circuit-conclusion-open').click();for(const [key,value]of Object.entries(correctCircuitAnswers))await page.locator(`[name=${key}]`).selectOption(value);await page.locator('[name=cause]').selectOption('empty-battery');await page.locator('#circuit-conclude').click();await expect(page.locator('#circuit-feedback')).toContainText('Jawaban awal disimpan');for(const [key,value]of Object.entries(correctCircuitAnswers))await page.locator(`[name=${key}]`).selectOption(value);await page.locator('#circuit-conclude').click();await expect(page.locator('.success-banner')).toContainText('50 XP');await expect(page.locator('#panel-content')).toContainText('Dalam pengembangan');await expect(page.locator('#panel-content')).toContainText('Pemeriksaanmu membuktikan');await shot(page,'08-complete');
 await go(page,'circuitSwitch','Sakelar model');await page.locator('#circuit-toggle').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');expect((await state(page))['M17-E1'].completed).toBe(true);await page.locator('#circuit-toggle').click();
 const all=await state(page);expect(all['M17-E1'].reward).toBe(50);expect(all.S15.completed).toBe(true);expect(all.S14.reward).toBe(50);expect(all.M14.day).toBe(4);
 writeFileSync(`${out}/final-state.json`,JSON.stringify({physicalDevice:false,mode:'IFP browser simulation',...all},null,2));
 await page.locator('#close-panel').click();await page.locator('#settings').click();const downloadEvent=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadEvent;expect(download.suggestedFilename()).toContain('v15');const backup=JSON.parse(readFileSync((await download.path())!,'utf8'));expect(backup.missions['M17-E1'].completed).toBe(true);
 const invalid=structuredClone(backup);invalid.missions['M17-E1'].continuity=false;await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await expect(page.locator('#settings-feedback')).toContainText('M17-E1 tidak valid');expect((await state(page))['M17-E1'].completed).toBe(true);
 for(const file of ['m01-v1.json','m01-m14-v2.json','m01-m14-rimba-v3.json','m01-rimba-garden-s13-v4.json','all-through-s14-v5.json','all-through-s15-v6.json']){await load(page,JSON.parse(readFileSync(new URL(`./fixtures/${file}`,import.meta.url),'utf8')));expect((await state(page))['M17-E1'].reward).toBe(50);}await load(page,backup);
 await page.locator('#settings').click();await page.locator('#reset-workshop').click();await expect(page.locator('#confirm-workshop-reset')).toBeVisible();await page.locator('#confirm-workshop-reset').click();const reset=(await state(page))['M17-E1'];expect(reset.completed).toBe(false);expect(reset.connections).toEqual([]);expect(reset.reward).toBe(50);expect((await state(page)).S15.completed).toBe(true);
 await go(page,'workshopTownGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','town');expect(errors).toEqual([]);
});
for(const [mode,width,height]of [['laptop',1280,900],['hp',390,844],['hp',844,390]] as const)test(`W06 ${mode} ${width}x${height}: accessible pair list, switching and clean input`,async({browser})=>{
 test.setTimeout(90000);const context=await browser.newContext({viewport:{width,height},isMobile:mode==='hp',hasTouch:mode==='hp'}),page=await context.newPage();await start(page,mode);const p=repairedWorkshop();
 // Rewind only via real recorded actions so the import is a valid pre-assembly state.
 const {workshopAct,inspectedWorkshop}=await import('./helpers/workshop');const before=workshopAct(inspectedWorkshop(),{type:'takeWire'});
 await load(page,makeBackup({...initialGame(),M17E1:before,world:{region:'workshop',activeMission:'M17-E1'}}));
 await go(page,'circuitBoard','Diagram dan pemasangan kabel');await page.locator('#circuit-pair').selectOption('S2,L1');await page.locator('#circuit-install-pair').focus();if(mode==='laptop')await page.keyboard.press('Enter');else await page.locator('#circuit-install-pair').tap();await expect(page.locator('#world')).toHaveAttribute('data-circuit-repaired','true');await shot(page,`09-${mode}-${width}`);
 await page.locator('#close-panel').click();const x=await page.locator('#world').getAttribute('data-x'),z=await page.locator('#world').getAttribute('data-z');await page.waitForTimeout(250);expect(await page.locator('#world').getAttribute('data-x')).toBe(x);expect(await page.locator('#world').getAttribute('data-z')).toBe(z);await expect(page.locator('#run-toggle')).toContainText('Jalan');
 if(mode==='hp'){
  const cdp=await context.newCDPSession(page),box=(await page.locator('#joystick').boundingBox())!;
  const stick={id:1,x:box.x+box.width/2,y:box.y+box.height/2},camera={id:2,x:width*.7,y:height*.55};
  expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.id,camera)).toBe('world');
  const yaw=Number(await page.locator('#world').getAttribute('data-camera-yaw'));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick,camera]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...stick,y:stick.y-24},{...camera,x:camera.x-25}]});
  await page.waitForTimeout(350);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await expect.poll(async()=>Math.abs(Number(await page.locator('#world').getAttribute('data-camera-yaw'))-yaw)).toBeGreaterThan(.05);
  await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-speed'))).toBeLessThan(.03);
  const stopped=await page.locator('#world').getAttribute('data-z');await page.waitForTimeout(200);expect(await page.locator('#world').getAttribute('data-z')).toBe(stopped);
 }
 await load(page,makeBackup({...initialGame(),M17E1:p,world:{region:'workshop',activeMission:'M17-E1'}}));await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','true');await go(page,'circuitSwitch','Sakelar model');await page.locator('#circuit-toggle').click();await expect(page.locator('#world')).toHaveAttribute('data-lamp-on','false');await shot(page,`10-switch-${width}`);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
