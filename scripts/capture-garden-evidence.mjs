// Node 24 strips types for the deterministic fixture builder; the browser uses the production bundle.
import { chromium, expect } from '@playwright/test';
import { initialGarden, gardenTransition } from '../src/game/gardenMission.ts';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const origin=process.env.EVIDENCE_ORIGIN || 'http://127.0.0.1:4173', output='docs/evidence/garden';
await mkdir(output,{recursive:true});
let p=initialGarden();
const act=e=>{const result=gardenTransition(p,e);if(!result.ok)throw new Error(result.message);p=result.progress;};
for(const e of [{type:'accept'},{type:'read',source:'needs'},{type:'read',source:'fair'},
  {type:'plan',variable:'water',controls:'same',water:'100-50'},{type:'borrow'},
  {type:'plant',group:'A',seed:'mung'},{type:'plant',group:'B',seed:'mung'}])act(e);
for(let day=0;day<4;day++) {
  if([0,2].includes(day)) for(const group of ['A','B'])act({type:'measure',group,day});
  if(p.can<450)act({type:'fill'});
  for(const group of ['A','B'])act({type:'water',group,day});act({type:'advance',day});
}
const m01=JSON.parse(await readFile('tests/fixtures/m01-v1.json','utf8'));
const backup={version:2,missions:{M01:m01,M14:p},world:{region:'garden',activeMission:'M14'}};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  async function go(page,id,title) {
    if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();
    await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();await expect(page.locator('#panel-title')).toHaveText(title,{timeout:35_000});
  }
  await page.goto(`${origin}/character.html`);await expect(page.locator('#model-canvas')).toHaveAttribute('data-ready','true',{timeout:15_000});
  await page.locator('#gallery-character').selectOption('sari');await page.screenshot({path:`${output}/bu-sari-three-views.png`});
  await page.goto(origin);await expect(page.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});await page.locator('#input-mode').selectOption('ifp');await page.locator('#start').click();
  await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();
  await expect(page.locator('#world')).toHaveAttribute('data-region','garden');
  await page.addStyleTag({content:'#toast{display:none!important}'});await page.waitForTimeout(1500);
  await page.screenshot({path:`${output}/01-garden-ifp.png`});
  await page.locator('#settings').click();await page.locator('#settings-mode').selectOption('laptop');await page.locator('#import-file').setInputFiles({name:'capture-day4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await expect(page.locator('#settings-feedback')).toContainText('Cadangan valid dimuat');await page.locator('#close-panel').click();
  await go(page,'recordTable','Meja hasil · hari 4');await page.locator('#close-panel').click();
  await page.locator('#settings').click();await page.locator('#camera-distance').selectOption('far');await page.locator('#close-panel').click();
  // Use the game's manual camera to look south from the north end of the garden.
  await page.mouse.move(1100,500);await page.mouse.down();await page.mouse.move(1100-Math.PI/.006,550,{steps:20});await page.mouse.up();
  await page.addStyleTag({content:'#toast{display:none!important}'});await page.waitForTimeout(1200);
  await page.screenshot({path:`${output}/07-garden-overview.png`});
  await page.locator('#camera-reset').click();
  await page.locator('#settings').click();await page.locator('#camera-distance').selectOption('normal');await page.locator('#close-panel').click();
  await go(page,'sari','Bu Sari · Kebun Percobaan');await page.waitForTimeout(800);await page.screenshot({path:`${output}/bu-sari-dialogue.png`});
  const stats=await page.locator('#world').evaluate(c=>({drawCalls:Number(c.dataset.drawCalls),triangles:Number(c.dataset.triangles)}));
  for(const [name,width,height] of [['portrait',390,844],['landscape',844,390]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true}), hp=await context.newPage();
    hp.on('pageerror',e=>errors.push(e.message));await hp.goto(origin);
    await expect(hp.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});await hp.locator('#input-mode').selectOption('hp');await hp.locator('#start').click();
    await hp.locator('#settings').click();await hp.locator('#import-file').setInputFiles({name:'capture-day4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
    await expect(hp.locator('#settings-feedback')).toContainText('Cadangan valid dimuat');await hp.locator('#close-panel').click();
    await hp.addStyleTag({content:'#toast{display:none!important}'});await hp.waitForTimeout(1200);await hp.screenshot({path:`${output}/hp-${name}.png`});
    await go(hp,'plotA','Petak A · hari 4');await hp.locator('#measure-group').click();await hp.waitForTimeout(800);await hp.screenshot({path:`${output}/hp-${name}-plot.png`});
    expect(await hp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
  }
  expect(errors).toEqual([]);
  const metadata={originKind:'Vite production preview',browser:browser.version(),renderer:'Chromium SwiftShader',errors,stats,fixture:'Valid day-4 M14 built through domain events and restored through the import UI; M01 v1 fixture',note:'Overview, entry, HP, and Bu Sari captures supplement the complete real browser flow screenshots. Ephemeral toast overlays hidden for screenshots. No physical-device FPS claim.'};
  await writeFile(`${output}/capture-metadata.json`,JSON.stringify(metadata,null,2));console.log(JSON.stringify(metadata));
} finally {await browser.close();}
