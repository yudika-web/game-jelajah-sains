import {expeditionConfig as c,evaEntry,tetherAnchor,evaPoints,type EvaPointId,type Vector3Data as V} from '../data/spaceExpedition';
import {distance3,evaSegmentClear,findEvaPath,sweepEva} from './evaNavigation';
import {movementDelta} from './movement';
export class EvaController{
 position:V={...evaEntry};velocity:V={x:0,y:0,z:0};targetY=evaEntry.y;path:V[]=[];tether:V[]=[{...tetherAnchor},{...evaEntry}];target:EvaPointId|null=null;arrivals=0;message='';distance=0;
 get length(){return this.tether.reduce((sum,p,i)=>sum+(i?distance3(this.tether[i-1],p):0),0);}
 reset(){this.position={...evaEntry};this.targetY=this.position.y;this.tether=[{...tetherAnchor},{...this.position}];this.arrivals=0;this.distance=0;this.message='';this.stop();}
 stop(){this.velocity={x:0,y:0,z:0};this.path=[];this.target=null;this.targetY=this.position.y;}
 changeHeight(delta:number){if(!Number.isFinite(delta))return;this.path=[];this.target=null;this.targetY=Math.max(.9,Math.min(10.1,this.targetY+delta));}
 navigate(id:EvaPointId){const path=findEvaPath(this.position,evaPoints[id].approach);if(!path.length)return false;this.path=path;this.target=id;this.targetY=path.at(-1)!.y;return true;}
 navigatePoint(point:V){const path=findEvaPath(this.position,point);if(!path.length)return false;this.path=path;this.target=null;this.targetY=point.y;return true;}
 nearby(){let id:EvaPointId|null=null,best:number=c.interaction;for(const[k,p]of Object.entries(evaPoints)){const d=distance3(this.position,p.position);if(d<best){best=d;id=k as EvaPointId;}}return id;}
 private tetherFor(next:V){const route=this.tether.slice(0,-1);while(route.length>1&&evaSegmentClear(route[route.length-2],next))route.pop();if(!evaSegmentClear(route.at(-1)!,next))route.push({...this.position});route.push({...next});return route;}
 step(input:{x:number;z:number},yaw:number,seconds:number):EvaPointId|null{
  const dt=movementDelta(seconds);if(!dt)return null;const mag=Math.hypot(input.x,input.z);if(mag>.001){if(this.path.length)this.targetY=this.position.y;this.path=[];this.target=null;}let arrived:EvaPointId|null=null;
  for(let time=0;time<dt-1e-9;){const h=Math.min(1/90,dt-time);time+=h;const old={...this.position},waypoint=this.path[0];let next:V;
   if(waypoint){const d=distance3(old,waypoint),scale=Math.min(1,c.horizontalSpeed*h/Math.max(d,1e-10));next={x:old.x+(waypoint.x-old.x)*scale,y:old.y+(waypoint.y-old.y)*scale,z:old.z+(waypoint.z-old.z)*scale};if(!evaSegmentClear(old,next)){this.stop();break;}}
   else{const div=Math.max(1,mag),target={x:(input.x*Math.cos(yaw)+input.z*Math.sin(yaw))/div*c.horizontalSpeed,y:Math.sign(this.targetY-old.y)*Math.min(c.verticalSpeed,Math.abs(this.targetY-old.y)/h),z:(-input.x*Math.sin(yaw)+input.z*Math.cos(yaw))/div*c.horizontalSpeed};for(const a of ['x','y','z'] as const)this.velocity[a]+=(target[a]-this.velocity[a])*(1-Math.exp(-20*h));next={...old};for(const a of ['x','y','z'] as const){let delta=this.velocity[a]*h;if(a==='y'&&Math.sign(delta)===Math.sign(this.targetY-old.y)&&Math.abs(delta)>=Math.abs(this.targetY-old.y)){delta=this.targetY-old.y;this.velocity.y=0;}next[a]=sweepEva(next,a,delta);if(Math.abs(next[a]-old[a]-delta)>1e-6){this.velocity[a]=0;if(a==='y')this.targetY=next.y;}}}
   const rope=this.tetherFor(next),length=rope.reduce((sum,p,i)=>sum+(i?distance3(rope[i-1],p):0),0);if(length>c.maxTether||rope.length>125){this.stop();this.message='Batas penambat tercapai. Bergerak mendekati airlock atau pilih pemulihan.';break;}
   this.position=next;this.tether=rope;this.distance+=distance3(old,next);if(waypoint&&distance3(next,waypoint)<1e-6){this.path.shift();if(!this.path.length){arrived=this.target;this.target=null;this.arrivals++;this.velocity={x:0,y:0,z:0};this.targetY=next.y;}}
  }return arrived;
 }
}
