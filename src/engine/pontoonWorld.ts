import * as THREE from 'three';
import {pontoonConfig as c,pontoonModules,pontoonSizes} from '../data/pontoonContent';
import {pontoonPlaces,pontoonRoute} from '../data/pontoonRegion';
import {pontoonResult,springStateAt} from '../game/pontoonModel';
import type {PontoonProgress} from '../game/pontoonMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;}
export function buildPontoon({root,box:b,label}:Builder){
 b(20,.8,20,'#86a078',-7,-.45,28);b(3,.06,21,'#dac89d',0,.02,27);b(12,.06,2,'#d2bf93',-5,.03,25);b(12,.06,2,'#d2bf93',-5,.03,33);
 b(10,.12,19,'#6bafb6',8,c.waterY-.06,28);for(const z of [24,34])b(2.8,.15,1.6,'#9c805d',3.2,.05,z);
 for(const x of [7-c.gateWidthM/2-.06,7+c.gateWidthM/2+.06])b(.12,1,.14,'#cba95d',x,.3,pontoonRoute.gateZ);
 for(const x of [4.2,9.8])b(.18,.22,17,'#759a75',x,-.1,28);
 label('PONTON · PENARIK VIRTUAL · AVATAR DI DARAT',0,3.4,35.8,undefined,true);label('Gerbang 1,2 m',7,1.7,29);label('75% hanya aturan latihan',-2,2.5,32);
 const mat=(color:string)=>new THREE.MeshLambertMaterial({color});const steel=mat('#739596'),yellow=mat('#d6b052'),wood=mat('#a1815b'),cargoMat=mat('#9b7c4f');
 const geo=new THREE.BoxGeometry(1,1,1);const box=(w:number,h:number,d:number,material:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=root)=>{const mesh=new THREE.Mesh(geo,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const modules=pontoonModules.map((module,i)=>{const size=pontoonSizes[module],height=size.volumeL/1000/(2*.12*pontoonRoute.lengthM),group=new THREE.Group();group.name=`pontoon-module-${module}`;group.userData.stableId=group.name;root.add(group);for(const x of [-(size.widthM-.12)/2,(size.widthM-.12)/2])box(.12,height,pontoonRoute.lengthM,steel,x,height/2,0,group);for(const z of [-.35,.35])box(size.widthM,.05,.10,yellow,0,height+.025,z,group);return{module,group,height,result:pontoonResult(module),rack:new THREE.Vector3(-3+i*1.5,.95,28.2)};});
 const cargo=new THREE.Group();cargo.name=c.cargoId;cargo.userData.stableId=c.cargoId;root.add(cargo);box(.36,.34,.40,cargoMat,0,.17,0,cargo);box(.38,.04,.42,yellow,0,.3,0,cargo);
 // A local spring object with exactly 1 L geometrical volume: 10 cm cube. No enlarged hidden dataset.
 const spring=new THREE.Group();spring.name='spring-buoyancy-apparatus';spring.position.set(-6,0,23.2);root.add(spring);
 box(3,.14,2,wood,0,.65,0,spring);box(.8,.03,.7,steel,0,.73,0,spring);
 const water=box(.74,.32,.64,new THREE.MeshLambertMaterial({color:'#72b5c1',transparent:true,opacity:.38,depthWrite:false}),0,c.springWaterY-.16,0,spring); // surface 0.90
 for(const x of [-.4,.4])box(.025,.45,.7,steel,x,.93,0,spring);
 box(.08,1.5,.08,steel,-.65,1.35,0,spring);box(.72,.06,.08,steel,-.32,2.08,0,spring);
 const scale=box(.18,.3,.14,yellow,0,1.83,0,spring);
 const object=box(.1,.1,.1,wood,0,1.13,0,spring);object.name=c.objectId;object.userData.stableId=c.objectId;
 const rope=box(.007,1,.007,steel,0,1.4,0,spring);
 const beamGeometry=new THREE.BufferGeometry();beamGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const cable=new THREE.Line(beamGeometry,new THREE.LineBasicMaterial({color:'#e6d391'}));cable.frustumCulled=false;root.add(cable);
 for(const p of pontoonPlaces){if(!['pontoonDock','pontoonReceiver','springBench'].includes(p.id)){b(2,.12,1,'#a4865f',p.x,.84,p.z-.8);for(const dx of [-.7,.7])b(.12,.8,.12,'#76694b',p.x+dx,.4,p.z-.8);if(p.id==='pontoonBook'||p.id==='pontoonNotes')b(.65,.08,.4,p.color,p.x,.95,p.z-.8);}label(p.short,p.x,2.5,p.z,p.id);const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),mat(p.color));ring.position.set(p.x,.1,p.z);ring.rotation.x=-Math.PI/2;ring.userData.place=p.id;root.add(ring);}
 return{modules,cargo,object,water,scale,spring,frame(p:PontoonProgress,fraction:number,z:number){const trial=p.trial,f=trial?.phase==='running'?fraction:trial?1:0,condition=trial?.kind==='spring'?trial.result.condition:'air';object.position.y=springStateAt(condition,f).centerY;const top=object.position.y+.05,anchor=1.68;rope.position.y=(top+anchor)/2;rope.scale.y=anchor-top;
 const loaded=p.cargo==='pontoon',module=p.selected,selected=modules.find(m=>m.module===module),floating=trial?.kind==='pontoon'?f:(loaded&&p.pontoonRecords.some(r=>r.module===module)||p.delivery!=='parked')?1:0;
 for(const m of modules){if(m.module===module){const fractionSubmerged=loaded?m.result.fraction:5/pontoonSizes[m.module].volumeL;m.group.position.set(7,c.waterY-m.height*fractionSubmerged*floating,p.delivery!=='parked'||loaded?z:24);}else m.group.position.copy(m.rack);}
 if(p.cargo==='receiver')cargo.position.set(3.2,.14,34);else if(loaded&&selected)cargo.position.set(7,selected.group.position.y+selected.height+.055,z);else cargo.position.set(-2,.96,28.2);
 const a=beamGeometry.getAttribute('position') as THREE.BufferAttribute;a.setXYZ(0,2,.7,24);a.setXYZ(1,7,c.waterY+.25,z);a.needsUpdate=true;cable.visible=loaded;
 root.userData.pontoonCargoCount=1;root.userData.pontoonCargoLocation=p.cargo;root.userData.pontoonZ=z;root.userData.pontoonObjectY=object.position.y;root.userData.pontoonObjectCount=1;
 }};
}
