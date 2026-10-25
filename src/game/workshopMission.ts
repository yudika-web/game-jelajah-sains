import { workshopCards, hypothesisLabels, type WorkshopSource, type CircuitHypothesis, type Terminal } from '../data/workshopContent';
import { evaluateCircuit, connectionResult, isTerminal, type CircuitState } from './circuitModel';
export interface CircuitAnswers { cause:string; evidence:string; limit:string; }
export const correctCircuitAnswers:CircuitAnswers = { cause:'broken-path', evidence:'before-after', limit:'virtual-3v' };
export type CircuitComponent = 'source'|'switch'|'wire'|'lamp';
type Action = {type:'accept'}|{type:'read';source:WorkshopSource}|{type:'hypothesis';choice:CircuitHypothesis}|{type:'inspect';component:CircuitComponent}|{type:'test';stage:'before'|'after'}|{type:'isolate'}|{type:'continuity'}|{type:'takeWire'}|{type:'repair';a:Terminal;b:Terminal}|{type:'reconnect'}|{type:'switch';closed:boolean}|{type:'observe'}|{type:'conclude';answers:CircuitAnswers}|{type:'reflect';text:string};
export type WorkshopEvent = (Action & {revision?:number})|{type:'reset'};
export interface WorkshopProgress extends CircuitState {
 version:1; mission:'M17-E1'; epoch:number; revision:number; accepted:boolean;
 sources:Record<WorkshopSource,boolean>; hypotheses:CircuitHypothesis[];
 inspected:Record<CircuitComponent,boolean>; continuity:boolean; spareWire:boolean;
 tests:{before:{lampOn:false;voltage:3}|null;after:{lampOn:true;voltage:3}|null};
 observed:boolean; connections:[Terminal,Terminal][]; wiringAttempts:{a:Terminal;b:Terminal;result:'correct'|'short'|'wrong'}[];
 attempts:(CircuitAnswers&{correct:boolean})[]; completed:boolean; reflection:string; reward:0|50; firstCompletedAt:string|null; rewardProof:{at:string;history:Action[]}|null; history:Action[];
}
export const initialWorkshop=():WorkshopProgress=>({version:1,mission:'M17-E1',epoch:0,revision:0,accepted:false,sources:{loop:false,switch:false,inspect:false,notes:false},hypotheses:[],inspected:{source:false,switch:false,wire:false,lamp:false},continuity:false,spareWire:false,sourceConnected:true,switchClosed:true,repaired:false,tests:{before:null,after:null},observed:false,connections:[],wiringAttempts:[],attempts:[],completed:false,reflection:'',reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const readyToRepair=(p:WorkshopProgress)=>p.continuity&&Object.values(p.inspected).every(Boolean)&&!!p.tests.before;
export const validCircuitAnswers=(a:CircuitAnswers)=>!!a&&Object.entries(correctCircuitAnswers).every(([k,v])=>a[k as keyof CircuitAnswers]===v);
const knownAnswers=(a:CircuitAnswers)=>a&&['cause','evidence','limit'].every(k=>typeof a[k as keyof CircuitAnswers]==='string'&&a[k as keyof CircuitAnswers].length<=60);
export function workshopTransition(p:WorkshopProgress,e:WorkshopEvent,now=()=>new Date().toISOString()):{progress:WorkshopProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialWorkshop(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya M17-E1 diulang. Misi lain dan riwayat hadiah pertama tetap ada.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Tindakan lama diabaikan. Buka kembali panel untuk keadaan terbaru.');
 if(p.history.length>=2000)return fail('Riwayat latihan penuh. Ekspor jurnal lalu ulangi episode.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima M17-E1 dari Kak Bima dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti M17-E1 tersimpan.';
 const prepared=p.sources.loop&&p.sources.notes&&p.hypotheses.length>0;
 switch(e.type){
 case'accept':if(p.accepted)return fail('Episode sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(workshopCards,e.source)||p.sources[e.source])return fail('Sumber sudah dicatat atau tidak valid.');n.sources[e.source]=true;break;
 case'hypothesis':if(!p.sources.loop||!p.sources.notes||!Object.hasOwn(hypothesisLabels,e.choice))return fail('Baca buku dan catatan, lalu pilih dugaan.');if(p.completed)return fail('Episode sudah disimpulkan.');n.hypotheses.push(e.choice);message='Dugaan dicatat, belum menjadi hasil pemeriksaan.';break;
 case'inspect':
  if(!prepared||!Object.hasOwn(p.inspected,e.component)||p.inspected[e.component])return fail('Baca sumber dan catat dugaan; pemeriksaan yang sama tidak perlu diulang.');
  if(e.component==='lamp'&&(p.sourceConnected||p.switchClosed))return fail('Buka sakelar dan lepaskan sumber sebelum uji komponen lampu virtual.');
  n.inspected[e.component]=true;message=e.component==='source'?'Sumber model terukur 3 V.':e.component==='switch'?`Sakelar ${p.switchClosed?'tertutup':'terbuka'}.`:e.component==='wire'?'Terlihat celah pada jalur S2–L1. Belum menjadi hasil kontinuitas.':'Lampu 3 V berfungsi pada alat uji komponen virtual terpisah.';break;
 case'test':
  if(!prepared||!['before','after'].includes(e.stage)||p.tests[e.stage])return fail('Catat dugaan dahulu; hasil uji ini sudah ada atau tidak valid.');
  if(!p.sourceConnected||!p.switchClosed)return fail('Uji fungsi memerlukan sumber terhubung dan sakelar tertutup.');
  if(e.stage==='before'){if(p.repaired)return fail('Uji awal harus berasal dari kabel yang belum diperbaiki.');n.tests.before={lampOn:false,voltage:3};message='Uji awal: sumber 3 V, sakelar tertutup, lampu mati.';}
  else{if(!p.repaired||!readyToRepair(p)||!evaluateCircuit(p).lampOn)return fail('Lengkapi pemeriksaan dan sambungan, lalu tutup sakelar.');n.tests.after={lampOn:true,voltage:3};message='Uji sesudah: jalur lengkap, sumber 3 V, lampu menyala.';}break;
 case'isolate':if(!prepared||!p.tests.before||!p.inspected.source||!p.inspected.switch||!p.inspected.wire)return fail('Catat uji awal dan pemeriksaan sumber, sakelar, serta kabel dahulu.');if(!p.sourceConnected&&!p.switchClosed)return fail('Sumber sudah dilepas dan sakelar terbuka.');n.switchClosed=false;n.sourceConnected=false;message='Sakelar dibuka dan sumber dilepas. Pemeriksaan kontinuitas kini tersedia.';break;
 case'continuity':if(!prepared||p.sourceConnected||p.switchClosed||!p.inspected.wire||p.repaired||p.continuity)return fail('Kontinuitas hanya diuji pada kabel awal dengan sumber dilepas dan sakelar terbuka.');n.continuity=true;message='Kontinuitas S2–L1: terputus. Jalur B+–S1 dan L2–B− lengkap.';break;
 case'takeWire':if(!readyToRepair(p)||p.spareWire||p.repaired)return fail('Lengkapi pemeriksaan dan bukti kontinuitas sebelum mengambil kabel.');n.spareWire=true;break;
 case'repair':{
  if(!readyToRepair(p)||!p.spareWire||p.repaired||p.sourceConnected||p.switchClosed||!isTerminal(e.a)||!isTerminal(e.b)||e.a===e.b)return fail('Lepaskan sumber, lengkapi bukti, dan ambil kabel sebelum memilih dua terminal berbeda.');
  const result=connectionResult(e.a,e.b);n.wiringAttempts.push({a:e.a,b:e.b,result});ok=result==='correct';
  if(ok){n.repaired=true;n.spareWire=false;n.connections.push([e.a,e.b]);message='Kabel pengganti terpasang pada S2–L1. Sumber masih dilepas.';}
  else message=result==='short'?'B+ ke B− adalah hubungan langsung sumber dan tidak sah pada model ini. Sambungan tidak dipasang.':'Pasangan itu tidak menjembatani lokasi terputus yang diperiksa. Sambungan tidak dipasang; pilih ulang atau batalkan.';break;}
 case'reconnect':if(!p.repaired||!readyToRepair(p)||p.sourceConnected||p.switchClosed)return fail('Pasang kabel sah dahulu dan pertahankan sakelar terbuka sebelum menyambungkan sumber.');n.sourceConnected=true;break;
 case'switch':if(typeof e.closed!=='boolean'||p.switchClosed===e.closed||!p.repaired||!p.sourceConnected)return fail('Perbaiki kabel dan sambungkan sumber dahulu.');n.switchClosed=e.closed;message=e.closed?'Sakelar tertutup; amati lampu dari dunia 3D.':'Sakelar terbuka; lampu mati. Bukti uji yang sudah dicatat tetap ada.';break;
 case'observe':if(!p.tests.after||!evaluateCircuit(p).lampOn||p.observed)return fail('Jalankan uji sesudah lalu amati lampu yang sedang menyala.');n.observed=true;break;
 case'conclude':if(!p.observed||!p.tests.after||!p.repaired||!readyToRepair(p)||p.completed||!knownAnswers(e.answers))return fail('Lengkapi bukti pemeriksaan, perbaikan, uji sesudah, dan pengamatan lampu.');ok=validCircuitAnswers(e.answers);n.attempts.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'M17-E1 selesai · 50 XP pertama.':'Periksa bukti jalur terputus dan uji sebelum/sesudah. Sumber 3 V tetap berfungsi; batasi kesimpulan pada model ini. Upaya awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};
 return{progress:n,ok,message};
}
export function parseWorkshop(raw:unknown):WorkshopProgress {
 const bad=()=>{throw new Error('Progres M17-E1 tidak valid: urutan bukti, rangkaian, atau hadiah tidak sesuai.');};
 try {
  if(!raw||typeof raw!=='object')return bad();const p=raw as WorkshopProgress;
  if(p.version!==1||p.mission!=='M17-E1'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>2000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();
  if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null)return bad();
  if(p.reward===0&&p.rewardProof!==null)return bad();
  if(p.reward===50){
    if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt||!Array.isArray(p.rewardProof.history)||p.rewardProof.history.length>2000)return bad();
    let award=initialWorkshop();
    for(const action of p.rewardProof.history){if(!action||typeof action!=='object'||(action as {type:string}).type==='reset'||Object.hasOwn(action,'revision'))return bad();const r=workshopTransition(award,action,()=>p.firstCompletedAt!);if(r.progress===award)return bad();award=r.progress;}
    if(!award.completed||award.reward!==50||award.history.at(-1)?.type!=='conclude')return bad();
  }
  let replay=initialWorkshop();replay.epoch=p.epoch;replay.revision=p.epoch;
  if(p.epoch>0){replay.reward=p.reward;replay.firstCompletedAt=p.firstCompletedAt;replay.rewardProof=structuredClone(p.rewardProof);}
  for(const action of p.history){if(!action||typeof action!=='object'||(action as {type:string}).type==='reset'||Object.hasOwn(action,'revision'))return bad();const result=workshopTransition(replay,action,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(result.progress===replay)return bad();replay=result.progress;}
  const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
  if(JSON.stringify(canonical(replay))!==JSON.stringify(canonical(p)))return bad();return structuredClone(replay);
 } catch {return bad();}
}
export const workshopSteps=(p:WorkshopProgress)=>[
 {title:'Terima episode M17-E1',detail:'Temui Kak Bima untuk episode rangkaian.',place:'bima',done:p.accepted},
 {title:'Baca buku dan catatan gangguan',detail:'Kenali lintasan pergi dan kembali.',place:p.sources.loop?'faultNotes':'circuitBook',done:p.sources.loop&&p.sources.notes},
 {title:'Catat dugaan awal',detail:'Dugaan belum menjadi bukti.',place:'bima',done:p.hypotheses.length>0},
 {title:'Periksa dan catat uji awal',detail:'Periksa sumber, sakelar, kabel; catat lampu sebelum perbaikan.',place:!p.inspected.source?'circuitSource':!p.inspected.switch?'circuitSwitch':!p.inspected.wire?'circuitWire':'researchLamp',done:!!p.tests.before&&p.inspected.source&&p.inspected.switch&&p.inspected.wire},
 {title:'Lepaskan sumber; lengkapi pemeriksaan',detail:'Kontinuitas hanya tanpa sumber. Uji lampu di alat virtual terpisah.',place:p.sourceConnected?'circuitSource':!p.continuity?'circuitWire':'inspectionBench',done:readyToRepair(p)},
 {title:'Ambil dan pasang kabel pengganti',detail:'Pilih terminal berurutan atau daftar pasangan.',place:p.spareWire?'circuitBoard':'componentRack',done:p.repaired},
 {title:'Sambungkan, tutup sakelar, uji',detail:'Amati dan catat nyala lampu pos.',place:!p.sourceConnected?'circuitSource':!p.switchClosed?'circuitSwitch':'researchLamp',done:p.observed},
 {title:'Simpulkan bersama Kak Bima',detail:'Bukti sebelum/sesudah dan batas model.',place:'bima',done:p.completed},
];
