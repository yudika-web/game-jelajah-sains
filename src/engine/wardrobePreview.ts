import * as THREE from 'three';
import {createCharacter,type CharacterRig} from './character';
import type {Appearance} from '../game/appearance';
import {appearanceKey} from '../game/appearance';
import {disposeRegion} from './disposeRegion';
import {environmentStyle} from './environmentStyle';
/** Studio uses the game's renderer and frame loop, never another WebGL context. */
export class WardrobePreview {
 readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(35,1,.1,20);
 rig:CharacterRig;angle=0;
 constructor(a:Appearance){
  this.scene.background=new THREE.Color('#edf0e5');
  this.scene.add(new THREE.HemisphereLight(environmentStyle.hemisphere.sky,environmentStyle.hemisphere.ground,environmentStyle.hemisphere.intensity));
  const sun=new THREE.DirectionalLight(environmentStyle.sun.color,environmentStyle.sun.intensity);sun.position.set(...environmentStyle.sun.position);this.scene.add(sun);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,48),new THREE.MeshLambertMaterial({color:'#dce3d1'}));floor.rotation.x=-Math.PI/2;floor.position.y=.085;this.scene.add(floor);
  this.rig=createCharacter(a.base==='student-girl'?'explorerGirl':'explorer',undefined,a);this.scene.add(this.rig.root);
 }
 setAppearance(a:Appearance){const old=this.rig;this.scene.remove(old.root);disposeRegion(old.root);this.rig=createCharacter(a.base==='student-girl'?'explorerGirl':'explorer',undefined,a);this.rig.root.rotation.y=this.angle;this.scene.add(this.rig.root);}
 rotate(angle:number){this.angle=angle;this.rig.root.rotation.y=angle;}
 render(renderer:THREE.WebGLRenderer,rect:DOMRect){
  if(rect.width<=0||rect.height<=0)return;
  const w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;
  renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);renderer.setClearColor('#edf0e5',1);renderer.clear();
  this.camera.aspect=rect.width/rect.height;this.camera.position.set(0,1.02,Math.max(3.4,.75/(Math.tan(35*Math.PI/360)*this.camera.aspect)));this.camera.lookAt(0,.94,0);this.camera.updateProjectionMatrix();
  renderer.setScissorTest(true);renderer.setViewport(rect.left,h-rect.bottom,rect.width,rect.height);renderer.setScissor(rect.left,h-rect.bottom,rect.width,rect.height);renderer.render(this.scene,this.camera);renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);
  renderer.domElement.dataset.previewAppearance=appearanceKey(this.rig.appearance!);renderer.domElement.dataset.previewAngle=this.angle.toFixed(3);renderer.domElement.dataset.previewHeight=this.rig.dimensions.height.toFixed(3);
 }
 dispose(){disposeRegion(this.scene);this.scene.clear();}
}
