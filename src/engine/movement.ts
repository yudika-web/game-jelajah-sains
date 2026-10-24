import { sweepAxis, walkable, type NavigationArea, type Point } from './navigation';

/** World units/second; independent of avatar scale, region and saved mission state. */
export const movementConfig = {
  walkSpeed: 5.2,
  runSpeed: 8,
  acceleration: 60,
  deceleration: 90,
  analogDeadZone: .06,
  simulationStep: 1 / 120,
  maxFrameTime: .25,
} as const;

/** Preserve 4–120 Hz elapsed time. Discard suspended-tab gaps instead of catching up. */
export function movementDelta(seconds: number) {
  return Number.isFinite(seconds) && seconds > 0 && seconds <= movementConfig.maxFrameTime ? seconds : 0;
}
export function analogInput(x: number, z: number) {
  const length = Math.hypot(x, z);
  if (length <= movementConfig.analogDeadZone) return { x: 0, z: 0 };
  const magnitude = (Math.min(1, length) - movementConfig.analogDeadZone) / (1 - movementConfig.analogDeadZone);
  return { x: x / length * magnitude, z: z / length * magnitude };
}

/** Shared by keyboard, touch and path following. No rendering or mission dependencies. */
export class MovementController {
  speed = 0;
  private headingX = 0;
  private headingZ = 0;
  private probe = { x: 0, z: 0 };
  readonly result = { distance: 0, dx: 0, dz: 0, arrived: false, blocked: false };
  stop() { this.speed = this.headingX = this.headingZ = 0; }

  step(position: Point, input: Point, yaw: number, run: boolean, path: Point[], seconds: number, area: NavigationArea, speeds: {walkSpeed:number;runSpeed:number} = movementConfig, onStep?: (distance:number,seconds:number,position:Point)=>void) {
    const result = this.result;
    result.distance = result.dx = result.dz = 0; result.arrived = result.blocked = false;
    const dt = movementDelta(seconds);
    if (!dt) return result;
    const inputLength = Math.hypot(input.x, input.z);
    const manual = inputLength > 0;
    if (manual) path.length = 0;
    for (let time = 0; time < dt - 1e-10;) {
      const h = Math.min(movementConfig.simulationStep, dt - time); time += h;
      const next = path[0];
      let dx = 0, dz = 0, remaining = Infinity;
      if (manual) {
        const divisor = Math.max(1, inputLength);
        dx = (input.x * Math.cos(yaw) + input.z * Math.sin(yaw)) / divisor;
        dz = (-input.x * Math.sin(yaw) + input.z * Math.cos(yaw)) / divisor;
      } else if (next) {
        dx = next.x - position.x; dz = next.z - position.z;
        remaining = Math.hypot(dx, dz);
        if (remaining < 1e-8) {
          path.shift();
          if (!path.length) { this.stop(); result.arrived = true; break; }
          continue;
        }
        dx /= remaining; dz /= remaining;
      }
      const magnitude = Math.hypot(dx, dz);
      const targetSpeed = (run ? speeds.runSpeed : speeds.walkSpeed) * magnitude;
      const rate = targetSpeed > this.speed ? movementConfig.acceleration : movementConfig.deceleration;
      const rampTime = Math.min(h, Math.abs(targetSpeed - this.speed) / rate);
      const endSpeed = this.speed + Math.sign(targetSpeed - this.speed) * rate * rampTime;
      // Integrate the short ramp exactly, including time after reaching the target speed.
      let distance = (this.speed + endSpeed) * .5 * rampTime + endSpeed * (h - rampTime);
      this.speed = endSpeed;
      if (magnitude > 0) { this.headingX = dx / magnitude; this.headingZ = dz / magnitude; }
      distance = Math.min(distance, remaining);
      if (distance <= 0) continue;
      const oldX = position.x, oldZ = position.z;
      this.probe.x = oldX + this.headingX * distance; this.probe.z = oldZ + this.headingZ * distance;
      if (next && !manual) {
        // Stay on each safe path segment; never slide/cut a corner or overshoot a waypoint.
        if (walkable(this.probe, area)) { position.x = this.probe.x; position.z = this.probe.z; }
      } else {
        // Sweep to the exact first wall; no micro-creep from rejected endpoint steps.
        position.x = sweepAxis(position, 'x', this.headingX * distance, area);
        position.z = sweepAxis(position, 'z', this.headingZ * distance, area);
      }
      const moved = Math.hypot(position.x - oldX, position.z - oldZ);
      if(moved>1e-10) onStep?.(moved,h,position);
      result.distance += moved; result.dx += position.x - oldX; result.dz += position.z - oldZ;
      if (moved < 1e-10) {
        this.speed = 0; result.blocked = true;
        if (next && !manual) { path.length = 0; break; } // a blocked path never reports arrival
      } else if (next && !manual && distance >= remaining - 1e-8) {
        position.x = next.x; position.z = next.z; path.shift();
        if (!path.length) { this.stop(); result.arrived = true; break; }
      }
    }
    return result;
  }
}
