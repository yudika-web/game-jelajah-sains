import { gardenTransition, initialGarden, observationDays, type GardenEvent, type GardenProgress } from '../../src/game/gardenMission';
export function gardenAct(p: GardenProgress, event: GardenEvent) {
  const r=gardenTransition(p,event); if(!r.ok) throw new Error(r.message); return r.progress;
}
export function preparedGarden() {
  let p=initialGarden();
  for(const e of [{type:'accept'},{type:'read',source:'needs'},{type:'read',source:'fair'},
    {type:'plan',variable:'water',controls:'same',water:'100-50'},{type:'borrow'},
    {type:'plant',group:'A',seed:'mung'},{type:'plant',group:'B',seed:'mung'}] as GardenEvent[]) p=gardenAct(p,e);
  return p;
}
export function observedGarden(until=6) {
  let p=preparedGarden();
  for(let day=0;day<=until;day++) {
    if(observationDays.includes(day as 0|2|4|6)) for(const group of ['A','B'] as const) p=gardenAct(p,{type:'measure',day,group});
    if(day===until) break;
    if(p.can<450) p=gardenAct(p,{type:'fill'});
    for(const group of ['A','B'] as const) p=gardenAct(p,{type:'water',day,group});
    p=gardenAct(p,{type:'advance',day});
  }
  return p;
}
export function finishedGarden() {return gardenAct(observedGarden(),{type:'conclude',claim:'model-A',evidence:'day6-8-5',limit:'limited'});}
