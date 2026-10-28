import {spacePlaces,spaceNavigation} from './spaceRegion';
import {geoPlaces,geoNavigation} from './geoparkRegion';
import {coastalPlaces,coastalNavigation} from './coastalRegion';
import {workshopPlaces,workshopNavigation} from './workshopRegion';
import { riverPlaces, riverNavigation } from './riverRegion';
import { rimbaPlaces, rimbaNavigation } from './rimbaRegion';
import { places, type Place, type PlaceId } from './content';
import { obstacles, bounds, type NavigationArea } from '../engine/navigation';
import type { RegionId } from '../game/gameState';
export const gardenPlaces: Place[] = [
  { id: 'sari', name: 'Bu Sari · pendamping kebun', short: 'Bu Sari', action: 'Bicara', x: -5, z: 7, color: '#a08448' },
  { id: 'gardenBook', name: 'Buku kebutuhan tumbuhan', short: 'Buku tumbuhan', action: 'Baca', x: -8, z: 1, color: '#568c65' },
  { id: 'fairNotes', name: 'Catatan percobaan adil', short: 'Catatan Bu Sari', action: 'Baca', x: -4, z: 4, color: '#bc8d4e' },
  { id: 'seedStore', name: 'Penyimpanan benih dan alat', short: 'Benih & alat', action: 'Ambil', x: 5, z: 6, color: '#b28452' },
  { id: 'plotA', name: 'Kelompok A · 100 mL per tanaman', short: 'Petak A', action: 'Tanam / rawat', x: -5, z: -1, color: '#387d8b' },
  { id: 'plotB', name: 'Kelompok B · 50 mL per tanaman', short: 'Petak B', action: 'Tanam / rawat', x: 5, z: -1, color: '#ad783b' },
  { id: 'waterTank', name: 'Tandon air percobaan', short: 'Tandon air', action: 'Isi air', x: 9, z: 2, color: '#539eab' },
  { id: 'recordTable', name: 'Meja pencatatan hasil', short: 'Meja hasil', action: 'Catat hasil', x: 0, z: -8, color: '#7e719a' },
  { id: 'townGate', name: 'Gerbang menuju Kota Sains', short: 'Ke Kota Sains', action: 'Masuk Kota', x: 0, z: 16, color: '#60866b' },
];
export const gardenNavigation: NavigationArea = {
  bounds: { minX: -16, maxX: 16, minZ: -15, maxZ: 18 },
  obstacles: [
    { x: -10, z: 9, width: 6, depth: 5 }, { x: -10, z: -9, width: 6, depth: 5 },
    { x: 10, z: 10, width: 5, depth: 4 },
    { x: -5, z: -3, width: 4.5, depth: 2.8 }, { x: 5, z: -3, width: 4.5, depth: 2.8 },
    { x: 9, z: 1, width: 2.6, depth: 2.6 },
  ],
};
export const regions = {
  space:{name:'Antariksa · Simulasi',code:'W08',places:spacePlaces,navigation:spaceNavigation,spawn:{x:0,z:14},gate:'spaceReturn' as PlaceId},
  geopark:{name:'Geopark',code:'W07',places:geoPlaces,navigation:geoNavigation(),spawn:{x:0,z:15},gate:'geoReturn' as PlaceId},
  coast:{name:'Pesisir dan Laut',code:'W05',places:coastalPlaces,navigation:coastalNavigation,spawn:{x:-3,z:12},gate:'coastReturn' as PlaceId},
  workshop:{name:'Bengkel dan Energi',code:'W06',places:workshopPlaces,navigation:workshopNavigation,spawn:{x:0,z:8},gate:'workshopTownGate' as PlaceId},
  river:{name:'Sungai dan Danau',code:'W04',places:riverPlaces,navigation:riverNavigation,spawn:{x:-2,z:9},gate:'riverTownGate' as PlaceId},
  rimba: {name:'Rimba dan Gambut',code:'W03',places:rimbaPlaces,navigation:rimbaNavigation(),spawn:{x:0,z:9},gate:'forestTownGate' as PlaceId},
  town: { name: 'Kota Sains', code: 'W01', places, navigation: { bounds, obstacles }, spawn: { x: -1, z: 6 }, gate: 'gardenGate' as PlaceId },
  garden: { name: 'Kebun Kehidupan', code: 'W02', places: gardenPlaces, navigation: gardenNavigation, spawn: { x: 0, z: 5.5 }, gate: 'townGate' as PlaceId },
};
export const regionOf = (id: PlaceId): RegionId => spacePlaces.some(p=>p.id===id)?'space':geoPlaces.some(p=>p.id===id)?'geopark':coastalPlaces.some(p=>p.id===id)?'coast':workshopPlaces.some(p=>p.id===id)?'workshop':riverPlaces.some(p=>p.id===id)?'river':rimbaPlaces.some(p=>p.id===id)?'rimba':gardenPlaces.some(p => p.id === id) ? 'garden' : 'town';
export const allPlaces = [...spacePlaces,...geoPlaces,...coastalPlaces, ...places, ...gardenPlaces, ...rimbaPlaces, ...riverPlaces, ...workshopPlaces];
