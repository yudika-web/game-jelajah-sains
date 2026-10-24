import { docks, nearbyDock, type DockId } from '../data/boatRegion';
import { walkable, type NavigationArea,type Point } from './navigation';
/** Runtime vehicle state; motion uses the existing MovementController and render loop. */
export class BoatController{
 aboard=false;enabled=false;dock:DockId|null='research';position:Point={...docks.research.water};yaw=docks.research.yaw as number;
 tripFrom:DockId='research';distanceMm=0;
 board(player:Point){if(this.aboard||!this.dock||Math.hypot(player.x-docks[this.dock].land.x,player.z-docks[this.dock].land.z)>2.65)return false;this.aboard=true;this.enabled=false;this.tripFrom=this.dock;this.distanceMm=0;return true;}
 start(){if(!this.aboard)return false;this.enabled=true;this.dock=null;return true;}
 stop(){this.enabled=false;}
 motion(p:Point,distance:number,yaw:number){if(!this.aboard)return;this.position.x=p.x;this.position.z=p.z;this.yaw=yaw;if(distance>0){this.distanceMm+=Math.round(distance*1000);this.dock=null;}}
 moor(p:Point){if(!this.aboard)return null;const d=nearbyDock(p);if(!d)return null;this.dock=d;this.position={...docks[d].water};this.yaw=docks[d].yaw;this.enabled=false;return d;}
 canExit(area:NavigationArea){return this.aboard&&this.dock!==null&&walkable(docks[this.dock].land,area);}
 exit(area:NavigationArea):Point|null{if(!this.canExit(area))return null;const p={...docks[this.dock!].land};this.aboard=false;this.enabled=false;return p;}
 recover(){this.aboard=false;this.enabled=false;this.dock='research';this.position={...docks.research.water};this.yaw=docks.research.yaw;this.tripFrom='research';this.distanceMm=0;}
}
