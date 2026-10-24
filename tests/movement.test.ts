import { describe, expect, it } from 'vitest';
import { analogInput, MovementController, movementConfig, movementDelta } from '../src/engine/movement';
import { findPath, sweepAxis, walkable, type NavigationArea } from '../src/engine/navigation';
import { rimbaNavigation } from '../src/data/rimbaRegion';
import { regions } from '../src/data/regions';
import { CharacterAnimator } from '../src/engine/characterAnimator';
import { createCharacter } from '../src/engine/character';

const open: NavigationArea = { bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 }, obstacles: [] };
function travel(run: boolean, dt: number, input = { x: 0, z: -1 }, duration = 2) {
  const motion = new MovementController(), p = { x: 0, z: 0 };
  for (let t = 0; t < duration - 1e-9; t += dt) motion.step(p, input, 0, run, [], Math.min(dt, duration - t), open);
  return { motion, p, distance: Math.hypot(p.x, p.z) };
}
describe('real movement, independent of renderer, model scale and frame rate', () => {
  it('runs farther in equal time with identical distances at 10/15/20/30/60/120 Hz and jittered frames', () => {
    for (const run of [false, true]) {
      const baseline = travel(run, 1 / 120).distance;
      for (const fps of [10, 15, 20, 30, 60, 120]) expect(travel(run, 1 / fps).distance).toBeCloseTo(baseline, 8);
      const motion = new MovementController(), p = { x: 0, z: 0 };
      let t = 0, i = 0;
      while (t < 2 - 1e-9) {
        const dt = Math.min([.016, .1, .033, .067][i++ % 4], 2 - t);
        motion.step(p, { x: 0, z: -1 }, 0, run, [], dt, open); t += dt;
      }
      expect(-p.z).toBeCloseTo(baseline, 8);
    }
    expect(travel(true, 1 / 60).distance).toBeGreaterThan(travel(false, 1 / 60).distance * 1.5);
  });
  it('returns to walking after sprint release, normalizes diagonals, and stops with a short braking distance', () => {
    const { motion, p } = travel(true, .1);
    expect(motion.speed).toBe(movementConfig.runSpeed);
    motion.step(p, { x: 0, z: -1 }, 0, false, [], .1, open);
    expect(motion.speed).toBe(movementConfig.walkSpeed);
    expect(travel(true, .1, { x: 1, z: -1 }).distance).toBeCloseTo(travel(true, .1).distance, 8);
    const before = p.z;
    motion.step(p, { x: 0, z: 0 }, 0, false, [], .1, open);
    expect(motion.speed).toBe(0); expect(before - p.z).toBeLessThan(.16);
    const run = travel(true, .1), start = run.p.z;
    run.motion.step(run.p, { x: 0, z: 0 }, 0, true, [], .1, open);
    expect(start - run.p.z).toBeLessThan(.36);
    expect(run.motion.speed).toBe(0);
    const idle = travel(true, .1, { x: 0, z: 0 }); expect(idle.distance).toBe(0);
  });
  it('has a small remapped analog dead zone and retains proportional movement', () => {
    expect(analogInput(.03, .03)).toEqual({ x: 0, z: 0 });
    expect(analogInput(0, -.07).z).toBeLessThan(0);
    expect(Math.hypot(...Object.values(analogInput(1, 1)))).toBeCloseTo(1);
    const half = analogInput(0, -.53);
    expect(half.z).toBeCloseTo(-.5);
    expect(travel(true, .1, half).motion.speed).toBeCloseTo(4);
  });
  it('ignores suspended-tab spikes and explicit reset removes inertia without changing preferences or scale', () => {
    const { motion, p } = travel(true, .1), before = { ...p };
    for (const dt of [10, .3, -1, NaN, Infinity]) {
      expect(movementDelta(dt)).toBe(0); motion.step(p, { x: 1, z: 0 }, 0, true, [], dt, open);
      expect(p).toEqual(before);
    }
    motion.stop(); motion.step(p, { x: 0, z: 0 }, 0, false, [], .1, open);
    expect(p).toEqual(before); expect(motion.speed).toBe(0);
  });
  for (const [region, r] of Object.entries(regions)) {
    it(`stops on every obstacle and all region bounds at running speed / 10 Hz: ${region}`, () => {
      const { navigation: area } = r;
      for (const o of area.obstacles) for (const side of [-1, 1]) {
        const p = { x: o.x + side * (o.width / 2 + 1), z: o.z };
        if (!walkable(p, area)) continue;
        const motion = new MovementController();
        for (let i = 0; i < 40; i++) { motion.step(p, { x: -side, z: 0 }, 0, true, [], .1, area); expect(walkable(p, area)).toBe(true); }
        expect(side * (p.x - o.x)).toBeGreaterThanOrEqual(o.width / 2 + .45 - 1e-8);
        expect(motion.result.distance).toBeLessThan(.001);
      }
      for (const input of [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }]) {
        const p = { ...r.spawn }, motion = new MovementController();
        for (let i = 0; i < 100; i++) { motion.step(p, input, 0, true, [], .1, area); expect(walkable(p, area)).toBe(true); }
      }
    });
    it(`walks/runs safe paths to every mission object and arrives exactly once: ${region}`, () => {
      const area=region==='rimba'?rimbaNavigation(true):r.navigation; // C is reachable after explicit safety confirmation
      for (const place of r.places.filter(p=>p.id!=='poolBuoy')) for (const run of [false, true]) {
        const p = { ...r.spawn }, goal = { x: place.x, z: place.z + (place.id==='poolRamp'?0:1.4) }, path = findPath(p, goal, area);
        expect(path.length).toBeGreaterThan(0);
        const motion = new MovementController(); let arrivals = 0;
        for (let i = 0; i < 180; i++) {
          const result = motion.step(p, { x: 0, z: 0 }, 0, run, path, .1, area);
          if (result.arrived) arrivals++;
          expect(walkable(p, area)).toBe(true);
        }
        expect(p).toEqual(goal); expect(path).toEqual([]); expect(arrivals).toBe(1); expect(motion.speed).toBe(0);
      }
    });
  }
  it('sweeps long segments to the first wall and never creeps at a wall on fractional frames', () => {
    const area: NavigationArea = { ...open, obstacles: [{ x: 2, z: 0, width: .01, depth: 4 }] };
    expect(sweepAxis({ x: 0, z: 0 }, 'x', 20, area)).toBeCloseTo(2 - .005 - .45 - 1e-8, 9);
    const motion = new MovementController(), p = { x: -9, z: -5.4 };
    const animator = new CharacterAnimator(createCharacter('explorer'));
    for (let i = 0; i < 40; i++) {
      const dt = [.033, .047, .016, .1][i % 4];
      const result = motion.step(p, { x: 0, z: -1 }, 0, true, [], dt, regions.town.navigation);
      animator.update(dt, result.distance);
    }
    const stopped = { ...p }, stride = animator.stride;
    for (let i = 0; i < 40; i++) {
      const dt = [.031, .052, .015, .1][i % 4];
      const result = motion.step(p, { x: 0, z: -1 }, 0, true, [], dt, regions.town.navigation);
      animator.update(dt, result.distance);
      expect(result.distance).toBe(0); expect(p).toEqual(stopped);
    }
    expect(p.z).toBeCloseTo(-5.55, 7); expect(animator.stride).toBe(stride);
  });
  it('manual intent cancels a route; a blocked route never reports arrival', () => {
    const motion = new MovementController(), p = { x: 0, z: 0 }, path = [{ x: 10, z: 0 }];
    motion.step(p, { x: 0, z: -1 }, 0, true, path, .1, open); expect(path).toEqual([]); expect(p.x).toBe(0);
    const blocked = { ...open, obstacles: [{ x: 1, z: 0, width: .5, depth: 4 }] }, route = [{ x: 3, z: 0 }];
    let arrivals = 0;
    for (let i = 0; i < 30; i++) if (motion.step(p, { x: 0, z: 0 }, 0, true, route, .1, blocked).arrived) arrivals++;
    expect(arrivals).toBe(0); expect(p.x).toBeLessThan(.31);
  });
  it('animation distinguishes actual run/walk/idle/interaction and stationary NPCs never run', () => {
    const a = new CharacterAnimator(createCharacter('explorer')), npc = new CharacterAnimator(createCharacter('nara'));
    for (let i = 0; i < 120; i++) { a.update(1/60, 8/60); npc.update(1/60, 0); }
    expect(a.state).toBe('run'); expect(npc.state).toBe('idle');
    expect(a.rig.torso.rotation.x).toBeGreaterThan(.1);
    a.update(.1, .52); expect(a.state).toBe('walk');
    const stride = a.stride;
    for (let i = 0; i < 20; i++) a.update(.05, 0);
    expect(a.state).toBe('idle'); expect(a.stride).toBe(stride);
    expect(Math.abs(a.rig.leftLeg.hip.rotation.x)).toBeLessThan(.001);
    a.setPose('read'); a.update(.1, 0); expect(a.state).toBe('interact');
    const reduced = new CharacterAnimator(createCharacter('explorer')); reduced.update(.1, .8, true);
    expect(reduced.state).toBe('run'); expect(reduced.stride).toBe(0); expect(reduced.rig.torso.rotation.x).toBe(0);
  });
});
