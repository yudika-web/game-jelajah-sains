import { durationS, heatCases, heatSetups, temperatureC, type HeatCase } from './greenhouseModel';

export type Prediction = 'less' | 'same' | 'more';
export const predictions = ['less', 'same', 'more'] as const;
export const expectedPrediction = (key: HeatCase): Prediction => key === 'A' ? 'more' : 'less';

export class GreenhouseSession {
  shade = false;
  vent = false;
  unlocked = false;
  seconds = 0;
  running = false;
  observed = false;
  prediction: Prediction | null = null;
  correction: Prediction | null = null;

  get key() { return heatCases[(this.shade ? 1 : 0) + (this.vent ? 2 : 0)]; }
  get temperature() { return temperatureC(heatSetups[this.key], this.seconds); }
  get finished() { return this.seconds === durationS; }
  get locked() { return this.prediction !== null; }

  setShade(on: boolean) {
    if (this.locked) return false;
    this.shade = on;
    return true;
  }

  setUnlocked(on: boolean) {
    if (this.locked || (!on && this.vent)) return false;
    this.unlocked = on;
    return true;
  }

  setVent(on: boolean) {
    if (this.locked || !this.unlocked) return false;
    this.vent = on;
    return true;
  }

  predict(value: Prediction) {
    if (this.locked) return false;
    this.prediction = value;
    return true;
  }

  advance(seconds: number) {
    if (!this.locked || !(seconds > 0)) return;
    this.seconds = Math.min(durationS, this.seconds + seconds);
    if (this.finished) this.running = false;
  }

  observe() {
    if (this.finished) this.observed = true;
  }

  correct(value: Prediction) {
    if (!this.observed) return false;
    this.correction = value;
    return true;
  }

  prepare() {
    this.seconds = 0;
    this.running = false;
    this.observed = false;
    this.prediction = null;
    this.correction = null;
  }

  recover() {
    this.prepare();
    this.shade = this.vent = this.unlocked = false;
  }
}
