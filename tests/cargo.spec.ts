import { expect, test, type Page } from '@playwright/test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialGame, makeBackup } from '../src/game/gameState';
import { fasterCargo, type CargoReading } from '../src/game/cargoMotion';

const capture = !!process.env.CAPTURE_CARGO;
const output = 'docs/evidence/cargo';
const origin = process.env.CARGO_ORIGIN;
const truck = (page: Page) => page.locator('#world');
const button = (page: Page, id: string) => page.locator('#' + id);
const click = (page: Page, id: string) => button(page,id).click();
const amount = async (page: Page, field: string) => Number(await truck(page).getAttribute('data-cargo-' + field));

async function boot(page: Page, mode: string) {
  await page.goto(origin ?? '/');
  await button(page, 'input-mode').selectOption(mode);
  await page.locator('#start:not([disabled])').click();
  await expect(truck(page)).toHaveAttribute('data-ready','true');
}

async function load(page: Page, json: unknown) {
  await click(page,'settings');
  await button(page,'import-file').setInputFiles({name:'profil.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});
  await expect(button(page,'settings-feedback')).toContainText('Cadangan valid');
  await click(page,'close-panel');
}

function oldSave(region: 'town' | 'river', prepared = false) {
  const game = initialGame();
  game.world = {region, activeMission:'M04'};
  game.M03.accepted = game.M03.book = true;
  game.M04.accepted = game.M04.book = game.M04.notes = prepared;
  const backup = makeBackup(game);
  if (prepared) return backup;
  const { M04: unused, ...missions } = backup.missions;
  return { ...backup, version: 21, missions, world:{region,activeMission:'M03'} };
}

async function go(page: Page, id: string, title: string) {
  if (await button(page,'panel').isVisible()) await click(page,'close-panel');
  await click(page,'map');
  await page.locator(`[data-destination="${id}"]`).click();
  await expect.poll(async()=>{
    if(await button(page,'panel').isVisible())return (await button(page,'panel-title').textContent())===title;
    return (await truck(page).getAttribute('data-near'))===id && (await truck(page).getAttribute('data-moving'))==='false';
  },{timeout:85_000}).toBe(true);
  if(!await button(page,'panel').isVisible())await click(page,'interact');
  await expect(button(page,'panel-title')).toHaveText(title);
}

async function saved(page: Page) {
  await expect(page.locator('body:not([data-save-state=pending]):not([data-save-state=failed])')).toHaveCount(1);
  return page.evaluate(async () => new Promise<Record<string,any>>((resolve,reject) => {
    const request=indexedDB.open('jelajah-sains',2);
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const database=request.result, tx=database.transaction('saves'), found:Record<string,unknown>={};
      for(const key of ['M04','M03','M14','S15','economy','appearance']){
        const read=tx.objectStore('saves').get(key);
        read.onsuccess=()=>{found[key]=read.result;};
      }
      tx.oncomplete=()=>{database.close();resolve(found);};
      tx.onerror=()=>reject(tx.error);
    };
  }));
}

async function shot(page: Page, name: string) {
  if (!capture) return;
  mkdirSync(output,{recursive:true});
  await page.screenshot({path:`${output}/${name}.jpg`,type:'jpeg',quality:84});
}

async function film(page: Page) {
  if (!capture) return async (_keep: boolean) => {};
  const cdp = await page.context().newCDPSession(page);
  const dir = mkdtempSync(join(tmpdir(),'cargo-fps-'));
  const frames: { path:string; time:number }[]=[];
  cdp.on('Page.screencastFrame',f=>{
    void cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});
    const time=f.metadata.timestamp??0;
    if(time-(frames.at(-1)?.time??0)<.11)return;
    const path=join(dir,`${frames.length}.jpg`);
    writeFileSync(path,Buffer.from(f.data,'base64'));
    frames.push({path,time});
  });
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:72,maxWidth:960,maxHeight:640});
  return async (keep:boolean)=>{
    try {
      await cdp.send('Page.stopScreencast').catch(()=>{});
      await cdp.detach().catch(()=>{});
      if(!keep)return;
      const list=frames.map((f,i)=>`file '${f.path}'\nduration ${Math.min(1.5,(frames[i+1]?.time??f.time+1)-f.time)}`).join('\n');
      const order=join(dir,'frames.txt');
      writeFileSync(order,list+'\n');
      const process=spawnSync('ffmpeg',['-loglevel','error','-y','-f','concat','-safe','0','-i',order,'-vf','setpts=0.58*PTS,fps=12,scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libvpx-vp9','-crf','39','-b:v','0','-deadline','realtime','-cpu-used','6',`${output}/m04-bermain.webm`],{encoding:'utf8'});
      expect(process.status,process.stderr).toBe(0);
    } finally { rmSync(dir,{recursive:true,force:true}); }
  };
}

async function board(page: Page, prepare: string) {
  await click(page,prepare);
  await click(page,'cargo-board');
  await expect(truck(page)).toHaveAttribute('data-cargo-aboard','true');
  await expect(truck(page)).toHaveAttribute('data-locomotion-mode','cargo');
}

async function parkAndExit(page: Page) {
  await expect(truck(page)).toHaveAttribute('data-cargo-parked','bay',{timeout:35_000});
  await click(page,'cargo-park');
  await click(page,'cargo-exit');
  await expect(button(page,'panel-title')).toHaveText('Petak parkir dermaga');
  await expect(truck(page)).toHaveAttribute('data-cargo-aboard','false');
}

async function nextRun(page: Page) {
  await click(page,'cargo-record');
  await expect(button(page,'cargo-record')).toBeDisabled();
  await click(page,'cargo-next-run');
  await go(page,'cargoDepot','Pangkalan kargo listrik');
}

test('M04 full drive, brake practice, A and B, delivery and one durable reward', async ({page,context})=>{
  test.setTimeout(360_000);
  await page.setViewportSize({width:1280,height:900});
  const errors:string[]=[],external:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(origin)await context.route('**/*',route=>{
    const url=route.request().url();
    if(url.startsWith(origin+'/')||url.startsWith('blob:')||url.startsWith('data:'))return route.continue();
    external.push(url);return route.abort();
  });
  await boot(page,'laptop');
  await load(page,oldSave('town'));
  const previous=await saved(page);
  await button(page,'active-mission').selectOption('M04');
  await go(page,'warga','Pak Wira · Kiriman ke Dermaga');
  await click(page,'cargo-accept');
  await go(page,'riverGate','Gerbang menuju Sungai dan Danau');
  await click(page,'enter-region');
  await expect(truck(page)).toHaveAttribute('data-region','river');
  await expect(button(page,'active-mission')).toHaveValue('M04');
  await go(page,'cargoBook','Buku gerak dan gaya');await click(page,'cargo-read');
  await go(page,'cargoNotes','Catatan pengiriman dermaga');await click(page,'cargo-read');
  await go(page,'cargoDepot','Pangkalan kargo listrik');

  let filmed=false;
  const stop=await film(page);
  try {
    await board(page,'cargo-prepare-practice');
    await shot(page,'01-naik');
    await page.keyboard.down('w');
    await expect.poll(()=>amount(page,'speed')).toBeGreaterThan(1.5);
    await page.keyboard.up('w');
    await page.keyboard.press('e');
    await expect(truck(page)).toHaveAttribute('data-cargo-aboard','true');
    await click(page,'cargo-brake');
    await expect.poll(()=>amount(page,'speed')).toBe(0);
    const wheel=await amount(page,'wheel');
    await page.waitForTimeout(220);
    expect(await amount(page,'wheel')).toBe(wheel);
    await shot(page,'02-rem');
    await click(page,'map');
    await expect(button(page,'panel-title')).toHaveText('Peta lintasan kargo');
    await click(page,'cargo-map-guide');
    await parkAndExit(page);
    await nextRun(page);

    await button(page,'cargo-guess').selectOption('A');await click(page,'cargo-predict');
    await board(page,'cargo-load-A');
    await expect(truck(page)).toHaveAttribute('data-cargo-load','practice-crate');
    await click(page,'cargo-guide');
    await expect.poll(()=>amount(page,'distance')).toBeGreaterThan(1200);
    await click(page,'map');
    const stopped={distance:await amount(page,'distance'), time:await amount(page,'time'), wheel:await amount(page,'wheel')};
    await page.waitForTimeout(450);
    expect(await amount(page,'distance')).toBe(stopped.distance);
    expect(await amount(page,'time')).toBe(stopped.time);
    expect(await amount(page,'wheel')).toBe(stopped.wheel);
    await click(page,'close-panel');
    await shot(page,'03-rute-a');
    await parkAndExit(page);
    await nextRun(page);

    await board(page,'cargo-load-B');
    await click(page,'cargo-guide');
    await expect.poll(()=>amount(page,'distance')).toBeGreaterThan(1800);
    await shot(page,'04-rute-b');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    const hiddenTime=await amount(page,'time'),hiddenWheel=await amount(page,'wheel');
    await page.waitForTimeout(420);
    expect(await amount(page,'time')).toBe(hiddenTime);
    expect(await amount(page,'wheel')).toBe(hiddenWheel);
    await page.evaluate(()=>{Reflect.deleteProperty(document,'hidden');document.dispatchEvent(new Event('visibilitychange'));});
    await parkAndExit(page);
    await nextRun(page);

    const results=(await saved(page)).M04.records as [CargoReading,CargoReading];
    expect(results).toHaveLength(2);
    expect(results[0].distanceMm).toBeLessThan(results[1].distanceMm);
    const choice=fasterCargo(...results);
    await shot(page,'05-bandingkan');
    await page.locator('#cargo-choice [name=route]').selectOption(choice==='tie'?'A':choice);
    await page.locator('#cargo-choice [name=reason]').selectOption('time');
    await page.locator('#cargo-choice button').click();
    await click(page,'cargo-load-delivery');
    await shot(page,'06-muat');
    await click(page,'cargo-board');
    await click(page,'cargo-guide');
    await expect.poll(()=>amount(page,'distance')).toBeGreaterThan(800);
    await page.reload();await page.locator('#start:not([disabled])').click();
    await expect(truck(page)).toHaveAttribute('data-cargo-parked','depot');
    await expect(truck(page)).toHaveAttribute('data-cargo-load','empty');
    expect((await saved(page)).M04.records).toEqual(results);
    await go(page,'lestari','Kak Lestari · Petak dermaga');
    await go(page,'cargoDepot','Pangkalan kargo listrik');
    await board(page,'cargo-load-delivery');
    await expect(truck(page)).toHaveAttribute('data-cargo-load','M04-RISET-001');
    await click(page,'cargo-guide');
    await parkAndExit(page);
    await shot(page,'07-parkir');
    await click(page,'cargo-go-lestari');
    await expect(button(page,'panel-title')).toHaveText('Kak Lestari · Terima kiriman',{timeout:18_000});
    await page.locator('#cargo-report [name=fastest]').selectOption(choice);
    await page.locator('#cargo-report [name=explanation]').selectOption('both');
    await page.locator('#cargo-report textarea').fill('Saya memilih dari waktu terukur.');
    await page.locator('#cargo-report button').click();
    await expect(page.locator('.success-banner')).toContainText('M04 selesai');
    await expect(button(page,'coin-balance')).toHaveText(String(previous.economy.balance+100));
    await shot(page,'08-hadiah');
    filmed=true;
  } finally { await stop(filmed); }
  const first=await saved(page);
  expect(first.M04.delivered?.id).toBe('M04-RISET-001');
  expect(first.economy.ledger.filter((r:{missionId:string})=>r.missionId==='M04')).toHaveLength(1);
  for(const key of ['M03','M14','S15','appearance'])expect(first[key]).toEqual(previous[key]);
  await click(page,'close-panel');
  await click(page,'settings');
  const exportEvent=page.waitForEvent('download');
  await click(page,'export');
  const file=await exportEvent;
  expect(file.suggestedFilename()).toContain('v22');
  const backup=JSON.parse(readFileSync((await file.path())!,'utf8'));
  expect(backup.missions.M04).toEqual(first.M04);
  await click(page,'close-panel');
  await load(page,oldSave('river'));
  expect((await saved(page)).M04).toEqual(first.M04);
  await click(page,'settings');await click(page,'reset-cargo');await click(page,'confirm-cargo-reset');
  const reset=await saved(page);
  expect(reset.M04).toMatchObject({completed:false,reward:100,delivered:null,records:[]});
  expect(reset.economy).toEqual(first.economy);
  await load(page,backup);
  const restored=await saved(page);
  expect(restored.M04).toEqual(first.M04);
  expect(restored.economy).toEqual(first.economy);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

for(const [mode,width,height] of [['hp',390,844],['hp',844,390],['ifp',1920,1080]] as const){
  test(`M04 accessible road controls · ${mode} ${width}×${height}`,async({browser})=>{
    test.setTimeout(mode==='ifp'?180_000:100_000);
    // Keep the IFP CSS viewport at 1920×1080 while limiting CPU raster work under SwiftShader.
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:mode==='ifp'?.8:1,
      hasTouch:mode==='hp',isMobile:mode==='hp'});
    const page=await context.newPage();
    await boot(page,mode);
    await load(page,oldSave('river',true));
    await click(page,'settings');await button(page,'reduced-motion').check();await click(page,'close-panel');
    await go(page,'cargoDepot','Pangkalan kargo listrik');
    await click(page,'cargo-prepare-practice');
    if(mode==='hp') await button(page,'cargo-board').tap(); else await click(page,'cargo-board');
    await expect(button(page,'cargo-hud')).toBeVisible();
    if(mode==='hp'){
      const cdp=await context.newCDPSession(page);
      const stick=(await button(page,'joystick').boundingBox())!;
      const controls=(await button(page,'cargo-hud').boundingBox())!;
      const shortcuts=(await page.locator('nav.dock').boundingBox())!;
      expect(stick.x+stick.width).toBeLessThanOrEqual(controls.x);
      expect(controls.y+controls.height).toBeLessThanOrEqual(shortcuts.y+1);
      const x=stick.x+stick.width/2,y=stick.y+stick.height/2;
      const yaw=await truck(page).getAttribute('data-camera-yaw');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y:y-stick.height*.25},{id:2,x:width*.82,y:height*.43}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x,y:y-stick.height*.30},{id:2,x:width*.75,y:height*.49}]});
      await expect.poll(()=>amount(page,'speed')).toBeGreaterThan(.65);
      await expect(truck(page)).not.toHaveAttribute('data-camera-yaw',yaw!);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await button(page,'cargo-brake').tap();
      await expect.poll(()=>amount(page,'speed')).toBe(0);
    }
    await click(page,'map');
    await click(page,'cargo-map-guide');
    await expect.poll(()=>amount(page,'distance')).toBeGreaterThan(1100);
    await shot(page,`${mode}-${width}`);
    await parkAndExit(page);
    await expect(button(page,'cargo-record')).toBeEnabled();
    await context.close();
  });
}
