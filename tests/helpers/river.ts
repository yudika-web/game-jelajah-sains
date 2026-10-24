import { initialRiver, riverTransition, nextFish, siteRecords, type RiverProgress, type RiverEvent } from '../../src/game/riverMission';
import { samplingModel } from '../../src/data/riverContent';
export function riverAct(p:RiverProgress,event:RiverEvent){const r=riverTransition(p,event);if(!r.ok)throw new Error(r.message);return r.progress;}
export function preparedRiver(){let p=riverAct(initialRiver(),{type:'accept'});for(const source of ['observation','procedure','limits'] as const)p=riverAct(p,{type:'read',source});p=riverAct(p,{type:'rod'});return riverAct(p,{type:'plan',choices:samplingModel});}
export function observedRiver(){let p=preparedRiver();for(const site of ['A','B','A','B','A','B'] as const)p=riverAct(p,{type:'record',site,index:siteRecords(p,site).length,feature:nextFish(p,site),note:'Ciri tampak',revision:p.revision});return p;}
