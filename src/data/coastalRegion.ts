import {pressurePlaces} from './pressureRegion';
import type {Place} from './content';
import type {NavigationArea} from '../engine/navigation';
import {boatConfig,type BoatDocks} from './boatRegion';
export const coastalPlaces:Place[]=[
 ...pressurePlaces,
 {id:'coastReturn',name:'Dermaga keberangkatan ke Sungai',short:'Ke Sungai',action:'Berangkat',x:-3,z:14,color:'#5b99a3'},
 {id:'coastLestari',name:'Kak Lestari · pos pesisir',short:'Kak Lestari',action:'Bicara',x:-7,z:8,color:'#518f94'},
 {id:'coastBook',name:'Buku Energi dalam Ekosistem',short:'Buku ekosistem',action:'Baca',x:-11,z:3,color:'#638b61'},
 {id:'coastNotes',name:'Catatan Siapa Memakan Siapa?',short:'Catatan makanan',action:'Baca',x:-6,z:1,color:'#b08a4b'},
 {id:'coastLimits',name:'Papan Sampel Pengamatan dan Batas Model',short:'Batas model',action:'Baca',x:-13,z:-7,color:'#9a869e'},
 {id:'planktonScope',name:'Alat pembesaran plankton',short:'Plankton · diperbesar',action:'Amati',x:-3,z:-1,color:'#77a981'},
 {id:'underwaterWindow',name:'Jendela pengamatan bawah air',short:'Jendela bawah air',action:'Amati bawah air',x:0,z:-9,color:'#63aeb5'},
 {id:'coastFishPoint',name:'Titik pengamatan ikan predator',short:'Titik ikan predator',action:'Amati',x:21,z:-9,color:'#bb8580'},
 {id:'foodwebBoard',name:'Papan Jaring Kehidupan Pesisir',short:'Jaring makanan',action:'Susun jaring',x:-9,z:-11,color:'#7b9974'},
 {id:'coastBoatStart',name:'Dermaga pantai · perahu lokal',short:'Perahu · pantai',action:'Perahu',x:1,z:10,color:'#57999f'},
 {id:'coastBoatObservation',name:'Dermaga titik ikan',short:'Perahu · titik ikan',action:'Perahu',x:20,z:-6,color:'#57999f'},
];
export const coastalNavigation:NavigationArea={bounds:{minX:-18,maxX:25,minZ:-17,maxZ:18},obstacles:[
 {x:10,z:.5,width:16,depth:35},
 {x:-11,z:10,width:5,depth:4},
 {x:-7,z:8,width:.6,depth:.6},
 ...coastalPlaces.filter(p=>['coastBook','coastNotes','coastLimits','planktonScope','underwaterWindow','coastFishPoint','foodwebBoard'].includes(p.id)).map(p=>({x:p.x,z:p.z-.7,width:1.4,depth:.6})),
 ...pressurePlaces.map(p=>({x:p.x,z:p.z-.7,width:1.4,depth:.6})),
 ...[[-15,-2],[-16,-13],[-5,-14]].map(([x,z])=>({x,z,width:.7,depth:.7})),
]};
export const coastalBoatNavigation:NavigationArea={radius:boatConfig.radius,bounds:{minX:3.8,maxX:16.2,minZ:-13,maxZ:14},obstacles:[{x:10,z:2,width:.6,depth:.6}]};
export const coastalDocks:BoatDocks={
 research:{name:'Dermaga Pantai',place:'coastBoatStart',water:{x:5,z:10},land:{x:1,z:10},yaw:-Math.PI/2},
 irrigation:{name:'Dermaga Titik Ikan',place:'coastBoatObservation',water:{x:15,z:-6},land:{x:20,z:-6},yaw:Math.PI/2},
};
