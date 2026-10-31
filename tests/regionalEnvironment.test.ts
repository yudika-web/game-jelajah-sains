import {it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {buildRegionalEnvironment} from '../src/engine/regionalEnvironment';
import {EnvironmentKit} from '../src/engine/environmentKit';
import {ambientBudget,ambientStation,environmentObstacles,rimbaSceneryGround} from '../src/data/environmentLayout';
import {rimbaNavigation} from '../src/data/rimbaRegion';
import {poolEntry,poolSwimmingNavigation} from '../src/data/poolRegion';
import {docks} from '../src/data/boatRegion';
import {coastalDocks} from '../src/data/coastalRegion';
import {regions} from '../src/data/regions';
import type {RegionId} from '../src/game/gameState';
import {findPath,walkable} from '../src/engine/navigation';
import {disposeRegion} from '../src/engine/disposeRegion';
import {buildGarden} from '../src/engine/gardenWorld';
import {buildRimba} from '../src/engine/rimbaWorld';
import {buildGeopark} from '../src/engine/geoparkWorld';
const ids=Object.keys(regions) as RegionId[];
for(const id of ids){
 it(`${id}: every map approach remains reachable around the real solid decoration`,()=>{
  const r=regions[id];
  for(const p of r.places){let area=id==='rimba'?rimbaNavigation(true):r.navigation,start=r.spawn,target={x:p.x,z:p.z+1.4};
   if(id==='coast'){start=p.x>18?coastalDocks.irrigation.land:coastalDocks.research.land;if(['coastBoatStart','coastBoatObservation'].includes(p.id))target=p;}
   if(id==='river'){if(p.id==='poolBuoy'){area=poolSwimmingNavigation;start=poolEntry;target=p;}else{start=p.x>15?docks.irrigation.land:r.spawn;if(['poolRamp','boatStart','boatObservation'].includes(p.id))target=p;}}
   expect(walkable(target,area),p.id).toBe(true);expect(findPath(start,target,area).length,p.id).toBeGreaterThan(0);}
  for(const o of environmentObstacles[id])expect(walkable(o,r.navigation),JSON.stringify(o)).toBe(false);
 });
 it(`${id}: finite batched opaque geometry, bounded actor count and exact ownership`,()=>{
  const root=new THREE.Group(),errors=vi.spyOn(console,'error'),v=buildRegionalEnvironment(root,id),own=new Set<THREE.BufferGeometry>(),shared=new Set<THREE.BufferGeometry>();
  let actors=0,batches=0;v.root.traverse(n=>{
   if(n.userData.decorative)actors++;
   for(const g of n.userData.ownedGeometries??[])own.add(g);
   if(n instanceof THREE.Mesh){if(n.geometry.userData.shared)shared.add(n.geometry);else own.add(n.geometry);if(n.name==='environment-batch'){batches++;expect(n.material).toMatchObject({transparent:false,depthTest:true,depthWrite:true});const a=n.geometry.getAttribute('position');expect(Array.from(a.array).every(Number.isFinite)).toBe(true);}}
  });
  expect(actors).toBeLessThanOrEqual(ambientBudget.actors);expect(batches).toBeLessThanOrEqual(ambientBudget.staticMaterials);expect(errors).not.toHaveBeenCalled();errors.mockRestore();
  if(v.actor){expect(v.actor.root.userData.place).toBeUndefined();v.actor.root.traverse(n=>expect(n.userData.place).toBeUndefined());const s=ambientStation[id as keyof typeof ambientStation];expect(v.actor.root.position).toEqual(new THREE.Vector3(s.x,0,s.z));}
  const ownSpies=[...own].map(g=>vi.spyOn(g,'dispose')),sharedSpies=[...shared].map(g=>vi.spyOn(g,'dispose'));
  disposeRegion(root);for(const s of ownSpies)expect(s).toHaveBeenCalledTimes(1);for(const s of sharedSpies)expect(s).not.toHaveBeenCalled();vi.restoreAllMocks();
 });
 it(`${id}: one frame owner freezes activity on pause/reduced/Low, retaining static identity`,()=>{
  const root=new THREE.Group(),v=buildRegionalEnvironment(root,id),player=new THREE.Vector3(0,0,0),start=v.actor?.root.position.clone();
  for(let n=0;n<30;n++)v.frame(.05,true,false,false,player);const time=v.root.userData.ambientTime;
  for(const [active,reduced,low]of [[false,false,false],[true,true,false],[true,false,true]]){v.frame(10,active,reduced,low,player);expect(v.root.userData.ambientTime).toBe(time);}
  if(v.actor){expect(v.actor.root.visible).toBe(false);expect(v.actor.root.position).toEqual(start);}
  v.frame(.05,true,false,false,player);if(v.actor)expect(v.actor.root.visible).toBe(true);expect(v.root.children.length).toBeGreaterThan(0);disposeRegion(root);
 });
}
it('real books replace their own boards and remain selectable by ray, including moved Geopark book',()=>{
 for(const [build,entries]of [[buildGarden,[['gardenBook',-8,.4],['fairNotes',-4,3.4]]],[buildRimba,[['capacityBook',-12,2.3],['supplyNotes',0,1.3]]],[buildGeopark,[['geoBook',-11,6.4],['geoNotes',10,8.4]]]] as const){
  const root=new THREE.Group();build({root,box:()=>{},label:()=>{},npc:()=>{}});root.updateMatrixWorld(true);
  for(const[id,x,z]of entries){const prop=root.getObjectByName(`object-${id}`);expect(prop,id).toBeDefined();const ray=new THREE.Raycaster(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));expect(ray.intersectObject(prop!,true)[0]?.object.userData.place).toBe(id);}
  disposeRegion(root);
 }
});
it('temporary static geometry is released at merge; no live prop is detached from its pick ID',()=>{
 const root=new THREE.Group(),k=new EnvironmentKit(root),g=new THREE.BoxGeometry(1,1,1),dispose=vi.spyOn(g,'dispose');k.shape(g,'#738361',0,.5,0);k.book('gardenBook',3,0,'#5e8c4e');k.finish();expect(dispose).toHaveBeenCalledTimes(1);expect(root.getObjectByName('object-gardenBook')).toBeDefined();disposeRegion(root);
});
it('Geopark book approach avoids the arrival post that previously forced the camera inside the avatar',async()=>{
 const {World}=await import('../src/engine/world');const {initialGeo}=await import('../src/game/geoparkMission');const {geoNavigation,geoPlaces}=await import('../src/data/geoparkRegion');const {FollowCamera}=await import('../src/engine/cameraController');
 const book=geoPlaces.find(p=>p.id==='geoBook')!,position=new THREE.Vector3(book.x,0,book.z+1.4),camera=new THREE.PerspectiveCamera(48,1,.1,110),followCamera=new FollowCamera(camera,[]);followCamera.resize(1280,800);
 const world:any={region:'geopark',geoProgress:initialGeo(),navigation:geoNavigation(true),position,followCamera,stop(){},resetPosition(){throw Error('book approach is not walkable');}};
 World.prototype.setGeopark.call(world,{...initialGeo(),exercise:true});followCamera.update(position,.016,false,true);expect(followCamera.safeDistance).toBeGreaterThan(5);
 followCamera.update(new THREE.Vector3(-11,0,12.4),.016,false,true);expect(followCamera.safeDistance).toBeLessThan(2);
});

it('Rimba background trees and affected-area silhouettes have terrain without overlapping the active slabs',async()=>{
 const {groundSlabs}=await import('../src/engine/groundLayout');const slabs=[groundSlabs.rimba,groundSlabs.solid,...rimbaSceneryGround];
 for(let i=0;i<slabs.length;i++)for(let j=i+1;j<slabs.length;j++){const a=slabs[i],b=slabs[j],dx=Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2),dz=Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2);expect(Math.max(0,dx)*Math.max(0,dz)).toBe(0);}
 for(const x of [-25,25])for(const z of [-13,-3,7,17])expect(slabs.some(s=>Math.abs(x-s.x)<=s.width/2&&Math.abs(z-s.z)<=s.depth/2)).toBe(true);
 for(const s of slabs)expect(s.y+s.height/2).toBeCloseTo(-.05);
});
