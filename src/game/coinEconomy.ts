import {missionRecords,type RecordId} from './missionRecords';
import type {GameState} from './gameState';

export interface CoinRule {
 id:string; name:string; kind:'main'|'side'|'special'; coins:number; ruleVersion:1;
 records:readonly RecordId[];
}
/** Register only implemented missions. Episodes deliberately have no coin rule. */
export const coinRules:readonly CoinRule[]=[
 {id:'M01',name:'Detektif Air Kota',kind:'main',coins:100,ruleVersion:1,records:['M01']},
 {id:'M02',name:'Persediaan Es Pasar',kind:'main',coins:100,ruleVersion:1,records:['M02']},
 {id:'M07',name:'Catatan dari Observatorium',kind:'main',coins:100,ruleVersion:1,records:['M07']},
 {id:'M13',name:'Pesan dari Geopark',kind:'main',coins:100,ruleVersion:1,records:['M13']},
 {id:'M14',name:'Kebun Percobaan',kind:'main',coins:100,ruleVersion:1,records:['M14']},
 {id:'M16',name:'Tekanan · empat episode',kind:'main',coins:100,ruleVersion:1,records:['M16-E1','M16-E2','M16-E3','M16-E4']},
 {id:'M17',name:'Bengkel dan Energi · tiga episode',kind:'main',coins:100,ruleVersion:1,records:['M17-E1','M17-E2','M17-E3']},
 {id:'S13',name:'Catatan Ikan Dua Titik',kind:'side',coins:30,ruleVersion:1,records:['S13']},
 {id:'S14',name:'Terapung atau Tenggelam?',kind:'side',coins:30,ruleVersion:1,records:['S14']},
 {id:'S15',name:'Misteri Saluran Irigasi',kind:'side',coins:30,ruleVersion:1,records:['S15']},
 {id:'S16',name:'Jaring Kehidupan Pesisir',kind:'side',coins:30,ruleVersion:1,records:['S16']},
 {id:'W03-LOG01',name:'Bantu Pos Rimba',kind:'special',coins:50,ruleVersion:1,records:['W03-LOG01']},
];
export type CoinEvidence=Partial<Record<RecordId,unknown>>;
export interface CoinReceipt {
 id:string; kind:'mission-reward'; missionId:string; amount:number; ruleVersion:1;
 source:'mission-completion'|'legacy-reconciliation'; at:string; evidence:CoinEvidence;
}
export interface Economy {version:1;profileId:string;balance:number;ledger:CoinReceipt[];}
const profilePattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail=():never=>{throw Error('Dompet tidak valid: profil, bukti, riwayat atau saldo tidak konsisten.');};
const replayedReceipts=new Set<RecordId>(['M01','M02','M07','M13','S16']);
// These older formats intentionally retain an XP receipt/date after clearing
// observations on reset. Respect that per-mission receipt, not the total XP.
const nativeReceipts=new Set<RecordId>(['M14','W03-LOG01','S13','S14','S15']);
// Keep historical amounts independent of the current registry when rules evolve.
const coinRuleVersions={1:{main:100,side:30,special:50}} as const;
const canonical=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export const rewardId=(profile:string,mission:string)=>`${profile}:mission:${mission}`;
export function newProfileId(){
 // randomUUID requires a secure context; getRandomValues also works on HTTP LAN.
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function newEconomy(profileId=newProfileId()):Economy {
 if(!profilePattern.test(profileId))return fail();
 return {version:1,profileId,balance:0,ledger:[]};
}
export function coinRule(id:string){return coinRules.find(r=>r.id===id);}
export function eligibleEvidence(rule:CoinRule,raw:unknown):boolean {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const evidence=raw as CoinEvidence;
 if(Object.keys(evidence).length!==rule.records.length||!rule.records.every(id=>Object.hasOwn(evidence,id)))return false;
 try{return rule.records.every(id=>{
  const p=missionRecords[id].parse(evidence[id]);
  // A chapter needs simultaneous completion, never a bag of episode XP receipts.
  return p.completed||(rule.records.length===1&&(
   replayedReceipts.has(id)&&'rewardProof' in p&&!!p.rewardProof&&p.reward>0||
   nativeReceipts.has(id)&&p.reward>0&&'firstCompletedAt' in p&&typeof p.firstCompletedAt==='string'
  ));
 });}catch{return false;}
}
export function evidenceFor(rule:CoinRule,game:GameState):CoinEvidence|null {
 const evidence=Object.fromEntries(rule.records.map(id=>[id,game[missionRecords[id].property]]));
 return eligibleEvidence(rule,evidence)?structuredClone(evidence):null;
}
/** Reset may clear learning evidence, but an earned coin cannot lose its XP receipt. */
export function assertCoinXP(economy:Economy,records:Record<string,unknown>){
 for(const receipt of economy.ledger)for(const id of coinRule(receipt.missionId)!.records){
  const expected=(receipt.evidence[id] as {reward:number}).reward;
  if(!expected||(records[id] as {reward?:unknown}|undefined)?.reward!==expected)
   throw Error('Bukti XP dan receipt koin tidak konsisten. Impor ditolak tanpa mengubah progres.');
 }
}
/** Balance is checked against the immutable ledger, never accepted on its own. */
export function parseEconomy(raw:unknown):Economy {
 if(!raw||typeof raw!=='object')return fail();
 const e=raw as Economy;
 if(e.version!==1||typeof e.profileId!=='string'||!profilePattern.test(e.profileId)||
  !Number.isSafeInteger(e.balance)||e.balance<0||!Array.isArray(e.ledger)||e.ledger.length>coinRules.length)return fail();
 const seen=new Set<string>();let balance=0;
 for(const r of e.ledger){
  if(!r||typeof r!=='object')return fail();
  const rule=coinRule(r.missionId);
  if(!rule||r.kind!=='mission-reward'||r.ruleVersion!==1||r.amount!==coinRuleVersions[1][rule.kind]||
   r.id!==rewardId(e.profileId,rule.id)||seen.has(r.id)||
   !['mission-completion','legacy-reconciliation'].includes(r.source)||
   typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at))||new Date(r.at).toISOString()!==r.at||
   !eligibleEvidence(rule,r.evidence))return fail();
  seen.add(r.id);balance+=r.amount;if(!Number.isSafeInteger(balance))return fail();
 }
 if(balance!==e.balance)return fail();
 return structuredClone(e);
}
export function reconcileCoins(economy:Economy,game:GameState,source:CoinReceipt['source'],at=new Date().toISOString()) {
 const next=parseEconomy(economy),grants:CoinReceipt[]=[];
 for(const rule of coinRules){
  const id=rewardId(next.profileId,rule.id);if(next.ledger.some(r=>r.id===id))continue;
  const evidence=evidenceFor(rule,game);if(!evidence)continue;
  const receipt:CoinReceipt={id,kind:'mission-reward',missionId:rule.id,amount:rule.coins,ruleVersion:1,source,at,evidence};
  next.ledger.push(receipt);next.balance+=rule.coins;grants.push(receipt);
 }
 return {economy:parseEconomy(next),grants};
}
export class ProfileReplacementRequired extends Error {
 constructor(){super('Cadangan ini milik profil lokal berbeda. Pemulihan utuh mengganti profil dan dompet aktif, bukan menjumlahkan saldo. Ekspor profil saat ini dahulu, lalu konfirmasikan pemulihan.');}
}
/** Append-only prefix contract also preserves future expense/purchase transactions. */
export function importEconomy(current:Economy|null|undefined,incoming:Economy|null|undefined,replaceProfile=false):Economy|null {
 const a=current?parseEconomy(current):null,b=incoming?parseEconomy(incoming):null;
 if(!b)return a;if(!a)return b;
 if(a.profileId!==b.profileId){if(!replaceProfile)throw new ProfileReplacementRequired();return b;}
 const shorter=a.ledger.length<=b.ledger.length?a:b,longer=shorter===a?b:a;
 if(!shorter.ledger.every((r,i)=>canonical(r)===canonical(longer.ledger[i])))
  throw Error('Riwayat profil sama bercabang atau berubah. Impor ditolak; saldo dan progres aktif tetap utuh. Gunakan cadangan yang berasal dari riwayat berurutan.');
 return longer;
}
