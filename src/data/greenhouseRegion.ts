import type { Place, PlaceId } from './content';

export const greenhousePlaces = [
  { id: 'heatBook', name: 'Buku suhu dan kalor', short: 'Buku suhu', action: 'Baca', x: -9, z: -2.2, color: '#477595' },
  { id: 'heatNotes', name: 'Catatan kebutuhan rumah semai', short: 'Catatan rumah semai', action: 'Baca', x: -12, z: -3.8, color: '#a37648' },
  { id: 'heatMeter', name: 'Termometer digital', short: 'Termometer', action: 'Ambil / periksa', x: -13, z: -.3, color: '#af7825' },
  { id: 'heatOutside', name: 'Titik sensor luar rumah semai', short: 'Sensor luar', action: 'Ukur', x: -5.9, z: -7.8, color: '#3c828b' },
  { id: 'heatInside', name: 'Titik sensor dalam rumah semai', short: 'Sensor dalam', action: 'Ukur / uji', x: -10.7, z: -6.04, color: '#396e80' },
  { id: 'heatShade', name: 'Rak modul peneduh', short: 'Rak peneduh', action: 'Pasang / lepas', x: -14.05, z: -6.35, color: '#6b7e3b' },
  { id: 'heatVent', name: 'Engsel dan pengunci ventilasi', short: 'Ventilasi', action: 'Buka / tutup', x: -8.1, z: -6.04, color: '#478272' },
] as const satisfies readonly Place[];

export type GreenhousePlace = typeof greenhousePlaces[number]['id'];
export function isGreenhousePlace(id: PlaceId): id is GreenhousePlace {
  return greenhousePlaces.some(place => place.id === id);
}

export const greenhouseObstacles = [
  ...greenhousePlaces.slice(0, 3).map(p => ({ x: p.x, z: p.z - .45, width: 1.45, depth: .65 })),
  { x: -14.05, z: -6.8, width: 1.4, depth: .7 },
  { x: -5.9, z: -8.25, width: .5, depth: .45 },
];
