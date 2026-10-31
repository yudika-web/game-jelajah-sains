import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {environmentMaterial} from './environmentStyle';
import type {PlaceId} from '../data/content';
/** Static regional geometry merges by material. Live props share resources owned by this region only. */
export class EnvironmentKit {
 readonly root=new THREE.Group();readonly optional=new THREE.Group();
 readonly cube=new THREE.BoxGeometry(1,1,1);
 private mats=new Map<string,THREE.MeshLambertMaterial>();private batches=new Map<string,THREE.BufferGeometry[]>();
 constructor(parent:THREE.Object3D){this.root.name='regional-environment';parent.add(this.root);this.optional.name='optional-environment';this.root.add(this.optional);this.root.userData.ownedGeometries=[this.cube];}
 mat(color:string){let m=this.mats.get(color);if(!m){m=environmentMaterial(color);this.mats.set(color,m);}return m;}
 shape(g:THREE.BufferGeometry,c:string,x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){if(g.index){const flat=g.toNonIndexed();g.dispose();g=flat;}g.scale(sx,sy,sz);g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);const bucket=this.batches.get(c)??[];bucket.push(g);this.batches.set(c,bucket);}
 box(w:number,h:number,d:number,c:string,x:number,y:number,z:number,rx=0,ry=0,rz=0){this.shape(new THREE.BoxGeometry(w,h,d),c,x,y,z,1,1,1,rx,ry,rz);}
 cylinder(r:number,h:number,c:string,x:number,y:number,z:number,rx=0,rz=0){this.shape(new THREE.CylinderGeometry(r*.82,r,h,10),c,x,y,z,1,1,1,rx,0,rz);}
 rock(x:number,y:number,z:number,sx:number,sy:number,sz:number,c:string,seed=0){this.shape(new THREE.IcosahedronGeometry(1,0),c,x,y,z,sx,sy,sz,.1*seed,.37*seed,.08*seed);}
 liveBox(parent:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number){const m=new THREE.Mesh(this.cube,this.mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m;}
 roof(x:number,y:number,z:number,w:number,d:number,c:string){const slope=.35;for(const side of [-1,1])this.box(w/2+.25,.15,d+.45,c,x+side*w/4,y+.38,z,0,0,-side*slope);this.box(.13,.16,d+.50,'#e6d7b2',x,y+.82,z);}
 tree(x:number,z:number,i:number,palette=['#527653','#78965e']){
  const h=2.3+(i%4)*.30;this.cylinder(.19,h,'#86684b',x,h/2+.02,z);
  if(i%3===0){this.rock(x,h+.55,z,1.2,1.0,1.0,palette[0],i);this.rock(x+.25,h+1.3,z,.8,.75,.8,palette[1],i+2);}
  else if(i%3===1){this.shape(new THREE.ConeGeometry(1.2,2.6,8),palette[0],x,h+.55,z);this.shape(new THREE.ConeGeometry(.85,1.7,8),palette[1],x,h+1.5,z);}
  else{this.shape(new THREE.SphereGeometry(1,8,5),palette[0],x,h+.5,z,1.4,.65,1.2);this.rock(x-.15,h+1.0,z,.9,.60,.9,palette[1],i);}
 }
 table(x:number,z:number,w=1.5,d=.65){this.box(w,.11,d,'#ad885a',x,.84,z);for(const dx of [-w*.38,w*.38])this.box(.10,.80,d*.8,'#765f44',x+dx,.40,z);}
 book(id:PlaceId,x:number,z:number,c:string,notes=false){const g=new THREE.Group();g.name=`object-${id}`;g.position.set(x,0,z);this.root.add(g);
  this.liveBox(g,1.45,.10,.65,'#ad885a',0,.84,0);for(const side of [-1,1])this.liveBox(g,.10,.82,.58,'#765f44',side*.56,.41,0);
  const cover=this.liveBox(g,.62,.06,.44,c,0,.94,0);cover.rotation.y=notes?-.18:.16;const pages=this.liveBox(g,.54,.018,.38,'#f5e8c7',0,.981,0);pages.rotation.y=cover.rotation.y;
  if(notes)this.liveBox(g,.035,.018,.34,'#5b776c',.23,1.003,0);else this.liveBox(g,.045,.07,.44,'#536d5c',-.30,.95,0);
  g.traverse(n=>n.userData.place=id);return g;
 }
 sign(text:string,x:number,y:number,z:number,width=2.4){
  this.box(width,.34,.10,'#e9d7ac',x,y,z);
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#e9d7ac';ctx.fillRect(0,0,768,96);ctx.fillStyle='#335c50';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,48,740);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width-.04,.30),new THREE.MeshBasicMaterial({map}));m.position.set(x,y,z+.056);this.root.add(m);
 }
 finish(){for(const[c,parts]of this.batches){const m=new THREE.Mesh(mergeGeometries(parts),this.mat(c));m.name='environment-batch';this.root.add(m);parts.forEach(g=>g.dispose());}this.batches.clear();}
}
