import {defaultAppearance,parseAppearance,type Appearance} from '../game/appearance';
import {cosmetic,cosmeticSlotRules} from '../data/appearanceCatalog';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ArmRig, CharacterKind, CharacterRig, LegRig } from './character';
import { characterConfig } from './characterConfig';

const geometries = new Map<string, THREE.BufferGeometry>();
const materials = new Map<string, THREE.Material>();
function geometry(key: string, make: () => THREE.BufferGeometry) {
  let g = geometries.get(key);
  if (!g) { g = make(); g.userData.shared = true; geometries.set(key, g); }
  return g;
}
function color(value: string) {
  const key = `color/${value}`;
  if (!materials.has(key)) { const m = new THREE.MeshLambertMaterial({ color: value }); m.userData.shared = true; materials.set(key, m); }
  return materials.get(key)!;
}
const palettes = {
  raka:{skin:'#dba478',hair:'#372e2b',coat:'#467c9e',shirt:'#e8debd',pants:'#3f4e5a',boots:'#68523d',bag:'#b28c48'},
  bima: {skin:'#dba478',hair:'#372e2b',coat:'#c28b38',shirt:'#dce6df',pants:'#445361',boots:'#68523d',bag:'#b28c48'},
  explorer: { skin:'#efb47d', hair:'#493327', coat:'#27818d', shirt:'#f3e4c4', pants:'#484951', boots:'#795333', bag:'#ce9a36' },
  explorerGirl: { skin:'#efb47d', hair:'#493327', coat:'#27818d', shirt:'#f3e4c4', pants:'#484951', boots:'#795333', bag:'#ce9a36' },
  nara: { skin:'#d2a17c', hair:'#403028', coat:'#89639d', shirt:'#f4e4c5', pants:'#424f6b', boots:'#604630', bag:'#b49858' },
  wira: { skin:'#d49e71', hair:'#433126', coat:'#b6a17b', shirt:'#efe1bf', pants:'#4f5c3f', boots:'#7c5634', bag:'#b49858' },
  damar: {skin:'#d49e71',hair:'#433126',coat:'#a87835',shirt:'#e8dfb9',pants:'#485942',boots:'#695039',bag:'#b89850'},
  lestari: { skin:'#dfab7a',hair:'#433126',coat:'#4b9194',shirt:'#f2e2bd',pants:'#53667a',boots:'#765330',bag:'#c2a465' },
  sari: { skin:'#d9a374', hair:'#433126', coat:'#698757', shirt:'#ecddbb', pants:'#60543d', boots:'#765330', bag:'#c2a465' },
};
/** All drawings are local, cached textures. Unit/measurement tools can run without a DOM. */
function drawing(key: string, paint: (c: CanvasRenderingContext2D) => void, fallback: string, transparent = false) {
  if (!materials.has(key)) {
    let map: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
      const c = canvas.getContext('2d')!; paint(c);
      map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 2;
    }
    const m = transparent ? new THREE.MeshBasicMaterial({ map, color: map ? '#ffffff' : fallback, transparent:true, depthWrite:false, side:THREE.FrontSide }) : new THREE.MeshLambertMaterial({ map, color:map?'#ffffff':fallback });
    m.userData.shared = true; materials.set(key,m);
  }
  return materials.get(key)!;
}
export function buildReferenceCharacter(kind: CharacterKind, placeId?: string, selected?:Appearance): CharacterRig {
  const studentKind=kind==='explorer'||kind==='explorerGirl';
  const appearance=studentKind?parseAppearance(selected??defaultAppearance(kind==='explorerGirl'?'student-girl':'student-boy')):null;
  if(appearance)kind=appearance.base==='student-girl'?'explorerGirl':'explorer';
  const outfit=appearance?cosmetic(appearance.outfit)!.visual:null;
  const p = {...palettes[kind],...(appearance?{hair:cosmetic(appearance.hair)!.visual.color??palettes[kind].hair,bag:cosmetic(appearance.backpack)!.visual.color??palettes[kind].bag}:{}),...(outfit?{coat:outfit.coat!,shirt:outfit.shirt!,pants:outfit.pants!,boots:outfit.boots!}:{})}, girl = (kind === 'explorerGirl'||kind==='lestari'), student = kind === 'explorer' || kind==='explorerGirl';
  const root = new THREE.Group(); root.name = `character-${kind}`;
  const group = (name: string, parent: THREE.Object3D, x=0,y=0,z=0) => { const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g; };
  const visual = group('visual',root), bodyMeshes: THREE.Mesh[] = [], core: THREE.Mesh[] = [];
  const boxGeometry = (w:number,h:number,d:number,r=.025) => geometry(`box/${w}/${h}/${d}/${r}`,()=>new RoundedBoxGeometry(w,h,d,1,Math.min(r,w*.1,h*.1,d*.1)));
  const mesh = (parent:THREE.Object3D,g:THREE.BufferGeometry,m:THREE.Material|THREE.Material[],x=0,y=0,z=0,body=true,name='detail') => {
    const o=new THREE.Mesh(g,m);o.name=name;o.position.set(x,y,z);parent.add(o);
    o.userData.sharedGeometry=!!g.userData.shared;if(body)bodyMeshes.push(o);return o;
  };
  const box = (parent:THREE.Object3D,size:[number,number,number],c:string,x:number,y:number,z:number,body=true,r=.025) => mesh(parent,boxGeometry(...size,r),color(c),x,y,z,body);
  const hull = (parent:THREE.Object3D,key:string,points:number[][],c:string,body=true) => mesh(parent,geometry(`hull/${key}`,()=>new ConvexGeometry(points.map(v=>new THREE.Vector3(...v as [number,number,number])))),color(c),0,0,0,body);
  const texturedBox = (parent:THREE.Object3D,size:[number,number,number],base:string,front:THREE.Material,x:number,y:number,z:number,name:string) => {
    const m=color(base), o=mesh(parent,boxGeometry(...size),[m,m,m,m,front,m],x,y,z,true,name);core.push(o);return o;
  };
  const torso=group('torso',visual,0,2.0), head=group('head',torso,0,1.125), eyes=group('eyes',head,0,0,student?.436:.416);
  const headBox=mesh(head,boxGeometry(student?1.08:1.03,student?.98:.95,student?.86:.82,.045),color(p.skin),0,0,0,true,'head-block');core.push(headBox);
  const faceMaterial=drawing(`face/${kind}`,c=> {
    c.strokeStyle='#24221f';c.fillStyle='#24221f';c.lineCap='round';c.lineJoin='round';
    c.lineWidth=14;
    for(const side of [-1,1]) { const x=256+side*100;c.beginPath();c.moveTo(x-33,144+(girl?side*4:0));c.quadraticCurveTo(x, girl?127:139, x+34,147);c.stroke(); }
    c.lineWidth=12;c.beginPath();c.moveTo(202,342);c.quadraticCurveTo(256,girl?390:400,311,342);c.stroke();
    if(kind==='nara') {c.lineWidth=10;for(const x of [156,356]) {c.beginPath();c.ellipse(x,244,67,76,0,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(223,236);c.quadraticCurveTo(256,215,289,236);c.stroke();}
    if(kind==='wira') {c.beginPath();c.moveTo(174,314);c.bezierCurveTo(193,274,238,275,256,298);c.bezierCurveTo(279,275,319,275,339,314);c.quadraticCurveTo(296,337,256,313);c.quadraticCurveTo(216,337,174,314);c.fill();}
  },'#24221f',true);
  const plane=geometry('face-plane',()=>new THREE.PlaneGeometry(.94,.86));
  mesh(head,plane,faceMaterial,0,0,student?.435:.415,true,'flat-face');
  const eyeMaterial=drawing(`eyes/${student?'student':'npc'}/${girl?'girl':'classic'}`,c=> {c.fillStyle='#151a19';for(const side of [-1,1]) {c.beginPath();c.ellipse(256+side*100,girl?242:246,student?21:18,girl?35:38,0,0,Math.PI*2);c.fill();}},'#151a19',true);
  mesh(eyes,plane,eyeMaterial,0,0,.002,true,'flat-oval-eyes');
  let cosmetics:CharacterRig['cosmetics'];
  const hair=group('cosmetic-hair',head),headwear=group('cosmetic-headwear',head),facewear=group('cosmetic-facewear',head),equipment=group('temporary-equipment',head);
  let crown:THREE.Object3D=hair,fringe:THREE.Object3D=hair;
  if(appearance){
    const style=cosmetic(appearance.hair)!.visual.style;
    const cap=geometry('student-hair-cap',()=>{
      const pieces=[new THREE.BoxGeometry(1.10,.55,.16).translate(0,.24,-.44),new THREE.BoxGeometry(.12,.53,.60).translate(-.49,.24,-.10),new THREE.BoxGeometry(.12,.53,.60).translate(.49,.24,-.10)];
      const merged=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());return merged;
    });
    mesh(hair,cap,color(p.hair),0,0,0,false,'hair-rear-cap');
    crown=box(hair,[1.10,.22,.94],p.hair,0,.51,-.035,false);crown.name='hair-crown';
    fringe=hull(hair,`student-fringe-${style}`,style==='crop'?[[-.55,.28,.38],[-.55,.56,.30],[.45,.56,.30],[.52,.34,.40],[-.1,.34,.47],[-.55,.28,.46]]:[[-.55,.22,.38],[-.55,.56,.33],[.16,.68,.25],[.45,.54,.30],[.45,.29,.39],[-.05,.37,.52],[-.55,.22,.52]],p.hair,false);fringe.name='hair-fringe';
    if(style==='shoulder'){
      box(hair,[1.12,.95,.22],p.hair,0,-.02,-.47,false).name='shoulder-hair';
      for(const x of [-.50,.50])box(hair,[.16,.90,.44],p.hair,x,-.04,-.15,false);
    }
    if(style==='tied'){
      const pony=box(hair,[.40,.86,.42],p.hair,0,-.04,-.62,false);pony.name='ponytail';pony.rotation.x=-.13;
      box(hair,[.42,.09,.44],p.bag,0,.20,-.62,false).name='hair-tie';
    }
    if(cosmetic(appearance.headwear)!.visual.style==='cap'){
      crown.visible=!cosmeticSlotRules.cap.hideCrown;fringe.scale.y=cosmeticSlotRules.cap.fringeScale;
      box(headwear,[1.17,.27,1.01],cosmetic(appearance.headwear)!.visual.color??'#b38a43',0,.58,-.03,false).name='explorer-cap';
      box(headwear,[1.25,.075,1.16],'#d4b463',0,.44,.11,false).name='explorer-brim';
    }
    if(cosmetic(appearance.facewear)!.visual.style==='glasses'){
      const glasses=drawing(`student-glasses/${appearance.facewear}`,c=>{c.lineWidth=10;c.strokeStyle=cosmetic(appearance.facewear)!.visual.color??'#334e4c';for(const x of [156,356]){c.beginPath();c.ellipse(x,244,66,72,0,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(222,238);c.quadraticCurveTo(256,215,290,238);c.stroke();},'#334e4c',true);
      mesh(facewear,plane,glasses,0,0,.442,false,'student-glasses');
    }
    // A provision for later activities: one helmet overrides head slots, not personal data.
    box(equipment,[1.23,.29,1.07],'#d9e5e3',0,.61,0,false).name='equipment-helmet';
    box(equipment,[1.31,.08,1.17],'#527a86',0,.44,.04,false);equipment.visible=false;
  }else{
  // Three large hair forms: a U-shaped rear/temple cap, a crown, and a solid swept fringe.
  const hairCap=geometry('hair-cap',()=> {
    const parts=[new THREE.BoxGeometry(1.10,.62,.17).translate(0,.25,-.43),new THREE.BoxGeometry(.13,.62,.65).translate(-.49,.25,-.10),new THREE.BoxGeometry(.13,.62,.65).translate(.49,.25,-.10)].map(g=>g.toNonIndexed());
    const result=mergeGeometries(parts);parts.forEach(g=>g.dispose());return result;
  });
  mesh(head,hairCap,color(p.hair),0,0,0,true,'hair-rear-cap');
  box(head,[1.10,.27,.91],p.hair,0,.50,-.035).name='hair-crown';
  hull(head,'swept-fringe',[[-.55,.22,.38],[-.55,.56,.33],[.16,.72,.25],[.45,.54,.30],[.45,.29,.39],[-.05,.37,.52],[-.55,.22,.52]],p.hair).name='hair-fringe';
  if(girl) {
    const pony=box(head,[.40,.86,.42],p.hair,0,-.04,-.62);pony.name='ponytail';pony.rotation.x=-.13;
    // Band is a flat patch on the same rear hair silhouette.
    const band=drawing('hair-band',c=>{c.fillStyle=p.bag;c.fillRect(0,0,512,512);},p.bag);
    mesh(pony,geometry('band-plane',()=>new THREE.PlaneGeometry(.40,.10)),band,0,.22,-.213).rotation.y=Math.PI;
  } else if(kind==='nara'||kind==='sari') box(head,[.46,.43,.43],p.hair,.07,.25,-.65).name='hair-bun';
  }
  if(kind==='bima'||kind==='raka') {box(head,[1.18,.30,1.0],'#e3b344',0,.67,-.02).name='technician-helmet';box(head,[1.25,.08,1.12],'#f2cd69',0,.54,.04).name='helmet-brim';}
  if(kind==='wira'||kind==='sari'||kind==='damar') {
    const hat=kind==='damar'?'#596c44':kind==='wira'?'#5a6745':'#ccb16d', brim=kind==='wira'?'#73805b':'#e3c78b';
    box(head,[1.12,.32,.94],hat,0,.62,-.03).name='hat-crown';box(head,[1.24,.09,1.08],brim,0,.48,.045).name='hat-brim';
  }
  const coat=drawing(`coat/${kind}/${appearance?.outfit??'npc'}/${appearance?.backpack??'npc'}`,c=> {
    c.fillStyle=p.coat;c.fillRect(0,0,512,512);c.fillStyle=p.shirt;c.fillRect(186,0,140,512);
    // Shirt collar, jacket opening and vest pockets remain flat markings.
    c.strokeStyle=kind==='wira'?'#8e7f64':p.coat;c.lineWidth=6;
    c.beginPath();c.moveTo(187,0);c.lineTo(218,62);c.lineTo(256,24);c.lineTo(295,62);c.lineTo(325,0);c.stroke();
    if(student&&appearance?.backpack!=='back-none') {c.fillStyle=p.bag;for(const x of [72,400]){c.fillRect(x,0,33,372);c.fillStyle='#604b2a';c.fillRect(x-4,147,41,39);c.fillStyle=p.bag;c.fillRect(x+5,156,22,21);} }
    if(kind==='bima'||kind==='raka') {c.fillStyle='#ece6ca';c.fillRect(54,0,30,470);c.fillRect(428,0,30,470);c.fillStyle='#475e63';c.fillRect(94,155,74,90);c.fillRect(344,155,74,90);}
    if(kind==='wira'||kind==='damar') {c.strokeStyle='#8b7858';c.lineWidth=8;for(const x of [37,359])for(const y of [160,340]){c.strokeRect(x,y,114,116);c.beginPath();c.moveTo(x,y+28);c.lineTo(x+114,y+28);c.stroke();} }
    if(kind==='nara') {c.fillStyle='#b39970';for(const y of [164,266,368]){c.beginPath();c.arc(256,y,6,0,Math.PI*2);c.fill();}}
    if(kind==='sari') {c.fillStyle=p.bag;c.fillRect(75,100,362,412);c.strokeStyle='#9b814b';c.lineWidth=8;c.strokeRect(152,278,208,130);c.fillRect(96,0,25,128);c.fillRect(391,0,25,128);}
    if(student){c.strokeStyle='#ffffff66';c.lineWidth=7;for(const x of [40,350]){c.strokeRect(x,310,122,102);}c.fillStyle=p.shirt;c.beginPath();c.moveTo(150,0);c.lineTo(220,75);c.lineTo(188,0);c.fill();c.beginPath();c.moveTo(324,0);c.lineTo(292,75);c.lineTo(362,0);c.fill();}
  },p.coat);
  texturedBox(torso,[student?1.28:1.32,1.30,.65],p.coat,coat,0,0,0,'torso-block');
  const backpack=group('cosmetic-backpack',torso);
  if(student&&appearance?.backpack!=='back-none'){box(backpack,[.85,.94,.32],p.bag,0,-.04,-.50,false).name='backpack';box(backpack,[.57,.33,.10],'#dbab48',0,-.25,-.70,false).name='backpack-pocket';}
  if(appearance)cosmetics={hair,headwear,facewear,backpack,equipment,crown,fringe,mode:'none'};
  if(kind==='raka'){box(torso,[.40,.46,.09],'#e8ddb6',.38,-.15,.39).name='field-notebook';box(torso,[.05,.46,.11],'#375c72',.16,-.15,.39).name='notebook-spine';}
  if(kind==='nara') {
    const skirt=geometry('nara-skirt',()=> {
      const g=new THREE.BoxGeometry(1.42,.91,.84),positions=g.getAttribute('position');
      for(let i=0;i<positions.count;i++)if(positions.getY(i)>0) positions.setX(i,positions.getX(i)*.82);
      g.computeVertexNormals();return g;
    });mesh(torso,skirt,color(p.pants),0,-.91,0,true,'one-trapezoid-skirt');
  }
  const sleeve=kind==='wira'?p.shirt:p.coat;
  const armMaterial=drawing(`arm/${kind}/${appearance?.outfit??'npc'}`,c=> {c.fillStyle=sleeve;c.fillRect(0,0,512,512);c.fillStyle=p.skin;c.fillRect(0,388,512,124);if(student){c.fillStyle=p.shirt;c.fillRect(0,358,512,26);}},sleeve);
  const arm=(side:number):ArmRig=> {
    const shoulder=group(side<0?'left-shoulder':'right-shoulder',torso,side*(student?.84:.925),.61);
    shoulder.rotation.z=side*.035;
    const elbow=group('elbow-socket',shoulder,0,-.65),hand=group('hand-socket',elbow,0,-.50),toolSocket=group('tool-socket',hand,0,-.04,.04);
    const m=mesh(shoulder,boxGeometry(.46,1.30,.62),[armMaterial,armMaterial,color(sleeve),color(p.skin),armMaterial,armMaterial],0,-.65,0,true,side<0?'left-arm-block':'right-arm-block');core.push(m);
    return {shoulder,elbow,hand,toolSocket};
  };
  const legMaterial=drawing(`leg/${kind}/${appearance?.outfit??'npc'}`,c=>{c.fillStyle=kind==='nara'?p.skin:p.pants;c.fillRect(0,0,512,512);c.fillStyle=p.boots;c.fillRect(0,420,512,92);if(student){c.fillStyle='#463b32';c.fillRect(0,491,512,21);}},p.pants);
  const leg=(side:number):LegRig=> {
    const hip=group(side<0?'left-hip':'right-hip',visual,side*.335,1.35),knee=group('knee-socket',hip,0,-.68),ankle=group('ankle-socket',knee,0,-.67);
    const m=mesh(hip,boxGeometry(.62,1.35,.60),[legMaterial,legMaterial,color(p.pants),color(p.boots),legMaterial,legMaterial],0,-.675,0,true,side<0?'left-leg-block':'right-leg-block');core.push(m);
    return {hip,knee,ankle};
  };
  const leftArm=arm(-1),rightArm=arm(1),leftLeg=leg(-1),rightLeg=leg(1);
  // Tool meshes inherit exactly the same visual scale as the body, once.
  const notebook=group('notebook',leftArm.toolSocket);box(notebook,[.38,.48,.075],'#426f65',0,-.10,.10,false);box(notebook,[.32,.40,.04],'#f8edd4',0,-.10,.15,false);
  const meter=group('meter',rightArm.toolSocket);box(meter,[.25,.38,.19],'#e9b451',0,-.02,.12,false);box(meter,[.17,.14,.03],'#35595b',0,.03,.23,false);
  const sample=group('sample',rightArm.toolSocket);box(sample,[.22,.35,.22],'#7ca9ad',0,-.04,.12,false);box(sample,[.17,.07,.17],'#f0dfac',0,.17,.12,false);
  const wateringCan=group('watering-can',rightArm.toolSocket);box(wateringCan,[.38,.33,.30],'#659ea1',0,-.08,.18,false);
  const spout=box(wateringCan,[.11,.13,.34],'#9bc4c0',.17,.03,.36,false);spout.rotation.x=-.45;
  const handle=mesh(wateringCan,geometry('can-handle',()=>new THREE.TorusGeometry(.15,.025,5,10)),color('#bad5ce'),0,.12,.16,false);handle.rotation.y=Math.PI/2;
  const ruler=group('ruler',rightArm.toolSocket);box(ruler,[.09,.73,.045],'#e8c77a',0,.18,.08,false);
  for(let i=0;i<10;i++)box(ruler,[i%5===0?.065:.04,.012,.01],'#6b5d43',-.01,-.12+i*.064,.108,false,.002);
  const bucket=group('bucket',rightArm.toolSocket);
  box(bucket,[.50,.46,.48],'#bd9852',0,-.30,.15,false);
  box(bucket,[.39,.015,.37],'#75b9c5',0,-.13,.15,false).name='bucket-water';
  const bucketHandle=mesh(bucket,geometry('bucket-handle',()=>new THREE.TorusGeometry(.24,.025,5,10,Math.PI)),color('#4f6063'),0,-.08,.15,false);
  const indicator=box(bucket,[.25,.26,.012],'#73c1d0',0,-.29,.397,false);indicator.name='bucket-fill-indicator';
  bucketHandle.rotation.z=0;
  const rod=group('fishing-rod',rightArm.toolSocket);rod.rotation.x=1.6;
  const shaft=box(rod,[.045,2.6,.045],'#635d3c',0,1.05,.1,false);shaft.rotation.x=.15;
  box(rod,[.10,.38,.10],'#b08b4c',0,-.12,.07,false);box(rod,[.16,.16,.10],'#c4c8b3',.09,.10,.1,false);group('rod-tip',rod,0,2.35,.30);
  const vest=group('life-vest',torso);box(vest,[1.40,.90,.10],'#df8b3f',0,.04,.38,false);box(vest,[1.40,.90,.08],'#df8b3f',0,.04,-.37,false);box(vest,[.12,.90,.02],'#efda8f',0,.04,.45,false);
  const tools={notebook,meter,sample,wateringCan,ruler,bucket,rod,vest};Object.values(tools).forEach(t=>t.visible=false);
  // Measure only neutral body geometry; neither attachments nor a label can alter height.
  root.updateMatrixWorld(true);
  const bounds=new THREE.Box3();for(const body of student?core:bodyMeshes)bounds.union(new THREE.Box3().setFromObject(body));
  const baseHeight=bounds.max.y-bounds.min.y, height=characterConfig.heights[kind], scale=height/baseHeight;
  visual.scale.setScalar(scale);visual.position.y=characterConfig.groundY-bounds.min.y*scale;
  const labelSocket=group('label-socket',root,0,characterConfig.groundY+height+characterConfig.labelGap);
  const shadowMaterial=colorShadow();
  const shadow=mesh(root,geometry('contact-shadow',()=>new THREE.CircleGeometry(.36,24)),shadowMaterial,0,characterConfig.groundY-.006,0,false,'contact-shadow');shadow.rotation.x=-Math.PI/2;shadow.scale.y=.72;
  root.updateMatrixWorld(true);
  const headBounds=new THREE.Box3().setFromObject(headBox);
  const dimensions={baseHeight,height,scale,groundY:characterConfig.groundY,visualY:visual.position.y,headCenter:headBounds.getCenter(new THREE.Vector3()).y,headHeight:headBounds.max.y-headBounds.min.y};
  if(placeId)root.traverse(node=>{node.userData.place=placeId;});
  return {kind,appearance,cosmetics,root,visual,torso,head,eyes,leftArm,rightArm,leftLeg,rightLeg,labelSocket,tools,bodyMeshes,core,dimensions};
}
function colorShadow() {
  if(!materials.has('contact-shadow')) {const m=new THREE.MeshBasicMaterial({color:'#344b36',transparent:true,opacity:.17,depthWrite:false});m.userData.shared=true;materials.set('contact-shadow',m);}
  return materials.get('contact-shadow')!;
}
/** Geometry-based world bounds, excluding tools, labels and contact shadow even if visible. */
export function characterBodyBounds(rig: CharacterRig) {
  rig.root.updateMatrixWorld(true);const bounds=new THREE.Box3();
  for(const body of rig.appearance?rig.core:rig.bodyMeshes)bounds.union(new THREE.Box3().setFromObject(body));return bounds;
}
