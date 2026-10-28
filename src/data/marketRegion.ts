import type {Place} from './content';
export const marketPlaces:Place[]=[
 {id:'marketPhase',name:'Meja perubahan wujud dan partikel',short:'Es & penguapan',action:'Uji / amati',x:-7.5,z:7,color:'#71a6b0'},
 {id:'marketDensity',name:'Meja neraca dan volume sampel',short:'Massa & volume',action:'Ukur',x:-4.6,z:8,color:'#8c9fa2'},
 {id:'marketRack',name:'Rak dan alat uji tiga wadah',short:'Uji wadah es',action:'Ambil / uji',x:-.2,z:10,color:'#c2995d'},
 {id:'marketPack',name:'Kios pengemasan persediaan es',short:'Kemas kiriman',action:'Kemas / pulihkan',x:2,z:11,color:'#5c9989'},
 {id:'marketBook',name:'Buku IPA perubahan wujud',short:'Buku IPA pasar',action:'Baca',x:-7.5,z:1,color:'#648da7'},
 {id:'marketNotes',name:'Catatan kebutuhan pedagang',short:'Catatan pasar',action:'Baca',x:6.5,z:5,color:'#b69360'},
];
export const marketObstacles=marketPlaces.map(p=>({x:p.x,z:p.z-1,width:p.id==='marketRack'?2.2:1.7,depth:.9}));
export const marketTarget=(id:string)=>id==='warga'?{x:3,z:6}:id==='nara'?{x:-4,z:3}:marketPlaces.find(p=>p.id===id);
/** Shared domain/UI approach check; the actor's position comes from World, never a form. */
export function marketNear(id:string,position:{x:number;z:number;region:string},radius=2.65){const p=marketTarget(id);return position.region==='town'&&!!p&&Math.hypot(position.x-p.x,position.z-p.z)<=radius;}
