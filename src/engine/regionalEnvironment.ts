import * as THREE from 'three';
import {EnvironmentKit} from './environmentKit';
import {createCharacter} from './character';
import {CharacterAnimator} from './characterAnimator';
import {ambientStation} from '../data/environmentLayout';
import type {RegionId} from '../game/gameState';
/** Decoration has no mission callbacks, inventory, reward or storage reference. */
export function buildRegionalEnvironment(parent:THREE.Object3D,region:RegionId){
 const k=new EnvironmentKit(parent),sway:THREE.Object3D[]=[];
 if(region==='garden'){
  for(const [z,d]of [[-9,3],[-13,2]]){
   k.box(5,.24,d,'#936844',9,.16,z);k.box(4.75,.06,d-.24,'#684c34',9,.31,z);
   for(let row=0;row<2;row++)for(let i=0;i<6;i++){
    const x=7+i*.8,pz=z+(row?1:-1)*(d/2-.45);k.cylinder(.14,.19,'#8a663e',x,.41,pz);
    k.shape(new THREE.SphereGeometry(1,6,4),row?'#5e8c4e':'#87a957',x,.63,pz,.25,.26,.24);
   }
   for(const x of [6.55,11.45])k.box(.13,.30,d+.08,'#c3a577',x,.18,z);
  }
  k.sign('KEBUN DEKORATIF · BUKAN PETAK A/B',9,1.20,-7.35,4.3);
  k.box(.40,.08,8,'#739b9e',12.1,.02,-10.5);for(const x of [11.85,12.35])k.box(.10,.17,8,'#b6a782',x,.02,-10.5);
  for(let i=0;i<4;i++){k.box(.58,.40,.58,'#b28b58',10.8+i*.34,.30,9.5);k.cylinder(.09,.68,'#718e52',10.8+i*.34,.81,9.5);}
  k.box(.08,1.5,.08,'#8e7954',11.6,1.2,8.1,0,0,.12);k.box(.45,.12,.10,'#96aaa4',11.7,.50,8.1);
  k.box(.76,.055,1.7,'#d4c4a2',6.1,.067,-9);
 }
 if(region==='rimba'){
  const backdrop=new EnvironmentKit(k.optional);for(let i=0;i<8;i++)backdrop.tree(i%2?-25:25,-13+Math.floor(i/2)*10,i,['#496743','#6c8554']);backdrop.finish();
  // All supplies stay on the existing hut footprint, clear of the source/cart lane.
  for(const x of [-13.2,-10.8])for(let row=0;row<2;row++){k.box(.64,.42,.60,'#ac885b',x,.32+row*.43,12.3);for(const dx of [-.26,.26])k.box(.06,.40,.62,'#d0b884',x+dx,.32+row*.43,12.3);}
  k.box(.72,.08,1.1,'#c0af84',-9.3,.055,12);
  for(const [x,z]of [[-16,1],[-15,17],[16,3],[-8,-12]]){
   for(let i=0;i<5;i++)k.box(.32,.025,.14,i%2?'#a18c53':'#8b754d',x-.6+i*.30,-.005,z+.8+(i%2)*.24,0,i*.7,0);
  }
  for(let i=0;i<6;i++){const branch=new THREE.Group();branch.position.set(-15.5+i*.12,2.6,17);k.optional.add(branch);k.liveBox(branch,.32,.055,.16,'#718d55',0,0,0);sway.push(branch);}
 }
 if(region==='river'){
  k.box(.8,.06,1.1,'#c7b289',1.8,.065,-12);
  for(const x of [-12.5,-9.5]){k.box(.16,2.4,.16,'#829889',x,1.2,12.3);k.box(.45,.12,.30,'#cfb777',x,2.3,12.3);}
  k.sign('POS RISET · ALAT PINJAMAN',-11,2.7,12.75,3.4);
 }

 if(region==='workshop'){
  // The only new footprint is a maintenance bench beside the old workshop lane.
  k.table(-12.5,1.2,2,1);k.box(.8,.16,.5,'#83988e',-12.5,.99,1.2);
  for(let i=0;i<3;i++){k.cylinder(.12,.08,'#c6a563',-13+i*.4,1.08,1.2,Math.PI/2);k.box(.12,.06,.4,'#5c7375',-13+i*.4,1.04,.94);}
  k.sign('MEJA PERAWATAN',-12.5,1.7,.84,1.8);
  // Wall-mounted cabinets, trays and pipes occupy the existing building, not paths.
  for(const x of [-14,-8]){
   k.box(1.2,1.8,.30,'#738f89',x,1.15,-8.3);for(const y of [.55,1.35,2.05])k.box(1.1,.10,.5,'#d1ba88',x,y,-8.18);
   for(const dx of [-.3,.2]){k.box(.16,.7,.08,'#d9ba68',x+dx,1.52,-7.90);k.box(.36,.14,.12,'#667d80',x+dx,1.9,-7.88);}
  }
  k.box(6,.12,.18,'#75888b',-11,2.55,-8.24);k.cylinder(.09,1.8,'#99aaa3',-14,1.62,-8.18);
  k.box(1.7,.18,1.4,'#b5aa89',-12.5,.08,2.3);
 }

 if(region==='geopark'){
  // Visitor examines an illustrative outcrop, not a colour-based rock identification task.
  k.rock(-15.7,.50,8.6,1.35,.52,.84,'#a49a81',3);k.rock(-15.3,.93,8.5,.92,.44,.70,'#c0ad86',1);
  k.box(.72,.04,1,'#d2c5a3',-13,.04,8.6);
  for(const z of [-1,5,10]){k.box(.12,.7,.12,'#8b795a',-17,.35,z);k.box(.12,.7,.12,'#8b795a',-17,.35,z+1.8);k.box(.10,.10,2,'#b59b70',-17,.74,z+.9);}
  // Small non-colliding ground accents sit within blocked scenic/tree footprints.
  for(const [x,z]of [[16,6],[-16,19],[16,19]]){k.rock(x-.55,.12,z+.5,.4,.18,.35,'#b8a786',2);k.rock(x+.4,.1,z-.4,.24,.13,.3,'#c9b994',3);}
 }

 if(region==='town'){
  // Existing building footprints own these window boxes; keep the plaza and boutique entrance open.
  for(const x of [-11.5,-6.5]){k.box(1.5,.26,.42,'#ad885a',x,1.29,-5.76);for(let i=0;i<4;i++){k.rock(x-.5+i*.33,1.51,-5.70,.16,.20,.15,'#739b60',i);k.cylinder(.07,.07,'#d9b66d',x-.5+i*.33,1.74,-5.70);}}
  k.sign('PARA PENJELAJAH · JAGA JALUR TETAP LAPANG',-5,1.15,11.16,3.6);
 }
 if(region==='coast'){
  // Dry equipment stays on the already blocked research-hut footprint. No extra habitat claims.
  for(const x of [-12.8,-9.2]){k.box(.16,1.9,.16,'#8e7954',x,.95,8.5);k.box(.6,.12,.55,'#d8bd83',x,1.75,8.5);}
  for(let i=0;i<3;i++){k.box(.42,.38,.38,'#668d84',-12.5+i*.58,.30,8.5);k.box(.25,.10,.25,'#d5c6a0',-12.5+i*.58,.54,8.5);}
  k.box(2.2,.14,.18,'#8e7954',-11,2,8.3);for(let i=0;i<3;i++)k.box(.22,.6,.18,'#d3aa58',-11.6+i*.6,1.65,8.38);
  for(const [x,z]of [[1,10],[19,-6]])for(const dx of [-1.7,1.7]){k.cylinder(.12,1.7,'#8d7656',x+dx,-.8,z);k.box(.12,.12,2.5,'#9c8259',x+dx,-1,z,Math.PI/5);}
 }
 if(region==='space'){
  // Crew uses a side diagnostic cabinet. No decorative reading affects M07 or EVA equipment.
  k.box(.7,1.1,.4,'#355774',-13.5,.64,4.55);k.box(.54,.32,.06,'#91c5d0',-13.5,1.12,4.78);k.box(.8,.09,.6,'#c5d5e0',-13.5,.90,4.6);
  for(const x of [-15.8,-10.2]){k.box(.12,.12,1.3,'#8bd2de',x,2.4,15.7);k.box(.08,.8,.08,'#6e99ac',x,1.95,16.3);}
 }
 k.finish();
 const station=['garden','rimba','river','workshop','geopark','space'].includes(region)?ambientStation[region as keyof typeof ambientStation]:undefined;
 let actor:ReturnType<typeof createCharacter>|null=null,animator:CharacterAnimator|null=null;
 if(station){actor=createCharacter(station.kind);actor.root.name=`ambient-${region}`;actor.root.position.set(station.x,0,station.z);actor.root.rotation.y=station.yaw;actor.root.userData.decorative=true;k.root.add(actor.root);animator=new CharacterAnimator(actor,.9);animator.setPose(station.pose);animator.update(.2,0,true);if(region==='river')actor.tools.rod.visible=true;}
 let time=0;let cycle=-1;
 return {root:k.root,actor,frame(dt:number,active:boolean,reduced:boolean,low:boolean,player:THREE.Vector3){
   k.optional.visible=!low;if(actor)actor.root.visible=!low;
   if(!active||reduced||low)return;
   time+=Math.min(dt,.25);const next=Math.floor(time/3)%2;
   if(animator&&station&&next!==cycle){cycle=next;animator.setPose(next===0?station.pose:'none');}
   if(actor&&animator){const near=Math.hypot(actor.root.position.x-player.x,actor.root.position.z-player.z)<2.5;if(!near){animator.update(dt,0,false);if(region==='river')actor.tools.rod.visible=true;}}
   for(let i=0;i<sway.length;i++)sway[i].rotation.z=Math.sin(time*.8+i)*.025;
   k.root.userData.ambientTime=time;
  }};
}
