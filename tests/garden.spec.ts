import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { initialGame, makeBackup } from '../src/game/gameState';
import { finishedGarden, observedGarden } from './helpers/garden';
const output=process.env.CAPTURE_GARDEN_EVIDENCE==='1'?'docs/evidence/garden':'test-results/garden';
mkdirSync(output,{recursive:true});
async function start(page:Page,mode='ifp') {
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});
  await page.locator('#input-mode').selectOption(mode);await page.locator('#start').click();
}
async function go(page:Page,id:string,title:RegExp|string) {
  if(await page.locator('#panel').isVisible()) await page.locator('#close-panel').click();
  await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();
  await expect(page.locator('#panel-title')).toHaveText(title,{timeout:35_000});
}
async function saved(page:Page) {await expect(page.locator('#save-status')).toContainText(/Tersimpan|Progres sebelumnya dimuat/);}
async function readGarden(page:Page) {
  await saved(page);
  return page.evaluate(async()=>await new Promise<any>((resolve,reject)=>{
    const request=indexedDB.open('jelajah-sains');request.onsuccess=()=>{const db=request.result;const r=db.transaction('saves').objectStore('saves').get('M14');r.onsuccess=()=>{resolve(r.result);db.close();};r.onerror=()=>reject(r.error);};request.onerror=()=>reject(request.error);
  }));
}
async function screenshot(page:Page,name:string) {await page.screenshot({path:`${output}/${name}.png`});}

test('M14 IFP complete experiment: physical approaches, water, explicit measurements, day guards, journal and first reward',async({page})=> {
  test.setTimeout(600_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await start(page);
  await go(page,'nara','Halo, penjelajah muda!');await page.locator('#accept-mission').click();
  await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();
  await expect(page.locator('#world')).toHaveAttribute('data-region','garden');await expect(page.locator('#mission-name')).toHaveText('Kebun Percobaan');await page.waitForTimeout(800);
  await screenshot(page,'01-garden-ifp');
  await go(page,'sari','Bu Sari · Kebun Percobaan');await page.locator('#accept-garden').click();
  for(const [id,title] of [['gardenBook','Kebutuhan tumbuhan dan pertumbuhan'],['fairNotes','Catatan Bu Sari · percobaan adil']]) {
    await go(page,id!,title!);await page.locator('#read-garden-source').click();
  }
  await go(page,'sari','Bu Sari · Kebun Percobaan');await page.locator('#open-garden-plan').click();
  await page.locator('[name=variable]').selectOption('water-light');await page.locator('[name=controls]').selectOption('same');await page.locator('[name=water]').selectOption('100-50');await page.locator('#garden-plan-save').click();
  await expect(page.locator('#garden-feedback')).toContainText('Ubah jumlah air saja');
  await page.locator('[name=variable]').selectOption('water');await page.locator('#garden-plan-save').click();
  await go(page,'seedStore','Benih dan alat pinjaman');await page.locator('#borrow-garden').click();
  for(const group of ['A','B']) {
    await go(page,`plot${group}`,`Petak ${group} · hari 0`);
    // The same original DOM event cannot consume another seed after the panel refreshes.
    await page.locator('#plant-group').evaluate(b=>{b.dispatchEvent(new MouseEvent('click',{bubbles:true}));b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await expect(page.locator('#plant-group')).toHaveCount(0);
    if(group==='A')await screenshot(page,'02-planting');
  }
  expect((await readGarden(page)).planted).toEqual({A:true,B:true});
  await page.locator('#water-group').click();await expect(page.locator('#garden-feedback')).toContainText('Air belum cukup');
  expect((await readGarden(page)).can).toBe(0);
  for(let day=0;day<=6;day++) {
    if(day<6&&(await readGarden(page)).can<450) {
      await go(page,'waterTank','Tandon air percobaan');const before=await readGarden(page);
      await page.locator('#fill-can').click();const after=await readGarden(page);
      expect(after.can).toBe(1000);expect(before.tank-after.tank).toBe(1000-before.can);
    }
    for(const group of ['A','B']) {
      await go(page,`plot${group}`,`Petak ${group} · hari ${day}`);
      if(day<6) {
        const before=await readGarden(page);
        await page.locator('#water-group').evaluate(b=>{b.dispatchEvent(new MouseEvent('click',{bubbles:true}));b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
        const after=await readGarden(page);expect(before.can-after.can).toBe(group==='A'?300:150);
        await expect(page.locator('#world')).toHaveAttribute('data-pose','water');
        if(day===2&&group==='A') await screenshot(page,'03-watering');
      }
      if([0,2,4,6].includes(day)) {
        const before=await readGarden(page);expect(before.measurements.some((m:any)=>m.day===day&&m.group===group)).toBe(false);
        await page.locator('#measure-group').click();
        await expect(page.locator('#world')).toHaveAttribute('data-pose','ruler');
        if(day===4&&group==='A') await screenshot(page,'04-measuring');
      } else await expect(page.locator('#measure-group')).toBeDisabled();
    }
    await go(page,'recordTable',`Meja hasil · hari ${day}`);
    if(day===6) break;
    await page.locator('#next-day').evaluate(b=>{b.dispatchEvent(new MouseEvent('click',{bubbles:true}));b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await expect(page.locator('#panel-title')).toHaveText(`Meja hasil · hari ${day+1}`);
    expect((await readGarden(page)).day).toBe(day+1);
    if(day===1) {
      const before=await readGarden(page);await page.reload();await expect(page.locator('#start')).toContainText('Lanjutkan');await page.locator('#input-mode').selectOption('ifp');await page.locator('#start').click();
      await expect(page.locator('#world')).toHaveAttribute('data-region','garden');expect(await readGarden(page)).toEqual(before);
      await page.locator('#journal').click();await expect(page.locator('#growth-table tbody tr')).toHaveCount(2);await page.locator('#close-panel').click();
    }
  }
  await expect(page.locator('#growth-table [data-reading="6-A"]')).toHaveAttribute('data-average','8');
  await expect(page.locator('#growth-table [data-reading="6-B"]')).toHaveAttribute('data-average','5');
  await expect(page.locator('#growth-graph [data-series=A]')).toHaveAttribute('data-values','0:0,2:2,4:5,6:8');
  await expect(page.locator('#growth-graph [data-series=B]')).toHaveAttribute('data-values','0:0,2:1,4:3,6:5');
  expect((await page.locator('#growth-graph').boundingBox())!.height).toBeGreaterThan(150);
  await page.locator('#growth-graph').scrollIntoViewIfNeeded();await screenshot(page,'05-graph-and-data');
  await page.locator('#garden-conclusion').click();
  await page.locator('[name=claim]').selectOption('unlimited');await page.locator('#submit-garden-conclusion').click();
  await expect(page.locator('#garden-feedback')).toContainText('Air berlebihan tidak selalu baik');
  await page.locator('[name=claim]').selectOption('model-A');await page.locator('#submit-garden-conclusion').click();
  await expect(page.locator('.success-banner')).toContainText('100 XP');
  await page.locator('#garden-reflection').fill('Saya ingin menguji 75 mL pada kondisi yang sama.');await page.locator('#save-reflection').click();
  let final=await readGarden(page);expect(final.completed).toBe(true);expect(final.reward).toBe(100);expect(final.measurements).toHaveLength(8);expect(final.can+final.tank).toBe(2300);
  await screenshot(page,'06-completed');
  await go(page,'townGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','town');
  await expect(page.locator('#progress-text')).toContainText('1 dari 6');
  await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
  expect(await readGarden(page)).toEqual(final);
  expect(await page.locator('#world').count()).toBe(1);expect(errors).toEqual([]);
});

test('M14 backups: new format, old M01 scope, invalid import atomicity and reward-preserving reset',async({page})=> {
  test.setTimeout(90_000);await start(page,'laptop');
  await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();
  await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
  await go(page,'townGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();
  await expect(page.locator('#world')).toHaveAttribute('data-region','town');
  await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();
  await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
  // These trips happened before accepting or completing M01.
  await page.locator('#active-mission').selectOption('M01');await expect(page.locator('#progress-text')).toContainText('0 dari 6');
  const old=JSON.parse(readFileSync(new URL('./fixtures/m01-v1.json',import.meta.url),'utf8'));
  const backup=makeBackup({...initialGame(),M01:old,M14:finishedGarden(),world:{region:'garden',activeMission:'M14'}});
  await page.locator('#settings').click();
  await page.locator('#import-file').setInputFiles({name:'new.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await expect(page.locator('#settings-feedback')).toContainText('M01, M14');await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
  const before=await readGarden(page);
  await page.locator('#import-file').setInputFiles({name:'old-m01.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});
  await expect(page.locator('#settings-feedback')).toContainText('M14, Pos Rimba, dan wilayah saat ini tetap');expect(await readGarden(page)).toEqual(before);
  const invalid=structuredClone(backup);invalid.missions.M14.can=-1;
  await page.locator('#import-file').setInputFiles({name:'bad-garden.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await expect(page.locator('#settings-feedback')).toContainText('tidak valid');expect(await readGarden(page)).toEqual(before);
  const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('jelajah-sains-cadangan-v20.json');
  const exported=JSON.parse(readFileSync((await download.path())!,'utf8'));expect(exported.version).toBe(20);expect(exported.missions.M14).toEqual(before);expect(exported.missions.M01.samples.A.value).toBe(70);
  await page.locator('#reset-garden').click();await expect(page.locator('#panel-title')).toHaveText('Ulangi Percobaan M14?');
  expect((await readGarden(page)).day).toBe(6);await page.locator('#confirm-garden-reset').click();
  const reset=await readGarden(page);expect(reset.day).toBe(0);expect(reset.reward).toBe(100);expect(reset.firstCompletedAt).toBe(before.firstCompletedAt);
  await page.reload();await page.locator('#start').click();await page.locator('#active-mission').selectOption('M01');await page.locator('#journal').click();await expect(page.locator('table')).toContainText('70');
});

test('garden HP portrait and landscape preserve controls, tool visibility and region-specific routes',async({browser})=> {
  test.setTimeout(120_000);
  for(const [name,width,height] of [['portrait',390,844],['landscape',844,390]] as const) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true});const page=await context.newPage();
    await start(page,'hp');await page.locator('#settings').click();
    const backup=makeBackup({...initialGame(),M14:observedGarden(4),world:{region:'garden',activeMission:'M14'}});
    await page.locator('#import-file').setInputFiles({name:'garden.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await saved(page);await page.locator('#close-panel').click();
    await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
    await screenshot(page,`hp-${name}`);
    const overlaps=await page.evaluate(()=> {
      const selectors=['#joystick','.dock','#interact','.mission-card'];
      return selectors.flatMap((a,i)=>selectors.slice(i+1).flatMap(b=> {const x=document.querySelector(a)!.getBoundingClientRect(),y=document.querySelector(b)!.getBoundingClientRect();return Math.min(x.right,y.right)>Math.max(x.left,y.left)&&Math.min(x.bottom,y.bottom)>Math.max(x.top,y.top)?[`${a}/${b}`]:[];}));
    });expect(overlaps).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(name==='portrait') {
      const cdp=await context.newCDPSession(page), rect=(await page.locator('#joystick').boundingBox())!;
      const before=Number(await page.locator('#world').getAttribute('data-z'));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:rect.x+rect.width/2,y:rect.y+rect.height/2-30}]});
      await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-z'))).toBeLessThan(before-.4);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      const stopped=await page.locator('#world').getAttribute('data-z');await page.waitForTimeout(250);expect(await page.locator('#world').getAttribute('data-z')).toBe(stopped);
    }
    await go(page,'plotA','Petak A · hari 4');
    // Fixture has already measured day 4, so repeated measurement remains disabled.
    await expect(page.locator('#measure-group')).toBeDisabled();
    await screenshot(page,`hp-${name}-plot`);await context.close();
  }
});
