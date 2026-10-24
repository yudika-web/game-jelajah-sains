import type {NavigationArea,Point} from '../engine/navigation';
import type {Place} from './content';
export const pool={minX:-16,maxX:-8,minZ:-15,maxZ:-9,rampX:-10.2,rampZ:-7.5};
export const poolEntry={x:-10.2,z:-10.2},poolExit={x:-10.2,z:-7.5},poolMarker={x:-13,z:-12};
export const poolPlaces:Place[]=[
 {id:'poolRamp',name:'Ramp kolam latihan',short:'Ramp kolam',action:'Masuk / keluar kolam',x:-10.2,z:-7.5,color:'#5a9da8'},
 {id:'poolBuoy',name:'Penanda latihan berenang',short:'Penanda kolam',action:'Amati',x:-13,z:-12,color:'#d0a456'},
 {id:'densityBook',name:'Buku massa jenis dan gaya apung',short:'Buku gaya apung',action:'Baca',x:-4,z:-8,color:'#579aa3'},
 {id:'floatBench',name:'Meja uji tiga benda model',short:'Uji benda A/B/C',action:'Prediksi / uji',x:-5,z:-14,color:'#ae9559'},
];
export const poolLandObstacles=[{x:-13.8,z:-12,width:4.4,depth:6},{x:-8.5,z:-12,width:1,depth:6},{x:-10.3,z:-13,width:2.6,depth:4},...poolPlaces.filter(p=>p.id==='densityBook'||p.id==='floatBench').map(p=>({x:p.x,z:p.z-.7,width:1.2,depth:.5}))];
export const poolSwimmingNavigation:NavigationArea={bounds:{minX:-15.55,maxX:-8.45,minZ:-14.55,maxZ:-7.5},obstacles:[{x:-13.8,z:-8,width:4.8,depth:2},{x:-8.5,z:-8,width:1,depth:2}]};
export const entersPool=(p:Point)=>p.x>=-11&&p.x<=-9.45&&p.z< -9.4&&p.z> -11;
export const exitsPool=(p:Point)=>p.x>=-11&&p.x<=-9.45&&p.z> -8.6;
export const swimSpeeds={walkSpeed:2.2,runSpeed:2.2};
