import {describe,it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {addGround,groundSlabs,type GroundSlab} from '../src/engine/groundLayout';
import {environmentMaterial,environmentStyle,configureEnvironment,qualityPixelRatio} from '../src/engine/environmentStyle';
import {buildSolid} from '../src/engine/solidWorld';
import {buildHydraulic} from '../src/engine/hydraulicWorld';
import {disposeRegion} from '../src/engine/disposeRegion';
function overlap(a:GroundSlab,b:GroundSlab){return Math.max(0,Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2))*Math.max(0,Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2));}
describe('visible terrain ownership',()=>{
 for(const [base,extension,far,oldArea]of [[groundSlabs.rimba,groundSlabs.solid,38,171],[groundSlabs.workshop,groundSlabs.hydraulic,37.5,60]] as const){
  it(`removes ${oldArea} units² of coplanar top overlap with no gap or lost far edge`,()=>{
   expect(overlap(base,extension)).toBe(0);
   expect(extension.z-extension.depth/2).toBe(base.z+base.depth/2);
   expect(extension.z+extension.depth/2).toBe(far);
   expect(extension.y+extension.height/2).toBeCloseTo(base.y+base.height/2,12);
   // Original footprints: solid 38×20; hydraulic 40×19. Only hidden duplicate area is removed.
   expect(extension.width*extension.depth+oldArea).toBe(extension===groundSlabs.solid?38*20:40*19);
   const box=vi.fn();addGround(box,extension);expect(box).toHaveBeenCalledExactlyOnceWith(extension.width,extension.height,extension.depth,extension.color,extension.x,extension.y,extension.z);
  });
 }
 it('actual apparatus builders emit the corrected slab, retaining exactly one stable load/crate',()=>{
  for(const [build,slab,id]of [[buildSolid,groundSlabs.solid,'forest-observation-load'],[buildHydraulic,groundSlabs.hydraulic,'research-supply-crate']] as const){
   const root=new THREE.Group(),box=vi.fn();build({root,box,label:()=>{}});
   expect(box.mock.calls[0]).toEqual([slab.width,slab.height,slab.depth,slab.color,slab.x,slab.y,slab.z]);
   const stable:string[]=[];root.traverse(n=>{if(n.userData.stableId)stable.push(n.userData.stableId);});
   expect(stable.filter(s=>s===id)).toHaveLength(1);disposeRegion(root);
  }
 });
});
describe('rendering foundation',()=>{
 it('keeps depth, opaque Lambert surfaces and existing lighting, rather than hiding overlap',()=>{
  const material=environmentMaterial('#738361');expect(material.isMeshLambertMaterial).toBe(true);
  expect(material).toMatchObject({depthTest:true,depthWrite:true,transparent:false});material.dispose();
  expect(environmentStyle.camera).toEqual({fov:48,near:.1,far:110});
  const scene=new THREE.Scene(),setPixelRatio=vi.fn();const renderer={setPixelRatio} as unknown as THREE.WebGLRenderer;
  configureEnvironment(renderer,scene,2);expect(setPixelRatio).toHaveBeenCalledWith(1.5);
  expect(scene.children).toHaveLength(2);expect(scene.children[0]).toBeInstanceOf(THREE.HemisphereLight);expect(scene.children[1]).toBeInstanceOf(THREE.DirectionalLight);
  expect(renderer.toneMappingExposure).toBe(1.05);expect(renderer.toneMapping).toBe(THREE.ACESFilmicToneMapping);
 });
 it('caps Normal and Low on high-DPI screens without forcing upsampling or modifying simulation',()=>{
  for(const [dpr,normal,low]of [[1,1,1],[2,1.5,1],[.75,.75,.75],[NaN,1,1],[-2,1,1]]){expect(qualityPixelRatio(false,dpr)).toBe(normal);expect(qualityPixelRatio(true,dpr)).toBe(low);}
 });
});
