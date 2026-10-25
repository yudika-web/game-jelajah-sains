import * as THREE from 'three';
import {pressureConfig,pressurePoints,pressurePointIds,rovDock} from '../data/pressureContent';
import {rovObstacles} from './rovNavigation';
import {rootYAtDepth} from '../game/pressureModel';
import type {RovController} from './rovController';
export function buildPressureWorld(root:THREE.Group,labels=true){
 const group=new THREE.Group();group.name='pressure-underwater';root.add(group);const mats=new Map<string,THREE.MeshLambertMaterial>();
 const box=(parent:THREE.Object3D,w:number,h:number,d:number,color:string,x:number,y:number,z:number)=>{if(!mats.has(color))mats.set(color,new THREE.MeshLambertMaterial({color}));const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats.get(color));m.position.set(x,y,z);parent.add(m);return m;};
 // Land apparatus shares the same active W05 root and matches station footprints.
 box(group,1.2,.85,.5,'#748e83',0,.425,2.3);box(group,.80,.52,.10,'#466776',0,1.15,2.28);box(group,.65,.36,.02,'#b6d3c4',0,1.15,2.34);
 box(group,2,.12,1,'#b99a65',1,-.03,6.5);
 for(const x of [-15.6,-14.4])box(group,.08,1.35,.45,'#907954',x,.675,.3);
 for(const y of [.5,1.1])box(group,1.3,.08,.45,'#a48b5b',-15,y,.3);
 for(const x of [-15.4,-15,-14.6])box(group,.22,.22,.20,'#dae3bf',x,1.25,.3);
 const sensorLed=box(group,.08,.07,.03,'#ae986a',-15,1.27,.42);sensorLed.name='sensor-check-led';
 for(const [x,z]of [[-14,4.3],[-10,-3.7]]){box(group,1.2,.10,.5,'#a88a5e',x,.85,z);for(const dx of [-.48,.48])box(group,.08,.8,.35,'#8a7555',x+dx,.4,z);box(group,.55,.08,.35,'#f4e8c7',x,.95,z);}
 box(group,16,.3,36,'#b3c8b7',10,-10.9,.5);
 for(const o of rovObstacles.slice(2,4))box(group,o.width,o.height,o.depth,'#708f87',o.x,o.y,o.z);
 const text=(value:string,x:number,y:number,z:number)=>{if(!labels){const s=new THREE.Sprite();s.position.set(x,y,z);group.add(s);return s;}const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#f8f3df';ctx.fillRect(0,0,512,128);ctx.fillStyle='#245449';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillText(value,256,80);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false}));s.position.set(x,y,z);s.scale.set(1.5,.375,1);group.add(s);return s;};
 for(const [x,z]of [[8.3,-5],[14.3,-7]])box(group,.14,9,.14,'#b4d4c0',x,-4.6,z);
 for(const id of pressurePointIds){const p=pressurePoints[id];const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,4,16),new THREE.MeshBasicMaterial({color:'#ffe49e'}));ring.position.set(p.x,pressureConfig.surfaceY-p.depth,p.z);ring.rotation.x=Math.PI/2;ring.userData.rovPoint=id;group.add(ring);const s=text(`${id} · ${p.depth} m`,p.x+1.3,pressureConfig.surfaceY-p.depth+.65,p.z);s.userData.rovPoint=id;}
 const dock=box(group,1.8,.12,1.8,'#dfc57d',rovDock.x,pressureConfig.surfaceY-.65,rovDock.z);dock.name='rov-launch-cradle';text('Dok · 0 m relatif',rovDock.x,.65,rovDock.z);
 const robot=new THREE.Group();robot.name='research-rov';group.add(robot);
 box(robot,.75,.36,.8,'#e4b14f',0,0,0);box(robot,.65,.12,.7,'#f2df9e',0,.24,0);
 const propellers:THREE.Mesh[]=[];
 for(const x of [-.48,.48]){box(robot,.24,.32,.55,'#4d7d85',x,0,0);const blade=box(robot,.16,.03,.45,'#d5e9db',x,0,.04);propellers.push(blade);}
 box(robot,.28,.25,.25,'#537c82',0,.05,.5);box(robot,.18,.16,.02,'#1c4d61',0,.05,.635);
 const sensor=box(robot,.12,.09,.14,'#e8f0cb',0,pressureConfig.sensorOffsetY,-.5);sensor.name='external-pressure-sensor';
 const lamp=box(robot,.13,.10,.05,'#fff5b9',-.23,.10,.43);lamp.material.emissive.set('#fff4b2');lamp.material.emissiveIntensity=.7;
 const fish:THREE.Group[]=[];for(let i=0;i<3;i++){const f=new THREE.Group();box(f,.55,.22,.14,i%2?'#d1a469':'#7dc2bd',0,0,0);box(f,.12,.30,.05,'#81b6a5',-.34,0,0);f.position.set(5+i*4,-3-i*1.6,9-i*4);group.add(f);fish.push(f);}
 let elapsed=0;return{robot,sensor,dock,update(checked:boolean){sensorLed.material.color.set(checked?'#78c7ac':'#ae986a');sensorLed.material.emissive.set(checked?'#307d66':'#000000');},frame(dt:number,reduced:boolean,rov:RovController){dock.visible=!rov.active;robot.position.set(rov.position.x,rov.position.y,rov.position.z);if(rov.active&&!reduced){elapsed+=dt;for(const p of propellers)p.rotation.z=elapsed*12;for(const [i,f]of fish.entries())f.position.x=5+i*4+Math.sin(elapsed*.5+i)*.4;}},cameraBoxes:rovObstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,o.y-o.height/2,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.y+o.height/2,o.z+o.depth/2))),dockY:rootYAtDepth(0)};
}
