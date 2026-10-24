import { initialProgress, parseProgress, type Progress } from './mission';
import { initialGarden, parseGarden, type GardenProgress } from './gardenMission';
import { initialRimba, parseRimba, type RimbaProgress } from './rimbaMission';
export type RegionId = 'town' | 'garden' | 'rimba';
export type MissionId = 'M01' | 'M14' | 'W03-LOG01';
export interface TravelState { region: RegionId; activeMission: MissionId; }
export interface GameState { M01: Progress; M14: GardenProgress; Rimba: RimbaProgress; world: TravelState; }
export interface Backup { version: 3; missions: { M01: Progress; M14: GardenProgress; 'W03-LOG01':RimbaProgress }; world: TravelState; }
export const initialGame = (): GameState => ({ M01: initialProgress(), M14: initialGarden(), Rimba:initialRimba(), world: { region: 'town', activeMission: 'M01' } });
export function parseTravel(raw: unknown): TravelState {
  if (!raw || typeof raw !== 'object') throw new Error('Keadaan wilayah tidak valid.');
  const w = raw as TravelState;
  if (!['town', 'garden','rimba'].includes(w.region) || !['M01', 'M14','W03-LOG01'].includes(w.activeMission)) throw new Error('Keadaan wilayah tidak valid.');
  return { region: w.region, activeMission: w.activeMission };
}
export function makeBackup(p: GameState): Backup { return structuredClone<Backup>({ version: 3, missions: { M01: p.M01, M14: p.M14, 'W03-LOG01':p.Rimba }, world: p.world }); }
export function importBackup(raw: unknown, current: GameState): { game: GameState; scope: 'M01' | 'both' | 'all' } {
  if (!raw || typeof raw !== 'object') throw new Error('Berkas bukan cadangan Jelajah Sains.');
  const b = raw as {version:number;missions?:Record<string,unknown>;world:unknown};
  if (b.version === 1) return { game: { ...structuredClone(current), M01: parseProgress(raw) }, scope: 'M01' };
  if (![2,3].includes(b.version) || !b.missions) throw new Error('Format atau versi cadangan tidak didukung.');
  const garden = parseGarden(b.missions.M14);
  if (current.M14.reward === 100) {
    garden.reward = 100; garden.firstCompletedAt = current.M14.firstCompletedAt;
    garden.accepted = true; garden.supplies = true; garden.sources = { needs: true, fair: true };
  }
  const rimba=b.version===3?parseRimba(b.missions['W03-LOG01']):structuredClone(current.Rimba);
  if(current.Rimba.reward===100){rimba.reward=100;rimba.firstCompletedAt=current.Rimba.firstCompletedAt;}
  return { game: { M01: parseProgress(b.missions.M01), M14: parseGarden(garden), Rimba:parseRimba(rimba), world: parseTravel(b.world) }, scope: b.version===2?'both':'all' };
}
