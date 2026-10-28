import {astroConfig as c} from '../data/spaceContent';
import type {SpaceProgress} from './spaceMission';
/** Presentation clock only. The existing World loop owns time; no timer or extra input listener. */
export class SpaceSession{
 private key='';private elapsed=0;angleMdeg=0;finished=false;
 reset(){this.key='';this.elapsed=0;this.angleMdeg=0;this.finished=false;}
 frame(p:SpaceProgress,dt:number,active:boolean){const m=p.trial?.motion;if(!m){this.key='';this.elapsed=0;this.finished=false;this.angleMdeg=p.trial?.angleMdeg??0;return;}const key=`${p.revision}:${m.from}:${m.to}`;if(key!==this.key){this.key=key;this.elapsed=0;this.finished=false;this.angleMdeg=m.from;}if(active&&Number.isFinite(dt))this.elapsed+=Math.max(0,Math.min(.25,dt));const duration=(m.to-m.from)/c.quarter*c.secondsPerQuarter;const f=Math.min(1,this.elapsed/duration);this.angleMdeg=Math.round(m.from+(m.to-m.from)*f);this.finished=f>=1;}
}
