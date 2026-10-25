import {pressureConfig,pressurePoints,pressurePointIds,rovDock,type PressurePoint} from '../data/pressureContent';
import {rootYAtDepth,sensorDepth} from '../game/pressureModel';
import {findRovPath,rovWalkable,sweepRov,type Point3} from './rovNavigation';
import {movementDelta} from './movement';
export class RovController{
 active=false;position:Point3={x:rovDock.x,y:rootYAtDepth(0),z:rovDock.z};targetDepth=0;path:Point3[]=[];stable:PressurePoint|'zero'|null=null;stabilizing:PressurePoint|'zero'|null=null;arrivals=0;horizontalDistance=0;maxDepthChange=0;private originDepth=0;private probe:Point3={x:0,y:0,z:0};
 get depth(){return sensorDepth(this.position.y);}
 get moving(){return this.path.length>0||Math.abs(this.depth-this.targetDepth)>.001;}
 launch(){this.recover();this.active=true;return true;}
 stop(){this.path=[];this.targetDepth=this.depth;this.stabilizing=null;}
 recover(){this.active=false;this.position={x:rovDock.x,y:rootYAtDepth(0),z:rovDock.z};this.targetDepth=0;this.path=[];this.stable=this.stabilizing=null;this.horizontalDistance=this.maxDepthChange=this.originDepth=0;}
 target(id:PressurePoint|'zero'){return id==='zero'?{x:rovDock.x,y:rootYAtDepth(0),z:rovDock.z}:{x:pressurePoints[id].x,y:rootYAtDepth(pressurePoints[id].depth),z:pressurePoints[id].z};}
 navigate(id:PressurePoint|'zero'){if(!this.active)return false;const end=this.target(id),path=findRovPath(this.position,end);if(!path.length)return false;this.stable=this.stabilizing=null;this.path=path;this.targetDepth=sensorDepth(end.y);return true;}
 changeDepth(delta:number){if(!this.active||!Number.isFinite(delta))return;this.path=[];this.stable=this.stabilizing=null;this.targetDepth=Math.max(0,Math.min(pressureConfig.maxDepth,Math.round((this.targetDepth+delta)*1000)/1000));}
 nearby(){let best:PressurePoint|'zero'|null=null,dist=Infinity;for(const id of ['zero',...pressurePointIds] as const){const p=this.target(id),horizontal=Math.hypot(this.position.x-p.x,this.position.z-p.z),d=Math.hypot(horizontal,this.position.y-p.y);if(horizontal<=pressureConfig.stationRange&&d<dist){dist=d;best=id;}}return best;}
 stabilize(id:PressurePoint|'zero'|null=this.nearby()){if(!this.active)return false;if(!id){this.stop();return true;}const target=this.target(id);if(Math.hypot(this.position.x-target.x,this.position.z-target.z)>pressureConfig.stationRange)return false;if(!this.navigate(id))return false;this.stabilizing=id;return true;}
 ready(id:PressurePoint|'zero'){const p=this.target(id);return this.active&&this.stable===id&&!this.moving&&Math.hypot(this.position.x-p.x,this.position.z-p.z,this.position.y-p.y)<=pressureConfig.readingTolerance;}
 step(input:{x:number;z:number},yaw:number,seconds:number){const dt=movementDelta(seconds);if(!this.active||!dt)return;const mag=Math.hypot(input.x,input.z),manual=mag>0;if(manual){this.path=[];this.stable=this.stabilizing=null;}const oldDepth=this.depth;
 for(let t=0;t<dt-1e-10;){const h=Math.min(1/120,dt-t);t+=h;const oldX=this.position.x,oldZ=this.position.z,n=this.path[0];if(n&&!manual){const dx=n.x-this.position.x,dy=n.y-this.position.y,dz=n.z-this.position.z;const ratio=Math.min(1,h/Math.max(Math.hypot(dx,dz)/pressureConfig.horizontalSpeed,Math.abs(dy)/pressureConfig.verticalSpeed,1e-12));const p=this.probe;p.x=this.position.x+dx*ratio;p.y=this.position.y+dy*ratio;p.z=this.position.z+dz*ratio;if(rovWalkable(p))Object.assign(this.position,p);else{this.stop();break;}if(ratio===1){this.path.shift();if(!this.path.length){this.arrivals++;if(this.stabilizing){this.stable=this.stabilizing;this.stabilizing=null;}}}}
 else{if(manual){const div=Math.max(1,mag),dx=(input.x*Math.cos(yaw)+input.z*Math.sin(yaw))/div*pressureConfig.horizontalSpeed*h,dz=(-input.x*Math.sin(yaw)+input.z*Math.cos(yaw))/div*pressureConfig.horizontalSpeed*h;this.position.x=sweepRov(this.position,'x',dx);this.position.z=sweepRov(this.position,'z',dz);}const dy=rootYAtDepth(this.targetDepth)-this.position.y;this.position.y=sweepRov(this.position,'y',Math.sign(dy)*Math.min(Math.abs(dy),pressureConfig.verticalSpeed*h));}
 this.horizontalDistance+=Math.hypot(this.position.x-oldX,this.position.z-oldZ);
 }this.maxDepthChange=Math.max(this.maxDepthChange,Math.abs(this.depth-this.originDepth),Math.abs(this.depth-oldDepth));
 }
}
