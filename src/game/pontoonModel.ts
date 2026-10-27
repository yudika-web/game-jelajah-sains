import {pontoonConfig as c,pontoonSizes,type PontoonModule,type Immersion} from '../data/pontoonContent';
export const litresToM3=(litres:number)=>litres/1000;
export const weightN=(massKg:number)=>massKg*c.gravity;
export const buoyantForceN=(volumeL:number)=>c.densityKgM3*c.gravity*litresToM3(volumeL);
export function springResult(condition:Immersion){const submergedL=condition==='air'?0:condition==='half'?c.objectVolumeL/2:c.objectVolumeL;const weight=weightN(c.objectMassKg),buoyancy=buoyantForceN(submergedL);return{condition,submergedL,weightN:weight,buoyancyN:buoyancy,readingN:weight-buoyancy};}
export type SpringResult=ReturnType<typeof springResult>;
export function pontoonResult(module:PontoonModule){const s=pontoonSizes[module],massKg=c.emptyMassKg+c.cargoMassKg,requiredL=massKg/c.densityKgM3*1000,fraction=requiredL/s.volumeL;return{module,emptyMassKg:c.emptyMassKg,cargoMassKg:c.cargoMassKg,massKg,weightN:weightN(massKg),volumeL:s.volumeL,widthM:s.widthM,requiredL,fraction,actualN:weightN(massKg),maximumN:buoyantForceN(s.volumeL),reserveL:s.volumeL-requiredL,reserveOK:fraction<=c.maxFraction,widthOK:s.widthM<=c.gateWidthM};}
export type PontoonResult=ReturnType<typeof pontoonResult>;
export const pontoonReason=(m:PontoonModule)=>{const r=pontoonResult(m);return !r.reserveOK?'Kondisi batas: terapung tanpa cadangan apung; 100% melebihi aturan 75%. Bukan berarti pasti tenggelam.':!r.widthOK?'Cadangan memenuhi, tetapi lebar 1,4 m tidak muat gerbang 1,2 m.':'Memenuhi keterendaman maksimal 75% dan lebar gerbang 1,2 m.';};
export const numberText=(n:number)=>n.toLocaleString('id-ID',{maximumFractionDigits:2});

/** Live geometry and instrument share the same water surface and actual submerged cube volume. */
export function springStateAt(condition:Immersion,fraction:number){
 const sideM=Math.cbrt(litresToM3(c.objectVolumeL)),required=springResult(condition),target=condition==='air'?c.springStartY:c.springWaterY+sideM/2-sideM*(required.submergedL/c.objectVolumeL),f=Math.max(0,Math.min(1,fraction)),centerY=c.springStartY+(target-c.springStartY)*f;
 const submergedFraction=Math.max(0,Math.min(1,(c.springWaterY-(centerY-sideM/2))/sideM)),submergedL=Math.round(c.objectVolumeL*submergedFraction*1e12)/1e12,buoyancyN=buoyantForceN(submergedL);
 return{centerY,sideM,submergedL,buoyancyN,readingN:weightN(c.objectMassKg)-buoyancyN};
}
