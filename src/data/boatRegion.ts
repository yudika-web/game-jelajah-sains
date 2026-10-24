import type { Place } from './content';
import type { NavigationArea,Point } from '../engine/navigation';
export const boatConfig={walkSpeed:3.5,runSpeed:5,radius:1.65,dockTolerance:.5,minTutorialDistanceMm:8000} as const;
export const docks={
 research:{name:'Dermaga Riset',place:'boatStart',water:{x:8,z:13},land:{x:5,z:13},yaw:-Math.PI/2},
 irrigation:{name:'Dermaga Pengamatan',place:'boatObservation',water:{x:13,z:0},land:{x:17,z:0},yaw:Math.PI/2},
} as const;
export type DockId=keyof typeof docks;
export const irrigationPlaces:Place[]=[
 {id:'boatStart',name:'Dermaga awal · perahu riset',short:'Dermaga riset',action:'Perahu',x:5,z:13,color:'#548e9c'},
 {id:'boatObservation',name:'Dermaga pengamatan irigasi',short:'Dermaga pengamatan',action:'Perahu',x:17,z:0,color:'#548e9c'},
 {id:'flowBook',name:'Buku debit dan waktu',short:'Buku debit',action:'Baca',x:-7,z:13,color:'#478ba1'},
 {id:'irrigationNotes',name:'Catatan pengelola irigasi',short:'Catatan pasokan',action:'Baca',x:-4,z:5,color:'#aa864e'},
 {id:'irrigationScreen',name:'Saringan saluran',short:'Saringan daun',action:'Periksa / bersihkan',x:20,z:-6,color:'#789857'},
 {id:'cleaningRack',name:'Rak alat pembersih',short:'Alat pembersih',action:'Ambil',x:22,z:3,color:'#b38c53'},
 {id:'P1',name:'P1 · pasokan sebelum percabangan',short:'P1 · pasokan',action:'Ukur',x:18,z:-11,color:'#568d9a'},
 {id:'P2',name:'P2 · cabang setelah saringan',short:'P2 · cabang',action:'Ukur',x:21,z:-3,color:'#b08950'},
 {id:'P3',name:'P3 · saluran menuju kebun',short:'P3 · kebun',action:'Ukur',x:23,z:-10,color:'#7a9a57'},
];
export const boatNavigation:NavigationArea={radius:boatConfig.radius,bounds:{minX:4.65,maxX:14.35,minZ:-3,maxZ:16},obstacles:[
 {x:4,z:13,width:4,depth:3},{x:16.5,z:0,width:3,depth:3},
 {x:11,z:6,width:.6,depth:.6},
]};
export function nearbyDock(p:Point):DockId|null{for(const id of ['research','irrigation'] as const)if(Math.hypot(p.x-docks[id].water.x,p.z-docks[id].water.z)<=boatConfig.dockTolerance)return id;return null;}
/** Disjoint land banks share the same land pathfinder; only a boat connects them. */
export const riverWaterObstacles=[
 {x:9.5,z:-13,width:13,depth:8},
 {x:13,z:-7,width:6,depth:4},
 {x:9.5,z:-3.25,width:13,depth:3.5},
 {x:9,z:0,width:12,depth:3},
 {x:9.5,z:6.5,width:13,depth:10},
 {x:11,z:13,width:10,depth:3},
 {x:9.5,z:17,width:13,depth:5},
 {x:20.5,z:13,width:9,depth:12},
];
