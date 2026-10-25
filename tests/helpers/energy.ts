import {initialEnergy,energyTransition,correctEnergyAnswers,type EnergyProgress,type EnergyEvent} from '../../src/game/energyMission';
import {energyCards,energySources,sourceConditions,energyPairs} from '../../src/data/energyContent';
import type {EnergyPlan} from '../../src/game/energyModel';
export const standardPlan=():EnergyPlan[]=>Array.from({length:3},()=>({solar:true,wind:true,battery:true}));
export function energyAct(p:EnergyProgress,e:EnergyEvent){const r=energyTransition(p,e,()=> '2026-10-25T10:00:00.000Z');if(!r.ok)throw Error(`${e.type}: ${r.message}`);return r.progress;}
export function testedEnergy(){let p=energyAct(initialEnergy(),{type:'accept'});for(const card of Object.keys(energyCards) as (keyof typeof energyCards)[])p=energyAct(p,{type:'read',card});for(const source of energySources)for(const condition of sourceConditions[source]){p=energyAct(p,{type:'predict',source,condition,watts:4});p=energyAct(p,{type:'startSource',source,condition});for(const type of ['finishTrial','observe','recordSource'] as const)p=energyAct(p,{type});}return p;}
export function assembledEnergy(plan=standardPlan()){let p=energyAct(testedEnergy(),{type:'plan',rows:plan});for(const {a,b}of energyPairs)p=energyAct(p,{type:'connect',a,b});return energyAct(p,{type:'check'});}
export function recordEnergyInterval(p:EnergyProgress){for(const type of ['startInterval','finishTrial','observe','recordInterval'] as const)p=energyAct(p,{type});return p;}
export function suppliedEnergy(){let p=energyAct(assembledEnergy(),{type:'supply',on:true});for(let i=0;i<3;i++)p=recordEnergyInterval(p);return p;}
export const finishedEnergy=()=>energyAct(suppliedEnergy(),{type:'conclude',answers:correctEnergyAnswers});
