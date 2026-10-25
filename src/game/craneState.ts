import {clipIds,coilCapacity,type ClipId,type CoilModule} from '../data/electromagnetContent';
export type ClipLocation='sample'|'tray'|'head'|'bin'|'recovery';
export type CraneMotion={axis:'position'|'elevation';target:number};
export interface CraneState {position:number;elevation:number;motion:CraneMotion|null;clips:Record<ClipId,ClipLocation>;lifts:{module:CoilModule;ids:ClipId[];from:'tray'|'recovery'}[];deliveries:{module:CoilModule;ids:ClipId[]}[];}
export const initialCrane=():CraneState=>({position:0,elevation:1,motion:null,clips:{K1:'sample',K2:'tray',K3:'tray',K4:'tray',K5:'tray',K6:'tray'},lifts:[],deliveries:[]});
export const clipsAt=(c:CraneState,place:ClipLocation)=>clipIds.filter(id=>c.clips[id]===place);
export function pickClips(c:CraneState,module:CoilModule){if(c.elevation>.02||clipsAt(c,'head').length)return;const from=c.position<.02?'tray':Math.abs(c.position-.5)<.02?'recovery':null;if(!from)return;const ids=clipsAt(c,from).slice(0,coilCapacity(module));for(const id of ids)c.clips[id]='head';if(ids.length)c.lifts.push({module,ids,from});}
export function releaseClips(c:CraneState,module:CoilModule){const ids=clipsAt(c,'head');if(!ids.length)return;const target=c.position>.98&&c.elevation<.02?'bin':c.position<.02?'tray':'recovery';for(const id of ids)c.clips[id]=target;if(target==='bin')c.deliveries.push({module,ids});}
export function recoverCrane(c:CraneState){for(const id of clipIds)if(c.clips[id]==='head'||c.clips[id]==='recovery')c.clips[id]='tray';c.position=0;c.elevation=1;c.motion=null;}
/** Presentation tween owned by the existing World loop. No renderer or event listeners. */
export class CraneAnimation {
 private signature='';elapsed=0;fraction=0;
 update(key:string,dt:number,active:boolean,duration=.85){if(key!==this.signature){this.signature=key;this.elapsed=0;this.fraction=0;}if(active&&Number.isFinite(dt)&&dt>0)this.elapsed+=Math.min(dt,.25);this.fraction=Math.min(1,this.elapsed/duration);return this.fraction;}
 reset(){this.signature='';this.elapsed=0;this.fraction=0;}
}
