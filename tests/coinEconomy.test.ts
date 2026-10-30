import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {coinRules,coinRule,newEconomy,newProfileId,parseEconomy,reconcileCoins,importEconomy,ProfileReplacementRequired,evidenceFor,eligibleEvidence,rewardId,type Economy} from '../src/game/coinEconomy';
import {initialGame,importBackup,makeBackup,BACKUP_VERSION} from '../src/game/gameState';
import {initialProgress,transition,parseProgress,resetProgress,type MissionEvent} from '../src/game/mission';
import {spaceTransition} from '../src/game/spaceMission';
import {pressureTransition} from '../src/game/pressureMission';
import {hydraulicTransition} from '../src/game/hydraulicMission';
import {solidTransition} from '../src/game/solidMission';
import {pontoonTransition} from '../src/game/pontoonMission';
import {gardenTransition} from '../src/game/gardenMission';
import {finishedGarden} from './helpers/garden';
import {workshopTransition} from '../src/game/workshopMission';
const profile='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',at='2026-10-30T01:00:00.000Z';
const fixture=JSON.parse(readFileSync('tests/fixtures/all-through-m07-v16.json','utf8'));
const seed=importBackup(structuredClone(fixture),initialGame()).game;seed.M01=finishedM01();seed.M14=finishedGarden();
const complete=()=>structuredClone(seed);
const awarded=()=>reconcileCoins(newEconomy(profile),complete(),'legacy-reconciliation',at).economy;
function finishedM01(){let p=initialProgress();for(const e of [{type:'accept'},{type:'hypothesis'},{type:'read',source:'book'},{type:'read',source:'rain'},{type:'plan',tool:'turbidity',variable:'location',control:'rain'},{type:'measure',sample:'A'},{type:'measure',sample:'B'},{type:'trial'},{type:'conclude',answer:'sediment'}] as MissionEvent[])p=transition(p,e).progress;return p;}
describe('implemented reward registry and entitlement',()=>{
 it('has only implemented full missions, distinct main/side/logistics amounts, version-independent IDs',()=>{
  expect(coinRules).toHaveLength(12);expect(new Set(coinRules.map(r=>r.id)).size).toBe(12);
  expect(coinRule('M16-E1')).toBeUndefined();expect(coinRule('M17-E3')).toBeUndefined();expect(coinRule('M20')).toBeUndefined();expect(coinRule('S17')).toBeUndefined();
  expect(coinRules.every(r=>r.coins===(r.kind==='main'?100:r.kind==='side'?30:50))).toBe(true);
  expect(rewardId(profile,'M01')).toBe(`${profile}:mission:M01`);
 });
 it('the documented legacy fixture earns exactly 770, not an imposed starting balance',()=>{
  const g=complete(),before=structuredClone(g),r=reconcileCoins(newEconomy(profile),g,'legacy-reconciliation',at);
  expect(r.economy.balance).toBe(770);expect(r.grants).toHaveLength(11);expect(r.grants.filter(x=>x.amount===100)).toHaveLength(6);expect(r.grants.filter(x=>x.amount===30)).toHaveLength(4);expect(r.grants.find(x=>x.missionId==='W03-LOG01')?.amount).toBe(50);expect(g).toEqual(before);
  expect(reconcileCoins(newEconomy(other),initialGame(),'legacy-reconciliation',at).economy.balance).toBe(0);
 });
 it('checkpoints, XP totals and active mission do not qualify',()=>{
  const g=initialGame();g.world.activeMission='M07';g.M01=transition(initialProgress(),{type:'accept'}).progress;
  expect(reconcileCoins(newEconomy(profile),g,'mission-completion',at).grants).toEqual([]);
  const bad={...g.M01,completed:true,reward:100};expect(eligibleEvidence(coinRule('M01')!,{M01:bad})).toBe(false);
 });
 it.each(['M01','S13','W03-LOG01'])('validates actual evidence for %s and deduplicates repeated completions',id=>{
  const g=complete(),rule=coinRule(id)!,evidence=evidenceFor(rule,g)!;expect(eligibleEvidence(rule,evidence)).toBe(true);
  const r=reconcileCoins(newEconomy(profile),g,'mission-completion',at),again=reconcileCoins(r.economy,g,'mission-completion','2026-10-31T00:00:00.000Z');
  expect(again.grants).toEqual([]);expect(again.economy).toEqual(r.economy);
 });
 it.each(['M16E1','M16E2','M16E3','M16E4'] as const)('M16 needs simultaneous completion including %s',key=>{
  const g=complete();const reset={M16E1:pressureTransition,M16E2:hydraulicTransition,M16E3:solidTransition,M16E4:pontoonTransition}[key] as any;g[key]=reset(g[key],{type:'reset'}).progress;
  expect(evidenceFor(coinRule('M16')!,g)).toBeNull();expect(g[key].reward).toBe(50);
  const r=reconcileCoins(awarded(),g,'mission-completion',at);expect(r.economy.balance).toBe(770);expect(r.grants).toEqual([]);
 });
 it('one episode XP proof does not grant M17, and independently historical M16 episodes do not prove a chapter',()=>{
  const g=complete();g.M17E1=workshopTransition(g.M17E1,{type:'reset'}).progress;
  g.M16E1=pressureTransition(g.M16E1,{type:'reset'}).progress;g.M16E2=hydraulicTransition(g.M16E2,{type:'reset'}).progress;g.M16E3=solidTransition(g.M16E3,{type:'reset'}).progress;g.M16E4=pontoonTransition(g.M16E4,{type:'reset'}).progress;
  const r=reconcileCoins(newEconomy(profile),g,'legacy-reconciliation',at);expect(r.grants.some(r=>['M16','M17'].includes(r.missionId))).toBe(false);expect(r.economy.balance).toBe(570);
  expect(reconcileCoins(r.economy,complete(),'mission-completion',at).economy.balance).toBe(770);
 });
 it('known replay-validated historical receipts can backfill, arbitrary extra rewardProof fields cannot',()=>{
  const g=complete();g.M07=spaceTransition(g.M07,{type:'reset'}).progress;expect(evidenceFor(coinRule('M07')!,g)).not.toBeNull();
  const resetGarden={...initialGame().M14,rewardProof:{fake:true}};
  expect(eligibleEvidence(coinRule('M14')!,{M14:resetGarden})).toBe(false);
 });
 it('native per-mission receipts survive legacy reset without relying on total XP',()=>{const g=complete();g.M14=gardenTransition(g.M14,{type:'reset'}).progress;expect(evidenceFor(coinRule('M14')!,g)).not.toBeNull();const raw=JSON.parse(readFileSync('tests/fixtures/m01-v1.json','utf8'));expect(reconcileCoins(newEconomy(profile),importBackup(raw,complete()).game,'legacy-reconciliation',at).economy.balance).toBe(770);});
 it('reset/recompletion preserves M01 XP evidence without extra coins',()=>{
  const p=finishedM01(),reset=resetProgress(p);expect(reset.completed).toBe(false);expect(reset.reward).toBe(100);expect(parseProgress(reset)).toEqual(reset);
  const g=initialGame();g.M01=p;const wallet=reconcileCoins(newEconomy(profile),g,'mission-completion',at).economy;g.M01=reset;
  expect(reconcileCoins(wallet,g,'mission-completion',at).grants).toEqual([]);
  const old=importBackup(initialProgress(),g).game;expect(old.M01.reward).toBe(100);expect(old.M01.completed).toBe(false);
  expect(()=>parseProgress({...reset,rewardProof:{at,evidence:{...p,rewardProof:{}}}})).toThrow();
 });
});
describe('receipt and integer validation',()=>{
 it('creates UUID identities without secure-context-only randomUUID',()=>{const ids=Array.from({length:20},()=>newProfileId());expect(new Set(ids).size).toBe(20);for(const id of ids)expect(parseEconomy(newEconomy(id)).profileId).toBe(id);});
 it.each([-1,.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])('rejects invalid balance %s',balance=>{expect(()=>parseEconomy({...awarded(),balance})).toThrow();});
 it.each([-100,30,100.5,NaN,Number.MAX_SAFE_INTEGER+1])('rejects an amount inconsistent with rules %s',amount=>{const w=awarded();w.ledger[0].amount=amount;expect(()=>parseEconomy(w)).toThrow();});
 it.each(['M20','M16-E1','S17','__proto__'])('rejects unregistered receipt %s',missionId=>{const w=awarded();w.ledger[0].missionId=missionId;w.ledger[0].id=rewardId(profile,missionId);expect(()=>parseEconomy(w)).toThrow();});
 it('rejects duplicate IDs, fake proofs, profiles, versions, source, date, spend and balance drift',()=>{
  const mutations:((w:Economy)=>void)[]=[w=>w.ledger.push(w.ledger[0]),w=>w.ledger[0].evidence={},w=>w.profileId='not-a-profile',w=>(w.ledger[0] as any).ruleVersion=2,w=>(w.ledger[0] as any).source='visit',w=>w.ledger[0].at='yesterday',w=>(w.ledger[0] as any).kind='shop-spend',w=>w.balance++,w=>{delete (w.ledger.find(r=>r.missionId==='M16')!.evidence as any)['M16-E4'];}];
  for(const mutate of mutations){const w=awarded();mutate(w);expect(()=>parseEconomy(w)).toThrow();}
  expect(()=>newEconomy('bad')).toThrow();
 });
});
describe('backup monotonic ledger contract',()=>{
 it('exports v19 with identity, receipts, evidence and appearance',()=>{
  const g=complete();g.economy=awarded();const b=makeBackup(g);expect(BACKUP_VERSION).toBe(19);expect(b.version).toBe(19);expect(b.economy?.profileId).toBe(profile);expect(importBackup(b,initialGame()).game).toEqual(g);
 });
 it('same-profile old backup cannot remove a later receipt; repeated import never sums balances',()=>{
  const full=awarded(),old=structuredClone(full);old.ledger.pop();old.balance-=50;
  expect(importEconomy(full,old)).toEqual(full);expect(importEconomy(old,full)).toEqual(full);expect(importEconomy(full,full)).toEqual(full);
  const g=complete();g.economy=full;const before=structuredClone(g);const b=makeBackup(g);b.economy=old;expect(importBackup(b,g).game.economy).toEqual(full);expect(g).toEqual(before);
 });
 it('semantic field ordering is accepted; divergent transactions reject without mutation',()=>{
  const w=awarded(),reordered=JSON.parse(JSON.stringify(w,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).reverse()):v));expect(importEconomy(w,reordered)).toEqual(reordered);
  const fork=structuredClone(w);fork.ledger[0].at='2026-10-31T00:00:00.000Z';expect(()=>importEconomy(w,fork)).toThrow('bercabang');expect(w).toEqual(awarded());
 });
 it('different profiles require explicit whole restoration and never merge XP or coin histories',()=>{
  const a=complete();a.economy=awarded();const b=initialGame();b.economy=newEconomy(other);const backup=makeBackup(b);
  expect(()=>importBackup(backup,a)).toThrow(ProfileReplacementRequired);
  const restored=importBackup(backup,a,{replaceProfile:true}).game;expect(restored.economy?.balance).toBe(0);expect(restored.economy?.profileId).toBe(other);expect(restored.M01.reward).toBe(0);expect(restored.M17E1.reward).toBe(0);expect(a.economy.balance).toBe(770);
 });
 const files=readdirSync('tests/fixtures').filter(f=>/v\d+\.json$/.test(f));
 for(const file of [...files,'../docs/evidence/visual-stage-03/applied-backup-v18.json'])it(`legacy ${file} preserves wallet and receipts`,()=>{
  const g=complete();g.economy=awarded();const path=file.startsWith('../')?file.slice(3):`tests/fixtures/${file}`,raw=JSON.parse(readFileSync(path,'utf8'));const imported=importBackup(raw,g).game;
  expect(imported.economy).toEqual(g.economy);const newGrants=reconcileCoins(g.economy,imported,'legacy-reconciliation',at).grants;expect(newGrants.every(r=>!g.economy!.ledger.some(old=>old.id===r.id))).toBe(true);expect(newGrants.map(r=>r.missionId)).toEqual(file.includes('v18')?['M02']:[]);
 });
 it('a v19 coin receipt cannot be paired with missing XP history',()=>{const g=complete();g.economy=awarded();const b=makeBackup(g);b.missions.M01=initialProgress();expect(()=>importBackup(b,g)).toThrow('XP');});
 it('invalid economy or mission evidence rejects before replacing active progress',()=>{
  const g=complete();g.economy=awarded();const before=structuredClone(g),bad=makeBackup(g);bad.economy!.balance=1;
  expect(()=>importBackup(bad,g)).toThrow();expect(g).toEqual(before);bad.economy=g.economy;bad.missions.M01.samples.A!.value=0;expect(()=>importBackup(bad,g)).toThrow();expect(g).toEqual(before);
 });
});
