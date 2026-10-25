import type {Place} from './content';
export const energyPlaces:Place[]=[
 {id:'solarArray',name:'Panel surya model',short:'Panel surya',action:'Uji cahaya',x:-12,z:-26,color:'#578caa'},
 {id:'windTurbine',name:'Turbin angin model',short:'Turbin angin',action:'Uji angin',x:-4,z:-26,color:'#7c9c92'},
 {id:'energyBattery',name:'Baterai penyimpan 8 Wh',short:'Penyimpan 8 Wh',action:'Lihat energi',x:4,z:-26,color:'#b79b53'},
 {id:'energyLink',name:'Panel penghubung sumber DC',short:'Rencana & konektor',action:'Rakit',x:12,z:-26,color:'#7d8e7c'},
 {id:'energyTester',name:'Meja pengujian daya',short:'Tester daya',action:'Uji sumber',x:21,z:-26,color:'#987c64'},
 {id:'energyService',name:'Panel layanan pos 4 W',short:'Layanan baru 4 W',action:'Jalankan interval',x:29,z:-26,color:'#ba9a5a'},
 {id:'energyBook',name:'Buku energi',short:'Buku energi',action:'Baca',x:-4,z:-18,color:'#668d8b'},
 {id:'energyNotes',name:'Catatan kebutuhan layanan pos',short:'Kebutuhan pos',action:'Baca',x:12,z:-18,color:'#ad8f58'},
];
export const energyObstacles=energyPlaces.map(p=>({x:p.x,z:p.z-.7,width:p.id==='solarArray'?3:p.id==='windTurbine'?2:p.id==='energyService'?3:p.id==='energyLink'||p.id==='energyTester'?2.5:2,depth:p.id==='solarArray'?2:['windTurbine','energyLink','energyTester','energyService'].includes(p.id)?1.2:1}));
