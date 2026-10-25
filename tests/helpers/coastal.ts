import {initialCoastal,coastalTransition,type CoastalProgress,type CoastalEvent} from '../../src/game/coastalMission';
import {organismIds,organisms,foodLinks,correctCoastalAnswers} from '../../src/data/coastalContent';
export const coastAct=(p:CoastalProgress,e:CoastalEvent)=>{const r=coastalTransition(p,e,()=> '2026-10-25T00:00:00.000Z');if(!r.ok)throw Error(r.message);return r.progress;};
export function observedCoastal(){let p=coastAct(initialCoastal(),{type:'accept'});for(const source of ['energy','food','limits'] as const)p=coastAct(p,{type:'read',source});for(const id of organismIds)p=coastAct(p,{type:'observe',id,feature:id,role:organisms[id].role});return p;}
export function finishedCoastal(){let p=observedCoastal();for(const [from,to]of foodLinks)p=coastAct(p,{type:'link',from,to});p=coastAct(p,{type:'scenario'});return coastAct(p,{type:'conclude',answers:correctCoastalAnswers});}
