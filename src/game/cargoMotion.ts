export const cargoStep = 1 / 120;
export const cargoMassKg = 220;
export const cargoMaxSpeed = 5.4;
export const cargoBrakeN = 850;

export interface CargoForces {
  drive: number;
  drag: number;
  brake: number;
  contact: number;
  net: number;
}

export const noCargoForces = (): CargoForces => ({ drive: 0, drag: 0, brake: 0, contact: 0, net: 0 });

/** Longitudinal force balance. The governor trims thrust before applying a brake. */
export function cargoLongitudinal(speed: number, power: number, brake: boolean, limit: number, dt: number) {
  const drag = speed > 0 ? 42 + 19 * speed : 0;
  let drive = brake ? 0 : 515 * power;
  let braking = brake ? cargoBrakeN : 0;
  let net = drive - drag - braking;
  const capped = Math.max(0, Math.min(limit, speed + net / cargoMassKg * dt));
  const constrained = cargoMassKg * (capped - speed) / dt;
  if (constrained < net) {
    const trim = Math.min(drive, net - constrained);
    drive -= trim;
    braking += net - constrained - trim;
  } else if (constrained > net) {
    braking = Math.max(0, constrained < drive - drag ? drive - drag - constrained : 0);
  }
  // Static braking and drag vanish at rest. A final, truncated stop uses
  // their effective values over the step, so the readout still balances.
  const effectiveDrag = drive - braking - constrained;
  net = constrained;
  return { speed: capped, forces: { drive, drag: effectiveDrag, brake: braking, contact: 0, net } };
}

export interface CargoReading {
  route: 'A' | 'B';
  distanceMm: number;
  elapsedMs: number;
  gates: number;
}

export const averageCargoSpeed = (r: CargoReading) => r.distanceMm / r.elapsedMs;
export const cargoTimeToleranceMs = 10;
export function fasterCargo(a: CargoReading, b: CargoReading) {
  return Math.abs(a.elapsedMs - b.elapsedMs) <= cargoTimeToleranceMs ? 'tie' :
    a.elapsedMs < b.elapsedMs ? a.route : b.route;
}
