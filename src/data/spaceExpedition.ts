import type {Place} from './content';
import type {NavigationArea} from '../engine/navigation';
export interface Vector3Data{x:number;y:number;z:number;}
export const expeditionConfig={horizontalSpeed:2.4,verticalSpeed:1.5,body:{x:.55,y:.9,z:.55},maxTether:36,interaction:2.65,boardSeconds:.8,departureSeconds:1.4,transitSeconds:1.8,dockingSeconds:1.4,airlockSeconds:1.1,doorSeconds:1.2} as const;
export const safeSpaceSpawn={x:14,z:16.2};
export const shipDock={x:5,y:0,z:13.5},shipPrep={x:0,y:0,z:7};
export const lockerPoint={x:10,y:0,z:16},airlockPoint={x:14,y:0,z:16.2},chamberPoint={x:14,y:0,z:20.7};
export const tetherAnchor={x:14,y:2.6,z:24.65},evaEntry={x:14,y:2.4,z:25.4};
export const preparationPlaces:Place[]=[
 {id:'prepBrief',name:'Meja persiapan ekspedisi',short:'Persiapan',action:'Baca',x:-4,z:13,color:'#84b1c6'},
 {id:'shuttleDoor',name:'Pintu kendaraan ekspedisi',short:'Naik kendaraan',action:'Naik',x:2.3,z:7,color:'#d4b16d'},
 {id:'prepExit',name:'Kembali ke Observatorium Kota',short:'Batal / Kota',action:'Kembali',x:4,z:15,color:'#8ba8b7'},
];
export const preparationNavigation:NavigationArea={bounds:{minX:-6,maxX:6,minZ:3,maxZ:17},obstacles:[{x:0,z:7,width:3.4,depth:6.2},{x:-4,z:12.2,width:1.8,depth:.9}]};
export const expeditionPlaces:Place[]=[
 {id:'spaceLocker',name:'Lemari perlengkapan astronot gratis',short:'Perlengkapan astronot',action:'Pakai / lepas',x:lockerPoint.x,z:lockerPoint.z,color:'#d0dfe9'},
 {id:'spaceAirlock',name:'Airlock · prosedur permainan',short:'Airlock / luar stasiun',action:'Masuk airlock',x:airlockPoint.x,z:airlockPoint.z,color:'#d5b774'},
];
export const evaPoints={
 evaSolar:{name:'Panel surya',position:{x:9.2,y:4,z:31},approach:{x:7.1,y:5.2,z:31},text:'Panel mengubah energi cahaya menjadi energi listrik. Bentuk dan ukuran pada stasiun ini adalah ilustrasi permainan, bukan data daya yang diukur. Hindari menyentuh permukaannya; amati dari titik pendekatan.'},
 evaAntenna:{name:'Antena komunikasi',position:{x:.9,y:7,z:35.4},approach:{x:3,y:7,z:35.4},text:'Antena mendukung komunikasi dengan gelombang elektromagnetik. Suara percakapan dapat dibawa melalui perangkat komunikasi; ini bukan bunyi yang merambat langsung melalui ruang hampa.'},
 evaWindow:{name:'Jendela observasi',position:{x:0,y:3,z:24.45},approach:{x:0,y:3,z:26.3},text:'Lihat ruang observasi melalui jendela. Pijakan bantu di interior adalah konvensi simulasi. Mikrogravitasi bukan ketiadaan gravitasi: stasiun orbit dan penghuninya mengalami jatuh bebas bersama.'},
 evaModule:{name:'Modul observasi luar',position:{x:-6.8,y:4,z:29},approach:{x:-4.8,y:4,z:29},text:'Modul melindungi perlengkapan observasi. Pendorong bantu pada avatar ini menyederhanakan kendali: sistem aktif membantu menstabilkan gerak saat input dilepas. Perlambatan itu bukan gesekan udara di ruang hampa.'},
 evaAnchor:{name:'Titik tambat / airlock',position:evaEntry,approach:evaEntry,text:'Penambat dan batas zona merupakan bantuan permainan, bukan petunjuk melakukan spacewalk nyata. Kembali ke Airlock tersedia tanpa mengurangi XP atau menghapus catatan misi.'},
} as const;
export type EvaPointId=keyof typeof evaPoints;
export const evaPlaceList:Place[]=Object.entries(evaPoints).map(([id,p])=>({id:id as EvaPointId,name:p.name,short:p.name,action:'Amati',x:p.position.x,z:p.position.z,color:'#87c9d8'}));
export const evaBounds={min:{x:-20,y:0,z:24},max:{x:20,y:11,z:44}};
export const exteriorObstacles=[
 {name:'airlock',min:{x:12.2,y:0,z:19},max:{x:15.8,y:3.8,z:23.8}},
 {name:'window-bay',min:{x:-3.2,y:0,z:19},max:{x:3.2,y:4.7,z:24.5}},
 {name:'solar-array',min:{x:9,y:3.4,z:28},max:{x:17,y:4.2,z:38}},
 {name:'solar-support',min:{x:12.2,y:0,z:30.8},max:{x:12.8,y:4,z:31.4}},
 {name:'observation-module',min:{x:-13,y:1.5,z:26},max:{x:-7,y:6,z:32}},
 {name:'antenna',min:{x:-1.5,y:5.5,z:34},max:{x:1.5,y:9,z:37}},
];
export const expeditionNotes={microgravity:'Mikrogravitasi bukan tidak adanya gravitasi. Stasiun orbit dan penghuninya jatuh bebas bersama. Interior memakai pijakan bantu sebagai konvensi permainan, bukan gravitasi Bumi biasa.',assist:'Stabilisasi aktif pendorong bantu membantu berhenti saat input dilepas. Ruang hampa tidak memberi gesekan udara seperti di Bumi.',airlock:'Prosedur airlock disederhanakan untuk permainan. Tekanan, aliran gas dan dekompresi tidak disimulasikan. Kedua pintu tidak dibuka bersamaan.',trip:'Perjalanan dan docking dipersingkat sebagai simulasi ekspedisi pendidikan. Bukan simulasi penerbangan, lintasan orbit atau prosedur keselamatan nyata.'};
