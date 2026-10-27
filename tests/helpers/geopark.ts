import {initialGeo,geoTransition,type GeoEvent,type GeoProgress} from '../../src/game/geoparkMission';
import {earthLayers,plateIds,plateModels,geoAnswers} from '../../src/data/geoparkContent';
export const geoAct=(p:GeoProgress,e:GeoEvent)=>{const r=geoTransition(p,e,()=> '2026-10-27T08:00:00.000Z');if(r.progress===p)throw Error(r.message);return r.progress;};
export function layeredGeo(){let p=geoAct(initialGeo(),{type:'accept'});p=geoAct(p,{type:'read',source:'layers'});return geoAct(p,{type:'layers',order:[...earthLayers]});}
export function modeledGeo(){let p=layeredGeo();for(const source of ['plates','landscape'] as const)p=geoAct(p,{type:'read',source});for(const id of [...plateIds].reverse()){p=geoAct(p,{type:'predict',id,motion:plateModels[id].motion});p=geoAct(p,{type:'start',id});p=geoAct(p,{type:'finish'});p=geoAct(p,{type:'observe'});p=geoAct(p,{type:'record',phenomenon:plateModels[id].phenomenon});}return p;}
export function routedGeo(){let p=geoAct(modeledGeo(),{type:'exercise'});p=geoAct(p,{type:'read',source:'situation'});for(const route of ['C','A','B'] as const)p=geoAct(p,{type:'sign',route});return geoAct(p,{type:'route',route:'B',reason:'open-marked'});}
export function finishedGeo(){let p=geoAct(routedGeo(),{type:'arrive',xMm:0,zMm:-18000});return geoAct(p,{type:'conclude',answers:geoAnswers});}
