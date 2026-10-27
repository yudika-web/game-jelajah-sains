import type {Place} from './content';
export const pontoonPlaces:Place[]=[
 {id:'springBench',name:'Bak gaya apung dan neraca pegas',short:'Neraca pegas',action:'Uji neraca',x:-6,z:24,color:'#5f9ca4'},
 {id:'pontoonRack',name:'Rak modul dan kebutuhan pengiriman',short:'Modul ponton',action:'Periksa / pilih',x:-2,z:29,color:'#b69c62'},
 {id:'pontoonDock',name:'Dermaga uji dan alat penarik virtual',short:'Ponton awal',action:'Uji / kirim',x:2,z:24,color:'#628eaa'},
 {id:'pontoonReceiver',name:'Dermaga penerima perlengkapan',short:'Ponton penerima',action:'Bongkar',x:2,z:34,color:'#6b9b75'},
 {id:'pontoonBook',name:'Buku gaya apung dan neraca',short:'Buku gaya apung',action:'Baca',x:-11,z:23,color:'#6d9b91'},
 {id:'pontoonNotes',name:'Catatan kebutuhan ponton',short:'Catatan ponton',action:'Baca',x:-10,z:31,color:'#af9160'},
];
export const pontoonObstacles=pontoonPlaces.filter(p=>!['pontoonDock','pontoonReceiver'].includes(p.id)).map(p=>({x:p.x,z:p.z-.8,width:p.id==='springBench'?3:2,depth:p.id==='springBench'?2:1}));
export const pontoonRoute={start:{x:7,z:24},end:{x:7,z:34},gateZ:29,lengthM:1.2} as const;
