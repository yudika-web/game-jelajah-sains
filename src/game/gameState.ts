import { initialProgress, parseProgress, type Progress } from './mission';
import { initialGarden, parseGarden, type GardenProgress } from './gardenMission';
export type RegionId = 'town' | 'garden';
export interface TravelState { region: RegionId; activeMission: 'M01' | 'M14'; }
export interface GameState { M01: Progress; M14: GardenProgress; world: TravelState; }
export interface Backup { version: 2; missions: { M01: Progress; M14: GardenProgress }; world: TravelState; }
export const initialGame = (): GameState => ({ M01: initialProgress(), M14: initialGarden(), world: { region: 'town', activeMission: 'M01' } });
export function parseTravel(raw: unknown): TravelState {
  if (!raw || typeof raw !== 'object') throw new Error('Keadaan wilayah tidak valid.');
  const w = raw as TravelState;
  if (!['town', 'garden'].includes(w.region) || !['M01', 'M14'].includes(w.activeMission)) throw new Error('Keadaan wilayah tidak valid.');
  return { region: w.region, activeMission: w.activeMission };
}
export function makeBackup(p: GameState): Backup { return { version: 2, missions: { M01: p.M01, M14: p.M14 }, world: p.world }; }
export function importBackup(raw: unknown, current: GameState): { game: GameState; scope: 'M01' | 'both' } {
  if (!raw || typeof raw !== 'object') throw new Error('Berkas bukan cadangan Jelajah Sains.');
  const b = raw as Backup;
  if ((raw as { version?: number }).version === 1) return { game: { ...structuredClone(current), M01: parseProgress(raw) }, scope: 'M01' };
  if (b.version !== 2 || !b.missions) throw new Error('Format atau versi cadangan tidak didukung.');
  const garden = parseGarden(b.missions.M14);
  // First-completion history is monotonic when restoring older experiments on this device.
  if (current.M14.reward === 100) {
    garden.reward = 100; garden.firstCompletedAt = current.M14.firstCompletedAt;
    garden.accepted = true; garden.supplies = true; garden.sources = { needs: true, fair: true };
  }
  return { game: { M01: parseProgress(b.missions.M01), M14: parseGarden(garden), world: parseTravel(b.world) }, scope: 'both' };
}
