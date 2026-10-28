import * as THREE from 'three';
import {marketPlaces} from '../data/marketRegion';
import {containerModels,densitySamples,marketModules} from '../data/marketContent';
import {containerResult} from '../game/marketModel';
import type {MarketProgress} from '../game/marketMission';
/** All geometry/materials are owned by the active Town root, with no frame allocations. */
export function buildMarket(root:THREE.Group){
 const g=new THREE.Group();g.name='market-ice-stations';root.add(g);
 const cube=new THREE.BoxGeometry(1,1,1),ball=new THREE.SphereGeometry(.026,6,5);
 const mats=new Map<string,THREE.MeshLambertMaterial>();
 const material=(color:string)=>{let m=mats.get(color);if(!m){m=new THREE.MeshLambertMaterial({color});mats.set(color,m);}return m;};
 function box(parent:THREE.Group,w:number,h:number,d:number,color:string,x=0,y=0,z=0){const m=new THREE.Mesh(cube,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
 const stations=new Map<string,THREE.Group>();
 for(const p of marketPlaces){const s=new THREE.Group();s.name=p.id;s.position.set(p.x,0,p.z-1);g.add(s);stations.set(p.id,s);box(s,p.id==='marketRack'?2.2:1.7,.12,.9,'#c6a77d',0,.83);for(const x of[-.65,.65])box(s,.1,.8,.65,'#7d775e',x,.4);}
 const phase=stations.get('marketPhase')!,density=stations.get('marketDensity')!,rack=stations.get('marketRack')!,pack=stations.get('marketPack')!;
 const jar=new THREE.Group();jar.position.set(-.4,.9,0);phase.add(jar);
 for(const x of[-.31,.31])box(jar,.025,.66,.64,'#b7d7d8',x,.33);box(jar,.64,.04,.64,'#e5e1cd',0,.02);
 const lid=box(jar,.68,.07,.68,'#66938f',0,.72);
 const ice=box(jar,.4773,.4773,.4773,'#c1e6ef',0,.3),liquid=box(jar,.55,.01,.55,'#68afc2',0,.03);
 const particles=new THREE.Group();particles.name='water-particle-model';particles.position.set(.48,1.1,.06);phase.add(particles);
 const fluid=[[ -.09,0,-.045],[-.01,.02,-.04],[.095,.01,-.035],[-.065,.09,-.045],[.03,.115,-.02],[.105,.105,-.025],[-.11,.035,.05],[-.005,.055,.045],[.08,.04,.06],[-.085,.13,.045],[.01,.145,.035],[.11,.13,.06]];
 const molecules:THREE.Mesh[]=[];for(let i=0;i<12;i++){const m=new THREE.Mesh(ball,material('#215e80'));m.name=`water-molecule-${String(i+1).padStart(2,'0')}`;m.userData.molecule='H2O';particles.add(m);molecules.push(m);}
 const scaleBase=box(phase,.55,.08,.34,'#576d70',-.4,.9,.4);scaleBase.name='tared-scale';box(phase,.4,.08,.1,'#e4dca7',-.4,.99,.53);
 const sampleGroups:THREE.Group[]=[],volumeFrames:THREE.LineSegments[]=[];const volumeMaterial=new THREE.LineBasicMaterial({color:'#d0a343'});
 const densityScale=box(density,.58,.08,.46,'#576d70',0,.935,.18);densityScale.name='market-density-balance';box(density,.56,.03,.44,'#d4ddda',0,.975,.18);box(density,.25,.13,.12,'#526d70',.46,.97,.28);box(density,.20,.07,.02,'#e4dca7',.46,1.0,.35);const massPointer=box(density,.018,.06,.025,'#294d52',.38,1.0,.365);massPointer.name='market-mass-indicator';
 marketModules.forEach((m,i)=>{const s=new THREE.Group();s.name=`density-sample-${m}`;s.userData.sample=m;s.position.set((i-1)*.53,.92,-.23);density.add(s);const size=.32*Math.cbrt(densitySamples[m].volumeCm3/100);box(s,size,size,size,m==='B'?'#5fadc0':'#c4e4eb',0,size/2);const volumeBox=new THREE.BoxGeometry(size,size,size),outline=new THREE.LineSegments(new THREE.EdgesGeometry(volumeBox),volumeMaterial);volumeBox.dispose();outline.name=`sample-volume-${m}`;outline.position.y=size/2;outline.visible=false;s.add(outline);volumeFrames.push(outline);sampleGroups.push(s);});
 const activeContainer=new THREE.Group();activeContainer.position.set(0,.92,0);rack.add(activeContainer);
 const shell=box(activeContainer,.84,.58,.72,containerModels.A.color,0,.29);const inner=box(activeContainer,.70,.42,.025,'#e6e7d7',0,.30,.375);inner.name='closed-container-model-cutaway';
 const boxWater=box(activeContainer,.62,.015,.15,'#569fac',0,.09,.4),boxIce=box(activeContainer,.48,.32,.16,'#c7e6ed',0,.28,.42);
 box(activeContainer,.9,.06,.76,'#405e66',0,.61);
 marketModules.forEach((m,i)=>box(rack,.25,.17,.23,containerModels[m].color,(i-1)*.55,1.08,-.25));
 const parcelAtRack=box(pack,.7,.43,.55,'#c69d53',0,1.1,0);parcelAtRack.name='M02-ICE-001-rack';box(pack,.8,.04,.65,'#526d67',0,.92);
 const received=new THREE.Group();received.position.set(-3.25,0,3);g.add(received);const deliveredBox=box(received,.42,.3,.35,'#c69d53',0,.18);deliveredBox.name='M02-ICE-001-receiver';
 const book=stations.get('marketBook')!;box(book,.55,.07,.4,'#527e8d',0,.95);box(book,.5,.035,.36,'#fff3cf',0,1.0);
 const notes=stations.get('marketNotes')!;box(notes,.65,.05,.45,'#fff0cd',0,.94);
 for(const p of marketPlaces)stations.get(p.id)!.traverse(n=>{n.userData.place=p.id;});
 let time=0;
 return{root:g,particles:molecules,frame(p:MarketProgress,fraction:number,dt:number,reduced:boolean){
  if(Number.isFinite(dt))time+=Math.max(0,Math.min(dt,.1));
  const t=p.trial,kind=t?.kind==='melt'||t?.kind==='evap'?t.kind:p.changes.at(-1)?.kind??'melt';
  const f=t?.kind===kind?(t.phase==='loaded'?0:fraction):p.changes.some(r=>r.kind===kind)?1:0;
  lid.visible=kind==='melt';ice.visible=kind==='melt'&&f<.999;
  const iceScale=Math.cbrt(Math.max(.0001,1-f));ice.scale.set(.4773*iceScale,.4773*iceScale,.4773*iceScale);ice.position.y=.04+.4773*iceScale/2;
  liquid.visible=kind==='evap'||f>0;const waterHeight=kind==='evap'?.33*(1-.5*f):.33*f;liquid.scale.y=Math.max(.001,waterHeight);liquid.position.y=.04+waterHeight/2;
  molecules.forEach((m,i)=>{const ix=i%3-1,iy=Math.floor(i/3)%2,iz=Math.floor(i/6)-.5,[fx,fy,fz]=fluid[i],motion=reduced?0:(kind==='melt'?f:1),mx=Math.sin(time*1.7+i)*.025*motion,mz=Math.cos(time*1.4+i)*.022*motion;if(kind==='melt')m.position.set(ix*.16*(1-f)+fx*f+mx,iy*.16*(1-f)+fy*f,iz*.16*(1-f)+fz*f+mz);else if(i>=6)m.position.set(fx*(1-f)+ix*.34*f+mx,fy+.7*f+(reduced?0:Math.sin(time+i)*.025*f),fz*(1-f)+iz*.45*f+mz);else m.position.set(fx+mx,fy,fz+mz);});
  sampleGroups.forEach((s,i)=>{const selected=t?.kind==='density'&&t.module===marketModules[i];s.position.set(selected?0:(i-1)*.53,selected?.99:.92,selected?.18:-.23);volumeFrames[i].visible=selected&&!!t?.volumeRead;});massPointer.position.x=t?.kind==='density'&&t.massRead?.38+.16*densitySamples[t.module!].massG/200:.38;
  const module=t?.kind==='container'?t.module!:p.containers.at(-1)?.module??'A',result=containerResult(module);
  const tested=t?.kind==='container'?(t.filled?t.phase==='loaded'?0:fraction:0):p.containers.some(r=>r.module===module)?1:0;
  shell.material=material(containerModels[module].color);const solid=1-tested*(1-result.iceG/1000),water=1-solid;boxIce.visible=t?.kind!=='container'||t.filled;boxIce.scale.y=Math.max(.001,.32*solid);boxIce.position.y=.09+.32*solid/2;boxWater.scale.y=Math.max(.001,.32*water);boxWater.position.y=.09+.32*water/2;boxWater.visible=water>0;
  parcelAtRack.visible=p.parcel.state==='rack';deliveredBox.visible=p.parcel.state==='delivered';
  g.userData.phase=kind;g.userData.tareG=40;g.userData.closedMassG=100;g.userData.parcelId=p.parcel.id;g.userData.parcelState=p.parcel.state;g.userData.containerIceG=result.iceG;g.userData.containerLiquidG=result.liquidG;
 }};
}
/** A single attachment lives with the player's rig, never a second inventory item. */
export function createMarketParcel(socket:THREE.Group){const g=new THREE.Group();g.name='M02-ICE-001-hand';g.visible=false;g.position.set(.50,-.42,.10);socket.add(g);const body=new THREE.Mesh(new THREE.BoxGeometry(1.05,.75,.8),new THREE.MeshLambertMaterial({color:'#c69d53'}));g.add(body);const band=new THREE.Mesh(new THREE.BoxGeometry(.14,.79,.84),new THREE.MeshLambertMaterial({color:'#e6edd3'}));g.add(band);const lid=new THREE.Mesh(new THREE.BoxGeometry(1.1,.1,.84),new THREE.MeshLambertMaterial({color:'#4f7f79'}));lid.position.y=.4;g.add(lid);return g;}
