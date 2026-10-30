import {it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {buildTownEnvironment,townBuildings,townAmbientRoute,townTableCamera} from '../src/engine/townEnvironment';
import {findPath,walkable,obstacles} from '../src/engine/navigation';
import {places} from '../src/data/content';
import {disposeRegion} from '../src/engine/disposeRegion';
import {FollowCamera} from '../src/engine/cameraController';
it('preserves building footprints and every real Town destination approach',()=>{
 for(const h of townBuildings.filter(h=>h.id!=='home'))expect(obstacles).toContainEqual({x:h.x,z:h.z,width:h.w,depth:h.d});
 for(const p of places){const end={x:p.x,z:p.z+1.4};expect(walkable(end),p.id).toBe(true);expect(findPath({x:-1,z:6},end).length,p.id).toBeGreaterThan(0);}
 for(let z=townAmbientRoute.minZ;z<=townAmbientRoute.maxZ;z+=.1)expect(walkable({x:townAmbientRoute.x,z})).toBe(true);
});
it('mixed roof/cylinder/organic geometry batches remain valid and actual props retain pick IDs',()=>{
 const root=new THREE.Group(),errors=vi.spyOn(console,'error'),v=buildTownEnvironment(root);
 const batches:THREE.Mesh[]=[];root.traverse(n=>{if(n instanceof THREE.Mesh){expect(n.geometry).not.toBeNull();if(n.name==='town-static-batch')batches.push(n);}});expect(errors).not.toHaveBeenCalled();errors.mockRestore();expect(batches.length).toBeLessThan(30);
 for(const id of ['book','rain','sampleA','sampleB','observatory','barrier']){const prop=v.root.getObjectByName(`town-prop-${id}`)!;expect(prop).toBeDefined();prop.traverse(n=>expect(n.userData.place).toBe(id));}
 for(const rig of [v.reader,v.cleaner,v.walker]){rig.root.traverse(n=>expect(n.userData.place).toBeUndefined());expect(rig.dimensions.height).toBeGreaterThanOrEqual(1.6);}
 disposeRegion(root);
});
it('ambient animation follows one frame call, pauses, reduces motion and limits optional Low detail',()=>{
 const root=new THREE.Group(),v=buildTownEnvironment(root),player=new THREE.Vector3(-5,0,5),start=v.walker.root.position.z;
 for(let i=0;i<20;i++)v.frame(.05,true,false,false,player);expect(v.walker.root.position.z).toBeGreaterThan(start);
 const z=v.walker.root.position.z,t=v.root.userData.ambientTime;v.frame(10,false,false,false,player);v.frame(10,true,true,false,player);expect(v.walker.root.position.z).toBe(z);expect(v.root.userData.ambientTime).toBe(t);
 v.frame(.1,true,false,true,player);expect(v.walker.root.visible).toBe(false);expect(v.flowers.visible).toBe(false);expect(v.reader.root.visible).toBe(true);expect(v.walker.root.position.z).toBe(z);
 player.copy(v.walker.root.position);v.frame(.1,true,false,false,player);expect(v.walker.root.position.z).toBe(z);expect(v.walker.root.visible).toBe(true);
 const geos=new Set<THREE.BufferGeometry>();root.traverse(n=>{if(n instanceof THREE.Mesh&&!n.geometry.userData.shared)geos.add(n.geometry);});const spies=[...geos].map(g=>vi.spyOn(g,'dispose'));disposeRegion(root);for(const spy of spies)expect(spy).toHaveBeenCalledTimes(1);
});
it('a thin real tabletop does not collapse the exploration camera at the school book approach',()=>{
 const box=new THREE.Box3(new THREE.Vector3(-8.35,townTableCamera.minY,-.45),new THREE.Vector3(-6.65,townTableCamera.maxY,.45));
 const c=new THREE.PerspectiveCamera(48,1,.1,110),f=new FollowCamera(c,[box]);f.update(new THREE.Vector3(-8,0,-1.6),.016,false,true);expect(f.safeDistance).toBeGreaterThan(4);
});
it('actual books, notes and sample vessels are raycast targets without billboard labels',()=>{
 const root=new THREE.Group();buildTownEnvironment(root);root.updateMatrixWorld(true);
 for(const[id,x,z]of [['book',-8,-3.4],['rain',4,-4.4],['sampleA',10,-1.3],['sampleB',10,9.7],['observatory',2,-10.5]] as const){const from=new THREE.Vector3(x,3,z+2),to=new THREE.Vector3(x,1,z);const ray=new THREE.Raycaster(from,to.sub(from).normalize());const hit=ray.intersectObject(root,true).find(h=>h.object.userData.place);expect(hit?.object.userData.place).toBe(id);}
 disposeRegion(root);
});
