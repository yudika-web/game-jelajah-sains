import type {Place} from './content';
export const hydraulicPlaces:Place[]=[
 {id:'hydraulicBench',name:'Meja model hidraulik dan platform',short:'Lift hidraulik',action:'Uji / angkat',x:8,z:27,color:'#699aa4'},
 {id:'hydraulicRack',name:'Rak tiga modul piston',short:'Modul piston',action:'Pilih modul',x:-8,z:24,color:'#c39b58'},
 {id:'hydraulicLoad',name:'Peti perlengkapan 100 N',short:'Kebutuhan peti',action:'Periksa kebutuhan',x:8,z:22,color:'#b59b72'},
 {id:'hydraulicBook',name:'Buku hidraulik',short:'Buku hidraulik',action:'Baca',x:-10,z:32,color:'#649198'},
 {id:'hydraulicNotes',name:'Catatan kebutuhan lift',short:'Catatan lift',action:'Baca',x:-3,z:32,color:'#a3925e'},
];
export const hydraulicObstacles=hydraulicPlaces.map(p=>({x:p.x,z:p.z-.8,width:p.id==='hydraulicBench'?5:1.6,depth:p.id==='hydraulicBench'?2: .8}));
