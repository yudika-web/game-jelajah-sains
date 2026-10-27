import {pontoonConfig} from '../data/pontoonContent';
import type {PontoonProgress,PontoonEvent} from './pontoonMission';
import {PontoonDelivery} from './pontoonDelivery';
export class PontoonSession{
 private key=-1;elapsed=0;fraction=0;readonly route=new PontoonDelivery();private lastDelivery='parked';
 reset(){this.key=-1;this.elapsed=0;this.fraction=0;this.route.recover();this.lastDelivery='parked';}
 tick(p:PontoonProgress,dt:number,active:boolean):PontoonEvent|null{
  if(p.delivery!==this.lastDelivery){if(p.delivery==='outbound')this.route.start(1);else if(p.delivery==='returning')this.route.start(-1);else if(p.delivery==='parked')this.route.recover();else this.route.stop();this.lastDelivery=p.delivery;}
  if(p.trial?.phase==='running'){if(this.key!==p.revision){this.key=p.revision;this.elapsed=0;this.fraction=0;}if(active&&Number.isFinite(dt)&&dt>0)this.elapsed+=Math.min(dt,.25);this.fraction=Math.min(1,this.elapsed/pontoonConfig.animationSeconds);if(active&&this.fraction>=1)return{type:'finish',revision:p.revision};}else{this.key=-1;this.elapsed=0;this.fraction=p.trial?1:0;}
  const e=p.selected?this.route.tick(p.selected,dt,active):null;return e?{type:e,revision:p.revision}:null;
 }
}
