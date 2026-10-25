import { describe, it, expect } from 'vitest';
import { initialRiver, riverTransition, parseRiver, riverCounts, nextFish, siteRecords, correctRiverAnswers, type RiverProgress, type RiverEvent } from '../src/game/riverMission';
import { fishingDataset, samplingModel, riverCards, fishGroups, type FishingSite } from '../src/data/riverContent';
import { FishingSession } from '../src/game/fishingSession';
import { initialGame, makeBackup, importBackup } from '../src/game/gameState';
import { riverPlaces, riverNavigation, fishingPositions } from '../src/data/riverRegion';
import { findPath, walkable } from '../src/engine/navigation';
import { MovementController } from '../src/engine/movement';
import { createCharacter } from '../src/engine/character';
import { characterBodyBounds } from '../src/engine/characterModel';
import { readFileSync } from 'node:fs';
function act(p:RiverProgress,event:RiverEvent) {const r=riverTransition(p,event);if(!r.ok)throw new Error(r.message);return r.progress;}
export function preparedRiver() {
 let p=act(initialRiver(),{type:'accept'});
 for(const source of ['observation','procedure','limits'] as const)p=act(p,{type:'read',source});
 p=act(p,{type:'rod'});return act(p,{type:'plan',choices:samplingModel});
}
function record(p:RiverProgress,site:FishingSite) {return act(p,{type:'record',site,index:siteRecords(p,site).length,feature:nextFish(p,site),note:'Ciri yang terlihat.',revision:p.revision});}
export function observedRiver() {let p=preparedRiver();for(const site of ['A','B','A','B','A','B'] as const)p=record(p,site);return p;}
describe('S13 deterministic sampling and atomic release',()=>{
 it('needs acceptance, knowledge, rod, and a fair plan',()=>{
  let p=initialRiver();expect(riverTransition(p,{type:'rod'}).ok).toBe(false);
  p=act(p,{type:'accept'});expect(riverTransition(p,{type:'plan',choices:samplingModel}).ok).toBe(false);
  p=preparedRiver();expect(parseRiver(p)).toEqual(p);
 });
 it('keeps incorrect plans and lets the player correct only changed conditions',()=>{
  let p=preparedRiver();p=act(p,{type:'reset'});p=act(p,{type:'accept'});
  for(const source of ['observation','procedure'] as const)p=act(p,{type:'read',source});
  const wrong=riverTransition(p,{type:'plan',choices:{...samplingModel,bait:'different'}});expect(wrong.ok).toBe(false);p=wrong.progress;expect(p.plans[0].correct).toBe(false);
  p=act(p,{type:'plan',choices:samplingModel});expect(p.plans.map(a=>a.correct)).toEqual([false,true]);expect(parseRiver(p)).toEqual(p);
 });
 it('uses A flat flat long and B whiskered long whiskered in any interleaving',()=>{
  const p=observedRiver();for(const site of ['A','B'] as const)expect(siteRecords(p,site).map(r=>r.group)).toEqual(fishingDataset[site]);expect(p.records.every(r=>r.released)).toBe(true);expect(parseRiver(p)).toEqual(p);
 });
 it('does not record wrong features and preserves the next deterministic fish',()=>{
  let p=preparedRiver();const r=riverTransition(p,{type:'record',site:'A',index:0,feature:'whiskered',note:'',revision:p.revision});expect(r.ok).toBe(false);p=r.progress;
  expect(p.records).toHaveLength(0);expect(nextFish(p,'A')).toBe('flat');expect(p.fishAttempts[0].correct).toBe(false);
  p=record(p,'A');expect(p.records).toHaveLength(1);expect(parseRiver(p)).toEqual(p);
 });
 it('rejects stale double clicks, repeated indexes, and a fourth fish',()=>{
  let p=preparedRiver();const event:RiverEvent={type:'record',site:'A',index:0,feature:'flat',note:'',revision:p.revision};p=act(p,event);expect(riverTransition(p,event).progress).toBe(p);
  p=record(record(p,'A'),'A');expect(riverTransition(p,{...event,index:3,revision:p.revision}).ok).toBe(false);expect(p.records).toHaveLength(3);
 });
 it('keeps unobserved sites unknown and derives both table and chart from approved records',()=>{
  let p=preparedRiver();expect(riverCounts(p).flat).toEqual({A:null,B:null});p=record(p,'A');expect(riverCounts(p).flat).toEqual({A:1,B:null});expect(riverCounts(p).long.A).toBe(0);
  expect(riverCounts(observedRiver())).toEqual({flat:{A:2,B:0},long:{A:1,B:1},whiskered:{A:0,B:2}});
 });
 it('cannot finish via the conclusion alone, requires six records and all sources',()=>{
  let p=preparedRiver();expect(riverTransition(p,{type:'conclude',answers:correctRiverAnswers}).ok).toBe(false);
  p=observedRiver();p.sources.limits=false;expect(riverTransition(p,{type:'conclude',answers:correctRiverAnswers}).ok).toBe(false);
 });
 it('stores an incorrect conclusion, corrected answer and reflection without keyword grading',()=>{
  let p=observedRiver();const wrong=riverTransition(p,{type:'conclude',answers:{...correctRiverAnswers,causeLimit:'clean'}});p=wrong.progress;expect(wrong.ok).toBe(false);expect(p.completed).toBe(false);
  p=act(p,{type:'reflect',text:'<script>tidak otomatis dinilai</script>'});p=act(p,{type:'conclude',answers:correctRiverAnswers});expect(p.conclusions.map(a=>a.correct)).toEqual([false,true]);expect(p.reward).toBe(50);expect(parseRiver(p)).toEqual(p);
 });
 it('awards only once after repeat and older backup import',()=>{
  const finished=act(observedRiver(),{type:'conclude',answers:correctRiverAnswers});const reset=act(finished,{type:'reset'});expect(reset.records).toEqual([]);expect(reset.reward).toBe(50);expect(parseRiver(reset)).toEqual(reset);
  let again=observedRiver();again={...again,reward:reset.reward,firstCompletedAt:reset.firstCompletedAt};again=act(again,{type:'conclude',answers:correctRiverAnswers});expect(again.reward).toBe(50);expect(again.firstCompletedAt).toBe(finished.firstCompletedAt);
  const current={...initialGame(),S13:finished};const imported=importBackup(makeBackup(initialGame()),current).game;expect(imported.S13.reward).toBe(50);expect(imported.S13.records).toHaveLength(0);
 });
 for(const [label,mutate]of [
  ['duplicate record',(p:any)=>p.records.push(p.records[0])],['wrong dataset',(p:any)=>p.records[0].group='long'],['wrong location',(p:any)=>p.records[0].site='Z'],['unreleased fish',(p:any)=>p.records[0].released=false],['future index',(p:any)=>p.records[0].index=2],['fake conclusion',(p:any)=>{p.completed=true;p.reward=50;p.firstCompletedAt=new Date().toISOString();}],['invalid reward',(p:any)=>p.reward=100],['fake plan',(p:any)=>p.plan=false],['missing attempt',(p:any)=>p.fishAttempts=[]],['false successful attempt',(p:any)=>p.fishAttempts[0].feature='long'],['bad source',(p:any)=>p.sources.observation='yes'],['bad revision',(p:any)=>p.revision=-1],
 ] as const)it(`validates imported ${label}`,()=>{const p=structuredClone(observedRiver());mutate(p);expect(()=>parseRiver(p)).toThrow('S13 tidak valid');});
 it('validates all data before replacing current state; backup versions 1-3 preserve S13',()=>{
  const game={...initialGame(),S13:record(preparedRiver(),'B')};
  const v1=JSON.parse(readFileSync(new URL('./fixtures/m01-v1.json',import.meta.url),'utf8'));
  const v2=JSON.parse(readFileSync(new URL('./fixtures/m01-m14-v2.json',import.meta.url),'utf8'));
  const v3=makeBackup(initialGame()) as any;v3.version=3;delete v3.missions.S13;
  for(const backup of [v1,v2,v3])expect(importBackup(backup,game).game.S13).toEqual(game.S13);
  const v4=makeBackup(game);expect(v4.version).toBe(8);expect(importBackup(v4,initialGame()).game).toEqual(game);
  const bad=structuredClone(v4);bad.missions.S13.records[0].group='flat';expect(()=>importBackup(bad,game)).toThrow();expect(game.S13.records[0].group).toBe('whiskered');
 });
 it('imports an actual pre-S13 v3 completed-cart fixture without losing S13 or its first reward',()=>{
  const old=JSON.parse(readFileSync(new URL('./fixtures/m01-m14-rimba-v3.json',import.meta.url),'utf8'));
  const river=act(observedRiver(),{type:'conclude',answers:correctRiverAnswers});
  const result=importBackup(old,{...initialGame(),S13:river});
  expect(result.scope).toBe('three');expect(result.game.S13).toEqual(river);
  expect(result.game.Rimba.source).toBe(16000);expect(result.game.Rimba.targets).toEqual({A:8000,B:6000,C:10000});expect(result.game.Rimba.repaired).toBe(true);expect(result.game.Rimba.completed).toBe(true);expect(result.game.Rimba.reward).toBe(100);expect(result.game.M14.day).toBe(4);expect(result.game.M01.samples.A?.value).toBe(70);
 });
 it('has three short Indonesian cards of 35-70 words',()=>{for(const c of Object.values(riverCards)){const n=c.text.split(/\s+/).length;expect(n).toBeGreaterThanOrEqual(35);expect(n).toBeLessThanOrEqual(70);}});
});
describe('transient fishing state',()=>{
 it('follows casting waiting ready observing released, with no reaction deadline',()=>{
  const s=new FishingSession();expect(s.pull()).toBe(false);expect(s.start('A',0)).toBe(true);expect(s.start('B',0)).toBe(false);
  for(let i=0;i<10;i++)s.tick(.1,true);expect(s.phase).toBe('waiting');for(let i=0;i<16;i++)s.tick(.1,true);expect(s.phase).toBe('ready');
  for(let i=0;i<500;i++)s.tick(.1,true);expect(s.phase).toBe('ready');expect(s.pull()).toBe(true);expect(s.pull()).toBe(false);expect(s.release()).toBe(true);expect(s.release()).toBe(false);for(let i=0;i<8;i++)s.tick(.1,true);expect(s.phase).toBe('idle');
 });
 it('pauses when hidden, unfocused or suspended; long time gaps do not catch up',()=>{
  const s=new FishingSession();s.start('B',0);s.tick(.4,true);const before=s.elapsed;for(let i=0;i<100;i++)s.tick(.1,false);expect(s.elapsed).toBe(before);s.tick(600,true);expect(s.elapsed-before).toBeCloseTo(.1);expect(s.phase).toBe('casting');
 });
 it('cancel/reload leaves no record and does not reroll next outcome',()=>{
  const p=preparedRiver(),s=new FishingSession();s.start('B',0);s.cancel();expect(s.phase).toBe('idle');expect(nextFish(p,'B')).toBe('whiskered');expect(new FishingSession().active).toBe(false);expect(parseRiver(p)).toEqual(p);
 });
});
describe('shore navigation, collision, rig and controls regression',()=>{
 it('reaches all interaction approaches including the pier from every other one',()=>{
  const points=[{x:-2,z:11},...riverPlaces.filter(p=>p.id!=='poolBuoy').map(p=>({x:p.x,z:p.z+(['poolRamp','boatStart','boatObservation'].includes(p.id)?0:1.4)})),...Object.values(fishingPositions)];
  for(const a of points)for(const b of points){if((a.x>15)!==(b.x>15)){expect(findPath(a,b,riverNavigation)).toEqual([]);continue;}const path=findPath(a,b,riverNavigation);expect(path.length,JSON.stringify({a,b})).toBeGreaterThan(0);let prev=a;for(const p of path){for(let i=0;i<=10;i++)expect(walkable({x:prev.x+(p.x-prev.x)*i/10,z:prev.z+(p.z-prev.z)*i/10},riverNavigation)).toBe(true);prev=p;}}
 });
 it('cannot run into water or leave the pier at several frame intervals',()=>{
  for(const dt of [1/120,1/60,1/30,1/10])for(const [x,z]of [[1,5],[7,-7]]){
   const movement=new MovementController(),p={x,z};for(let i=0;i<3/dt;i++)movement.step(p,{x:1,z:0},0,true,[],dt,riverNavigation);
   expect(walkable(p,riverNavigation)).toBe(true);expect(p.x).toBeLessThanOrEqual(z===5?2.55:9.55);
  }
  expect(findPath({x:1,z:5},{x:6,z:5},riverNavigation)).toEqual([]);expect(walkable({x:7,z:-4},riverNavigation)).toBe(false);
 });
 it('uses the same six-block rig for Lestari, and rod cannot change player height',()=>{
  const npc=createCharacter('lestari','lestari');expect(npc.core).toHaveLength(6);expect(characterBodyBounds(npc).max.y-characterBodyBounds(npc).min.y).toBeCloseTo(1.68);npc.root.traverse(n=>expect(n.userData.place).toBe('lestari'));
  const p=createCharacter('explorer'),before=characterBodyBounds(p);p.tools.rod.visible=true;expect(characterBodyBounds(p)).toEqual(before);expect(p.tools.rod.getObjectByName('rod-tip')).toBeDefined();
 });
});
