import {cosmetic} from '../data/appearanceCatalog';
import {cosmeticPriceHistory,historicalCosmeticPrice} from '../data/paidCosmetics';
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
export interface PurchaseReceipt {id:string;kind:'cosmetic-purchase';itemId:string;amount:number;priceVersion:number;source:'boutique';at:string;}
export type EconomyTransaction=CoinReceipt|PurchaseReceipt;
export interface Economy {version:2;profileId:string;balance:number;ledger:EconomyTransaction[];owned:string[];}
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
 return {version:2,profileId,balance:0,ledger:[],owned:[]};
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
 for(const receipt of economy.ledger){if(receipt.kind!=='mission-reward')continue;for(const id of coinRule(receipt.missionId)!.records){
  const expected=(receipt.evidence[id] as {reward:number}).reward;
  if(!expected||(records[id] as {reward?:unknown}|undefined)?.reward!==expected)
   throw Error('Bukti XP dan receipt koin tidak konsisten. Impor ditolak tanpa mengubah progres.');
 }}
}
/** Balance is checked against the immutable ledger, never accepted on its own. */
export function parseEconomy(raw:unknown):Economy {
 if(!raw||typeof raw!=='object')return fail();
 const e=raw as Omit<Economy,'version'|'owned'>&{version:1|2;owned?:string[]};
 const historicalItems=new Set(Object.values(cosmeticPriceHistory).flatMap(prices=>Object.keys(prices)));
 if(![1,2].includes(e.version)||typeof e.profileId!=='string'||!profilePattern.test(e.profileId)||
  !Number.isSafeInteger(e.balance)||e.balance<0||!Array.isArray(e.ledger)||e.ledger.length>coinRules.length+historicalItems.size)return fail();
 const seen=new Set<string>(),owned:string[]=[];let balance=0;
 for(const r of e.ledger){
  if(!r||typeof r!=='object'||typeof r.id!=='string'||seen.has(r.id)||typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at))||new Date(r.at).toISOString()!==r.at)return fail();
  if(r.kind==='mission-reward'){
   const rule=coinRule(r.missionId);
   if(!rule||r.ruleVersion!==1||r.amount!==coinRuleVersions[1][rule.kind]||r.id!==rewardId(e.profileId,rule.id)||!['mission-completion','legacy-reconciliation'].includes(r.source)||!eligibleEvidence(rule,r.evidence))return fail();
   balance+=r.amount;
  }else if(r.kind==='cosmetic-purchase'&&e.version===2){
   if(typeof r.itemId!=='string'||!Number.isSafeInteger(r.priceVersion)||r.priceVersion<1)return fail();
   const price=historicalCosmeticPrice(r.itemId,r.priceVersion);
   if(price===undefined||r.amount!==price||r.id!==purchaseId(e.profileId,r.itemId)||r.source!=='boutique'||owned.includes(r.itemId))return fail();
   balance-=r.amount;owned.push(r.itemId);
  }else return fail();
  seen.add(r.id);if(!Number.isSafeInteger(balance)||balance<0)return fail();
 }
 owned.sort();
 if(balance!==e.balance)return fail();
 if(e.version===2&&(!Array.isArray(e.owned)||JSON.stringify(e.owned)!==JSON.stringify(owned)))return fail();
 if(e.version===1&&e.owned?.length)return fail();
 return {version:2,profileId:e.profileId,balance,ledger:structuredClone(e.ledger),owned};
}
export const purchaseId=(profile:string,item:string)=>`${profile}:purchase:${item}`;
export class CosmeticPurchaseError extends Error {
 constructor(readonly reason:'owned'|'funds'|'catalog'|'price',message:string){super(message);}
}
/** The caller supplies an ID and consent version, never a price or resulting balance. */
export function purchaseCosmetic(economy:Economy,itemId:string,expectedPriceVersion:number,at=new Date().toISOString()){
 const next=parseEconomy(economy),item=cosmetic(itemId);
 if(!item||item.available===false||item.access!=='paid')throw new CosmeticPurchaseError('catalog','Barang tidak tersedia untuk dibeli.');
 if(item.priceVersion!==expectedPriceVersion||item.price===undefined||historicalCosmeticPrice(item.id,item.priceVersion)!==item.price)throw new CosmeticPurchaseError('price','Versi harga berubah atau tidak valid. Tinjau katalog lagi.');
 if(next.owned.includes(item.id))throw new CosmeticPurchaseError('owned','Barang ini sudah dimiliki. Pembelian tidak diulang.');
 if(next.balance<item.price)throw new CosmeticPurchaseError('funds',`Koin kurang ${item.price-next.balance}. Koin diperoleh dari misi, bukan uang nyata.`);
 const receipt:PurchaseReceipt={id:purchaseId(next.profileId,item.id),kind:'cosmetic-purchase',itemId:item.id,amount:item.price,priceVersion:item.priceVersion,source:'boutique',at};
 next.ledger.push(receipt);next.balance-=item.price;next.owned.push(item.id);next.owned.sort();
 return {economy:parseEconomy(next),receipt};
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
