import type {RegionId} from '../game/gameState';
import type {Obstacle} from '../engine/navigation';
/** Only solid new beds/workstations and static decorative people. Existing mission footprints stay intact. */
export const environmentObstacles:Record<RegionId,Obstacle[]>={
 town:[],coast:[],
 garden:[{x:-8,z:.4,width:1.45,depth:.65},{x:-4,z:3.4,width:1.45,depth:.65},{x:5,z:5.8,width:2.2,depth:1.2},{x:9,z:-9,width:5,depth:3},{x:9,z:-13,width:5,depth:2},{x:6.1,z:-9,width:.6,depth:.6}],
 rimba:[{x:-9.3,z:12,width:.6,depth:.6}],
 river:[{x:1.8,z:-12,width:.6,depth:.6}],
 workshop:[{x:-12.5,z:1.2,width:2,depth:1},{x:-12.5,z:2.3,width:.6,depth:.6}],
 geopark:[...[0,6,11].map(z=>({x:-17,z,width:.12,depth:2.1})),{x:-15.5,z:8.6,width:3,depth:2},{x:-13,z:8.6,width:.6,depth:.6}],
 space:[{x:-13.5,z:4.55,width:.8,depth:.6},{x:-13.5,z:5.2,width:.6,depth:.6}],
};
export const ambientBudget={actors:1,movingPlants:6,particles:0,newTransparentLayers:0,staticMaterials:24} as const;
export const ambientStation={
 garden:{x:6.1,z:-9,kind:'sari',pose:'water',yaw:Math.PI/2},
 rimba:{x:-9.3,z:12,kind:'wira',pose:'measure',yaw:-Math.PI/2},
 river:{x:1.8,z:-12,kind:'wira',pose:'fishWait',yaw:Math.PI/2},
 workshop:{x:-12.5,z:2.3,kind:'bima',pose:'measure',yaw:Math.PI},
 geopark:{x:-13,z:8.6,kind:'explorerGirl',pose:'read',yaw:-Math.PI/2},
 space:{x:-13.5,z:5.2,kind:'explorer',pose:'measure',yaw:Math.PI},
} as const;

/** Outside the permanent fence; these slabs meet the existing terrain at edges only. */
export const rimbaSceneryGround=[
 {x:-25,z:1,width:8,depth:43,height:.8,y:-.45,color:'#738361',optional:true},
 {x:25,z:1,width:8,depth:43,height:.8,y:-.45,color:'#738361',optional:true},
 {x:0,z:-25.5,width:58,depth:10,height:.8,y:-.45,color:'#86785b',optional:false},
] as const;
