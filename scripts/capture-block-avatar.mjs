import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const phase=process.argv[2]||'after', output=process.env.BLOCK_EVIDENCE_OUTPUT||'docs/evidence/block-avatar', origin=process.env.EVIDENCE_ORIGIN||'http://127.0.0.1:5173';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[], shots=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await expect(page.locator('#world')).toHaveAttribute('data-ready','true',{timeout:15_000});await page.locator('#start').click();
 await page.addStyleTag({content:'#toast{display:none!important}'});
 await page.locator('#settings').click();await page.locator('#camera-distance').selectOption('normal');await page.locator('#reduced-motion').check();await page.locator('#close-panel').click();
 async function go(id,title) {if(await page.locator('#panel').isVisible())await page.locator('#close-panel').click();await page.locator('#map').click();await page.locator(`[data-destination=${id}]`).click();await expect(page.locator('#panel-title')).toHaveText(title,{timeout:35_000});}
 async function shot(name) {await page.waitForTimeout(600);await page.screenshot({path:`${output}/${phase}-${name}.png`});shots.push({name,...await page.locator('#world').evaluate(c=>({x:c.dataset.x,z:c.dataset.z,yaw:c.dataset.cameraYaw,distance:c.dataset.cameraDistance}))});}
 await go('nara','Halo, penjelajah muda!');await shot('nara-dialogue');await page.locator('#accept-mission').click();await shot('nara-pair');
 await go('warga','Air keruh setelah hujan');await shot('wira-dialogue');await page.locator('#close-panel').click();
 // Approach the laboratory front door via the open south lane using real WASD.
 await page.mouse.move(1000,600);await page.mouse.down();await page.mouse.move(1000+.25/.006,600);await page.mouse.up();
 await page.keyboard.down('s');await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-z')),{timeout:15_000,intervals:[20]}).toBeGreaterThanOrEqual(16.20);await page.keyboard.up('s');
 await page.keyboard.down('a');await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-x')),{timeout:15_000,intervals:[20]}).toBeLessThanOrEqual(-4.95);await page.keyboard.up('a');
 await page.locator('#camera-reset').click();await shot('laboratory-door');
 await page.goto(`${origin}/character.html?framing=compare`);await expect(page.locator('#model-canvas')).toHaveAttribute('data-ready','true',{timeout:15_000});
 for(const kind of phase==='before'?['explorer','nara','wira','sari']:['explorer','explorerGirl','nara','wira','sari']) {await page.locator('#gallery-character').selectOption(kind);await page.screenshot({path:`${output}/${phase}-${kind}-fixed-three-views.png`});}
 if(phase!=='before') {
  await page.goto(`${origin}/character.html`);await expect(page.locator('#model-canvas')).toHaveAttribute('data-ready','true',{timeout:15_000});
  for(const kind of ['explorer','explorerGirl','nara','wira','sari']) {await page.locator('#gallery-character').selectOption(kind);await page.screenshot({path:`${output}/${kind}-three-views.png`});await page.locator('#gallery-detail').click();await page.screenshot({path:`${output}/${kind}-face.png`});await page.locator('#gallery-detail').click();}
 }
 expect(errors).toEqual([]);
 await writeFile(`${output}/${phase}-capture.json`,JSON.stringify({phase,viewport:[1440,1000],camera:{distance:10.8,yaw:.25,pitch:.46,targetHeight:1.02},note:'Both comparison phases use the calibrated 1.02 target height. Original pre-patch target was 1.4. Reduced motion enabled; models and environment are the actual game factories.',shots,errors},null,2));
 console.log(JSON.stringify({phase,shots,errors}));
}finally{await browser.close();}
