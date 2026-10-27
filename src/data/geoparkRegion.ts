import type {Place} from './content';
import type {NavigationArea,Point} from '../engine/navigation';
export const geoMuster={x:0,z:-19};
export const geoPlaces:Place[]=[
 {id:'raka',name:'Kak Raka · pemandu Geopark',short:'Kak Raka',action:'Bicara',x:-4,z:12,color:'#4f7f9d'},
 {id:'geoReturn',name:'Terminal kembali ke Bengkel',short:'Kembali ke Bengkel',action:'Berangkat',x:5,z:16,color:'#7a8e91'},
 {id:'geoBook',name:'Buku lapisan Bumi',short:'Buku lapisan',action:'Baca',x:-11,z:11,color:'#ad8760'},
 {id:'geoNotes',name:'Catatan gerak lempeng',short:'Catatan lempeng',action:'Baca',x:10,z:9,color:'#69968c'},
 {id:'geoLandscape',name:'Papan bentang alam dan model',short:'Papan bentang alam',action:'Baca',x:11,z:2,color:'#8e9b73'},
 {id:'geoEarth',name:'Stasiun penampang Bumi',short:'Penampang Bumi',action:'Amati / susun',x:-10,z:3,color:'#ca9c59'},
 {id:'geoDivergent',name:'Model meja · Divergen',short:'Model Divergen',action:'Jalankan model',x:-10,z:-5,color:'#3b9095'},
 {id:'geoConvergent',name:'Model meja · Konvergen',short:'Model Konvergen',action:'Jalankan model',x:0,z:-5,color:'#ae8250'},
 {id:'geoTransform',name:'Model meja · Transform',short:'Model Transform',action:'Jalankan model',x:10,z:-5,color:'#857c9d'},
 {id:'geoMap',name:'Papan peta situasi latihan',short:'Peta situasi',action:'Baca / pilih jalur',x:0,z:2,color:'#5c8e79'},
 {id:'geoSignA',name:'Penanda A · bangunan model rusak',short:'Periksa jalur A',action:'Periksa kondisi',x:-8,z:-10,color:'#b78557'},
 {id:'geoSignB',name:'Penanda B · jalur terbuka',short:'Periksa jalur B',action:'Periksa kondisi',x:0,z:-10,color:'#508e7b'},
 {id:'geoSignC',name:'Penanda C · potensi jatuhan batu',short:'Periksa jalur C',action:'Periksa kondisi',x:8,z:-10,color:'#b78557'},
 {id:'geoMuster',name:'Titik kumpul · konfirmasi kepada pemandu',short:'Titik kumpul',action:'Konfirmasi tiba',...geoMuster,color:'#4d9279'},
];
const base=[{x:-4,z:12,width:.6,depth:.6},...[[-16,6],[16,6],[-15,-8],[15,-8],[-16,19],[16,19]].map(([x,z])=>({x,z,width:.3,depth:.3})),...[8,14].map(x=>({x,z:12,width:.17,depth:.17})),...Array.from({length:5},(_,i)=>({x:-16,z:-3-i*3,width:2,depth:2})),{x:-12,z:16,width:7,depth:4},{x:13,z:-16,width:5,depth:8},...geoPlaces.filter(p=>['geoEarth','geoDivergent','geoConvergent','geoTransform'].includes(p.id)).map(p=>({x:p.x,z:p.z-.8,width:4,depth:2})),...geoPlaces.filter(p=>['geoBook','geoNotes','geoLandscape','geoMap'].includes(p.id)).map(p=>({x:p.x,z:p.z-.6,width:1.6,depth:.6}))];
// Once the exercise starts, the entire hazardous side strips are fenced. Only B remains open.
export const geoClosures=[{x:-10.5,z:-17,width:16,depth:10},{x:10.5,z:-17,width:16,depth:10}];
export function geoNavigation(active=false):NavigationArea{return{bounds:{minX:-18,maxX:18,minZ:-22,maxZ:20},obstacles:active?[...base,...geoClosures]:base};}
export const atGeoMuster=(p:Point)=>Math.hypot(p.x-geoMuster.x,p.z-geoMuster.z)<=1.8;
