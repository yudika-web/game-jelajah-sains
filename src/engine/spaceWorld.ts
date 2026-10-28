import * as THREE from 'three';
import {spacePlaces} from '../data/spaceRegion';
import {astroConfig as c,spaceStages,stageInfo,type SpaceStage} from '../data/spaceContent';
import {astronomicalState,moonOffset,moonTargets} from '../game/astronomyModel';
import type {SpaceProgress} from '../game/spaceMission';
import type {PlaceId} from '../data/content';
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;npc(x:number,z:number):void;}
/** Body shading only uses the model's Sun direction. Decorative world lights never set a phase. */
export function astronomicalMaterial(kind:'earth'|'moon'){
 return new THREE.ShaderMaterial({uniforms:{uLight:{value:new THREE.Vector3(-1,0,0)},uKind:{value:kind==='earth'?0:1}},vertexShader:`varying vec3 nWorld; varying vec3 nLocal; void main(){nLocal=normal;nWorld=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform vec3 uLight; uniform float uKind; varying vec3 nWorld; varying vec3 nLocal; void main(){vec3 n=normalize(nWorld);float lit=max(0.0,dot(n,normalize(uLight)));float land=sin(nLocal.x*13.0+nLocal.y*7.0)*cos(nLocal.z*11.0+nLocal.x*4.0);vec3 earth=mix(vec3(.10,.37,.64),vec3(.34,.60,.43),smoothstep(.10,.25,land));earth=mix(earth,vec3(.80,.87,.90),smoothstep(.82,.98,abs(nLocal.y)));float crater=.91+.09*sin(nLocal.x*34.0)*cos(nLocal.z*27.0);vec3 base=mix(earth,vec3(.73,.75,.77)*crater,uKind);gl_FragColor=vec4(base*(.035+.965*lit),1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`});
}
export function buildSpace({root,box:b,label,npc}:Builder){
 b(42,.6,40,'#2f455b',0,-.32,0);b(5,.07,34,'#b6c5d0',0,.02,0);b(34,.06,3,'#d3dce1',0,.03,5);b(31,.06,2.6,'#8ca8bc',0,.03,-1.6);
 for(const x of [-20,20]){b(.25,1.1,38,'#859db0',x,.55,0);b(.35,.08,38,'#80c8d4',x,1.15,0);}for(const z of [-18,19])b(40,1,.2,'#738ba0',0,.5,z);
 b(7,2.8,4,'#c8d4dd',-13,1.4,15);b(7.4,.3,4.4,'#577c9c',-13,2.9,15);b(1.1,2.1,.12,'#4d667d',-13,1.05,17.08);label('POS SIMULASI ANTARIKSA',-13,3.8,15,undefined,true);
 for(const x of [-7,7]){b(.22,3,.22,'#c4d6e2',x,1.5,9);b(.34,.10,.3,'#8dd0dc',x,3.1,9);}b(14.4,.22,.5,'#57748d',0,3.2,9);label('DEK BERJALAN · KONVENSI SIMULASI',0,4.2,10,undefined,true);
 const stars=new Float32Array(256*3);for(let i=0;i<256;i++){const v=1-2*(i+.5)/256,a=i*2.399963229728653,ring=Math.sqrt(1-v*v);stars[i*3]=60*ring*Math.cos(a);stars[i*3+1]=60*v-5;stars[i*3+2]=60*ring*Math.sin(a);}const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(stars,3));const starfield=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#e3efff',size:.16,sizeAttenuation:true,fog:false}));starfield.layers.enable(3);root.add(starfield);
 const bgMaterial=astronomicalMaterial('earth');(bgMaterial.uniforms.uLight.value as THREE.Vector3).set(-1,.2,.6).normalize();const backdrop=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),bgMaterial);backdrop.position.set(-12,-2,-35);backdrop.name='space-backdrop-earth';backdrop.userData.decorative=true;root.add(backdrop);label('BUMI · LATAR SIMULASI',-12,5,-35,undefined,true);
 for(const p of spacePlaces){if(p.id==='spaceNara'){npc(p.x,p.z);continue;}if(p.id!=='spaceReturn'){b(2,.14,1,'#829aac',p.x,.85,p.z-.8);for(const dx of [-.7,.7])b(.13,.8,.13,'#5b758b',p.x+dx,.4,p.z-.8);b(1.3,.45,.12,p.color,p.x,1.12,p.z-.9);if(p.id==='spaceBook'||p.id==='spaceNotes')b(.65,.08,.45,'#e2e0c8',p.x,1.4,p.z-.8);}label(p.short,p.x,2.4,p.z,p.id);const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.73,20),new THREE.MeshBasicMaterial({color:p.color,side:THREE.DoubleSide}));ring.position.set(p.x,.08,p.z);ring.rotation.x=-Math.PI/2;ring.userData.place=p.id;root.add(ring);}
 const earthGeometry=new THREE.SphereGeometry(c.earthRadius,28,20),moonGeometry=new THREE.SphereGeometry(c.moonRadius,28,20),sunGeometry=new THREE.SphereGeometry(c.sunRadius,20,14),sunMaterial=new THREE.MeshBasicMaterial({color:'#ffda83'}),markMaterial=new THREE.MeshBasicMaterial({color:'#ffbc6d'}),lineMaterial=new THREE.LineBasicMaterial({color:'#718da7'});
 const models=spaceStages.map(stage=>{const x=stage==='rotation'?-11:stage==='revolution'?0:11,g=new THREE.Group();g.name=`astronomy-${stage}`;g.userData.place=stageInfo[stage].place;g.position.set(x,2.4,-10);root.add(g);
 const sun=new THREE.Mesh(sunGeometry,sunMaterial),spin=new THREE.Group(),earth=new THREE.Mesh(earthGeometry,astronomicalMaterial('earth')),moon=new THREE.Mesh(moonGeometry,astronomicalMaterial('moon'));spin.add(earth);g.add(sun,spin,moon);earth.name=`${stage}-earth`;moon.name=`${stage}-moon`;sun.name=`${stage}-sun`;if(stage==='phases')moon.layers.enable(3);else moon.visible=false;
 const marker=new THREE.Mesh(new THREE.SphereGeometry(.043,10,8),markMaterial);marker.position.set(-c.earthRadius-.018,0,0);spin.add(marker);marker.visible=stage==='rotation';marker.name='equator-location';
 const axis=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.08,6),new THREE.MeshBasicMaterial({color:'#b9d0e1'}));spin.add(axis);axis.visible=stage!=='phases';
 const points:THREE.Vector3[]=[];for(let n=0;n<=80;n++){const a=n/80*Math.PI*2;if(stage==='revolution')points.push(new THREE.Vector3(Math.cos(a)*c.earthOrbit,0,Math.sin(a)*c.earthOrbit));else if(stage==='phases'){const m=moonOffset(n/80*c.turn);points.push(new THREE.Vector3(m.x,m.y,m.z));}else points.push(new THREE.Vector3(-Math.cos(a)*.57,.03,Math.sin(a)*.57));}const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),lineMaterial);g.add(orbit);
 if(stage==='revolution')for(let q=0;q<4;q++){const a=q*Math.PI/2;const m=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),markMaterial);m.position.set(Math.cos(a)*c.earthOrbit,0,Math.sin(a)*c.earthOrbit);g.add(m);label(`${q*90}°`,x+m.position.x,3.1,-10+m.position.z,stageInfo[stage].place);}
 if(stage==='phases')moonTargets.forEach((a,i)=>{const v=moonOffset(a);label(`Posisi ${i+1}`,x+v.x,2.9+v.y,-10+v.z,stageInfo[stage].place);});
 const direction=new THREE.Vector3(1,0,0),lightArrow=new THREE.ArrowHelper(direction,new THREE.Vector3(),.8,'#f3d38a',.2,.12);g.add(lightArrow);const worldEarth=new THREE.Vector3(),worldMoon=new THREE.Vector3(),observer=new THREE.Vector3(),target=new THREE.Vector3();
 label(stage==='rotation'?'ROTASI · sekitar 24 jam':stage==='revolution'?'REVOLUSI · sekitar 365 hari':'FASE · cahaya dipantulkan',x,4.1,-10,stageInfo[stage].place);return{stage,g,sun,spin,earth,moon,marker,orbit,axis,lightArrow,direction,worldEarth,worldMoon,observer,target};});
 const cameraPoint=new THREE.Vector3(),earthObserver=new THREE.Vector3(),moonTarget=new THREE.Vector3();
 return{models,cameraPoint,earthObserver,moonTarget,frame(p:SpaceProgress,angle:number,focus:SpaceStage|null){for(const m of models){const active=p.trial?.stage===m.stage,a=active?angle:0;const state=astronomicalState(m.stage==='rotation'?a:0,m.stage==='revolution'?a:0,m.stage==='phases'?a:0),offsetX=m.stage==='revolution'?0:-state.earth.x,offsetZ=m.stage==='revolution'?0:-state.earth.z;
 m.sun.position.set(offsetX,0,offsetZ);m.spin.position.set(state.earth.x+offsetX,0,state.earth.z+offsetZ);m.spin.rotation.y=m.stage==='rotation'?a/1000*Math.PI/180:0;m.moon.position.set(state.moon.x+offsetX,state.moon.y,state.moon.z+offsetZ);
 (m.earth.material as THREE.ShaderMaterial).uniforms.uLight.value.set(state.earthLight.x,state.earthLight.y,state.earthLight.z);(m.moon.material as THREE.ShaderMaterial).uniforms.uLight.value.set(state.moonLight.x,state.moonLight.y,state.moonLight.z);
 m.direction.set(state.earth.x,state.earth.y,state.earth.z).normalize();m.lightArrow.position.copy(m.sun.position).addScaledVector(m.direction,c.sunRadius+.1);m.lightArrow.setDirection(m.direction);
 if(focus===m.stage){cameraPoint.copy(m.g.position);cameraPoint.x+=m.stage==='revolution'?0:-1.55;cameraPoint.y-=.6;
 if(m.stage==='phases'){m.g.updateMatrixWorld(true);m.spin.getWorldPosition(m.worldEarth);m.moon.getWorldPosition(m.worldMoon);m.direction.copy(m.worldMoon).sub(m.worldEarth).normalize();earthObserver.copy(m.worldEarth).addScaledVector(m.direction,c.earthRadius+.012);moonTarget.copy(m.worldMoon);}}
 root.userData.spaceMoonLit=Math.round(state.illuminated*1000);}
 root.userData.spaceModels=3;
 }};
}
