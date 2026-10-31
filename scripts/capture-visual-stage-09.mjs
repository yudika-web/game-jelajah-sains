// Comparable production capture. Only existing UI imports, map navigation and camera controls.
import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createStaticServer} from './local/static-server.mjs';
import {APP_ROOT} from './local/common.mjs';
const phase=process.env.CAPTURE_PHASE||'after',selected=(process.env.CAPTURE_REGIONS||'garden,rimba,river,workshop,geopark,town,coast,space').split(',');
const out=path.join(APP_ROOT,'docs/evidence/visual-stage-09');await mkdir(out,{recursive:true});
const root=process.env.JELAJAH_BASELINE_ROOT||APP_ROOT;
const {server}=await createStaticServer({root:path.join(root,'dist'),appRoot:root});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const routes={garden:['gardenBook','waterTank'],rimba:['capacityBook','damar'],river:['fishBook','lestari'],workshop:['circuitBook','bima'],geopark:['geoBook','raka'],town:['book','nara'],coast:['coastBook','coastLestari'],space:['spaceBook','spaceNara']};
const missions={garden:'M14',rimba:'W03-LOG01',river:'S13',workshop:'M17-E1',geopark:'M13',town:'M01',coast:'S16',space:'M07'};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const region of selected){
 const c=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:path.join(out,'.video'),size:{width:1280,height:800}}}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(origin);await expect(p.locator('#coin-wallet')).toBeEnabled();await p.locator('#input-mode').selectOption('ifp');await p.locator('#start').click();
 const backup=JSON.parse(await readFile(path.join(APP_ROOT,'tests/fixtures/coin-wallet-stage7.json'),'utf8'));backup.version=18;delete backup.economy;backup.world={region,activeMission:missions[region]};
 await p.locator('#settings').click();await p.locator('#import-file').setInputFiles({name:'comparison-v18.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(p.locator('#settings-feedback')).toContainText('Cadangan valid');await p.locator('#close-panel').click();await expect(p.locator('#world')).toHaveAttribute('data-region',region);await expect(p.locator('#coin-notice')).toBeHidden({timeout:12000});await p.waitForTimeout(1200);
 const samples=await p.evaluate(async()=>{const samples=[];for(let j=0;j<3;j++){const deltas=[];await new Promise(resolve=>{let prev=0,start=0;function tick(t){start||=t;if(prev)deltas.push(t-prev);prev=t;if(t-start<1800)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});deltas.sort((a,b)=>a-b);samples.push({frames:deltas.length,medianMs:deltas[Math.floor(deltas.length/2)],p95Ms:deltas[Math.floor(deltas.length*.95)]});}return samples;});
 await p.screenshot({path:path.join(out,`${phase}-${region}-spawn.png`)});
 const metrics=await p.locator('#world').evaluate(c=>({...c.dataset}));
 for(let i=0;i<2;i++){await p.locator('#map').click();await p.locator(`[data-destination=${routes[region][i]}]`).click();await expect(p.locator('#world')).toHaveAttribute('data-moving','false',{timeout:45000});await expect(p.locator('#panel')).toBeVisible({timeout:45000});await p.locator('#close-panel').click();await p.waitForTimeout(900);await p.screenshot({path:path.join(out,`${phase}-${region}-route-${i+1}.png`)});}
 for(let i=0;i<3;i++){await p.locator('#rotate-left').click();await p.waitForTimeout(650);}await p.locator('#rotate-right').click();await p.waitForTimeout(500);
 const video=p.video();await c.close();await video.saveAs(path.join(out,`${phase}-${region}.webm`));
 await writeFile(path.join(out,`${phase}-${region}.json`),JSON.stringify({region,phase,viewport:{width:1280,height:800},renderer:'Chromium Linux SwiftShader',physicalDevice:false,samples,metrics,errors},null,2));if(errors.length)throw Error(errors.join('\n'));console.log(`${phase} ${region}: ${metrics.drawCalls} draws, ${metrics.triangles} triangles, ${metrics.regionGeometryCount} region geometries`);
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
