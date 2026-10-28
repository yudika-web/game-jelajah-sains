import * as THREE from 'three';
/** Stage 01 baseline: keep the approved exposure, lighting and clip range.
 * Quality changes resolution only; it cannot repair overlapping geometry.
 */
export const environmentStyle={
  camera:{fov:48,near:.1,far:110},
  sky:'#d9e9e3',fog:{near:48,far:100},exposure:1.05,
  hemisphere:{sky:'#fff9e8',ground:'#6b9274',intensity:1.6},
  sun:{color:'#fff0cf',intensity:2.2,position:[-15,25,10] as const},
  quality:{normal:{maxPixelRatio:1.5},low:{maxPixelRatio:1}},
} as const;
export function qualityPixelRatio(low:boolean,deviceRatio:number){
  const ratio=Number.isFinite(deviceRatio)&&deviceRatio>0?deviceRatio:1;
  return Math.min(ratio,(low?environmentStyle.quality.low:environmentStyle.quality.normal).maxPixelRatio);
}
/** Opaque environment surfaces write/test depth; instruments own their special materials. */
export function environmentMaterial(color:THREE.ColorRepresentation){
  return new THREE.MeshLambertMaterial({color,transparent:false,depthTest:true,depthWrite:true});
}
export function configureEnvironment(renderer:THREE.WebGLRenderer,scene:THREE.Scene,deviceRatio:number){
  renderer.setPixelRatio(qualityPixelRatio(false,deviceRatio));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=environmentStyle.exposure;
  scene.background=new THREE.Color(environmentStyle.sky);
  scene.fog=new THREE.Fog(environmentStyle.sky,environmentStyle.fog.near,environmentStyle.fog.far);
  scene.add(new THREE.HemisphereLight(environmentStyle.hemisphere.sky,environmentStyle.hemisphere.ground,environmentStyle.hemisphere.intensity));
  const sun=new THREE.DirectionalLight(environmentStyle.sun.color,environmentStyle.sun.intensity);
  sun.position.set(...environmentStyle.sun.position);scene.add(sun);
}
