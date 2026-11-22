import { cargoBay, cargoBayRadius, cargoDepot, cargoDistance, cargoFinish, cargoLane, cargoRoutes, cargoStart, type CargoRoute } from '../data/cargoRegion';
import { cargoLongitudinal, cargoMassKg, cargoStep, noCargoForces, type CargoReading } from '../game/cargoMotion';
import type { Point } from './navigation';

export type CargoRunKind = 'practice' | 'test' | 'delivery';
interface CargoRun {
  kind: CargoRunKind;
  route: CargoRoute;
  nextGate: number;
  elapsed: number;
  distance: number;
  finished: boolean;
  turned: boolean;
  coasted: boolean;
  braked: boolean;
}

function angleDelta(to: number, from: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function gateFraction(previous: Point, next: Point, level: number, axis: 'x' | 'z', sign: 1 | -1, center: Point) {
  const across = axis === 'x' ? 'z' : 'x';
  const a = previous[axis] * sign, b = next[axis] * sign;
  if (a >= level * sign || b < level * sign) return null;
  const fraction = (level * sign - a) / (b - a);
  const offset = previous[across] + (next[across] - previous[across]) * fraction - center[across];
  return Math.abs(offset) <= .9 ? fraction : null;
}

export class CargoController {
  position: Point = { ...cargoDepot };
  yaw = Math.PI / 2;
  speed = 0;
  wheel = 0;
  steer = 0;
  forces = noCargoForces();
  aboard = false;
  guiding = false;
  braking = false;
  parked: 'depot' | 'bay' | null = 'depot';
  run: CargoRun | null = null;
  staged: { kind: CargoRunKind; route: CargoRoute } | null = null;
  private timeBank = 0;
  private waypoint = 1;
  private practiceCoast = 0;
  private previousHeading: number | null = null;
  private releasing = false;

  get reading(): CargoReading | null {
    const r = this.run;
    if (!r?.finished || this.parked !== 'bay') return null;
    return { route: r.route, distanceMm: Math.round(r.distance * 1000), elapsedMs: Math.round(r.elapsed * 1000), gates: r.nextGate };
  }
  get practicePassed() {
    const r = this.run;
    return !!(r?.kind === 'practice' && this.reading && r.turned && r.coasted && r.braked && !this.aboard);
  }

  prepare(kind: CargoRunKind, route: CargoRoute) {
    if (this.aboard || this.parked !== 'depot' || this.run) return false;
    this.staged = { kind, route };
    return true;
  }

  board() {
    if (this.aboard || !this.parked) return false;
    if (this.parked === 'depot') {
      if (!this.staged || this.run) return false;
      this.run = { ...this.staged, nextGate: 0, elapsed: 0, distance: 0, finished: false,
        turned: false, coasted: false, braked: false };
    }
    this.aboard = true;
    this.braking = false;
    return true;
  }

  park() {
    if (!this.aboard || this.speed > .005 || (this.parked !== 'depot' &&
      (!this.run?.finished || cargoDistance(this.position, cargoBay) > cargoBayRadius))) return false;
    if (this.parked !== 'depot') this.parked = 'bay';
    this.guiding = false;
    this.forces = noCargoForces();
    return true;
  }

  exit(footIsSafe: boolean) {
    if (!footIsSafe || !this.park()) return false;
    this.aboard = false;
    return true;
  }

  guide() {
    if (!this.aboard || !this.run || this.parked === 'bay') return false;
    if (!this.guiding) this.waypoint = Math.min(this.run.nextGate + 1, cargoRoutes[this.run.route].points.length - 1);
    this.guiding = true;
    this.braking = false;
    return true;
  }

  brake() {
    this.guiding = false;
    this.braking = true;
  }

  recover() {
    this.position = { ...cargoDepot };
    this.yaw = Math.PI / 2;
    this.speed = this.steer = this.wheel = 0;
    this.aboard = this.guiding = this.braking = false;
    this.parked = 'depot';
    this.run = this.staged = null;
    this.timeBank = this.practiceCoast = 0;
    this.waypoint = 1;
    this.previousHeading = null;
    this.releasing = false;
    this.forces = noCargoForces();
  }

  frame(dt: number, input: Point, active: boolean, clear: (p: Point) => boolean) {
    if (!active || !this.aboard || !this.run || this.parked === 'bay') return;
    this.timeBank += dt;
    while (this.timeBank + 1e-10 >= cargoStep) {
      this.timeBank -= cargoStep;
      this.step(input, clear);
      if (this.reading) { this.timeBank = 0; break; }
    }
  }

  private step(input: Point, clear: (p: Point) => boolean) {
    const r = this.run!;
    const points = cargoRoutes[r.route].points;
    const manual = Math.abs(input.x) > .03 || Math.abs(input.z) > .03;
    if (manual) {
      this.guiding = false;
      if (input.z < -.03) this.braking = false;
    }
    // A guide resumed mid-course rejoins the next checkpoint of the same route.
    if (this.guiding) {
      if (this.waypoint < points.length - 1 && cargoDistance(points[this.waypoint], this.position) < .001) this.waypoint++;
    }
    const target = points[this.waypoint];
    const remaining = cargoDistance(this.position, target);
    const aim = Math.atan2(target.x - this.position.x, target.z - this.position.z);
    const bearing = this.guiding ? angleDelta(aim, this.yaw) : -Math.sign(input.x) * Math.min(1, Math.abs(input.x)) * 1.65 * cargoStep;
    const steering = this.guiding ? bearing : bearing * Math.min(1, this.speed * 1.3 + (input.z < -.05 ? .25 : 0));
    this.steer = this.guiding ? -Math.max(-.65, Math.min(.65, bearing * 4)) : Math.max(-.65, Math.min(.65, input.x * .58));
    if (remaining > .001 || !this.guiding) this.yaw += steering;
    let power = this.guiding ? 1 : Math.max(0, Math.min(1, -input.z));
    let brake = this.braking || input.z > .05;
    if (this.guiding && r.kind === 'practice' && this.waypoint < 4 && this.practiceCoast < .48 &&
      (this.speed > 1.8 || this.practiceCoast > 0)) {
      this.practiceCoast += cargoStep;
      power = 0;
      this.releasing = true;
    } else if (power > 0) this.releasing = false;
    const terminal = this.guiding && this.waypoint === points.length - 1;
    if (terminal && remaining <= .26) { power = 0; brake = true; }
    const lane = cargoLane(r.route, this.position);
    const limit = terminal ? Math.min(lane.speed, Math.max(.65, remaining * 2.2)) : lane.speed;
    const initialSpeed = this.speed;
    const motion = cargoLongitudinal(initialSpeed, power, brake, limit, cargoStep);
    let advance = (initialSpeed + motion.speed) * .5 * cargoStep;
    if (this.guiding) advance = Math.min(advance, remaining);
    const previous = this.position;
    const next = { x: previous.x + Math.sin(this.yaw) * advance, z: previous.z + Math.cos(this.yaw) * advance };
    const nextLane = cargoLane(r.route, next);
    const blocked = nextLane.distance > nextLane.width || !clear(next);
    this.speed = blocked ? 0 : motion.speed;
    this.forces = motion.forces;
    if (blocked) {
      this.forces.contact = -this.speedDifference(motion.speed);
      this.forces.net += this.forces.contact;
    } else if (advance > 0) {
      this.position = next;
      this.wheel += advance / .31;
      this.parked = null;
      if (this.previousHeading !== null && Math.abs(angleDelta(this.yaw, this.previousHeading)) > .14) r.turned = true;
      this.previousHeading ??= this.yaw;
      if (initialSpeed > .25 && !power && !brake && (this.releasing || !this.guiding)) r.coasted = true;
      if (initialSpeed > .25 && brake && this.speed < initialSpeed) r.braked = true;
    }
    this.measure(previous, this.position);
    if (terminal && this.speed < .005 && remaining <= .27 && r.finished) this.park();
  }

  private speedDifference(speed: number) { return speed * cargoMassKg / cargoStep; }

  private measure(previous: Point, now: Point) {
    const r = this.run!;
    if (r.finished) return;
    let fraction = 1;
    if (!r.nextGate) {
      const start = gateFraction(previous, now, cargoStart.x, 'x', 1, cargoStart);
      if (start === null) return;
      fraction = 1 - start;
      r.nextGate = 1;
    }
    const points = cargoRoutes[r.route].points;
    const finishIndex = points.length - 2;
    if (r.nextGate < finishIndex - 1 && cargoDistance(now, points[r.nextGate + 1]) < .52) r.nextGate++;
    if (r.nextGate === finishIndex - 1) {
      const end = gateFraction(previous, now, cargoFinish.z, 'z', -1, cargoFinish);
      if (end !== null) {
        fraction = end;
        r.nextGate++;
        r.finished = true;
      }
    }
    r.elapsed += cargoStep * fraction;
    r.distance += cargoDistance(previous, now) * fraction;
  }
}
