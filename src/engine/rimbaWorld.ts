import * as THREE from 'three';
import { cartParking, rimbaCartConfig, rimbaPlaces, forestTrees } from '../data/rimbaRegion';
import { depotZone, rimbaCapacity, type RimbaProgress } from '../game/rimbaMission';
import type { PlaceId } from '../data/content';
interface Builder {
  root:THREE.Group;
  box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;
  label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):THREE.Sprite|void;
  npc(x:number,z:number):void;
}
export interface RimbaView {
  update(p:RimbaProgress):void;
  frame(position:THREE.Vector3,yaw:number,distance:number,pushing:boolean,reducedMotion:boolean):void;
  cart:THREE.Group;
  wheelAngle():number;
}
export function buildRimba({root,box:b,label,npc}:Builder):RimbaView {
  const mats=new Map<string,THREE.MeshLambertMaterial>();
  const material=(color:string)=>{if(!mats.has(color))mats.set(color,new THREE.MeshLambertMaterial({color}));return mats.get(color)!;};
  const mesh=(g:THREE.BufferGeometry,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(g,material(c));m.position.set(x,y,z);parent.add(m);return m;};
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent);
  b(42,.8,43,'#738361',0,-.45,1);b(29,.05,4,'#bcaa80',0,.01,7);
  b(4,.07,30,'#c5b38d',0,.02,0);b(26,.06,4,'#bcaa80',-1,.03,-1);
  b(16,.05,3,'#b4a77f',5,.02,-6);
  for(const x of [-18.8,18.8])for(let z=-14;z<20;z+=2){b(.15,1,.15,'#6e5b40',x,.5,z);b(.12,.12,2.1,'#957e51',x,.75,z);}
  for(const z of [-14.8,19.8])for(let x=-18;x<20;x+=2){b(.15,1,.15,'#6e5b40',x,.5,z);b(2.1,.12,.12,'#957e51',x,.75,z);}
  const zoneX=(depotZone.minX+depotZone.maxX)/2,zoneZ=(depotZone.minZ+depotZone.maxZ)/2;
  for(const z of [depotZone.minZ,depotZone.maxZ])b(depotZone.maxX-depotZone.minX,.018,.10,'#e9d994',zoneX,.08,z);
  for(const x of [depotZone.minX,depotZone.maxX])b(.10,.018,depotZone.maxZ-depotZone.minZ,'#e9d994',x,.08,zoneZ);
  // Trees stay outside the broad logistics lanes; no particle simulation.
  for(const [x,z]of forestTrees) {
    b(.4,2.5,.4,'#71573d',x,1.2,z);b(2.2,1.7,2.2,'#405f43',x,3,z);b(1.6,1.1,1.6,'#65804c',x+.2,4.1,z);
    b(.9,.45,.8,'#647851',x+1,.2,z+.7);b(.65,.4,.6,'#8f8e73',x-1,.15,z-1);
  }
  // Distant affected habitat is behind the permanent boundary, never a playable route.
  for(let i=0;i<9;i++){b(.4,4,.4,'#635446',-16+i*4,2,-24);b(1.4,1,1.4,'#806b56',-16+i*4,3.5,-24);}
  const haze=new THREE.Group();root.add(haze);
  for(let i=0;i<3;i++){const m=mesh(new THREE.BoxGeometry(7,3+i,3),'#a58b77',-9+i*9,5+i,-30,haze);m.material=new THREE.MeshLambertMaterial({color:'#9d8d81',transparent:true,opacity:.17,depthWrite:false});}
  label('AREA TERDAMPAK · KHUSUS PETUGAS',0,5,-19,undefined,true);
  // Guard hut at a human scale; 2.1 m door, broad approach and independent blockers.
  b(4,3.1,3,'#c5bb92',-12,1.55,13);b(4.5,.3,3.5,'#566950',-12,3.2,13);
  b(1.1,2.1,.12,'#58644b',-12,1.05,14.57);b(1,.9,.12,'#a0c0b7',-13.1,1.9,14.58);label('POS RIMBA',-12,3.9,13,undefined,true);
  // Open workshop: table and replacement wheel do not block the central cart lane.
  b(2,.12,1,'#9e784e',5.5,.82,11);for(const x of [4.7,6.3])b(.13,.8,.13,'#765c3e',x,.4,11);
  const spare=mesh(new THREE.TorusGeometry(.26,.065,5,12),'#484c42',5.3,1.17,11);spare.rotation.x=.4;
  b(.5,.08,.12,'#9aa7a2',6,1.02,11);b(.13,.10,.44,'#b5a16b',6,1.02,11);
  for(const id of ['forestMap','capacityBook','supplyNotes','habitatBoard'] as const){const p=rimbaPlaces.find(p=>p.id===id)!;b(.13,1.3,.13,'#816b47',p.x,.65,p.z-.7);b(1.3,.8,.12,p.color,p.x,1.55,p.z-.7);b(.7,.07,.45,'#f1e5ba',p.x,2.02,p.z-.7);}
  b(1.2,.10,.6,'#9e784e',-2,.70,8);b(.13,.7,.13,'#765c3e',-2,.35,8);
  const rackBucket=box(.4,.4,.4,'#bd9852',-2,.95,8);rackBucket.userData.place='bucketRack';
  const water=new Map<string,THREE.Mesh>();
  for(const id of ['forestSource','receiverA','receiverB','receiverC'] as const) {
    const p=rimbaPlaces.find(p=>p.id===id)!, source=id==='forestSource';
    const tank=new THREE.Group();tank.userData.place=id;root.add(tank);
    box(2,source?2:1.1,1.6,source?'#71958a':'#927b51',p.x,source?1:.55,p.z-1.2,tank).userData.place=id;
    const w=box(1.83,.08,1.43,'#78b9c1',p.x,source?1.9:.14,p.z-1.2,tank);water.set(id,w);
    const face=box(.7,.8,.04,'#6db9c7',p.x,source?1:.55,p.z-.38,tank);water.set(id+'-gauge',face);
    b(.35,.13,.35,'#d0b379',p.x,source?.65:.35,p.z-.25);
  }
  const closed=new THREE.Group();root.add(closed);
  for(const x of [2,8])box(.18,1.3,.18,'#765a38',x,.65,-6.09,closed);
  box(6,.4,.18,'#cfaa58',5,.9,-6.09,closed);const routeSign=label('JALUR C · KONFIRMASI POS',5,2.2,-6.09,'receiverC');
  const cart=new THREE.Group();cart.name='logistics-cart';root.add(cart);
  box(1.1,.17,1.3,'#927046',0,.56,.85,cart);box(1.02,.55,1.18,'#739083',0,.90,.85,cart);
  const cartWater=box(.92,.05,1.08,'#78bec7',0,1.16,.85,cart);
  for(const x of [-.40,.40])box(.075,.075,.75,'#66563f',x,.68,.12,cart);
  const wheels=[-.64,.64].map(x=>{const pivot=new THREE.Group();pivot.position.set(x,.32,.85);cart.add(pivot);const tire=mesh(new THREE.CylinderGeometry(.27,.27,.12,12),'#4b5047',0,0,0,pivot);tire.rotation.z=Math.PI/2;box(.14,.4,.07,'#c1b183',0,0,0,pivot);return pivot;});
  const broken=box(.45,.12,.28,'#bc965b',-.64,.18,1.13,cart);broken.rotation.z=.3;
  npc(-6,13);
  for(const p of rimbaPlaces){if(p.id!=='damar')label(p.short,p.x,['forestSource'].includes(p.id)?2.9:2.5,p.z,p.id);const ring=mesh(new THREE.RingGeometry(.62,.72,20),p.color,p.x,.11,p.z);ring.rotation.x=-Math.PI/2;ring.userData.place=p.id;}
  for(const x of [10.8,15.2])b(.3,3.3,.3,'#816b47',x,1.65,15);
  b(4.8,.4,.4,'#5e7957',13,3.35,15);
  label('VERSI LATIHAN · JALUR AMAN',13,4.1,15,'forestTownGate',true);
  let repaired=false;
  return {cart,wheelAngle:()=>wheels[1].rotation.x,
    update(p) {
      repaired=p.repaired;rackBucket.visible=p.activeTool!=='bucket';wheels[0].visible=p.repaired;broken.visible=!p.repaired;spare.visible=!p.parts;closed.visible=!p.cOpen;if(routeSign)routeSign.userData.regionHidden=p.cOpen;
      haze.visible=!p.report;
      for(const id of ['forestSource','receiverA','receiverB','receiverC'] as const) {
        const amount=id==='forestSource'?p.source:p.targets[id==='receiverA'?'A':id==='receiverB'?'B':'C'];
        const max=id==='forestSource'?40000:rimbaCapacity[id==='receiverA'?'A':id==='receiverB'?'B':'C'];const ratio=amount/max;
        const w=water.get(id)!;w.visible=amount>0;w.position.y=(id==='forestSource'?.15:.12)+(id==='forestSource'?1.75:.86)*ratio;
        const gauge=water.get(id+'-gauge')!;gauge.scale.y=Math.max(.01,ratio);gauge.visible=amount>0;
      }
      cartWater.visible=p.cart>0;cartWater.position.y=.68+.48*p.cart/12000;
    },
    frame(position,yaw,distance,pushing,reducedMotion) {
      if(pushing){cart.position.copy(position);cart.rotation.y=yaw;if(repaired&&!reducedMotion)for(const wheel of wheels)wheel.rotation.x+=distance/rimbaCartConfig.wheelRadius;}
      else {cart.position.set(cartParking.x,0,cartParking.z);cart.rotation.y=Math.PI;}
    },
  };
}
