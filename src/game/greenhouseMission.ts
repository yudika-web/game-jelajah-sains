import { initialC, outsideC, heatCases, sampleHeat, meetsHeatTarget, type HeatCase } from './greenhouseModel';
import { predictions, type GreenhouseSession, type Prediction } from './greenhouseSession';

interface HeatRecord {
  key: HeatCase;
  prediction: Prediction;
  correction: Prediction | null;
}

// The sample schedule and readings are reconstructed from the recorded setup
// and model version. There are no editable temperatures in the save.
const conclusion = { comparison: 'one-factor', solution: 'combined' } as const;
type Conclusion = typeof conclusion;

interface Evidence {
  accepted: boolean;
  book: boolean;
  notes: boolean;
  borrowed: boolean;
  checked: boolean;
  insideC: number | null;
  outsideC: number | null;
  records: HeatRecord[];
  conclusion: Conclusion | null;
}
export interface GreenhouseProgress extends Evidence {
  version: 1;
  completed: boolean;
  reflection: string;
  reward: 0 | 100;
  firstCompletedAt: string | null;
  rewardProof: Evidence | null;
}

export const initialGreenhouse = (): GreenhouseProgress => ({
  version: 1, accepted: false, book: false, notes: false, borrowed: false, checked: false,
  insideC: null, outsideC: null, records: [], conclusion: null, completed: false, reflection: '',
  reward: 0, firstCompletedAt: null, rewardProof: null,
});

export const heatReady = (p: Evidence) => p.accepted && p.book && p.notes && p.borrowed &&
  p.checked && p.insideC === initialC && p.outsideC === outsideC;
export const comparedHeat = (p: Evidence) => heatCases.slice(0, 3).every(key => p.records.some(r => r.key === key));
export const solvedHeat = (p: Evidence) => heatReady(p) && comparedHeat(p) &&
  p.records.some(r => r.key === 'D' && meetsHeatTarget(sampleHeat(r.key).at(-1)!));
export const heatCheckpoint = (p: GreenhouseProgress) => p.completed ? 3 : comparedHeat(p) ? 2 : heatReady(p) ? 1 : 0;

export function heatSteps(p: GreenhouseProgress) {
  return [
    { place: 'sari', title: 'Temui Bu Sari', detail: 'Terima tugas rumah semai.', done: p.accepted },
    { place: !p.book ? 'heatBook' : !p.notes ? 'heatNotes' : !p.checked ? 'heatMeter' : p.outsideC === null ? 'heatOutside' : 'heatInside',
      title: 'Periksa alat dan ukur', detail: 'Baca dua sumber, lalu ukur di dalam dan di luar.', done: heatReady(p) },
    { place: 'heatInside', title: 'Bandingkan A, B, dan C', detail: 'Ubah satu hal setiap kali dan catat data.', done: comparedHeat(p) },
    { place: p.records.some(r => r.key === 'D') ? 'heatInside' : 'heatShade', title: 'Pasang dan uji solusi', detail: 'Uji peneduh dan ventilasi bersama.', done: solvedHeat(p) },
    { place: 'sari', title: 'Laporkan hasil ke Bu Sari', detail: 'Jelaskan pengaruh tiap perubahan dengan data.', done: p.completed },
  ] as const;
}

export function canStartHeat(p: GreenhouseProgress, key: HeatCase) {
  return heatReady(p) && !p.records.some(r => r.key === key) &&
    (key === 'A' || (key === 'D' ? comparedHeat(p) : p.records.some(r => r.key === 'A')));
}

export type HeatEvent =
  | { type: 'accept' | 'borrow' | 'check' | 'reset' }
  | { type: 'read'; source: 'book' | 'notes' }
  | { type: 'baseline'; location: 'inside' | 'outside' }
  | { type: 'record' }
  | { type: 'report'; comparison: string; solution: string; reflection: string };

export function greenhouseTransition(p: GreenhouseProgress, event: HeatEvent, session: GreenhouseSession) {
  const reject = (message: string) => ({ progress: p, ok: false, message });
  const accept = (progress: GreenhouseProgress, message: string) => ({ progress, ok: true, message });
  if (event.type === 'reset') {
    return accept({ ...initialGreenhouse(), reward: p.reward, firstCompletedAt: p.firstCompletedAt,
      rewardProof: p.rewardProof }, 'M03 dimulai ulang. Hadiah pertama, pembelian, dan misi lain tetap tersimpan.');
  }
  if (event.type === 'accept') return accept(p.accepted ? p : { ...p, accepted: true }, 'Tugas diterima. Baca kedua sumber di kebun.');
  if (!p.accepted) return reject('Temui Bu Sari untuk menerima M03.');
  switch (event.type) {
    case 'read':
      return accept(p[event.source] ? p : { ...p, [event.source]: true }, 'Sumber dicatat di jurnal M03.');
    case 'borrow':
      return accept(p.borrowed ? p : { ...p, borrowed: true }, 'Termometer digital dipinjam.');
    case 'check':
      return p.borrowed ? accept(p.checked ? p : { ...p, checked: true }, 'Acuan 30,0 °C sesuai dengan bacaan alat.')
        : reject('Ambil termometer dahulu.');
    case 'baseline': {
      if (!p.checked || session.locked) return reject('Periksa termometer dan siapkan ulang sebelum mengukur kondisi awal.');
      if (event.location === 'inside' && (session.shade || session.vent)) return reject('Lepas peneduh dan tutup ventilasi untuk pengukuran awal di dalam.');
      const key = event.location === 'inside' ? 'insideC' : 'outsideC';
      return accept(p[key] !== null ? p : { ...p, [key]: event.location === 'inside' ? initialC : outsideC }, 'Suhu awal dicatat.');
    }
    case 'record': {
      const { key, prediction, correction, finished, observed } = session;
      if (!finished || !observed || !prediction || !canStartHeat(p, key)) return reject('Selesaikan uji yang sesuai dan amati bacaan sebelum mencatat.');
      return accept({ ...p, records: [...p.records, { key, prediction, correction }] }, `Uji ${key} tercatat. Siapkan ulang sebelum mengubah alat.`);
    }
    case 'report': {
      if (p.completed) return accept(p, 'M03 sudah selesai. Hadiah pertama tetap tercatat.');
      if (!solvedHeat(p) || !session.shade || !session.vent) return reject('Lengkapi uji dan pastikan peneduh terpasang serta ventilasi terbuka. Pasang kembali bila baru memuat permainan.');
      if (event.comparison !== conclusion.comparison || event.solution !== conclusion.solution) return reject('Gunakan A–B dan A–C untuk menjelaskan tiap perubahan, lalu gunakan D untuk menilai target latihan.');
      if (event.reflection.length > 1000) return reject('Refleksi maksimal 1.000 karakter.');
      const { accepted, book, notes, borrowed, checked, insideC, outsideC, records } = p;
      return accept({ ...p, completed: true, conclusion, reflection: event.reflection, reward: 100,
        firstCompletedAt: p.firstCompletedAt ?? new Date().toISOString(),
        rewardProof: p.rewardProof ?? { accepted, book, notes, borrowed, checked, insideC, outsideC, records, conclusion },
      }, p.reward ? 'M03 selesai lagi. Hadiah pertama sudah tercatat.' : 'M03 selesai! 100 XP dan 100 Koin Sains diberikan satu kali.');
    }
  }
}

function validEvidence(p: Evidence) {
  if (!p || ![p.accepted, p.book, p.notes, p.borrowed, p.checked].every(v => typeof v === 'boolean') ||
    (p.insideC !== null && p.insideC !== initialC) || (p.outsideC !== null && p.outsideC !== outsideC) ||
    !Array.isArray(p.records) || p.records.length > 4) return false;
  if (!p.accepted && (p.book || p.notes || p.borrowed) || p.checked && !p.borrowed ||
    (p.insideC !== null || p.outsideC !== null) && !p.checked || p.records.length > 0 && !heatReady(p)) return false;
  const seen = new Set<HeatCase>();
  for (const r of p.records) {
    if (!r || !heatCases.includes(r.key) || seen.has(r.key) || !predictions.includes(r.prediction) ||
      (r.correction !== null && !predictions.includes(r.correction)) ||
      (r.key !== 'A' && !seen.has('A')) || (r.key === 'D' && seen.size !== 3)) return false;
    seen.add(r.key);
  }
  return p.conclusion === null || (p.conclusion?.comparison === conclusion.comparison &&
    p.conclusion.solution === conclusion.solution && solvedHeat(p));
}

export function parseGreenhouse(raw: unknown): GreenhouseProgress {
  const p = raw as GreenhouseProgress;
  if (!p || p.version !== 1 || !validEvidence(p) || typeof p.completed !== 'boolean' ||
    typeof p.reflection !== 'string' || p.reflection.length > 1000 ||
    (p.completed ? p.conclusion === null || p.reward !== 100 : p.conclusion !== null || p.reflection !== '') ||
    (p.reward === 100 ? typeof p.firstCompletedAt !== 'string' || !Number.isFinite(Date.parse(p.firstCompletedAt)) ||
      !p.rewardProof || p.rewardProof.conclusion === null || !validEvidence(p.rewardProof)
      : p.reward !== 0 || p.firstCompletedAt !== null || p.rewardProof !== null)) {
    throw Error('M03 tidak valid: periksa pengukuran, urutan uji dan bukti hadiah.');
  }
  return structuredClone(p);
}
