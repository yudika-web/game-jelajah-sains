/** A learning instrument can own a panel while locomotion is paused. Ambient motion cannot. */
export function activityDelta(dt:number,paused:boolean,hidden:boolean,focused:boolean,ownedInstrument=false){
 return Number.isFinite(dt)&&dt>0&&!hidden&&focused&&(!paused||ownedInstrument)?dt:0;
}
