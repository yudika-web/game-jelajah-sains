import {solidConfig} from '../data/solidContent';
import type {SolidProgress,SolidEvent} from './solidMission';
/** Presentation clock owned by World's existing loop. No wall time or extra RAF. */
export class SolidSession{
 private key=-1;elapsed=0;fraction=0;
 reset(){this.key=-1;this.elapsed=0;this.fraction=0;}
 tick(p:SolidProgress,dt:number,active:boolean):SolidEvent|null{
 if(p.trial?.phase!=='running'){this.fraction=p.trial?1:0;this.key=-1;this.elapsed=0;return null;}
 if(this.key!==p.revision){this.key=p.revision;this.elapsed=0;this.fraction=0;}
 if(active&&Number.isFinite(dt)&&dt>0)this.elapsed+=Math.min(dt,.25);
 this.fraction=Math.min(1,this.elapsed/solidConfig.animationSeconds);
 return active&&this.fraction>=1?{type:'finish',revision:p.revision}:null;
 }
}
