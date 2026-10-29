import * as THREE from 'three';
import {diveConfig} from '../data/diving';
/** One double-sided plane: no overlapping box faces; depth test stays enabled. */
export function createSeaSurface(width:number,depth:number,x:number,z:number){const m=new THREE.MeshLambertMaterial({color:'#4babb6',transparent:true,opacity:.58,depthWrite:false,side:THREE.DoubleSide});m.forceSinglePass=true;const sea=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),m);sea.rotation.x=-Math.PI/2;sea.position.set(x,diveConfig.surfaceY,z);sea.name='stable-sea-surface';sea.renderOrder=2;return sea;}
