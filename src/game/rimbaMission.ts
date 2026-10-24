export const rimbaId = 'W03-LOG01' as const;
export const rimbaGroups = ['A', 'B', 'C'] as const;
export type Depot = typeof rimbaGroups[number];
export type Carrier = 'bucket' | 'cart';
export type SourceCard = 'map' | 'capacity' | 'supply' | 'habitat';
export const rimbaCapacity = { source: 40000, bucket: 4000, cart: 12000, A: 8000, B: 6000, C: 10000 } as const;
export const depotZone = { minX: -10, maxX: 5, minZ: 5, maxZ: 12 };
export const inSourceZone = (p: {x:number;z:number}) => p.x >= depotZone.minX && p.x <= depotZone.maxX && p.z >= depotZone.minZ && p.z <= depotZone.maxZ;
export const litres = (ml: number) => `${(ml / 1000).toLocaleString('id-ID')} L`;
export interface Transfer { id: number; kind: 'fill' | 'pour' | 'return'; tool: Carrier; amount: number; target: Depot | null; trip: number | null; }
export type TripEnd = 'return' | 'park' | 'switch' | 'leave' | 'home' | 'reload' | 'complete';
export interface Trip {
  id: number; tool: Carrier; load: number; startTransfer: number; endTransfer: number | null;
  delivered: number; distanceMm: number; movingMs: number; end: TripEnd | null;
}
export interface RimbaProgress {
  version: 1; episode: typeof rimbaId; revision: number; accepted: boolean;
  sources: Record<SourceCard, boolean>; inspected: Record<Depot, boolean>; total: number | null;
  bucketTaken: boolean; parts: boolean; repaired: boolean; cOpen: boolean;
  activeTool: Carrier | null; armed: Carrier | null;
  source: number; bucket: number; cart: number; targets: Record<Depot, number>;
  transfers: Transfer[]; trips: Trip[];
  attempts: { claim: string; evidence: number; efficiency: string; correct: boolean }[];
  concluded: boolean; report: boolean; restoration: string | null; completed: boolean;
  reflection: string; reward: 0 | 100; firstCompletedAt: string | null;
}
export const initialRimba = (): RimbaProgress => ({
  version: 1, episode: rimbaId, revision: 0, accepted: false,
  sources: {map:false,capacity:false,supply:false,habitat:false}, inspected:{A:false,B:false,C:false}, total:null,
  bucketTaken:false,parts:false,repaired:false,cOpen:false,activeTool:null,armed:null,
  source:40000,bucket:0,cart:0,targets:{A:0,B:0,C:0},transfers:[],trips:[],attempts:[],
  concluded:false,report:false,restoration:null,completed:false,reflection:'',reward:0,firstCompletedAt:null,
});
export const openTrip = (p: RimbaProgress) => p.trips.find(t=>t.end===null);
export const deliveredTools = (p: RimbaProgress) => (['bucket','cart'] as const).filter(tool=>p.transfers.some(t=>t.kind==='pour'&&t.tool===tool));
export const waterComplete = (p: RimbaProgress) => rimbaGroups.every(g=>p.targets[g]===rimbaCapacity[g]) && p.source===16000 && p.bucket===0 && p.cart===0;
export const readyToShip = (p: RimbaProgress) => p.accepted && p.sources.map && p.sources.capacity && p.sources.supply && p.total===24000;
export function transferLimit(p: RimbaProgress, kind: Transfer['kind'], tool: Carrier, target?: Depot) {
  if(kind==='fill') return Math.min(p.source,rimbaCapacity[tool]-p[tool]);
  if(kind==='return') return p[tool];
  return target ? Math.min(p[tool],rimbaCapacity[target]-p.targets[target]) : 0;
}
export type RimbaEvent =
  | {type:'accept'} | {type:'read'; source:SourceCard} | {type:'inspect';target:Depot} | {type:'total';ml:number}
  | {type:'bucket'} | {type:'parts'} | {type:'repair'} | {type:'select';tool:Carrier} | {type:'openC'}
  | {type:'arm'} | {type:'depart'} | {type:'arriveSource'} | {type:'settle';reason:TripEnd}
  | {type:'travel';distanceMm:number;movingMs:number}
  | {type:'transfer';kind:Transfer['kind'];tool:Carrier;amount:number;target?:Depot;revision:number}
  | {type:'conclude';claim:string;evidence:number;efficiency:string} | {type:'report'} | {type:'restore';choice:string}
  | {type:'reflect';text:string} | {type:'reset'};
function closeTrip(p: RimbaProgress, reason: TripEnd) {
  const t=openTrip(p);if(t){t.end=reason;t.endTransfer=p.transfers.length;}
}
export function rimbaTransition(before: RimbaProgress, e: RimbaEvent): {progress:RimbaProgress;ok:boolean;message:string} {
  const reject=(message:string)=>({progress:before,ok:false,message});
  const p=structuredClone(before);
  const success=(message:string)=>{if(e.type!=='travel')p.revision++;return {progress:p,ok:true,message};};
  if(e.type==='reset') {const next=initialRimba();next.reward=p.reward;next.firstCompletedAt=p.firstCompletedAt;next.revision=p.revision+1;return {progress:next,ok:true,message:'Latihan Pos Rimba diulang. M01, M14, dan hadiah pertama dipertahankan.'};}
  if(e.type==='accept') {if(p.accepted)return reject('Tugas sudah diterima.');p.accepted=true;return success('Baca peta aman, buku, dan catatan persediaan.');}
  if(!p.accepted)return reject('Terima tugas dari Pak Damar terlebih dahulu.');
  switch(e.type) {
    case 'read': if(p.sources[e.source])return reject('Sumber sudah dicatat.');p.sources[e.source]=true;return success('Sumber pengetahuan dicatat di jurnal.');
    case 'inspect': if(!p.sources.map)return reject('Baca peta aman dahulu.');if(p.inspected[e.target])return reject('Kebutuhan sudah dicatat.');p.inspected[e.target]=true;return success(`Kebutuhan ${e.target}: ${litres(rimbaCapacity[e.target])}.`);
    case 'total': if(!rimbaGroups.every(g=>p.inspected[g]))return reject('Periksa A dan B. Catat kebutuhan C dari peta aman.');if(e.ml!==24000)return reject('Jumlahkan 8 L + 6 L + 10 L. Coba perbaiki.');if(p.total)return reject('Total sudah dicatat.');p.total=24000;return success('Total 24 L = 24.000 mL.');
    case 'bucket': if(p.bucketTaken)return reject('Ember tetap tersedia di rak.');p.bucketTaken=true;return success('Ember kapasitas 4 L tersedia, isi tetap tersimpan saat alat ditukar.');
    case 'parts': if(p.parts)return reject('Roda dan alat sudah diambil.');p.parts=true;return success('Roda pengganti dan alat perbaikan diambil.');
    case 'repair': if(!p.parts)return reject('Ambil roda dan alat di bengkel dahulu.');if(p.repaired)return reject('Gerobak sudah diperbaiki.');p.repaired=true;return success('Roda terpasang. Gerobak kapasitas 12 L dapat didorong.');
    case 'select':
      if(e.tool==='bucket'&&!p.bucketTaken||e.tool==='cart'&&!p.repaired)return reject('Ambil ember atau selesaikan perbaikan gerobak dahulu.');
      if(p.activeTool===e.tool)return reject('Alat ini sudah aktif.');
      closeTrip(p,'switch');p.activeTool=e.tool;p.armed=null;return success(`${e.tool==='bucket'?'Ember dibawa':'Gerobak siap didorong'}. Air dalam kedua alat tetap tersimpan.`);
    case 'openC':
      if(!readyToShip(p)||p.targets.A+p.targets.B===0)return reject('Mulai pengiriman ke A atau B, lalu minta konfirmasi jalur C.');
      if(p.cOpen)return reject('Jalur C sudah dikonfirmasi aman.');p.cOpen=true;return success('Pak Damar: petugas memastikan jalur C aman. Pagar jalur dibuka.');
    case 'arm': if(!p.activeTool||p[p.activeTool]===0||p.armed===p.activeTool||openTrip(p)||p.concluded)return reject('Tidak ada muatan baru di area sumber.');p.armed=p.activeTool;return success('Muatan siap meninggalkan area sumber.');
    case 'depart':
      if(!p.activeTool||p.armed!==p.activeTool||p[p.activeTool]===0||openTrip(p)||p.concluded)return reject('Perjalanan dimulai dari area sumber dengan wadah berisi.');
      p.trips.push({id:p.trips.length+1,tool:p.activeTool,load:p[p.activeTool],startTransfer:p.transfers.length,endTransfer:null,delivered:0,distanceMm:0,movingMs:0,end:null});p.armed=null;return success('Perjalanan bermuatan dimulai.');
    case 'arriveSource': if(!openTrip(p))return reject('Tidak ada perjalanan terbuka.');closeTrip(p,'return');p.armed=p.activeTool&&p[p.activeTool]>0?p.activeTool:null;return success('Kembali ke area sumber; perjalanan dicatat.');
    case 'settle':
      if(!openTrip(p)&&p.activeTool===null&&p.armed===null)return reject('Alat sudah diparkir.');
      closeTrip(p,e.reason);p.activeTool=null;p.armed=null;return success('Alat disimpan aman di pos. Isi air dan perbaikan dipertahankan.');
    case 'travel': {
      const t=openTrip(p);if(!t||!Number.isSafeInteger(e.distanceMm)||!Number.isSafeInteger(e.movingMs)||e.distanceMm<=0||e.movingMs<=0||e.distanceMm>20000||e.movingMs>10000)return reject('Data gerak tidak sah.');
      t.distanceMm+=e.distanceMm;t.movingMs+=e.movingMs;return success('');
    }
    case 'transfer': {
      if(e.revision!==p.revision)return reject('Transaksi ini sudah berubah atau sudah diproses. Buka ulang panel.');
      if(!readyToShip(p)||p.concluded)return reject('Lengkapi peta, sumber, dan rencana total sebelum pengiriman. Latihan yang sudah disimpulkan perlu diulang untuk transaksi baru.');
      if(p.activeTool!==e.tool)return reject('Bawa wadah yang dipilih secara nyata.');
      if(e.kind==='pour'&&(!e.target||!p.inspected[e.target]||e.target==='C'&&!p.cOpen))return reject('Periksa kebutuhan dan konfirmasi jalur C kepada Pak Damar.');
      const t=openTrip(p);
      if(e.kind==='pour'&&(!t||t.tool!==e.tool||t.distanceMm<=0||t.movingMs<=0))return reject('Isi wadah di sumber dan bawa keluar dari area sumber menuju penampung.');
      if(e.kind!=='pour'&&t)return reject('Kembali ke area sumber untuk mengakhiri perjalanan dahulu.');
      const limit=transferLimit(p,e.kind,e.tool,e.target);
      if(!Number.isSafeInteger(e.amount)||e.amount<=0||e.amount%1000!==0||e.amount>limit)return reject(`Jumlah tidak sah. Pilih kelipatan 1 L, maksimal ${litres(limit)}. Tidak ada air dipindahkan.`);
      if(e.kind==='fill'){p.source-=e.amount;p[e.tool]+=e.amount;p.armed=e.tool;}
      else if(e.kind==='return'){p.source+=e.amount;p[e.tool]-=e.amount;p.armed=p[e.tool]>0?e.tool:null;}
      else {p[e.tool]-=e.amount;p.targets[e.target!]+=e.amount;t!.delivered+=e.amount;}
      p.transfers.push({id:p.transfers.length+1,kind:e.kind,tool:e.tool,amount:e.amount,target:e.kind==='pour'?e.target!:null,trip:e.kind==='pour'?t!.id:null});
      return success(`${litres(e.amount)} dipindahkan. Neraca air tetap 40 L.`);
    }
    case 'conclude': {
      if(p.concluded)return reject('Kesimpulan sudah dicatat. Minta laporan petugas.');
      const evidence=p.transfers.find(t=>t.id===e.evidence&&t.kind==='pour');
      const efficiency=deliveredTools(p).length===1?'one-tool':'observed-limits';
      const correct=waterComplete(p)&&readyToShip(p)&&p.cOpen&&e.claim==='capacity-not-content'&&!!evidence&&e.efficiency===efficiency;
      p.attempts.push({claim:e.claim,evidence:e.evidence,efficiency:e.efficiency,correct});
      if(!correct){p.revision++;return {progress:p,ok:false,message:waterComplete(p)?'Bedakan kapasitas dan isi. Pilih bukti pengiriman nyata; alat lain yang belum dicoba hanya perhitungan kapasitas. Gerobak tidak selalu tercepat.':'Lengkapi 24 L pengiriman nyata dan kembalikan sisa air dalam alat ke sumber. Jawaban saja belum menuntaskan tugas.'};}
      closeTrip(p,'complete');p.armed=null;p.concluded=true;return success('Kesimpulan berdasarkan pengiriman tercatat. Temui Pak Damar untuk laporan petugas.');
    }
    case 'report': if(!p.concluded)return reject('Lengkapi pengiriman dan kesimpulan dahulu.');if(p.report)return reject('Laporan sudah dicatat.');p.report=true;return success('Petugas melaporkan kondisi lebih terkendali. Air logistik 24 L tidak otomatis memadamkan hutan.');
    case 'restore':
      if(!p.report||!p.sources.habitat)return reject('Baca papan habitat dan terima laporan petugas dahulu.');
      if(e.choice!=='native-restore')return reject('Pilih pemulihan habitat dengan tumbuhan lokal dan pemantauan petugas; jangan memasuki area terdampak atau melepas hewan sembarangan.');
      if(p.completed)return reject('Hadiah pertama sudah tercatat.');p.restoration=e.choice;p.completed=true;p.reward=100;p.firstCompletedAt??=new Date().toISOString();return success('Bantu Pos Rimba selesai · 100 XP pertama.');
    case 'reflect': p.reflection=e.text.slice(0,1000);return success('Refleksi disimpan untuk dibaca guru, tanpa penilaian kata kunci.');
  }
}

export function parseRimba(raw: unknown): RimbaProgress {
  const fail=():never=>{throw new Error('Data Pos Rimba tidak valid: kapasitas, neraca air, perjalanan, atau langkah misi tidak konsisten.');};
  if(!raw||typeof raw!=='object')return fail();
  const p=structuredClone(raw) as RimbaProgress, base=initialRimba();
  const integer=(n:unknown,max=1e12)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max;
  if(p.version!==1||p.episode!==rimbaId||!integer(p.revision)||!p.sources||!p.inspected||!p.targets)return fail();
  for(const key of ['accepted','bucketTaken','parts','repaired','cOpen','concluded','report','completed'] as const)if(typeof p[key]!=='boolean')return fail();
  for(const key of ['map','capacity','supply','habitat'] as const)if(typeof p.sources[key]!=='boolean')return fail();
  for(const g of rimbaGroups)if(typeof p.inspected[g]!=='boolean'||!integer(p.targets[g],rimbaCapacity[g]))return fail();
  if(!integer(p.source,40000)||!integer(p.bucket,4000)||!integer(p.cart,12000)||p.total!==null&&p.total!==24000)return fail();
  if(![null,'bucket','cart'].includes(p.activeTool)||![null,'bucket','cart'].includes(p.armed)||p.activeTool==='bucket'&&!p.bucketTaken||p.activeTool==='cart'&&!p.repaired||p.armed!==null&&(p.armed!==p.activeTool||p[p.armed]===0))return fail();
  if(!Array.isArray(p.transfers)||p.transfers.length>2000||!Array.isArray(p.trips)||p.trips.length>1000||!Array.isArray(p.attempts)||p.attempts.length>1000)return fail();
  const volumes:{source:number;bucket:number;cart:number;A:number;B:number;C:number}={source:40000,bucket:0,cart:0,A:0,B:0,C:0};
  for(const [i,t]of p.transfers.entries()) {
    if(t.id!==i+1||!['fill','pour','return'].includes(t.kind)||!['bucket','cart'].includes(t.tool)||!integer(t.amount,40000)||t.amount===0||t.amount%1000!==0||t.tool==='bucket'&&!p.bucketTaken||t.tool==='cart'&&!p.repaired)return fail();
    if(t.kind==='fill'){if(t.target!==null||t.trip!==null||volumes.source<t.amount||volumes[t.tool]+t.amount>rimbaCapacity[t.tool])return fail();volumes.source-=t.amount;volumes[t.tool]+=t.amount;}
    else if(t.kind==='return'){if(t.target!==null||t.trip!==null||volumes[t.tool]<t.amount)return fail();volumes[t.tool]-=t.amount;volumes.source+=t.amount;}
    else {if(!rimbaGroups.includes(t.target!)||!integer(t.trip)||t.trip===0||volumes[t.tool]<t.amount||volumes[t.target!]+t.amount>rimbaCapacity[t.target!])return fail();volumes[t.tool]-=t.amount;volumes[t.target!]+=t.amount;}
  }
  if(volumes.source!==p.source||volumes.bucket!==p.bucket||volumes.cart!==p.cart||rimbaGroups.some(g=>volumes[g]!==p.targets[g])||p.source+p.bucket+p.cart+p.targets.A+p.targets.B+p.targets.C!==40000)return fail();
  let previousEnd=0;
  for(const [i,t]of p.trips.entries()) {
    if(t.id!==i+1||!['bucket','cart'].includes(t.tool)||!integer(t.load,rimbaCapacity[t.tool])||t.load===0||!integer(t.startTransfer,p.transfers.length)||t.startTransfer<previousEnd||!integer(t.distanceMm)||!integer(t.movingMs)||!integer(t.delivered,t.load)||t.delivered>0&&(t.distanceMm===0||t.movingMs===0))return fail();
    if(t.end===null){if(i!==p.trips.length-1||t.endTransfer!==null||p.activeTool!==t.tool)return fail();}
    else if(!['return','park','switch','leave','home','reload','complete'].includes(t.end)||!integer(t.endTransfer,p.transfers.length)||t.endTransfer!<t.startTransfer)return fail();
    const atStart={source:40000,bucket:0,cart:0};
    for(const transfer of p.transfers.slice(0,t.startTransfer)){if(transfer.kind==='fill')atStart[transfer.tool]+=transfer.amount;else atStart[transfer.tool]-=transfer.amount;}
    if(atStart[t.tool]!==t.load)return fail();
    const pours=p.transfers.filter(x=>x.trip===t.id);
    if(pours.some(x=>x.tool!==t.tool||x.id<=t.startTransfer||x.id>(t.endTransfer??p.transfers.length))||pours.reduce((sum,x)=>sum+x.amount,0)!==t.delivered)return fail();
    if(p.transfers.some(x=>x.id>t.startTransfer&&x.id<=(t.endTransfer??p.transfers.length)&&x.kind!=='pour'))return fail();
    previousEnd=t.endTransfer??p.transfers.length;
  }
  if(openTrip(p)&&p.armed!==null)return fail();
  if(p.transfers.some(t=>t.kind==='pour'&&!p.trips.some(trip=>trip.id===t.trip)))return fail();
  if(p.repaired&&!p.parts||p.cOpen&&(!readyToShip(p)||p.targets.A+p.targets.B===0)||p.targets.C>0&&!p.cOpen||p.total!==null&&!rimbaGroups.every(g=>p.inspected[g])||Object.values(p.inspected).some(Boolean)&&!p.sources.map||p.transfers.length&&!readyToShip(p)||p.revision<p.transfers.length)return fail();
  if(!p.accepted&&(Object.values(p.sources).some(Boolean)||Object.values(p.inspected).some(Boolean)||p.total!==null||p.bucketTaken||p.parts||p.repaired||p.cOpen||p.transfers.length||p.trips.length||p.attempts.length||p.concluded||p.report||p.completed))return fail();
  if(p.attempts.some(a=>typeof a.claim!=='string'||a.claim.length>100||!integer(a.evidence,2000)||typeof a.efficiency!=='string'||a.efficiency.length>100||typeof a.correct!=='boolean'||a.correct&&(a.claim!=='capacity-not-content'||a.efficiency!==(deliveredTools(p).length===1?'one-tool':'observed-limits')||!p.transfers.some(t=>t.id===a.evidence&&t.kind==='pour'))))return fail();
  if(p.concluded!==p.attempts.some(a=>a.correct)||p.concluded&&(!waterComplete(p)||openTrip(p))||p.report&&!p.concluded||p.completed&&(!p.report||!p.sources.habitat||p.restoration!=='native-restore')||!p.completed&&p.restoration!==null)return fail();
  if(![0,100].includes(p.reward)||p.firstCompletedAt!==null&&(typeof p.firstCompletedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(p.firstCompletedAt)||!Number.isFinite(Date.parse(p.firstCompletedAt)))||Boolean(p.reward)!==Boolean(p.firstCompletedAt)||p.completed&&p.reward!==100||typeof p.reflection!=='string'||p.reflection.length>1000)return fail();
  // Copy only known fields; imported data cannot smuggle UI/world state.
  return Object.fromEntries(Object.keys(base).map(k=>[k,p[k as keyof RimbaProgress]])) as unknown as RimbaProgress;
}
export function rimbaSteps(p:RimbaProgress) {
  return [
    {done:p.accepted,title:'Temui Pak Damar',detail:'Terima tugas logistik di pos aman.',place:'damar'},
    {done:p.sources.map&&p.sources.capacity&&p.sources.supply,title:'Baca peta dan dua sumber',detail:'Peta aman, Kapasitas dan Volume, Rencana Persediaan.',place:!p.sources.map?'forestMap':!p.sources.capacity?'capacityBook':'supplyNotes'},
    {done:p.total===24000,title:'Catat kebutuhan 24 L',detail:'Periksa A dan B; kebutuhan C tersedia pada peta.',place:!p.inspected.A?'receiverA':!p.inspected.B?'receiverB':'forestMap'},
    {done:p.bucketTaken||p.repaired,title:'Siapkan alat angkut',detail:'Ambil ember 4 L atau perbaiki gerobak 12 L.',place:'bucketRack'},
    {done:p.targets.A===8000&&p.targets.B===6000,title:'Kirim air ke A dan B',detail:`A ${litres(p.targets.A)}/8 L · B ${litres(p.targets.B)}/6 L. Isi, bawa, lalu tuang.`,place:p.activeTool&&p[p.activeTool]>0?(p.targets.A<8000?'receiverA':'receiverB'):'forestSource'},
    {done:p.cOpen,title:'Konfirmasi jalur C',detail:'Minta Pak Damar memastikan jalur aman.',place:'damar'},
    {done:waterComplete(p),title:'Lengkapi pengiriman 24 L',detail:`C ${litres(p.targets.C)}/10 L. Kembalikan sisa alat ke sumber.`,place:!p.cOpen?'damar':p.targets.C<10000?(p.activeTool&&p[p.activeTool]>0?'receiverC':'forestSource'):'forestSource'},
    {done:p.concluded,title:'Simpulkan dari jurnal',detail:'Bedakan kapasitas, isi, dan bukti perjalanan nyata.',place:'damar'},
    {done:p.completed,title:'Laporan dan pemulihan habitat',detail:'Baca papan habitat, terima laporan petugas, pilih pemulihan.',place:!p.sources.habitat?'habitatBoard':'damar'},
  ];
}
