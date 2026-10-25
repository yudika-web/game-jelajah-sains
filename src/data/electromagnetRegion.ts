import type {Place} from './content';
export const electromagnetPlaces:Place[]=[
 {id:'materialBench',name:'Meja pengamatan empat bahan',short:'Empat bahan',action:'Prediksi / amati',x:20,z:10,color:'#8f8d6a'},
 {id:'magnetBook',name:'Buku magnet',short:'Buku magnet',action:'Baca',x:16,z:6,color:'#698c89'},
 {id:'magnetNotes',name:'Catatan elektromagnet Kak Bima',short:'Catatan elektromagnet',action:'Baca',x:25,z:13,color:'#af894b'},
 {id:'magnetRack',name:'Rak komponen elektromagnet',short:'Komponen elektromagnet',action:'Rakit',x:20,z:3,color:'#b18c50'},
 {id:'coilStation',name:'Stasiun pengujian kumparan',short:'Uji kumparan',action:'Uji modul',x:26,z:1,color:'#5c8c95'},
 {id:'miniCrane',name:'Derek elektromagnet mini',short:'Derek mini',action:'Operasikan',x:26,z:-6,color:'#c39b47'},
 {id:'clipTray',name:'Baki enam klip baja',short:'Baki klip',action:'Lihat / kendalikan',x:22,z:-4.5,color:'#7d9698'},
 {id:'clipBin',name:'Penampung klip terkirim',short:'Penampung klip',action:'Lihat / kendalikan',x:30,z:-4.5,color:'#6c9672'},
];
export const electromagnetObstacles=[
 {x:20,z:9.3,width:3,depth:1.3},{x:16,z:5.3,width:1.5,depth:.65},{x:25,z:12.3,width:1.5,depth:.65},
 {x:20,z:2.3,width:2.5,depth:.8},{x:26,z:.3,width:3,depth:1.5},
 {x:26,z:-8,width:9,depth:4},
];
