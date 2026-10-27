import {solidModules,solidCards,correctSolidAnswers,type SolidModule,type SolidSource,type SolidAnswers} from '../data/solidContent';
import {solidResult,type SolidResult} from './solidModel';
type Action={type:'accept'}|{type:'read';source:SolidSource}|{type:'inspect'}|{type:'measure';module:SolidModule}|{type:'plan';variable:string}|{type:'install';module:SolidModule}|{type:'predict';module:SolidModule;choice:string}|{type:'start';challenge:boolean}|{type:'finish'}|{type:'observe'}|{type:'record'}|{type:'recover'}|{type:'conclude';answers:SolidAnswers}|{type:'reflect';text:string};
export type SolidEvent=(Action&{revision?:number})|{type:'reset'};
export interface SolidProgress{version:1;mission:'M16-E3';epoch:number;revision:number;accepted:boolean;sources:Record<SolidSource,boolean>;inspected:boolean;measured:Record<SolidModule,boolean>;plans:{variable:string;correct:boolean}[];plan:boolean;installed:SolidModule|null;predictions:{module:SolidModule;choice:string}[];records:SolidResult[];attempts:SolidResult[];trial:{result:SolidResult;phase:'running'|'preview'|'observed'|'recorded'}|null;answers:(SolidAnswers&{correct:boolean})[];reflection:string;completed:boolean;reward:0|50;firstCompletedAt:string|null;rewardProof:{at:string;history:Action[]}|null;history:Action[];}
export const initialSolid=():SolidProgress=>({version:1,mission:'M16-E3',epoch:0,revision:0,accepted:false,sources:{force:false,area:false,needs:false},inspected:false,measured:{A:false,B:false,C:false},plans:[],plan:false,installed:null,predictions:[],records:[],attempts:[],trial:null,answers:[],reflection:'',completed:false,reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const solidPrepared=(p:SolidProgress)=>p.accepted&&Object.values(p.sources).every(Boolean)&&p.inspected&&Object.values(p.measured).every(Boolean)&&p.plan;
export const solidChallengeWon=(p:SolidProgress)=>p.attempts.some(r=>r.success);
export function solidTransition(p:SolidProgress,e:SolidEvent,now=()=>new Date().toISOString()):{progress:SolidProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialSolid(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya M16-E3 diulang; hadiah pertama dan misi lain dipertahankan.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Tindakan lama diabaikan.');
 if(p.history.length>=3000)return fail('Riwayat penuh. Cadangkan lalu ulangi episode.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima M16-E3 dari Pak Damar dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti tekanan padat tersimpan.';
 switch(e.type){
 case'accept':if(p.accepted)return fail('Episode sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(solidCards,e.source)||p.sources[e.source])return fail('Sumber sudah dicatat atau tidak valid.');n.sources[e.source]=true;break;
 case'inspect':if(!Object.values(p.sources).every(Boolean)||p.inspected)return fail('Baca buku serta catatan, lalu periksa kebutuhan alat.');n.inspected=true;break;
 case'measure':if(!p.inspected||p.trial||!solidModules.includes(e.module)||p.measured[e.module])return fail('Periksa gaya, lalu ukur penopang pada rak saat beban terangkat.');n.measured[e.module]=true;break;
 case'plan':if(!p.inspected||!Object.values(p.measured).every(Boolean)||p.plan||typeof e.variable!=='string'||e.variable.length>50)return fail('Periksa gaya dan ukur ketiga penopang dahulu.');ok=e.variable==='contact-area';n.plans.push({variable:e.variable,correct:ok});n.plan=ok;message=ok?'Luas kontak dibandingkan; gaya, media, orientasi dan kondisi awal tetap.':'Ubah luas kontak. Gaya, media, orientasi dan kondisi awal harus tetap; upaya awal disimpan.';break;
 case'install':if(!solidPrepared(p)||p.trial||!solidModules.includes(e.module)||p.installed===e.module)return fail('Angkat beban dan siapkan ulang media sebelum mengganti penopang.');n.installed=e.module;break;
 case'predict':if(!solidPrepared(p)||p.trial||p.installed!==e.module||!['same','lower','higher'].includes(e.choice)||p.records.some(r=>r.module===e.module))return fail('Pasang penopang pada alat diam, lalu pilih prediksi.');n.predictions.push({module:e.module,choice:e.choice});break;
 case'start':if(!solidPrepared(p)||!p.installed||p.trial||typeof e.challenge!=='boolean'||(e.challenge?p.records.length!==3:p.records.some(r=>r.module===p.installed)||!p.predictions.some(r=>r.module===p.installed)))return fail('Lengkapi persiapan dan prediksi; tantangan terbuka setelah tiga hasil sah.');n.trial={result:solidResult(p.installed,e.challenge),phase:'running'};message='Animasi pemasangan dimulai; belum menjadi bukti.';break;
 case'finish':if(p.trial?.phase!=='running')return fail('Uji belum berjalan.');n.trial!.phase='preview';break;
 case'observe':if(p.trial?.phase!=='preview')return fail('Tunggu indikator, lalu amati bidang kontak.');n.trial!.phase='observed';break;
 case'record':if(p.trial?.phase!=='observed')return fail('Jalankan uji dan amati sebelum mencatat.');if(p.trial.result.challenge)n.attempts.push(structuredClone(p.trial.result));else n.records.push(structuredClone(p.trial.result));n.trial!.phase='recorded';message='Satu hasil sah dicatat. Angkat beban dan siapkan ulang media sebelum mengganti penopang.';break;
 case'recover':if(!p.trial)return fail('Maket sudah aman; beban terangkat dan media siap.');n.trial=null;message='Maket pulih: beban yang sama terangkat dan media disiapkan ulang; bukti sah tetap ada.';break;
 case'conclude':if(p.completed||p.trial||p.records.length!==3||!solidChallengeWon(p)||!e.answers||!Object.keys(correctSolidAnswers).every(k=>typeof e.answers[k as keyof SolidAnswers]==='string'&&e.answers[k as keyof SolidAnswers].length<=60))return fail('Catat tiga percobaan, berhasil memasang penopang pada tantangan, lalu pulihkan alat.');ok=Object.entries(correctSolidAnswers).every(([k,v])=>e.answers[k as keyof SolidAnswers]===v);n.answers.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'M16-E3 selesai · 50 XP pertama. M16 tuntas setelah keempat episode selesai.':'Gaya tetap, luas mengubah tekanan rata-rata. Pertimbangkan tekanan dan lebar; upaya awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;
 if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};
 return{progress:n,ok,message};
}
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export function parseSolid(raw:unknown):SolidProgress{
 const bad=():never=>{throw Error('Progres M16-E3 tidak valid: model, urutan bukti, tantangan atau hadiah tidak sesuai.');};
 try{if(!raw||typeof raw!=='object')return bad();const p=raw as SolidProgress;
 if(p.version!==1||p.mission!=='M16-E3'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>3000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();
 if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null||p.rewardProof!==null)return bad();
 const replay=(history:Action[],seed:SolidProgress)=>{if(!Array.isArray(history)||history.length>3000)return bad();let n=seed;for(const e of history){if(!e||typeof e!=='object'||(e as {type:string}).type==='reset'||Object.hasOwn(e,'revision'))return bad();const r=solidTransition(n,e,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(r.progress===n)return bad();n=r.progress;}return n;};
 if(p.reward===50){if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt)return bad();const award=replay(p.rewardProof.history,initialSolid());if(!award.completed||award.history.at(-1)?.type!=='conclude')return bad();}
 const seed=initialSolid();seed.epoch=p.epoch;seed.revision=p.epoch;if(p.epoch>0){seed.reward=p.reward;seed.firstCompletedAt=p.firstCompletedAt;seed.rewardProof=structuredClone(p.rewardProof);}const n=replay(p.history,seed);if(JSON.stringify(canonical(n))!==JSON.stringify(canonical(p)))return bad();return n;
 }catch{return bad();}
}
export const settleSolid=(p:SolidProgress)=>p.trial?solidTransition(p,{type:'recover'}).progress:p;
export const solidSteps=(p:SolidProgress)=>[
 {title:'Terima Pijakan Aman Pos Rimba',detail:'M16-E3; satu dari empat episode bab Tekanan.',place:'damar',done:p.accepted},
 {title:'Baca buku dan kebutuhan',detail:'Gaya, luas kontak dan dua batas model.',place:p.sources.force&&p.sources.area?'solidNotes':'solidBook',done:Object.values(p.sources).every(Boolean)},
 {title:'Periksa gaya 400 N',detail:'Gaya alat virtual, bukan berat karakter.',place:'solidForce',done:p.inspected},
 {title:'Ukur dan rencanakan',detail:'Ukur lebar/panjang A/B/C; bandingkan luas kontak.',place:'solidRack',done:p.plan&&Object.values(p.measured).every(Boolean)},
 {title:`Catat tiga penopang · ${p.records.length}/3`,detail:'Pasang, prediksi, letakkan beban, amati, Catat.',place:'solidBench',done:p.records.length===3},
 {title:'Coba dua batas pada maket',detail:'Maksimal 6 kPa dan lebar jalur 30 cm.',place:'solidBench',done:solidChallengeWon(p)},
 {title:'Simpulkan bersama Pak Damar',detail:'Pulihkan maket; model bukan keamanan tanah nyata.',place:'damar',done:p.completed},
];
