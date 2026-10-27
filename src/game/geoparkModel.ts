import {plateModels,type PlateId,earthLayers,type EarthLayer} from '../data/geoparkContent';
export const correctLayerOrder=(order:unknown):order is EarthLayer[]=>Array.isArray(order)&&order.length===4&&order.every((v,i)=>v===earthLayers[i]);
export function platePose(id:PlateId,fraction:number){const t=Math.min(1,Math.max(0,fraction)),motion=plateModels[id].motion;return motion==='away'?{leftX:-.62-.45*t,rightX:.62+.45*t,leftZ:0,rightZ:0,subduction:0,newCrust:t}:motion==='toward'?{leftX:-.9+.7*t,rightX:.9-.15*t,leftZ:0,rightZ:0,subduction:t*.45,newCrust:0}:{leftX:-.65,rightX:.65,leftZ:-.65*t,rightZ:.65*t,subduction:0,newCrust:0};}
export const plateResult=(id:PlateId)=>({id,motion:plateModels[id].motion,phenomenon:plateModels[id].phenomenon});
