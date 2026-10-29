import type {Place} from './content';
import {pressureConfig} from './pressureContent';
/** One sea surface shared with W05 and ROV. Depth is the centre of the avatar's torso. */
export const diveConfig={surfaceY:pressureConfig.surfaceY,maxDepth:6,horizontalSpeed:2.2,verticalSpeed:1.2,body:{x:.6,y:.9,z:1.05},centreOffset:.8,range:2.6,transitionSeconds:1.2} as const;
export const diveShore={x:-7,y:0,z:24},diveEntry={x:-7,y:diveConfig.surfaceY,z:28};
export const divePlaces:Place[]=[
 {id:'divePrep',name:'Pos persiapan teluk latihan',short:'Persiapan menyelam',action:'Baca pengantar',x:-4,z:21,color:'#668f8f'},
 {id:'diveLocker',name:'Lemari perlengkapan selam gratis',short:'Perlengkapan selam',action:'Pakai / lepas',x:-11,z:22,color:'#598c9c'},
 {id:'diveDock',name:'Dermaga masuk teluk latihan',short:'Masuk teluk latihan',action:'Masuk / keluar air',x:diveShore.x,z:diveShore.z,color:'#be9c62'},
];
export const divePoints={
 diveFish:{name:'Kelompok ikan teluk',position:{x:-3,y:-2.4,z:33},approach:{x:-5,y:-2.4,z:32},text:'Amati tubuh, sirip, dan ekor ikan model. Kelompok ini bergerak dengan pola berbeda. Bentuk dan warna merupakan ilustrasi, bukan identifikasi spesies atau bukti makanannya. Ikan dekoratif di teluk tidak menambah sampel S16 atau S13.'},
 diveGrass:{name:'Padang lamun',position:{x:-12,y:-6.2,z:36},approach:{x:-10,y:-4.8,z:36},text:'Lamun adalah tumbuhan berbunga yang hidup terendam di perairan laut dangkal bercahaya. Akar dan rimpangnya berada pada sedimen. Model ini memperlihatkan petak lamun di pasir, terpisah dari akar mangrove di tepian. Jangan menyentuh atau mengambil organisme.'},
 diveRocks:{name:'Batu dan ruang habitat',position:{x:-2,y:-4.5,z:40},approach:{x:-3.6,y:-4.4,z:40},text:'Bentuk batu menyediakan celah dan permukaan habitat. Ikan model bergerak di dekatnya, tetapi melihat satu ikan di sini tidak membuktikan seluruh kebiasaan hidupnya. Tidak ada karang hidup yang ditambahkan pada teluk latihan ini.'},
 diveLight:{name:'Cahaya dari permukaan',position:{x:-11,y:-1.5,z:31},approach:{x:-11,y:-1.5,z:31},text:'Lihat ke permukaan air. Cahaya membantu tumbuhan yang berfotosintesis. Warna dan jarak pandang di permainan diperjelas untuk pengamatan, bukan pengukuran sifat optik laut. Kedalaman di layar berasal dari posisi pusat tubuh terhadap permukaan yang sama.'},
 divePier:{name:'Struktur bawah dermaga',position:{x:-7,y:-2,z:28},approach:{x:-7,y:-2,z:30},text:'Tiang menopang dermaga dari bawah air. Jaga jarak dari struktur. Untuk keluar, kembali ke tangga masuk dan naik ke permukaan dahulu. Tombol Kembali ke Dermaga memulihkan posisi tanpa mengubah bukti misi atau XP.'},
} as const;
export type DivePointId=keyof typeof divePoints;
export const divePointPlaces:Place[]=Object.entries(divePoints).map(([id,p])=>({id:id as DivePointId,name:p.name,short:p.name,action:'Amati',x:p.position.x,z:p.position.z,color:'#64b7bd'}));
export const diveBounds={min:{x:-17,y:diveConfig.surfaceY-diveConfig.maxDepth-diveConfig.body.y,z:26},max:{x:3,y:diveConfig.surfaceY+diveConfig.body.y,z:45}};
export const diveObstacles=[
 {name:'rock-west',min:{x:-16,y:-7.6,z:34},max:{x:-13.6,y:-4.3,z:37}},
 {name:'rock-east',min:{x:-1.8,y:-7.6,z:38.8},max:{x:1.7,y:-3.5,z:42}},
 {name:'sand-ridge',min:{x:-16,y:-7.6,z:40},max:{x:-11,y:-6.95,z:43}},
 ...[-8.5,-5.5].flatMap(x=>[26.5,29].map(z=>({name:'pier-pile',min:{x:x-.12,y:-7.6,z:z-.12},max:{x:x+.12,y:.05,z:z+.12}}))),
];
export const diveNote='Simulasi pendidikan pada teluk terbatas, kedalaman pusat tubuh maksimal 6 m model. Bantuan kendali membantu melayang saat input dilepas. Oksigen, arus, fisiologi dan prosedur keselamatan nyata tidak disimulasikan; ini bukan panduan praktik menyelam.';
