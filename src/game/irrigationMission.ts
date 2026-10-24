import { irrigationPoints, irrigationCards, sampleVolume, type IrrigationPoint, type FlowCondition, type IrrigationSource } from '../data/irrigationContent';
export interface FlowRecord{id:string;point:IrrigationPoint;condition:FlowCondition;volumeMl:number;seconds:30;order:number;}
export interface IrrigationAnswers{supply:string;branch:string;cause:string;limits:string;}
export const correctIrrigationAnswers:IrrigationAnswers={supply:'same',branch:'increased',cause:'obstruction',limits:'model-only'};
export interface IrrigationProgress{
 version:1;mission:'S15';revision:number;accepted:boolean;sources:Record<IrrigationSource,boolean>;
 tutorial:{boarded:boolean;arrived:boolean;landed:boolean;distanceMm:number};inspected:boolean;records:FlowRecord[];
 hypotheses:{choice:string;correct:boolean}[];hypothesis:boolean;tools:boolean;cleaned:boolean;cleanAfterOrder:number|null;
 attempts:(IrrigationAnswers&{correct:boolean})[];completed:boolean;reflection:string;reward:0|50;firstCompletedAt:string|null;
}
export const initialIrrigation=():IrrigationProgress=>({version:1,mission:'S15',revision:0,accepted:false,sources:{flow:false,duration:false,barrier:false,notes:false},tutorial:{boarded:false,arrived:false,landed:false,distanceMm:0},inspected:false,records:[],hypotheses:[],hypothesis:false,tools:false,cleaned:false,cleanAfterOrder:null,attempts:[],completed:false,reflection:'',reward:0,firstCompletedAt:null});
export const baselineComplete=(p:IrrigationProgress)=>irrigationPoints.every(point=>p.records.some(r=>r.point===point&&r.condition==='blocked'));
export const afterComplete=(p:IrrigationProgress)=>irrigationPoints.every(point=>p.records.some(r=>r.point===point&&r.condition==='clear'));
export const validIrrigationAnswers=(a:IrrigationAnswers)=>Object.entries(correctIrrigationAnswers).every(([k,v])=>a[k as keyof IrrigationAnswers]===v);
export const canMeasure=(p:IrrigationProgress)=>p.accepted&&p.sources.flow&&p.sources.notes&&p.tutorial.landed&&p.inspected;
export type IrrigationEvent={type:'accept'}|{type:'read';source:IrrigationSource}|{type:'tutorial';stage:'board'|'arrive'|'land';distanceMm?:number}|{type:'inspect'}|{type:'record';point:IrrigationPoint;condition:FlowCondition;revision:number}|{type:'hypothesis';choice:string}|{type:'tools'}|{type:'clean'}|{type:'conclude';answers:IrrigationAnswers}|{type:'reflect';text:string}|{type:'reset'};
export function irrigationTransition(p:IrrigationProgress,e:IrrigationEvent):{progress:IrrigationProgress;ok:boolean;message:string}{
 const fail=(message:string)=>({progress:p,ok:false,message});
 if(e.type==='reset')return{progress:{...initialIrrigation(),revision:p.revision+1,reward:p.reward,firstCompletedAt:p.firstCompletedAt},ok:true,message:'S15 diulang. Misi lain dan riwayat hadiah tetap tersimpan.'};
 if(e.type!=='accept'&&!p.accepted)return fail('Terima S15 dari Kak Lestari dahulu.');
 const n=structuredClone(p);let ok=true,message='Bukti S15 tersimpan.';
 switch(e.type){
 case'accept':if(p.accepted)return fail('S15 sudah diterima.');n.accepted=true;break;
 case'read':if(!(e.source in irrigationCards)||p.sources[e.source])return fail('Sumber sudah tercatat atau tidak valid.');n.sources[e.source]=true;break;
 case'tutorial':
  if(!p.sources.flow||!p.sources.notes)return fail('Baca buku debit dan catatan pasokan sebelum tutorial S15.');
  if(e.stage==='board'){if(p.tutorial.boarded)return fail('Tahap naik sudah tercatat.');n.tutorial.boarded=true;}
  else if(e.stage==='arrive'){if(!p.tutorial.boarded||p.tutorial.arrived||!Number.isSafeInteger(e.distanceMm)||e.distanceMm!<8000)return fail('Berlayarlah dari dermaga riset ke dermaga pengamatan, lalu sandar.');n.tutorial.arrived=true;n.tutorial.distanceMm=e.distanceMm!;}
  else{if(!p.tutorial.arrived||p.tutorial.landed)return fail('Sandar di dermaga pengamatan sebelum turun.');n.tutorial.landed=true;}break;
 case'inspect':if(!p.tutorial.landed||!p.sources.flow||!p.sources.notes)return fail('Baca buku dan catatan pasokan, lalu ikuti tutorial perahu sampai turun.');if(p.inspected)return fail('Kondisi awal sudah diperiksa.');n.inspected=true;break;
 case'record':{
  if(!canMeasure(p)||!irrigationPoints.includes(e.point)||e.revision!==p.revision||e.condition!==(p.cleaned?'clear':'blocked')||p.records.some(r=>r.point===e.point&&r.condition===e.condition))return fail('Pengukuran sudah dicatat atau kondisi berubah. Jalankan pengukuran baru.');
  n.records.push({id:`${e.condition}-${e.point}`,point:e.point,condition:e.condition,volumeMl:sampleVolume(e.point,e.condition),seconds:30,order:p.records.length+1});message='Hasil 30 detik simulasi dicatat satu kali.';break;
 }
 case'hypothesis':if(!['obstruction','supply','loss'].includes(e.choice))return fail('Pilih salah satu dugaan.');if(!baselineComplete(p)||p.hypothesis)return fail('Lengkapi data awal P1, P2, P3 sebelum memilih dugaan.');ok=e.choice==='obstruction';n.hypotheses.push({choice:e.choice,correct:ok});n.hypothesis=ok;message=ok?'Dugaan tercatat; uji dengan membersihkan hambatan dan mengukur ulang.':'Periksa P1 dan bandingkan P2/P3. Ini dugaan yang masih perlu diuji, bukan kesimpulan. Upaya disimpan.';break;
 case'tools':if(!p.hypothesis)return fail('Pilih dugaan dari data awal terlebih dahulu.');if(p.tools)return fail('Alat pembersih sudah dipinjam.');n.tools=true;break;
 case'clean':if(!baselineComplete(p)||!p.hypothesis||!p.tools||p.cleaned)return fail('Catat ketiga data awal, pilih dugaan, dan ambil alat sebelum membersihkan.');n.cleaned=true;n.cleanAfterOrder=p.records.length;message='Daun disingkirkan. Ukur ulang P1, P2, P3; hasil belum otomatis dicatat.';break;
 case'conclude':if(!baselineComplete(p)||!afterComplete(p)||!p.cleaned||p.completed)return fail('Diperlukan enam pengukuran sah dan tindakan pembersihan sebelum menyimpulkan.');ok=validIrrigationAnswers(e.answers);n.attempts.push({...e.answers,correct:ok});n.completed=ok;if(ok&&!p.firstCompletedAt){n.reward=50;n.firstCompletedAt=new Date().toISOString();}message=ok?'S15 selesai. Hadiah pertama 50 XP hanya sekali.':'Bandingkan P1, P2/P3 pada durasi sama. Batasi kesimpulan pada model. Jawaban awal tersimpan.';break;
 case'reflect':n.reflection=e.text.slice(0,1000);break;
 }
 n.revision++;return{progress:n,ok,message};
}
export function parseIrrigation(raw:unknown):IrrigationProgress{
 const bad=()=>{throw new Error('Progres S15 tidak valid.');};if(!raw||typeof raw!=='object')return bad();const p=structuredClone(raw) as IrrigationProgress;
 const bool=(x:unknown)=>typeof x==='boolean',str=(x:unknown,max=1000)=>typeof x==='string'&&x.length<=max;
 if(p.version!==1||p.mission!=='S15'||!Number.isSafeInteger(p.revision)||p.revision<0||!['accepted','inspected','hypothesis','tools','cleaned','completed'].every(k=>bool(p[k as keyof IrrigationProgress]))||!p.sources||!Object.keys(irrigationCards).every(k=>bool(p.sources[k as IrrigationSource]))||!str(p.reflection)||!p.tutorial)return bad();
 const t=p.tutorial;if(!['boarded','arrived','landed'].every(k=>bool(t[k as 'boarded']))||!Number.isSafeInteger(t.distanceMm)||t.distanceMm<0||t.distanceMm>100000000||t.arrived&&(!t.boarded||t.distanceMm<8000)||t.landed&&!t.arrived||!t.arrived&&t.distanceMm!==0)return bad();
 if(![p.records,p.hypotheses,p.attempts].every(a=>Array.isArray(a)&&a.length<=1000)||p.records.length>6)return bad();
 const seen=new Set<string>();for(const [i,r]of p.records.entries()){if(!r||!irrigationPoints.includes(r.point)||!['blocked','clear'].includes(r.condition)||r.id!==`${r.condition}-${r.point}`||seen.has(r.id)||r.order!==i+1||r.seconds!==30||r.volumeMl!==sampleVolume(r.point,r.condition)||r.condition==='blocked'&&i>=3||r.condition==='clear'&&(i<3||!p.cleaned))return bad();seen.add(r.id);}
 if(p.records.length&&!canMeasure(p)||p.inspected&&(!t.landed||!p.sources.flow||!p.sources.notes))return bad();
 for(const h of p.hypotheses)if(!h||!['obstruction','supply','loss'].includes(h.choice)||!bool(h.correct)||h.correct!==(h.choice==='obstruction'))return bad();
 if(p.hypothesis!==p.hypotheses.some(h=>h.correct)||p.hypotheses.filter(h=>h.correct).length>1||p.hypotheses.length&&!baselineComplete(p)||p.tools&&!p.hypothesis||p.cleaned&&(!p.tools||!baselineComplete(p)||p.cleanAfterOrder!==3)||!p.cleaned&&p.cleanAfterOrder!==null)return bad();
 for(const a of p.attempts)if(!a||!Object.keys(correctIrrigationAnswers).every(k=>str(a[k as keyof IrrigationAnswers],60))||!bool(a.correct)||a.correct!==validIrrigationAnswers(a))return bad();
 if(p.attempts.length&&(!afterComplete(p)||!p.cleaned)||p.completed!==p.attempts.some(a=>a.correct)||p.attempts.filter(a=>a.correct).length>1)return bad();
 if(!p.accepted&&(Object.values(p.sources).some(Boolean)||t.boarded||p.inspected||p.records.length||p.hypotheses.length||p.tools||p.cleaned||p.attempts.length||p.reflection))return bad();
 if(![0,50].includes(p.reward)||(p.reward===50)!==(typeof p.firstCompletedAt==='string'&&!isNaN(Date.parse(p.firstCompletedAt)))||p.reward===0&&p.firstCompletedAt!==null||p.completed&&p.reward!==50)return bad();return p;
}
export function irrigationSteps(p:IrrigationProgress){return[
 {title:'Terima Misteri Saluran Irigasi',detail:'Temui Kak Lestari; jangan langsung menyimpulkan.',place:'lestari',done:p.accepted},
 {title:'Baca buku debit dan catatan',detail:'Pasokan model dan durasi sampling.',place:!p.sources.flow?'flowBook':'irrigationNotes',done:p.sources.flow&&p.sources.notes},
 {title:'Berlayar ke dermaga pengamatan',detail:'Naik, berlayar, sandar, lalu turun.',place:'boatStart',done:p.tutorial.landed},
 {title:'Periksa saluran',detail:'Amati kondisi saringan sebelum tindakan.',place:'irrigationScreen',done:p.inspected},
 {title:'Catat tiga data awal',detail:`${p.records.filter(r=>r.condition==='blocked').length}/3 · 30 detik simulasi per titik.`,place:irrigationPoints.find(q=>!p.records.some(r=>r.point===q&&r.condition==='blocked'))??'P1',done:baselineComplete(p)},
 {title:'Pilih dugaan berbukti',detail:'Bandingkan pasokan, cabang, dan ujung jalur.',place:'irrigationScreen',done:p.hypothesis},
 {title:'Ambil alat dan bersihkan',detail:'Tindakan di darat sesudah data awal lengkap.',place:!p.tools?'cleaningRack':'irrigationScreen',done:p.cleaned},
 {title:'Ukur ulang tiga titik',detail:`${p.records.filter(r=>r.condition==='clear').length}/3 · durasi tetap sama.`,place:irrigationPoints.find(q=>!p.records.some(r=>r.point===q&&r.condition==='clear'))??'P1',done:afterComplete(p)},
 {title:'Simpulkan bersama Kak Lestari',detail:'Gunakan bukti sebelum/sesudah dan batas model.',place:'lestari',done:p.completed},
];}
