import * as THREE from 'three';
/** A temporary pose on the existing camera. It owns no renderer, listener or exploration preferences. */
export class SpaceInstrumentCamera{
 private active=false;private target=new THREE.Vector3();private nextRotation=new THREE.Quaternion();private helper=new THREE.PerspectiveCamera();ready=true;
 reset(){this.active=false;this.ready=true;}
 update(camera:THREE.PerspectiveCamera,position:THREE.Vector3,target:THREE.Vector3,dt:number,reduced:boolean){
  if(!this.active){this.active=true;this.target.copy(target);}
  this.helper.position.copy(position);this.helper.lookAt(target);this.nextRotation.copy(this.helper.quaternion);
  const amount=reduced?1:1-Math.exp(-15*Math.min(.1,Math.max(0,dt)));
  camera.position.lerp(position,amount);camera.quaternion.slerp(this.nextRotation,amount);
  this.ready=camera.position.distanceToSquared(position)<.000009&&camera.quaternion.angleTo(this.nextRotation)<.003;
 }
}
