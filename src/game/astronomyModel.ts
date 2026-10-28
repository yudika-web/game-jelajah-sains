import {astroConfig as c,type SpaceStage,type PhaseId} from '../data/spaceContent';
export interface AstroVector{x:number;y:number;z:number;}
const rad=(m:number)=>m/1000*Math.PI/180;
const dot=(a:AstroVector,b:AstroVector)=>a.x*b.x+a.y*b.y+a.z*b.z;
const norm=(a:AstroVector)=>{const n=Math.hypot(a.x,a.y,a.z);return{x:a.x/n,y:a.y/n,z:a.z/n};};
const sub=(a:AstroVector,b:AstroVector)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
export const wrapAngle=(m:number)=>((m%c.turn)+c.turn)%c.turn;
export function moonOffset(angleMdeg:number,earthAngleMdeg=0):AstroVector{
 const n=rad(c.nodeDeg*1000),u=rad(angleMdeg)-n,i=rad(c.moonInclinationDeg*1000),e=rad(earthAngleMdeg);
 const x=Math.cos(n)*Math.cos(u)-Math.sin(n)*Math.sin(u)*Math.cos(i),z=Math.sin(n)*Math.cos(u)+Math.cos(n)*Math.sin(u)*Math.cos(i);
 return{x:c.moonOrbit*(-Math.cos(e)*x-Math.sin(e)*z),y:c.moonOrbit*Math.sin(u)*Math.sin(i),z:c.moonOrbit*(-Math.sin(e)*x+Math.cos(e)*z)};
}
export function astronomicalState(rotationMdeg=0,revolutionMdeg=0,moonMdeg=0){
 const t=rad(revolutionMdeg),r=rad(rotationMdeg),sun={x:0,y:0,z:0},earth={x:c.earthOrbit*Math.cos(t),y:0,z:c.earthOrbit*Math.sin(t)},o=moonOffset(moonMdeg,revolutionMdeg),moon={x:earth.x+o.x,y:o.y,z:earth.z+o.z};
 const earthLight=norm(sub(sun,earth)),moonLight=norm(sub(sun,moon)),observer=norm(sub(earth,moon)),markerNormal={x:-Math.cos(r),y:0,z:Math.sin(r)},dayDot=dot(markerNormal,earthLight),lit=(1+dot(moonLight,observer))/2;
 return{sun,earth,moon,earthLight,moonLight,markerNormal,marker:{x:earth.x+markerNormal.x*c.earthRadius,y:0,z:earth.z+markerNormal.z*c.earthRadius},dayDot,day:dayDot>.08?'day' as const:dayDot<-.08?'night' as const:'boundary' as const,illuminated:Math.min(1,Math.max(0,lit)),observer,offset:o};
}
function quarterRoot(lo:number,hi:number,increasing:boolean){for(let n=0;n<55;n++){const mid=(lo+hi)/2,v=astronomicalState(0,0,mid).illuminated;if((v<.5)===increasing)lo=mid;else hi=mid;}return Math.round((lo+hi)/2);}
/** Finite display distances: solve the actual Sun–Moon–observer angle, not an unrelated picture. */
export const moonTargets=[0,quarterRoot(0,180000,true),180000,quarterRoot(180000,360000,false)] as const;
export function phaseFromGeometry(angleMdeg:number):PhaseId|null{const s=astronomicalState(0,0,angleMdeg);if(s.illuminated<.02)return'new';if(s.illuminated>.98)return'full';if(Math.abs(s.illuminated-.5)<.003)return s.offset.z>0?'first':'last';return null;}
export const phaseSlot=(angle:number)=>moonTargets.findIndex(a=>Math.abs(wrapAngle(angle)-a)<=2);
export function nextInstrumentAngle(stage:SpaceStage,angle:number,turn=false){if(turn)return angle+c.turn;if(stage!=='phases')return(Math.floor(angle/c.quarter)+1)*c.quarter;const base=Math.floor(angle/c.turn)*c.turn;return(moonTargets.find(a=>a+base>angle+2)??c.turn)+base;}
const rounded=(n:number)=>Math.round(n*1e6)/1e6;
const vector=(v:AstroVector)=>({x:rounded(v.x),y:rounded(v.y),z:rounded(v.z)});
export function spaceObservation(stage:SpaceStage,angleMdeg:number,movedMdeg:number){const s=astronomicalState(stage==='rotation'?angleMdeg:0,stage==='revolution'?angleMdeg:0,stage==='phases'?angleMdeg:0);return{stage,angleMdeg,movedMdeg,day:s.day,quadrant:Math.round(wrapAngle(angleMdeg)/c.quarter)%4,phase:stage==='phases'?phaseFromGeometry(angleMdeg):null,illuminatedPermille:Math.round(s.illuminated*1000),marker:vector(s.marker),earth:vector(s.earth),moon:vector(s.moon)};}
export type SpaceObservation=ReturnType<typeof spaceObservation>;
