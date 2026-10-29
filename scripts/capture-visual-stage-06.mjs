// Comparable W05/ROV production views; use after npm run build. No game debug API.
import {chromium,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createStaticServer} from './local/static-server.mjs';
import {APP_ROOT} from './local/common.mjs';
const out=path.join(APP_ROOT,'docs/evidence/visual-stage-06');await mkdir(out,{recursive:true});
const gameRoot=process.env.JELAJAH_BASELINE_ROOT||APP_ROOT,prefix=process.env.JELAJAH_BASELINE_ROOT?'before':'after';
const {server}=await createStaticServer({root:path.join(gameRoot,'dist'),appRoot:gameRoot});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const p=await browser.newPage({viewport:{width:1440,height:960}});await p.goto(origin);await p.locator('#start:not([disabled])').waitFor();await p.locator('#input-mode').selectOption('ifp');await p.locator('#start').click();await p.locator('#settings').click();await p.locator('#import-file').setInputFiles({name:'ready.json',mimeType:'application/json',buffer:await readFile(path.join(APP_ROOT,'docs/evidence/pressure/ready-v11.json'))});await p.locator('#close-panel').click();await p.locator('#map').click();await p.locator('[data-destination=rovControl]').click();await expect(p.locator('#pressure-launch')).toBeVisible({timeout:30000});await p.locator('#close-panel').click();await p.screenshot({path:path.join(out,`${prefix}-shore.png`)});await p.locator('#interact').click();await p.locator('#pressure-launch').click();await p.locator('#rov-map').click();await p.locator('#rov-go-A4').click();await expect.poll(async()=>Math.hypot(Number(await p.locator('#world').getAttribute('data-rov-depth'))-4,Number(await p.locator('#world').getAttribute('data-rov-x'))-7,Number(await p.locator('#world').getAttribute('data-rov-z'))+5),{timeout:35000}).toBeLessThan(.02);await p.waitForTimeout(600);await p.screenshot({path:path.join(out,`${prefix}-underwater.png`)});}
finally{await browser.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});}
