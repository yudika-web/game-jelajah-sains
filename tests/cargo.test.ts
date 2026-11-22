import { describe, expect, it } from 'vitest';
import { cargoBay, cargoBayRadius, cargoDepot, cargoDistance, cargoFoot, cargoPackageId, cargoPlaces, cargoRouteIds, cargoRoutes, routeLength, type CargoRoute } from '../src/data/cargoRegion';
import { riverNavigation } from '../src/data/riverRegion';
import { CargoController, type CargoRunKind } from '../src/engine/cargoController';
import { findPath, walkable } from '../src/engine/navigation';
import { cargoTransition, initialCargo, parseCargo, type CargoEvent } from '../src/game/cargoMission';
import { averageCargoSpeed, cargoLongitudinal, cargoMassKg, cargoStep, fasterCargo } from '../src/game/cargoMotion';
import { reconcileCoins, newEconomy } from '../src/game/coinEconomy';
import { importBackup, initialGame, makeBackup } from '../src/game/gameState';

const idle = { x: 0, z: 0 };
const available = (p: typeof idle) => walkable(p, { ...riverNavigation, radius: 1.15 });

function approach(kind: CargoRunKind, route: CargoRoute, dt = .02, dwell = 0) {
  const truck = new CargoController();
  expect(truck.prepare(kind, route)).toBe(true);
  expect(truck.board()).toBe(true);
  expect(truck.guide()).toBe(true);
  let moved = 0;
  const check = (p: typeof idle) => {
    if (!available(p)) return false;
    moved += cargoDistance(truck.position, p);
    return true;
  };
  for (let i = 0; truck.parked !== 'bay' && i * dt < 35; i++) {
    truck.frame(dt, idle, true, check);
    expect(truck.speed <= (route === 'A' ? 2 : 5.4) + 1e-6).toBe(true);
    if (dwell && i * dt > 2 && truck.run!.nextGate > 0 && !truck.run!.finished) {
      truck.brake();
      for (let j = 0; j < 240; j++) truck.frame(cargoStep, idle, true, check);
      expect(truck.speed).toBe(0);
      const stopped = { ...truck.position };
      const before = truck.run!.elapsed;
      for (let j = 0; j < dwell * 120; j++) truck.frame(cargoStep, idle, true, check);
      expect(truck.position).toEqual(stopped);
      expect(truck.run!.elapsed - before).toBeCloseTo(dwell, 8);
      dwell = 0;
      truck.guide();
    }
  }
  expect(truck.parked, JSON.stringify({ p:truck.position,speed:truck.speed,run:truck.run,forces:truck.forces })).toBe('bay');
  expect(cargoDistance(truck.position, cargoBay)).toBeLessThan(cargoBayRadius);
  expect(moved).toBeGreaterThan(cargoDistance(cargoDepot, cargoBay));
  expect(truck.wheel * .31).toBeCloseTo(moved, 8);
  expect(truck.reading).not.toBeNull();
  expect(truck.exit(walkable(cargoFoot.bay, riverNavigation))).toBe(true);
  return truck;
}

describe('M04 cargo motion and route gates', () => {
  it('limits longitudinal speed with a balanced governor and decelerates on release or braking', () => {
    const initial = cargoLongitudinal(0, 1, false, 2, cargoStep);
    expect(initial.speed).toBeGreaterThan(0);
    expect(initial.speed / cargoStep).toBeCloseTo(initial.forces.net / cargoMassKg, 10);
    const steady = cargoLongitudinal(2, 1, false, 2, cargoStep);
    expect(steady.speed).toBe(2);
    expect(steady.forces.net).toBe(0);
    expect(steady.forces.drive).toBeCloseTo(steady.forces.drag, 8);
    expect(steady.forces.drive).toBeGreaterThan(0);
    const coast = cargoLongitudinal(2, 0, false, 2, cargoStep);
    const brake = cargoLongitudinal(2, 1, true, 2, cargoStep);
    expect(coast.speed).toBeLessThan(2);
    expect(brake.speed).toBeLessThan(coast.speed);
    expect(brake.forces.brake).toBeGreaterThan(0);
    expect(cargoLongitudinal(0, 0, true, 2, cargoStep).forces.net).toBe(0);
  });
  it.each(cargoRouteIds)('guides through %s entirely on real land, independent of frame batches', route => {
    const slow = approach('test', route, 1 / 17);
    const fast = approach('test', route, 1 / 60);
    expect(slow.reading).toEqual(fast.reading);
    expect(slow.reading?.gates).toBe(cargoRoutes[route].points.length - 2);
    expect(averageCargoSpeed(slow.reading!)).toBeCloseTo(slow.reading!.distanceMm / slow.reading!.elapsedMs, 10);
  });
  it('records a real pause on the road and supports comparing different outcomes', () => {
    const a = approach('test', 'A');
    const b = approach('test', 'B');
    const bSlow = approach('test', 'B', .025, 6);
    expect(routeLength('A')).toBeLessThan(routeLength('B'));
    expect(a.reading!.distanceMm).toBeLessThan(b.reading!.distanceMm);
    expect(bSlow.reading!.elapsedMs - b.reading!.elapsedMs).toBeGreaterThan(6000);
    expect(fasterCargo(a.reading!, bSlow.reading!)).toBe('A');
    expect(fasterCargo({ ...a.reading!, elapsedMs: 10 }, { ...b.reading!, elapsedMs: 18 })).toBe('tie');
  });
  it('freezes both clock and car in a pause and ignores depot relocation, collision and canceled runs as evidence', () => {
    const truck = new CargoController();
    truck.prepare('test', 'A'); truck.board(); truck.guide();
    expect(truck.reading).toBeNull();
    expect(truck.exit(false)).toBe(false);
    for (let i = 0; i < 225; i++) truck.frame(cargoStep, idle, true, available);
    expect(truck.run!.nextGate).toBeGreaterThan(0);
    const before = { position: truck.position, wheel: truck.wheel, run: { ...truck.run } };
    truck.frame(6, idle, false, available);
    expect(truck.position).toEqual(before.position);
    expect(truck.run).toEqual(before.run);
    truck.frame(cargoStep, idle, true, () => false);
    expect(truck.wheel).toEqual(before.wheel);
    expect(truck.run!.distance).toEqual(before.run.distance);
    expect(truck.run!.elapsed).toBeGreaterThan(before.run.elapsed!);
    expect(truck.speed).toBe(0);
    expect(truck.forces.contact).toBeLessThan(0);
    expect(truck.exit(true)).toBe(false);
    truck.recover();
    expect(truck).toMatchObject({ run: null, staged: null, parked: 'depot', position: cargoDepot, speed: 0 });
    expect(truck.reading).toBeNull();
  });
  it('keeps pedestrian approaches and both dismount points walkable', () => {
    for (const foot of Object.values(cargoFoot)) expect(walkable(foot, riverNavigation)).toBe(true);
    for (const place of cargoPlaces) expect(findPath({ x: -2,z: 9 }, { x: place.x, z: place.z + 1.4 }, riverNavigation).length, place.id).toBeGreaterThan(0);
  });
});

function evidence() {
  let p = initialCargo();
  const send = (event: CargoEvent, truck = new CargoController()) => {
    const r = cargoTransition(p, event, truck);
    p = r.progress;
    return r.ok;
  };
  send({ type: 'accept' });
  send({ type: 'read', source: 'book' });
  send({ type: 'read', source: 'notes' });
  const practice = approach('practice', 'A');
  expect(practice.practicePassed).toBe(true);
  expect(send({ type: 'practice' }, practice)).toBe(true);
  expect(send({ type: 'predict', prediction: 'A' })).toBe(true);
  for (const route of cargoRouteIds) {
    const truck = approach('test', route);
    expect(send({ type: 'record' }, truck)).toBe(true);
    const recorded = p;
    expect(send({ type: 'record' }, truck)).toBe(true);
    expect(p).toBe(recorded);
  }
  return { get state() { return p; }, send };
}

describe('M04 evidence and atomic save inputs', () => {
  it('requires two measured trips, proper freight and a real park before handover', () => {
    const lab = evidence();
    const fastest = fasterCargo(lab.state.records[0], lab.state.records[1]);
    expect(lab.send({ type: 'decide', route: 'A', reason: 'wide' })).toBe(false);
    expect(lab.send({ type: 'decide', route: 'B', reason: 'wide' })).toBe(true);
    const finish = { type:'deliver', fastest, explanation:'both', reflection:'Jadwal rute berubah jika saya berhenti.' } as const;
    expect(lab.send(finish)).toBe(false);
    expect(lab.send(finish, approach('test', 'B'))).toBe(false);
    const delivered = approach('delivery', 'B');
    expect(delivered.prepare('delivery', 'B')).toBe(false);
    expect(lab.send(finish, delivered)).toBe(true);
    const complete = lab.state;
    expect(complete.delivered?.id).toBe(cargoPackageId);
    expect(complete.reward).toBe(100);
    expect(parseCargo(complete)).toEqual(complete);
    expect(lab.send(finish, delivered)).toBe(true);
    expect(lab.state).toBe(complete);
    const bad = structuredClone(complete);
    bad.delivered!.parkMm[0] = 0;
    expect(() => parseCargo(bad)).toThrow('M04');
  });
  it('preserves M03, appearance and the one-time M04 payment through v21 import and reset', () => {
    const lab = evidence();
    lab.send({ type:'decide',route:'B',reason:'wide' });
    lab.send({ type:'deliver',fastest:fasterCargo(lab.state.records[0],lab.state.records[1]), explanation:'both',reflection:'' }, approach('delivery','B'));
    const game = initialGame();
    game.M03.accepted = true;
    game.M03.book = true;
    const old = makeBackup(game);
    const { M04: _absent, ...missions } = old.missions;
    game.M04 = lab.state;
    const coin = reconcileCoins(newEconomy(), game, 'mission-completion');
    expect(coin.grants.map(r => r.missionId)).toEqual(['M04']);
    game.economy = coin.economy;
    expect(importBackup({ ...old, missions, version:21 }, game).game.M04).toEqual(game.M04);
    expect(importBackup(makeBackup(game), initialGame()).game).toEqual(game);
    const first = structuredClone(game.M04);
    lab.send({ type:'reset' });
    game.M04 = lab.state;
    expect(game.M04).toMatchObject({ reward:100, completed:false, delivered:null, records:[] });
    expect(game.M04.rewardProof).toEqual(first.rewardProof);
    expect(reconcileCoins(game.economy!, game, 'mission-completion').grants).toEqual([]);
    expect(game.M03).toEqual(old.missions.M03);
  });
});
