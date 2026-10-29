import {createSeaSurface} from './seaSurface';
import {divePlaces} from '../data/diving';
import {pressurePlaces} from '../data/pressureRegion';
import * as THREE from 'three';
import {coastalPlaces,coastalDocks} from '../data/coastalRegion';
import {organisms,organismIds,type OrganismId} from '../data/coastalContent';
import type {CoastalProgress} from '../game/coastalMission';
import type {PlaceId} from '../data/content';
import type {BoatController} from './boatController';
import {buildResearchBoat} from './boatModel';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;npc(x:number,z:number):void;}
/** Small locally built specimens; plankton are only visible inside the labelled virtual magnifier. */
export function coastalSpecimen(id:OrganismId){
 const group=new THREE.Group(),o=organisms[id],mat=new THREE.MeshLambertMaterial({color:o.color});
 if(id==='phyto'||id==='zoo'){
  const geo=new THREE.IcosahedronGeometry(id==='phyto'?.18:.21,0);
  for(let i=0;i<(id==='phyto'?5:2);i++){const m=new THREE.Mesh(geo,mat);m.position.set((i%3-1)*.28,Math.floor(i/3)*.3,0);group.add(m);}
  if(id==='zoo')for(const sign of [-1,1]){const a=new THREE.Mesh(new THREE.BoxGeometry(.035,.28,.035),mat);a.position.set(-.16,.25,sign*.1);a.rotation.z=sign*.45;group.add(a);}
 }else{
  const body=new THREE.Mesh(new THREE.BoxGeometry(id==='predator'?1.15:.7,id==='grazer'?.44:.24,.19),mat);group.add(body);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.25,.32,3),mat);tail.rotation.z=-Math.PI/2;tail.position.x=id==='predator'?-.7:-.5;group.add(tail);if(id==='predator'){tail.visible=false;const shape=new THREE.Shape();shape.moveTo(-.57,0);shape.lineTo(-.95,.26);shape.lineTo(-.83,0);shape.lineTo(-.95,-.26);shape.closePath();const fork=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshLambertMaterial({color:o.color,side:THREE.DoubleSide}));group.add(fork);}
  const eye=new THREE.Mesh(new THREE.BoxGeometry(.045,.045,.21),new THREE.MeshBasicMaterial({color:'#173a3c'}));eye.position.set(id==='predator'?.45:.25,.05,0);group.add(eye);
 }return group;
}
export function buildCoastal({root,box:b,label,npc}:Builder){
 root.userData.region='coast';
 b(24,.8,36,'#e8d29b',-10,-.45,.5);b(7,.8,36,'#e8d29b',21.5,-.45,.5);
 const sea=createSeaSurface(16,43.5,10,4.25);root.add(sea);b(4,.16,4,'#b18b5d',1,-.03,10);b(4,.16,4,'#b18b5d',19,-.03,-6);
 b(3,.05,30,'#c4a779',-3,.015,.5);b(14,.05,2,'#c4a779',-6,.015,-9);b(2,.05,8,'#c4a779',21,.015,-7);
 for(let z=-11;z<14;z+=.65)b(2.8,.012,.04,'#937850',-3,.05,z);
 // Open-front research hut. Door clearance 2.2 units for 1.60-unit explorers.
 b(5,2.5,.18,'#b8a16c',-11,1.25,8);b(.18,2.5,4,'#a7b383',-13.4,1.25,10);b(.18,2.5,4,'#a7b383',-8.6,1.25,10);b(5.8,.22,4.8,'#597c70',-11,2.7,10);
 for(const x of [-13,-9])b(.15,2.3,.15,'#806b46',x,1.15,12);
 label('POS PESISIR',-11,3.1,10,undefined,true);npc(-7,8);
 for(const [x,z]of [[-15,-2],[-16,-13],[-5,-14]]){
  b(.6,2.4,.6,'#856b4e',x,1.2,z);b(3,1.4,2.7,'#598d74',x,2.4,z);
  for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,1.9,5),new THREE.MeshLambertMaterial({color:'#8b7652'}));m.position.set(x+side*.4,.5,z);m.rotation.z=side*.5;root.add(m);}
 }
 for(const [x,z]of [[-16,16],[-14,-15],[23,14],[23,-14]]){b(1.3,.5,.9,'#a4afa5',x,.2,z);b(.25,.5,.25,'#6e9a6c',x+.6,.25,z);}
 b(.6,.4,.6,'#ecd175',10,0,2);b(.10,.8,.10,'#f4ebca',10,.4,2);
 for(const d of Object.values(coastalDocks)){const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.64,24),new THREE.MeshBasicMaterial({color:'#ffe5a3',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(d.water.x,-.13,d.water.z);root.add(ring);}
 const boat=buildResearchBoat(root);
 for(const p of coastalPlaces){if(p.id==='coastLestari')continue;if(divePlaces.some(q=>q.id===p.id)){label(p.short,p.x,2.2,p.z,p.id);continue;}if(pressurePlaces.some(q=>q.id===p.id)){label(p.short,p.x,2.15,p.z,p.id);continue;}
  b(.10,1.1,.1,'#897451',p.x,.55,p.z-.7);b(1.4,.6,.10,p.color,p.x,1.25,p.z-.7);label(p.short,p.x,2.15,p.z,p.id);
  if(['coastBook','coastNotes'].includes(p.id)){b(1.4,.10,.8,'#9f8055',p.x,.85,p.z-.7);b(.7,.08,.5,'#f4e7c8',p.x,.95,p.z-.7);}
 }
 // Enlarged plankton are exhibited on the instrument, never roaming at human scale.
 const scope=new THREE.Group();scope.position.set(-3,1.1,-1.8);root.add(scope);b(1.5,.12,1,'#977b55',-3,.85,-1.8);label('Diperbesar · alat virtual',-3,2.55,-1.8,'planktonScope');
 const models=new Map<OrganismId,THREE.Group>();
 for(const [i,id]of organismIds.entries()){
  const m=coastalSpecimen(id);models.set(id,m);root.add(m);
  if(i<2)m.position.set(-3+(i===0?-.45:.45),1.25,-1.8);else if(id==='predator')m.position.set(16.8,-.65,-9.7);else m.position.set(3.3+(i-2)*1.2,-.65,-9.7);
 }
 // Glass observation frame at the bank, through which specimens can be inspected without swimming.
 for(const z of [-10.95,-8.45])b(.12,1.9,.12,'#6c8b82',1.3,.35,z);
 for(const y of [-.6,1.3])b(.12,.12,2.6,'#6c8b82',1.3,y,-9.7);
 const glass=new THREE.Mesh(new THREE.BoxGeometry(.04,1.8,2.4),new THREE.MeshBasicMaterial({color:'#b3e5e1',transparent:true,opacity:.16,depthWrite:false}));glass.position.set(1.3,.35,-9.7);root.add(glass);
 b(3.5,.1,2.6,'#8eb8ac',3.3,-1,-9.7);
 const waves:THREE.Mesh[]=[];const waveGeo=new THREE.BoxGeometry(2,.015,.08),waveMat=new THREE.MeshLambertMaterial({color:'#a3d5ce'});
 for(let i=0;i<9;i++){const m=new THREE.Mesh(waveGeo,waveMat);m.position.set(5+i%3*4,-.14,-11+Math.floor(i/3)*8);root.add(m);waves.push(m);}
 let elapsed=0;
 return{boat,models,update(p:CoastalProgress){root.userData.coastScenario=p.scenario;const h=models.get('hunter')!;h.scale.setScalar(p.scenario?.65:1);h.userData.scenarioOnly=p.scenario;},frame(dt:number,reduced:boolean,state:BoatController){elapsed+=dt;boat.position.set(state.position.x,0,state.position.z);boat.rotation.y=state.yaw;if(!reduced){for(const [i,w]of waves.entries())w.position.x=5+i%3*4+Math.sin(elapsed*.5+i)*.2;for(const [id,m]of models)if(id!=='phyto'&&id!=='zoo')m.rotation.y=Math.sin(elapsed*.6+organismIds.indexOf(id))*.15;}},focus(id:OrganismId,target:THREE.Vector3){target.copy(models.get(id)!.position);target.y-=.6;}};
}
