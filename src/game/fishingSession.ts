import type { FishingSite } from '../data/riverContent';
export type FishingPhase = 'idle' | 'casting' | 'waiting' | 'ready' | 'observing' | 'released';
export const fishingTiming = { casting: .8, waiting: 1.6, released: .75 } as const;
/** Transient state only. Driven by the existing render loop; no timer or persistence. */
export class FishingSession {
  phase: FishingPhase = 'idle'; site: FishingSite = 'A'; elapsed = 0; index = 0;
  get active() { return this.phase !== 'idle'; }
  start(site: FishingSite, index: number) { if(this.active||index<0||index>=3)return false;this.site=site;this.index=index;this.elapsed=0;this.phase='casting';return true; }
  tick(dt: number, active: boolean) {
    if(!active||!Number.isFinite(dt)||dt<=0)return;
    this.elapsed+=Math.min(.1,dt);
    if(this.phase==='casting'&&this.elapsed>=fishingTiming.casting){this.phase='waiting';this.elapsed=0;}
    else if(this.phase==='waiting'&&this.elapsed>=fishingTiming.waiting){this.phase='ready';this.elapsed=0;}
    else if(this.phase==='released'&&this.elapsed>=fishingTiming.released)this.cancel();
  }
  pull() { if(this.phase!=='ready')return false;this.phase='observing';this.elapsed=0;return true; }
  release() { if(this.phase!=='observing')return false;this.phase='released';this.elapsed=0;return true; }
  cancel() { this.phase='idle';this.elapsed=0; }
}
