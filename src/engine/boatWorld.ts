import {buildResearchBoat} from './boatModel';
import * as THREE from 'three';
import { docks,boatConfig } from '../data/boatRegion';
import type { BoatController } from './boatController';
import type { IrrigationProgress } from '../game/irrigationMission';
import type { FlowSampling } from '../game/flowSampling';
import { irrigationPlaces } from '../data/boatRegion';
export interface IrrigationView{boat:THREE.Group;update(p:IrrigationProgress):void;frame(boat:BoatController,sampling:FlowSampling|null):void;}
export function buildIrrigation(root:THREE.Group,b:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>void):IrrigationView{
 const mats=new Map<string,THREE.MeshLambertMaterial>();const box=(parent:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{if(!mats.has(c))mats.set(c,new THREE.MeshLambertMaterial({color:c}));const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats.get(c));m.position.set(x,y,z);parent.add(m);return m;};
 b(9,.8,23,'#96aa7d',20.5,-.45,-4.5);
 b(4,.2,3,'#a38458',4,0,13);b(3,.2,3,'#a38458',16.5,0,0);
 for(let x=2.2;x<6;x+=.4)b(.025,.015,3,'#6d5b40',x,.11,13);
 for(let x=15.2;x<18;x+=.4)b(.025,.015,3,'#6d5b40',x,.11,0);
 for(const [x,z]of [[2.4,11.8],[5.6,14.2],[15.3,-1.2],[17.7,1.2]])b(.12,.8,.12,'#716143',x,-.15,z);
 for(const d of Object.values(docks)){const ring=new THREE.Mesh(new THREE.RingGeometry(.50,.64,24),new THREE.MeshBasicMaterial({color:'#f6d98a',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(d.water.x,-.21,d.water.z);root.add(ring);}
 // One buoy is also an obstacle; the full hull's radius must clear it.
 b(.6,.4,.6,'#d7ad59',11,-.02,6);b(.12,1,.12,'#f0e2b6',11,.5,6);
 for(const [x,z]of [[8,10],[8,3],[12,-1]]){b(.12,.5,.12,'#f2dd9b',x,.1,z);b(.6,.06,.15,'#e2be65',x,.40,z);}
 // The channel model stays on the island bank, independent from all mission water stocks.
 b(.8,.15,13,'#91b7b8',18.9,.04,-7);b(2.5,.15,.75,'#78b3bd',20.05,.04,-7);b(.8,.15,5,'#78b3bd',20.8,.04,-4.5);b(3.1,.15,.75,'#78b3bd',22.15,.04,-2);b(.8,.15,9,'#78b3bd',23.5,.04,-6.5);
 for(const x of [18.3,19.5])b(.13,.25,13,'#c3b896',x,.1,-7);
 for(const z of [-7.45,-6.55])b(2.5,.25,.12,'#c3b896',20.05,.1,z);
 b(.15,.28,.9,'#8f8466',20,.15,-7);
 const leaves=new THREE.Group();root.add(leaves);for(let i=0;i<7;i++){const m=box(leaves,.35,.10,.20,i%2?'#94713f':'#8d914c',19.8+i%2*.32,.35,-7.3+Math.floor(i/2)*.17);m.rotation.y=i*.6;}
 const flow=box(root,.35,.12,3,'#d7ece2',20.8,.15,-4.5);flow.name='branch-flow-indicator';
 for(const [x,z]of [[23,-14],[23,-12]]){b(2,.18,1.1,'#9a8357',x,.04,z);for(let i=0;i<3;i++)b(.13,.45,.13,'#5e945f',x-.6+i*.6,.28,z);}
 for(const p of irrigationPlaces)if(!['boatStart','boatObservation'].includes(p.id)){
  b(.1,1.2,.1,'#86704e',p.x,.6,p.z-.7);b(1.2,.75,.10,p.color,p.x,1.35,p.z-.7);
  if(['flowBook','irrigationNotes'].includes(p.id))b(.65,.08,.4,'#f7e9c4',p.x,1.8,p.z-.7);
  if(p.id==='cleaningRack'){b(.9,.1,.5,'#a48050',p.x,.9,p.z-.6);b(.09,1,.09,'#b99861',p.x,.95,p.z-.6);b(.45,.1,.15,'#687e70',p.x,1.45,p.z-.6);}
 }
 const boat=buildResearchBoat(root);
 const sampler=new THREE.Group();root.add(sampler);sampler.visible=false;
 box(sampler,.90,1.2,.80,'#74999d',0,.60,0);const water=box(sampler,.70,.02,.025,'#7ecddd',0,.1,.42);
 for(let i=0;i<=6;i++)box(sampler,i%3===0?.55:.30,.025,.025,'#fff2c7',0,.10+i*.16,.43);
 return{boat,update(p){leaves.visible=!p.cleaned;flow.scale.z=p.cleaned?1:.333;flow.userData.flowMlPerMinute=p.cleaned?12000:4000;},frame(state,s){boat.position.set(state.position.x,0,state.position.z);boat.rotation.y=state.yaw;sampler.visible=!!s&&s.phase!=='idle';if(s&&s.phase!=='idle'){const p=irrigationPlaces.find(p=>p.id===s.point)!;sampler.position.set(p.x+.8,.10,p.z+.3);const ratio=s.volume/12000*(s.phase==='result'?1:Math.min(1,s.elapsed/1.8));water.scale.y=Math.max(.01,ratio*50);water.position.y=.1+ratio*.5;}}};
}
