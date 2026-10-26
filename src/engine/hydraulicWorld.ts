import * as THREE from 'three';
import {hydraulicPlaces} from '../data/hydraulicRegion';
import {hydraulicConfig,outputAreas} from '../data/hydraulicContent';
import {cm2ToM2} from '../game/hydraulicModel';
import type {HydraulicProgress} from '../game/hydraulicMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;}
export function buildHydraulic({root,box:b,label}:Builder){
 b(40,.9,19,'#9aab97',0,-.5,28);b(4,.08,22,'#dfd1b3',0,.035,26);b(24,.08,3,'#dfd1b3',0,.04,29);b(18,.08,2,'#dfd1b3',-4,.045,33);
 label('HIDRAULIK · MODEL IDEAL',0,4.3,35,undefined,true);
 const apparatus=new THREE.Group();apparatus.name='hydraulic-apparatus';apparatus.position.set(8,0,26.2);root.add(apparatus);
 const mat=(c:string)=>new THREE.MeshLambertMaterial({color:c});
 const metal=mat('#a3b7b3'),bronze=mat('#bf9d55'),fluidMat=new THREE.MeshLambertMaterial({color:'#57b4c1',transparent:true,opacity:.65}),wood=mat('#aa8150');
 const box=(w:number,h:number,d:number,material:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=apparatus)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;};
 box(5,.14,2,wood,0,.55,0);for(const x of [-2,2])for(const z of [-.7,.7])box(.12,.5,.12,metal,x,.25,z);
 const radius=(area:number)=>Math.sqrt(cm2ToM2(area)/Math.PI)*12; // labelled schematic cross-section ×12; travel remains SI 1:1.
 function cylinder(r:number,h:number,material:THREE.Material,x:number,y:number){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),material);m.position.set(x,y,0);apparatus.add(m);return m;}
 const inputFluid=cylinder(radius(5),1,fluidMat,-1.35,.8),outputFluid=cylinder(radius(5),1,fluidMat,1.1,.8);
 const wall=new THREE.MeshLambertMaterial({color:'#b4d9d8',transparent:true,opacity:.22,depthWrite:false});
 cylinder(radius(5)*1.12,.7,wall,-1.35,.88);const outputWall=cylinder(radius(5)*1.12,.7,wall,1.1,.88);
 box(2.45,.09,.1,fluidMat,-.125,.61,0);box(.09,.1,.1,fluidMat,-1.35,.65,0);box(.09,.1,.1,fluidMat,1.1,.65,0);
 const input=new THREE.Group(),output=new THREE.Group();apparatus.add(input,output);input.position.set(-1.35,.95,0);output.position.set(1.1,.95,0);input.name='hydraulic-input-piston';output.name='hydraulic-output-piston';
 const piston=new THREE.Mesh(new THREE.CylinderGeometry(radius(5),radius(5),.055,20),bronze);input.add(piston);const piston2=piston.clone();output.add(piston2);
 box(.07,.23,.07,metal,0,.14,0,input);box(.5,.05,.35,bronze,0,.28,0,input);
 box(.09,.2,.09,metal,0,.12,0,output);box(1,.1,.8,metal,0,.28,0,output);
 const crate=box(.64,.48,.52,wood,0,.57,0,output);crate.name=hydraulicConfig.crateId;crate.userData.stableId=hydraulicConfig.crateId;
 for(const x of [-.24,.24])box(.045,.49,.54,bronze,x,.57,0,output);
 for(const x of [-1.65,1.7]){box(.025,.7,.025,metal,x,.95,0);for(let i=0;i<=12;i++)box(i%2===0?.14:.08,.008,.025,bronze,x,.64+i*.04,.015);}
 // Closed-fluid markers: fixed count and mesh identities. Their motion is illustrative.
 const markers=Array.from({length:5},(_,i)=>box(.055,.055,.11,bronze,-1.1+i*.48,.62,0));
 box(.8,.55,.13,metal,0,1.1,-.5);box(.68,.40,.035,mat('#f1e6c6'),0,1.1,-.42);
 const needle=box(.025,.20,.025,bronze,0,1.1,-.39);label('Gaya (N)',8,1.65,25.7,'hydraulicBench');
 for(const p of hydraulicPlaces){label(p.short,p.x,p.id==='hydraulicBench'?2.8:2.4,p.z,p.id);const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),mat(p.color));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.1,p.z);root.add(ring);
  if(p.id!=='hydraulicBench'){b(1.6,.12,.8,'#ac9069',p.x,.84,p.z-.8);for(const dx of [-.6,.6])b(.12,.8,.12,'#7f7057',p.x+dx,.4,p.z-.8);
   if(p.id==='hydraulicRack'){for(const [i,area]of Object.values(outputAreas).entries()){const c=new THREE.Mesh(new THREE.CylinderGeometry(radius(area),radius(area),.22,20),bronze);c.position.set(p.x-.5+i*.5,1.05,p.z-.8);root.add(c);}label('A 5 · B 10 · C 20 cm²',p.x,1.7,p.z-.8,p.id);}
   else if(p.id==='hydraulicLoad')label('100 N · TARGET 5 cm',p.x,1.4,p.z-.8,p.id);
   else b(.65,.09,.45,p.color,p.x,.98,p.z-.8);
  }
 }
 // Local canvas is updated only when rounded instrument values change.
 let context:CanvasRenderingContext2D|null=null,texture:THREE.CanvasTexture|undefined,lastText='';
 if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=144;context=canvas.getContext('2d');texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;}
 const display=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:'#ffffff'}));display.position.set(8,2,25.7);display.scale.set(2.8,.52,1);root.add(display);
 return{apparatus,input,output,crate,inputFluid,outputFluid,markers,frame(p:HydraulicProgress,fraction:number){
 const t=p.trial,r=t?.result,f=t?.phase==='running'?fraction:t?1:0,s1=(r?.inputMm??0)/1000*f,s2=(r?.outputMm??0)/1000*f,area=outputAreas[p.installed??'A'];
 input.position.y=.95-s1;output.position.y=.95+s2;piston2.scale.set(Math.sqrt(area/5),1,Math.sqrt(area/5));outputWall.scale.set(Math.sqrt(area/5),1,Math.sqrt(area/5));outputFluid.scale.set(Math.sqrt(area/5),.37+s2,Math.sqrt(area/5));outputFluid.position.y=.58+(.37+s2)/2;inputFluid.scale.y=.37-s1;inputFluid.position.y=.58+(.37-s1)/2;
 needle.rotation.z=-(r?.appliedN??0)/100*Math.PI*.7;markers.forEach((m,i)=>m.position.x=-1.1+((i*.48+s1*2)%2.4));
 const text=`${p.installed??'—'} · ${r?.appliedN??0} N · ↓ ${(s1*100).toFixed(1)} cm · ↑ ${(s2*100).toFixed(1)} cm`;
 if(context&&text!==lastText){lastText=text;context.fillStyle='#fff8e5';context.fillRect(0,0,768,144);context.fillStyle='#28594e';context.textAlign='center';context.font='bold 31px sans-serif';context.fillText(text,384,55);context.font='24px sans-serif';context.fillText('Penampang ×12 · gerak 1:1 · model ideal',384,106);texture!.needsUpdate=true;}
 root.userData.hydraulicInputMm=s1*1000;root.userData.hydraulicOutputMm=s2*1000;root.userData.hydraulicCrates=1;
 }};
}
