import {pontoonConfig,pontoonSizes,type PontoonModule} from '../data/pontoonContent';
import {pontoonRoute} from '../data/pontoonRegion';
/** A fixed water route shares the region's world coordinates. Swept hull, not a point arrival. */
export class PontoonDelivery{
 z:number=pontoonRoute.start.z;direction:1|-1|0=0;arrived=false;blocked=false;
 start(direction:1|-1){this.direction=direction;this.arrived=false;this.blocked=false;}
 stop(){this.direction=0;}
 recover(){this.z=pontoonRoute.start.z;this.stop();this.arrived=false;this.blocked=false;}
 tick(module:PontoonModule,dt:number,active:boolean):'arrive'|'home'|'blocked'|null{
  if(!active||!this.direction||!Number.isFinite(dt)||dt<=0)return null;
  const direction=this.direction,target=direction===1?pontoonRoute.end.z:pontoonRoute.start.z,step=pontoonConfig.speed*Math.min(dt,.25);
  // Both floats and cross-members fit only if the entire width fits the measuring gate.
  const limit=direction===1&&pontoonSizes[module].widthM>pontoonConfig.gateWidthM?pontoonRoute.gateZ-pontoonRoute.lengthM/2-.13:target;
  this.z=direction===1?Math.min(limit,this.z+step):Math.max(target,this.z-step);
  if(this.z===limit&&direction===1&&limit!==target){this.stop();this.blocked=true;return'blocked';}
  if(this.z===target){this.stop();this.arrived=direction===1;return this.arrived?'arrive':'home';}return null;
 }
}
