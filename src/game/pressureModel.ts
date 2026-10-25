import {pressureConfig} from '../data/pressureContent';
/** One world unit = one metre. Sensor position, not camera or seabed, determines depth. */
export function sensorDepth(rootY:number,surfaceY:number=pressureConfig.surfaceY,offsetY:number=pressureConfig.sensorOffsetY){if(![rootY,surfaceY,offsetY].every(Number.isFinite))throw Error('Posisi sensor tidak valid.');return surfaceY-(rootY+offsetY);}
export function rootYAtDepth(h:number){if(!Number.isFinite(h)||h<0)throw Error('Kedalaman tidak valid.');return pressureConfig.surfaceY-h-pressureConfig.sensorOffsetY;}
export function waterPressurePa(h:number){if(!Number.isFinite(h)||h<0)throw Error('Kedalaman tidak valid.');return pressureConfig.densityKgM3*pressureConfig.gravityMS2*h;}
export const paToKpa=(pa:number)=>{if(!Number.isFinite(pa)||pa<0)throw Error('Tekanan tidak valid.');return pa/1000;};
export const pressureText=(pa:number)=>paToKpa(pa).toLocaleString('id-ID',{maximumFractionDigits:2})+' kPa';
