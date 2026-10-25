import {organismIds,organisms,coastalCards,validFoodLink,correctCoastalAnswers,type OrganismId,type CoastalSource,type CoastalAnswers} from '../data/coastalContent';
type Action={type:'accept'}|{type:'read';source:CoastalSource}|{type:'observe';id:OrganismId;role:string;feature:string}|{type:'link';from:OrganismId;to:OrganismId}|{type:'scenario'}|{type:'conclude';answers:CoastalAnswers}|{type:'reflect';text:string};
export type CoastalEvent=(Action&{revision?:number})|{type:'reset'};
export interface CoastalProgress {version:1;mission:'S16';epoch:number;revision:number;accepted:boolean;sources:Record<CoastalSource,boolean>;records:{id:OrganismId;role:'producer'|'consumer';feature:string;food:string}[];observationAttempts:{id:OrganismId;role:string;feature:string;correct:boolean}[];links:{from:OrganismId;to:OrganismId}[];linkAttempts:{from:OrganismId;to:OrganismId;correct:boolean}[];scenario:boolean;answers:(CoastalAnswers&{correct:boolean})[];reflection:string;completed:boolean;reward:0|50;firstCompletedAt:string|null;rewardProof:{at:string;history:Action[]}|null;history:Action[];}
export const initialCoastal=():CoastalProgress=>({version:1,mission:'S16',epoch:0,revision:0,accepted:false,sources:{energy:false,food:false,limits:false},records:[],observationAttempts:[],links:[],linkAttempts:[],scenario:false,answers:[],reflection:'',completed:false,reward:0,firstCompletedAt:null,rewardProof:null,history:[]});
export const coastalReady=(p:CoastalProgress)=>p.records.length===5&&Object.values(p.sources).every(Boolean);
export function coastalTransition(p:CoastalProgress,e:CoastalEvent,now=()=>new Date().toISOString()):{progress:CoastalProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialCoastal(),epoch:p.revision+1,revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt,rewardProof:structuredClone(p.rewardProof)},ok:true,message:'Hanya S16 diulang; riwayat hadiah pertama tetap ada.'};
 if(e.revision!==undefined&&e.revision!==p.revision)return fail('Keadaan berubah; tindakan lama diabaikan.');
 if(p.history.length>=2000)return fail('Riwayat penuh. Cadangkan lalu ulangi S16.');
 if(e.type!=='accept'&&!p.accepted)return fail('Terima S16 dari Kak Lestari di Pesisir dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti S16 tersimpan.';
 switch(e.type){
 case'accept':if(p.accepted)return fail('S16 sudah diterima.');n.accepted=true;break;
 case'read':if(!Object.hasOwn(coastalCards,e.source)||p.sources[e.source])return fail('Sumber sudah dicatat atau tidak valid.');n.sources[e.source]=true;break;
 case'observe':{
  if(!organismIds.includes(e.id)||p.records.some(r=>r.id===e.id)||!p.sources.energy||!p.sources.food||!['producer','consumer'].includes(e.role)||!organismIds.includes(e.feature as OrganismId))return fail('Baca buku dan catatan makanan, lalu amati kelompok yang belum dicatat.');
  const o=organisms[e.id];ok=e.role===o.role&&e.feature===e.id;n.observationAttempts.push({id:e.id,role:e.role,feature:e.feature,correct:ok});
  if(ok)n.records.push({id:e.id,role:o.role,feature:o.feature,food:o.food});message=ok?'Satu kelompok dicatat. Ciri terlihat dan informasi buku disimpan terpisah.':'Perhatikan bentuk yang ditampilkan. Produsen menghasilkan bahan organik; konsumen memperoleh makanan. Upaya awal disimpan.';break;
 }
 case'link':if(!coastalReady(p)||!organismIds.includes(e.from)||!organismIds.includes(e.to)||p.links.some(l=>l.from===e.from&&l.to===e.to))return fail('Lengkapi lima pengamatan dan sumber; pilih hubungan yang belum dipasang.');ok=validFoodLink(e.from,e.to);n.linkAttempts.push({from:e.from,to:e.to,correct:ok});if(ok)n.links.push({from:e.from,to:e.to});message=ok?'Hubungan dipasang: energi dari makanan menuju pemakannya.':'Hubungan belum dipasang. Panah berasal dari organisme yang dimakan menuju pemakannya. Periksa informasi makanan di jurnal; upaya awal disimpan.';break;
 case'scenario':if(p.links.length!==5||p.scenario)return fail('Susun lima hubungan sebelum meninjau kasus.');n.scenario=true;message='Skenario prediksi: satu jalur melemah, jalur melalui ikan F masih ada. Bukan pengukuran populasi.';break;
 case'conclude':if(!coastalReady(p)||p.links.length!==5||!p.scenario||p.completed||!e.answers||!Object.keys(correctCoastalAnswers).every(k=>typeof e.answers[k as keyof CoastalAnswers]==='string'&&e.answers[k as keyof CoastalAnswers].length<=60))return fail('Lengkapi pengamatan, lima hubungan, dan tinjau kasus sebelum menyimpulkan.');ok=Object.entries(correctCoastalAnswers).every(([k,v])=>e.answers[k as keyof CoastalAnswers]===v);n.answers.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=now();}message=ok?'S16 selesai · hadiah pertama 50 XP. Misi ekologi lain tidak ikut diselesaikan.':'Satu makanan berkurang, alternatif masih ada. Besarnya perubahan populasi belum dapat dipastikan. Jawaban awal disimpan.';break;
 case'reflect':if(typeof e.text!=='string')return fail('Refleksi tidak valid.');n.reflection=e.text.slice(0,1000);break;
 default:return fail('Tindakan tidak dikenal.');
 }
 const action=structuredClone(e) as Action&{revision?:number};delete action.revision;n.history.push(action);n.revision++;if(n.reward===50&&!p.rewardProof)n.rewardProof={at:n.firstCompletedAt!,history:structuredClone(n.history)};return{progress:n,ok,message};
}
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export function parseCoastal(raw:unknown):CoastalProgress{
 const bad=():never=>{throw Error('Progres S16 tidak valid: ID, urutan bukti, hubungan, jawaban, atau hadiah tidak sesuai.');};
 try{if(!raw||typeof raw!=='object')return bad();const p=raw as CoastalProgress;if(p.version!==1||p.mission!=='S16'||!Number.isSafeInteger(p.epoch)||p.epoch<0||!Number.isSafeInteger(p.revision)||!Array.isArray(p.history)||p.history.length>2000||p.revision!==p.epoch+p.history.length||![0,50].includes(p.reward))return bad();if(p.reward===50?typeof p.firstCompletedAt!=='string'||!Number.isFinite(Date.parse(p.firstCompletedAt)):p.firstCompletedAt!==null||p.rewardProof!==null)return bad();
 const replay=(h:Action[],seed:CoastalProgress)=>{if(!Array.isArray(h)||h.length>2000)return bad();let n=seed;for(const e of h){if(!e||typeof e!=='object'||(e as {type:string}).type==='reset'||Object.hasOwn(e,'revision'))return bad();const r=coastalTransition(n,e,()=>p.firstCompletedAt??'2000-01-01T00:00:00.000Z');if(r.progress===n)return bad();n=r.progress;}return n;};
 if(p.reward===50){if(!p.rewardProof||p.rewardProof.at!==p.firstCompletedAt)return bad();const award=replay(p.rewardProof.history,initialCoastal());if(!award.completed||award.history.at(-1)?.type!=='conclude')return bad();}
 const seed=initialCoastal();seed.epoch=p.epoch;seed.revision=p.epoch;if(p.epoch>0){seed.reward=p.reward;seed.firstCompletedAt=p.firstCompletedAt;seed.rewardProof=structuredClone(p.rewardProof);}const result=replay(p.history,seed);if(JSON.stringify(canonical(result))!==JSON.stringify(canonical(p)))return bad();return result;
 }catch{return bad();}
}
export const coastalSteps=(p:CoastalProgress)=>[
 {title:'Temui Kak Lestari di Pesisir',detail:'Terima Jaring Kehidupan Pesisir.',place:'coastLestari',done:p.accepted},
 {title:'Baca energi dan makanan',detail:'Informasi makanan berasal dari penelitian.',place:p.sources.energy?'coastNotes':'coastBook',done:p.sources.energy&&p.sources.food},
 {title:'Catat dua kelompok plankton',detail:'Gunakan alat pembesaran virtual.',place:'planktonScope',done:['phyto','zoo'].every(id=>p.records.some(r=>r.id===id))},
 {title:'Amati dua kelompok ikan',detail:'Jendela bawah air; tetap di darat.',place:'underwaterWindow',done:['grazer','hunter'].every(id=>p.records.some(r=>r.id===id))},
 {title:'Berperahu ke titik predator',detail:'Sandar dan turun sebelum mengamati.',place:'coastFishPoint',done:p.records.some(r=>r.id==='predator')},
 {title:'Baca batas model',detail:'Jaring ini belum mencakup seluruh ekosistem.',place:'coastLimits',done:p.sources.limits},
 {title:'Susun lima hubungan',detail:`${p.links.length}/5 panah makanan menuju pemakan.`,place:'foodwebBoard',done:p.links.length===5},
 {title:'Tinjau gangguan satu jalur',detail:'Prediksi terbatas, bukan data populasi.',place:'foodwebBoard',done:p.scenario},
 {title:'Simpulkan bersama Lestari',detail:'Jalur alternatif dan batas kesimpulan.',place:'coastLestari',done:p.completed},
];
