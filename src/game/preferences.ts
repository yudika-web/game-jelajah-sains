import type { CameraDistance } from '../engine/cameraController';
export interface Preferences { cameraDistance: CameraDistance; reducedMotion: boolean; lowQuality: boolean; }
const key = 'jelajah-sains.preferences.v1';
export function loadPreferences(reducedMotion: boolean): Preferences {
  const defaults: Preferences = { cameraDistance: 'normal', reducedMotion, lowQuality: false };
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!raw || !['near', 'normal', 'far'].includes(raw.cameraDistance) || typeof raw.reducedMotion !== 'boolean' || typeof raw.lowQuality !== 'boolean') return defaults;
    return raw;
  } catch { return defaults; }
}
export function savePreferences(p: Preferences): boolean {
  try { localStorage.setItem(key, JSON.stringify(p)); return true; } catch { return false; }
}
