import * as THREE from 'three';
/** Local equirectangular Natural Earth coastline + authored clouds/craters. No runtime web assets. */
export function spaceTexture(file:string,fallback:[number,number,number]){
 if(typeof document==='undefined'){const t=new THREE.DataTexture(new Uint8Array([...fallback,255]),1,1);t.needsUpdate=true;return t;}
 const t=new THREE.TextureLoader().load(`/assets/space/${file}.png`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;t.wrapS=THREE.RepeatWrapping;return t;
}
const vertex=`varying vec3 nWorld;varying vec3 wPosition;varying vec2 vUv;void main(){vUv=uv;nWorld=normalize(mat3(modelMatrix)*normal);wPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wPosition,1.);}`;
export function astronomicalMaterial(kind:'earth'|'moon',surface?:THREE.Texture,clouds?:THREE.Texture){
 return new THREE.ShaderMaterial({uniforms:{uLight:{value:new THREE.Vector3(-1,0,0)},uKind:{value:kind==='earth'?0:1},uNightLevel:{value:kind==='earth'?.008:0},uSurface:{value:surface??spaceTexture(kind,[100,130,160])},uClouds:{value:clouds??surface??spaceTexture('clouds',[0,0,0])},uCloudAmount:{value:kind==='earth'?1:0}},vertexShader:vertex,fragmentShader:`uniform vec3 uLight;uniform float uKind;uniform float uNightLevel;uniform sampler2D uSurface;uniform sampler2D uClouds;uniform float uCloudAmount;varying vec3 nWorld;varying vec3 wPosition;varying vec2 vUv;void main(){vec3 n=normalize(nWorld);float facing=dot(n,normalize(uLight));float lit=max(0.,facing);vec3 base=texture2D(uSurface,vUv).rgb;float cloud=texture2D(uClouds,vUv).a*uCloudAmount;base=mix(base,vec3(.92,.96,1.),cloud*.78);vec3 color=base*(uNightLevel+(1.-uNightLevel)*lit);float rim=pow(1.-max(0.,dot(n,normalize(cameraPosition-wPosition))),4.);if(uKind<.5)color+=vec3(.025,.14,.27)*rim*smoothstep(-.06,.25,facing);gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`});
}
export function solarMaterial(){return new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:`varying vec2 vUv;varying vec3 nWorld;varying vec3 wPosition;void main(){float detail=sin(vUv.x*97.+sin(vUv.y*51.)*2.)*sin(vUv.y*83.)*.05+sin(vUv.x*23.-vUv.y*35.)*.08;float limb=.82+.18*max(0.,dot(normalize(nWorld),normalize(cameraPosition-wPosition)));vec3 color=mix(vec3(.75,.14,.015),vec3(1.,.58,.12),.50+detail)*limb;gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`});}
/** One thin backside shell; no stacked cloud shell. All planet light remains independent of station lights. */
export function atmosphereMaterial(){return new THREE.ShaderMaterial({uniforms:{uLight:{value:new THREE.Vector3(-1,0,0)}},side:THREE.BackSide,transparent:true,depthWrite:false,vertexShader:vertex,fragmentShader:`uniform vec3 uLight;varying vec3 nWorld;varying vec3 wPosition;void main(){vec3 n=normalize(nWorld);float rim=pow(1.-abs(dot(n,normalize(cameraPosition-wPosition))),3.);float day=smoothstep(-.08,.35,dot(n,normalize(uLight)));gl_FragColor=vec4(.18,.54,.95,rim*day*.24);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`});}
export function haloMaterial(){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=pow(max(0.,1.-r),2.)*.30;gl_FragColor=vec4(1.,.48,.08,a);}`});}
