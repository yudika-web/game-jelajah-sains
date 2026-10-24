import * as THREE from 'three';
import { riverPlaces } from '../data/riverRegion';
import { fishGroups, type FishGroup } from '../data/riverContent';
import type { PlaceId } from '../data/content';
import type { FishingPhase } from '../game/fishingSession';
interface Builder {
  root:THREE.Group; box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;
  label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;
  npc(x:number,z:number):void;
}
/** Three recognizable local silhouettes, reused for decorative and sampled fish. */
export function fishModel(group: FishGroup) {
  const root=new THREE.Group(),flat=group==='flat',whiskered=group==='whiskered';
  const material=new THREE.MeshLambertMaterial({color:flat?'#d5a447':whiskered?'#687b92':'#64a093'});
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,8,5),material);body.scale.set(flat?.38:.54,flat?.25:whiskered?.14:.10,.11);root.add(body);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(flat?.20:.14,.28,3),material);tail.rotation.z=-Math.PI/2;tail.position.x=-.53;root.add(tail);
  const fin=new THREE.Mesh(new THREE.ConeGeometry(.13,.17,3),material);fin.position.set(-.03,flat?.24:.12,0);root.add(fin);
  const eyeMat=new THREE.MeshBasicMaterial({color:'#193c35'}),eyeGeo=new THREE.SphereGeometry(.027,6,4);
  for(const z of [-.106,.106]){const eye=new THREE.Mesh(eyeGeo,eyeMat);eye.position.set(flat?.24:.41,.045,z);root.add(eye);}
  if(whiskered)for(const z of [-1,1]){
    const points=[new THREE.Vector3(.47,-.015,z*.05),new THREE.Vector3(.73,-.06,z*.27)];
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#334c60'})));
  }
  return root;
}
export interface RiverView {
  frame(dt:number,reduced:boolean,phase:FishingPhase,elapsed:number,group:FishGroup,rodTip:THREE.Vector3,player:THREE.Vector3,site:'A'|'B'):void;
  clearFishing():void;
}
export function buildRiver({root,box:b,label,npc}:Builder):RiverView {
  b(20,.8,40,'#87a879',-7,-.45,1);b(22,.5,40,'#5099a5',14,-.50,1);
  b(3.3,.07,31,'#dfd5b1',-2,.025,1);b(15,.06,3,'#d8ccaa',-5,.025,5);b(10,.06,3,'#d8ccaa',-2,.025,-7);
  // Wide wooden pier with its deck at the same walking height as the bank.
  b(8,.20,4,'#9b7953',6,.0,-7);
  for(let x=2.2;x<10;x+=.45)b(.03,.012,3.95,'#6f573f',x,.107,-7);
  for(const x of [3,6,9])for(const z of [-8.6,-5.4])b(.18,1,.18,'#7c6449',x,-.3,z);
  // Physical water boundary and railings leave both marked observation stations clear.
  for(let z=-15;z<18;z+=1.5)if(z< -9||z> -5){b(.12,.85,.12,'#8e7e58',2.9,.425,z);b(.10,.10,1.6,'#baab7a',2.9,.70,z);}
  for(const x of [-17.8])for(let z=-16;z<19;z+=2){b(.13,.9,.13,'#8b7956',x,.45,z);b(.12,.12,2.1,'#b1a076',x,.7,z);}
  b(4,3.1,3,'#d7ddc1',-11,1.55,11);b(4.5,.3,3.5,'#508a85',-11,3.2,11);
  b(1.1,2.1,.12,'#64837b',-11,1.05,12.57);b(1,.9,.12,'#9ac6cb',-12.1,1.9,12.58);label('POS RISET PERAIRAN',-11,3.9,11,undefined,true);
  for(const [x,z]of [[-15,6],[-14,-7],[-2,-12],[-15,16]]){b(.45,2.2,.45,'#92764f',x,1.1,z);b(2.4,1.9,2.4,'#5a8b63',x,2.9,z);b(1.6,1.2,1.6,'#7e9e64',x+.2,4,z);}
  for(let z=-14;z<18;z+=2.8){b(.6,.4,.8,'#b4b59b',2.5,.12,z);if(z>0)for(let i=0;i<3;i++)b(.10,.75+i*.13,.10,'#6d995f',3.5+i*.25,.26,z);}
  for(const id of ['fishBook','samplingNotes','fishResults'] as const){const p=riverPlaces.find(p=>p.id===id)!;b(.13,1.3,.13,'#8e7755',p.x,.65,p.z-.7);b(1.6,.85,.13,p.color,p.x,1.55,p.z-.7);b(.7,.08,.45,'#f3e7c4',p.x,2.04,p.z-.7);}
  b(2,.14,1,'#a08058',-6,.84,-6.7);for(const x of [-6.8,-5.2])b(.12,.8,.12,'#756346',x,.4,-6.7);
  b(.65,.06,.5,'#f1e5bd',-6,.96,-6.7);b(.8,.025,.10,'#dfbd62',-6,1,-6.3);
  b(1.8,.12,.5,'#9b7b54',-2,.8,7.4);for(const x of [-2.6,-1.4]){b(.09,1.6,.09,'#5a6d55',x,1.2,7.4);b(.08,.3,.08,'#ba975f',x,.50,7.4);}
  for(const x of [-3.8,-.2])b(.25,3.2,.25,'#8b7957',x,1.6,15);b(4,.4,.4,'#578f8d',-2,3.3,15);
  npc(-6,9);
  for(const p of riverPlaces){if(p.id!=='lestari')label(p.short,p.x,p.id==='rodRack'?2.5:2.35,p.z,p.id);const disc=new THREE.Mesh(new THREE.RingGeometry(.62,.73,24),new THREE.MeshBasicMaterial({color:p.color,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.set(p.x,.125,p.z);disc.userData.place=p.id;root.add(disc);}
  const waterLines:THREE.Mesh[]=[];
  const waveMaterial=new THREE.MeshBasicMaterial({color:'#9cd0d0',transparent:true,opacity:.50}),waveGeometry=new THREE.BoxGeometry(.9,.012,.055);
  for(let i=0;i<14;i++){const wave=new THREE.Mesh(waveGeometry,waveMaterial);wave.position.set(4+i%4*3.6,-.225,-15+Math.floor(i/4)*8);root.add(wave);waterLines.push(wave);}
  const decorative=fishGroups.map((g,i)=>{const fish=fishModel(g);fish.position.set(6+i*3,-.1,4+i*2);fish.scale.setScalar(.65);root.add(fish);return fish;});
  const tackle=new THREE.Group();root.add(tackle);tackle.visible=false;
  const float=new THREE.Group();tackle.add(float);
  for(const [y,color]of [[0,'#f1d17c'],[.14,'#cc7655']] as const){const m=new THREE.Mesh(new THREE.SphereGeometry(.11,8,5),new THREE.MeshLambertMaterial({color}));m.position.y=y;float.add(m);}
  const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const line=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'#eff4df'}));line.frustumCulled=false;tackle.add(line);
  const caught=Object.fromEntries(fishGroups.map(g=>{const fish=fishModel(g);tackle.add(fish);return[g,fish];})) as Record<FishGroup,THREE.Group>;
  const start=new THREE.Vector3(),end=new THREE.Vector3(),fishStart=new THREE.Vector3();let time=0;
  function clearFishing(){tackle.visible=false;Object.values(caught).forEach(f=>f.visible=false);}
  return {clearFishing,frame(dt,reduced,phase,elapsed,group,tip,player,site){
    if(!reduced){time+=dt;waterLines.forEach((wave,i)=>{wave.position.x=4+i%4*3.6+Math.sin(time*.7+i)*.30;});decorative.forEach((f,i)=>{f.position.x=6+i*3+Math.sin(time*.4+i)*1.1;f.rotation.y=Math.cos(time*.4+i)>0?0:Math.PI;});}
    const active=phase!=='idle';tackle.visible=active;if(!active)return;
    end.set(site==='A'?5:10.3,-.11,player.z-.2);start.copy(tip);
    const cast=phase==='casting'?Math.min(1,elapsed/.8):1;float.position.lerpVectors(start,end,cast);if(phase==='casting')float.position.y+=Math.sin(cast*Math.PI)*.8;
    if(phase==='ready'&&!reduced)float.position.y+=Math.sin(time*7)*.07;
    float.visible=phase!=='observing';line.visible=phase!=='released';
    const a=lineGeometry.getAttribute('position') as THREE.BufferAttribute;a.setXYZ(0,tip.x,tip.y,tip.z);a.setXYZ(1,float.position.x,float.position.y,float.position.z);a.needsUpdate=true;
    for(const g of fishGroups)caught[g].visible=g===group&&(phase==='observing'||phase==='released');
    fishStart.set(player.x+.8,1.4,player.z-.05);const fish=caught[group];fish.rotation.y=0;
    if(phase==='observing'){const t=Math.min(1,elapsed/.55);fish.position.lerpVectors(end,fishStart,t);fish.rotation.z=reduced?0:Math.sin(time*4)*.05;}
    if(phase==='released'){const t=Math.min(1,elapsed/.75);fish.position.lerpVectors(fishStart,end,t);fish.position.y+=Math.sin(t*Math.PI)*.4;float.visible=false;}
  }};
}
