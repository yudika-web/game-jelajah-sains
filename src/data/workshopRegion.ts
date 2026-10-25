import {electromagnetPlaces,electromagnetObstacles} from './electromagnetRegion';
import type { Place } from './content';
import type { NavigationArea } from '../engine/navigation';
export const workshopPlaces:Place[]=[
 ...electromagnetPlaces,
 {id:'bima',name:'Kak Bima · teknisi pos',short:'Kak Bima',action:'Bicara',x:-4,z:7,color:'#cc9650'},
 {id:'circuitBook',name:'Buku rangkaian sederhana',short:'Buku rangkaian',action:'Baca',x:-10,z:3,color:'#558694'},
 {id:'faultNotes',name:'Catatan gangguan pos',short:'Catatan gangguan',action:'Baca',x:-6,z:1,color:'#9f845b'},
 {id:'circuitSource',name:'Sumber DC virtual 3 V',short:'Sumber 3 V',action:'Periksa / lepas',x:-3,z:-3,color:'#b48d4c'},
 {id:'circuitSwitch',name:'Sakelar model',short:'Sakelar',action:'Periksa / ubah',x:3,z:-3,color:'#66868b'},
 {id:'circuitWire',name:'Jalur kabel S2–L1',short:'Kabel S2–L1',action:'Periksa kontinuitas',x:7,z:-3,color:'#9c7759'},
 {id:'circuitBoard',name:'Papan diagram dan terminal',short:'Diagram & terminal',action:'Pasang kabel',x:3,z:3,color:'#62857b'},
 {id:'inspectionBench',name:'Meja uji komponen virtual',short:'Meja pemeriksaan',action:'Uji lampu',x:-7,z:-6,color:'#8f7299'},
 {id:'componentRack',name:'Rak kabel pengganti',short:'Rak komponen',action:'Ambil kabel',x:-10,z:8,color:'#ac8651'},
 {id:'researchLamp',name:'Lampu pos riset 3 V',short:'Lampu pos riset',action:'Uji / amati',x:10,z:-7,color:'#d3b765'},
 {id:'workshopTownGate',name:'Gerbang menuju Kota Sains',short:'Ke Kota Sains',action:'Masuk Kota',x:0,z:16,color:'#758c75'},
];
export const workshopNavigation:NavigationArea={bounds:{minX:-17,maxX:33,minZ:-16,maxZ:18},obstacles:[
 {x:-11,z:-11,width:8,depth:5}, {x:10,z:-12,width:7,depth:5},
 ...electromagnetObstacles,
 ...workshopPlaces.filter(p=>p.id!=='workshopTownGate'&&!electromagnetPlaces.includes(p)).map(p=>p.id==='bima'?{x:p.x,z:p.z,width:.6,depth:.6}:p.id==='circuitBoard'?{x:p.x,z:1.9,width:5,depth:2.2}:{x:p.x,z:p.z-.7,width:1.5,depth:.65}),
 ...[[-15,13],[-15,-2],[15,12],[15,2]].map(([x,z])=>({x,z,width:.5,depth:.5})),
]};
