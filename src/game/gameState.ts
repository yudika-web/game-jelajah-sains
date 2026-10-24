import {initialWorkshop,parseWorkshop,type WorkshopProgress} from './workshopMission';
import {initialBuoyancy,parseBuoyancy,type BuoyancyProgress} from './buoyancyMission';
import { initialIrrigation,parseIrrigation,type IrrigationProgress } from './irrigationMission';
import { initialRiver, parseRiver, type RiverProgress } from './riverMission';
import { initialProgress, parseProgress, type Progress } from './mission';
import { initialGarden, parseGarden, type GardenProgress } from './gardenMission';
import { initialRimba, parseRimba, type RimbaProgress } from './rimbaMission';
export type RegionId = 'town' | 'garden' | 'rimba' | 'river' | 'workshop';
export type MissionId = 'M01' | 'M14' | 'W03-LOG01' | 'S13' | 'S14' | 'S15' | 'M17-E1';
export interface TravelState { region: RegionId; activeMission: MissionId; }
export interface GameState { M01: Progress; M14: GardenProgress; Rimba: RimbaProgress; S13: RiverProgress; S14:BuoyancyProgress; S15:IrrigationProgress; M17E1:WorkshopProgress; world: TravelState; }
export interface Backup { version: 7; missions: { M01: Progress; M14: GardenProgress; 'W03-LOG01':RimbaProgress; S13: RiverProgress; S14:BuoyancyProgress; S15:IrrigationProgress; 'M17-E1':WorkshopProgress }; world: TravelState; }
export const initialGame = (): GameState => ({ M01: initialProgress(), M14: initialGarden(), Rimba:initialRimba(), S13:initialRiver(), S14:initialBuoyancy(), S15:initialIrrigation(), M17E1:initialWorkshop(), world: { region: 'town', activeMission: 'M01' } });
export function parseTravel(raw: unknown): TravelState {
  if (!raw || typeof raw !== 'object') throw new Error('Keadaan wilayah tidak valid.');
  const w = raw as TravelState;
  if (!['town', 'garden','rimba','river','workshop'].includes(w.region) || !['M01', 'M14','W03-LOG01','S13','S14','S15','M17-E1'].includes(w.activeMission)) throw new Error('Keadaan wilayah tidak valid.');
  return { region: w.region, activeMission: w.activeMission };
}
export function makeBackup(p: GameState): Backup { return structuredClone<Backup>({ version: 7, missions: { M01: p.M01, M14: p.M14, 'W03-LOG01':p.Rimba, S13:p.S13, S14:p.S14, S15:p.S15, 'M17-E1':p.M17E1 }, world: p.world }); }
export function importBackup(raw: unknown, current: GameState): { game: GameState; scope: 'M01' | 'both' | 'three' | 'four' | 'five' | 'six' | 'all' } {
  if (!raw || typeof raw !== 'object') throw new Error('Berkas bukan cadangan Jelajah Sains.');
  const b = raw as {version:number;missions?:Record<string,unknown>;world:unknown};
  if (b.version === 1) return { game: { ...structuredClone(current), M01: parseProgress(raw) }, scope: 'M01' };
  if (![2,3,4,5,6,7].includes(b.version) || !b.missions) throw new Error('Format atau versi cadangan tidak didukung.');
  const garden = parseGarden(b.missions.M14);
  if (current.M14.reward === 100) {
    garden.reward = 100; garden.firstCompletedAt = current.M14.firstCompletedAt;
    garden.accepted = true; garden.supplies = true; garden.sources = { needs: true, fair: true };
  }
  const rimba=b.version>=3?parseRimba(b.missions['W03-LOG01']):structuredClone(current.Rimba);
  if(current.Rimba.reward===100){rimba.reward=100;rimba.firstCompletedAt=current.Rimba.firstCompletedAt;}
  const river=b.version>=4?parseRiver(b.missions.S13):structuredClone(current.S13);
  if(current.S13.reward===50){river.reward=50;river.firstCompletedAt=current.S13.firstCompletedAt;}
  const buoyancy=b.version>=5?parseBuoyancy(b.missions.S14):structuredClone(current.S14);if(current.S14.reward===50){buoyancy.reward=50;buoyancy.firstCompletedAt=current.S14.firstCompletedAt;}
  const irrigation=b.version>=6?parseIrrigation(b.missions.S15):structuredClone(current.S15);if(current.S15.reward===50){irrigation.reward=50;irrigation.firstCompletedAt=current.S15.firstCompletedAt;}
  const workshop=b.version>=7?parseWorkshop(b.missions['M17-E1']):structuredClone(current.M17E1);
  if(current.M17E1.reward===50&&workshop.reward===0){workshop.reward=50;workshop.firstCompletedAt=current.M17E1.firstCompletedAt;workshop.rewardProof=structuredClone(current.M17E1.rewardProof);workshop.epoch=Math.max(workshop.epoch,current.M17E1.epoch,1);workshop.revision=workshop.epoch+workshop.history.length;}
  return { game: { M01: parseProgress(b.missions.M01), M14: parseGarden(garden), Rimba:parseRimba(rimba), S13:parseRiver(river), S14:parseBuoyancy(buoyancy), S15:parseIrrigation(irrigation), M17E1:parseWorkshop(workshop), world: parseTravel(b.world) }, scope: b.version===2?'both':b.version===3?'three':b.version===4?'four':b.version===5?'five':b.version===6?'six':'all' };
}
