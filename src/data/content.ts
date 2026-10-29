import {marketPlaces} from './marketRegion';
export type PlaceId = 'divePrep' | 'diveLocker' | 'diveDock' | 'diveFish' | 'diveGrass' | 'diveRocks' | 'diveLight' | 'divePier' | 'prepBrief' | 'shuttleDoor' | 'prepExit' | 'spaceLocker' | 'spaceAirlock' | 'evaSolar' | 'evaAntenna' | 'evaWindow' | 'evaModule' | 'evaAnchor' | 'wardrobe' | 'marketPhase' | 'marketDensity' | 'marketRack' | 'marketPack' | 'marketBook' | 'marketNotes' | 'observatory' | 'spaceReturn' | 'spaceNara' | 'spaceBook' | 'spaceNotes' | 'spaceRotation' | 'spaceRevolution' | 'spaceMoon' | 'spaceJournal' | 'geoTerminal' | 'geoReturn' | 'raka' | 'geoBook' | 'geoNotes' | 'geoLandscape' | 'geoEarth' | 'geoDivergent' | 'geoConvergent' | 'geoTransform' | 'geoMap' | 'geoSignA' | 'geoSignB' | 'geoSignC' | 'geoMuster' | 'springBench' | 'pontoonRack' | 'pontoonDock' | 'pontoonReceiver' | 'pontoonBook' | 'pontoonNotes' | 'solidBench' | 'solidRack' | 'solidForce' | 'solidBook' | 'solidNotes' | 'hydraulicBench' | 'hydraulicRack' | 'hydraulicLoad' | 'hydraulicBook' | 'hydraulicNotes' | 'rovControl' | 'rovLaunch' | 'pressureRack' | 'pressureBook' | 'pressureNotes' |  'riverCoastDock' | 'coastReturn' | 'coastLestari' | 'coastBook' | 'coastNotes' | 'coastLimits' | 'planktonScope' | 'underwaterWindow' | 'coastFishPoint' | 'foodwebBoard' | 'coastBoatStart' | 'coastBoatObservation' |  'solarArray' | 'windTurbine' | 'energyBattery' | 'energyLink' | 'energyTester' | 'energyService' | 'energyBook' | 'energyNotes' | 'materialBench' | 'magnetBook' | 'magnetNotes' | 'magnetRack' | 'coilStation' | 'miniCrane' | 'clipTray' | 'clipBin' | 'workshopGate' | 'workshopTownGate' | 'bima' | 'circuitBook' | 'faultNotes' | 'circuitSource' | 'circuitSwitch' | 'circuitWire' | 'circuitBoard' | 'inspectionBench' | 'componentRack' | 'researchLamp' | 'nara' | 'warga' | 'book' | 'rain' | 'sampleA' | 'sampleB' | 'barrier' | 'gardenGate' | 'sari' | 'gardenBook' | 'fairNotes' | 'seedStore' | 'plotA' | 'plotB' | 'waterTank' | 'recordTable' | 'townGate' | 'rimbaGate' | 'forestTownGate' | 'damar' | 'forestMap' | 'capacityBook' | 'supplyNotes' | 'forestSource' | 'bucketRack' | 'workshop' | 'receiverA' | 'receiverB' | 'receiverC' | 'habitatBoard' | 'riverGate' | 'riverTownGate' | 'lestari' | 'rodRack' | 'fishBook' | 'samplingNotes' | 'fishingA' | 'fishingB' | 'fishTable' | 'fishResults' | 'boatStart' | 'boatObservation' | 'flowBook' | 'irrigationNotes' | 'irrigationScreen' | 'cleaningRack' | 'P1' | 'P2' | 'P3' | 'poolRamp' | 'poolBuoy' | 'densityBook' | 'floatBench';
export interface Place {
  id: PlaceId;
  name: string;
  short: string;
  action: string;
  x: number;
  z: number;
  color: string;
}

export const places: Place[] = [
  {id:'wardrobe',name:'Lemari Penampilan · persiapan penjelajah',short:'Lemari Penampilan',action:'Ganti penampilan',x:-10.5,z:1,color:'#5a9294'},
  ...marketPlaces,
  {id:'observatory',name:'Observatorium Kota · simulasi Antariksa',short:'Observatorium / Antariksa',action:'Baca pengantar',x:2,z:-10,color:'#6c8fae'},
  {id:'workshopGate',name:'Gerbang jalan Bengkel dan Energi',short:'Ke Bengkel dan Energi',action:'Masuk Bengkel',x:-15,z:-6,color:'#bc9554'},
  {id:'riverGate',name:'Gerbang dermaga Sungai dan Danau',short:'Ke Sungai dan Danau',action:'Masuk Sungai',x:-1,z:-6,color:'#598f99'},
  { id:'rimbaGate',name:'Gerbang jalur penjaga hutan',short:'Ke Rimba dan Gambut',action:'Masuk Rimba',x:8,z:15,color:'#977946' },
  { id: 'gardenGate', name: 'Gerbang menuju Kebun Kehidupan', short: 'Ke Kebun Kehidupan', action: 'Masuk Kebun', x: -16, z: 0, color: '#67935c' },
  { id: 'nara', name: 'Bu Nara · mentor sains', short: 'Bu Nara', action: 'Bicara', x: -4, z: 3, color: '#8d67c8' },
  { id: 'warga', name: 'Pak Wira · warga kota', short: 'Pak Wira', action: 'Bicara', x: 3, z: 6, color: '#e9a251' },
  { id: 'book', name: 'Buku aliran permukaan', short: 'Buku Sains', action: 'Baca', x: -8, z: -3, color: '#527ebe' },
  { id: 'rain', name: 'Catatan hujan & peta lahan', short: 'Catatan hujan', action: 'Baca', x: 4, z: -4, color: '#b47a49' },
  { id: 'sampleA', name: 'Sampel A · dekat lahan terbuka', short: 'Sampel A', action: 'Ambil & ukur', x: 10, z: -1, color: '#c28643' },
  { id: 'sampleB', name: 'Sampel B · titik pembanding', short: 'Sampel B', action: 'Ambil & ukur', x: 10, z: 10, color: '#479ab0' },
  { id: 'barrier', name: 'Jalur limpasan · tempat uji', short: 'Tempat uji', action: 'Uji sedimen', x: 7, z: -10, color: '#64885a' },
];

export const cards = {
  book: {
    title: 'Ke mana air hujan mengalir?',
    text: 'Air hujan yang mengalir di atas permukaan tanah disebut aliran permukaan. Aliran ini dapat membawa partikel tanah ke sungai. Partikel yang tersuspensi membuat air tampak keruh. Kekeruhan saja tidak mengungkap semua zat di dalam air.',
    source: 'Kelas VII · Metode ilmiah · rancangan M01 · draf untuk telaah guru',
  },
  rain: {
    title: 'Catatan lapangan · setelah hujan',
    text: 'Hujan simulasi pukul 09.00. Lahan terbuka berada di dekat titik A; titik B berada di bagian pembanding dengan tepian bervegetasi. Ambil kedua sampel pada sesi pengamatan yang sama. Pada uji berikutnya, pertahankan kondisi hujan agar perbandingan adil.',
    source: 'Kota Sains · peta lahan & catatan hujan simulasi',
  },
};

export const conclusions = [
  { id: 'sediment', text: 'Sedimen dari limpasan berkontribusi pada kekeruhan dalam model. Data ini belum membuktikan air aman diminum.' },
  { id: 'drink', text: 'Air A sekarang lebih jernih, jadi sudah pasti aman diminum.' },
  { id: 'waste', text: 'Semua air keruh pasti disebabkan limbah pabrik.' },
] as const;
