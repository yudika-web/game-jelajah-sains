import {parseAppearance} from './appearance';
import {initialGame,parseTravel,type GameState} from './gameState';
import {parseProgress,type Progress} from './mission';
import {missionRecords,missionEntries} from './missionRecords';
import {newEconomy,parseEconomy,importEconomy,reconcileCoins,assertCoinXP,type Economy,type CoinReceipt} from './coinEconomy';

// Schema 2 fences old compiled clients that write without a revision check.
// The existing generic store and every mission key are retained, not recreated.
export const DATABASE_VERSION=2;
interface SaveMeta {version:1;revision:number;profileId:string;}
export interface StoredGame extends GameState {economy:Economy;saveRevision:number;coinGrants:CoinReceipt[];}
export interface SaveResult {economy:Economy;saveRevision:number;coinGrants:CoinReceipt[];}
export class SaveConflict extends Error {
 constructor(){super('Progres sudah berubah di tab lain. Tab ini tidak boleh menimpa data terbaru. Muat ulang tab ini untuk melanjutkan, dan gunakan satu tab permainan.');}
}
const open=()=>new Promise<IDBDatabase>((resolve,reject)=>{
 let blocked=false;const request=indexedDB.open('jelajah-sains',DATABASE_VERSION);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('saves'))request.result.createObjectStore('saves');};
 request.onsuccess=()=>{if(blocked){request.result.close();return;}request.result.onversionchange=()=>request.result.close();resolve(request.result);};
 request.onerror=()=>reject(request.error);
 request.onblocked=()=>{blocked=true;reject(Error('Tutup tab permainan versi lama, lalu muat ulang. Penyimpanan dan progres tidak dihapus.'));};
});
const keys=[...Object.keys(missionRecords),'appearance','world','economy','save-meta'];
const historyKey=(profile:string)=>`economy-history:${profile}`;
function decode(values:Record<string,unknown>):GameState {
 const game=initialGame();
 for(const [id,record] of Object.entries(missionRecords))if(values[id]!==undefined)
  (game as unknown as Record<string,unknown>)[record.property]=record.parse(values[id]);
 if(values.appearance!=null)game.appearance=parseAppearance(values.appearance);
 if(values.world!==undefined)game.world=parseTravel(values.world);
 return game;
}
function metaOf(value:unknown):SaveMeta|null {
 if(value===undefined)return null;const m=value as SaveMeta;
 if(!m||m.version!==1||!Number.isSafeInteger(m.revision)||m.revision<1||typeof m.profileId!=='string')throw Error('Revisi penyimpanan tidak valid; data lama tidak ditimpa.');
 return m;
}
/** Reads, compare-and-swap, receipts, XP and mission writes share one transaction. */
async function transaction<T>(mode:IDBTransactionMode,apply:(values:Record<string,unknown>,store:IDBObjectStore)=>T,extraKeys:string[]=[],readKeys=keys):Promise<T>{
 const db=await open();
 try{return await new Promise<T>((resolve,reject)=>{
  const allKeys=[...new Set([...readKeys,...extraKeys])];
  const tx=db.transaction('saves',mode),store=tx.objectStore('saves'),values:Record<string,unknown>={};let remaining=allKeys.length,result:T,error:unknown;
  for(const key of allKeys){const r=store.get(key);r.onsuccess=()=>{values[key]=r.result;if(--remaining===0)try{result=apply(values,store);}catch(e){error=e;tx.abort();}};}
  tx.oncomplete=()=>resolve(result!);tx.onerror=()=>reject(error??tx.error??Error('Transaksi penyimpanan gagal.'));
  tx.onabort=()=>reject(error??tx.error??Error('Transaksi dibatalkan; progres dan koin belum tersimpan.'));
 });}finally{db.close();}
}
export async function loadGame():Promise<StoredGame>{
 return transaction('readwrite',(values,store)=>{
  const game=decode(values),meta=metaOf(values['save-meta']);
  if(!meta&&values.economy!==undefined)throw Error('Dompet tanpa revisi penyimpanan tidak dapat dipulihkan otomatis.');
  if(meta&&values.economy===undefined)throw Error('Dompet profil hilang; data tidak ditimpa otomatis. Pulihkan cadangan yang utuh.');
  const wallet=values.economy===undefined?newEconomy():parseEconomy(values.economy);
  assertCoinXP(wallet,Object.fromEntries(Object.entries(missionRecords).map(([id,r])=>[id,game[r.property]])));
  if(meta&&meta.profileId!==wallet.profileId)throw Error('Profil dan revisi dompet tidak sesuai.');
  const {economy,grants}=reconcileCoins(wallet,game,'legacy-reconciliation');
  let revision=meta?.revision??0;
  if(!meta||grants.length){revision++;if(!Number.isSafeInteger(revision))throw Error('Batas revisi penyimpanan tercapai.');store.put(economy,'economy');store.put(economy,historyKey(economy.profileId));store.put({version:1,revision,profileId:economy.profileId} satisfies SaveMeta,'save-meta');}
  return {...game,economy,saveRevision:revision,coinGrants:grants};
 });
}
export async function saveGame(game:GameState,options:{importing?:boolean;replaceProfile?:boolean}={}):Promise<SaveResult>{
 const entries=missionEntries(game),appearance=game.appearance?parseAppearance(game.appearance):null,world=parseTravel(game.world);
 if(game.economy)parseEconomy(game.economy);
 return transaction('readwrite',(values,store)=>{
  const meta=metaOf(values['save-meta']);
  if(!meta||game.saveRevision!==meta.revision)throw new SaveConflict();
  const latest=parseEconomy(values.economy);
  if(latest.profileId!==meta.profileId)throw Error('Profil penyimpanan tidak konsisten.');
  if(!options.importing&&game.economy?.profileId!==latest.profileId)throw new SaveConflict();
  let wallet=latest;
  if(options.importing){
   // First enforce confirmation for a foreign active profile, then reconcile
   // against that profile's own high-water ledger (never the other balance).
   importEconomy(latest,game.economy,options.replaceProfile);
   const checkpoint=game.economy?values[historyKey(game.economy.profileId)]:undefined;
   const incoming=checkpoint?importEconomy(parseEconomy(checkpoint),game.economy):game.economy;
   wallet=importEconomy(latest,incoming,options.replaceProfile)!;
  }
  assertCoinXP(wallet,Object.fromEntries(entries));
  const validated=decode(Object.fromEntries([...entries,['appearance',appearance],['world',world]]));
  const {economy,grants}=reconcileCoins(wallet,validated,options.importing?'legacy-reconciliation':'mission-completion');
  const revision=meta.revision+1;if(!Number.isSafeInteger(revision))throw Error('Batas revisi penyimpanan tercapai.');
  for(const [key,value] of entries)store.put(value,key);
  store.put(appearance,'appearance');store.put(world,'world');store.put(economy,'economy');
  if(latest.profileId!==economy.profileId)store.put(latest,historyKey(latest.profileId));
  store.put(economy,historyKey(economy.profileId));
  store.put({version:1,revision,profileId:economy.profileId} satisfies SaveMeta,'save-meta');
  return {economy,saveRevision:revision,coinGrants:grants};
 },options.importing&&game.economy?[historyKey(game.economy.profileId)]:[]);
}
/** Legacy helper follows the same guarded, atomic path. */
export async function loadProgress():Promise<Progress|null>{return transaction('readonly',v=>v.M01===undefined?null:parseProgress(v.M01),[],['M01']);}
export async function saveProgress(p:Progress,expectedRevision:number):Promise<void>{const current=await loadGame();current.M01=p;current.saveRevision=expectedRevision;await saveGame(current);}
/** The gallery is read-only and never initializes or migrates a wallet. */
export async function loadAppearance(){return transaction('readonly',values=>values.appearance==null?null:parseAppearance(values.appearance),[],['appearance']);}
