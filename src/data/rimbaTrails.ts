import type { Place, PlaceId } from './content';
import type { NavigationArea, Obstacle, Point } from '../engine/navigation';

export const rimbaBounds = { minX: -94, maxX: 19, minZ: -130, maxZ: 37 };
export const rimbaSpawn = { x: -81, z: 12 };
export const guardHut = { x: -86, z: 2, width: 6, depth: 4 };
export const researchHut = { x: 12.5, z: 12, width: 5, depth: 7 };
export const watchtower = { x: -41, z: -131, width: 6, depth: 6 };

type Surface = 'earth' | 'boards' | 'gravel' | 'yard';
function trail(minX: number, maxX: number, minZ: number, maxZ: number, surface: Surface) {
  return { minX, maxX, minZ, maxZ, surface };
}

export const rimbaTrails = [
  trail(-87, 4, 3, 13, 'earth'),      // Pos–Pondok
  trail(-87, -77, -123, 8, 'earth'),  // sisi barat
  trail(-87, 5, -128, -118, 'earth'), // sisi utara
  trail(-5, 5, -123, 8, 'earth'),     // sisi timur
  trail(-92, -70, -2, 18, 'gravel'),  // halaman pos
  trail(-18, 18, -14, 37, 'yard'),    // pondok, stasiun pijakan, dan penampung
  trail(-87, -77, -110, -39, 'boards'),
  trail(-82, -60, -82, -66, 'boards'), // ceruk pakis
  trail(-82, -67, -33, -22, 'gravel'), // ceruk akar
  trail(-48, -34, -128, -115, 'gravel'), // halaman di kaki menara
  trail(-5, 10, -84, -66, 'gravel'),  // tepi petak restorasi
  trail(0, 14, -42, -33, 'gravel'),   // ceruk pengamatan air
  trail(-32, -20, -13, 6, 'gravel'),  // ceruk pengamatan habitat
] as const;

export const rimbaZones = [
  { id: 'forestGuard', short: 'Pos Penjaga', x: -82, z: 7, color: '#a16a42',
    detail: 'Kenali jalur aman bersama Pak Damar. Gerbang ke Kota Sains berada di halaman ini.' },
  { id: 'forestBoardwalk', short: 'Jalur Papan', x: -82, z: -75, color: '#537e79',
    detail: 'Ikuti papan di atas tanah basah. Cabang berpagar menuju ceruk pakis dan pandangan ke lantai hutan.' },
  { id: 'forestTower', short: 'Menara Pandang', x: -41, z: -123, color: '#95643c',
    detail: 'Amati tajuk dari pelataran di kaki menara. Tangga menara masih ditutup.' },
  { id: 'forestRestoration', short: 'Lahan Restorasi', x: 0, z: -75, color: '#657c45',
    detail: 'Bandingkan petak bibit lokal dengan tanah terbuka dari tepi jalur. Petak tetap berpagar.' },
  { id: 'forestResearch', short: 'Pondok Riset', x: 0, z: 9, color: '#6e6b91',
    detail: 'Tandon, ember, bengkel, dan maket pijakan berada di halaman yang sama. Putar gerobak di ruang lapang dekat tandon.' },
] satisfies (Point & { id: PlaceId; short: string; color: string; detail: string })[];

export const rimbaZonePlaces: Place[] = rimbaZones.map(zone => ({
  ...zone, name: zone.short, action: 'Lihat zona',
}));

export const rimbaReservations = [
  { name: 'Pintas celah', minX: -77, maxX: -58, minZ: -55, maxZ: -46 },
  { name: 'Dorong peti', minX: -55, maxX: -34, minZ: -9, maxZ: 3 },
  { name: 'Lempar keranjang', minX: 10, maxX: 23, minZ: -81, maxZ: -69 },
] as const;

export interface TrailRail { x: number; z: number; length: number; axis: 'x' | 'z'; }

/** Partition the union of the trails so rails and collision share the same edge. */
function partitionTrails(bounds: NavigationArea['bounds']) {
  const xs = [...new Set([bounds.minX, bounds.maxX, ...rimbaTrails.flatMap(t => [t.minX, t.maxX])])].sort((a, b) => a - b);
  const zs = [...new Set([bounds.minZ, bounds.maxZ, ...rimbaTrails.flatMap(t => [t.minZ, t.maxZ])])].sort((a, b) => a - b);
  const open = zs.slice(0, -1).map(z => xs.slice(0, -1).map(x => rimbaTrails.some(t =>
    x >= t.minX && x < t.maxX && z >= t.minZ && z < t.maxZ)));
  const blockers: Obstacle[] = [];
  const rails: TrailRail[] = [];
  const isOpen = (i: number, j: number) => open[j]?.[i] ?? false;

  // Coalesce consecutive cells so pathfinding checks strips rather than every grid cell.
  for (let j = 0; j < open.length; j++) {
    const z = (zs[j] + zs[j + 1]) / 2, depth = zs[j + 1] - zs[j];
    for (let i = 0; i < open[j].length;) {
      const first = i;
      const allowed = isOpen(i, j);
      while (i < open[j].length && isOpen(i, j) === allowed) i++;
      if (!allowed) blockers.push({ x: (xs[first] + xs[i]) / 2, z, width: xs[i] - xs[first], depth });
    }
  }
  for (let j = 0; j < zs.length; j++) {
    for (let i = 0; i < xs.length - 1;) {
      const first = i;
      while (i < xs.length - 1 && isOpen(i, j) !== isOpen(i, j - 1)) i++;
      if (first !== i) rails.push({ x: (xs[first] + xs[i]) / 2, z: zs[j], length: xs[i] - xs[first], axis: 'x' });
      else i++;
    }
  }
  for (let i = 0; i < xs.length; i++) {
    for (let j = 0; j < zs.length - 1;) {
      const first = j;
      while (j < zs.length - 1 && isOpen(i, j) !== isOpen(i - 1, j)) j++;
      if (first !== j) rails.push({ x: xs[i], z: (zs[first] + zs[j]) / 2, length: zs[j] - zs[first], axis: 'z' });
      else j++;
    }
  }
  return { blockers, rails };
}

const trailEdges = partitionTrails(rimbaBounds);
export const rimbaTrailBlockers = trailEdges.blockers;
export const rimbaRails = trailEdges.rails;
