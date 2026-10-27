/** Presentation only: the existing World loop supplies active delta time. */
export class GeoparkSession{
 elapsed=0;readonly duration=2.5;
 reset(){this.elapsed=0;}
 step(dt:number,active:boolean){if(active&&Number.isFinite(dt))this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,Math.min(.25,dt)));return this.elapsed/this.duration;}
 get finished(){return this.elapsed>=this.duration;}
}
