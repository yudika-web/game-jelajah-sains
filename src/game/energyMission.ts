import {energyCards,energyConfig,energySources,sourceConditions,energyPairs,energyPorts,type EnergySource,type SourceCondition,type EnergyCard,type EnergyComponent,type EnergyPort} from '../data/energyContent';
import {sourcePower,simulateInterval,validEnergyPlan,type EnergyPlan,type IntervalEnergy} from './energyModel';
export const correctEnergyAnswers={conditions:'depends',battery:'stores',combination:'scenario',limit:'not-universal'} as const;
export interface EnergyAnswers {conditions:string;battery:string;combination:string;limit:string;}
export type EnergyTrial={kind:'source';source:EnergySource;condition:SourceCondition;phase:'running'|'preview'|'observed'}|{kind:'interval';index:number;phase:'running'|'preview'|'observed'};
export interface EnergyAttempt {plan:EnergyPlan[];records:IntervalEnergy[];}
type Action={type:'accept'}|{type:'read';card:EnergyCard}|{type:'predict';source:EnergySource;condition:SourceCondition;watts:number}|{type:'startSource';source:EnergySource;condition:SourceCondition}|{type:'finishTrial'}|{type:'observe'}|{type:'recordSource'}|{type:'cancel'}|{type:'plan';rows:EnergyPlan[]}|{type:'connect';a:EnergyPort;b:EnergyPort}|{type:'disconnect';component:EnergyComponent}|{type:'check'}|{type:'supply';on:boolean}|{type:'startInterval'}|{type:'recordInterval'}|{type:'retry'}|{type:'conclude';answers:EnergyAnswers}|{type:'reflect';text:string};
export type EnergyEvent=(Action&{revision?:number})|{type:'reset'};
export interface EnergyProgress {version:1;mission:'M17-E3';epoch:number;revision:number;accepted:boolean;sources:Record<EnergyCard,boolean>;predictions:{source:EnergySource;condition:SourceCondition;watts:number}[];records:{source:EnergySource;condition:SourceCondition;watts:number;predictionW:number}[];connections:EnergyComponent[];checked:boolean;supplyOn:boolean;trial:EnergyTrial|null;batteryMWh:number;attempts:EnergyAttempt[];answers:(EnergyAnswers&{correct:boolean})[];completed:boolean;reflection:string;reward:0|50;firstCompletedAt:string|null;rewardProof:{at:string;history:Action[]}|null;history:Action[];}
export const initialEnergy=():EnergyProgress=>({version:1,mission:'M17-E3',epoch:0,revision:0,accepted:false,sources:{power:false,solar:false,wind:false,battery:false,needs:false},predictions:[],records:[],connections:[],checked:false,supplyOn:false,trial:null,batteryMWh:2000,attempts:[],answers:[],completed:false,reflection:'',reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const sourceTestsComplete=(p:EnergyProgress)=>energySources.every(s=>sourceConditions[s].every(c=>p.records.some(r=>r.source===s&&r.condition===c)));
export const currentEnergyAttempt=(p:EnergyProgress)=>p.attempts.at(-1);
export const successfulEnergyPlan=(p:EnergyProgress)=>p.attempts.some(a=>a.records.length===3&&a.records.every(r=>r.unmetMWh===0));
export const lastEnergyPrediction=(p:EnergyProgress,s:EnergySource,c:SourceCondition)=>p.predictions.filter(r=>r.source===s&&r.condition===c).at(-1);
export const energyAnswersValid=(a:EnergyAnswers)=>Object.entries(correctEnergyAnswers).every(([k,v])=>a[k as keyof EnergyAnswers]===v);
export function energyTransition(p:EnergyProgress,e:EnergyEvent,now=()=>new Date().toISOString()):{progress:EnergyProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialEnergy(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya M17-E3 diulang; hadiah pertama dan misi lain tetap ada.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Tindakan lama diabaikan.');
 if(p.history.length>=3000)return fail('Riwayat penuh; ekspor lalu ulangi episode.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima M17-E3 dari Kak Bima dahulu.');
 const n=structuredClone(p),a=currentEnergyAttempt(p);let ok=true,message='Bukti M17-E3 tersimpan.';
 switch(e.type){
 case'accept':if(p.accepted)return fail('Episode sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(energyCards,e.card)||p.sources[e.card])return fail('Kartu sudah dibaca atau tidak valid.');n.sources[e.card]=true;break;
 case'predict':if(!p.sources.power||!p.sources.needs||p.trial||!energySources.includes(e.source)||!sourceConditions[e.source].includes(e.condition as never)||!Number.isSafeInteger(e.watts)||e.watts<0||e.watts>12||p.records.some(r=>r.source===e.source&&r.condition===e.condition))return fail('Baca buku dan kebutuhan, lalu prediksi sebelum pengujian.');n.predictions.push({source:e.source,condition:e.condition,watts:e.watts});break;
 case'startSource':if(p.trial||p.supplyOn||!lastEnergyPrediction(p,e.source,e.condition)||p.records.some(r=>r.source===e.source&&r.condition===e.condition))return fail('Matikan suplai dan simpan prediksi untuk kondisi yang belum diuji.');sourcePower(e.source,e.condition);n.trial={kind:'source',source:e.source,condition:e.condition,phase:'running'};break;
 case'finishTrial':if(p.trial?.phase!=='running')return fail('Simulasi belum berjalan.');n.trial!.phase='preview';break;
 case'observe':if(p.trial?.phase!=='preview')return fail('Tunggu indikator dan amati hasil dahulu.');n.trial!.phase='observed';break;
 case'recordSource':if(p.trial?.kind!=='source'||p.trial.phase!=='observed')return fail('Jalankan dan amati sebelum mencatat.');n.records.push({source:p.trial.source,condition:p.trial.condition,watts:sourcePower(p.trial.source,p.trial.condition),predictionW:lastEnergyPrediction(p,p.trial.source,p.trial.condition)!.watts});n.trial=null;message='Daya tercatat. Baterai latihan tidak berubah.';break;
 case'cancel':if(!p.trial)return fail('Tidak ada animasi atau pratinjau aktif.');n.trial=null;message='Hasil belum disahkan dibatalkan; energi permanen tetap.';break;
 case'plan':if(!sourceTestsComplete(p)||p.supplyOn||p.trial||!Array.isArray(e.rows)||e.rows.length!==3||!e.rows.every(validEnergyPlan)||a&&a.records.length>0)return fail('Lengkapi enam uji dan matikan suplai. Untuk mengubah rencana yang sudah dicatat, pilih Ulangi Uji Rencana.');if(a)n.attempts[n.attempts.length-1].plan=structuredClone(e.rows);else n.attempts.push({plan:structuredClone(e.rows),records:[]});n.checked=false;break;
 case'connect':{
  if(!a||p.supplyOn||p.trial||!Object.hasOwn(energyPorts,e.a)||!Object.hasOwn(energyPorts,e.b)||e.a===e.b)return fail('Simpan rencana dan matikan suplai sebelum menghubungkan port.');
  const pair=energyPairs.find(x=>x.a===e.a&&x.b===e.b||x.a===e.b&&x.b===e.a);if(!pair)return fail('Pasangan tidak cocok. Gunakan port DC teratur berlabel; sambungan tidak dipasang.');if(p.connections.includes(pair.component))return fail('Komponen sudah terhubung.');n.connections.push(pair.component);n.checked=false;break;}
 case'disconnect':if(p.supplyOn||p.trial||!p.connections.includes(e.component))return fail('Matikan suplai sebelum melepas komponen.');n.connections=n.connections.filter(c=>c!==e.component);n.checked=false;break;
 case'check':if(p.supplyOn||p.trial||!a||!p.connections.includes('load')||!p.connections.some(c=>c!=='load')||p.checked)return fail('Hubungkan layanan dan setidaknya satu sumber/penyimpan dengan suplai mati.');n.checked=true;message='Port sesuai bus DC teratur; jalur pergi/kembali tercakup pada konektor berpasangan.';break;
 case'supply':if(typeof e.on!=='boolean'||e.on===p.supplyOn||e.on&&(!p.checked||p.trial))return fail('Periksa sambungan sebelum mengaktifkan suplai.');n.supplyOn=e.on;if(!e.on)n.trial=null;break;
 case'startInterval':if(p.trial||!p.supplyOn||!p.checked||!p.connections.includes('load')||!a||a.records.length>=3)return fail('Aktifkan sistem yang diperiksa dan jalankan satu interval berikutnya.');n.trial={kind:'interval',index:a.records.length,phase:'running'};break;
 case'recordInterval':if(p.trial?.kind!=='interval'||p.trial.phase!=='observed'||!p.supplyOn||!a||p.trial.index!==a.records.length)return fail('Amati pratinjau interval berikutnya sebelum mengesahkan.');{const r=simulateInterval(p.trial.index,a.plan[p.trial.index],p.connections,p.batteryMWh);n.attempts[n.attempts.length-1].records.push(r);n.batteryMWh=r.finalMWh;n.trial=null;message=r.unmetMWh?'Hasil dicatat; ada kebutuhan belum terpenuhi. Tinjau rencana lalu ulangi dari 2 Wh.':'Interval disahkan satu kali; neraca energi tersimpan.';}break;
 case'retry':if(!a||p.supplyOn||p.trial)return fail('Matikan suplai dan batalkan pratinjau sebelum mengulang.');n.attempts.push({plan:structuredClone(a.plan),records:[]});n.batteryMWh=energyConfig.initialMWh;n.checked=false;message='Percobaan baru dimulai tepat dari 2 Wh, bukan menambah 2 Wh. Hasil percobaan sebelumnya tetap ada.';break;
 case'conclude':if(p.completed||!Object.values(p.sources).every(Boolean)||!sourceTestsComplete(p)||!successfulEnergyPlan(p)||p.trial||!e.answers||!Object.keys(correctEnergyAnswers).every(k=>typeof e.answers[k as keyof EnergyAnswers]==='string'&&e.answers[k as keyof EnergyAnswers].length<=60))return fail('Lengkapi materi, enam uji, dan tiga interval terpenuhi dalam satu percobaan.');ok=energyAnswersValid(e.answers);n.answers.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'M17-E3 selesai · hadiah pertama 50 XP.':'Gunakan bukti kondisi, penyimpanan, kombinasi, dan batas model. Upaya awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};return{progress:n,ok,message};
}
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export function parseEnergy(raw:unknown):EnergyProgress{
 const bad=():never=>{throw Error('Progres M17-E3 tidak valid: bukti, sambungan, neraca energi, atau hadiah tidak sesuai.');};
 try{if(!raw||typeof raw!=='object')return bad();const p=raw as EnergyProgress;if(p.version!==1||p.mission!=='M17-E3'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>3000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null||p.rewardProof!==null)return bad();
 const replay=(history:Action[],seed:EnergyProgress)=>{if(!Array.isArray(history)||history.length>3000)return bad();let n=seed;for(const e of history){if(!e||typeof e!=='object'||(e as {type:string}).type==='reset'||Object.hasOwn(e,'revision'))return bad();const r=energyTransition(n,e,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(r.progress===n)return bad();n=r.progress;}return n;};
 if(p.reward===50){if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt)return bad();const award=replay(p.rewardProof.history,initialEnergy());if(!award.completed||award.history.at(-1)?.type!=='conclude')return bad();}
 const seed=initialEnergy();seed.epoch=p.epoch;seed.revision=p.epoch;if(p.epoch>0){seed.reward=p.reward;seed.firstCompletedAt=p.firstCompletedAt;seed.rewardProof=structuredClone(p.rewardProof);}const result=replay(p.history,seed);if(JSON.stringify(canonical(result))!==JSON.stringify(canonical(p)))return bad();return result;
 }catch{return bad();}
}
export function settleEnergy(p:EnergyProgress){let n=p;if(n.trial)n=energyTransition(n,{type:'cancel'}).progress;if(n.supplyOn)n=energyTransition(n,{type:'supply',on:false}).progress;return n;}
export const energySteps=(p:EnergyProgress)=>[
 {title:'Terima Energi untuk Pos Riset',detail:'Temui Kak Bima; alat E3 terpisah dari episode lama.',place:'bima',done:p.accepted},
 {title:'Baca buku dan kebutuhan pos',detail:'Daya, energi, sumber, dan penyimpan.',place:p.sources.needs?'energyBook':'energyNotes',done:Object.values(p.sources).every(Boolean)},
 {title:'Uji enam kondisi sumber',detail:`${p.records.length}/6 hasil sah; baterai tidak diisi oleh tester.`,place:p.records.filter(r=>r.source==='solar').length<3?'solarArray':'windTurbine',done:sourceTestsComplete(p)},
 {title:'Susun dan hubungkan rencana',detail:'Tiga interval; suplai mati saat merakit.',place:'energyLink',done:!!currentEnergyAttempt(p)&&p.checked},
 {title:'Catat tiga interval terpenuhi',detail:`${currentEnergyAttempt(p)?.records.length??0}/3 interval pada percobaan saat ini.`,place:'energyService',done:successfulEnergyPlan(p)},
 {title:'Simpulkan berdasarkan neraca',detail:'Tidak ada sistem terbaik untuk semua tempat.',place:'bima',done:p.completed},
];
export function intervalPreview(p:EnergyProgress){const a=currentEnergyAttempt(p);return p.trial?.kind==='interval'&&a?simulateInterval(p.trial.index,a.plan[p.trial.index],p.connections,p.batteryMWh):null;}
