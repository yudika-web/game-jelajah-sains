import {hydraulicModules,hydraulicCards,correctHydraulicAnswers,type HydraulicModule,type HydraulicSource,type HydraulicAnswers} from '../data/hydraulicContent';
import {hydraulicResult,type HydraulicResult} from './hydraulicModel';
type Action={type:'accept'}|{type:'read';source:HydraulicSource}|{type:'inspect'}|{type:'plan';variable:string}|{type:'install';module:HydraulicModule}|{type:'predict';module:HydraulicModule;choice:string}|{type:'start';challenge:boolean}|{type:'finish'}|{type:'observe'}|{type:'record'}|{type:'recover'}|{type:'conclude';answers:HydraulicAnswers}|{type:'reflect';text:string};
export type HydraulicEvent=(Action&{revision?:number})|{type:'reset'};
export interface HydraulicProgress{version:1;mission:'M16-E2';epoch:number;revision:number;accepted:boolean;sources:Record<HydraulicSource,boolean>;inspected:boolean;plans:{variable:string;correct:boolean}[];plan:boolean;installed:HydraulicModule|null;predictions:{module:HydraulicModule;choice:string}[];records:HydraulicResult[];attempts:HydraulicResult[];trial:{result:HydraulicResult;phase:'running'|'preview'|'observed'|'recorded'}|null;answers:(HydraulicAnswers&{correct:boolean})[];reflection:string;completed:boolean;reward:0|50;firstCompletedAt:string|null;rewardProof:{at:string;history:Action[]}|null;history:Action[];}
export const initialHydraulic=():HydraulicProgress=>({version:1,mission:'M16-E2',epoch:0,revision:0,accepted:false,sources:{pressure:false,tradeoff:false,needs:false},inspected:false,plans:[],plan:false,installed:null,predictions:[],records:[],attempts:[],trial:null,answers:[],reflection:'',completed:false,reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const hydraulicPrepared=(p:HydraulicProgress)=>p.accepted&&Object.values(p.sources).every(Boolean)&&p.inspected&&p.plan;
export const hydraulicChallengeWon=(p:HydraulicProgress)=>p.attempts.some(r=>r.success);
export function hydraulicTransition(p:HydraulicProgress,e:HydraulicEvent,now=()=>new Date().toISOString()):{progress:HydraulicProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialHydraulic(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya M16-E2 diulang; hadiah pertama dan misi lain dipertahankan.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Tindakan lama diabaikan.');
 if(p.history.length>=3000)return fail('Riwayat penuh. Cadangkan lalu ulangi episode.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima M16-E2 dari Kak Bima dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti hidraulik tersimpan.';
 switch(e.type){
 case'accept':if(p.accepted)return fail('Episode sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(hydraulicCards,e.source)||p.sources[e.source])return fail('Sumber sudah dicatat atau tidak valid.');n.sources[e.source]=true;break;
 case'inspect':if(!Object.values(p.sources).every(Boolean)||p.inspected)return fail('Baca buku serta catatan, lalu periksa kebutuhan peti.');n.inspected=true;break;
 case'plan':if(!p.inspected||p.plan||typeof e.variable!=='string'||e.variable.length>50)return fail('Periksa berat dan target dahulu.');ok=e.variable==='output-area';n.plans.push({variable:e.variable,correct:ok});n.plan=ok;message=ok?'Luas keluaran dibandingkan; beban, luas masukan dan target tetap.':'Ubah hanya luas keluaran. Samakan berat peti, luas masukan dan target; upaya awal disimpan.';break;
 case'install':if(!hydraulicPrepared(p)||p.trial||!hydraulicModules.includes(e.module)||p.installed===e.module)return fail('Kembalikan platform agar beban tersangga sebelum mengganti modul.');n.installed=e.module;break;
 case'predict':if(!hydraulicPrepared(p)||p.trial||p.installed!==e.module||!['same','less-longer','less-same'].includes(e.choice)||p.records.some(r=>r.module===e.module))return fail('Pasang modul pada alat diam, lalu pilih prediksi.');n.predictions.push({module:e.module,choice:e.choice});break;
 case'start':if(!hydraulicPrepared(p)||!p.installed||p.trial||typeof e.challenge!=='boolean'||(e.challenge?p.records.length!==3:p.records.some(r=>r.module===p.installed)||!p.predictions.some(r=>r.module===p.installed)))return fail('Lengkapi persiapan dan prediksi; tantangan terbuka setelah tiga hasil sah.');n.trial={result:hydraulicResult(p.installed,e.challenge),phase:'running'};message='Animasi pengangkatan dimulai; belum menjadi bukti.';break;
 case'finish':if(p.trial?.phase!=='running')return fail('Uji belum berjalan.');n.trial!.phase='preview';break;
 case'observe':if(p.trial?.phase!=='preview')return fail('Tunggu indikator, lalu amati kedua piston.');n.trial!.phase='observed';break;
 case'record':if(p.trial?.phase!=='observed')return fail('Jalankan uji dan amati sebelum mencatat.');if(p.trial.result.challenge)n.attempts.push(structuredClone(p.trial.result));else n.records.push(structuredClone(p.trial.result));n.trial!.phase='recorded';message='Satu hasil sah dicatat. Kembalikan platform sebelum mengganti modul.';break;
 case'recover':if(!p.trial)return fail('Alat sudah aman; peti tersangga.');n.trial=null;message='Alat kembali aman. Peti yang sama tersangga; bukti sah tetap ada.';break;
 case'conclude':if(p.completed||p.trial||p.records.length!==3||!hydraulicChallengeWon(p)||!e.answers||!Object.keys(correctHydraulicAnswers).every(k=>typeof e.answers[k as keyof HydraulicAnswers]==='string'&&e.answers[k as keyof HydraulicAnswers].length<=60))return fail('Catat tiga percobaan, berhasil mengangkat pada tantangan, lalu pulihkan alat.');ok=Object.entries(correctHydraulicAnswers).every(([k,v])=>e.answers[k as keyof HydraulicAnswers]===v);n.answers.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'M16-E2 selesai · 50 XP pertama. M16 tetap Dalam pengembangan.':'Bandingkan gaya, gerak dan usaha. Pertimbangkan kedua batas; upaya awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;
 if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};
 return{progress:n,ok,message};
}
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export function parseHydraulic(raw:unknown):HydraulicProgress{
 const bad=():never=>{throw Error('Progres M16-E2 tidak valid: model, urutan bukti, tantangan atau hadiah tidak sesuai.');};
 try{if(!raw||typeof raw!=='object')return bad();const p=raw as HydraulicProgress;
 if(p.version!==1||p.mission!=='M16-E2'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>3000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();
 if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null||p.rewardProof!==null)return bad();
 const replay=(history:Action[],seed:HydraulicProgress)=>{if(!Array.isArray(history)||history.length>3000)return bad();let n=seed;for(const e of history){if(!e||typeof e!=='object'||(e as {type:string}).type==='reset'||Object.hasOwn(e,'revision'))return bad();const r=hydraulicTransition(n,e,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(r.progress===n)return bad();n=r.progress;}return n;};
 if(p.reward===50){if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt)return bad();const award=replay(p.rewardProof.history,initialHydraulic());if(!award.completed||award.history.at(-1)?.type!=='conclude')return bad();}
 const seed=initialHydraulic();seed.epoch=p.epoch;seed.revision=p.epoch;if(p.epoch>0){seed.reward=p.reward;seed.firstCompletedAt=p.firstCompletedAt;seed.rewardProof=structuredClone(p.rewardProof);}const n=replay(p.history,seed);if(JSON.stringify(canonical(n))!==JSON.stringify(canonical(p)))return bad();return n;
 }catch{return bad();}
}
export const settleHydraulic=(p:HydraulicProgress)=>p.trial?hydraulicTransition(p,{type:'recover'}).progress:p;
export const hydraulicSteps=(p:HydraulicProgress)=>[
 {title:'Terima Lift Hidraulik',detail:'M16-E2; bab Tekanan masih Dalam pengembangan.',place:'bima',done:p.accepted},
 {title:'Baca buku dan kebutuhan',detail:'Tekanan, gaya, gerak dan batas alat.',place:p.sources.pressure&&p.sources.tradeoff?'hydraulicNotes':'hydraulicBook',done:Object.values(p.sources).every(Boolean)},
 {title:'Periksa peti dan rencanakan',detail:'Berat 100 N, target 5 cm; ubah luas keluaran.',place:'hydraulicLoad',done:p.inspected&&p.plan},
 {title:`Catat tiga modul · ${p.records.length}/3`,detail:'Pasang, prediksi, uji, amati, catat, kembalikan.',place:'hydraulicBench',done:p.records.length===3},
 {title:'Angkat pada dua batas',detail:'Gaya maksimal 50 N; gerak maksimal 12 cm.',place:'hydraulicBench',done:hydraulicChallengeWon(p)},
 {title:'Simpulkan bersama Kak Bima',detail:'Alat tidak menciptakan energi; pulihkan platform.',place:'bima',done:p.completed},
];
