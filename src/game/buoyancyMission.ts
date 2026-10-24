import {buoyancyObjects,objectDensity,objectResult,type BuoyancyObject,type FloatResult} from '../data/poolContent';
export interface BuoyancyRecord{id:BuoyancyObject;massG:number;volumeCm3:number;density:number;result:FloatResult;prediction:FloatResult;}
export interface BuoyancyAnswers{rule:string;compare:string;limits:string;}
export const correctBuoyancyAnswers:BuoyancyAnswers={rule:'density',compare:'A-C',limits:'model'};
export interface BuoyancyProgress{version:1;mission:'S14';revision:number;accepted:boolean;source:boolean;practice:boolean;predictions:{id:BuoyancyObject;result:FloatResult}[];records:BuoyancyRecord[];attempts:(BuoyancyAnswers&{correct:boolean})[];completed:boolean;reflection:string;reward:0|50;firstCompletedAt:string|null;}
export const initialBuoyancy=():BuoyancyProgress=>({version:1,mission:'S14',revision:0,accepted:false,source:false,practice:false,predictions:[],records:[],attempts:[],completed:false,reflection:'',reward:0,firstCompletedAt:null});
export const lastPrediction=(p:BuoyancyProgress,id:BuoyancyObject)=>p.predictions.filter(r=>r.id===id).at(-1)?.result;
export const validBuoyancyAnswers=(a:BuoyancyAnswers)=>a.rule==='density'&&a.compare==='A-C'&&a.limits==='model';
export type BuoyancyEvent={type:'accept'}|{type:'read'}|{type:'practice'}|{type:'predict';id:BuoyancyObject;result:FloatResult}|{type:'record';id:BuoyancyObject;revision:number}|{type:'conclude';answers:BuoyancyAnswers}|{type:'reflect';text:string}|{type:'reset'};
export function buoyancyTransition(p:BuoyancyProgress,e:BuoyancyEvent):{progress:BuoyancyProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});if(e.type==='reset')return{progress:{...initialBuoyancy(),revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt},ok:true,message:'S14 diulang; misi lain dan hadiah pertama tetap tersimpan.'};
 if(e.type!=='accept'&&!p.accepted)return fail('Terima S14 bersama Kak Lestari dahulu.');const n=structuredClone(p);let ok=true,message='Catatan S14 tersimpan.';
 switch(e.type){case'accept':if(p.accepted)return fail('S14 sudah diterima.');n.accepted=true;break;case'read':if(p.source)return fail('Buku sudah dibaca.');n.source=true;break;case'practice':if(p.practice)return fail('Latihan berenang sudah tercatat.');n.practice=true;break;
 case'predict':if(!p.source||!p.practice||!(['A','B','C'].includes(e.id))||!['float','sink'].includes(e.result)||p.records.some(r=>r.id===e.id))return fail('Baca buku dan selesaikan latihan berenang. Pilih benda yang belum dicatat.');n.predictions.push({id:e.id,result:e.result});break;
 case'record':if(!(['A','B','C'].includes(e.id))||!lastPrediction(p,e.id)||p.records.some(r=>r.id===e.id)||e.revision!==p.revision)return fail('Hasil sudah dicatat atau keadaan berubah. Uji ulang benda yang belum dicatat.');n.records.push({id:e.id,massG:buoyancyObjects[e.id].massG,volumeCm3:buoyancyObjects[e.id].volumeCm3,density:objectDensity(e.id),result:objectResult(e.id),prediction:lastPrediction(p,e.id)!});message='Hasil percobaan disahkan satu kali. Prediksi awal tetap tersimpan.';break;
 case'conclude':if(p.records.length!==3||p.completed)return fail('Uji dan catat ketiga benda sebelum menyimpulkan.');ok=validBuoyancyAnswers(e.answers);n.attempts.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=new Date().toISOString();}message=ok?'S14 selesai. Hadiah pertama 50 XP hanya sekali.':'Bandingkan massa dibagi volume, termasuk A dan C. Massa saja belum cukup. Jawaban awal disimpan.';break;
 case'reflect':n.reflection=e.text.slice(0,1000);break;}
 n.revision++;return{progress:n,ok,message};
}
export function parseBuoyancy(raw:unknown):BuoyancyProgress{
 const bad=()=>{throw new Error('Progres S14 tidak valid.');};if(!raw||typeof raw!=='object')return bad();const p=structuredClone(raw) as BuoyancyProgress;
 if(p.version!==1||p.mission!=='S14'||!Number.isSafeInteger(p.revision)||p.revision<0||!['accepted','source','practice','completed'].every(k=>typeof p[k as keyof BuoyancyProgress]==='boolean')||typeof p.reflection!=='string'||p.reflection.length>1000||![p.predictions,p.records,p.attempts].every(a=>Array.isArray(a)&&a.length<=1000)||p.records.length>3)return bad();
 for(const r of p.predictions)if(!r||!(['A','B','C'].includes(r.id))||!['float','sink'].includes(r.result))return bad();
 const ids=new Set<string>();for(const r of p.records){if(!r||!(['A','B','C'].includes(r.id))||ids.has(r.id)||r.massG!==buoyancyObjects[r.id].massG||r.volumeCm3!==buoyancyObjects[r.id].volumeCm3||r.density!==objectDensity(r.id)||r.result!==objectResult(r.id)||r.prediction!==lastPrediction(p,r.id))return bad();ids.add(r.id);}
 if((p.predictions.length||p.records.length)&&(!p.accepted||!p.source||!p.practice))return bad();for(const a of p.attempts)if(!a||!['rule','compare','limits'].every(k=>typeof a[k as keyof BuoyancyAnswers]==='string'&&(a[k as keyof BuoyancyAnswers]).length<=60)||typeof a.correct!=='boolean'||a.correct!==validBuoyancyAnswers(a))return bad();
 if(p.attempts.length&&p.records.length!==3||p.completed!==p.attempts.some(a=>a.correct)||p.attempts.filter(a=>a.correct).length>1||!p.accepted&&(p.source||p.practice||p.records.length||p.predictions.length||p.reflection))return bad();
 if(![0,50].includes(p.reward)||(p.reward===50)!==(typeof p.firstCompletedAt==='string'&&!isNaN(Date.parse(p.firstCompletedAt)))||p.reward===0&&p.firstCompletedAt!==null||p.completed&&p.reward!==50)return bad();return p;
}
export const buoyancySteps=(p:BuoyancyProgress)=>[
 {title:'Terima Terapung atau Tenggelam?',detail:'Temui Kak Lestari untuk S14.',place:'lestari',done:p.accepted},
 {title:'Baca buku gaya apung',detail:'Massa jenis air model 1 g/cm³.',place:'densityBook',done:p.source},
 {title:'Latihan berenang di kolam',detail:'Masuk melalui ramp; berenang ke penanda.',place:'poolRamp',done:p.practice},
 {title:'Prediksi, uji, dan catat A/B/C',detail:`${p.records.length}/3 hasil sah. Prediksi keliru boleh diperbaiki melalui bukti.`,place:'floatBench',done:p.records.length===3},
 {title:'Simpulkan berdasarkan data',detail:'Bandingkan massa jenis dan batas model.',place:'lestari',done:p.completed},
];
