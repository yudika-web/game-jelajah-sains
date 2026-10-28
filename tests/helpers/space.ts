import {initialSpace,spaceTransition,type SpaceProgress,type SpaceEvent} from '../../src/game/spaceMission';
import {spaceAnswers,spaceCards,type SpaceStage} from '../../src/data/spaceContent';
export const spaceAct=(p:SpaceProgress,e:SpaceEvent)=>{const r=spaceTransition(p,e,()=> '2026-10-28T09:00:00.000Z');if(r.progress===p)throw Error(r.message);return r.progress;};
export function preparedSpace(){let p=spaceAct(initialSpace(),{type:'accept'});for(const source of Object.keys(spaceCards) as (keyof typeof spaceCards)[])p=spaceAct(p,{type:'read',source});return p;}
export function openSpace(p:SpaceProgress,stage:SpaceStage){p=spaceAct(p,{type:'predict',stage,choice:stage==='rotation'?'spin':stage==='revolution'?'orbit':'positions'});return spaceAct(p,{type:'open',stage});}
export const observeSpace=(p:SpaceProgress,choice:string)=>spaceAct(spaceAct(p,{type:'observe'}),{type:'record',choice});
export function rotatedSpace(){let p=openSpace(preparedSpace(),'rotation');p=spaceAct(p,{type:'step'});p=spaceAct(p,{type:'step'});p=observeSpace(p,'night');p=spaceAct(p,{type:'step'});p=spaceAct(p,{type:'step'});p=observeSpace(p,'day');p=spaceAct(p,{type:'explain',stage:'rotation',choice:'spin'});return spaceAct(p,{type:'cancel'});}
export function revolvedSpace(){let p=openSpace(rotatedSpace(),'revolution');for(let i=0;i<4;i++){p=observeSpace(p,'position');p=spaceAct(p,{type:'step'});}p=spaceAct(p,{type:'explain',stage:'revolution',choice:'year'});return spaceAct(p,{type:'cancel'});}
export function phasedSpace(){let p=openSpace(revolvedSpace(),'phases');p=spaceAct(p,{type:'view',view:'earth'});for(const choice of ['new','first','full','last']){p=observeSpace(p,choice);if(choice!=='last')p=spaceAct(p,{type:'step'});}return spaceAct(p,{type:'cancel'});}
export const finishedSpace=()=>spaceAct(phasedSpace(),{type:'conclude',answers:spaceAnswers});
