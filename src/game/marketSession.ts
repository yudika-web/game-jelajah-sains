import {marketConfig} from '../data/marketContent';
import type {MarketProgress,MarketEvent} from './marketMission';
/** Uses the existing World's delta; step mode never waits on real time. */
export class MarketSession{
 private key=-1;private elapsed=0;fraction=0;
 reset(){this.key=-1;this.elapsed=0;this.fraction=0;}
 tick(p:MarketProgress,dt:number,active:boolean,stepsOnly:boolean):MarketEvent|null{
  const t=p.trial;if(t?.phase!=='running'){this.key=-1;this.elapsed=0;this.fraction=t&&t.phase!=='loaded'?1:0;return null;}
  if(this.key!==p.revision){this.key=p.revision;this.elapsed=t.steps/4*marketConfig.animationSeconds;}
  if(active&&!stepsOnly&&Number.isFinite(dt)&&dt>0)this.elapsed+=Math.min(dt,.25);
  this.fraction=Math.min(1,this.elapsed/marketConfig.animationSeconds);
  return active&&!stepsOnly&&this.fraction>=1?{type:'finish',revision:p.revision}:null;
 }
}
