import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createCharacter} from './character';
import {CharacterAnimator,turnToward} from './characterAnimator';
import {environmentDimensions} from './characterConfig';
import {environmentMaterial} from './environmentStyle';
import type {PlaceId} from '../data/content';

/** Existing building footprints: decorative eaves do not enlarge navigation colliders. */
export const townBuildings=[
 {id:'school',x:-9,z:-9,w:8,d:6,h:4.2,color:'#eddbb2',roof:'#397e7c',title:'SEKOLAH SAINS',front:1},
 {id:'home',x:-12,z:6,w:5,d:5,h:3.3,color:'#edc4aa',roof:'#b56e53',title:'RUMAH BACA WARGA',front:1},
 {id:'market',x:-5,z:13,w:5,d:4,h:3.4,color:'#d1ded1',roof:'#457d91',title:'PASAR SAINS',front:-1},
 {id:'observatory',x:2,z:-13,w:4,d:4,h:3.2,color:'#d1ded1',roof:'#457d91',title:'OBSERVATORIUM',front:1},
] as const;
export const townAmbientRoute={x:7,minZ:-4.7,maxZ:2.5,speed:.55} as const;
export const townLabelRange=7;
/** Camera sees the thin tabletop, not an imaginary solid 1.4 m wall above its legs. */
export const townTableCamera={minY:.76,maxY:.97} as const;

export function buildTownEnvironment(root:THREE.Group){
 const g=new THREE.Group();g.name='town-environment';root.add(g);
 const cube=new THREE.BoxGeometry(1,1,1),sphere=new THREE.IcosahedronGeometry(1,0);
 const materials=new Map<string,THREE.MeshLambertMaterial>(),batches=new Map<string,THREE.BufferGeometry[]>();
 const material=(color:string)=>{let m=materials.get(color);if(!m){m=environmentMaterial(color);materials.set(color,m);}return m;};
 function shape(geo:THREE.BufferGeometry,color:string,x:number,y:number,z:number,rx=0,ry=0,rz=0){if(geo.index){const flat=geo.toNonIndexed();geo.dispose();geo=flat;}geo.rotateX(rx);geo.rotateY(ry);geo.rotateZ(rz);geo.translate(x,y,z);const bucket=batches.get(color)??[];bucket.push(geo);batches.set(color,bucket);}
 const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>shape(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 const cylinder=(rt:number,rb:number,h:number,c:string,x:number,y:number,z:number,rx=0,rz=0)=>shape(new THREE.CylinderGeometry(rt,rb,h,10),c,x,y,z,rx,0,rz);
 function liveBox(parent:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number){const mesh=new THREE.Mesh(cube,material(c));mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function sign(text:string,x:number,y:number,z:number,w:number,back=false){
  const board=new THREE.Mesh(new THREE.BoxGeometry(w,.42,.09),material('#fff1d4'));board.position.set(x,y,z);g.add(board);
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff1d4';ctx.fillRect(0,0,512,80);ctx.fillStyle='#2c5d58';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,42,490);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(w-.04,.38),new THREE.MeshBasicMaterial({map}));face.position.set(x,y,z+(back?-.051:.051));face.rotation.y=back?Math.PI:0;g.add(face);
 }
 function roof(w:number,h:number,d:number,c:string,x:number,y:number,z:number){const outline=new THREE.Shape();outline.moveTo(-w/2,0);outline.lineTo(0,h);outline.lineTo(w/2,0);outline.closePath();const geo=new THREE.ExtrudeGeometry(outline,{depth:d,bevelEnabled:false,steps:1});shape(geo,c,x,y,z-d/2);}
 for(const house of townBuildings){
  const {x,z,w,d,h,front:f}=house,front=z+f*d/2;
  b(w,h,d,house.color,x,h/2,z);b(w+.16,.20,d+.16,'#fff1d4',x,.04,z);b(w+.26,.14,d+.26,'#fff1d4',x,h-.12,z);
  if(house.id==='observatory'){
   cylinder(1.72,1.72,.24,'#457d91',x,h+.02,z);
   shape(new THREE.SphereGeometry(1.6,20,10,0,Math.PI*2,0,Math.PI/2),'#79b4c2',x,h+.15,z);
   b(.19,1.05,.08,'#3d627e',x+.4,h+.73,z+1.30);
   shape(new THREE.CylinderGeometry(.19,.24,1.5,12),'#3d627e',x+.45,h+.9,z+1.15,Math.PI/2-.5);
   cylinder(.23,.23,.10,'#d1ded1',x+.45,h+1.25,z+1.8,Math.PI/2-.5);
  }else{roof(w+.7,.95,d+.7,house.roof,x,h-.03,z);b(w+.8,.14,d+.8,'#fff1d4',x,h-.07,z);}
  // Door opening and frame stay at the approved 2.10 m; surface layers are separated.
  b(environmentDimensions.door.width+.22,environmentDimensions.door.height+.16,.16,'#fff1d4',x,1.10,front+f*.12);
  b(environmentDimensions.door.width,environmentDimensions.door.height,.10,'#397e7c',x,1.05,front+f*.22);
  cylinder(.045,.045,.07,'#edbe64',x+.36,1.05,front+f*.30,Math.PI/2);
  for(const dx of [-w*.31,w*.31]){
   b(1.35,1.35,.14,'#fff1d4',x+dx,2.05,front+f*.12);b(1.10,1.10,.08,'#79b4c2',x+dx,2.05,front+f*.23);
   b(.07,1.12,.07,'#fff1d4',x+dx,2.05,front+f*.30);b(1.12,.07,.07,'#fff1d4',x+dx,2.05,front+f*.30);
   b(1.50,.10,.28,'#548c68',x+dx,1.35,front+f*.16);
  }
  sign(house.title,x,h-.55,front+f*.32,Math.min(w-.4,4.7),f<0);
  // A shallow doorstep / sloped threshold is within the existing building footprint.
  b(1.55,.20,.38,'#d4c5a4',x,.05,front-f*.12);
  if(house.id==='school'){
   sign('PERPUSTAKAAN',x-2.4,1.15,front+.34,2.0);
   for(const dx of [-w/2+.18,w/2-.18]){b(.20,3,.20,'#75928f',x+dx,1.5,front+.05);b(.38,.15,.38,'#eddbb2',x+dx,3.06,front+.05);}
   // School gate is a lintel above the existing open approach, not a new wall.
   for(const dx of [-1.8,1.8])b(.16,2.6,.16,'#548c68',x+dx,1.3,front+.25);
   b(3.9,.23,.3,'#548c68',x,2.65,front+.25);
  }
  if(house.id==='market'){
   // North-facing counter serves the experiment plaza. Posts remain inside the old footprint.
   for(let i=0;i<8;i++)b(.70,.12,1.0,i%2?'#fff1d4':'#e2aa4e',x-2.45+i*.7,2.65,front-.33);
   for(const dx of [-2.25,2.25])b(.13,2.65,.13,'#917154',x+dx,1.325,front+.10);
   b(3.8,.14,.6,'#b56e53',x,.87,front-.03);b(3.6,.62,.08,'#75928f',x,.50,front-.20);
   for(let i=0;i<4;i++){b(.65,.12,.45,'#b99668',x-1.3+i*.86,1.01,front-.05);for(let j=0;j<3;j++)shape(new THREE.IcosahedronGeometry(.12,0),i%2?'#e2aa4e':'#cc7854',x-1.47+i*.86+j*.17,1.15,front-.12);}
   // Side stall faces the packing route: shallow detail stays within the original clearance.
   for(const dz of [-.8,.8]){b(.14,1.15,1.25,'#fff1d4',x+w/2+.10,1.9,z+dz);b(.08,.90,1.0,'#79b4c2',x+w/2+.22,1.9,z+dz);b(.10,.94,.06,'#fff1d4',x+w/2+.28,1.9,z+dz);}
   for(let i=0;i<8;i++)b(.8,.12,.43,i%2?'#fff1d4':'#e2aa4e',x+w/2+.20,2.65,z-1.50+i*.43);
   b(.45,.13,3.0,'#917154',x+w/2+.18,.9,z);
   for(let i=0;i<5;i++)shape(new THREE.IcosahedronGeometry(.12,0),i%2?'#e2aa4e':'#cc7854',x+w/2+.28,1.08,z-1+i*.5);
   for(const dx of [-1.6,1.6]){b(.70,.50,.70,'#b99668',x+dx,.35,z);for(let i=0;i<3;i++)b(.73,.055,.04,'#edbe64',x+dx,.2+i*.15,z-.37);}
  }
 }
 // Landmark over the already non-walkable river: no new obstacle in the route to M01.
 for(const dx of [-.8,.8])for(const dz of [-.8,.8])b(.15,4.9,.15,'#75928f',14+dx,2.05,-15+dz);
 cylinder(1.25,1.25,1.8,'#79b4c2',14,5.0,-15);cylinder(1.4,1.4,.16,'#3d627e',14,4.13,-15);shape(new THREE.ConeGeometry(1.4,.65,12),'#edbe64',14,6.22,-15);
 sign('MENARA AIR',14,5,-13.68,2.2);
 // Benches, kerbs and lanterns are placed beside, never across, the clear main streets.
 for(const [x,z]of [[-14.8,10.5],[4.5,1],[-3,-3]] as const){b(1.8,.14,.65,'#b99668',x,.43,z);b(1.8,.50,.12,'#b99668',x,.81,z-.33);for(const dx of [-.65,.65])b(.12,.47,.55,'#548c68',x+dx,.185,z);}
 for(const [x,z]of [[-3,7],[5,9],[-14,-3],[5,-7]] as const){cylinder(.055,.08,2.65,'#548c68',x,1.275,z);b(.45,.08,.45,'#548c68',x,2.7,z);b(.30,.38,.30,'#edc4aa',x,2.47,z);}
 for(const z of [-.65,4.65]){b(28,.10,.14,'#d4c5a4',-3,.055,z);}
 // Three deliberate tree silhouettes: rounded, umbrella and conical; placement follows planted edges.
 const trees=[[-16,-14],[-16,-2],[-16,13],[-10,16],[5,16],[8,7],[6,-8],[-5,-16],[-17,4],[19,-10],[19,2],[19,12]];
 trees.forEach(([x,z],i)=>{
  cylinder(.16,.23,2.1,'#917154',x,1,z);const color=i%2?'#82ad70':'#548c68';
  if(i%3===0){shape(new THREE.IcosahedronGeometry(1.45,1),color,x,2.85,z);shape(new THREE.IcosahedronGeometry(.95,0),'#82ad70',x+.5,3.7,z);}
  else if(i%3===1){cylinder(1.5,.7,1.35,color,x,2.8,z);cylinder(1.1,.5,.75,'#82ad70',x+.12,3.65,z);}
  else{shape(new THREE.ConeGeometry(1.35,2.8,8),color,x,3,z);shape(new THREE.ConeGeometry(1,1.9,8),'#82ad70',x,4,z);}
 });
 for(const [x,z]of [[-15,-15],[-12,16],[6,16],[9,7],[-16,3],[4,-16]] as const){b(2.3,.20,1.2,'#b99668',x,.05,z);for(let i=0;i<3;i++)shape(new THREE.IcosahedronGeometry(.55,0),i%2?'#82ad70':'#548c68',x-.7+i*.65,.5,z);}
 // Shared instanced flowers: optional density only; Low keeps all landmarks and functional props.
 const flowers=new THREE.InstancedMesh(sphere,material('#edbe64'),24);flowers.name='town-flowers';const transform=new THREE.Object3D();
 for(let i=0;i<24;i++){const patch=i<12?[-15,-15]:[9,7];transform.position.set(patch[0]-.8+(i%6)*.30,.93,patch[1]+(i%2?-.24:.24));transform.scale.set(.10,.10,.10);transform.updateMatrix();flowers.setMatrixAt(i,transform.matrix);}g.add(flowers);
 // A reserved facade window in the existing home; no shop or economy.
 sign('RUANG KARYA',-12,1.2,8.86,2.8); // decorative only, no purchasing interaction
 for(const [color,geometries]of batches){const mesh=new THREE.Mesh(mergeGeometries(geometries),material(color));mesh.name='town-static-batch';g.add(mesh);geometries.forEach(geo=>geo.dispose());}batches.clear();
 function prop(id:PlaceId,x:number,z:number){const group=new THREE.Group();group.position.set(x,0,z);group.name=`town-prop-${id}`;g.add(group);return group;}
 function table(group:THREE.Group){liveBox(group,1.25,.10,.70,'#b99668',0,.82,0);for(const x of [-.5,.5])liveBox(group,.10,.85,.55,'#548c68',x,.35,0);}
 const book=prop('book',-8,-3.4);table(book);liveBox(book,.78,.08,.44,'#457d91',0,.92,0);for(const x of [-.2,.2]){const page=liveBox(book,.36,.035,.38,'#fff1d4',x,.98,0);page.rotation.z=x<0?.09:-.09;}liveBox(book,.035,.09,.43,'#edbe64',0,.99,0);
 const rain=prop('rain',4,-4.4);table(rain);liveBox(rain,.85,.04,.50,'#eddbb2',0,.91,0);for(let i=0;i<3;i++)liveBox(rain,.50,.012,.022,'#75928f',0,.94,-.14+i*.13);
 for(const[id,x,z,color]of [['sampleA',10,-1,'#b99668'],['sampleB',10,10,'#79b4c2']] as const){const sample=prop(id,x,z-.3);table(sample);const jar=new THREE.Mesh(new THREE.CylinderGeometry(.20,.20,.48,12),material(color));jar.position.y=1.11;sample.add(jar);liveBox(sample,.44,.06,.44,'#fff1d4',0,1.38,0);liveBox(sample,.22,.13,.025,'#fff1d4',0,1.18,.203);}
 const obs=prop('observatory',2,-10.5);liveBox(obs,.8,.10,.55,'#457d91',0,.84,0);liveBox(obs,.65,.04,.43,'#d1ded1',0,.92,0);for(const x of [-.28,.28])liveBox(obs,.09,.8,.35,'#548c68',x,.40,0);
 const barrier=prop('barrier',7,-10.25);liveBox(barrier,.70,.12,.45,'#b99668',0,.50,0);liveBox(barrier,.40,.15,.28,'#75928f',0,.64,0);
 for(const object of [book,rain,obs,barrier,...g.children.filter(o=>o.name==='town-prop-sampleA'||o.name==='town-prop-sampleB')])object.traverse(n=>{n.userData.place=object.name.replace('town-prop-','');});
 // Ambient people use the shared avatar factory, have no mission ID, and never create evidence.
 const reader=createCharacter('wira');reader.root.name='town-reader';reader.root.position.set(-14.8,0,11.4);g.add(reader.root);const readerAnimator=new CharacterAnimator(reader,2.4);readerAnimator.setPose('read');readerAnimator.update(.1,0,true);
 const cleaner=createCharacter('bima');cleaner.root.name='town-sweeper';cleaner.root.position.set(-14.8,0,-10.5);g.add(cleaner.root);const cleanerAnimator=new CharacterAnimator(cleaner,1.2);cleanerAnimator.setPose('plant');cleanerAnimator.update(.1,0,true);
 const broom=new THREE.Group();cleaner.rightArm.toolSocket.add(broom);liveBox(broom,.065,1.5,.065,'#917154',0,-.5,.14);liveBox(broom,.55,.20,.15,'#edbe64',0,-1.27,.14);
 const walker=createCharacter('explorerGirl');walker.root.name='town-walker';walker.root.position.set(townAmbientRoute.x,0,townAmbientRoute.minZ);g.add(walker.root);const walkerAnimator=new CharacterAnimator(walker,3.4);
 let time=0,direction=1;
 return {root:g,reader,cleaner,walker,flowers,frame(dt:number,active:boolean,reduced:boolean,low:boolean,player:THREE.Vector3){
  flowers.visible=!low;walker.root.visible=!low;
  if(!active||reduced)return;dt=Math.min(.1,Math.max(0,dt));time+=dt;
  readerAnimator.update(dt,0,false);cleanerAnimator.update(dt,0,false);cleaner.rightArm.shoulder.rotation.z+=Math.sin(time*1.8)*.12;
  const near=Math.hypot(player.x-walker.root.position.x,player.z-walker.root.position.z)<1.3;
  const previous=walker.root.position.z;
  if(!low&&!near){walker.root.position.z=THREE.MathUtils.clamp(previous+direction*townAmbientRoute.speed*dt,townAmbientRoute.minZ,townAmbientRoute.maxZ);if(walker.root.position.z===townAmbientRoute.maxZ)direction=-1;else if(walker.root.position.z===townAmbientRoute.minZ)direction=1;}
  walker.root.rotation.y=turnToward(walker.root.rotation.y,direction===1?0:Math.PI,dt,3);walkerAnimator.update(dt,Math.abs(walker.root.position.z-previous),false);
  g.userData.ambientTime=time;g.userData.walkerZ=walker.root.position.z;
 }};
}
