import { describe, expect, it } from 'vitest';
import { initialRimba, parseRimba, rimbaTransition, inSourceZone, openTrip, waterComplete, type RimbaProgress } from '../src/game/rimbaMission';
import { RimbaSession } from '../src/game/rimbaSession';
import { initialGame, importBackup, makeBackup } from '../src/game/gameState';
import { preparedRimba, deliveredRimba, finishedRimba, rimbaAct, transfer, depart } from './helpers/rimba';
import { findPath, walkable, sweepAxis } from '../src/engine/navigation';
import { rimbaNavigation, rimbaPlaces, rimbaCartConfig } from '../src/data/rimbaRegion';
import { MovementController } from '../src/engine/movement';
const balance=(p:RimbaProgress)=>p.source+p.bucket+p.cart+p.targets.A+p.targets.B+p.targets.C;
describe('W03-LOG01 atomic logistics',()=>{
  it('requires actual mission preparation, quantities, safety and carriage, never only a final answer',()=>{
    expect(rimbaTransition(initialRimba(),{type:'transfer',kind:'fill',tool:'bucket',amount:4000,revision:0}).ok).toBe(false);
    let p=preparedRimba();expect(parseRimba(p)).toEqual(p);
    expect(rimbaTransition(p,{type:'conclude',claim:'capacity-not-content',evidence:0,efficiency:'one-tool'}).ok).toBe(false);
    expect(rimbaTransition(p,{type:'openC'}).ok).toBe(false);
    p=transfer(p,'fill',4000);
    expect(rimbaTransition(p,{type:'transfer',kind:'pour',tool:'bucket',amount:1000,target:'A',revision:p.revision}).ok).toBe(false);
    p=rimbaAct(p,{type:'depart'});
    expect(rimbaTransition(p,{type:'transfer',kind:'pour',tool:'bucket',amount:1000,target:'A',revision:p.revision}).ok).toBe(false);
    p=rimbaAct(p,{type:'travel',distanceMm:1000,movingMs:200});
    expect(rimbaTransition(p,{type:'transfer',kind:'pour',tool:'bucket',amount:1000,target:'C',revision:p.revision}).ok).toBe(false);
  });
  it('conserves all 40,000 mL, rejects overflow atomically, and deduplicates stale double clicks',()=>{
    let p=preparedRimba();const event={type:'transfer' as const,kind:'fill' as const,tool:'bucket' as const,amount:3000,revision:p.revision};
    p=rimbaAct(p,event);expect([p.source,p.bucket,balance(p)]).toEqual([37000,3000,40000]);
    expect(rimbaTransition(p,event).progress).toBe(p);
    for(const amount of [-1000,0,.5,2000,5000]){const r=rimbaTransition(p,{...event,amount,revision:p.revision});expect(r.ok).toBe(false);expect(r.progress).toBe(p);}
    p=transfer(p,'fill',1000);p=depart(p);p=transfer(p,'pour',2000,'A');
    expect([p.bucket,p.targets.A,balance(p)]).toEqual([2000,2000,40000]);
    const pour={...event,kind:'pour' as const,amount:1000,target:'B' as const,revision:p.revision};p=rimbaAct(p,pour);
    expect(rimbaTransition(p,pour).progress).toBe(p);expect(parseRimba(p)).toEqual(p);
  });
  it('retains water independently when exchanging tools and can return unused water to the source',()=>{
    let p=transfer(preparedRimba(),'fill',4000);p=rimbaAct(p,{type:'select',tool:'cart'});p=transfer(p,'fill',12000);
    expect([p.bucket,p.cart,p.source]).toEqual([4000,12000,24000]);
    p=rimbaAct(p,{type:'select',tool:'bucket'});p=transfer(p,'return',2000);expect([p.bucket,p.cart,p.source,balance(p)]).toEqual([2000,12000,26000,40000]);
    expect(parseRimba(p)).toEqual(p);
  });
  it.each(['bucket','cart'] as const)('finishes the full %s scenario with exactly 24 L delivered, 16 L left and one first reward',tool=>{
    const p=finishedRimba(tool);expect(p.completed).toBe(true);expect(p.reward).toBe(100);expect(waterComplete(p)).toBe(true);expect(balance(p)).toBe(40000);expect(parseRimba(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(p.trips).toHaveLength(tool==='bucket'?6:2);
    expect(rimbaTransition(p,{type:'restore',choice:'native-restore'}).progress).toBe(p);
    const reset=rimbaAct(p,{type:'reset'});expect(reset.source).toBe(40000);expect(reset.reward).toBe(100);expect(reset.firstCompletedAt).toBe(p.firstCompletedAt);expect(parseRimba(reset)).toEqual(reset);
    const current={...initialGame(),Rimba:p};const restored=importBackup(makeBackup(initialGame()),current).game.Rimba;
    expect(restored.reward).toBe(100);expect(restored.firstCompletedAt).toBe(p.firstCompletedAt);
  });
  it('accepts a mixed plan, records incorrect answers, and never invents an untested tool result',()=>{
    let p=depart(transfer(preparedRimba(),'fill',4000));p=transfer(p,'pour',4000,'A');p=rimbaAct(p,{type:'openC'});p=rimbaAct(p,{type:'arriveSource'});p=rimbaAct(p,{type:'select',tool:'cart'});
    p=depart(transfer(p,'fill',12000));p=transfer(p,'pour',4000,'A');p=transfer(p,'pour',6000,'B');p=transfer(p,'pour',2000,'C');p=rimbaAct(p,{type:'arriveSource'});
    p=depart(transfer(p,'fill',8000));p=transfer(p,'pour',8000,'C');expect(waterComplete(p)).toBe(true);
    const e={type:'conclude' as const,claim:'capacity-not-content',evidence:2,efficiency:'cart-always'};
    const wrong=rimbaTransition(p,e);expect(wrong.ok).toBe(false);p=wrong.progress;
    p=rimbaAct(p,{...e,efficiency:'observed-limits'});expect(p.attempts.map(a=>a.correct)).toEqual([false,true]);
    expect(rimbaTransition(p,{type:'restore',choice:'native-restore'}).ok).toBe(false);
    p=rimbaAct(p,{type:'report'});expect(rimbaTransition(p,{type:'restore',choice:'release-animals'}).ok).toBe(false);p=rimbaAct(p,{type:'restore',choice:'native-restore'});expect(parseRimba(p)).toEqual(p);
    const bucket=deliveredRimba('bucket');expect(rimbaTransition(bucket,{type:'conclude',claim:'capacity-not-content',evidence:2,efficiency:'observed-limits'}).ok).toBe(false);
  });
  it('requires empty tools after delivery and accepts returning an overfilled reserve without water loss',()=>{
    let p=preparedRimba('bucket');p=transfer(p,'fill',4000);p=rimbaAct(p,{type:'select',tool:'cart'});
    const done=deliveredRimba('cart'); // reproduce its water transfers while keeping a reserve in the bucket
    for(const t of done.transfers){if(t.kind==='fill'){if(openTrip(p))p=rimbaAct(p,{type:'arriveSource'});p=transfer(p,'fill',t.amount);p=depart(p);}else if(t.kind==='pour'){if(t.target==='C'&&!p.cOpen)p=rimbaAct(p,{type:'openC'});p=transfer(p,'pour',t.amount,t.target!);}}
    expect(p.source).toBe(12000);expect(waterComplete(p)).toBe(false);
    p=rimbaAct(p,{type:'arriveSource'});p=rimbaAct(p,{type:'select',tool:'bucket'});p=transfer(p,'return',4000);expect(waterComplete(p)).toBe(true);expect(parseRimba(p)).toEqual(p);
  });
  it('preserves Rimba on old v1/v2 imports; rejects new corrupt data before replacing any mission',()=>{
    const current={...initialGame(),Rimba:finishedRimba()};
    const legacy1={...initialGame().M01};expect(importBackup(legacy1,current).game.Rimba).toEqual(current.Rimba);
    const legacy2={version:2,missions:{M01:current.M01,M14:current.M14},world:{region:'town',activeMission:'M01'}};
    expect(importBackup(legacy2,current).scope).toBe('both');expect(importBackup(legacy2,current).game.Rimba).toEqual(current.Rimba);
    const raw=makeBackup(current);raw.missions['W03-LOG01'].source=-1;
    const clean={...initialGame(),Rimba:finishedRimba()};const before=structuredClone(clean);
    expect(()=>importBackup(raw,clean)).toThrow();expect(clean).toEqual(before);expect(current.Rimba.source).toBe(16000);
  });
  it.each([
    (p:RimbaProgress)=>{p.source=-1;},p=>{p.cart=12001;},p=>{p.targets.A=9000;},p=>{p.bucket=1;},
    p=>{p.transfers[0].amount=13000;},p=>{p.transfers[0].amount=-1000;},p=>{p.transfers[1].trip=999;},
    p=>{p.trips[0].load=1;},p=>{p.trips[0].delivered=0;},p=>{p.trips[0].distanceMm=-1;},p=>{p.trips[0].movingMs=-1;},p=>{p.trips[0].distanceMm=0;},p=>{p.trips[0].movingMs=0;},
    p=>{p.cOpen=false;},p=>{p.repaired=false;},p=>{p.parts=false;},p=>{p.total=null;},p=>{p.inspected.A=false;},
    p=>{p.sources.map=false;},p=>{p.completed=true;},p=>{p.report=true;},p=>{p.reward=100;},p=>{p.firstCompletedAt='not-date';},
  ])('validates capacities, replay ledger, travel, mission stages and rewards (%#)',mutate=>{
    const p=deliveredRimba();mutate(p);expect(()=>parseRimba(p)).toThrow();
  });
});
describe('real travel metrics and cart footprint',()=>{
  it('counts a loaded trip on departure, not repeated fills; excludes pauses and repair/reading time',()=>{
    let p=transfer(preparedRimba(),'fill',1000);p=transfer(p,'fill',1000);
    const send=(e:Parameters<typeof rimbaTransition>[1])=>{p=rimbaTransition(p,e).progress;};const session=new RimbaSession(()=>p,send);
    session.motion(.1,.02,{x:-6,z:9});expect(p.trips).toHaveLength(0);
    session.motion(.2,.04,{x:-6,z:4.9});session.motion(0,10,{x:-6,z:4.9});session.motion(.3,.06,{x:-6,z:4.5});session.flush();
    expect(p.trips).toHaveLength(1);expect(p.trips[0].distanceMm).toBe(500);expect(p.trips[0].movingMs).toBe(100);
    session.motion(.1,.02,{x:-6,z:5.1});expect(openTrip(p)).toBeUndefined();expect(p.trips[0].end).toBe('return');
    expect(inSourceZone({x:2,z:8})).toBe(true);expect(parseRimba(p)).toEqual(p);
    session.settle('reload');expect(p.activeTool).toBeNull();expect([p.bucket,p.source]).toEqual([2000,38000]);
  });
  it('keeps C physically blocked until confirmation and connects every accessible cart approach without cutting obstacles',()=>{
    const closed=rimbaNavigation(false,true),area=rimbaNavigation(true,true);
    expect(findPath({x:2,z:10.8},{x:5,z:-6.2},closed)).toEqual([]);
    const starts=rimbaPlaces.map(p=>({x:p.x,z:p.z+rimbaCartConfig.approach}));
    for(const start of starts)for(const end of starts){const path=findPath(start,end,area);expect(path.length,`${JSON.stringify(start)} -> ${JSON.stringify(end)}`).toBeGreaterThan(0);expect(path.every(p=>walkable(p,area))).toBe(true);
      const motion=new MovementController(),p={...start};let arrives=0;
      for(let i=0;i<250;i++){const r=motion.step(p,{x:0,z:0},0,true,path,.1,area,rimbaCartConfig);if(r.arrived)arrives++;expect(walkable(p,area)).toBe(true);if(!path.length)break;}
      expect(p).toEqual(end);expect(arrives).toBe(1);
    }
    const playerArea=rimbaNavigation(true,false);expect(area.radius).toBeGreaterThan(playerArea.radius!);
    expect(sweepAxis({x:9,z:5.8},'x',-20,area)).toBeGreaterThan(sweepAxis({x:9,z:5.8},'x',-20,playerArea));
  });
});

it('uses the shared Damar rig and keeps the rotating cart within its collision footprint',async()=>{
  const {Group,Vector3,Box3}=await import('three');const {buildRimba}=await import('../src/engine/rimbaWorld');const {createCharacter}=await import('../src/engine/character');const {characterBodyBounds}=await import('../src/engine/characterModel');
  const rig=createCharacter('damar','damar');const body=characterBodyBounds(rig);expect(body.max.y-body.min.y).toBeCloseTo(1.74,6);rig.root.traverse(o=>expect(o.userData.place).toBe('damar'));
  const view=buildRimba({root:new Group(),box:()=>{},label:()=>{},npc:()=>{}});view.update(preparedRimba('cart'));
  for(const yaw of [0,.7,Math.PI]){
    view.frame(new Vector3(),yaw,1,true,false);view.cart.updateMatrixWorld(true);view.cart.traverse(node=>{
      if(!('geometry'in node))return;const mesh=node as import('three').Mesh;const points=mesh.geometry.getAttribute('position');
      for(let i=0;i<points.count;i++){const v=new Vector3().fromBufferAttribute(points,i).applyMatrix4(mesh.matrixWorld);expect(Math.hypot(v.x,v.z)).toBeLessThanOrEqual(rimbaCartConfig.radius);}
    });
  }
  expect(view.wheelAngle()).toBeCloseTo(3/rimbaCartConfig.wheelRadius);const angle=view.wheelAngle();view.frame(new Vector3(),0,0,true,false);expect(view.wheelAngle()).toBe(angle);
  view.frame(new Vector3(4,0,3),0,1,true,true);expect(view.wheelAngle()).toBe(angle);expect(view.cart.position.toArray()).toEqual([4,0,3]);expect(new Box3().setFromObject(view.cart,true).min.y).toBeGreaterThanOrEqual(.04);
});
