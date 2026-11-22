import { cargoBay, cargoBayRadius, cargoPackageId, cargoRouteIds, cargoRoutes, routeLength, type CargoRoute } from '../data/cargoRegion';
import type { CargoController } from '../engine/cargoController';
import { cargoMaxSpeed, fasterCargo, type CargoReading } from './cargoMotion';

type Prediction = CargoRoute | 'tie';
type Reason = 'time' | 'distance' | 'wide';
interface Decision { route: CargoRoute; reason: Reason }
interface Handover {
  id: typeof cargoPackageId;
  trip: CargoReading;
  parkMm: [number, number];
}
interface CargoEvidence {
  accepted: boolean;
  book: boolean;
  notes: boolean;
  practice: CargoReading | null;
  prediction: Prediction | null;
  records: CargoReading[];
  decision: Decision | null;
  delivered: Handover | null;
}
export interface CargoProgress extends CargoEvidence {
  version: 1;
  completed: boolean;
  reflection: string;
  reward: 0 | 100;
  firstCompletedAt: string | null;
  rewardProof: CargoEvidence | null;
}

export const initialCargo = (): CargoProgress => ({
  version: 1, accepted: false, book: false, notes: false, practice: null, prediction: null,
  records: [], decision: null, delivered: null, completed: false, reflection: '',
  reward: 0, firstCompletedAt: null, rewardProof: null,
});
export const cargoPrepared = (p: CargoProgress) => p.accepted && p.book && p.notes;
export const twoCargoReadings = (p: CargoEvidence) => p.records.length === 2;
export const cargoFastest = (p: CargoEvidence) => twoCargoReadings(p) ? fasterCargo(p.records[0], p.records[1]) : null;

export function cargoSteps(p: CargoProgress) {
  return [
    { place: 'warga', title: 'Terima tugas dari Pak Wira', detail: 'Kirim perlengkapan penelitian ke Kak Lestari.', done: p.accepted },
    { place: p.book ? 'cargoNotes' : 'cargoBook', title: 'Baca buku dan catatan', detail: 'Keduanya ada di W04 Sungai dan Danau.', done: p.book && p.notes },
    { place: 'cargoDepot', title: 'Latihan mengemudi', detail: 'Berbelok, lepas pendorong, rem, parkir, dan turun.', done: !!p.practice },
    { place: 'cargoDepot', title: 'Bandingkan perjalanan A dan B', detail: 'Prediksi, tempuh kedua rute, dan catat pengukuran.', done: twoCargoReadings(p) },
    { place: p.decision ? 'lestari' : 'cargoDepot', title: 'Kirim paket M04-RISET-001', detail: 'Pilih rute dari data, muat paket, dan serahkan setelah parkir.', done: p.completed },
  ] as const;
}

function validReading(r: unknown): r is CargoReading {
  const e = r as CargoReading;
  if (!e || !cargoRouteIds.includes(e.route) || !Number.isSafeInteger(e.distanceMm) || !Number.isSafeInteger(e.elapsedMs)) return false;
  // Passing within 0.52 m of intermediate gates allows small corner cuts.
  const gates = cargoRoutes[e.route].points.length - 2;
  return e.gates === gates && e.distanceMm >= (routeLength(e.route) - (gates - 2) * 1.06 - 1.8) * 1000 &&
    e.elapsedMs > 0 && e.distanceMm <= e.elapsedMs * (e.route === 'A' ? 2 : cargoMaxSpeed) + 6;
}

function validDecision(p: CargoEvidence, decision: Decision) {
  if (!twoCargoReadings(p) || !decision || !cargoRouteIds.includes(decision.route)) return false;
  const choice = p.records.find(r => r.route === decision.route)!;
  switch (decision.reason) {
    case 'time': return cargoFastest(p) === decision.route || cargoFastest(p) === 'tie';
    case 'distance': return p.records.every(r => choice.distanceMm <= r.distanceMm + 10);
    case 'wide': return decision.route === 'B';
    default: return false;
  }
}

function validDelivery(d: Handover | null, decision: Decision | null) {
  return !!d && !!decision && d.id === cargoPackageId && validReading(d.trip) &&
    d.trip.route === decision.route && Array.isArray(d.parkMm) && d.parkMm.length === 2 && d.parkMm.every(Number.isSafeInteger) &&
    Math.hypot(d.parkMm[0] / 1000 - cargoBay.x, d.parkMm[1] / 1000 - cargoBay.z) <= cargoBayRadius + .001;
}

export type CargoEvent =
  | { type: 'accept' | 'practice' | 'record' | 'reset' }
  | { type: 'read'; source: 'book' | 'notes' }
  | { type: 'predict'; prediction: Prediction }
  | { type: 'decide'; route: CargoRoute; reason: Reason }
  | { type: 'deliver'; fastest: Prediction; explanation: string; reflection: string };

export function cargoTransition(p: CargoProgress, event: CargoEvent, truck: CargoController) {
  const result = (ok: boolean, message: string, progress = p) => ({ ok, message, progress });
  if (event.type === 'reset') return result(true, 'M04 diulang. Hadiah pertama dan progres lain tetap tersimpan.',
    { ...initialCargo(), reward: p.reward, firstCompletedAt: p.firstCompletedAt, rewardProof: p.rewardProof });
  if (event.type === 'accept') return result(true, 'Temui tim di dermaga dan baca kedua sumber sebelum berlatih.', p.accepted ? p : { ...p, accepted: true });
  if (!p.accepted) return result(false, 'Terima tugas dari Pak Wira di Kota Sains.');
  switch (event.type) {
    case 'read': return result(true, 'Sumber dicatat.', p[event.source] ? p : { ...p, [event.source]: true });
    case 'practice': {
      const practice = truck.reading;
      if (!cargoPrepared(p) || !truck.practicePassed || !validReading(practice)) {
        return result(false, 'Berbelok, lepas pendorong, rem saat bergerak, lalu parkir dan turun.');
      }
      return result(true, 'Latihan selesai. Bandingkan dua pengiriman latihan.', p.practice ? p : { ...p, practice });
    }
    case 'predict':
      if (!p.practice || p.records.length || !['A', 'B', 'tie'].includes(event.prediction)) return result(false, 'Simpan prediksi setelah latihan, sebelum mencatat hasil.');
      return result(true, 'Prediksi tersimpan di jurnal.', p.prediction ? p : { ...p, prediction: event.prediction });
    case 'record': {
      const reading = truck.reading;
      if (!p.practice || !p.prediction || truck.run?.kind !== 'test' || truck.aboard || !validReading(reading)) {
        return result(false, 'Lewati semua gerbang, parkir, lalu turun sebelum mencatat.');
      }
      if (p.records.some(r => r.route === reading.route)) return result(true, 'Rute ini sudah tercatat.');
      return result(true, `Uji ${reading.route} tercatat.`, { ...p, records: [...p.records, reading] });
    }
    case 'decide': {
      if (truck.run?.kind === 'delivery' || p.completed) return result(false, 'Siapkan ulang paket sebelum mengganti pilihan rute.');
      const decision = { route: event.route, reason: event.reason };
      return validDecision(p, decision) ? result(true, 'Pilihan kiriman dicatat.', { ...p, decision }) :
        result(false, 'Cocokkan alasan dengan jarak, waktu, atau lebar jalan yang dipilih.');
    }
    case 'deliver': {
      if (p.completed) return result(true, 'Paket sudah diterima Kak Lestari.');
      const trip = truck.reading;
      if (truck.run?.kind !== 'delivery' || truck.aboard || !trip || truck.parked !== 'bay' || cargoDistanceFromBay(truck) > cargoBayRadius) {
        return result(false, 'Antarkan paket, parkir di petak dermaga, lalu turun.');
      }
      if (event.fastest !== cargoFastest(p) || event.explanation !== 'both') return result(false, 'Baca waktu kedua rute dan perhatikan perbedaan lintasan serta batas kelajuan.');
      if (event.reflection.length > 1000) return result(false, 'Refleksi maksimal 1.000 karakter.');
      const delivered: Handover = { id: cargoPackageId, trip, parkMm: [Math.round(truck.position.x * 1000), Math.round(truck.position.z * 1000)] };
      if (!validDelivery(delivered, p.decision)) return result(false, 'Paket dan bukti parkir belum sesuai.');
      const { accepted, book, notes, practice, prediction, records, decision } = p;
      return result(true, p.reward ? 'Paket diterima. Hadiah pertama sudah tercatat.' : 'Paket diterima! 100 XP dan 100 Koin Sains.',
        { ...p, delivered, completed: true, reflection: event.reflection, reward: 100,
          firstCompletedAt: p.firstCompletedAt ?? new Date().toISOString(),
          rewardProof: p.rewardProof ?? { accepted, book, notes, practice, prediction, records, decision, delivered } });
    }
  }
}

function cargoDistanceFromBay(truck: CargoController) {
  return Math.hypot(truck.position.x - cargoBay.x, truck.position.z - cargoBay.z);
}

function validEvidence(p: CargoEvidence) {
  if (!p || ![p.accepted, p.book, p.notes].every(x => typeof x === 'boolean') ||
    (!p.accepted && (p.book || p.notes)) || !Array.isArray(p.records) || p.records.length > 2) return false;
  if (p.practice !== null && (!p.accepted || !p.book || !p.notes || !validReading(p.practice) || p.practice.route !== 'A')) return false;
  if (p.prediction !== null && (!p.practice || !['A', 'B', 'tie'].includes(p.prediction))) return false;
  if (p.records.length && (!p.prediction || !p.records.every(validReading) ||
    new Set(p.records.map(r => r.route)).size !== p.records.length)) return false;
  if (p.decision !== null && !validDecision(p, p.decision)) return false;
  return p.delivered === null || validDelivery(p.delivered, p.decision);
}

export function parseCargo(raw: unknown): CargoProgress {
  const p = raw as CargoProgress;
  if (!p || p.version !== 1 || !validEvidence(p) || typeof p.completed !== 'boolean' || p.completed !== !!p.delivered ||
    typeof p.reflection !== 'string' || p.reflection.length > 1000 || (!p.completed && p.reflection !== '') ||
    (p.completed && p.reward !== 100) || (p.reward === 100 ?
      typeof p.firstCompletedAt !== 'string' || !Number.isFinite(Date.parse(p.firstCompletedAt)) ||
      !p.rewardProof?.delivered || !validEvidence(p.rewardProof) :
      p.reward !== 0 || p.firstCompletedAt !== null || p.rewardProof !== null)) throw Error('M04 tidak valid: periksa rute, pengiriman, dan hadiah.');
  return structuredClone(p);
}
