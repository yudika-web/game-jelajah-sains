import {expeditionConfig as c,shipDock,shipPrep,preparationPlaces,lockerPoint,airlockPoint,chamberPoint,evaEntry,type Vector3Data as V} from '../data/spaceExpedition';
import {EvaController} from '../engine/evaController';
import {distance3} from '../engine/evaNavigation';
export type ExpeditionPhase='interior'|'preparation'|'boarding'|'seated'|'departure'|'transit'|'docking'|'docked'|'leaving'|'airlock-entering'|'chamber'|'sealed'|'checked'|'cycling-out'|'outer-ready'|'outer-open'|'exiting'|'outside'|'reentering'|'sealed-return'|'cycling-in'|'inner-ready'|'inner-open'|'airlock-leaving';
export type ExpeditionAction='board'|'start'|'skip'|'disembark'|'equip'|'remove'|'enter-airlock'|'close-inner'|'check'|'cycle-out'|'open-outer'|'exit'|'enter-return'|'cycle-in'|'open-inner'|'leave-airlock'|'recover';
const mix=(a:V,b:V,t:number):V=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});
/** Transient presentation only: no mission, XP, inventory or asynchronous timer callback. */
export class SpaceExpedition{
 phase:ExpeditionPhase='interior';direction:'outbound'|'return'='outbound';equipped=false;elapsed=0;revision=0;pose:V={x:14,y:0,z:16.2};from:V={...this.pose};eva=new EvaController();message='';onChange=()=>{};
 get inVehicle(){return ['boarding','seated','departure','transit','docking','docked'].includes(this.phase);}
 get seated(){return this.inVehicle&&(this.phase!=='boarding'||this.elapsed>c.boardSeconds*.65);}
 get animating(){return ['boarding','departure','transit','docking','airlock-entering','cycling-out','exiting','reentering','cycling-in','airlock-leaving'].includes(this.phase);}
 get flight(){return ['departure','transit','docking'].includes(this.phase);}
 get outside(){return this.phase==='outside';}
 get chamber(){return !['interior','preparation','boarding','seated','departure','transit','docking','docked','leaving','outside'].includes(this.phase);}
 get landControls(){return this.phase==='interior'||this.phase==='preparation';}
 get controlledPose(){return !this.landControls;}
 get innerOpen(){return ['airlock-entering','chamber','inner-open','airlock-leaving'].includes(this.phase);}
 get outerOpen(){return ['outer-open','exiting','reentering'].includes(this.phase);}
 get showInterior(){return this.phase==='interior'||this.chamber||this.outside||this.phase==='boarding'&&this.direction==='return'||this.phase==='seated'&&this.direction==='return'||this.phase==='docking'&&this.direction==='outbound'||this.phase==='docked'&&this.direction==='outbound';}
 get fraction(){const duration=this.phase==='boarding'?c.boardSeconds:this.phase==='departure'?c.departureSeconds:this.phase==='transit'?c.transitSeconds:this.phase==='docking'?c.dockingSeconds:this.phase==='cycling-in'||this.phase==='cycling-out'?c.airlockSeconds:c.doorSeconds;return Math.min(1,this.elapsed/duration);}
 private set(phase:ExpeditionPhase){this.phase=phase;this.elapsed=0;this.revision++;this.message='';this.eva.stop();this.onChange();}
 reset(){this.equipped=false;this.direction='outbound';this.eva.reset();this.pose={x:14,y:0,z:16.2};this.from={...this.pose};this.set('interior');}
 prepare(){this.reset();this.pose={x:0,y:0,z:15};this.set('preparation');}
 shipPosition():V{
  const a=this.direction==='outbound'?shipPrep:shipDock,b=this.direction==='outbound'?shipDock:shipPrep,up={x:a.x,y:2.2,z:a.z+4},middle={x:b.x,y:3,z:b.z+2.5};
  return this.phase==='departure'?mix(a,up,this.fraction):this.phase==='transit'?mix(up,middle,this.fraction):this.phase==='docking'?mix(middle,b,this.fraction):this.phase==='docked'?{...b}:this.phase==='interior'?{...shipDock}:this.phase==='preparation'?{...shipPrep}:{...a};
 }
 act(action:ExpeditionAction,position:V,revision=this.revision){
  if(revision!==this.revision)return false;
  const near=(p:{x:number;z:number})=>Math.hypot(position.x-p.x,position.z-p.z)<=c.interaction;
  const fail=(message:string)=>{this.message=message;return false;};
  switch(action){
   case'board':if(this.phase==='preparation'){if(!near(preparationPlaces[1]))return fail('Dekati pintu kendaraan terlebih dahulu.');this.direction='outbound';}else if(this.phase==='interior'){if(!near({x:7.3,z:13.5}))return fail('Dekati pintu kendaraan di dok.');this.direction='return';}else return false;this.from={...position};this.pose={...position};this.set('boarding');return true;
   case'start':if(this.phase!=='seated')return false;this.set('departure');return true;
   case'skip':if(!this.flight)return false;this.set('docked');this.pose={...this.shipPosition(),y:.15};return true;
   case'disembark':if(this.phase!=='docked')return false;if(this.direction==='return'){this.set('leaving');return true;}this.pose={x:7.3,y:0,z:14.9};this.set('interior');return true;
   case'equip':if(this.phase!=='interior'||!near(lockerPoint))return fail('Dekati lemari perlengkapan di stasiun.');if(this.equipped)return false;this.equipped=true;this.revision++;this.onChange();return true;
   case'remove':if(this.phase!=='interior'||!near(lockerPoint)||!this.equipped)return false;this.equipped=false;this.revision++;this.onChange();return true;
   case'enter-airlock':if(this.phase!=='interior'||!near(airlockPoint))return fail('Dekati pintu dalam airlock.');if(!this.equipped)return fail('Pakai perlengkapan lengkap di lemari dahulu.');this.from={...position};this.pose={...position};this.set('airlock-entering');return true;
   case'close-inner':if(this.phase!=='chamber')return false;this.set('sealed');return true;
   case'check':if(this.phase!=='sealed'||!this.equipped)return false;this.set('checked');return true;
   case'cycle-out':if(this.phase!=='checked')return false;this.set('cycling-out');return true;
   case'open-outer':if(this.phase!=='outer-ready')return false;this.set('outer-open');return true;
   case'exit':if(this.phase!=='outer-open'||!this.equipped)return false;this.from={...this.pose};this.set('exiting');return true;
   case'enter-return':if(!this.outside||distance3(this.eva.position,evaEntry)>c.interaction)return fail('Dekati titik tambat airlock atau pilih pemulihan.');this.from={...this.pose};this.set('reentering');return true;
   case'cycle-in':if(this.phase!=='sealed-return')return false;this.set('cycling-in');return true;
   case'open-inner':if(this.phase!=='inner-ready')return false;this.set('inner-open');return true;
   case'leave-airlock':if(this.phase!=='inner-open')return false;this.from={...this.pose};this.set('airlock-leaving');return true;
   case'recover':if(!this.chamber&&!this.outside)return false;this.pose={...chamberPoint};this.set('sealed-return');this.eva.reset();return true;
  }
 }
 stop(){this.eva.stop();}
 frame(dt:number,active:boolean,reduced:boolean,input:{x:number;z:number},yaw:number){
  if(!active)return null;dt=Math.max(0,Math.min(.25,Number.isFinite(dt)?dt:0));if(this.animating)this.elapsed+=dt;
  const f=reduced&&this.animating?1:this.fraction;
  if(this.phase==='boarding'){const base=this.direction==='outbound'?shipPrep:shipDock,outer={x:base.x+2.3,y:0,z:base.z},inner={x:base.x+.8,y:0,z:base.z},seat={x:base.x,y:.15,z:base.z};this.pose=f<.4?mix(this.from,outer,f/.4):f<.7?mix(outer,inner,(f-.4)/.3):mix(inner,seat,(f-.7)/.3);if(f===1)this.set('seated');}
  else if(this.flight){const ship=this.shipPosition();this.pose={x:ship.x,y:ship.y+.15,z:ship.z};if(f===1){const next=this.phase==='departure'?'transit':this.phase==='transit'?'docking':'docked';this.set(next);const s=this.shipPosition();this.pose={x:s.x,y:s.y+.15,z:s.z};}}
  else if(this.phase==='seated'||this.phase==='docked'){const s=this.shipPosition();this.pose={x:s.x,y:s.y+.15,z:s.z};}
  else if(this.phase==='airlock-entering'){this.pose=mix(this.from,chamberPoint,f);if(f===1){this.pose={...chamberPoint};this.set('chamber');}}
  else if(this.phase==='cycling-out'){if(f===1)this.set('outer-ready');}
  else if(this.phase==='cycling-in'){if(f===1)this.set('inner-ready');}
  else if(this.phase==='exiting'){this.pose=mix(this.from,{x:evaEntry.x,y:evaEntry.y-.9,z:evaEntry.z},f);if(f===1){this.eva.reset();this.set('outside');}}
  else if(this.phase==='reentering'){this.pose=mix(this.from,chamberPoint,f);if(f===1){this.pose={...chamberPoint};this.set('sealed-return');}}
  else if(this.phase==='airlock-leaving'){this.pose=mix(this.from,{...airlockPoint},f);if(f===1)this.set('interior');}
  else if(this.outside){const arrived=this.eva.step(input,yaw,dt);this.pose={x:this.eva.position.x,y:this.eva.position.y-.9,z:this.eva.position.z};return arrived;}
  return null;
 }
}
