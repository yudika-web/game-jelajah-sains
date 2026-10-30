import {describe,it,expect,vi} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import * as THREE from 'three';
import {appearanceCatalog,cosmeticSlots} from '../src/data/appearanceCatalog';
import {defaultAppearance,parseAppearance,chooseCosmetic,appearanceItems,appearanceKey,resolvedAppearance} from '../src/game/appearance';
import {initialGame,makeBackup,importBackup,BACKUP_VERSION} from '../src/game/gameState';
import {createCharacter,setTemporaryEquipment} from '../src/engine/character';
import {characterBodyBounds} from '../src/engine/characterModel';
import {CharacterAnimator} from '../src/engine/characterAnimator';
import {WardrobePreview} from '../src/engine/wardrobePreview';
import {disposeRegion} from '../src/engine/disposeRegion';
const custom=()=>({...defaultAppearance('student-girl'),outfit:'outfit-teal',hair:'hair-shoulder',headwear:'cap-explorer',facewear:'glasses-round'});
describe('stable free catalog and slot validation',()=>{
 it('has two outfits, four hair silhouettes, two removable accessories and a backpack option for both bases',()=>{
  expect(new Set(appearanceCatalog.map(i=>i.id)).size).toBe(appearanceCatalog.length);
  for(const base of ['student-boy','student-girl'] as const){expect(appearanceItems('outfit',base)).toHaveLength(2);expect(appearanceItems('hair',base)).toHaveLength(4);for(const slot of cosmeticSlots)expect(appearanceItems(slot,base).length).toBeGreaterThan(0);}
  expect(appearanceCatalog.every(i=>i.access==='free')).toBe(true);expect(defaultAppearance('student-girl').outfit).not.toBe(defaultAppearance().outfit);expect(defaultAppearance('student-girl').hair).not.toBe(defaultAppearance().hair);
 });
 it('rejects cross-slot, unknown, inherited and future IDs without altering the chosen appearance',()=>{
  const a=custom(),before=structuredClone(a);expect(chooseCosmetic(a,'headwear','outfit-teal')).toBe(a);expect(chooseCosmetic(a,'hair','__proto__')).toBe(a);
  expect(parseAppearance({...a,outfit:'future-paid',headwear:'outfit-coral',hair:'constructor'},a)).toEqual(a);expect(a).toEqual(before);
  expect(parseAppearance({version:1,base:'student-girl',hair:'unknown'}).hair).toBe('hair-tied');expect(parseAppearance(null)).toEqual(defaultAppearance());
 });
 it('temporary helmets override headwear and hair without changing personal choices',()=>{
  const a=custom(),before=structuredClone(a),r=createCharacter('explorerGirl',undefined,a);
  expect(r.cosmetics!.crown.visible).toBe(false);expect(r.cosmetics!.fringe.scale.y).toBe(.68);
  for(const gear of ['dive','astronaut'] as const){setTemporaryEquipment(r,gear);expect(r.cosmetics!.headwear.visible).toBe(false);expect(r.cosmetics!.hair.visible).toBe(false);expect(r.cosmetics!.equipment.visible).toBe(true);expect(resolvedAppearance(a,gear).visibleHeadwear).toBe('head-none');expect(r.appearance).toEqual(before);}
  setTemporaryEquipment(r,'none');expect(r.cosmetics!.headwear.visible).toBe(true);expect(r.cosmetics!.equipment.visible).toBe(false);expect(r.appearance).toEqual(a);disposeRegion(r.root);
 });
});
describe('same body, rig and tools for every free combination',()=>{
 it('keeps all 128 combinations at 1.60 body height, grounded, with six rigid blocks and the same sockets',()=>{
  let scale:number|undefined,socket:THREE.Vector3|undefined;
  for(const base of ['student-boy','student-girl'] as const)for(const outfit of ['outfit-teal','outfit-coral'])for(const hair of ['hair-crop','hair-sweep','hair-shoulder','hair-tied'])for(const headwear of ['head-none','cap-explorer'])for(const facewear of ['face-none','glasses-round'])for(const backpack of ['pack-mustard','back-none']){
   const a={version:1 as const,base,outfit,hair,headwear,facewear,backpack},r=createCharacter('explorer',undefined,a),b=characterBodyBounds(r);expect(r.core).toHaveLength(6);expect(b.max.y-b.min.y).toBeCloseTo(1.6,6);expect(b.min.y).toBeCloseTo(.1,6);expect(r.root.scale.toArray()).toEqual([1,1,1]);
   const position=r.rightArm.toolSocket.getWorldPosition(new THREE.Vector3());scale??=r.dimensions.scale;socket??=position;expect(r.dimensions.scale).toBe(scale);expect(position.distanceTo(socket)).toBeLessThan(1e-8);
   expect(new THREE.Box3().setFromObject(r.core[1]).intersectsBox(new THREE.Box3().setFromObject(r.core[2]))).toBe(true);disposeRegion(r.root);
  }
 });
 it('measures body only, never hair, hats, backpacks, labels or large tools',()=>{
  const r=createCharacter('explorerGirl',undefined,custom()),before=characterBodyBounds(r);
  r.cosmetics!.hair.scale.setScalar(10);r.cosmetics!.headwear.scale.setScalar(10);r.cosmetics!.backpack.scale.setScalar(10);r.labelSocket.position.y=500;Object.values(r.tools).forEach(t=>{t.visible=true;t.scale.setScalar(10);});expect(characterBodyBounds(r)).toEqual(before);disposeRegion(r.root);
 });
 it('walk, run and every interaction keep navigation root fixed and tools attached to original sockets',()=>{
  for(const hair of ['hair-crop','hair-sweep','hair-shoulder','hair-tied']){const r=createCharacter('explorerGirl',undefined,{...custom(),hair}),anim=new CharacterAnimator(r);r.root.position.set(8,0,5);const start=r.root.position.clone();
   for(const speed of [0,5.2,8]){for(let i=0;i<30;i++)anim.update(1/60,speed/60);expect(r.root.position).toEqual(start);expect(characterBodyBounds(r).min.y).toBeGreaterThan(.075);}
   for(const pose of ['read','measure','sample','water','ruler','fishCast','fishWait','fishPull'] as const){anim.setPose(pose);anim.update(.1,0);expect(r.root.position).toEqual(start);}
   anim.boating=true;anim.update(.1,0);expect(r.root.position).toEqual(start);expect(r.tools.rod.parent).toBe(r.rightArm.toolSocket);expect(r.tools.bucket.parent).toBe(r.rightArm.toolSocket);disposeRegion(r.root);
  }
 });
 it('preview uses the factory and releases only its own resources; a live avatar keeps shared assets',()=>{
  const a=custom(),world=createCharacter('explorerGirl',undefined,a),preview=new WardrobePreview(a);expect(preview.rig.dimensions).toEqual(world.dimensions);expect(appearanceKey(preview.rig.appearance!)).toBe(appearanceKey(a));
  const geometrySpy=vi.spyOn(world.core[0].geometry,'dispose'),mat=Array.isArray(world.core[1].material)?world.core[1].material[4]:world.core[1].material,matSpy=vi.spyOn(mat,'dispose');
  for(let i=0;i<5;i++)preview.setAppearance({...a,hair:i%2?'hair-crop':'hair-tied'});preview.dispose();expect(geometrySpy).not.toHaveBeenCalled();expect(matSpy).not.toHaveBeenCalled();expect(characterBodyBounds(world).max.y).toBeCloseTo(1.7,6);geometrySpy.mockRestore();matSpy.mockRestore();disposeRegion(world.root);
 });
});
describe('appearance in backup v18 and independent IndexedDB record',()=>{
 it('round-trips all mission data and appearance without changing mission versions',()=>{const g={...initialGame(),appearance:custom()},b=makeBackup(g);expect(b.version).toBe(19);expect(BACKUP_VERSION).toBe(19);expect(importBackup(b,initialGame()).game).toEqual(g);});
 it('every previously supported v1-v17 fixture retains an existing appearance',()=>{
  const g={...initialGame(),appearance:custom()},seen=new Set<number>();
  const fixtures=readdirSync('tests/fixtures').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('tests/fixtures/'+f,'utf8')));fixtures.push(JSON.parse(readFileSync('docs/evidence/market/completed-v17.json','utf8')));
  for(const b of fixtures)if(b.version>=1&&b.version<=17&&(b.version===1||b.missions)){expect(importBackup(b,g).game.appearance).toEqual(g.appearance);seen.add(b.version);}
  expect([...seen].sort((a,b)=>a-b)).toEqual(Array.from({length:17},(_,i)=>i+1));
 });
 it('normalizes bad cosmetic IDs but rejects invalid mission data before mutating live progress',()=>{
  const g={...initialGame(),appearance:custom()},before=structuredClone(g),b=makeBackup(g);b.appearance!.headwear='outfit-teal';b.appearance!.hair='future-paid';expect(importBackup(b,g).game.appearance).toEqual(g.appearance);
  (b.missions.M02 as any).day=-1;(b.missions.M02 as any).revision=-5;expect(()=>importBackup(b,g)).toThrow();expect(g).toEqual(before);
 });
});
