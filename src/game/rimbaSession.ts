import { inSourceZone, openTrip, type RimbaEvent, type RimbaProgress, type TripEnd } from './rimbaMission';
/** Runtime samples only actual, unpaused simulation substeps. No real-time catch-up. */
export class RimbaSession {
  private distance = 0;
  private milliseconds = 0;
  constructor(private get:()=>RimbaProgress,private send:(event:RimbaEvent)=>void) {}
  motion(distance:number,seconds:number,position:{x:number;z:number}) {
    if(distance<=0||seconds<=0)return;
    let p=this.get();const inside=inSourceZone(position);
    if(inside&&openTrip(p)) {this.flush();this.send({type:'arriveSource'});p=this.get();}
    if(inside&&p.activeTool&&p[p.activeTool]>0&&!p.armed&&!p.concluded) {this.send({type:'arm'});p=this.get();}
    if(!inside&&p.armed&&!openTrip(p)){this.send({type:'depart'});p=this.get();}
    if(openTrip(p)) {this.distance+=distance*1000;this.milliseconds+=seconds*1000;if(this.milliseconds>=1000)this.flush();}
  }
  flush() {
    const distanceMm=Math.round(this.distance),movingMs=Math.round(this.milliseconds);
    if(distanceMm>0&&movingMs>0&&openTrip(this.get()))this.send({type:'travel',distanceMm,movingMs});
    this.distance=this.milliseconds=0;
  }
  settle(reason:TripEnd) {this.flush();this.send({type:'settle',reason});}
}
