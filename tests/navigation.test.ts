import { it, expect } from 'vitest';
import { findPath, walkable } from '../src/engine/navigation';
import { places } from '../src/data/content';

it('finds continuous safe routes between every pair of mission sites', () => {
  for (const a of [{ x: -1, z: 6 }, ...places.filter(p=>p.id!=='cosmeticShop')]) for (const b of places.filter(p=>p.id!=='cosmeticShop')) {
    const path = findPath(a, b);
    expect(path.length, `route to ${b.id}`).toBeGreaterThan(0);
    let prev = a;
    for (const point of path) {
      expect(walkable(point)).toBe(true);
      expect(Math.hypot(point.x - prev.x, point.z - prev.z)).toBeLessThanOrEqual(1.01);
      prev = point;
    }
  }
});
it('rejects destinations in the river, buildings, and outside the town', () => {
  for (const p of [{ x: 14, z: 0 }, { x: -9, z: -9 }, { x: 99, z: 99 }]) {
    expect(walkable(p)).toBe(false);
    expect(findPath({ x: 0, z: 0 }, p)).toEqual([]);
  }
});
it('reaches the interaction approach in front of every object without overlapping it', () => {
  for (const a of places) for (const b of places) {
    const approach = { x: b.x, z: b.z + 1.4 };
    const path = findPath({ x: a.x, z: a.z + 1.4 }, approach);
    expect(path.length).toBeGreaterThan(0);
    expect(path.every(point => walkable(point))).toBe(true);
    expect(path.at(-1)).toEqual(approach);
    expect(Math.hypot(approach.x - b.x, approach.z - b.z)).toBeCloseTo(1.4);
  }
});
