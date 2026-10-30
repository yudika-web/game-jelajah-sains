import {readFileSync} from 'node:fs';
import {initialGame,importBackup,makeBackup,type GameState} from '../../src/game/gameState';
import {initialProgress,transition,type MissionEvent} from '../../src/game/mission';
import {finishedGarden} from './garden';
export function completeCoinFixture(){
 const g=importBackup(JSON.parse(readFileSync('tests/fixtures/all-through-m07-v16.json','utf8')),initialGame()).game;
 let p=initialProgress();
 for(const e of [{type:'accept'},{type:'hypothesis'},{type:'read',source:'book'},{type:'read',source:'rain'},{type:'plan',tool:'turbidity',variable:'location',control:'rain'},{type:'measure',sample:'A'},{type:'measure',sample:'B'},{type:'trial'},{type:'conclude',answer:'sediment'}] as MissionEvent[])p=transition(p,e).progress;
 g.M01=p;g.M14=finishedGarden();return g;
}
export function legacyCoinBackup(g:GameState=completeCoinFixture()){
 const b=makeBackup(g) as any;b.version=18;delete b.economy;return b;
}
export function readyCoinM01(){const g=initialGame();g.M01=JSON.parse(readFileSync('tests/fixtures/m01-v1.json','utf8'));g.M01=transition(g.M01,{type:'trial'}).progress;return g;}
