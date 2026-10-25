import {pressureConfig} from '../data/pressureContent';
import {rootYAtDepth,sensorDepth} from '../game/pressureModel';
export interface Point3{x:number;y:number;z:number;}
export interface RovObstacle extends Point3{width:number;height:number;depth:number;}
/** Actual visual footprints, expanded by the robot's full conservative envelope. */
export const rovObstacles:RovObstacle[]=[
 {x:8.3,z:-5,y:-4.6,width:.14,height:9,depth:.14},{x:14.3,z:-7,y:-4.6,width:.14,height:9,depth:.14},
 {x:9,z:-2,y:-6.5,width:3,height:2,depth:3},
 {x:13,z:7,y:-4.8,width:2.3,height:2.6,depth:2.6},
 {x:10,z:2,y:-.7,width:.6,height:2,depth:.6},
 {x:2,z:10,y:-1.3,width:2,height:3,depth:4},
 {x:17.5,z:-6,y:-1.3,width:1,height:3,depth:4},
 {x:3.3,z:-9.7,y:-1,width:3.5,height:.1,depth:2.6},
];
export const rovBounds={minX:4,maxX:16,minZ:-13,maxZ:14};
export function rovWalkable(p:Point3){const h=sensorDepth(p.y);return Number.isFinite(p.x)&&Number.isFinite(p.z)&&h>=-1e-8&&h<=pressureConfig.maxDepth+1e-8&&p.x>=rovBounds.minX&&p.x<=rovBounds.maxX&&p.z>=rovBounds.minZ&&p.z<=rovBounds.maxZ&&!rovObstacles.some(o=>Math.abs(p.x-o.x)<o.width/2+pressureConfig.radius&&Math.abs(p.y-o.y)<o.height/2+pressureConfig.halfHeight&&Math.abs(p.z-o.z)<o.depth/2+pressureConfig.radius);}
export function sweepRov(p:Point3,axis:'x'|'y'|'z',delta:number){
 const min=axis==='y'?rootYAtDepth(pressureConfig.maxDepth):axis==='x'?rovBounds.minX:rovBounds.minZ,max=axis==='y'?rootYAtDepth(0):axis==='x'?rovBounds.maxX:rovBounds.maxZ;let target=Math.max(min,Math.min(max,p[axis]+delta));
 for(const o of rovObstacles){const half=(a:'x'|'y'|'z')=>(a==='x'?o.width:a==='y'?o.height:o.depth)/2+(a==='y'?pressureConfig.halfHeight:pressureConfig.radius);if((['x','y','z'] as const).filter(a=>a!==axis).some(a=>Math.abs(p[a]-o[a])>=half(a)))continue;const h=half(axis);if(delta>0&&p[axis]<=o[axis]-h)target=Math.min(target,o[axis]-h-1e-8);if(delta<0&&p[axis]>=o[axis]+h)target=Math.max(target,o[axis]+h+1e-8);}
 return target;
}
const segment=(a:Point3,b:Point3)=>{const steps=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)/.08);for(let i=0;i<=steps;i++){const t=steps?i/steps:0;if(!rovWalkable({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}))return false;}return true;};
/** Six-axis 3D grid. Land pathfinding is deliberately not used underwater. */
export function findRovPath(start:Point3,end:Point3):Point3[]{
 if(!rovWalkable(start)||!rovWalkable(end))return[];
 const nearest=(p:Point3)=>{const a:Point3[]=[];for(let x=Math.floor(p.x)-1;x<=Math.ceil(p.x)+1;x++)for(let z=Math.floor(p.z)-1;z<=Math.ceil(p.z)+1;z++)for(let h=Math.max(0,Math.floor(sensorDepth(p.y))-1);h<=Math.min(9,Math.ceil(sensorDepth(p.y))+1);h++){const c={x,y:rootYAtDepth(h),z};if(rovWalkable(c)&&segment(p,c))a.push(c);}return a.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y,a.z-p.z)-Math.hypot(b.x-p.x,b.y-p.y,b.z-p.z))[0];};
 const a=nearest(start),b=nearest(end);if(!a||!b)return[];const key=(p:Point3)=>`${p.x},${Math.round(sensorDepth(p.y))},${p.z}`;const queue=[a],seen=new Map<string,Point3|null>([[key(a),null]]);
 for(let i=0;i<queue.length;i++){const p=queue[i];if(key(p)===key(b)){const path:Point3[]=[];let n:Point3|null=p;while(n&&key(n)!==key(a)){path.unshift(n);n=seen.get(key(n))??null;}if(Math.hypot(start.x-a.x,start.y-a.y,start.z-a.z)>.001)path.unshift(a);path.push({...end});return path;}
  for(const [dx,dy,dz]of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const n={x:p.x+dx,y:p.y+dy,z:p.z+dz};if(rovWalkable(n)&&!seen.has(key(n))&&segment(p,n)){seen.set(key(n),p);queue.push(n);}}
 }return[];
}
