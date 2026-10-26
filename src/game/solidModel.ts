import {solidConfig,supportSizes,type SolidModule} from '../data/solidContent';
export const squareCmToSquareM=(cm2:number)=>cm2/10000;
export const pascalToKpa=(pa:number)=>pa/1000;
export const supportAreaCm2=(module:SolidModule)=>supportSizes[module].widthCm*supportSizes[module].lengthCm;
export interface SolidResult{module:SolidModule;challenge:boolean;widthCm:number;lengthCm:number;areaCm2:number;areaM2:number;forceN:number;pressurePa:number;appliedN:number;observedPressurePa:number|null;fits:boolean;success:boolean;reason:'target'|'pressure'|'width';}
export function solidResult(module:SolidModule,challenge=false):SolidResult{
 if(!Object.hasOwn(supportSizes,module))throw Error('Penopang tidak dikenal.');
 const {widthCm,lengthCm}=supportSizes[module],areaCm2=supportAreaCm2(module),areaM2=squareCmToSquareM(areaCm2),pressurePa=solidConfig.forceN/areaM2;
 const fits=widthCm<=solidConfig.pathWidthCm,applied=!challenge||fits;
 return{module,challenge,widthCm,lengthCm,areaCm2,areaM2,forceN:solidConfig.forceN,pressurePa,appliedN:applied?solidConfig.forceN:0,observedPressurePa:applied?pressurePa:null,fits,success:!challenge||fits&&pressurePa<=solidConfig.pressureLimitPa,reason:challenge&&!fits?'width':challenge&&pressurePa>solidConfig.pressureLimitPa?'pressure':'target'};
}
export const kpaText=(pa:number)=>`${pascalToKpa(pa).toLocaleString('id-ID')} kPa`;
export const solidReason=(r:SolidResult)=>r.reason==='width'?`Lebar ${r.widthCm} cm tidak muat pada jalur ${solidConfig.pathWidthCm} cm. Tertahan di gerbang ukur; beban tetap terangkat.`:r.reason==='pressure'?`Muat, tetapi tekanan ${kpaText(r.pressurePa)} melebihi batas model ${kpaText(solidConfig.pressureLimitPa)}.`:`${r.challenge?'Muat pada jalur dan memenuhi batas tekanan.':'Uji kontak penuh selesai.'} Gaya tetap ${r.forceN} N; tekanan ${kpaText(r.pressurePa)}.`;
