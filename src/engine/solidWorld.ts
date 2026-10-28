import {addGround,groundSlabs} from './groundLayout';
import * as THREE from 'three';
import {solidModules,supportSizes,solidConfig} from '../data/solidContent';
import {solidPlaces} from '../data/solidRegion';
import {solidResult,kpaText} from '../game/solidModel';
import type {SolidProgress} from '../game/solidMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;}
export function buildSolid({root,box:b,label}:Builder){
 addGround(b,groundSlabs.solid);b(4,.07,21,'#c5b38d',0,.02,27);b(25,.06,3,'#bcaa80',-1,.03,30);b(17,.06,2,'#bcaa80',-3,.03,34);
 label('MAKET PIJAKAN · BUKAN JALAN KARAKTER',-3,4.3,36,undefined,true);
 const lab=new THREE.Group();lab.position.set(-5,0,26.2);lab.name='solid-pressure-apparatus';root.add(lab);
 const material=(c:string)=>new THREE.MeshLambertMaterial({color:c});const wood=material('#aa895d'),metal=material('#8caaa4'),soil=material('#9c815a'),supportMat=material('#518d87');
 const box=(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=lab)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;};
 box(5.8,.14,4,wood,0,.65,0);for(const x of [-2.6,2.6])for(const z of [-1.7,1.7])box(.13,.6,.13,metal,x,.3,z);
 box(1.6,.1,1.7,soil,-1.4,.78,0);box(1.5,.1,3.7,soil,1.3,.78,0);
 const gap=solidConfig.pathWidthCm/100*solidConfig.modelScale;
 for(const x of [1.3-gap/2-.075,1.3+gap/2+.075])box(.15,.3,.15,metal,x,.98,0);
 box(gap,.012,.03,metal,1.3,.84,0); // Open measuring jaws keep the stopped support visible from above.

 // Exactly one visual mesh per stable support ID; selected support moves from rack to test table.
 const supports=solidModules.map((m,i)=>{const size=supportSizes[m],mesh=box(size.widthCm/100*solidConfig.modelScale,.09,size.lengthCm/100*solidConfig.modelScale,supportMat,0,0,0,root);mesh.name=`solid-support-${m}`;mesh.userData.stableId=mesh.name;return{module:m,mesh,rack:new THREE.Vector3(5+(i*.95),1.03,24.2)};});
 const load=new THREE.Group();load.name=solidConfig.loadId;load.userData.stableId=solidConfig.loadId;lab.add(load);box(.4,.48,.4,metal,0,.24,0,load);box(.52,.10,.52,wood,0,.52,0,load);box(.14,.15,.14,metal,0,.65,0,load);
 // One arrow of constant size: total force is independent of support area.
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(-1.4,2.1,0),.48,'#344e45',.12,.12);lab.add(arrow);
 const highlight=box(1,.008,1,new THREE.MeshBasicMaterial({color:'#80b9a1',transparent:true,opacity:.45}),-1.4,.836,0);
 for(const [x,z]of [[-2.3,0],[1.3,-1.65]]){box(.04,.025,1.4,metal,x,.9,z);for(let i=0;i<=10;i++)box(.12,.015,.015,wood,x,.92,z-.6+i*.12);}
 for(const p of solidPlaces){if(p.id!=='solidBench'){b(p.id==='solidRack'?3.8:1.6,.12,p.id==='solidRack'?1.8:.8,'#a58860',p.x,.84,p.z-.8);for(const dx of [-.6,.6])b(.12,.8,.12,'#76694c',p.x+dx,.4,p.z-.8);if(p.id==='solidBook'||p.id==='solidNotes')b(.65,.09,.45,p.color,p.x,.98,p.z-.8);if(p.id==='solidForce'){b(.7,.6,.4,'#6c9690',p.x,1.2,p.z-.8);label('ALAT 400 N',p.x,1.9,p.z-.8,p.id);}}
 label(p.short,p.x,2.8,p.z,p.id);const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),material(p.color));ring.position.set(p.x,.1,p.z);ring.rotation.x=-Math.PI/2;ring.userData.place=p.id;root.add(ring);}
 let ctx:CanvasRenderingContext2D|null=null,texture:THREE.CanvasTexture|undefined,last='';if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=768;c.height=144;ctx=c.getContext('2d');texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;}
 const display=new THREE.Sprite(new THREE.SpriteMaterial({map:texture??null,color:'#fff'}));display.position.set(-5,2.5,25.4);display.scale.set(3.5,.66,1);root.add(display);
 return{lab,load,supports,highlight,arrow,gap,frame(p:SolidProgress,fraction:number){const t=p.trial,r=t?.result,f=t?.phase==='running'?fraction:t?1:0,m=p.installed??'A',size=supportSizes[m];
 // C stops before its front edge intersects the gate. No contact force is applied to blocked C.
 const slide=r?.challenge?(r.fits?-1.25+2.4*Math.min(1,f/.6):-1.25+.55*Math.min(1,f/.6)):0;
 const x=r?.challenge?1.3:-1.4,z=r?.challenge?slide:0,press=!!r&&r.appliedN>0;
 supports.forEach(s=>{if(s.module===p.installed)s.mesh.position.set(-5+x,.885,26.2+z);else s.mesh.position.copy(s.rack);});
 const descent=press?Math.max(0,Math.min(1,(f-(r?.challenge?.6:0))/(r?.challenge?.4:1))):0;
 load.position.set(x,1.8-.87*descent,z);arrow.position.set(x,2.85-.87*descent,z);arrow.visible=!!r&&press&&f>=1;
 highlight.position.set(x,.937,z);highlight.scale.set(size.widthCm/100*solidConfig.modelScale,1,size.lengthCm/100*solidConfig.modelScale);highlight.visible=!!p.installed&&!!r&&press&&f>=1;(highlight.material as THREE.MeshBasicMaterial).color.set(r&&r.pressurePa>solidConfig.pressureLimitPa?'#c67b55':'#80b9a1');
 const contact=press&&f>=1,text=`${p.installed??'—'} · ${contact?'400 N':'Beban terangkat'} · ${contact?kpaText(r!.pressurePa):r?.reason==='width'?'Tertahan gerbang':'Belum ada kontak'}`;
 if(ctx&&last!==text){last=text;ctx.fillStyle='#fff7e3';ctx.fillRect(0,0,768,144);ctx.fillStyle='#315b48';ctx.textAlign='center';ctx.font='bold 29px sans-serif';ctx.fillText(text,384,50);ctx.font='25px sans-serif';ctx.fillText('Maket ×3 · jalur 30 cm · panjang sejajar jalur',384,104);texture!.needsUpdate=true;}
 root.userData.solidLoadCount=1;root.userData.solidPressure=contact?r!.pressurePa:null;root.userData.solidLoadY=load.position.y;root.userData.solidSlide=slide;root.userData.solidApplied=contact?400:0;
 }};
}
