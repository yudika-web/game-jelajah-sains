import {readFile,writeFile} from 'node:fs/promises';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
const dir=new URL('../docs/evidence/visual-stage-09/',import.meta.url),rows=[];
const median=a=>a.toSorted((a,b)=>a-b)[Math.floor(a.length/2)];
for(const id of ['garden','rimba','river','workshop','geopark','town','coast','space']){
 const row={region:id};for(const phase of ['perf-before','perf-after','perf-low']){const x=JSON.parse(await readFile(new URL(`${phase}-${id}.json`,dir),'utf8'));row[phase]={medianMs:median(x.samples.map(s=>s.medianMs)),p95Ms:median(x.samples.map(s=>s.p95Ms)),drawCalls:Number(x.metrics.drawCalls),triangles:Number(x.metrics.triangles),pixelRatio:Number(x.metrics.pixelRatio),cameraYaw:x.metrics.cameraYaw,quality:x.metrics.quality};}rows.push(row);
}
const report={physicalDevice:false,renderer:'Chromium Linux ANGLE SwiftShader; software rasterization',viewport:{width:1280,height:800},conditions:'Same fixture, spawn, camera yaw 0.25, Normal / DPR 1; three 1.8s RAF samples per region; no video, screenshot, test or build during measurement; baseline and current run sequentially. Low is current code only.',baselineCommit:'d89eede17bae1890c79bb64b5357d06f14ac4bb9',node:process.version,chromium:execFileSync('/usr/bin/chromium',['--version'],{encoding:'utf8'}).trim(),cpu:os.cpus()[0].model,logicalCPUs:os.availableParallelism(),rows};
await writeFile(new URL('performance-comparison.json',dir),JSON.stringify(report,null,2)+'\n');
console.log('| Wilayah | Normal sebelum median / p95 ms | Normal setelah median / p95 ms | Draw sebelum → setelah | Segitiga sebelum → setelah | Rendah setelah median / p95 ms (draw) |\n| --- | --- | --- | --- | --- | --- |');
for(const r of rows){const a=r['perf-before'],b=r['perf-after'],l=r['perf-low'],f=x=>`${x.medianMs.toFixed(1)} / ${x.p95Ms.toFixed(1)}`;console.log(`| ${r.region} | ${f(a)} | ${f(b)} | ${a.drawCalls} → ${b.drawCalls} | ${a.triangles} → ${b.triangles} | ${f(l)} (${l.drawCalls}) |`);}
