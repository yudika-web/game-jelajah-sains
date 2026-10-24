import {parseWorkshop} from './workshopMission';
import {parseBuoyancy} from './buoyancyMission';
import { parseIrrigation } from './irrigationMission';
import { parseRiver } from './riverMission';
import { parseProgress, type Progress } from './mission';
import { parseRimba } from './rimbaMission';
import { parseGarden } from './gardenMission';
import { initialGame, parseTravel, type GameState } from './gameState';

// Schema 1 already has the generic "saves" store. New mission keys need no upgrade.
const open = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('jelajah-sains', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('saves');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Tutup tab permainan lama lalu coba lagi.'));
});
async function readKeys(keys: string[]) {
  const db = await open();
  try {
    return await new Promise<Record<string, unknown>>((resolve, reject) => {
      const values: Record<string, unknown> = {}, tx = db.transaction('saves');
      for (const key of keys) {
        const r = tx.objectStore('saves').get(key); r.onsuccess = () => { values[key] = r.result; };
      }
      tx.oncomplete = () => resolve(values); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
async function writeKeys(entries: [string, unknown][]) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      for (const [key, value] of entries) tx.objectStore('saves').put(value, key);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function loadProgress(): Promise<Progress | null> {
  const values = await readKeys(['M01']); return values.M01 === undefined ? null : parseProgress(values.M01);
}
export async function saveProgress(p: Progress): Promise<void> { await writeKeys([['M01', p]]); }
export async function loadGame(): Promise<GameState> {
  const values = await readKeys(['M01', 'M14', 'W03-LOG01', 'S13', 'S14', 'S15', 'M17-E1', 'world']);
  const game = initialGame();
  if (values.M01 !== undefined) game.M01 = parseProgress(values.M01);
  if (values.M14 !== undefined) game.M14 = parseGarden(values.M14);
  if (values['W03-LOG01'] !== undefined) game.Rimba = parseRimba(values['W03-LOG01']);
  if(values.S13!==undefined)game.S13=parseRiver(values.S13);
  if(values.S14!==undefined)game.S14=parseBuoyancy(values.S14);
  if(values.S15!==undefined)game.S15=parseIrrigation(values.S15);
  if(values['M17-E1']!==undefined)game.M17E1=parseWorkshop(values['M17-E1']);
  if (values.world !== undefined) game.world = parseTravel(values.world);
  return game;
}
export async function saveGame(p: GameState): Promise<void> { await writeKeys([['M01', p.M01], ['M14', p.M14], ['W03-LOG01',p.Rimba], ['S13',p.S13], ['S14',p.S14], ['S15',p.S15], ['M17-E1',p.M17E1], ['world', p.world]]); }
