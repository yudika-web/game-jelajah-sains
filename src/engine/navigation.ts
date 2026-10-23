export interface Point { x: number; z: number; }
export interface Obstacle { x: number; z: number; width: number; depth: number; }
export const obstacles: Obstacle[] = [
  { x: -9, z: -9, width: 8, depth: 6 },
  { x: -12, z: 6, width: 5, depth: 5 },
  { x: -5, z: 13, width: 5, depth: 4 },
  { x: 2, z: -13, width: 4, depth: 4 },
  { x: 14, z: 0, width: 4, depth: 40 },
];
export const bounds = { minX: -18, maxX: 11, minZ: -17, maxZ: 17 };
export function walkable(p: Point) {
  return p.x >= bounds.minX && p.x <= bounds.maxX && p.z >= bounds.minZ && p.z <= bounds.maxZ &&
    !obstacles.some(o => Math.abs(p.x - o.x) < o.width / 2 + 0.45 && Math.abs(p.z - o.z) < o.depth / 2 + 0.45);
}
export function findPath(start: Point, end: Point): Point[] {
  const a = { x: Math.round(start.x), z: Math.round(start.z) };
  const b = { x: Math.round(end.x), z: Math.round(end.z) };
  if (!walkable(a) || !walkable(b)) return [];
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
      path.push({ ...end });
      return path;
    }
    for (const d of [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }]) {
      const n = { x: current.x + d.x, z: current.z + d.z };
      if (walkable(n) && !visited.has(key(n))) { visited.set(key(n), current); queue.push(n); }
    }
  }
  return [];
}
