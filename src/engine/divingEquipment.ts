import * as THREE from 'three';
import type {CharacterRig} from './character';
const geometries=new Map<string,THREE.BufferGeometry>(),materials=new Map<string,THREE.Material>();
function mat(color:string,glass=false){const key=color+glass;if(!materials.has(key)){const m=glass?new THREE.MeshBasicMaterial({color,transparent:true,opacity:.16,depthWrite:false}):new THREE.MeshLambertMaterial({color});m.userData.shared=true;materials.set(key,m);}return materials.get(key)!;}
export interface DivingEquipment{body:THREE.Group;mask:THREE.Group;fins:THREE.Group[];original:(THREE.Material|THREE.Material[])[];}
export function applyDivingEquipment(r:CharacterRig,active:boolean){
 if(!r.appearance)return;
 if(active&&!r.diveGear){
  const group=(name:string,parent:THREE.Object3D)=>{const g=new THREE.Group();g.name=name;parent.add(g);return g;};
  const body=group('diving-kit',r.torso),mask=group('diving-mask',r.head),fins=[group('diving-fin-left',r.leftLeg.ankle),group('diving-fin-right',r.rightLeg.ankle)];
  function mesh(parent:THREE.Object3D,key:string,make:()=>THREE.BufferGeometry,color:string,x:number,y:number,z:number,glass=false){if(!geometries.has(key)){const g=make();g.userData.shared=true;geometries.set(key,g);}const m=new THREE.Mesh(geometries.get(key)!,mat(color,glass));m.position.set(x,y,z);parent.add(m);return m;}
  const box=(p:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>mesh(p,`box/${w}/${h}/${d}`,()=>new THREE.BoxGeometry(w,h,d),c,x,y,z);
  for(const x of [-.28,.28]){box(mask,.47,.035,.10,'#214554',x,.08,.49);box(mask,.47,.035,.10,'#214554',x,.44,.49);for(const dx of [-.23,.23])box(mask,.035,.36,.10,'#214554',x+dx,.26,.49);mesh(mask,'lens',()=>new THREE.PlaneGeometry(.40,.30),'#83cfdb',x,.26,.547,true);}
  box(mask,.14,.12,.12,'#214554',0,.24,.49);box(mask,.25,.18,.17,'#365665',0,-.20,.56);
  for(const x of [-.56,.56])box(mask,.08,.17,.96,'#214554',x,.22,0);
  box(body,1.05,1,.24,'#214554',0,.01,-.48);mesh(body,'cylinder',()=>new THREE.CylinderGeometry(.26,.26,1.2,12),'#d0b558',0,.03,-.72);box(body,.5,.10,.14,'#527b8a',0,.67,-.72);
  for(const x of [-.5,.5])box(body,.12,1,.06,'#77c1c6',x,0,.38);
  for(const fin of fins)box(fin,.48,.09,.90,'#4c9da6',0,-.05,.37);
  r.diveGear={body,mask,fins,original:r.core.map(m=>m.material)};
 }
 const kit=r.diveGear;if(!kit)return;kit.body.visible=kit.mask.visible=active;kit.fins.forEach(f=>f.visible=active);
 for(let i=1;i<r.core.length;i++)r.core[i].material=active?mat(i===1?'#28586c':i<4?'#34758a':'#244b61'):kit.original[i];
}
