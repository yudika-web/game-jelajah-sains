import type { Place, PlaceId } from './content';
import type { Point } from '../engine/navigation';

export const cargoDepot = { x: -14.75, z: 18 };
export const cargoStart = { x: -13.40, z: 18 };
export const cargoFinish = { x: -5.16, z: 12.45 };
export const cargoBay = { x: -5.16, z: 11.35 };
export const cargoFoot = { depot: { x: -14.75, z: 19.65 }, bay: { x: -3.65, z: 11.7 } };
export const cargoBayRadius = .70;
export const cargoWidth = 1.25;
export const cargoPackageId = 'M04-RISET-001';
export const cargoRoutes = {
  A: {
    name: 'A · Jalur sempit', short: 'Pintas lewat jalur sempit',
    description: 'Lebih pendek. Jalan menyempit di tengah, dengan batas 2,0 m/s.',
    points: [cargoDepot, cargoStart, { x: -12.15, z: 18 }, { x: -9.55, z: 16.60 },
      { x: -7.20, z: 15.35 }, { x: -5.70, z: 14.38 }, { x: -5.16, z: 13.85 }, { x: -5.16, z: 13.10 }, cargoFinish, cargoBay],
  },
  B: {
    name: 'B · Jalur lapang', short: 'Memutar lewat jalan lapang',
    description: 'Lebih panjang. Bagian lapang mengizinkan hingga 5,4 m/s.',
    points: [cargoDepot, cargoStart, { x: -12.15, z: 18 }, { x: -10.7, z: 19.8 },
      { x: -8.5, z: 20.65 }, { x: -6.6, z: 20.65 }, { x: -5.15, z: 19.35 },
      { x: -5.25, z: 17.3 }, { x: -5.70, z: 14.38 }, { x: -5.16, z: 13.85 }, { x: -5.16, z: 13.10 }, cargoFinish, cargoBay],
  },
} as const satisfies Record<string, { name: string; short: string; description: string; points: readonly Point[] }>;
export type CargoRoute = keyof typeof cargoRoutes;
export const cargoRouteIds = ['A', 'B'] as const;
export const cargoPlaces = [
  { id: 'cargoBook', name: 'Buku gerak dan gaya', short: 'Buku gerak', action: 'Baca', x: -11.9, z: 14, color: '#4b7c9b' },
  { id: 'cargoNotes', name: 'Catatan pengiriman dermaga', short: 'Catatan kiriman', action: 'Periksa', x: -8.6, z: 13.85, color: '#a27b46' },
  { id: 'cargoDepot', name: 'Pangkalan kargo listrik', short: 'Pangkalan kargo', action: 'Siapkan kendaraan', ...cargoDepot, color: '#aa7043' },
] as const satisfies readonly Place[];

export type CargoPlace = typeof cargoPlaces[number]['id'];
export const isCargoPlace = (id: PlaceId): id is CargoPlace => cargoPlaces.some(p => p.id === id);
export const cargoObstacles = cargoPlaces.slice(0, 2).map(p => ({ x: p.x, z: p.z - .55, width: 1.45, depth: .65 }));

export const cargoDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);

function segmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(p.x - a.x - dx * t, p.z - a.z - dz * t);
}

export function cargoLane(route: CargoRoute, p: Point) {
  const points = cargoRoutes[route].points;
  let nearest = 1;
  let distance = Infinity;
  for (let i = 1; i < points.length; i++) {
    const d = segmentDistance(p, points[i - 1], points[i]);
    if (d < distance) { nearest = i; distance = d; }
  }
  const terminal = nearest >= points.length - 2;
  const narrow = route === 'A' && nearest >= 3 && !terminal;
  const speed = route === 'A' || terminal ? 2 : Math.min(5.4,
    2 + Math.max(0, cargoDistance(p, cargoDepot) - 2.6) * .72,
    2 + Math.max(0, cargoDistance(p, cargoFinish) - 1.2) * .52);
  return { distance, width: narrow ? .68 : 1.05, speed };
}

export function routeLength(route: CargoRoute) {
  const points = cargoRoutes[route].points;
  return (points as readonly Point[]).slice(2, -1).reduce((sum, p, i) => sum + cargoDistance(p, points[i + 1]), 0);
}
