import { initialRimba, rimbaTransition, type RimbaProgress, type RimbaEvent, type Carrier, type Depot } from '../../src/game/rimbaMission';
export function rimbaAct(p:RimbaProgress,event:RimbaEvent) {const r=rimbaTransition(p,event);if(!r.ok)throw new Error(`${event.type}: ${r.message}`);return r.progress;}
export function preparedRimba(tool:Carrier='bucket',allowCart=true) {
  let p=initialRimba();
  for(const event of [{type:'accept'},...(['map','capacity','supply','habitat'] as const).map(source=>({type:'read' as const,source})),...(['A','B','C'] as const).map(target=>({type:'inspect' as const,target})),{type:'total',ml:24000},{type:'bucket'},...(allowCart?[{type:'parts'},{type:'repair'}]:[]),{type:'select',tool}] as RimbaEvent[])p=rimbaAct(p,event);
  return p;
}
export function transfer(p:RimbaProgress,kind:'fill'|'pour'|'return',amount:number,target?:Depot) {return rimbaAct(p,{type:'transfer',kind,tool:p.activeTool!,amount,target,revision:p.revision});}
export function depart(p:RimbaProgress) {p=rimbaAct(p,{type:'depart'});return rimbaAct(p,{type:'travel',distanceMm:10000,movingMs:3000});}
export function deliveredRimba(tool:Carrier='cart') {
  let p=preparedRimba(tool,tool==='cart');
  if(tool==='cart') {
    p=depart(transfer(p,'fill',12000));p=transfer(p,'pour',8000,'A');p=transfer(p,'pour',4000,'B');p=rimbaAct(p,{type:'openC'});p=rimbaAct(p,{type:'arriveSource'});
    p=depart(transfer(p,'fill',12000));p=transfer(p,'pour',2000,'B');p=transfer(p,'pour',10000,'C');
  } else {
    const loads:[number,Depot][]=[[4000,'A'],[4000,'A'],[4000,'B'],[2000,'B'],[4000,'C'],[4000,'C']];
    for(let i=0;i<loads.length;i++) {
      if(i)p=rimbaAct(p,{type:'arriveSource'});
      p=depart(transfer(p,'fill',4000));p=transfer(p,'pour',loads[i][0],loads[i][1]);
      if(i===0)p=rimbaAct(p,{type:'openC'});
      if(i===3)p=transfer(p,'pour',2000,'C');
    }
  }
  return p;
}
export function finishedRimba(tool:Carrier='cart') {
  let p=deliveredRimba(tool);
  p=rimbaAct(p,{type:'conclude',claim:'capacity-not-content',evidence:p.transfers.find(t=>t.kind==='pour')!.id,efficiency:'one-tool'});
  p=rimbaAct(p,{type:'report'});return rimbaAct(p,{type:'restore',choice:'native-restore'});
}
