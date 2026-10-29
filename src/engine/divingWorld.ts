import * as THREE from 'three';
import {diveConfig as c,divePoints,diveObstacles,divePlaces,type DivePointId} from '../data/diving';
import {createSeaSurface} from './seaSurface';
/** A shallow sand/seagrass cove, separate from the original ROV and boat channel. */
export function buildDivingWorld(parent:THREE.Group){
 const root=new THREE.Group();root.name='training-cove';parent.add(root);const cube=new THREE.BoxGeometry(1,1,1),rockGeo=new THREE.IcosahedronGeometry(1,1),materials=new Map<string,THREE.MeshLambertMaterial>();
 const mat=(color:string)=>{if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));return materials.get(color)!;};
 const box=(w:number,h:number,d:number,color:string,x:number,y:number,z:number)=>{const m=new THREE.Mesh(cube,mat(color));m.scale.set(w,h,d);m.position.set(x,y,z);root.add(m);return m;};
 box(19,.8,7.5,'#e8d7ac',-7.5,-.45,22.25);box(2.8,.05,9,'#c5a773',-3,.015,20);box(4,.14,4.6,'#af8d66',-7,-.015,25);
 for(const x of [19,21,23,25])box(.12,1.1,.12,'#8c9a7b',x,.55,17.8);box(6,.09,.10,'#b3bea4',22,.8,17.8);
 for(let z=23;z<27;z+=.45)box(3.9,.02,.04,'#8b704e',-7,.068,z);
 for(const o of diveObstacles.filter(o=>o.name==='pier-pile')){const p=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,7.65,8),mat('#89775d'));p.position.set((o.min.x+o.max.x)/2,-3.75,(o.min.z+o.max.z)/2);p.userData.place='divePier';root.add(p);}
 for(const x of [-7.55,-6.45])box(.07,1.65,.07,'#88a4a0',x,-.55,27.1);for(let i=0;i<5;i++)box(1.1,.05,.13,'#a5bfba',-7,-1.25+i*.32,27.1);
 // Apparatus bodies match their land navigation footprints.
 box(1.4,1.8,.65,'#507d8f',-11,.9,21.3);box(1.05,1.5,.06,'#d2dfd8',-11,.9,21.66);box(.45,.8,.09,'#b9a058',-11,.95,21.72);
 box(1.5,.8,.8,'#7e9b8b',-4,.4,20.3);box(1.6,.08,.9,'#e3e5cd',-4,.84,20.3);
 const sand=box(20,.35,19,'#bdcdb1',-7,-7.75,35.5);sand.name='cove-sand';
 // Contours are conservative boxed envelopes with rounded, faceted visible rocks.
 for(const o of diveObstacles.filter(o=>o.name!=='pier-pile')){const centre=new THREE.Vector3().addVectors(new THREE.Vector3(o.min.x,o.min.y,o.min.z),new THREE.Vector3(o.max.x,o.max.y,o.max.z)).multiplyScalar(.5);const m=new THREE.Mesh(rockGeo,mat(o.name==='sand-ridge'?'#c7d3ad':'#789d96'));m.position.copy(centre);m.scale.set((o.max.x-o.min.x)/2,(o.max.y-o.min.y)/2,(o.max.z-o.min.z)/2);m.rotation.y=.1;if(o.name==='rock-east')m.userData.place='diveRocks';root.add(m);}
 for(let i=0;i<18;i++){const m=new THREE.Mesh(rockGeo,mat(i%2?'#b0c4aa':'#96b6a7'));m.scale.set(.2+i%3*.06,.1,.19);m.position.set(-15+(i*7%17),-7.51,28+(i*5%15));root.add(m);}
 const surface=createSeaSurface(20,19,-7,35.5);root.add(surface);
 // Seagrass blades on sediment. No reef coral or large free-swimming plankton.
 const blade=new THREE.Shape();blade.moveTo(-.035,0);blade.quadraticCurveTo(-.15,.6,.08,1.1);blade.quadraticCurveTo(.20,.7,.035,0);const bladeGeo=new THREE.ShapeGeometry(blade,4),grassMat=new THREE.MeshLambertMaterial({color:'#4c9e78',side:THREE.DoubleSide});const grass=new THREE.InstancedMesh(bladeGeo,grassMat,120);grass.name='seagrass-on-sand';grass.userData.place='diveGrass';const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),scale=new THREE.Vector3();
 for(let i=0;i<120;i++){q.setFromAxisAngle(new THREE.Vector3(0,1,0),i*2.4);v.set(-12+(i*17%41)/16,-7.55,34+(i*13%43)/14);scale.setScalar(.7+(i%5)*.12);matrix.compose(v,q,scale);grass.setMatrixAt(i,matrix);}root.add(grass);
 const fish:THREE.Group[]=[],bodyGeo=new THREE.SphereGeometry(1,12,8),tailGeo=new THREE.ConeGeometry(1,1,3),eyeGeo=new THREE.SphereGeometry(.04,6,4),finGeo=new THREE.ConeGeometry(.18,.30,3);const tails:THREE.Object3D[]=[],origins:THREE.Vector3[]=[];
 for(let i=0;i<12;i++){const f=new THREE.Group(),type=i<6?0:i<10?1:2,color=type===0?'#dab465':type===1?'#70cbd0':'#d38f83',body=new THREE.Mesh(bodyGeo,mat(color));body.scale.set(type===1?.36:.48,type===1?.24:.13,.11);f.add(body);const tail=new THREE.Mesh(tailGeo,mat(type===2?'#b16f70':'#4f8a92'));tail.scale.set(.20,.28,.08);tail.rotation.z=Math.PI/2;tail.position.x=-.5;f.add(tail);tails.push(tail);for(const side of [-1,1]){const eye=new THREE.Mesh(eyeGeo,mat('#183a4c'));eye.position.set(.31,.04,side*.10);f.add(eye);}const fin=new THREE.Mesh(finGeo,mat('#70a5a9'));fin.position.set(0,.18,0);f.add(fin);const origin=new THREE.Vector3(type===0?-3+(i%3)*.7:type===1?-10+(i%3)*.8:-5.6,-2.4-(i%3)*.35-(type===2?2.1:0),type===0?33+Math.floor(i/3)*.8:type===1?36:41.8);f.position.copy(origin);origins.push(origin);if(i<6)f.traverse(o=>{o.userData.place='diveFish';});root.add(f);fish.push(f);}
 const markers=new Map<DivePointId,THREE.Mesh>();for(const[id,p]of Object.entries(divePoints)){const m=new THREE.Mesh(new THREE.TorusGeometry(.18,.025,5,16),mat('#e4d594'));m.position.set(p.position.x,p.position.y+.4,p.position.z);m.userData.place=id;m.name='dive-observation-marker';root.add(m);markers.set(id as DivePointId,m);}
 // Light shafts are suggested by a few broad patches, not overlapping transparent screens.
 for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(.8,16),new THREE.MeshBasicMaterial({color:'#d6e9bb',transparent:true,opacity:.13,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(-11+i*2,-7.55,30+i*.5);root.add(m);}
 const bubbleGeo=new THREE.SphereGeometry(.045,6,4),bubbleMat=new THREE.MeshBasicMaterial({color:'#b8e4df',transparent:true,opacity:.35,depthWrite:false}),bubbles=new THREE.InstancedMesh(bubbleGeo,bubbleMat,12);bubbles.frustumCulled=false;root.add(bubbles);let elapsed=0;
 return{root,surface,fish,markers,frame(dt:number,reduced:boolean,low:boolean,diver:THREE.Vector3,active:boolean){elapsed+=dt;grass.count=low?60:120;fish.forEach((f,i)=>{f.visible=!low||i%2===0;f.position.copy(origins[i]);if(!reduced){f.position.x+=Math.sin(elapsed*(i<6?.7:.35)+i*.4)*(i<6?1.1:.55);f.position.z+=Math.cos(elapsed*.3+i)*.3;f.rotation.y=Math.cos(elapsed*.3+i)*.2;tails[i].rotation.y=Math.sin(elapsed*4+i)*.25;}});bubbles.visible=active&&!reduced&&!low;if(bubbles.visible){for(let i=0;i<12;i++){v.set(diver.x+Math.sin(i*3)*.25,Math.min(c.surfaceY-.03,diver.y+.8+((elapsed*.4+i*.17)%1.5)),diver.z+Math.cos(i*2)*.25);matrix.makeTranslation(v.x,v.y,v.z);bubbles.setMatrixAt(i,matrix);}bubbles.instanceMatrix.needsUpdate=true;}},labelPlaces:divePlaces};
}
