import { describe, it, expect } from 'vitest';
import { average, gardenTransition, heightsAt, initialGarden, parseGarden, seedsRemaining, type GardenEvent } from '../src/game/gardenMission';
import { initialGame, importBackup, makeBackup } from '../src/game/gameState';
import { preparedGarden, observedGarden, finishedGarden, gardenAct } from './helpers/garden';
import { regions } from '../src/data/regions';
import { findPath, walkable } from '../src/engine/navigation';
import { readFileSync } from 'node:fs';

describe('M14 controlled growth experiment',()=> {
  it('requires acceptance, one changed variable, tools and six identical seeds',()=> {
    expect(gardenTransition(initialGarden(),{type:'borrow'}).ok).toBe(false);
    const accepted=gardenAct(initialGarden(),{type:'accept'});
    for(const e of [{type:'plan',variable:'water-light',controls:'same',water:'100-50'}, {type:'plant',group:'A',seed:'mung'}] as GardenEvent[]) expect(gardenTransition(accepted,e).ok).toBe(false);
    const p=preparedGarden(); expect(seedsRemaining(p)).toBe(0);
    expect(gardenTransition(p,{type:'plant',group:'A',seed:'mung'}).progress).toBe(p);
    expect(gardenTransition(p,{type:'borrow'}).progress).toBe(p);
  });
  it('transfers only the free can capacity, conserves water, and never applies a partial dose',()=> {
    let p=preparedGarden();
    expect(gardenTransition(p,{type:'water',group:'A',day:0}).progress).toBe(p);
    p=gardenAct(p,{type:'fill'}); expect([p.can,p.tank]).toEqual([1000,4000]);
    p=gardenAct(p,{type:'water',group:'A',day:0}); expect(p.can).toBe(700);
    expect(gardenTransition(p,{type:'water',group:'A',day:0}).progress).toBe(p);
    p=gardenAct(p,{type:'fill'});expect([p.can,p.tank]).toEqual([1000,3700]);
    expect(parseGarden(p)).toEqual(p);
    const partial={...preparedGarden(),can:300,tank:4700};
    const filled=gardenAct(partial,{type:'fill'}); expect([filled.can,filled.tank]).toEqual([1000,4000]);
    const insufficient={...preparedGarden(),can:100,tank:4900};
    expect(gardenTransition(insufficient,{type:'water',group:'B',day:0}).progress).toBe(insufficient);
  });
  it('requires scheduled observations and treatment before advancing exactly one simulated day',()=> {
    let p=gardenAct(preparedGarden(),{type:'fill'});
    for(const group of ['A','B'] as const) p=gardenAct(p,{type:'water',group,day:0});
    expect(gardenTransition(p,{type:'advance',day:0}).ok).toBe(false);
    for(const group of ['A','B'] as const) p=gardenAct(p,{type:'measure',group,day:0});
    p=gardenAct(p,{type:'advance',day:0});expect(p.day).toBe(1);
    expect(gardenTransition(p,{type:'advance',day:0}).progress).toBe(p);
    expect(gardenTransition(p,{type:'advance',day:1}).ok).toBe(false);
    expect(gardenTransition(p,{type:'measure',group:'A',day:2}).ok).toBe(false);
    expect(gardenTransition(p,{type:'measure',group:'A',day:1}).ok).toBe(false);
    expect(gardenTransition(p,{type:'water',group:'A',day:0}).ok).toBe(false);
  });
  it('measures only on explicit events, and uses deterministic data consistent with visual interpolation',()=> {
    const p=observedGarden(2); expect(p.measurements).toHaveLength(4);
    expect(heightsAt(1,'A')).toEqual([1,1,1]);expect(heightsAt(3,'B')).toEqual([2,1.5,2.5]);
    const end=observedGarden();expect(end.measurements).toHaveLength(8);
    for(const m of end.measurements) expect(m.heights).toEqual(heightsAt(m.day,m.group));
    expect(end.measurements.filter(m=>m.day===6).map(m=>average(m.heights))).toEqual([8,5]);
    expect(end.can+end.tank).toBe(2300);expect(parseGarden(end)).toEqual(end);
    expect(gardenTransition(end,{type:'measure',group:'A',day:6}).progress).toBe(end);
    expect(gardenTransition(end,{type:'advance',day:6}).ok).toBe(false);
    expect(JSON.parse(JSON.stringify(end))).toEqual(end);
  });
  it('requires complete evidence, a supported claim and a bounded conclusion; reflection is never graded',()=> {
    expect(gardenTransition(preparedGarden(),{type:'conclude',claim:'model-A',evidence:'day6-8-5',limit:'limited'}).ok).toBe(false);
    let p=observedGarden();
    for(const choices of [{claim:'unlimited',evidence:'day6-8-5',limit:'limited'},{claim:'model-A',evidence:'looks',limit:'limited'},{claim:'model-A',evidence:'day6-8-5',limit:'universal'}]) {
      const r=gardenTransition(p,{type:'conclude',...choices});expect(r.ok).toBe(false);p=r.progress;
    }
    p=gardenAct(p,{type:'reflect',text:'Saya ingin menguji dosis lain. <script>bukan kode</script>'});
    expect(p.completed).toBe(false);expect(p.reflection).toContain('<script>');
    p=gardenAct(p,{type:'conclude',claim:'model-A',evidence:'day6-8-5',limit:'limited'});
    expect(p.completed).toBe(true);expect(p.reward).toBe(100);expect(p.attempts.map(a=>a.correct)).toEqual([false,false,false,true]);
    expect(parseGarden(p)).toEqual(p);
  });
  it('preserves the first reward across reload, repeat actions, experiment reset and older imports',()=> {
    const done=finishedGarden(); const reload=parseGarden(JSON.parse(JSON.stringify(done)));
    expect(gardenTransition(reload,{type:'conclude',claim:'model-A',evidence:'day6-8-5',limit:'limited'}).progress).toBe(reload);
    const reset=gardenAct(reload,{type:'reset'});expect(reset.day).toBe(0);expect(reset.planted.A).toBe(false);expect(reset.reward).toBe(100);expect(reset.firstCompletedAt).toBe(done.firstCompletedAt);
    expect(parseGarden(reset)).toEqual(reset);
    const current={...initialGame(),M14:done};const old=makeBackup(initialGame());
    const restored=importBackup(old,current).game.M14;expect(restored.reward).toBe(100);expect(restored.firstCompletedAt).toBe(done.firstCompletedAt);
    const repeat=gardenAct({...observedGarden(),reward:100,firstCompletedAt:done.firstCompletedAt},{type:'conclude',claim:'model-A',evidence:'day6-8-5',limit:'limited'});
    expect(repeat.reward).toBe(100);expect(repeat.firstCompletedAt).toBe(done.firstCompletedAt);
  });
  it.each([
    (p: ReturnType<typeof observedGarden>)=>{p.can=-1;},
    p=>{p.can=1001;},p=>{p.tank=-1;},p=>{p.tank=5001;},p=>{p.day=7;},
    p=>{p.can+=1;},p=>{p.measurements.push({day:6,group:'A',heights:[8,7,9]});},
    p=>{p.measurements[0].heights=[99,0,0];},p=>{p.watered[4].A=true;},
    p=>{p.reward=100;},p=>{p.completed=true;},p=>{p.measurements=[];},
  ])('rejects invalid volumes, future data, altered measurements and inconsistent rewards (%#)', mutate=> {
    const p=observedGarden(2);mutate(p);expect(()=>parseGarden(p)).toThrow();
  });
  it('retains M14 when importing old M01 version 1, and round-trips the new backup separately from DB schema',()=> {
    const old=JSON.parse(readFileSync(new URL('./fixtures/m01-v1.json',import.meta.url),'utf8'));
    const current={...initialGame(),M14:observedGarden(4),world:{region:'garden' as const,activeMission:'M14' as const}};
    const result=importBackup(old,current);expect(result.scope).toBe('M01');expect(result.game.M14).toEqual(current.M14);expect(result.game.world).toEqual(current.world);
    expect(importBackup(JSON.parse(JSON.stringify(makeBackup(result.game))),initialGame()).game).toEqual(result.game);
    const before=structuredClone(current);expect(()=>importBackup({...makeBackup(current),world:{region:'moon'}},current)).toThrow();expect(current).toEqual(before);
  });
});

describe('region-aware navigation',()=> {
  it('connects every garden approach to every other approach using garden obstacles',()=> {
    const r=regions.garden;
    for(const a of [r.spawn,...r.places.map(p=>({x:p.x,z:p.z+1.4}))]) for(const p of r.places) {
      const end={x:p.x,z:p.z+1.4}, path=findPath(a,end,r.navigation);
      expect(path.length,`garden ${JSON.stringify(a)} to ${p.id}`).toBeGreaterThan(0);
      expect(path.every(point=>walkable(point,r.navigation))).toBe(true);expect(path.at(-1)).toEqual(end);
    }
    // The city school occupies this garden lane; city blockers must not leak into W02.
    expect(walkable({x:-8,z:-6},r.navigation)).toBe(true);expect(walkable({x:-8,z:-6},regions.town.navigation)).toBe(false);
    expect(walkable({x:-5,z:-3},r.navigation)).toBe(false);
  });
});
