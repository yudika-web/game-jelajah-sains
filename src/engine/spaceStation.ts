import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {spacePlaces,spaceNavigation} from '../data/spaceRegion';
/** Cutaway roof keeps the approved third-person camera usable. Static surfaces batch by material. */
export function buildSpaceStation(parent:THREE.Group){
 const root=new THREE.Group();root.name='observation-station';parent.add(root);
 const batches=new Map<string,THREE.BufferGeometry[]>(),frameZ=[-3,5,13,19];
 function cylinder(r:number,h:number,color:string,x:number,y:number,z:number,rx=0){const g=new THREE.CylinderGeometry(r,r,h,16);g.rotateX(rx);g.translate(x,y,z);const list=batches.get(color)??[];list.push(g);batches.set(color,list);}
 function box(w:number,h:number,d:number,color:string,x:number,y:number,z:number){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);const list=batches.get(color)??[];list.push(g);batches.set(color,list);}
 function sign(text:string,x:number,y:number,z:number,w=2,color='#8bd2de'){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d')!;c.fillStyle='#153247';c.fillRect(0,0,512,96);c.fillStyle=color;c.font='bold 30px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,49,490);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const face=new THREE.Mesh(new THREE.PlaneGeometry(w,w*96/512),new THREE.MeshBasicMaterial({map}));face.position.set(x,y,z);root.add(face);return face;
 }
 box(42,.6,40,'#1c3047',0,-.32,0);
 // No overlapping top faces: a shallow base plus separated raised panels and inlaid seams.
 for(let x=-18;x<=18;x+=4)for(let z=-2;z<=18;z+=4)box(3.94,.06,3.94,(x/4+z/4)%2?'#61788b':'#6b8293',x,.05,z);
 for(const x of [-2.3,2.3])box(.065,.014,22,'#83d5db',x,.089,8);
 for(const x of [-20,20]){
  box(.30,1.12,38,'#d2dce3',x,.56,0);box(.42,.12,38,'#365b78',x,1.18,0);
  for(const z of frameZ){box(.28,4.8,.32,'#d2dce3',x,2.4,z);box(.42,.1,.46,'#8bd2de',x,4.9,z);}
 }
 // Rear module wall: a human-size sealed airlock is reserved, not an available activity.
 for(const x of [-12,12])box(10,.25,.32,'#92a8b8',x,3.9,19);
 box(12,1,.25,'#d2dce3',-13,.5,19);box(12,1,.25,'#d2dce3',13,.5,19);
 for(const z of frameZ)for(const x of [-18,18]){box(4.2,.18,.25,'#d2dce3',x,4.9,z);box(3.8,.055,.4,'#9ad5dd',x,4.79,z);}
 // Observation window: one low-alpha pane, no double surfaces or coplanar frames.
 const pane=new THREE.Mesh(new THREE.PlaneGeometry(38,3.15),new THREE.MeshBasicMaterial({color:'#70b8cf',transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}));pane.position.set(0,2.6,-5.35);pane.name='observation-window';root.add(pane);
 box(40,.34,.35,'#c5d5e0',0,.85,-5.35);box(40,.25,.4,'#c5d5e0',0,4.35,-5.35);
 for(const x of [-19,-5.5,5.5,19])box(.2,3.6,.38,'#92a8b8',x,2.65,-5.35);
 // Three distinct consoles. Their complete bodies stay inside existing navigation footprints.
 for(const p of spacePlaces){
  if(p.id==='spaceNara'||p.id==='spaceReturn')continue;
  const book=p.id==='spaceBook',notes=p.id==='spaceNotes',instrument=['spaceRotation','spaceRevolution','spaceMoon'].includes(p.id);
  const z=p.z-.8,w=book||notes?1.8:2.6;
  box(w,.68,.8,'#274861',p.x,.40,z);box(w+.1,.12,1,'#d2dce3',p.x,.82,z);box(w-.24,.48,.11,'#18354b',p.x,1.14,z-.29);
  const face=sign(book?'BUKU ASTRONOMI':notes?'CATATAN PENGAMATAN':p.short.toUpperCase(),p.x,1.17,z-.222,w-.3,p.color);if(face)face.userData.place=p.id;
  box(w-.14,.07,.08,p.color,p.x,.91,z+.32);
  for(const dx of [-.7,0,.7])box(.2,.035,.12,'#83cdd4',p.x+dx,.90,z+.07);
  if(p.id==='spaceRotation'){cylinder(.20,.07,'#355774',p.x-.6,.95,z+.08);cylinder(.10,.09,'#83cdd4',p.x-.6,1.02,z+.08);}
  if(p.id==='spaceRevolution')for(const[dx,dz]of [[-.45,0],[0,.2],[.45,0],[0,-.2]])box(.19,.045,.14,'#83cdd4',p.x+dx,.94,z+dz);
  if(p.id==='spaceMoon'){box(.65,.10,.4,'#355774',p.x,.95,z+.10);for(const dx of [-.16,.16]){cylinder(.12,.33,'#92a8b8',p.x+dx,1.10,z+.12,Math.PI/2);cylinder(.085,.02,'#18354b',p.x+dx,1.10,z+.295,Math.PI/2);}}
  box(.65,.06,.08,'#92a8b8',p.x,.52,z+.46);
  if(book){for(let i=0;i<4;i++)box(.12,.32,.24,['#7fafd4','#e6b966'][i%2],p.x-.5+i*.15,1.06,z+.05);}
  if(notes){box(.62,.025,.40,'#eee5bf',p.x+.25,.91,z+.08);box(.035,.035,.28,'#44667a',p.x-.2,.93,z+.08);}
  if(instrument){box(.28,1.65,.3,'#355774',p.x-1.1,.825,z-.1);sign(p.id==='spaceRotation'?'01 · ROTASI':p.id==='spaceRevolution'?'02 · REVOLUSI':'03 · BULAN',p.x,2.10,z-.18,2.5,p.color);}
 }
 // Storage/library enclosure uses the pre-existing blocked footprint (-13,15), not the walking route.
 box(7,.18,4,'#c5d5e0',-13,.12,15);box(7,3.2,.24,'#385570',-13,1.65,16.9);box(.25,3.2,4,'#385570',-16.4,1.65,15);box(.25,3.2,4,'#385570',-9.6,1.65,15);
 box(7.2,.2,4.2,'#d2dce3',-13,3.35,15);box(1.2,2.1,.10,'#75a4b8',-13,1.10,16.74);sign('PERSIAPAN RISET',-13,2.8,16.73,4);
 for(const x of [-15.3,-10.7]){box(1.4,1.6,.30,'#243f58',x,1.12,16.62);for(let j=0;j<3;j++)box(1.3,.06,.42,'#c5d5e0',x,.55+j*.5,16.53);}
 // Sealed docking reserve faces the main hall; no invented travel or external movement.
 box(4.6,3.1,.24,'#355774',14,1.55,18.4);box(1.5,2.1,.12,'#6e99ac',14,1.08,18.22);for(const x of [13.13,14.87])box(.16,2.35,.16,'#d2dce3',x,1.18,18.15);box(1.9,.16,.16,'#d2dce3',14,2.42,18.15);sign('AIRLOCK · CADANGAN',14,2.85,18.10,3.9,'#e6bd79');
 box(1.2,1.8,2,'#355774',18,.9,10);for(const z of [9.55,10.45]){box(.035,1.55,.74,'#6e99ac',17.38,.9,z);box(.06,.28,.05,'#d2dce3',17.33,.95,z-.22);}for(const y of [.5,1.1,1.7])box(1.08,.04,1.8,'#9ab1bf',18,y,10);
 sign('OBSERVATORIUM · SIMULASI',0,4.72,-5.08,7);
 sign('KEMBALI KE KOTA',5,2.18,15.4,2.5);box(.3,1.9,.4,'#355774',5,.95,15.3);box(1.25,.58,.2,'#6fa6b5',5,1.35,15.33);
 for(const[color,gs]of batches){const geometry=mergeGeometries(gs);gs.forEach(g=>g.dispose());root.add(new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color})));}
 const light=new THREE.HemisphereLight('#afdbff','#162e45',.35);root.add(light);
 return root;
}

/** Camera volumes include the complete preparation module; navigation is still the approved 2D footprint. */
export function spaceCameraBoxes(){return spaceNavigation.obstacles.filter(o=>o.depth!==11).map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.x===-13&&o.z===15?3.6:2.3,o.z+o.depth/2)));}
