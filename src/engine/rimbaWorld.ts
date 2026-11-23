import { buildRimbaTrails } from './rimbaTrailWorld';
import { rimbaZones, rimbaReservations } from '../data/rimbaTrails';
import {EnvironmentKit} from './environmentKit';
import {addGround,groundSlabs} from './groundLayout';
import * as THREE from 'three';
import { cartParking, rimbaCartConfig, rimbaPlaces, rimbaPlace, forestTrees, rimbaClosedC, rimbaGatePosts } from '../data/rimbaRegion';
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
  const env=new EnvironmentKit(root);
  const mats=new Map<string,THREE.MeshLambertMaterial>();
  const material=(color:string)=>{if(!mats.has(color))mats.set(color,new THREE.MeshLambertMaterial({color}));return mats.get(color)!;};
  const mesh=(g:THREE.BufferGeometry,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(g,material(c));m.position.set(x,y,z);parent.add(m);return m;};
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent);
  addGround(b,groundSlabs.rimba);b(29,.05,4,'#bcaa80',0,.01,7);
  b(4,.07,30,'#c5b38d',0,.02,0);b(26,.06,4,'#bcaa80',-1,.03,-1);
  b(16,.05,3,'#b4a77f',5,.02,-6);
  buildRimbaTrails(env);
  b(13,.028,8,'#cab995',-4,.011,13); // turning apron beside the framed source yard
  const zoneX=(depotZone.minX+depotZone.maxX)/2,zoneZ=(depotZone.minZ+depotZone.maxZ)/2;
  for(const z of [depotZone.minZ,depotZone.maxZ])b(depotZone.maxX-depotZone.minX,.018,.10,'#e9d994',zoneX,.08,z);
  for(const x of [depotZone.minX,depotZone.maxX])b(.10,.018,depotZone.maxZ-depotZone.minZ,'#e9d994',x,.08,zoneZ);
  // Trees stay outside the broad logistics lanes; no particle simulation.
  forestTrees.forEach(([x,z],i)=>{
    env.tree(x,z,i,['#405f43','#6d8b56']);
    for(let j=0;j<3;j++){const angle=j*Math.PI*2/3;env.cylinder(.055,.7,'#86684b',x+Math.cos(angle)*.25,.14,z+Math.sin(angle)*.25,Math.cos(angle)*.95,Math.sin(angle)*.95);}
    env.rock(x+.8,.20,z+.5,.5,.28,.45,'#667d51',i);env.rock(x-.7,.16,z-.6,.45,.24,.35,'#8f8e73',i+1);
  });
  // The habitat board overlooks damaged forest across its closed boundary.
  for (let i = 0; i < 9; i++) {
    const x = -37 + i * 2.2, z = -19 - i % 3 * 2.9;
    env.cylinder(.16, 3.4 + (i % 3) * .4, '#574d40', x, 1.7, z);
    env.cylinder(.08, 1.1, '#7a6856', x + .20, 2.7, z, 0, -.65);
  }
  const haze = new THREE.Group();root.add(haze);
  const hazeMaterial = new THREE.MeshLambertMaterial({color:'#9d8d81', transparent:true, opacity:.17, depthWrite:false});
  for (let i = 0; i < 3; i++) {
    const cloud = new THREE.Mesh(new THREE.BoxGeometry(7, 3 + i, 3), hazeMaterial);
    cloud.position.set(-35 + i * 7, 5 + i, -24 - i * 3);
    haze.add(cloud);
  }
  const affected = label('AREA TERDAMPAK · KHUSUS PETUGAS',-26,3.7,-16,undefined,true);
  if (affected) affected.userData.rimbaTrailSign = true;
  for (const [index, area] of rimbaReservations.entries()) {
    const x = index === 1 ? (area.minX + area.maxX) / 2 : index === 0 ? area.minX + .12 : area.minX;
    const z = index === 1 ? area.maxZ : (area.minZ + area.maxZ) / 2;
    const sign = label(area.name + ' · DITUTUP', x, 2.0, z, undefined, true);
    if (sign) sign.userData.rimbaTrailSign = true;
    if (index === 1) b(3.5,.32,.16,'#be8754',x,1.04,z);
    else b(.16,.32,3.5,'#be8754',x,1.04,z);
  }
  // Wayfinding and small observations mark the longer legs of the loop.
  for (const [text, x, z] of [
    ['AKAR PAPAN · CERUK PENGAMATAN', -67.1, -25.8],
    ['CERUK PAKIS', -60.1, -74.0],
    ['CERUK MUKA AIR', 13.9, -36.0],
    ['JALUR PAPAN / MENARA PANDANG', -86.9, -115],
    ['RESTORASI / PONDOK RISET', 4.9, -109],
  ] as const) {
    b(.16,1.5,.16,'#795d40',x,.75,z);
    const sign = label(text, x, 2.05, z, undefined, true);
    if (sign) sign.userData.rimbaTrailSign = true;
  }
  // Open workshop: table and replacement wheel do not block the central cart lane.
  b(2,.12,1,'#9e784e',5.5,.82,11);for(const x of [4.7,6.3])b(.13,.8,.13,'#765c3e',x,.4,11);
  const spare=mesh(new THREE.TorusGeometry(.26,.065,5,12),'#484c42',5.3,1.17,11);spare.rotation.x=.4;
  b(.5,.08,.12,'#9aa7a2',6,1.02,11);b(.13,.10,.44,'#b5a16b',6,1.02,11);
  for(const id of ['forestMap','capacityBook','supplyNotes','habitatBoard'] as const){const p=rimbaPlace(id);
    if(id==='capacityBook'||id==='supplyNotes')env.book(id,p.x,p.z-.7,p.color,id==='supplyNotes');
    else{b(.13,1.3,.13,'#816b47',p.x,.65,p.z-.7);b(1.3,.8,.12,p.color,p.x,1.55,p.z-.7);}
  }
  env.finish();
  b(1.2,.10,.6,'#9e784e',-2,.70,8);b(.13,.7,.13,'#765c3e',-2,.35,8);
  const rackBucket=box(.4,.4,.4,'#bd9852',-2,.95,8);rackBucket.userData.place='bucketRack';
  const water=new Map<string,THREE.Mesh>();
  for(const id of ['forestSource','receiverA','receiverB','receiverC'] as const) {
    const p=rimbaPlace(id), source=id==='forestSource';
    const tank=new THREE.Group();tank.userData.place=id;root.add(tank);
    const h=source?2:1.1,c=source?'#71958a':'#927b51';
    box(2,.12,1.6,c,p.x,.06,p.z-1.2,tank);
    for(const dx of [-.94,.94])box(.12,h,1.6,c,p.x+dx,h/2,p.z-1.2,tank);
    for(const dz of [-.74,.74])box(1.76,h,.12,c,p.x,h/2,p.z-1.2+dz,tank);
    tank.traverse(n=>n.userData.place=id);
    const w=box(1.83,.08,1.43,'#78b9c1',p.x,source?1.9:.14,p.z-1.2,tank);water.set(id,w);
    const face=box(.7,.8,.04,'#6db9c7',p.x,source?1:.55,p.z-.38,tank);water.set(id+'-gauge',face);
    b(.35,.13,.35,'#d0b379',p.x,source?.65:.35,p.z-.25);
  }
  const closed=new THREE.Group();root.add(closed);
  const {x:cx,z:cz,width:cw,depth:cd} = rimbaClosedC;
  for (const x of [cx - cw / 2,cx + cw / 2]) {
    for (const z of [cz - cd / 2,cz + cd / 2]) box(.18,1.3,.18,'#765a38',x,.65,z,closed);
    box(.18,.30,cd,'#cfaa58',x,.90,cz,closed);
  }
  for (const z of [cz - cd / 2,cz + cd / 2]) box(cw,.30,.18,'#cfaa58',cx,.90,z,closed);
  const routeSign = label('JALUR C · KONFIRMASI POS',cx,2.2,cz + cd / 2,'receiverC');
  const cart=new THREE.Group();cart.name='logistics-cart';root.add(cart);
  box(1.1,.17,1.3,'#927046',0,.56,.85,cart);box(1.02,.55,1.18,'#739083',0,.90,.85,cart);
  const cartWater=box(.92,.05,1.08,'#78bec7',0,1.16,.85,cart);
  for(const x of [-.40,.40])box(.075,.075,.75,'#66563f',x,.68,.12,cart);
  const wheels=[-.64,.64].map(x=>{const pivot=new THREE.Group();pivot.position.set(x,.32,.85);cart.add(pivot);const tire=mesh(new THREE.CylinderGeometry(.27,.27,.12,12),'#4b5047',0,0,0,pivot);tire.rotation.z=Math.PI/2;box(.14,.4,.07,'#c1b183',0,0,0,pivot);return pivot;});
  const broken=box(.45,.12,.28,'#bc965b',-.64,.18,1.13,cart);broken.rotation.z=.3;
  const damar = rimbaPlace('damar'), gate = rimbaPlace('forestTownGate');
  npc(damar.x, damar.z);
  for (const p of rimbaPlaces.filter(p => !p.id.startsWith('solid'))) {
    const zone = rimbaZones.find(zone => zone.id === p.id);
    if (p.id !== 'damar' && p.id !== 'forestTownGate') {
      const sign = label(p.short, p.x, zone ? (p.id === 'forestTower' ? 5.5 : 3.6) : p.id === 'forestSource' ? 2.9 : 2.5, p.z, p.id, !!zone);
      if (sign && zone) sign.userData.rimbaTrailSign = true;
    }
    const ring = mesh(new THREE.RingGeometry(.62,.72,20),p.color,p.x,.11,p.z);
    ring.rotation.x=-Math.PI/2;ring.userData.place=p.id;
  }
  for (const post of rimbaGatePosts) b(post.width,3.3,post.depth,'#816b47',post.x,1.65,post.z);
  b(5.5,.4,.4,'#5e7957',gate.x,3.35,gate.z);
  label(gate.short,gate.x,4.1,gate.z,gate.id,true);
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
