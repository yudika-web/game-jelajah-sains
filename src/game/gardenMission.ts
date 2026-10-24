export type Group = 'A' | 'B';
export const groups: Group[] = ['A', 'B'];
export const observationDays = [0, 2, 4, 6] as const;
export const capacity = 1000;
export const doses = { A: 300, B: 150 };
const model: Record<number, Record<Group, [number, number, number]>> = {
  0: { A: [0, 0, 0], B: [0, 0, 0] }, 2: { A: [2, 2, 2], B: [1, 1, 1] },
  4: { A: [5, 4, 6], B: [3, 2, 4] }, 6: { A: [8, 7, 9], B: [5, 4, 6] },
};
export interface Measurement { day: number; group: Group; heights: [number, number, number]; }
export interface GardenProgress {
  version: 1; accepted: boolean; sources: { needs: boolean; fair: boolean }; plan: boolean; supplies: boolean;
  planted: Record<Group, boolean>; day: number; can: number; tank: number;
  watered: Record<Group, boolean>[]; measurements: Measurement[];
  attempts: { claim: string; evidence: string; limit: string; correct: boolean }[];
  reflection: string; completed: boolean; reward: 0 | 100; firstCompletedAt: string | null;
}
export const initialGarden = (): GardenProgress => ({
  version: 1, accepted: false, sources: { needs: false, fair: false }, plan: false, supplies: false,
  planted: { A: false, B: false }, day: 0, can: 0, tank: 5000,
  watered: Array.from({ length: 6 }, () => ({ A: false, B: false })), measurements: [], attempts: [],
  reflection: '', completed: false, reward: 0, firstCompletedAt: null,
});
export type GardenEvent =
  | { type: 'accept' } | { type: 'read'; source: 'needs' | 'fair' } | { type: 'borrow' }
  | { type: 'plan'; variable: string; controls: string; water: string }
  | { type: 'plant'; group: Group; seed: string }
  | { type: 'fill' } | { type: 'water' | 'measure'; group: Group; day: number }
  | { type: 'advance'; day: number }
  | { type: 'conclude'; claim: string; evidence: string; limit: string }
  | { type: 'reflect'; text: string } | { type: 'reset' };
export function heightsAt(day: number, group: Group): [number, number, number] {
  const lower = Math.floor(day / 2) * 2, upper = Math.min(6, lower + 2);
  return model[lower][group].map((h, i) => h + (model[upper][group][i] - h) * (day - lower) / 2) as [number, number, number];
}
export const average = (values: readonly number[]) => values.reduce((sum, n) => sum + n, 0) / values.length;
export const seedsRemaining = (p: GardenProgress) => p.supplies ? 6 - groups.filter(g => p.planted[g]).length * 3 : 0;
export const measured = (p: GardenProgress, day: number, group: Group) => p.measurements.some(m => m.day === day && m.group === group);
export function completeEvidence(p: GardenProgress) {
  return p.accepted && p.sources.needs && p.sources.fair && p.plan && p.supplies && p.planted.A && p.planted.B &&
    p.day === 6 && p.watered.every(w => w.A && w.B) && observationDays.every(d => groups.every(g => measured(p, d, g)));
}
export function gardenTransition(p: GardenProgress, e: GardenEvent): { progress: GardenProgress; ok: boolean; message: string } {
  const reject = (message: string) => ({ progress: p, ok: false, message });
  const unchanged = (message: string) => ({ progress: p, ok: true, message });
  if (e.type !== 'accept' && !p.accepted) return reject('Temui Bu Sari untuk menerima M14 terlebih dahulu.');
  const next = structuredClone(p);
  let message = '';
  switch (e.type) {
    case 'accept':
      if (p.accepted) return unchanged('M14 sudah diterima. Buka jurnal untuk melihat langkahmu.');
      next.accepted = true; message = 'M14 diterima. Baca buku kebutuhan tumbuhan dan catatan percobaan adil.'; break;
    case 'read': next.sources[e.source] = true; message = 'Sumber pengetahuan dicatat di jurnal M14.'; break;
    case 'borrow':
      if (p.supplies) return unchanged('Pinjaman lengkap: benih tersisa, penyiram, penggaris, dan kartu tumbuhan tetap ada di Tas.');
      next.supplies = true; message = 'Enam benih kacang hijau, penyiram 1.000 mL, penggaris, dan kartu tumbuhan dipinjamkan.'; break;
    case 'plan':
      if (e.variable !== 'water' || e.controls !== 'same' || e.water !== '100-50') return reject('Ubah jumlah air saja: A 100 mL dan B 50 mL per tanaman. Samakan benih, pot, media, cahaya, dan waktu. Jika cahaya juga berubah, kita tidak tahu penyebab perbedaannya.');
      next.plan = true; message = 'Rencana adil: jumlah air berbeda; benih, pot, media, cahaya, dan waktu sama.'; break;
    case 'plant':
      if (!p.plan || !p.supplies) return reject('Buat rencana bersama Bu Sari dan ambil benih di tempat alat terlebih dahulu.');
      if (e.seed !== 'mung') return reject('Gunakan benih kacang hijau yang sama untuk kedua kelompok.');
      if (p.planted[e.group]) return unchanged(`Tiga benih kelompok ${e.group} sudah ditanam. Benih tidak dikurangi lagi.`);
      next.planted[e.group] = true; message = `Tiga benih kelompok ${e.group} ditanam dan diberi nomor 1–3.`; break;
    case 'fill': {
      if (!p.supplies) return reject('Pinjam penyiram dari tempat benih dan alat.');
      const transfer = Math.min(capacity - p.can, p.tank);
      if (!transfer) return unchanged(p.can === capacity ? 'Penyiram sudah penuh.' : 'Tandon kosong. Ulangi percobaan melalui Pengaturan bila ingin mulai lagi.');
      next.can += transfer; next.tank -= transfer;
      message = `${transfer.toLocaleString('id-ID')} mL dipindahkan. Isi penyiram ${next.can} mL; sisa tandon ${next.tank} mL.`; break;
    }
    case 'water':
      if (e.day !== p.day) return reject('Hari sudah berubah. Buka kembali tindakan hari ini.');
      if (!p.planted.A || !p.planted.B) return reject('Tanam kedua kelompok terlebih dahulu.');
      if (p.day >= 6) return reject('Perlakuan hari 0–5 sudah berakhir. Ukur hasil hari 6.');
      if (p.watered[p.day][e.group]) return unchanged(`Kelompok ${e.group} sudah disiram hari ${p.day}. Dosis tidak digandakan.`);
      if (p.can < doses[e.group]) return reject(`Perlu ${doses[e.group]} mL untuk tiga tanaman sekaligus. Isi penyiram di tandon; belum ada air yang digunakan.`);
      next.can -= doses[e.group]; next.watered[p.day][e.group] = true;
      message = `Hari ${p.day}: ${e.group}1, ${e.group}2, ${e.group}3 masing-masing menerima ${doses[e.group] / 3} mL. Total ${doses[e.group]} mL.`; break;
    case 'measure':
      if (e.day !== p.day || !observationDays.includes(p.day as 0 | 2 | 4 | 6)) return reject('Pengukuran wajib hanya pada hari simulasi 0, 2, 4, dan 6 yang sedang berlangsung.');
      if (!p.planted.A || !p.planted.B || !p.supplies) return reject('Tanam enam benih dan siapkan penggaris dahulu.');
      if (measured(p, p.day, e.group)) return unchanged('Pengukuran kelompok dan hari ini sudah tercatat.');
      next.measurements.push({ day: p.day, group: e.group, heights: heightsAt(p.day, e.group) });
      message = `Tinggi ${e.group}1–${e.group}3: ${heightsAt(p.day, e.group).join(', ')} cm. Rata-rata ${average(heightsAt(p.day, e.group))} cm.`; break;
    case 'advance':
      if (e.day !== p.day || p.day >= 6) return reject('Hari tidak dimajukan lagi oleh tindakan yang sama.');
      if (!p.watered[p.day].A || !p.watered[p.day].B) return reject('Siram kedua kelompok sesuai dosis hari ini sebelum melanjutkan.');
      if (observationDays.includes(p.day as 0 | 2 | 4 | 6) && !groups.every(g => measured(p, p.day, g))) return reject('Catat pengukuran kedua kelompok pada hari pengamatan wajib sebelum melanjutkan.');
      next.day++; message = `Hari simulasi ${next.day}. Pertumbuhan dipercepat oleh model, bukan oleh waktu nyata.`; break;
    case 'conclude': {
      if (!completeEvidence(p)) return reject('Lengkapi dua sumber, rencana, enam tanaman, perlakuan 6 hari, dan pengukuran hari 0, 2, 4, 6.');
      if (p.completed) return unchanged('M14 sudah selesai. Hadiah pertama tetap 100 XP dan tidak ditambah lagi.');
      const correct = e.claim === 'model-A' && e.evidence === 'day6-8-5' && e.limit === 'limited';
      if (p.attempts.length >= 1000) return reject('Batas catatan upaya tercapai. Ulangi percobaan bila diperlukan.');
      next.attempts.push({ claim: e.claim, evidence: e.evidence, limit: e.limit, correct });
      if (!correct) return { progress: next, ok: false, message: 'Gunakan data hari 6: rata-rata A 8 cm dan B 5 cm. Hasil berlaku pada kondisi model ini; air tanpa batas dan jenis tanaman lain belum diuji.' };
      next.completed = true; next.reward = 100; next.firstCompletedAt ??= new Date().toISOString();
      message = p.reward ? 'M14 selesai lagi. Hadiah pertama sudah tercatat; XP tidak digandakan.' : 'M14 selesai! 100 XP diberikan satu kali. A tumbuh lebih tinggi pada kondisi model ini.'; break;
    }
    case 'reflect':
      if (e.text.length > 1000) return reject('Refleksi maksimal 1.000 karakter.');
      next.reflection = e.text; message = 'Refleksi disimpan untuk dibaca guru; tidak dinilai dengan kata kunci.'; break;
    case 'reset': {
      const fresh = initialGarden();
      fresh.accepted = p.accepted; fresh.sources = { ...p.sources }; fresh.supplies = p.supplies;
      fresh.reward = p.reward; fresh.firstCompletedAt = p.firstCompletedAt;
      return { progress: fresh, ok: true, message: 'Percobaan M14 diulang. M01, pengetahuan yang dibaca, dan catatan hadiah pertama tetap tersimpan.' };
    }
  }
  return { progress: next, ok: true, message };
}
export function gardenSteps(p: GardenProgress) {
  const daily = p.day === 6 ? 'recordTable' : !p.watered[p.day].A ? 'plotA' : !p.watered[p.day].B ? 'plotB' :
    observationDays.includes(p.day as 0 | 2 | 4 | 6) && !measured(p, p.day, 'A') ? 'plotA' :
    observationDays.includes(p.day as 0 | 2 | 4 | 6) && !measured(p, p.day, 'B') ? 'plotB' : 'recordTable';
  return [
    { title: 'Temui Bu Sari', detail: 'Mulai M14 di pos kebun.', done: p.accepted, place: 'sari' },
    { title: 'Baca dua sumber', detail: 'Kebutuhan tumbuhan & percobaan adil.', done: p.sources.needs && p.sources.fair, place: p.sources.needs ? 'fairNotes' : 'gardenBook' },
    { title: 'Rancang percobaan adil', detail: 'Ubah jumlah air; kondisi lain sama.', done: p.plan, place: 'sari' },
    { title: 'Pinjam benih dan alat', detail: 'Enam benih, penyiram, penggaris.', done: p.supplies, place: 'seedStore' },
    { title: 'Tanam kedua kelompok', detail: `${seedsRemaining(p)} benih tersisa di Tas.`, done: p.planted.A && p.planted.B, place: p.planted.A ? 'plotB' : 'plotA' },
    { title: `Rawat · hari ${p.day} dari 6`, detail: p.can < (daily === 'plotA' ? 300 : 150) && daily !== 'recordTable' && p.day < 6 ? 'Air kurang? Isi di tandon lewat Peta.' : 'Siram, ukur saat wajib, lalu ke meja hasil.', done: p.day === 6, place: daily },
    { title: 'Lengkapi delapan pengukuran', detail: 'A dan B · hari 0, 2, 4, 6.', done: observationDays.every(d => groups.every(g => measured(p, d, g))), place: !measured(p, p.day, 'A') ? 'plotA' : 'plotB' },
    { title: 'Bandingkan dan simpulkan', detail: 'Bukti, kesimpulan, dan batas model.', done: p.completed, place: 'recordTable' },
  ];
}
export function parseGarden(raw: unknown): GardenProgress {
  const fail = () => { throw new Error('Data M14 tidak valid atau urutan percobaan tidak konsisten.'); };
  if (!raw || typeof raw !== 'object') return fail();
  const p = raw as GardenProgress;
  if (p.version !== 1 || ['accepted', 'plan', 'supplies', 'completed'].some(k => typeof p[k as keyof GardenProgress] !== 'boolean') ||
    typeof p.sources?.needs !== 'boolean' || typeof p.sources.fair !== 'boolean' ||
    groups.some(g => typeof p.planted?.[g] !== 'boolean') || !Number.isInteger(p.day) || p.day < 0 || p.day > 6 ||
    !Number.isInteger(p.can) || p.can < 0 || p.can > capacity || !Number.isInteger(p.tank) || p.tank < 0 || p.tank > 5000 ||
    !Array.isArray(p.watered) || p.watered.length !== 6 || p.watered.some(w => !w || groups.some(g => typeof w[g] !== 'boolean')) ||
    !Array.isArray(p.measurements) || p.measurements.length > 8 || typeof p.reflection !== 'string' || p.reflection.length > 1000 ||
    !Array.isArray(p.attempts) || p.attempts.length > 1000 || (p.reward !== 0 && p.reward !== 100) ||
    (p.firstCompletedAt !== null && (typeof p.firstCompletedAt !== 'string' || !Number.isFinite(Date.parse(p.firstCompletedAt)))) ||
    (p.reward === 100) !== (p.firstCompletedAt !== null)) return fail();
  let spent = 0;
  for (let day = 0; day < 6; day++) {
    if (day > p.day && groups.some(g => p.watered[day][g])) return fail();
    if (day < p.day && !groups.every(g => p.watered[day][g])) return fail();
    for (const g of groups) if (p.watered[day][g]) spent += doses[g];
  }
  if (p.tank + p.can + spent !== 5000) return fail();
  const keys = new Set<string>();
  for (const m of p.measurements) {
    if (!m || !observationDays.includes(m.day as 0 | 2 | 4 | 6) || m.day > p.day || !groups.includes(m.group) ||
      !Array.isArray(m.heights) || m.heights.length !== 3 || m.heights.some((h, i) => h !== heightsAt(m.day, m.group)[i]) || keys.has(`${m.day}/${m.group}`)) return fail();
    keys.add(`${m.day}/${m.group}`);
  }
  if (observationDays.some(d => d < p.day && !groups.every(g => measured(p, d, g))) ||
    ((spent > 0 || p.day > 0 || p.measurements.length > 0) && (!p.planted.A || !p.planted.B)) ||
    (groups.some(g => p.planted[g]) && (!p.plan || !p.supplies)) ||
    (!p.supplies && (p.can > 0 || p.tank !== 5000)) ||
    (!p.accepted && (p.plan || p.supplies || p.sources.needs || p.sources.fair || p.reflection || p.reward)) ||
    (p.reward === 100 && (!p.accepted || !p.sources.needs || !p.sources.fair || !p.supplies)) ||
    p.attempts.some(a => !a || !['model-A', 'unlimited', 'all-plants'].includes(a.claim) || !['day6-8-5', 'looks', 'guess'].includes(a.evidence) || !['limited', 'universal'].includes(a.limit) || typeof a.correct !== 'boolean' || a.correct !== (a.claim === 'model-A' && a.evidence === 'day6-8-5' && a.limit === 'limited')) ||
    (p.attempts.length > 0 && !completeEvidence(p)) ||
    (p.completed && (!completeEvidence(p) || p.reward !== 100 || !p.attempts.some(a => a.correct))) ||
    (!p.completed && p.attempts.some(a => a.correct))) return fail();
  return structuredClone(p);
}
