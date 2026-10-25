/** Presentation time only. World supplies active delta; no timer/second game loop. */
export class PressureSampling{elapsed=0;tick(dt:number,active:boolean,reading:boolean){if(!reading){this.elapsed=0;return false;}if(!active||!Number.isFinite(dt)||dt<=0||dt>.25)return false;this.elapsed+=dt;if(this.elapsed<1)return false;this.elapsed=0;return true;}cancel(){this.elapsed=0;}}
