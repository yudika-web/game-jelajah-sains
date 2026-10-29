import * as THREE from 'three';
import type {CharacterRig} from './character';
const geometries=new Map<string,THREE.BoxGeometry>(),materials=new Map<string,THREE.Material>();
function mat(color:string){if(!materials.has(color)){const m=new THREE.MeshLambertMaterial({color});m.userData.shared=true;materials.set(color,m);}return materials.get(color)!;}
function suitTexture(kind:'torso'|'arm'|'leg'){
 const key='suit-'+kind;if(!materials.has(key)){
  let map:THREE.CanvasTexture|null=null;
  if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#e2e9e8';c.fillRect(0,0,256,256);c.fillStyle='#5b8196';if(kind==='torso'){c.fillRect(65,64,126,96);c.fillStyle='#2f6476';c.fillRect(78,78,100,40);c.fillStyle='#d8b464';c.fillRect(83,132,22,13);c.fillRect(120,132,22,13);c.fillRect(155,132,22,13);c.fillStyle='#517c91';c.fillRect(0,210,256,22);}else{c.fillRect(0,202,256,54);c.fillRect(0,110,256,16);}map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;}
  const m=new THREE.MeshLambertMaterial({map,color:map?'#ffffff':'#e2e9e8'});m.userData.shared=true;materials.set(key,m);
 }return materials.get(key)!;
}
export interface AstronautEquipment{body:THREE.Group;helmet:THREE.Group;tetherSocket:THREE.Group;original:(THREE.Material|THREE.Material[])[];placeholders:THREE.Object3D[];}
export function buildAstronautEquipment(r:CharacterRig):AstronautEquipment{
 const group=(name:string,parent:THREE.Object3D,x=0,y=0,z=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
 const body=group('astronaut-equipment',r.torso),placeholders=[...r.cosmetics!.equipment.children],helmet=group('astronaut-helmet',r.cosmetics!.equipment);
 function box(parent:THREE.Object3D,w:number,h:number,d:number,color:string,x:number,y:number,z:number){const key=[w,h,d].join('/');if(!geometries.has(key)){const g=new THREE.BoxGeometry(w,h,d);g.userData.shared=true;geometries.set(key,g);}const mesh=new THREE.Mesh(geometries.get(key)!,mat(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 box(helmet,1.30,.18,1.10,'#e2e9e8',0,.68,0);box(helmet,1.28,.14,1.06,'#d0dbe0',0,-.50,0);
 for(const x of [-.61,.61])box(helmet,.14,1.05,1.08,'#e2e9e8',x,.08,0);box(helmet,1.28,1.06,.12,'#e2e9e8',0,.08,-.51);
 if(!materials.has('visor')){const m=new THREE.MeshBasicMaterial({color:'#a2d9e6',transparent:true,opacity:.10,depthWrite:false});m.userData.shared=true;materials.set('visor',m);}
 const visor=box(helmet,1.13,.88,.018,'#a2d9e6',0,.08,.56);visor.material=materials.get('visor')!;visor.name='astronaut-visor';
 box(body,.96,1.06,.44,'#e2e9e8',0,0,-.64);box(body,.72,.36,.08,'#557f94',0,-.10,-.90);
 for(const x of [-.34,.34]){box(body,.19,.32,.22,'#7595a4',x,-.43,-.81);box(body,.14,.10,.18,'#d9ad62',x,-.62,-.81);}
 const tetherSocket=group('astronaut-tether-socket',body,.4,.08,-.91);
 const original=r.core.map(m=>m.material);body.visible=helmet.visible=false;return{body,helmet,tetherSocket,original,placeholders};
}
export function applyAstronautEquipment(r:CharacterRig,active:boolean){
 if(!r.appearance)return;if(active&&!r.spaceGear)r.spaceGear=buildAstronautEquipment(r);const kit=r.spaceGear;if(!kit)return;
 kit.body.visible=kit.helmet.visible=active;kit.placeholders.forEach(o=>o.visible=!active);
 for(let i=1;i<r.core.length;i++)r.core[i].material=active?suitTexture(i===1?'torso':i<4?'arm':'leg'):kit.original[i];
}
