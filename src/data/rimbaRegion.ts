import type { Place } from './content';
import type { NavigationArea } from '../engine/navigation';
export const cartParking = {x:2,z:8};
export const rimbaPlaces: Place[] = [
  {id:'damar',name:'Pak Damar · penjaga hutan',short:'Pak Damar',action:'Bicara',x:-6,z:13,color:'#687c42'},
  {id:'forestMap',name:'Papan peta jalur aman',short:'Peta aman',action:'Baca peta',x:2,z:14,color:'#71916b'},
  {id:'capacityBook',name:'Buku Kapasitas dan Volume',short:'Kapasitas & volume',action:'Baca',x:-12,z:3,color:'#5d91a2'},
  {id:'supplyNotes',name:'Catatan Rencana Persediaan Pos',short:'Catatan persediaan',action:'Baca',x:0,z:2,color:'#bc9556'},
  {id:'forestSource',name:'Tandon sumber · 40 L',short:'Sumber air',action:'Isi wadah',x:-6,z:7,color:'#5e9caa'},
  {id:'bucketRack',name:'Rak ember · kapasitas 4 L',short:'Ambil ember',action:'Ambil',x:-2,z:8,color:'#d2a552'},
  {id:'workshop',name:'Bengkel roda dan gerobak',short:'Bengkel & gerobak',action:'Periksa gerobak',x:2,z:8,color:'#9e764e'},
  {id:'receiverA',name:'Penampung A · target 8 L',short:'A · 8 L',action:'Periksa / tuang',x:-8,z:-3,color:'#518591'},
  {id:'receiverB',name:'Penampung B · target 6 L',short:'B · 6 L',action:'Periksa / tuang',x:7,z:-1,color:'#8e8752'},
  {id:'receiverC',name:'Penampung C · target 10 L',short:'C · 10 L',action:'Periksa / tuang',x:5,z:-9,color:'#9c7051'},
  {id:'habitatBoard',name:'Titik pengamatan · Habitat Setelah Kebakaran',short:'Pengamatan habitat',action:'Amati / baca',x:11,z:8,color:'#718b51'},
  {id:'forestTownGate',name:'Gerbang kembali ke Kota Sains',short:'Kembali ke Kota',action:'Masuk Kota',x:13,z:15,color:'#648673'},
];
export const forestTrees=[[-16,-10],[-15,-5],[-16,1],[-16,9],[-15,17],[16,-11],[15,-5],[16,3],[16,12],[7,18],[-8,-12],[-1,-12],[-3,18]];
const obstacle = [
  {x:10.8,z:15,width:.3,depth:.3},{x:15.2,z:15,width:.3,depth:.3},
  {x:-6,z:13,width:.6,depth:.6},
  {x:-2,z:8,width:1.2,depth:.6},
  ...forestTrees.map(([x,z])=>({x,z,width:.5,depth:.5})),
  {x:-12,z:13,width:4,depth:3}, // guard hut; door 2.1 m
  {x:5.5,z:11,width:2,depth:1}, // workbench
  ...(['forestSource','receiverA','receiverB','receiverC'] as const).map(id=>{const p=rimbaPlaces.find(p=>p.id===id)!;return{x:p.x,z:p.z-1.2,width:2,depth:1.6};}),
  ...(['forestMap','capacityBook','supplyNotes','habitatBoard'] as const).map(id=>{const p=rimbaPlaces.find(p=>p.id===id)!;return{x:p.x,z:p.z-.7,width:1.3,depth:.3};}),
];
export const rimbaCartConfig = { walkSpeed:3.4, runSpeed:4.2, radius:1.65, approach:2.8, interaction:3.2, wheelRadius:.27 } as const;
const areas = new Map<string,NavigationArea>();
for(const open of [false,true])for(const cart of [false,true]) {
  const extra=cart?rimbaCartConfig.radius-.45:0;
  areas.set(`${open}/${cart}`,{radius:cart?rimbaCartConfig.radius:.45,
    bounds:{minX:-18+extra,maxX:18-extra,minZ:-14+extra,maxZ:19-extra},
    obstacles:[...obstacle,...(!open?[{x:5,z:-8,width:6,depth:4}]:[]),...(!cart?[{x:cartParking.x,z:cartParking.z-.85,width:1.4,depth:1.5}]:[])],
  });
}
export function rimbaNavigation(open=false,cart=false):NavigationArea {return areas.get(`${open}/${cart}`)!;}
