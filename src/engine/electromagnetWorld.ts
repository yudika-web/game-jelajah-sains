import * as THREE from 'three';
import {electromagnetPlaces} from '../data/electromagnetRegion';
import {clipIds,materialIds,materials,coilCapacity,type ClipId} from '../data/electromagnetContent';
import {evaluateElectromagnet} from '../game/electromagnetModel';
import type {ElectromagnetProgress} from '../game/electromagnetMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;}
export interface ElectromagnetView{update(p:ElectromagnetProgress):void;frame(p:ElectromagnetProgress,fraction:number):void;}
export function buildElectromagnet({root,box:b,label}:Builder):ElectromagnetView{
 const tag=(text:string,x:number,y:number,z:number)=>{let map:THREE.CanvasTexture|undefined;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d')!;ctx.fillStyle='#fff9e9';ctx.fillRect(0,0,256,64);ctx.fillStyle='#284c45';ctx.font='600 24px sans-serif';ctx.textAlign='center';ctx.fillText(text,128,42);map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;}const label=new THREE.Sprite(new THREE.SpriteMaterial({map,color:map?'#ffffff':'#eee3c6'}));label.position.set(x,y,z);label.scale.set(.7,.22,1);label.userData.place='materialBench';root.add(label);};
 const mesh=(g:THREE.BufferGeometry,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);parent.add(m);return m;};
 b(15,.9,38,'#96a593',27.5,-.5,0);b(18,.08,4,'#e0d3b5',24,.025,6);b(14,.08,27,'#c8ba96',25,.035,1);
 label('HALAMAN DAUR ULANG · M17-E2',24,5.3,8,undefined,true);
 for(const p of electromagnetPlaces){if(['materialBench','magnetRack','coilStation'].includes(p.id)){const w=p.id==='materialBench'?3:p.id==='coilStation'?3:2.5,d=p.id==='materialBench'?1.3:p.id==='coilStation'?1.5:.8;b(w,.13,d,'#ac8a5c',p.x,.84,p.z-.7);for(const dx of [-w*.4,w*.4])b(.13,.8,.13,'#7e6b51',p.x+dx,.4,p.z-.7);}
  if(p.id==='magnetBook'||p.id==='magnetNotes'){b(1.5,.13,.65,'#a98d63',p.x,.84,p.z-.7);b(.7,.11,.45,p.color,p.x,.98,p.z-.7);}
  if(p.id!=='clipTray'&&p.id!=='clipBin')label(p.short,p.x,p.id==='miniCrane'?4.9:p.id==='coilStation'?4:2.8,p.z,p.id);
  const ring=mesh(new THREE.RingGeometry(.62,.73,20),p.color,p.x,.10,p.z);ring.rotation.x=-Math.PI/2;
 }
 // Separate apparatus; E1's source and lamp are never referenced here.
 for(const x of [19.3,20,20.7]){b(.4,.25,.4,'#647d7e',x,1.04,2.3);b(.28,.18,.28,'#d8a451',x,1.26,2.3);}
 const samples:Partial<Record<typeof materialIds[number],THREE.Mesh>>={};
 for(let i=0;i<4;i++){const id=materialIds[i],x=18.9+i*.73;tag(['BAJA','TEMBAGA','ALUMINIUM','PLASTIK'][i],x,1.4,9.2);if(id!=='steel')samples[id]=mesh(new THREE.BoxGeometry(.35,.13,.28),materials[id].color,x,.98,9.2);}
 const permanent=new THREE.Group();root.add(permanent);for(const x of [-.2,.2])mesh(new THREE.BoxGeometry(.16,.35,.16),x<0?'#ae7753':'#668c95',x,0,0,permanent);mesh(new THREE.BoxGeometry(.55,.14,.16),'#b1b9b0',0,.2,0,permanent);permanent.visible=false;
 for(const x of [24.6,27.4])b(.12,2.2,.16,'#728785',x,2,.3);b(3.2,.16,.3,'#8da39d',26,3.15,.3);
 // Mini crane's fixed rail provides safe, repeatable destinations.
 for(const x of [21.9,30.1])b(.3,3.8,.4,'#b79549',x,1.9,-8.2);
 b(8.7,.3,.5,'#d2ae50',26,3.95,-8.2);
 for(const [x,c]of [[23,'#7e979c'],[29,'#759780'],[26,'#af956c']] as const){b(1.9,.12,1.5,c,x,.22,-8);for(const dx of [-.94,.94])b(.1,.35,1.5,c,x+dx,.4,-8);b(1.9,.35,.1,c,x,.4,-8.72);}
 label('BAKI · K1–K6',23,1.2,-8.9,'clipTray');label('PULIH',26,1.2,-8.9,'miniCrane');label('PENAMPUNG',29,1.2,-8.9,'clipBin');
 const head=new THREE.Group();head.name='electromagnet-head';root.add(head);
 mesh(new THREE.BoxGeometry(.55,.38,.55),'#77878b',0,0,0,head);
 const winding=mesh(new THREE.TorusGeometry(.35,.065,5,12),'#c68848',0,.04,0,head);winding.rotation.x=Math.PI/2;
 for(const y of [-.1,.1]){const w=mesh(new THREE.TorusGeometry(.35,.05,5,12),'#bd7e42',0,y,0,head);w.rotation.x=Math.PI/2;}
 const field=mesh(new THREE.SphereGeometry(.65,10,6),'#9ec8bc',0,-.15,0,head);field.material.transparent=true;field.material.opacity=.15;field.material.depthWrite=false;
 const cable=mesh(new THREE.BoxGeometry(.045,1,.045),'#596d6b',23,2,-8);cable.name='crane-cable';
 const core=mesh(new THREE.BoxGeometry(.3,.55,.35),'#73898c',25.3,1.15,.3);core.visible=false;
 const module=mesh(new THREE.TorusGeometry(.33,.09,5,12),'#bd8245',26,1.05,.3);module.rotation.x=Math.PI/2;module.visible=false;
 const clipGeometry=new THREE.TorusGeometry(.10,.025,4,10).scale(.65,1.5,.6),clips={} as Record<ClipId,THREE.Mesh>;
 for(const id of clipIds){const m=mesh(clipGeometry,'#bdc6c5',0,0,0);m.name=`clip-${id}`;clips[id]=m;}
 const wireParts=Array.from({length:3},(_,i)=>mesh(new THREE.BoxGeometry(.65,.06,.08),'#638c90',25.1+i*.7,1.02,.8));
 let last:ElectromagnetProgress|null=null;
 function frame(p:ElectromagnetProgress,t:number){const trial=p.trial;let x=23+6*p.crane.position,y=.95+2.2*p.crane.elevation,z=-8;
  if(p.crane.motion){const a=p.crane.motion.axis,v=p.crane[a]+(p.crane.motion.target-p.crane[a])*t;if(a==='position')x=23+6*v;else y=.95+2.2*v;}
  if(trial?.kind==='coil'){x=26;z=.3;const progress=trial.phase==='positioning'?t:1;y=trial.phase==='positioning'?3.15-1.9*progress:trial.phase==='lifting'?1.25+1.1*t:trial.phase==='returning'?2.35-1.1*t:['result','observed','recorded'].includes(trial.phase)?2.35:1.25;}
  const suspension=trial?.kind==='coil'?3.15:4;head.position.set(x,y,z);cable.position.set(x,(suspension+y)/2,z);cable.scale.y=Math.max(.05,suspension-y);
  field.visible=evaluateElectromagnet(p).active;
  permanent.visible=trial?.kind==='material';
  if(trial?.kind==='material'){const index=materialIds.indexOf(trial.id);permanent.position.set(18.9+index*.73,trial.phase==='positioning'?2.5-1.1*t:trial.phase==='lifting'?1.4+.55*t:1.95,9.2);}
  for(const [i,id]of clipIds.entries()){
   const loc=p.crane.clips[id],m=clips[id];let px=loc==='sample'?18.9:loc==='bin'?29:loc==='recovery'?26:23,py=loc==='sample'?1.04:.48,pz=loc==='sample'?9.2:-8;
   if(loc==='head'){px=x+(i%3-1)*.15;py=y-.45;pz=z+(Math.floor(i/3)-.5)*.18;}
   else if(loc!=='sample'){px+=(i%3-1)*.35;pz+=(Math.floor(i/3)-.5)*.4;}
   if(trial?.kind==='coil'){
    px=25.35+(i%3)*.55;py=.99;pz=.3+(Math.floor(i/3)-.5)*.4;
    const lifted=i<coilCapacity(trial.id);if(lifted&&(['lifting','result','observed','recorded','returning'].includes(trial.phase))){py=trial.phase==='lifting'?.99+1.1*t:trial.phase==='returning'?2.09-1.1*t:2.09;}
   }
   if(trial?.kind==='material'&&trial.id==='steel'&&id==='K1'&&['lifting','result','observed'].includes(trial.phase))py=1.04+(trial.phase==='lifting'?t:1)*.55;
   m.position.set(px,py,pz);m.rotation.x=Math.PI/2;
  }
  for(const [id,m]of Object.entries(samples))m.position.y=.98; // nonferromagnetic samples stay on the table in this model
  root.userData.electromagnetHead=[x,y,z];root.userData.clipCount=clipIds.length;
 }
 return{update(p){last=p;core.visible=p.core;module.visible=p.coil!==null;if(p.coil!==null)module.material.color.set(p.coil===20?'#af8158':p.coil===40?'#ba874d':'#c38c45');wireParts.forEach((w,i)=>w.visible=i<p.connections.length);frame(p,0);},frame(p,t){if(last!==p)last=p;frame(p,t);}};
}
