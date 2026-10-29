import * as THREE from 'three';
import {spacePlaces} from '../data/spaceRegion';
import {astroConfig as c,spaceStages,stageInfo,type SpaceStage} from '../data/spaceContent';
import {astronomicalState,moonOffset,moonTargets} from '../game/astronomyModel';
import type {SpaceProgress} from '../game/spaceMission';
import type {PlaceId} from '../data/content';
import {buildSpaceStation} from './spaceStation';
import {spaceTexture,astronomicalMaterial,solarMaterial,atmosphereMaterial,haloMaterial} from './spaceSurfaces';
export {astronomicalMaterial} from './spaceSurfaces';
export interface SpaceGuides{labels:boolean;orbits:boolean;light:boolean;}
interface Builder{root:THREE.Group;box(w:number,h:number,d:number,c:string,x:number,y:number,z:number):void;label(text:string,x:number,y:number,z:number,id?:PlaceId,building?:boolean):void;npc(x:number,z:number):void;}
export function buildSpace({root,label,npc}:Builder){
 const station=buildSpaceStation(root),sky=new THREE.Group();sky.name='space-sky';root.add(sky);
 for(const p of spacePlaces){if(p.id==='spaceNara')npc(p.x,p.z);else label(p.short,p.x,2.5,p.z,p.id);}
 const stars=new Float32Array(256*3);for(let i=0;i<256;i++){const v=1-2*(i+.5)/256,a=i*2.399963229728653,ring=Math.sqrt(1-v*v);stars.set([60*ring*Math.cos(a),60*v-5,60*ring*Math.sin(a)],i*3);}
 const starfield=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(stars,3)),new THREE.PointsMaterial({color:'#c3d4eb',size:.09,sizeAttenuation:true,fog:false}));starfield.name='stable-starfield';starfield.layers.enable(3);sky.add(starfield);
 const earthMap=spaceTexture('earth',[24,80,142]),moonMap=spaceTexture('moon',[168,170,169]),cloudMap=spaceTexture('clouds',[0,0,0]);
 const levels={normal:{earth:new THREE.SphereGeometry(c.earthRadius,64,40),moon:new THREE.SphereGeometry(c.moonRadius,48,32),sun:new THREE.SphereGeometry(c.sunRadius,64,40)},low:{earth:new THREE.SphereGeometry(c.earthRadius,32,20),moon:new THREE.SphereGeometry(c.moonRadius,32,20),sun:new THREE.SphereGeometry(c.sunRadius,32,20)}};
 root.userData.ownedGeometries=Object.values(levels).flatMap(l=>Object.values(l));root.userData.ownedTextures=[earthMap,moonMap,cloudMap];
 const backdrop=new THREE.Mesh(new THREE.SphereGeometry(5,48,32),astronomicalMaterial('earth',earthMap,cloudMap));backdrop.position.set(-12,-2,-35);backdrop.name='space-backdrop-earth';backdrop.userData.decorative=true;sky.add(backdrop);(backdrop.material.uniforms.uLight.value as THREE.Vector3).set(-1,.2,.6).normalize();
 const sunMaterial=solarMaterial(),markMaterial=new THREE.MeshBasicMaterial({color:'#ffcb67'}),lineMaterial=new THREE.LineBasicMaterial({color:'#638cae'});
 function bodyLabel(text:string){const g=new THREE.Group();if(typeof document==='undefined')return g;const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#0d2033d9';ctx.fillRect(0,0,256,64);ctx.fillStyle='#e3eff4';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(text,128,43);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,depthWrite:false}));sprite.scale.set(.74,.185,1);g.add(sprite);return g;}
 const models=spaceStages.map(stage=>{const x=stage==='rotation'?-11:stage==='revolution'?0:11,g=new THREE.Group();g.name=`astronomy-${stage}`;g.userData.place=stageInfo[stage].place;g.position.set(x,2.7,-10);root.add(g);
  const sun=new THREE.Mesh(levels.normal.sun,sunMaterial),spin=new THREE.Group(),earth=new THREE.Mesh(levels.normal.earth,astronomicalMaterial('earth',earthMap,cloudMap)),moon=new THREE.Mesh(levels.normal.moon,astronomicalMaterial('moon',moonMap,moonMap));spin.add(earth);g.add(sun,spin,moon);earth.name=`${stage}-earth`;moon.name=`${stage}-moon`;sun.name=`${stage}-sun`;if(stage==='phases')moon.layers.enable(3);else moon.visible=false;
  const atmosphere=new THREE.Mesh(levels.normal.earth,atmosphereMaterial());atmosphere.scale.setScalar(1.035);spin.add(atmosphere);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),haloMaterial());halo.scale.setScalar(c.sunRadius*3.6);halo.onBeforeRender=(_r,_s,camera)=>{halo.quaternion.copy(camera.quaternion);halo.updateWorldMatrix(false,false);};sun.add(halo);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.043,12,8),markMaterial);marker.position.set(-c.earthRadius-.018,0,0);spin.add(marker);marker.visible=stage==='rotation';marker.name='equator-location';
  const axis=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.02,8),new THREE.MeshBasicMaterial({color:'#9abed5'}));spin.add(axis);axis.visible=stage!=='phases';
  const points:THREE.Vector3[]=[];for(let n=0;n<128;n++){const a=n/128*Math.PI*2;if(stage==='revolution')points.push(new THREE.Vector3(Math.cos(a)*c.earthOrbit,0,Math.sin(a)*c.earthOrbit));else if(stage==='phases'){const m=moonOffset(n/128*c.turn);points.push(new THREE.Vector3(m.x,m.y,m.z));}else points.push(new THREE.Vector3(-Math.cos(a)*.57,.03,Math.sin(a)*.57));}const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),lineMaterial);g.add(orbit);
  const tickGroup=new THREE.Group();g.add(tickGroup);if(stage==='revolution')for(let q=0;q<4;q++){const a=q*Math.PI/2,m=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),markMaterial);m.position.set(Math.cos(a)*c.earthOrbit,0,Math.sin(a)*c.earthOrbit);tickGroup.add(m);}
  const sunLabel=bodyLabel('Matahari'),earthLabel=bodyLabel('Bumi'),moonLabel=bodyLabel('Bulan');g.add(sunLabel,earthLabel,moonLabel);
  const direction=new THREE.Vector3(1,0,0),lightArrow=new THREE.ArrowHelper(direction,new THREE.Vector3(),.8,'#f3d38a',.15,.08);g.add(lightArrow);
  const worldEarth=new THREE.Vector3(),worldMoon=new THREE.Vector3(),observer=new THREE.Vector3(),target=new THREE.Vector3();return{stage,g,sun,spin,earth,moon,atmosphere,halo,marker,orbit,axis,lightArrow,tickGroup,sunLabel,earthLabel,moonLabel,direction,worldEarth,worldMoon,observer,target};
 });
 const cameraPoint=new THREE.Vector3(),earthObserver=new THREE.Vector3(),moonTarget=new THREE.Vector3(),detailPosition=new THREE.Vector3(),detailTarget=new THREE.Vector3(),detailOffset=new THREE.Vector3();let low=false;
 function quality(value:boolean){low=value;const level=value?levels.low:levels.normal;for(const m of models){m.earth.geometry=level.earth;m.moon.geometry=level.moon;m.sun.geometry=level.sun;m.atmosphere.geometry=level.earth;m.atmosphere.visible=!value;m.halo.visible=!value;m.earth.material.uniforms.uCloudAmount.value=value?.5:1;}root.userData.spaceQuality=value?'low':'normal';}
 quality(false);
 return{sky,models,cameraPoint,earthObserver,moonTarget,detailPosition,detailTarget,quality,frame(p:SpaceProgress,angle:number,focus:SpaceStage|null,detail=false,guides:SpaceGuides={labels:true,orbits:true,light:true}){
  station.visible=!focus;backdrop.visible=!focus;
  for(const m of models){m.g.visible=!focus||m.stage===focus;const active=p.trial?.stage===m.stage,a=active?angle:0,state=astronomicalState(m.stage==='rotation'?a:0,m.stage==='revolution'?a:0,m.stage==='phases'?a:0),offsetX=m.stage==='revolution'?0:-state.earth.x,offsetZ=m.stage==='revolution'?0:-state.earth.z;
   m.sun.position.set(offsetX,0,offsetZ);m.spin.position.set(state.earth.x+offsetX,0,state.earth.z+offsetZ);m.spin.rotation.y=m.stage==='rotation'?a/1000*Math.PI/180:0;m.moon.position.set(state.moon.x+offsetX,state.moon.y,state.moon.z+offsetZ);
   for(const material of [m.earth.material,m.atmosphere.material])material.uniforms.uLight.value.set(state.earthLight.x,state.earthLight.y,state.earthLight.z);m.moon.material.uniforms.uLight.value.set(state.moonLight.x,state.moonLight.y,state.moonLight.z);
   m.direction.set(state.earth.x,state.earth.y,state.earth.z).normalize();m.lightArrow.position.copy(m.sun.position).addScaledVector(m.direction,c.sunRadius+.12);m.lightArrow.setDirection(m.direction);m.lightArrow.visible=guides.light&&!detail;m.orbit.visible=guides.orbits&&!detail;m.tickGroup.visible=guides.orbits&&!detail;m.axis.visible=guides.orbits&&m.stage!=='phases';
   m.sunLabel.position.copy(m.sun.position).y+=1.04;m.earthLabel.position.copy(m.spin.position).y+=.65;m.moonLabel.position.copy(m.moon.position).y+=.40;m.sunLabel.visible=guides.labels&&!detail;m.earthLabel.visible=guides.labels&&!detail;m.moonLabel.visible=guides.labels&&m.stage==='phases'&&!detail;
   if(focus===m.stage){cameraPoint.copy(m.g.position);cameraPoint.x+=m.stage==='revolution'?0:-1.72;cameraPoint.y-=1.02;m.g.updateMatrixWorld(true);m.spin.getWorldPosition(m.worldEarth);m.moon.getWorldPosition(m.worldMoon);detailTarget.copy(m.worldEarth);detailPosition.copy(m.worldEarth).add(detailOffset.set(m.stage==='rotation'?state.markerNormal.x*1.6:-1.4,.65,m.stage==='rotation'?state.markerNormal.z*1.6+1.1:1.35));
    if(m.stage==='phases'){m.direction.copy(m.worldMoon).sub(m.worldEarth).normalize();earthObserver.copy(m.worldEarth).addScaledVector(m.direction,c.earthRadius+.012);moonTarget.copy(m.worldMoon);detailTarget.copy(m.worldMoon);detailPosition.copy(m.worldMoon).add(detailOffset.set(-.55,.25,.6));}
   }
   root.userData.spaceMoonLit=Math.round(state.illuminated*1000);
  }
  root.userData.spaceModels=3;root.userData.spaceGuides=guides;root.userData.spaceQuality=low?'low':'normal';
 }};
}
