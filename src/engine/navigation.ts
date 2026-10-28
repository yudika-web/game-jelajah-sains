import {marketObstacles} from '../data/marketRegion';
import { characterConfig } from './characterConfig';
export interface Point { x: number; z: number; }
export interface Obstacle { x: number; z: number; width: number; depth: number; }
export const obstacles: Obstacle[] = [
  ...marketObstacles,
  {x:-2.8,z:-6,width:.3,depth:.3},{x:.8,z:-6,width:.3,depth:.3}, // W04 gate

  {x:6.2,z:15,width:.3,depth:.3}, {x:9.8,z:15,width:.3,depth:.3}, // W03 gate pillars
  { x: -9, z: -9, width: 8, depth: 6 },
  { x: -12, z: 6, width: 5, depth: 5 },
  { x: -5, z: 13, width: 5, depth: 4 },
  { x: 2, z: -13, width: 4, depth: 4 },
  { x: 14, z: 0, width: 4, depth: 40 },
];
export const bounds = { minX: -18, maxX: 11, minZ: -17, maxZ: 17 };
export interface NavigationArea { bounds: typeof bounds; obstacles: Obstacle[]; radius?: number; }
export const townNavigation: NavigationArea = { bounds, obstacles };
export function walkable(p: Point, area: NavigationArea = townNavigation) {
  const { bounds, obstacles } = area;
  return p.x >= bounds.minX && p.x <= bounds.maxX && p.z >= bounds.minZ && p.z <= bounds.maxZ &&
    !obstacles.some(o => Math.abs(p.x - o.x) < o.width / 2 + (area.radius ?? characterConfig.navigationRadius) && Math.abs(p.z - o.z) < o.depth / 2 + (area.radius ?? characterConfig.navigationRadius));
}
/** Sweep one axis to the first expanded wall, including very thin blockers. */
export function sweepAxis(p: Point, axis: 'x' | 'z', delta: number, area: NavigationArea) {
  const horizontal = axis === 'x', start = p[axis], other = horizontal ? p.z : p.x;
  let target = Math.max(horizontal ? area.bounds.minX : area.bounds.minZ,
    Math.min(horizontal ? area.bounds.maxX : area.bounds.maxZ, start + delta));
  for (const o of area.obstacles) {
    const center = horizontal ? o.x : o.z, otherCenter = horizontal ? o.z : o.x;
    const half = (horizontal ? o.width : o.depth) / 2 + (area.radius ?? characterConfig.navigationRadius);
    const otherHalf = (horizontal ? o.depth : o.width) / 2 + (area.radius ?? characterConfig.navigationRadius);
    if (Math.abs(other - otherCenter) >= otherHalf) continue;
    // A tiny outward epsilon keeps floating point rounding on the walkable side.
    if (delta > 0 && start <= center - half) target = Math.min(target, center - half - 1e-8);
    if (delta < 0 && start >= center + half) target = Math.max(target, center + half + 1e-8);
  }
  return target;
}
export function findPath(start: Point, end: Point, area: NavigationArea = townNavigation): Point[] {
  const allowed = (p: Point) => walkable(p, area);
  if (!allowed(start) || !allowed(end)) return [];
  const segmentClear = (from: Point, to: Point) => {
    const steps = Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / .1);
    for (let i = 0; i <= steps; i++) {
      const t = steps ? i / steps : 0;
      if (!allowed({ x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t })) return false;
    }
    return true;
  };
  // A player against a wall can be on walkable ground whose rounded cell is blocked.
  const cell = (p: Point) => {
    const candidates: Point[] = [];
    for (let x = Math.floor(p.x) - 1; x <= Math.ceil(p.x) + 1; x++)
      for (let z = Math.floor(p.z) - 1; z <= Math.ceil(p.z) + 1; z++) {
        const c = { x, z }; if (allowed(c) && segmentClear(p, c)) candidates.push(c);
      }
    return candidates.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  };
  const a = cell(start), b = cell(end);
  if (!a || !b) return [];
  const key = (p: Point) => `${p.x},${p.z}`;
  const queue: Point[] = [a];
  const visited = new Map<string, Point | null>([[key(a), null]]);
  // Small bounded navigation grid: breadth-first avoids buildings and river.
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (key(current) === key(b)) {
      const path: Point[] = [];
      let p: Point | null = current;
      while (p && key(p) !== key(a)) { path.unshift(p); p = visited.get(key(p)) ?? null; }
      if (Math.hypot(start.x - a.x, start.z - a.z) > .01) path.unshift(a);
      path.push({ ...end });
      return path;
    }
    for (const d of [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }]) {
      const n = { x: current.x + d.x, z: current.z + d.z };
      if (allowed(n) && !visited.has(key(n))) { visited.set(key(n), current); queue.push(n); }
    }
  }
  return [];
}
