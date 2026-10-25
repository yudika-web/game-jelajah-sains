import type {Place} from './content';
export const pressurePlaces:Place[]=[
 {id:'rovControl',name:'Pos kendali ROV',short:'Pos kendali ROV',action:'Kendalikan',x:0,z:3,color:'#638c9c'},
 {id:'rovLaunch',name:'Dok peluncuran dan kalibrasi ROV',short:'Dok ROV · nol relatif',action:'Periksa dok',x:0,z:6.5,color:'#c39c49'},
 {id:'pressureRack',name:'Rak sensor tekanan',short:'Sensor tekanan',action:'Ambil / periksa',x:-15,z:1,color:'#889a7a'},
 {id:'pressureBook',name:'Buku tekanan air',short:'Buku tekanan',action:'Baca',x:-14,z:5,color:'#627f9d'},
 {id:'pressureNotes',name:'Catatan rencana pengukuran',short:'Rencana tekanan',action:'Baca',x:-10,z:-3,color:'#b79555'},
];
