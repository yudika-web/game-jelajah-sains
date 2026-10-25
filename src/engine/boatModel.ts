import * as THREE from 'three';
/** Shared hull for W04 and W05; resources owned by active region. */
export function buildResearchBoat(root:THREE.Group){
 const mats=new Map<string,THREE.MeshLambertMaterial>();const box=(parent:THREE.Object3D,w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{if(!mats.has(c))mats.set(c,new THREE.MeshLambertMaterial({color:c}));const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats.get(c));mesh.position.set(x,y,z);parent.add(mesh);};
 const boat=new THREE.Group();boat.name='research-boat';root.add(boat);
 box(boat,1.65,.18,2.45,'#577f7e',0,-.16,0);box(boat,1.5,.1,2.20,'#bd9a65',0,-.02,0);
 for(const x of [-.85,.85])box(boat,.16,.62,2.5,'#548a8b',x,.14,0);
 for(const z of [-1.24,1.24])box(boat,1.85,.62,.13,'#548a8b',0,.14,z);
 box(boat,1.45,.16,.43,'#9f794e',0,.58,-.06);
 for(const x of [-.44,.44])box(boat,.07,.60,.07,'#586760',x,.54,.35);
 box(boat,.96,.07,.07,'#d2b477',0,.84,.35);
 return boat;
}
