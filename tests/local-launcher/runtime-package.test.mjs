import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const zip=path.resolve('unduhan/JS-Windows.zip');

test('ready ZIP has bounded ASCII paths, valid CRC and manifest, real CRLF launchers and no development evidence',async()=>{
 const script=`import zipfile,json,hashlib,sys,ntpath
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 names=z.namelist();assert len(names)>10
 assert all(n.startswith('JS/') and len(n)<=64 and n.isascii() and '..' not in n.split('/') for n in names)
 assert all(not any(p in n.split('/') for p in ['docs','tests','node_modules','.git']) for n in names)
 for n in ['JALANKAN_JELAJAH_SAINS.bat','DIAGNOSTIK_JELAJAH_SAINS.bat']:
  b=z.read('JS/'+n);assert b.count(b'\\r\\n')==b.count(b'\\n')>0
 m=json.loads(z.read('JS/PAKET.json'))
 for n,h in m['files'].items():assert hashlib.sha256(z.read('JS/'+n)).hexdigest()==h,n
 assert set(names)=={'JS/'+n for n in m['files']}|{'JS/PAKET.json'}
 longest=max(names,key=len)
 sample=ntpath.join(r'C:\\Users\\Siswa\\Downloads\\JS-Windows',longest.replace('/',chr(92)))
 assert len(sample)<120
 print(json.dumps({'members':len(names),'maxMember':len(longest),'sampleWindowsPathLength':len(sample)}))
`;
 const result=spawnSync('python3',['-c',script,zip],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.ok(JSON.parse(result.stdout).maxMember<=64);
});

test('extracted ready package launches and diagnoses without npm or node_modules from a Unicode/spaced folder',async()=>{
 const folder=await mkdtemp(path.join(tmpdir(),'Kelas IPA é & siswa '));
 try{
  const extract=spawnSync('python3',['-c','import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',zip,folder],{encoding:'utf8'});assert.equal(extract.status,0,extract.stderr);
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const root=path.join(folder,'JS');
  const script=`import assert from 'node:assert/strict';import {existsSync} from 'node:fs';
import {launch} from ${JSON.stringify(pathToFileURL(path.join(root,'scripts/local/launch.mjs')).href)};
import {diagnoseRuntime} from ${JSON.stringify(pathToFileURL(path.join(root,'scripts/local/diagnose.mjs')).href)};
const options={port:${port},browser:false,log:{file:'test-only',write(){}}};
const first=await launch(options);
try{assert.equal(first.reused,false);assert.equal((await launch(options)).reused,true);
assert.equal(await diagnoseRuntime({...options}),true);
for(const page of ['/','/character.html'])assert.equal((await fetch('http://localhost:${port}'+page)).status,200);
assert.equal(existsSync('node_modules'),false);
}finally{await new Promise(r=>{first.server.close(r);first.server.closeAllConnections();});}`;
  const result=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:folder,env:{...process.env,PATH:''},encoding:'utf8',timeout:15000});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/npm.*tidak diperlukan/);assert.match(result.stdout,/Server aktif/);
 }finally{await rm(folder,{recursive:true,force:true});}
});
