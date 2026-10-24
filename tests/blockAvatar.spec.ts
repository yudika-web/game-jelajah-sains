import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output=process.env.CAPTURE_BLOCK_EVIDENCE==='1'?'docs/evidence/block-avatar':'test-results/block-avatar';mkdirSync(output,{recursive:true});
async function start(page:Page,mode='laptop') {await page.goto('/?avatar=siswi');await expect(page.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});await page.locator('#input-mode').selectOption(mode);await page.locator('#start').click();}
async function go(page:Page,id:string,title:string) {if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();await expect(page.locator('#panel-title')).toHaveText(title,{timeout:35_000});}
test('siswi uses the real game scale across reload, gallery, both regions and old progress',async({page})=> {
 test.setTimeout(120_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 const canvas=page.locator('#world');await expect(canvas).toHaveAttribute('data-avatar','explorerGirl');await expect(canvas).toHaveAttribute('data-player-height','1.600');
 const scale=await canvas.getAttribute('data-player-scale');expect(Number(scale)).toBeGreaterThan(.4);expect(Number(scale)).toBeLessThan(.5);
 await go(page,'nara','Halo, penjelajah muda!');await page.locator('#accept-mission').click();await expect(page.locator('#save-status')).toContainText('Tersimpan');
 for(let i=0;i<2;i++) {await page.reload();await expect(page.locator('#start')).toContainText('Lanjutkan');await page.locator('#start').click();await expect(canvas).toHaveAttribute('data-player-scale',scale!);await expect(canvas).toHaveAttribute('data-player-height','1.600');await expect(page.locator('#progress-text')).toContainText('1 dari 6');}
 await page.addStyleTag({content:'#toast{display:none!important}'});await page.screenshot({path:`${output}/after-siswi-game.png`});
 await page.locator('#settings').click();await page.locator('#character-gallery-link').click();await expect(page.locator('#model-canvas')).toHaveAttribute('data-character','explorerGirl');await expect(page.locator('#model-canvas')).toHaveAttribute('data-height','1.600');await expect(page.locator('#model-canvas')).toHaveAttribute('data-scale',scale!);
 await page.getByRole('link',{name:'Kembali ke Kota Sains'}).click();await page.locator('#start').click();await expect(canvas).toHaveAttribute('data-player-scale',scale!);
 await go(page,'gardenGate','Gerbang menuju Kebun Kehidupan');await page.locator('#enter-region').click();await expect(canvas).toHaveAttribute('data-region','garden');await expect(canvas).toHaveAttribute('data-player-scale',scale!);await expect(canvas).toHaveAttribute('data-avatar','explorerGirl');
 await page.addStyleTag({content:'#toast{display:none!important}'});await page.waitForTimeout(700);await page.screenshot({path:`${output}/after-siswi-garden.png`});
 await go(page,'townGate','Gerbang menuju Kota Sains');await page.locator('#enter-region').click();await expect(canvas).toHaveAttribute('data-region','town');await expect(canvas).toHaveAttribute('data-player-scale',scale!);await expect(page.locator('#progress-text')).toContainText('1 dari 6');expect(errors).toEqual([]);
});
test('scaled block avatar works with HP analog and readable portrait and landscape layout',async({browser})=> {
 test.setTimeout(90_000);
 for(const [name,width,height]of [['portrait',390,844],['landscape',844,390]] as const) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true}),page=await context.newPage();await start(page,'hp');
  await expect(page.locator('#world')).toHaveAttribute('data-player-height','1.600');
  const cdp=await context.newCDPSession(page),r=(await page.locator('#joystick').boundingBox())!, z=Number(await page.locator('#world').getAttribute('data-z'));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2-30}]});
  await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-z'))).toBeLessThan(z-.5);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await page.waitForTimeout(150);const stopped=await page.locator('#world').getAttribute('data-z');await page.waitForTimeout(250);expect(await page.locator('#world').getAttribute('data-z')).toBe(stopped);
  await page.addStyleTag({content:'#toast{display:none!important}'});await page.screenshot({path:`${output}/after-hp-${name}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
 }
});
