import {expeditionPlaces} from './spaceExpedition';
import type {Place} from './content';
import type {NavigationArea} from '../engine/navigation';
export const spacePlaces:Place[]=[
 ...expeditionPlaces,
 {id:'spaceNara',name:'Bu Nara · mentor simulasi',short:'Bu Nara',action:'Bicara',x:-4,z:12,color:'#997cb6'},
 {id:'spaceReturn',name:'Terminal kembali ke Kota',short:'Dok kendaraan / Kota',action:'Naik kendaraan',x:7.3,z:13.5,color:'#7994a9'},
 {id:'spaceBook',name:'Buku astronomi',short:'Buku astronomi',action:'Baca',x:-12,z:7,color:'#7398b5'},
 {id:'spaceNotes',name:'Catatan pengamatan',short:'Catatan astronomi',action:'Baca',x:12,z:7,color:'#c1ac68'},
 {id:'spaceRotation',name:'Stasiun rotasi Bumi',short:'Rotasi Bumi',action:'Amati model',x:-11,z:-3,color:'#668fbc'},
 {id:'spaceRevolution',name:'Stasiun revolusi Bumi',short:'Revolusi Bumi',action:'Amati model',x:0,z:-3,color:'#8aa8ab'},
 {id:'spaceMoon',name:'Stasiun fase Bulan',short:'Fase Bulan',action:'Amati model',x:11,z:-3,color:'#a5a1b6'},
 {id:'spaceJournal',name:'Terminal jurnal dan kesimpulan',short:'Jurnal & kesimpulan',action:'Periksa / simpulkan',x:0,z:6,color:'#829fb7'},
];
export const spaceNavigation:NavigationArea={bounds:{minX:-19,maxX:19,minZ:-17,maxZ:18},obstacles:[
 {x:18,z:10,width:1.5,depth:2.4},{x:5,z:13.5,width:3.4,depth:6.2},{x:5,z:17.3,width:2.7,depth:.35},{x:10,z:15,width:1.5,depth:.8},{x:-4,z:12,width:.6,depth:.6},{x:-13,z:15,width:7,depth:4},
 ...spacePlaces.filter(p=>p.id!=='spaceNara'&&p.id!=='spaceReturn'&&p.id!=='spaceLocker'&&p.id!=='spaceAirlock').map(p=>({x:p.x,z:p.z-.8,width:p.id==='spaceBook'||p.id==='spaceNotes'?2:3,depth:1})),
 {x:0,z:-10,width:42,depth:11},
]};
