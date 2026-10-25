import {materialIds,materials,coilModules,coilCapacity,clipIds,type MaterialId,type CoilModule,type ClipId,type MagnetSource,magnetCards,type MagnetTerminal} from '../data/electromagnetContent';
import {evaluateElectromagnet,isCoil,isMagnetTerminal,magnetConnection,pairKey,type ElectromagnetCircuit} from './electromagnetModel';
import {initialCrane,clipsAt,pickClips,releaseClips,recoverCrane,type CraneState} from './craneState';
export interface MagnetAnswers {materials:string;control:string;turns:string;limit:string;}
export const correctMagnetAnswers:MagnetAnswers={materials:'not-all',control:'current-switch',turns:'controlled-model',limit:'no-energy-claim'};
export type MagnetTrial={kind:'material';id:MaterialId;phase:'positioning'|'lifting'|'result'|'observed'}|{kind:'coil';id:CoilModule;phase:'positioning'|'positioned'|'lifting'|'result'|'observed'|'recorded'|'returning'};
type Action={type:'accept'}|{type:'read';source:MagnetSource}|{type:'predict';id:MaterialId;lifted:boolean}|{type:'startMaterial';id:MaterialId}|{type:'trialArrive'}|{type:'trialResult'}|{type:'observe'}|{type:'recordMaterial';lifted:boolean}|{type:'plan';variable:string;current:string;controls:string}|{type:'core'}|{type:'coil';module:CoilModule}|{type:'connect';a:MagnetTerminal;b:MagnetTerminal}|{type:'check'}|{type:'startCoil'}|{type:'energizeTrial'}|{type:'recordCoil'}|{type:'powerOff'}|{type:'cleanupTrial'}|{type:'cancelTrial'}|{type:'transport';module:CoilModule}|{type:'motion';axis:'position'|'elevation';target:number}|{type:'motionDone'}|{type:'motionHold';fraction:number}|{type:'magnet';on:boolean}|{type:'recover'}|{type:'conclude';answers:MagnetAnswers}|{type:'reflect';text:string};
export type MagnetEvent=(Action&{revision?:number})|{type:'reset'};
export interface ElectromagnetProgress extends ElectromagnetCircuit {
 version:1;mission:'M17-E2';epoch:number;revision:number;accepted:boolean;sources:Record<MagnetSource,boolean>;
 predictions:{id:MaterialId;lifted:boolean}[];observations:{id:MaterialId;prediction:boolean;lifted:boolean}[];observationAttempts:{id:MaterialId;lifted:boolean;correct:boolean}[];
 plans:{variable:string;current:string;controls:string;correct:boolean}[];plan:boolean;wiringAttempts:{a:MagnetTerminal;b:MagnetTerminal;result:string}[];
 trial:MagnetTrial|null;coilRecords:{module:CoilModule;clips:number;currentA:.2}[];transportModule:CoilModule|null;crane:CraneState;
 attempts:(MagnetAnswers&{correct:boolean})[];completed:boolean;reflection:string;reward:0|50;firstCompletedAt:string|null;rewardProof:{at:string;history:Action[]}|null;history:Action[];
}
export const initialElectromagnet=():ElectromagnetProgress=>({version:1,mission:'M17-E2',epoch:0,revision:0,accepted:false,sources:{magnet:false,bima:false,current:false},predictions:[],observations:[],observationAttempts:[],plans:[],plan:false,core:false,coil:null,connections:[],checked:false,sourceOn:false,switchClosed:false,wiringAttempts:[],trial:null,coilRecords:[],transportModule:null,crane:initialCrane(),attempts:[],completed:false,reflection:'',reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const materialsComplete=(p:ElectromagnetProgress)=>materialIds.every(id=>p.observations.some(o=>o.id===id));
export const coilsComplete=(p:ElectromagnetProgress)=>coilModules.every(module=>p.coilRecords.some(o=>o.module===module));
export const magnetAnswersValid=(a:MagnetAnswers)=>a&&Object.entries(correctMagnetAnswers).every(([k,v])=>a[k as keyof MagnetAnswers]===v);
export const predictionFor=(p:ElectromagnetProgress,id:MaterialId)=>p.predictions.filter(x=>x.id===id).at(-1);
export function electromagnetTransition(p:ElectromagnetProgress,e:MagnetEvent,now=()=>new Date().toISOString()):{progress:ElectromagnetProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialElectromagnet(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya M17-E2 diulang; hadiah pertama dan semua misi lain dipertahankan.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Tindakan lama diabaikan. Gunakan keadaan panel terbaru.');
 if(p.history.length>=3000)return fail('Riwayat latihan penuh. Ekspor lalu ulangi episode.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima M17-E2 dari Kak Bima dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti M17-E2 tersimpan.';
 const idle=!p.trial&&!p.crane.motion;
 switch(e.type){
 case'accept':if(p.accepted)return fail('Episode sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(magnetCards,e.source)||p.sources[e.source])return fail('Sumber sudah dibaca atau tidak valid.');n.sources[e.source]=true;break;
 case'predict':if(!materialIds.includes(e.id)||typeof e.lifted!=='boolean'||!p.sources.magnet||p.trial||p.observations.some(o=>o.id===e.id))return fail('Baca buku magnet; prediksi dibuat sebelum pengamatan bahan ini.');n.predictions.push({id:e.id,lifted:e.lifted});break;
 case'startMaterial':if(!idle||!materialIds.includes(e.id)||!predictionFor(p,e.id)||p.observations.some(o=>o.id===e.id)||p.sourceOn)return fail('Simpan prediksi, matikan sumber, dan selesaikan pengamatan yang sedang berjalan.');n.trial={kind:'material',id:e.id,phase:'positioning'};break;
 case'trialArrive':if(p.trial?.phase!=='positioning')return fail('Kepala belum sedang menuju titik uji.');n.trial!.phase=p.trial.kind==='material'?'lifting':'positioned';break;
 case'trialResult':if(p.trial?.phase!=='lifting')return fail('Jalankan pengangkatan dahulu.');n.trial!.phase='result';break;
 case'observe':if(p.trial?.phase!=='result')return fail('Tunggu hasil gerakan dan amati benda 3D dahulu.');n.trial!.phase='observed';break;
 case'recordMaterial':{
  if(p.trial?.kind!=='material'||p.trial.phase!=='observed'||typeof e.lifted!=='boolean')return fail('Prediksi, jalankan magnet, dan amati hasil sebelum mencatat.');
  const id=p.trial.id;ok=e.lifted===materials[id].lifted;n.observationAttempts.push({id,lifted:e.lifted,correct:ok});
  if(ok){n.observations.push({id,prediction:predictionFor(p,id)!.lifted,lifted:e.lifted});n.trial=null;if(materialsComplete(n))n.crane.clips.K1='tray';}
  message=ok?'Pengamatan dicatat. Benda tidak terangkat berarti tidak terangkat pada kondisi pengujian ini.':'Bandingkan posisi benda dengan posisi awalnya. Catatan keliru belum disahkan; amati lagi.';break;}
 case'plan':{
  if(!materialsComplete(p)||!p.sources.bima||!idle||![e.variable,e.current,e.controls].every(x=>typeof x==='string'&&x.length<=60))return fail('Lengkapi pengamatan bahan dan baca catatan Kak Bima.');
  ok=e.variable==='turns'&&e.current==='controlled'&&e.controls==='same';n.plans.push({variable:e.variable,current:e.current,controls:e.controls,correct:ok});n.plan=ok||p.plan;message=ok?'Rencana: ubah lilitan, arus terkontrol tetap, kondisi lain sama.':'Ubah hanya lilitan. Baterai biasa tidak menjamin arus tetap; upaya awal disimpan.';break;}
 case'core':if(!p.plan||p.core||p.sourceOn||!idle)return fail('Pilih rencana dan matikan sumber sebelum memasang inti.');n.core=true;n.checked=false;break;
 case'coil':if(!p.core||!isCoil(e.module)||p.sourceOn||!idle||clipsAt(p.crane,'head').length)return fail('Matikan sumber dan hentikan alat sebelum mengganti modul.');if(p.coil===e.module)return fail('Modul ini sudah terpasang.');n.coil=e.module;if(p.transportModule!==null)n.transportModule=e.module;n.checked=false;break;
 case'connect':{
  if(!p.core||p.coil===null||p.sourceOn||!idle||!isMagnetTerminal(e.a)||!isMagnetTerminal(e.b)||e.a===e.b)return fail('Pasang inti/modul dengan sumber mati; pilih dua terminal berbeda.');
  const result=magnetConnection(e.a,e.b);if(p.connections.some(([a,b])=>pairKey(a,b)===pairKey(e.a,e.b)))return fail('Pasangan sudah terhubung.');n.wiringAttempts.push({a:e.a,b:e.b,result});ok=result==='valid';if(ok){n.connections.push([e.a,e.b]);n.checked=false;}message=ok?'Sambungan dipasang.':result==='short'?'Hubungan langsung I+–I− tidak sah; kabel tidak dipasang.':'Pasangan tidak sesuai lintasan alat; tidak dipasang. Pilih ulang.';break;}
 case'check':if(p.sourceOn||!idle||!evaluateElectromagnet({...p,checked:true}).closed)return fail('Matikan sumber dan lengkapi inti, modul, serta tiga pasangan terminal.');if(p.checked)return fail('Rangkaian sudah diperiksa.');n.checked=true;message='Lintasan lengkap. Sumber arus terkontrol virtual siap dipakai pada 0,2 A.';break;
 case'startCoil':if(!p.plan||!materialsComplete(p)||!idle||p.sourceOn||!p.checked||p.coil===null||p.coilRecords.some(r=>r.module===p.coil)||clipIds.some(id=>p.crane.clips[id]!=='tray'))return fail('Pasang dan periksa modul yang belum diuji saat sumber mati; keenam klip harus di baki.');n.trial={kind:'coil',id:p.coil,phase:'positioning'};break;
 case'energizeTrial':if(p.trial?.kind!=='coil'||p.trial.phase!=='positioned'||!p.checked)return fail('Tunggu kepala berada pada posisi uji dan periksa rangkaian.');n.sourceOn=true;n.switchClosed=true;n.trial!.phase='lifting';break;
 case'recordCoil':if(p.trial?.kind!=='coil'||p.trial.phase!=='observed'||!evaluateElectromagnet(p).active||p.coilRecords.some(r=>r.module===p.trial!.id))return fail('Aktifkan alat, amati pengangkatan, lalu catat hasil satu kali.');n.coilRecords.push({module:p.trial.id,clips:coilCapacity(p.trial.id),currentA:.2});n.trial!.phase='recorded';message='Hasil tercatat. Matikan sumber dan kembalikan klip sebelum mengganti modul.';break;
 case'powerOff':if(!p.sourceOn)return fail('Sumber sudah mati.');n.sourceOn=false;n.switchClosed=false;if(p.trial?.kind==='coil'){if(p.trial.phase==='recorded')n.trial!.phase='returning';else n.trial=null;}else if(p.coil!==null)releaseClips(n.crane,p.coil);break;
 case'cleanupTrial':if(p.trial?.kind!=='coil'||p.trial.phase!=='returning'||p.sourceOn)return fail('Matikan sumber setelah mencatat.');n.trial=null;break;
 case'cancelTrial':if(!p.trial)return fail('Tidak ada pengujian aktif.');n.trial=null;n.sourceOn=false;n.switchClosed=false;message='Pengujian dibatalkan. Hasil belum disahkan tidak dicatat; semua benda kembali.';break;
 case'transport':if(!coilsComplete(p)||!idle||p.sourceOn||!isCoil(e.module)||clipsAt(p.crane,'head').length)return fail('Selesaikan tiga uji; matikan sumber sebelum memilih modul pengangkutan.');n.transportModule=e.module;n.coil=e.module;n.checked=false;message='Modul dipilih dari data uji. Periksa rangkaian, lalu gunakan derek; semua modul boleh dipakai.';break;
 case'motion':if(!coilsComplete(p)||p.transportModule===null||!p.checked||!idle||!['position','elevation'].includes(e.axis)||!Number.isFinite(e.target)||!(e.axis==='position'?[0,.5,1]:[0,1]).includes(e.target))return fail('Pilih modul pengangkutan dan periksa alat sebelum menggerakkan derek.');if(e.axis==='position'&&p.crane.elevation<.99)return fail('Angkat kepala sebelum bergerak ke tempat lain.');if(Math.abs(p.crane[e.axis]-e.target)<.001)return fail('Kepala sudah di tujuan.');n.crane.motion={axis:e.axis,target:e.target};break;
 case'motionDone':if(!p.crane.motion)return fail('Tidak ada gerakan aktif.');n.crane[p.crane.motion.axis]=p.crane.motion.target;n.crane.motion=null;if(evaluateElectromagnet(n).active&&n.coil!==null)pickClips(n.crane,n.coil);break;
 case'motionHold':if(!p.crane.motion||!Number.isFinite(e.fraction)||e.fraction<0||e.fraction>1)return fail('Tidak ada gerakan yang dapat dihentikan.');{const m=p.crane.motion;n.crane[m.axis]=p.crane[m.axis]+(m.target-p.crane[m.axis])*e.fraction;n.crane.motion=null;}break;
 case'magnet':if(!idle||p.transportModule===null||!p.checked||typeof e.on!=='boolean'||e.on===p.sourceOn||!evaluateElectromagnet({...p,sourceOn:true,switchClosed:true}).active)return fail('Pilih dan periksa modul; hentikan gerakan sebelum mengubah magnet.');n.sourceOn=e.on;n.switchClosed=e.on;if(e.on)pickClips(n.crane,p.coil!);else releaseClips(n.crane,p.coil!);break;
 case'recover':{
  const dirty=p.trial||p.crane.motion||p.sourceOn||p.switchClosed||p.crane.position!==0||p.crane.elevation!==1||clipsAt(p.crane,'head').length||clipsAt(p.crane,'recovery').length;
  if(!dirty)return fail('Derek sudah aman.');n.trial=null;n.sourceOn=false;n.switchClosed=false;recoverCrane(n.crane);message='Derek dipulihkan. Muatan belum terkirim kembali ke baki; bukti dan klip dalam penampung tetap ada.';break;}
 case'conclude':if(!materialsComplete(p)||!coilsComplete(p)||clipsAt(p.crane,'bin').length!==6||!idle||p.completed||!e.answers||!Object.keys(correctMagnetAnswers).every(k=>typeof e.answers[k as keyof MagnetAnswers]==='string'&&e.answers[k as keyof MagnetAnswers].length<=60))return fail('Lengkapi empat pengamatan, tiga uji, dan kirim keenam klip sebelum menyimpulkan.');ok=magnetAnswersValid(e.answers);n.attempts.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'M17-E2 selesai · 50 XP pertama. M17 masih Dalam pengembangan.':'Gunakan hasil model, kendali arus, dan batas bukti. Energi belum diukur. Upaya awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};
 return{progress:n,ok,message};
}
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export function parseElectromagnet(raw:unknown):ElectromagnetProgress{
 const bad=()=>{throw new Error('Progres M17-E2 tidak valid: rangkaian, bukti, neraca klip, atau hadiah tidak sesuai.');};
 try{
  if(!raw||typeof raw!=='object')return bad();const p=raw as ElectromagnetProgress;
  if(p.version!==1||p.mission!=='M17-E2'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>3000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();
  if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null||p.rewardProof!==null)return bad();
  const replayActions=(actions:Action[],seed:ElectromagnetProgress)=>{if(!Array.isArray(actions)||actions.length>3000)return bad();let n=seed;for(const e of actions){if(!e||typeof e!=='object'||(e as {type:string}).type==='reset'||Object.hasOwn(e,'revision'))return bad();const r=electromagnetTransition(n,e,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(r.progress===n)return bad();n=r.progress;}return n;};
  if(p.reward===50){if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt)return bad();const award=replayActions(p.rewardProof.history,initialElectromagnet());if(!award.completed||award.history.at(-1)?.type!=='conclude')return bad();}
  let seed=initialElectromagnet();seed.epoch=p.epoch;seed.revision=p.epoch;if(p.epoch>0){seed.reward=p.reward;seed.firstCompletedAt=p.firstCompletedAt;seed.rewardProof=structuredClone(p.rewardProof);}
  const result=replayActions(p.history,seed);if(JSON.stringify(canonical(result))!==JSON.stringify(canonical(p)))return bad();return result;
 }catch{return bad();}
}
export function settleElectromagnet(p:ElectromagnetProgress){const r=electromagnetTransition(p,{type:'recover'});return r.progress;}
export const electromagnetSteps=(p:ElectromagnetProgress)=>[
 {title:'Terima Derek Elektromagnet',detail:'Pilih M17-E2 dan temui Kak Bima.',place:'bima',done:p.accepted},
 {title:'Baca buku dan catatan',detail:'Tidak semua logam terangkat; bandingkan dengan kondisi sama.',place:p.sources.magnet?'magnetNotes':'magnetBook',done:p.sources.magnet&&p.sources.bima},
 {title:'Prediksi dan amati empat bahan',detail:`${p.observations.length}/4 pengamatan sah.`,place:'materialBench',done:materialsComplete(p)},
 {title:'Rencanakan dan rakit alat',detail:'Sumber mati; inti, modul, terminal, lalu periksa.',place:'magnetRack',done:p.plan&&p.core&&p.connections.length===3},
 {title:'Uji 20, 40, dan 60 lilitan',detail:`${p.coilRecords.length}/3 hasil; arus dijaga tetap.`,place:'coilStation',done:coilsComplete(p)},
 {title:'Pindahkan enam klip',detail:`${clipsAt(p.crane,'bin').length}/6 terkirim; ${p.crane.deliveries.length} pengangkutan berhasil.`,place:'miniCrane',done:clipsAt(p.crane,'bin').length===6},
 {title:'Simpulkan berdasarkan bukti',detail:'M17 tetap Dalam pengembangan; tidak menilai energi.',place:'bima',done:p.completed},
];
