import {hydraulicConfig as c,outputAreas,type HydraulicModule} from '../data/hydraulicContent';
export const cm2ToM2=(area:number)=>area/10000;
export const cmToM=(length:number)=>length/100;
export const mToCm=(length:number)=>length*100;
export interface HydraulicResult{module:HydraulicModule;challenge:boolean;inputAreaM2:number;outputAreaM2:number;requiredN:number;appliedN:number;pressurePa:number;inputMm:number;outputMm:number;volumeMm3:number;inputWorkMilliJ:number;outputWorkMilliJ:number;success:boolean;reason:'target'|'force'|'stroke';}
/** Integer mm / mm³ / mJ in recorded transactions. SI for F/A and volume. */
export function hydraulicResult(module:HydraulicModule,challenge=false):HydraulicResult{
 if(!Object.hasOwn(outputAreas,module))throw Error('Modul hidraulik tidak dikenal.');
 const a1=cm2ToM2(c.inputAreaCm2),a2=cm2ToM2(outputAreas[module]);
 const required=c.loadN*a1/a2, requiredStroke=cmToM(c.targetCm)*a2/a1;
 const enough=!challenge||required<=c.challengeForceN;
 const s1=enough?Math.min(requiredStroke,challenge?cmToM(c.challengeStrokeCm):requiredStroke):0;
 const s2=s1*a1/a2,applied=enough?required:c.challengeForceN;
 return {module,challenge,inputAreaM2:a1,outputAreaM2:a2,requiredN:required,appliedN:applied,pressurePa:applied/a1,inputMm:Math.round(s1*1000),outputMm:Math.round(s2*1000),volumeMm3:Math.round(a1*s1*1e9),inputWorkMilliJ:Math.round(applied*s1*1000),outputWorkMilliJ:Math.round(c.loadN*s2*1000),success:enough&&s2>=cmToM(c.targetCm)-1e-10,reason:!enough?'force':s2<cmToM(c.targetCm)-1e-10?'stroke':'target'};
}
export const hydraulicReason=(r:HydraulicResult)=>r.reason==='force'?`Tertahan: perlu ${r.requiredN} N, tetapi batas gaya hanya ${c.challengeForceN} N. Kedua piston tetap diam.`:r.reason==='stroke'?`Batas gerak ${c.challengeStrokeCm} cm tercapai. Peti hanya naik ${r.outputMm/10} cm dari target ${c.targetCm} cm.`:`Target ${c.targetCm} cm tercapai; gaya dan gerak mencukupi.`;
