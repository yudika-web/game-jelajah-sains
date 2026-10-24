import * as THREE from 'three';
import {pool,poolMarker} from '../data/poolRegion';
import {buoyancyObjects,objectResult} from '../data/poolContent';
import type {BuoyancyTrial} from '../game/buoyancyTrial';
export function buildPool(root:THREE.Group,b:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>void){
 b(8,.16,6,'#a3bbb5',-12,-.85,-12);b(7.7,.04,5.7,'#72b8c5',-12,-.23,-12);
 for(const x of [pool.minX,pool.maxX])b(.16,.9,6,'#c2c5ad',x,-.35,-12);
 b(8,.9,.16,'#c2c5ad',-12,-.35,-15);
 for(const [x,w]of [[-13.8,4.4],[-8.5,1]])b(w,.9,.16,'#c2c5ad',x,-.35,-9);
 // A broad, shallow ramp is the single entry/exit; animation changes automatically at the water edge.
 const ramp=new THREE.Mesh(new THREE.BoxGeometry(2.4,.12,3),new THREE.MeshLambertMaterial({color:'#d6caa5'}));ramp.rotation.x=.13;ramp.position.set(-10.2,-.07,-8.8);root.add(ramp);
 const buoy=new THREE.Mesh(new THREE.SphereGeometry(.20,8,5),new THREE.MeshLambertMaterial({color:'#e4b64d'}));buoy.position.set(poolMarker.x,-.02,poolMarker.z);root.add(buoy);
 b(2,.14,1,'#aa8857',-5,.83,-14.7);for(const x of [-5.8,-4.2])b(.12,.8,.12,'#746145',x,.4,-14.7);
 b(.13,1.3,.13,'#8e7755',-4,.65,-8.7);b(1.2,.8,.13,'#579aa3',-4,1.5,-8.7);b(.65,.08,.4,'#f6e6c0',-4,1.96,-8.7);
 const models=Object.fromEntries((['A','B','C'] as const).map((id,i)=>{const size=Math.cbrt(buoyancyObjects[id].volumeCm3)*.075;const m=new THREE.Mesh(new THREE.BoxGeometry(size,size,size),new THREE.MeshLambertMaterial({color:buoyancyObjects[id].color}));m.position.set(-5.7+i*.7,1.1,-14.7);root.add(m);return[id,m];}));
 return{frame(trial:BuoyancyTrial|null){for(const [i,id]of (['A','B','C'] as const).entries()){const m=models[id];if(!trial||trial.phase==='idle'||trial.id!==id){m.position.set(-5.7+i*.7,1.1,-14.7);continue;}const t=Math.min(1,trial.elapsed/1.5);m.position.set(-11.5+(id==='A'?-.7:id==='C'?.7:0),1.1+(objectResult(id)==='float'?-1.22:-1.65)*t,-12.5);}},};
}
