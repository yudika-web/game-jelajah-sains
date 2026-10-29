import {diveConfig as c,diveBounds,diveObstacles,diveEntry,diveShore,divePoints,type DivePointId} from '../data/diving';
import {createVolumeNavigation,distance3,type Point3 as V} from './volumeNavigation';
import {movementDelta} from './movement';
export const diveNavigation=createVolumeNavigation({bounds:diveBounds,body:c.body,obstacles:diveObstacles});
export type DivePhase='shore'|'ready'|'entering'|'surface'|'diving'|'exiting';
export type DiveAction='equip'|'remove'|'enter'|'exit'|'recover';
/** Transient exploration; this controller never writes mission evidence, XP or cosmetic ownership. */
export class DivingController{
 phase:DivePhase='shore';revision=0;position:V={...diveEntry};pose:V={...diveShore};from:V={...diveShore};targetY=c.surfaceY as number;path:V[]=[];target:DivePointId|'entry'|null=null;elapsed=0;distance=0;arrivals=0;message='';onChange=()=>{};
 get equipped(){return this.phase!=='shore';}get active(){return this.phase==='surface'||this.phase==='diving';}get controlled(){return this.active||this.phase==='entering'||this.phase==='exiting';}get depth(){return Math.max(0,c.surfaceY-this.position.y);}
 private set(p:DivePhase){this.phase=p;this.elapsed=0;this.revision++;this.stop();this.message='';this.onChange();}
 stop(){this.path=[];this.target=null;this.targetY=this.position.y;}
 reset(){this.position={...diveEntry};this.pose={...diveShore};this.arrivals=this.distance=0;this.set('shore');}
 act(action:DiveAction,foot:V,rev=this.revision){if(rev!==this.revision)return false;const near=(x:number,z:number)=>Math.hypot(foot.x-x,foot.z-z)<2.6;switch(action){
 case'equip':if(this.phase!=='shore'||!near(-11,22))return false;this.set('ready');return true;
 case'remove':if(this.phase!=='ready'||!near(-11,22))return false;this.set('shore');return true;
 case'enter':if(this.phase!=='ready'||!near(diveShore.x,diveShore.z))return false;this.position={...diveEntry};this.from={...foot};this.set('entering');return true;
 case'exit':if(!this.active||Math.hypot(this.position.x-diveEntry.x,this.position.z-diveEntry.z)>2.2||this.depth>.35){this.message='Dekati tangga masuk dan naik ke permukaan, atau pilih Kembali ke Dermaga.';return false;}this.from={...this.pose};this.set('exiting');return true;
 case'recover':if(!this.equipped)return false;this.position={...diveEntry};this.pose={...diveShore};this.set('ready');return true;}}
 changeHeight(delta:number){if(!this.active||!Number.isFinite(delta))return;this.path=[];this.target=null;this.targetY=Math.max(c.surfaceY-c.maxDepth,Math.min(c.surfaceY,this.targetY+delta));}
 nearby(){let best:DivePointId|null=null,d=c.range as number;for(const[id,p]of Object.entries(divePoints)){const n=distance3(this.position,p.position);if(n<d){best=id as DivePointId;d=n;}}return best;}
 navigate(id:DivePointId|'entry'){if(!this.active)return false;const end=id==='entry'?diveEntry:divePoints[id].approach;const path=diveNavigation.findPath(this.position,end);if(!path.length)return false;this.stop();this.path=path;this.target=id;this.targetY=end.y;return true;}
 navigatePoint(p:V){if(!this.active)return false;const path=diveNavigation.findPath(this.position,p);if(!path.length)return false;this.stop();this.path=path;this.targetY=p.y;return true;}
 frame(seconds:number,active:boolean,reduced:boolean,input:{x:number;z:number},yaw:number):DivePointId|'entry'|null{
 const dt=movementDelta(seconds);if(!active||!dt)return null;
 if(this.phase==='entering'||this.phase==='exiting'){this.elapsed+=dt;const f=reduced?1:Math.min(1,this.elapsed/c.transitionSeconds),end=this.phase==='entering'?{x:diveEntry.x,y:diveEntry.y-c.centreOffset,z:diveEntry.z}:diveShore;for(const a of ['x','y','z'] as const)this.pose[a]=this.from[a]+(end[a]-this.from[a])*f;if(f===1)this.set(this.phase==='entering'?'surface':'ready');return null;}
 if(!this.active)return null;const mag=Math.hypot(input.x,input.z);if(mag>.001&&this.path.length)this.stop();let arrived:DivePointId|'entry'|null=null;
 for(let t=0;t<dt-1e-9;){const h=Math.min(1/120,dt-t);t+=h;const p=this.position,old={...p},next=this.path[0];
 if(next){const dx=next.x-p.x,dy=next.y-p.y,dz=next.z-p.z,ratio=Math.min(1,h/Math.max(Math.hypot(dx,dz)/c.horizontalSpeed,Math.abs(dy)/c.verticalSpeed,1e-10));const candidate={x:p.x+dx*ratio,y:p.y+dy*ratio,z:p.z+dz*ratio};if(!diveNavigation.segmentClear(p,candidate)){this.stop();break;}Object.assign(p,candidate);if(ratio===1){this.path.shift();if(!this.path.length){this.arrivals++;arrived=this.target;this.target=null;this.targetY=p.y;}}}
 else{const div=Math.max(1,mag);p.x=diveNavigation.sweep(p,'x',(input.x*Math.cos(yaw)+input.z*Math.sin(yaw))/div*c.horizontalSpeed*h);p.z=diveNavigation.sweep(p,'z',(-input.x*Math.sin(yaw)+input.z*Math.cos(yaw))/div*c.horizontalSpeed*h);const dy=this.targetY-p.y,step=Math.sign(dy)*Math.min(Math.abs(dy),c.verticalSpeed*h);p.y=diveNavigation.sweep(p,'y',step);if(Math.abs(p.y-old.y-step)>1e-6)this.targetY=p.y;}
 this.distance+=distance3(old,p);
 }
 this.pose={x:this.position.x,y:this.position.y-c.centreOffset,z:this.position.z};const phase=this.depth>.3?'diving':'surface';if(phase!==this.phase){this.phase=phase;/* crossing the surface is not an input-reset transition */}return arrived;
 }
}
/** Camera hysteresis avoids repeated air/water toggling at the same boundary. */
export class UnderwaterEnvironment{
 underwater=false;switches=0;
 update(cameraY:number,allowed:boolean){const next=allowed&&(this.underwater?cameraY<c.surfaceY+.2:cameraY<c.surfaceY-.3);if(next!==this.underwater){this.underwater=next;this.switches++;}return this.underwater;}
 reset(){this.underwater=false;}
}
