import { rimbaClosedC, rimbaPlaces } from '../data/rimbaRegion';
import { rimbaReservations, rimbaSpawn, rimbaTrails, rimbaZones } from '../data/rimbaTrails';
import type { Point } from '../engine/navigation';

export function rimbaMapSvg(position: Point = rimbaSpawn, cOpen = false) {
  const markers = rimbaPlaces.filter(p => !rimbaZones.some(zone => zone.id === p.id));
  return `<svg id="town-map" viewBox="-98 -139 124 183" role="img" aria-label="Peta putaran W03 Rimba dan Gambut">
    <rect x="-98" y="-139" width="124" height="183" rx="3" fill="#dbe5cc"/>
    ${rimbaTrails.map(t => `<rect x="${t.minX}" y="${t.minZ}" width="${t.maxX - t.minX}" height="${t.maxZ - t.minZ}" fill="${t.surface === 'boards' ? '#ab8b63' : '#eaddb9'}"/>`).join('')}
    ${rimbaReservations.map(({ minX, minZ, maxX, maxZ }) =>
      `<rect x="${minX}" y="${minZ}" width="${maxX - minX}" height="${maxZ - minZ}" rx="1" fill="#c69a79" stroke="#805941" stroke-width=".65" stroke-dasharray="1.6 1.1"/>`).join('')}
    ${cOpen ? '' : `<rect x="${rimbaClosedC.x - rimbaClosedC.width / 2}" y="${rimbaClosedC.z - rimbaClosedC.depth / 2}" width="${rimbaClosedC.width}" height="${rimbaClosedC.depth}" fill="#c69a79" stroke="#805941" stroke-width=".65" stroke-dasharray="1.6 1.1"/>`}
    ${markers.map(p => `<circle cx="${p.x}" cy="${p.z}" r="1.1" fill="${p.color}" stroke="#fff9e6" stroke-width=".35"/>`).join('')}
    ${rimbaZones.map((p, index) => {
      const side = index < 2 ? 1 : index > 2 ? -1 : 0;
      const x = p.x + side * 6, z = p.z + (side ? -3 : 10);
      return `<circle cx="${p.x}" cy="${p.z}" r="2.5" fill="${p.color}" stroke="#fff9e6" stroke-width=".65"/>
        <text x="${x}" y="${z}" text-anchor="${side === 1 ? 'start' : side === -1 ? 'end' : 'middle'}" font-size="4.5" font-weight="700" fill="#244b42">${p.short}</text>`;
    }).join('')}
    <path d="M17-125v-7m-2.5 3 2.5-3 2.5 3" fill="none" stroke="#244b42" stroke-width=".8"/>
    <text x="17" y="-121" text-anchor="middle" font-size="3.5" fill="#244b42">U</text>
    <circle cx="${position.x}" cy="${position.z}" r="1.9" fill="#163d34" stroke="#fff" stroke-width=".7"/>
  </svg>`;
}
