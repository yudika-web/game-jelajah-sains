import {irrigationPlaces,riverWaterObstacles} from './boatRegion';
import {poolPlaces,poolLandObstacles} from './poolRegion';
import type { Place } from './content';
import type { NavigationArea } from '../engine/navigation';
export const riverPlaces: Place[] = [
  ...poolPlaces,
  ...irrigationPlaces,
  {id:'lestari',name:'Kak Lestari · peneliti perairan',short:'Kak Lestari',action:'Bicara',x:-6,z:9,color:'#438e91'},
  {id:'rodRack',name:'Rak alat pancing pinjaman',short:'Alat pancing',action:'Pinjam',x:-2,z:8,color:'#b9975e'},
  {id:'fishBook',name:'Buku pengamatan ikan',short:'Buku pengamatan',action:'Baca',x:-10,z:3,color:'#508e95'},
  {id:'samplingNotes',name:'Catatan prosedur sampling',short:'Prosedur sampling',action:'Baca',x:-5,z:1,color:'#a48651'},
  {id:'fishingA',name:'Titik A · tepian bervegetasi',short:'A · tepian',action:'Memancing',x:1,z:5,color:'#54845a'},
  {id:'fishingB',name:'Titik B · dermaga',short:'B · dermaga',action:'Memancing',x:7,z:-7,color:'#668bba'},
  {id:'fishTable',name:'Meja pengukuran dan pencatatan',short:'Meja catatan',action:'Lihat catatan',x:-6,z:-6,color:'#a57a52'},
  {id:'fishResults',name:'Papan hasil dan keterbatasan sampel',short:'Papan hasil',action:'Bandingkan',x:-10,z:-1,color:'#8b7b9e'},
  {id:'riverTownGate',name:'Gerbang dermaga ke Kota Sains',short:'Kembali ke Kota',action:'Masuk Kota',x:-2,z:15,color:'#658c7f'},
];
/** Water begins at x=3; only the pier (-9 < z < -5) is walkable beyond it. */
export const riverNavigation: NavigationArea = { bounds:{minX:-17,maxX:24,minZ:-16,maxZ:18},obstacles:[
  ...poolLandObstacles,
  ...riverWaterObstacles,
  ...irrigationPlaces.filter(p=>!['boatStart','boatObservation'].includes(p.id)).map(p=>({x:p.x,z:p.z-.7,width:1.2,depth:.5})),
  {x:-11,z:11,width:4,depth:3}, {x:-6,z:9,width:.6,depth:.6},
  {x:-2,z:7.4,width:1.8,depth:.5},
  ...riverPlaces.filter(p=>['fishBook','samplingNotes','fishResults','fishTable'].includes(p.id)).map(p=>({x:p.x,z:p.z-.7,width:1.6,depth:.6})),
  ...[[-15,6],[-14,-7],[-2,-12],[-15,16]].map(([x,z])=>({x,z,width:.6,depth:.6})),
  ...[-3.8,-.2].map(x=>({x,z:15,width:.25,depth:.25})),
] };
export const fishingPositions = { A:{x:1,z:5}, B:{x:7,z:-7} } as const;
