import {magnetPairs,magnetTerminals,coilModules,coilCapacity,type MagnetTerminal,type CoilModule} from '../data/electromagnetContent';
export interface ElectromagnetCircuit {core:boolean;coil:CoilModule|null;connections:[MagnetTerminal,MagnetTerminal][];checked:boolean;sourceOn:boolean;switchClosed:boolean;}
export const isCoil=(value:unknown):value is CoilModule=>coilModules.includes(value as CoilModule);
export const isMagnetTerminal=(value:unknown):value is MagnetTerminal=>typeof value==='string'&&Object.hasOwn(magnetTerminals,value);
export const pairKey=(a:MagnetTerminal,b:MagnetTerminal)=>[a,b].sort().join(':');
export function magnetConnection(a:MagnetTerminal,b:MagnetTerminal){if(pairKey(a,b)===pairKey('I+','I-'))return'short';return magnetPairs.some(([x,y])=>pairKey(x,y)===pairKey(a,b))?'valid':'wrong';}
export function evaluateElectromagnet(c:ElectromagnetCircuit){const closed=c.core&&c.coil!==null&&magnetPairs.every(([a,b])=>c.connections.some(([x,y])=>pairKey(a,b)===pairKey(x,y)));return{closed,active:closed&&c.checked&&c.sourceOn&&c.switchClosed,capacity:closed&&c.coil!==null?coilCapacity(c.coil):0,currentA:closed&&c.sourceOn&&c.switchClosed?.2:0};}
