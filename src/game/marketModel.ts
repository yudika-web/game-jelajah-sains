import {marketConfig as c,densitySamples,containerModels,type MarketModule} from '../data/marketContent';
export const cm3ToM3=(cm3:number)=>cm3/1_000_000;
export const gToKg=(g:number)=>g/1000;
export function densityResult(module:MarketModule){const s=densitySamples[module];return{module,massG:s.massG,volumeCm3:s.volumeCm3,densityGramPerCm3:s.massG/s.volumeCm3,densityKgPerM3:gToKg(s.massG)/cm3ToM3(s.volumeCm3)};}
export function meltResult(){return{initialIceG:c.meltMassG,iceG:0,liquidG:c.meltMassG,contentsG:c.meltMassG,tareG:c.tareG,grossG:c.meltMassG+c.tareG};}
export function containerResult(module:MarketModule){const iceG=containerModels[module].iceG;return{module,virtualMinutes:c.virtualMinutes,initialIceG:c.initialIceG,iceG,liquidG:c.initialIceG-iceG,contentsG:c.initialIceG};}
export const canDeliver=(module:MarketModule)=>containerResult(module).iceG>=c.minimumIceG;
export const densityText=(v:number)=>v.toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
