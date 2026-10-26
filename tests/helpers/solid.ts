import {initialSolid,solidTransition,type SolidEvent,type SolidProgress} from '../../src/game/solidMission';
import {solidModules,correctSolidAnswers} from '../../src/data/solidContent';
export const solidAct=(p:SolidProgress,e:SolidEvent)=>{const r=solidTransition(p,e,()=> '2026-10-27T00:00:00.000Z');if(!r.ok)throw Error(r.message);return r.progress;};
export function measuredSolid(){let p=solidAct(initialSolid(),{type:'accept'});for(const source of ['force','area','needs'] as const)p=solidAct(p,{type:'read',source});p=solidAct(p,{type:'inspect'});for(const module of solidModules)p=solidAct(p,{type:'measure',module});return p;}
export const preparedSolid=()=>solidAct(measuredSolid(),{type:'plan',variable:'contact-area'});
export function testedSolid(){let p=preparedSolid();for(const module of solidModules){p=solidAct(p,{type:'install',module});p=solidAct(p,{type:'predict',module,choice:module==='A'?'same':'lower'});for(const e of [{type:'start',challenge:false},{type:'finish'},{type:'observe'},{type:'record'},{type:'recover'}] as SolidEvent[])p=solidAct(p,e);}return p;}
export function finishedSolid(){let p=solidAct(testedSolid(),{type:'install',module:'B'});for(const e of [{type:'start',challenge:true},{type:'finish'},{type:'observe'},{type:'record'},{type:'recover'}] as SolidEvent[])p=solidAct(p,e);return solidAct(p,{type:'conclude',answers:correctSolidAnswers});}
