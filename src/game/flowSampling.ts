import { sampleVolume,type IrrigationPoint,type FlowCondition } from '../data/irrigationContent';
/** An accelerated experiment is transient until the explicit Record action. */
export class FlowSampling{
 phase:'idle'|'measuring'|'result'='idle';point:IrrigationPoint='P1';condition:FlowCondition='blocked';elapsed=0;revision=0;
 get volume(){return sampleVolume(this.point,this.condition);}
 start(point:IrrigationPoint,condition:FlowCondition,revision:number){if(this.phase!=='idle')return false;this.point=point;this.condition=condition;this.revision=revision;this.elapsed=0;this.phase='measuring';return true;}
 tick(dt:number,active:boolean){if(this.phase!=='measuring'||!active||!Number.isFinite(dt)||dt<=0)return;this.elapsed+=Math.min(dt,.1);if(this.elapsed>=1.8)this.phase='result';}
 cancel(){this.phase='idle';this.elapsed=0;}
}
