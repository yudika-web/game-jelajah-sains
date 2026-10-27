import * as THREE from 'three';
import {geoPlaces} from '../data/geoparkRegion';
import {earthLayers,layerInfo,plateIds,plateModels,type PlateId} from '../data/geoparkContent';
import {platePose} from '../game/geoparkModel';
import type {GeoProgress} from '../game/geoparkMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;npc(x:number,z:number):void;}
export function buildGeopark({root,box:b,label,npc}:Builder){
 const mats=new Map<string,THREE.MeshLambertMaterial>();const mat=(c:string)=>{if(!mats.has(c))mats.set(c,new THREE.MeshLambertMaterial({color:c}));return mats.get(c)!;};const unit=new THREE.BoxGeometry(1,1,1);
 function cube(parent:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number){const m=new THREE.Mesh(unit,mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m;}
 b(40,.6,46,'#b4b494',0,-.35,-1);b(4,.06,38,'#ded1b1',0,.01,-1);for(const z of [11,2,-4])b(29,.06,2.5,'#d6c4a3',0,.02,z);
 // The shelter and arrival post keep a 2.1-unit doorway, matching the existing avatar scale.
 b(7,2.7,4,'#e5d9b7',-12,1.35,16);b(7.6,.35,4.6,'#5e7c78',-12,2.9,16);b(1.1,2.1,.12,'#77694f',-12,1.05,18.06);label('POS GEOPARK',-12,3.8,16,undefined,true);
 for(const x of [8,14])b(.17,2.6,.17,'#8c7c5f',x,1.3,12);b(7,.3,5,'#708f83',11,2.75,12);label('SHELTER INFORMASI',11,3.5,12,undefined,true);
 // Local layered cliffs are scenic; their footprint is also blocked in navigation.
 for(let i=0;i<5;i++){b(5,.9,8,i%2?'#9f947d':'#bdab8b',13,.45+i*.9,-16);b(2,.6+i*.3,2,'#a99b7f',-16,(.6+i*.3)/2,-3-i*3);}
 for(const[x,z]of [[-16,6],[16,6],[-15,-8],[15,-8],[-16,19],[16,19]]){b(.3,1.4,.3,'#887554',x,.7,z);b(1.8,1.3,1.8,'#789278',x,1.8,z);}
 for(const p of geoPlaces){
  if(p.id==='raka'){npc(p.x,p.z);continue;}
  const table=['geoEarth','geoDivergent','geoConvergent','geoTransform'].includes(p.id);
  if(table){b(4,.12,2,'#aa8d65',p.x,.78,p.z-.8);for(const dx of [-1.6,1.6])b(.16,.75,.16,'#786b56',p.x+dx,.375,p.z-.8);}
  else if(!['geoMuster','geoReturn'].includes(p.id)){b(.1,1.2,.1,'#8b7859',p.x,.6,p.z-.6);b(1.6,.85,.12,p.color,p.x,1.35,p.z-.6);}
  label(p.short,p.x,table?3:2.5,p.z,p.id);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),mat(p.color));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.09,p.z);ring.userData.place=p.id;root.add(ring);
 }
 const earth=new THREE.Group();earth.name='earth-cross-section';earth.userData.place='geoEarth';earth.position.set(-10,1.9,2.2);root.add(earth);
 const hemisphere=new THREE.Mesh(new THREE.SphereGeometry(1.02,20,12,Math.PI,Math.PI),mat('#7c998a'));earth.add(hemisphere);
 const radii=[1.02,.89,.55,.28];earthLayers.forEach((id,i)=>{const g=i===3?new THREE.CircleGeometry(radii[i],32):new THREE.RingGeometry(radii[i+1],radii[i],32);const m=new THREE.Mesh(g,mat(layerInfo[id].color));m.position.z=.03;earth.add(m);m.name=`earth-${id}`;});
 label('Kerak · Mantel · Inti luar · Inti dalam',-10,3.6,2.2,'geoEarth');
 const tables=plateIds.map(id=>{const p=geoPlaces.find(p=>p.id===plateModels[id].place)!,g=new THREE.Group();g.position.set(p.x,id==='convergent'?1.65:.95,p.z-.8);g.name=`plate-model-${id}`;g.userData.place=p.id;root.add(g);
 const left=new THREE.Group(),right=new THREE.Group();g.add(left,right);cube(left,1.12,.16,1.45,'#608e9c',0,0,0);cube(right,1.12,.16,1.45,id==='convergent'?'#a2a978':'#608e9c',0,0,0);
 // Markers move with each plate, so transform offset is visibly measurable.
 for(const side of [left,right])cube(side,.85,.025,.12,'#fff0c3',0,.1,0);
 const newCrust=cube(g,1,.14,1.45,'#e4a95d',0,-.015,0);newCrust.visible=id==='divergent';
 if(id==='convergent'){cube(g,.28,.73,.9,'#9b8b72',1.05,-.445,0);const mountain=new THREE.Mesh(new THREE.ConeGeometry(.2,.4,4),mat('#967a64'));mountain.position.set(.1,.28,0);right.add(mountain);cube(g,.07,.08,1.4,'#425e66',0,-.1,0);label('Samudra → bawah benua · palung',p.x,1.55,p.z-1.1,p.id);}
 const arrows=[new THREE.ArrowHelper(new THREE.Vector3(id==='transform'?0:-1,0,id==='transform'?-1:0),new THREE.Vector3(-.65,.4,0),.55,'#395c58',.13,.1),new THREE.ArrowHelper(new THREE.Vector3(id==='transform'?0:1,0,id==='transform'?1:0),new THREE.Vector3(.65,.4,0),.55,'#395c58',.13,.1)];
 if(id==='convergent'){arrows[0].setDirection(new THREE.Vector3(1,0,0));arrows[1].setDirection(new THREE.Vector3(-1,0,0));}arrows.forEach(a=>g.add(a));
 label(`${plateModels[id].name} · maket dipercepat`,p.x,2.1,p.z-1,p.id);return{id,left,right,newCrust};});
 const barriers=new THREE.Group();barriers.name='scenario-fences';root.add(barriers);
 for(const x of [-10.5,10.5]){cube(barriers,16,.18,.18,'#b37d57',x,.8,-12);for(const dx of [-7,0,7])cube(barriers,.15,1.2,.15,'#8b7158',x+dx,.6,-12);}
 for(const x of [-2.5,2.5]){cube(barriers,.13,.17,10,'#a37e57',x,.8,-17);for(const z of [-12,-17,-22])cube(barriers,.16,1.2,.16,'#8b7158',x,.6,z);}
 const damaged=new THREE.Group();damaged.position.set(-9,0,-16);root.add(damaged);cube(damaged,4,2.2,3,'#b8a58b',0,1.1,0);const crack=cube(damaged,.12,1.8,.04,'#6e5b50',.4,1.2,1.52);crack.rotation.z=.3;
 for(const x of [-8,0,8]){b(1.8,.02,7,'#c9bc9a',x,.05,-8.5);label(x===0?'B · TERBUKA':x<0?'A · BANGUNAN':'C · TEBING',x,2,-11);}
 b(4,.025,3,'#6d9a82',0,.06,-19);label('TITIK KUMPUL · KONFIRMASI',0,2.7,-19,'geoMuster');
 return{tables,barriers,frame(p:GeoProgress,fraction:number){barriers.visible=p.exercise;crack.visible=p.exercise;for(const t of tables){const f=p.trial?.id===t.id?(p.trial.phase==='running'?fraction:1):p.records.some(r=>r.id===t.id)?1:0;const pose=platePose(t.id,f);t.left.position.set(pose.leftX,-pose.subduction,pose.leftZ);t.left.rotation.z=t.id==='convergent'?-pose.subduction:0;t.right.position.set(pose.rightX,0,pose.rightZ);t.newCrust.scale.x=Math.max(.01,pose.newCrust);}
 root.userData.geoModels=3;root.userData.geoExercise=p.exercise;
 }};
}
