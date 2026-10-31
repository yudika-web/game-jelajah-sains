import * as THREE from 'three';
import {environmentMaterial} from './environmentStyle';
/** Cutaway boutique in the former decorative house footprint. One region owns its resources. */
export function buildCosmeticShop(parent:THREE.Group){
 const root=new THREE.Group();root.name='gaya-penjelajah';parent.add(root);
 const cube=new THREE.BoxGeometry(1,1,1),materials=new Map<string,THREE.MeshLambertMaterial>();
 const material=(c:string)=>{let m=materials.get(c);if(!m){m=environmentMaterial(c);materials.set(c,m);}return m;};
 function box(w:number,h:number,d:number,c:string,x:number,y:number,z:number,id='cosmeticShop'){
  const m=new THREE.Mesh(cube,material(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.userData.place=id;root.add(m);return m;
 }
 box(4.8,.05,4.8,'#e9d5bc',-12,.075,6).name='boutique-floor';
 // Back wall, side walls and a genuine 1.8 m door opening; open roof keeps exploration camera clear.
 box(5,2.9,.20,'#e4b6a3',-12,1.55,3.5);
 for(const x of [-14.5,-9.5]){box(.20,1.1,5,'#e4b6a3',x,.65,6);for(const z of [3.5,8.5])box(.22,2.9,.22,'#6b8a86',x,1.55,z);box(.24,.18,5.2,'#a86676',x,3,6);}
 for(const x of [-13.7,-10.3]){box(1.6,2.65,.2,'#e4b6a3',x,1.42,8.5,'shopEntrance');box(1.12,1.10,.09,'#89b9bb',x,1.62,8.63,'shopEntrance');box(1.23,.10,.12,'#fff1d4',x,1.02,8.64,'shopEntrance');}
 box(5.2,.26,.40,'#a86676',-12,2.95,8.5,'shopEntrance');
 for(const x of [-12.98,-11.02])box(.12,2.30,.26,'#fff1d4',x,1.22,8.5,'shopEntrance');
 box(2.1,.12,.40,'#fff1d4',-12,2.38,8.5,'shopEntrance');
 // Counter, clothing rail, layered hanging garments, mirror and accessory plinth.
 box(1.8,.80,.70,'#8c6b5b',-12,.52,4.9);box(1.95,.10,.82,'#ead5ac',-12,.97,4.9);
 for(const z of [5.4,7])box(.08,1.9,.08,'#536f72',-13.95,1.07,z);
 box(.10,.10,1.70,'#536f72',-13.95,2,6.2);
 for(let i=0;i<4;i++){
  const z=5.62+i*.38,c=['#6f8057','#eff1e6','#c3a56b','#3d6780'][i];
  box(.42,.72,.20,c,-13.95,1.50,z);box(.67,.22,.20,c,-13.95,1.83,z);box(.12,.22,.22,'#f1e0bf',-13.95,1.86,z+.01);
 }
 box(.12,1.85,1.30,'#a86676',-9.65,1.12,5.6);box(.03,1.62,1.07,'#c3dcd9',-9.73,1.12,5.6);
 box(.55,.85,.70,'#6b8a86',-10.02,.56,7.2);
 const brim=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.045,16),material('#bca16c'));brim.position.set(-10.02,1.02,7.2);root.add(brim);
 box(.32,.19,.32,'#bca16c',-10.02,1.12,7.2);
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='#fff1d4';c.fillRect(0,0,768,128);c.fillStyle='#69455a';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText('GAYA PENJELAJAH',384,65);c.font='25px sans-serif';c.fillText('Kostum · Rambut · Aksesori',384,107);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.35,.56),new THREE.MeshBasicMaterial({map}));sign.position.set(-12,2.98,8.72);sign.userData.place='shopEntrance';root.add(sign);
 }
 return root;
}
