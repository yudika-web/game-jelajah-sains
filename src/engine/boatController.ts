import { docks, type BoatDocks, type DockId } from '../data/boatRegion';
import { walkable, type NavigationArea,type Point } from './navigation';
/** Runtime vehicle state; motion uses the existing MovementController and render loop. */
export class BoatController{
 docks:BoatDocks;
 constructor(dockSet:BoatDocks=docks){this.docks=dockSet;this.recover();}
 configure(next:BoatDocks){this.docks=next;this.recover();}
 nearby(p:Point):DockId|null{for(const id of ['research','irrigation'] as const)if(Math.hypot(p.x-this.docks[id].water.x,p.z-this.docks[id].water.z)<=.5)return id;return null;}
 aboard=false;enabled=false;dock:DockId|null='research';position:Point={...docks.research.water};yaw=docks.research.yaw as number;
 tripFrom:DockId='research';distanceMm=0;
 board(player:Point){if(this.aboard||!this.dock||Math.hypot(player.x-this.docks[this.dock].land.x,player.z-this.docks[this.dock].land.z)>2.65)return false;this.aboard=true;this.enabled=false;this.tripFrom=this.dock;this.distanceMm=0;return true;}
 start(){if(!this.aboard)return false;this.enabled=true;this.dock=null;return true;}
 stop(){this.enabled=false;}
 motion(p:Point,distance:number,yaw:number){if(!this.aboard)return;this.position.x=p.x;this.position.z=p.z;this.yaw=yaw;if(distance>0){this.distanceMm+=Math.round(distance*1000);this.dock=null;}}
 moor(p:Point){if(!this.aboard)return null;const d=this.nearby(p);if(!d)return null;this.dock=d;this.position={...this.docks[d].water};this.yaw=this.docks[d].yaw;this.enabled=false;return d;}
 canExit(area:NavigationArea){return this.aboard&&this.dock!==null&&walkable(this.docks[this.dock].land,area);}
 exit(area:NavigationArea):Point|null{if(!this.canExit(area))return null;const p={...this.docks[this.dock!].land};this.aboard=false;this.enabled=false;return p;}
 recover(){this.aboard=false;this.enabled=false;this.dock='research';this.position={...this.docks.research.water};this.yaw=this.docks.research.yaw;this.tripFrom='research';this.distanceMm=0;}
}
