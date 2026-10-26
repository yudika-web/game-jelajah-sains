import type {Place} from './content';
export const solidPlaces:Place[]=[
 {id:'solidBench',name:'Maket pengujian penopang dan jalur',short:'Maket pijakan',action:'Pasang / uji',x:-5,z:28,color:'#a28b5e'},
 {id:'solidRack',name:'Rak tiga penopang dan penggaris',short:'Ukur penopang',action:'Ukur / pilih',x:6,z:25,color:'#8b9b69'},
 {id:'solidForce',name:'Pengukur gaya alat pengamatan',short:'Gaya alat',action:'Periksa',x:-10,z:22,color:'#71959b'},
 {id:'solidBook',name:'Buku tekanan padat',short:'Buku tekanan padat',action:'Baca',x:-10,z:33,color:'#5e8c8e'},
 {id:'solidNotes',name:'Catatan kebutuhan penopang',short:'Kebutuhan penopang',action:'Baca',x:1,z:33,color:'#a88b58'},
];
export const solidObstacles=solidPlaces.map(p=>({x:p.x,z:p.z-(p.id==='solidBench'?1.8:.8),width:p.id==='solidBench'?5.8:p.id==='solidRack'?3.8:1.6,depth:p.id==='solidBench'?4:p.id==='solidRack'?1.8:.8}));
