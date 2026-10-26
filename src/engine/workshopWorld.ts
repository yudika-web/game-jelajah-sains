import * as THREE from 'three';
import { workshopPlaces } from '../data/workshopRegion';
import type { PlaceId } from '../data/content';
import type { WorkshopProgress } from '../game/workshopMission';
import { evaluateCircuit } from '../game/circuitModel';
import { environmentDimensions } from './characterConfig';
interface Builder { root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;npc(x:number,z:number):void; }
export interface WorkshopView { update(p:WorkshopProgress):void; }
export function buildWorkshop({root,box:b,label,npc}:Builder):WorkshopView {
 const mesh=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);root.add(m);return m;};
 b(40,.9,40,'#92a494',0,-.5,0);b(4,.08,34,'#e0d3b5',0,.02,1);b(30,.08,4,'#e0d3b5',0,.025,6);b(29,.08,3,'#d7c9aa',0,.03,-2);
 for(const [x,z,w,d,title] of [[-11,-11,8,5,'BENGKEL KAK BIMA'],[10,-12,7,5,'POS RISET · 3 V']] as const){
  b(w,3.5,d,'#e4d3af',x,1.75,z);b(w+.5,.45,d+.5,'#52777b',x,3.65,z);
  b(environmentDimensions.door.width,environmentDimensions.door.height,.14,'#725f49',x,environmentDimensions.door.height/2,z+d/2+.08);
  for(const dx of [-w*.3,w*.3]){b(1.3,1.2,.12,'#f4e7c6',x+dx,2,z+d/2+.1);b(1.05,.97,.15,'#789da2',x+dx,2,z+d/2+.12);}
  label(title,x,4.6,z,undefined,true);
 }
 for(const x of [-1.9,1.9])b(.25,3.1,.25,'#967b50',x,1.55,16);b(4.4,.5,.45,'#63817e',0,3.2,16);label('KOTA SAINS →',0,4,16,'workshopTownGate',true);
 for(const [x,z] of [[-15,13],[-15,-2],[15,12],[15,2]]){b(.45,2.4,.45,'#8a7357',x,1.2,z);b(2.2,2.4,2.2,'#64866b',x,3.1,z);}
 // Six-terminal demonstration board: symbols on local labels, physical links and a visible gap.
 b(5,.16,2.2,'#a98b61',3,.85,1.9);for(const x of [1,5])b(.14,.8,.14,'#74664f',x,.4,1.9);
 const terminalPositions=[['B+',1.3,2.2],['B-',1.3,1.25],['S1',3,2.2],['S2',4,2.2],['L1',5.1,2.2],['L2',5.1,1.25]] as const;
 for(const [name,x,z] of terminalPositions){b(.16,.12,.16,'#e5cf82',x,1,z);label(name,x,1.5,z,'circuitBoard');}
 b(1.7,.08,.10,'#537d83',2.15,1.03,2.2);b(3.8,.08,.10,'#6d6d78',3.2,1.03,1.25);
 b(.3,.08,.10,'#a2784d',4.15,1.03,2.2);b(.3,.08,.10,'#a2784d',4.95,1.03,2.2);
 const replacement=mesh(.8,.10,.14,'#dba449',4.55,1.05,2.2);replacement.name='replacement-wire';replacement.visible=false;replacement.userData.place='circuitBoard';
 const switchLever=mesh(1,.10,.12,'#e2c36d',3.5,1.04,2.2);
 b(.42,.18,.85,'#c6a45e',1.3,.99,1.7);
 b(.10,.08,.95,'#6b7773',5.1,1.03,1.725);
 const boardBulb=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshLambertMaterial({color:'#bbbca7',emissive:'#000000'}));boardBulb.position.set(5.1,1.18,1.725);boardBulb.name='circuit-board-bulb';root.add(boardBulb);
 const plug=mesh(.35,.17,.3,'#537b76',1.3,1.05,2.2);
 for(const p of workshopPlaces.filter(p=>p.x<16&&p.z>-16&&p.z<20)){
  if(p.id==='bima')npc(p.x,p.z);
  else if(p.id!=='workshopTownGate'){
   if(p.id!=='circuitBoard'){
    b(1.5,.13,.65,'#ac9069',p.x,.84,p.z-.7);for(const dx of [-.55,.55])b(.12,.8,.12,'#7f7057',p.x+dx,.4,p.z-.7);
    if(p.id==='circuitBook'||p.id==='faultNotes'){b(.6,.1,.44,p.color,p.x,.98,p.z-.7);b(.50,.05,.4,'#fff0cb',p.x,1.05,p.z-.7);}
    if(p.id==='componentRack'){b(1.5,1.8,.28,'#9c7d55',p.x,1.4,p.z-.8);for(const y of [1,1.5,2])b(1.5,.1,.6,'#d7bb83',p.x,y,p.z-.65);for(const x of [-.4,0,.4])b(.12,.08,.4,'#d6ac4d',p.x+x,1.6,p.z-.6);}
    if(p.id==='circuitSource'){b(.65,.45,.4,'#b69a53',p.x,1.13,p.z-.7);label('3 V DC',p.x,1.65,p.z-.7,p.id);}
    if(p.id==='circuitSwitch')b(.65,.14,.35,'#587b7b',p.x,.98,p.z-.7);
    if(p.id==='inspectionBench'){b(.65,.18,.4,'#7d7891',p.x,1,p.z-.7);b(.35,.12,.22,'#d7d9cb',p.x+.4,1.15,p.z-.7);}
    if(p.id==='circuitWire'){b(.48,.06,.1,'#9e7850',p.x-.4,1,p.z-.7);b(.48,.06,.1,'#9e7850',p.x+.4,1,p.z-.7);}
   }
   label(p.short,p.x,p.id==='componentRack'?3.2:p.id==='researchLamp'?3.3:2.5,p.z,p.id);
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),new THREE.MeshBasicMaterial({color:p.color,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.1,p.z);root.add(ring);
 }
 // Lamp uses emissive material and a small translucent glow, with no shadow or heavy postprocessing.
 b(.16,2.4,.16,'#657776',10,1.2,-7.7);b(1,.13,.55,'#546f70',10,2.45,-7.7);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.25,10,7),new THREE.MeshLambertMaterial({color:'#ccc7a4',emissive:'#000000'}));bulb.name='research-post-bulb';bulb.position.set(10,2.2,-7.7);bulb.userData.place='researchLamp';root.add(bulb);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(.52,10,7),new THREE.MeshBasicMaterial({color:'#ffe48b',transparent:true,opacity:.16,depthWrite:false}));glow.name='research-post-glow';glow.position.copy(bulb.position);glow.visible=false;root.add(glow);
 // Cable replacement also appears at the inspected physical break, matching the board slot.
 const fieldWire=mesh(.34,.10,.14,'#dba449',7,1.02,-3.7);fieldWire.visible=false;
 return{update(p){const state=evaluateCircuit(p);replacement.visible=fieldWire.visible=p.repaired;plug.visible=p.sourceConnected;switchLever.rotation.y=p.switchClosed?0:.8;bulb.material.color.set(state.lampOn?'#fff2aa':'#ccc7a4');bulb.material.emissive.set(state.lampOn?'#e9b63c':'#000000');glow.visible=state.lampOn;boardBulb.material.color.copy(bulb.material.color);boardBulb.material.emissive.copy(bulb.material.emissive);root.userData.lampOn=state.lampOn;}};
}
