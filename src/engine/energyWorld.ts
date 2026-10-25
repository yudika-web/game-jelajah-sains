import * as THREE from 'three';
import {energyPlaces} from '../data/energyRegion';
import {sourcePower,simulateInterval} from '../game/energyModel';
import {currentEnergyAttempt,intervalPreview,type EnergyProgress} from '../game/energyMission';
import {scenarios,wh,type SourceCondition} from '../data/energyContent';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;}
export interface EnergyView{update(p:EnergyProgress):void;frame(dt:number,fraction:number,reduced:boolean):void;}
export function buildEnergy({root,box:b,label}:Builder):EnergyView{
 const mesh=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);parent.add(m);return m;};
 b(54,.9,15,'#92a494',8,-.51,-26.5);b(4,.08,17,'#dfd1b3',0,.04,-21);b(47,.08,4,'#dfd1b3',8,.04,-22);b(38,.08,2,'#dfd1b3',7,.04,-17);
 label('HALAMAN ENERGI · MODEL DC',8,4.8,-31,undefined,true);
 for(const p of energyPlaces){label(p.short,p.x,p.id==='windTurbine'?6.3:p.id==='solarArray'?3.6:p.id==='energyBattery'||p.id==='energyService'?4:3,p.z,p.id);const g=new THREE.RingGeometry(.62,.73,20),r=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:p.color}));r.position.set(p.x,.12,p.z);r.rotation.x=-Math.PI/2;r.userData.place=p.id;root.add(r);}
 // Panel remains still: incident light, not its movement, changes output.
 b(2.6,.18,1.6,'#677e83',-12,1,-26.7);for(const x of [-13,-11])b(.15,1.1,.15,'#7d8982',x,.55,-26.7);
 const solar=new THREE.Group();solar.position.set(-12,1.35,-26.7);solar.name='energy-solar-panel';solar.rotation.x=-.35;root.add(solar);const cells=mesh(2.7,.12,1.7,'#486e91',0,0,0,solar);for(let i=-1;i<=1;i++)mesh(.025,.02,1.6,'#bbc9c6',i*.8,.08,0,solar);mesh(2.6,.02,.025,'#bbc9c6',0,.08,0,solar);
 b(.22,4.4,.22,'#8ca29a',-4,2.2,-26.7);b(1.8,.15,1.2,'#7b9281',-4,.1,-26.7);const rotor=new THREE.Group();rotor.position.set(-4,4.4,-26.35);rotor.name='energy-wind-rotor';root.add(rotor);for(let i=0;i<3;i++){const arm=new THREE.Group();arm.rotation.z=i*Math.PI*2/3;rotor.add(arm);mesh(.22,1.35,.10,'#e3dfc7',0,.75,0,arm);}mesh(.36,.36,.3,'#b59b60',0,0,.1,rotor);
 mesh(1.7,1.4,1,'#5f817c',4,.7,-26.7);const fill=mesh(1.35,1,.08,'#c3aa56',4,.6,-26.14);fill.name='energy-battery-fill';b(.3,.15,.3,'#c2bc9f',3.5,1.48,-26.7);b(.3,.15,.3,'#c2bc9f',4.5,1.48,-26.7);
 for(const x of [12,21]){b(2.5,.14,1.2,'#ab8e61',x,.84,-26.7);for(const dx of [-.9,.9])b(.12,.8,.12,'#7c6e53',x+dx,.4,-26.7);}
 b(2.3,.8,.25,'#607c77',12,1.3,-27);for(const [i,c]of ['#578caa','#7c9c92','#b79b53','#c7c2a7'].entries())b(.3,.25,.15,c,11.2+i*.53,1.3,-26.8);
 b(1,.6,.3,'#738d8a',21,1.15,-26.7);
 b(3,1.5,1.2,'#b8c8b0',29,.75,-26.7);const lamp=mesh(.6,.55,.5,'#8a8e7b',28.35,1.85,-26.7);lamp.name='energy-service-lamp';const instrument=mesh(.85,.55,.4,'#597b81',29.6,1.8,-26.7);
 for(const x of [-4,12]){b(1.5,.12,.65,'#ad9166',x,.84,-18.7);b(.7,.1,.4,'#647f82',x,.96,-18.7);}
 const wires=[[-12,12],[ -4,12],[4,12],[12,29]].map(([x1,x2],i)=>mesh(x2-x1,.05,.07,'#6f8b7e',(x1+x2)/2,.14,-28.2-i*.16));
 function display(x:number,z:number){let ctx:CanvasRenderingContext2D|null=null,texture:THREE.CanvasTexture|undefined;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=128;ctx=c.getContext('2d');texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;}const m=new THREE.SpriteMaterial({map:texture,color:texture?'#fff':'#e8e1ce'}),sprite=new THREE.Sprite(m);sprite.position.set(x,2.35,z);sprite.scale.set(3.1,.78,1);root.add(sprite);return(text:string)=>{sprite.userData.text=text;if(ctx){ctx.fillStyle='#fff9e9';ctx.fillRect(0,0,512,128);ctx.fillStyle='#244b42';ctx.textAlign='center';ctx.font='600 25px sans-serif';const lines=text.split('\n');lines.forEach((line,i)=>ctx!.fillText(line,256,45+i*40));texture!.needsUpdate=true;}};}
 const solarText=display(-12,-26.7),windText=display(-2.1,-26.4),batteryText=display(4,-26.7),serviceText=display(29,-26.7);
 let windW=0,from=2000,to=2000,animate=false,preview=false;
 return{update(p){const a=currentEnergyAttempt(p),trial=p.trial,last=a?.records.at(-1);let light:SourceCondition='bright',wind:SourceCondition='calm';if(trial?.kind==='source'){if(trial.source==='solar')light=trial.condition;else wind=trial.condition;}else if(trial?.kind==='interval'||last){const index=trial?.kind==='interval'?trial.index:last!.interval-1;light=scenarios[index].solar;wind=scenarios[index].wind;}else if(p.records.length){const r=p.records.at(-1)!;if(r.source==='solar')light=r.condition;else wind=r.condition;}
  const solarW=sourcePower('solar',light);windW=sourcePower('wind',wind);cells.material.color.set(light==='bright'?'#568db0':light==='cloudy'?'#657e91':'#354750');solarText(`${solarW} W tersedia · panel\n${light==='bright'?'Terang':light==='cloudy'?'Mendung':'Malam model'}`);windText(`${windW} W tersedia · turbin\n${windW===5?'Angin cukup':windW===1?'Angin lemah':'Angin tenang'}`);
  const r=intervalPreview(p);from=p.batteryMWh;to=r?.finalMWh??from;animate=trial?.kind==='interval'&&trial.phase==='running';preview=!!r;batteryText(`Kapasitas 8 Wh\n${r?`${wh(from)} → ${wh(to)} · pratinjau`:`Isi ${wh(from)}`}`);
  const service=p.supplyOn?(r??last):null,good=!!service&&service.unmetMWh===0;lamp.material.color.set(good?'#ffe7a0':service?'#aa6852':'#8a8e7b');lamp.material.emissive.set(good?'#aa8c35':'#000000');instrument.material.color.set(good?'#8dbba1':'#597b81');serviceText(`Kebutuhan 4 W\n${service?`${p.trial?.kind==='interval'?'Pratinjau: ':''}${good?'terpenuhi':`kurang ${wh(service.unmetMWh)}`}`:p.supplyOn?'Menunggu interval':'Suplai belum aktif'}`);
  wires.forEach((w,i)=>w.material.color.set(p.connections.includes(['solar','wind','battery','load'][i] as never)?'#d3ad53':'#73877c'));root.userData.energyBatteryMWh=p.batteryMWh;root.userData.energyPreviewMWh=r?.finalMWh??null;root.userData.energyServiceOn=good;root.userData.energySolarW=solarW;root.userData.energyWindW=windW;
 },frame(dt,fraction,reduced){rotor.rotation.z-=dt*windW*(reduced?.12:.6);root.userData.energyRotorAngle=rotor.rotation.z;const amount=animate?from+(to-from)*fraction:preview?to:from;fill.scale.y=Math.max(.001,amount/8000);fill.position.y=.12+.5*fill.scale.y;}};
}
