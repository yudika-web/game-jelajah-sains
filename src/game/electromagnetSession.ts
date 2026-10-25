import type {ElectromagnetProgress,MagnetEvent} from './electromagnetMission';
import {CraneAnimation} from './craneState';
/** Advancement is driven by World's existing delta-time loop, only while controls are open. */
export class ElectromagnetSession {
 readonly animation=new CraneAnimation();fraction=0;
 tick(p:ElectromagnetProgress,dt:number,active:boolean):MagnetEvent|null{
  const phase=p.trial?.phase;
  const event=phase==='positioning'?'trialArrive':phase==='lifting'?'trialResult':phase==='returning'?'cleanupTrial':p.crane.motion?'motionDone':null;
  if(!event){this.fraction=0;return null;}
  const key=`${p.revision}/${phase??p.crane.motion?.axis}`;
  this.fraction=this.animation.update(key,dt,active,phase==='lifting'?1.1:.85);
  return this.fraction>=1&&active?{type:event,revision:p.revision} as MagnetEvent:null;
 }
 reset(){this.animation.reset();this.fraction=0;}
}
