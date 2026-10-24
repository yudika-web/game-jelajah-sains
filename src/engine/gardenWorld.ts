import * as THREE from 'three';
import { gardenPlaces } from '../data/regions';
import { heightsAt, type GardenProgress, type Group } from '../game/gardenMission';
import type { PlaceId } from '../data/content';
interface Builder {
  root: THREE.Group;
  box(w: number, h: number, d: number, color: string, x: number, y: number, z: number): void;
  label(text: string, x: number, y: number, z: number, id?: PlaceId, building?: boolean): void;
  npc(id: PlaceId, x: number, z: number): void;
}
export interface GardenView {
  update(p: GardenProgress): void;
  water(group: Group): void;
  frame(dt: number, reducedMotion: boolean): void;
}
export function buildGarden({root, box: b, label, npc}: Builder): GardenView {
  const mesh = (geometry: THREE.BufferGeometry, color: string, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color })); m.position.set(x, y, z); parent.add(m); return m;
  };
  b(39, .9, 38, '#7d9e64', 0, -.5, 0);
  b(3.6, .08, 34, '#e2cd9d', 0, .03, 1);
  b(29, .09, 3, '#e2cd9d', 0, .035, 4.7);
  b(26, .09, 2.2, '#d9c495', 0, .04, -6.2);
  for (const x of [-5, 5]) b(4.5, .08, 3, '#dcc79c', x, .03, -.2);
  // Low rails frame the garden; the south gate remains open.
  for (let z = -15; z <= 18; z += 2.8) for (const x of [-16.8, 16.8]) b(.22, 1.2, .22, '#bc9a66', x, .6, z);
  for (const x of [-16.8,16.8]) for (const y of [.45,.95]) b(.14,.13,34,'#d0b180',x,y,1.5);
  for (let x = -16; x <= 16; x += 2.8) for (const z of [-15.8,18.8]) if (z < 0 || Math.abs(x)>2) b(.22,1.2,.22,'#bc9a66',x,.6,z);
  for (const z of [-15.8,18.8]) for (const x of [-9,9]) for(const y of [.45,.95]) b(13.5,.13,.14,'#d0b180',x,y,z);
  // Farmer's lodge and an open-looking nursery, with a clear walking lane between them.
  for (const [x,z,w,d,h,color] of [[-10,9,6,5,3.6,'#e6c899'],[-10,-9,6,5,3.4,'#bbd3b2'],[10,10,5,4,3,'#ddb88c']] as const) {
    b(w,h,d,color,x,h/2,z); b(w+.6,.48,d+.6,'#67846a',x,h+.1,z);
    b(1.3,2,.1,'#79694b',x,1,z+d/2+.06);
    for (const dx of [-w*.3,w*.3]) { b(1.1,1.3,.12,'#eee5bc',x+dx,2,z+d/2+.08); b(.87,1.07,.14,'#8bbaa9',x+dx,2,z+d/2+.10); }
  }
  label('POS BU SARI',-10,4.7,9,undefined,true);
  label('RUMAH SEMAI',-10,4.5,-9,undefined,true);
  label('BENIH & ALAT',10,4,10,undefined,true);
  // Nursery roof ribs and seedlings suggest a sheltered propagation space.
  for (let x=-12.5;x<=-7.5;x+=1) b(.07,.08,5.4,'#ecedd2',x,3.8,-9);
  for (let i=0;i<4;i++) { b(.5,.4,.5,'#ba8658',-12+i*1.2,.25,-5.6); b(.1,.6,.1,'#669657',-12+i*1.2,.7,-5.6); }
  // Entry arch and route signs.
  for (const x of [-1.8,1.8]) b(.3,3.4,.3,'#9b754e',x,1.7,16);
  b(4.3,.5,.45,'#648564',0,3.4,16);
  label('KOTA SAINS →',0,4.1,16,'townGate',true);
  for (const [text,x,z] of [['PETAK A & B ↑',1.9,1.7],['← BUKU · TANDON →',1.9,5.5]] as const) {
    b(.14,1.6,.14,'#92744e',x,.8,z); b(2.6,.6,.15,'#6d8b60',x,1.7,z); label(text,x,2.5,z,undefined,true);
  }
  for (const [x,z] of [[-14,-13],[-14,0],[-14,14],[14,-12],[14,-5],[14,6],[-4,-13],[6,-13]]) {
    b(.4,2.2,.4,'#93724e',x,1,z); b(2.1,2.2,2.1,'#527e53',x,2.8,z); b(1.6,1,1.6,'#7b9b5b',x+.2,4.1,z);
  }
  const plants: { group: Group; index: number; seed: THREE.Mesh; stem: THREE.Mesh; leaves: THREE.Mesh[] }[] = [];
  const leafGeometry = new THREE.SphereGeometry(1,6,4).scale(.23,.055,.11);
  const stemGeometry = new THREE.CylinderGeometry(.025,.035,1,6);
  const seedGeometry = new THREE.SphereGeometry(.085,6,4).scale(1,.6,.8);
  for (const group of ['A','B'] as const) {
    const x = group==='A' ? -5 : 5, color=group==='A'?'#387d8b':'#ad783b';
    b(4.5,.38,2.8,'#9e7a50',x,.18,-3); b(4.2,.05,2.5,'#6c5038',x,.40,-3);
    for(const dx of [-2.2,2.2]) b(.15,.5,2.9,'#bd9561',x+dx,.24,-3);
    label(`${group} · ${group==='A'?100:50} mL / tanaman`,x,3.3,-2.4,group==='A'?'plotA':'plotB');
    for(let i=0;i<3;i++) {
      const px=x+(i-1)*1.25, pz=-3;
      const pot=mesh(new THREE.CylinderGeometry(.44,.32,.50,8),'#ba855b',px,.63,pz); pot.userData.place=group==='A'?'plotA':'plotB';
      mesh(new THREE.CylinderGeometry(.39,.39,.04,8),'#5b4532',px,.89,pz);
      const seed=mesh(seedGeometry,'#9daa58',px,.94,pz);
      const stem=mesh(stemGeometry,'#5b8e4a',px,1,pz);
      const leaves=Array.from({length:6},(_,j)=> { const leaf=mesh(leafGeometry,j%2?'#8eaf5f':'#629449',px,1,pz); leaf.rotation.z=(j%2?1:-1)*.3; return leaf; });
      plants.push({group,index:i,seed,stem,leaves}); label(`${group}${i+1}`,px,1.2,-1.55,group==='A'?'plotA':'plotB');
    }
  }
  // Real world objects associated with the interaction markers.
  mesh(new THREE.CylinderGeometry(1.15,1.15,2.8,12),'#79a8a1',9,1.5,1);
  mesh(new THREE.CylinderGeometry(1.23,1.23,.16,12),'#486e65',9,2.95,1);
  b(.18,.15,.55,'#d3b572',9,.85,2.25); b(.45,.12,.12,'#d3b572',9,1.02,2.15);
  b(2.5,.18,1.2,'#aa8155',0,1.25,-8);
  for(const x of [-1,1]) b(.15,1.2,.15,'#886a4b',x,.6,-8);
  b(.6,.08,.7,'#f3e7bf',-.4,1.39,-8); b(.35,.1,.45,'#6d9270',.6,1.4,-8);
  for(const [x,y,z] of [[4.5,.4,6],[5.4,.4,6],[5,.95,6]]) b(.75,.7,.75,'#b78c58',x,y,z);
  b(.5,.05,.6,'#f5df99',5,1.4,6);
  for(const id of ['gardenBook','fairNotes'] as const) {
    const p=gardenPlaces.find(p=>p.id===id)!;
    b(.12,1.5,.12,'#9b7951',p.x,.75,p.z); b(1.5,1,.14,p.color,p.x,1.65,p.z);
    b(.6,.07,.5,'#faecc9',p.x,2.2,p.z);
  }
  for(const p of gardenPlaces) {
    if(p.id==='sari') npc(p.id,p.x,p.z);
    else if(!['plotA','plotB','townGate'].includes(p.id)) label(p.short,p.x,p.id==='waterTank'?3.7:2.7,p.z,p.id);
    const ring=mesh(new THREE.RingGeometry(.65,.76,24),p.color,p.x,.12,p.z); ring.rotation.x=-Math.PI/2;
  }
  const drops = groupsOfDrops();
  function groupsOfDrops() {
    return (['A','B'] as const).map(group=> {
      const fx=new THREE.Group(); root.add(fx); fx.visible=false;
      const dropGeometry=new THREE.SphereGeometry(.045,5,4);
      for(let i=0;i<12;i++) mesh(dropGeometry,'#8dd4df',(group==='A'?-5:5)+(Math.floor(i/4)-1)*1.25+(i%2)*.12,1.7,-3+(i%3)*.13,fx);
      return {group,fx,time:0};
    });
  }
  return {
    update(p) {
      for(const plant of plants) {
        const planted=p.planted[plant.group], height=heightsAt(p.day,plant.group)[plant.index]*.15;
        plant.seed.visible=planted&&p.day===0; plant.stem.visible=planted&&p.day>0;
        plant.stem.scale.y=Math.max(.01,height); plant.stem.position.y=.94+height/2;
        plant.leaves.forEach((leaf,j)=> {
          leaf.visible=planted&&p.day>0&&j<(p.day<3?2:p.day<5?4:6);
          leaf.position.y=.97+height*(.45+Math.floor(j/2)*.23); leaf.position.x=(plant.group==='A'?-5:5)+(plant.index-1)*1.25+(j%2?1:-1)*.17;
        });
      }
      root.userData.day=p.day;
    },
    water(group) { const d=drops.find(d=>d.group===group)!; d.time=1.8; d.fx.visible=true; },
    frame(dt,reducedMotion) { for(const d of drops) if(d.time>0) { d.time-=dt; d.fx.visible=d.time>0; d.fx.position.y=reducedMotion?0:-((1.8-d.time)*1.2% .7); } },
  };
}
