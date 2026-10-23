export interface Reading { value: number; session: 'hujan-0900'; }
export interface Attempt { answer: string; correct: boolean; }
export interface Progress {
  version: 1;
  accepted: boolean;
  hypothesis: boolean;
  sources: { book: boolean; rain: boolean };
  plan: boolean;
  samples: { A?: Reading; B?: Reading };
  trial: number | null;
  attempts: Attempt[];
  completed: boolean;
  reward: number;
  savedAt: string | null;
}
export type MissionEvent =
  | { type: 'accept' }
  | { type: 'hypothesis' }
  | { type: 'read'; source: 'book' | 'rain' }
  | { type: 'plan'; tool: string; variable: string; control: string }
  | { type: 'measure'; sample: 'A' | 'B' }
  | { type: 'trial' }
  | { type: 'conclude'; answer: string };

export const initialProgress = (): Progress => ({
  version: 1, accepted: false, hypothesis: false, sources: { book: false, rain: false },
  plan: false, samples: {}, trial: null, attempts: [], completed: false, reward: 0, savedAt: null,
});
export function hasEvidence(p: Progress) {
  return p.hypothesis && p.sources.book && p.sources.rain && p.plan &&
    p.samples.A?.value === 70 && p.samples.B?.value === 20 && p.samples.A.session === p.samples.B.session;
}
export function transition(p: Progress, e: MissionEvent): { progress: Progress; message: string; ok: boolean } {
  const next: Progress = structuredClone(p);
  const reject = (message: string) => ({ progress: p, message, ok: false });
  let message = '';
  if (e.type !== 'accept' && !p.accepted) return reject('Temui Bu Nara untuk memulai penyelidikan.');
  switch (e.type) {
    case 'accept': next.accepted = true; message = 'Misi diterima. Dengarkan dugaan Pak Wira di dekat alun-alun.'; break;
    case 'hypothesis': next.hypothesis = true; message = 'Pendapat warga dicatat sebagai dugaan, belum sebagai bukti.'; break;
    case 'read': next.sources[e.source] = true; message = 'Sumber tercatat di Jurnal Sains. Membaca belum menggantikan pengukuran.'; break;
    case 'plan':
      if (e.tool !== 'turbidity' || e.variable !== 'location' || e.control !== 'rain')
        return reject('Gunakan alat kekeruhan, bandingkan lokasi sampel, dan samakan kondisi hujan serta waktu pengambilan.');
      next.plan = true; message = 'Rencana siap: lokasi berbeda, waktu dan kondisi hujan sama.'; break;
    case 'measure':
      if (!p.plan) return reject('Pilih alat dan variabel pada panel sampel sebelum mengukur.');
      next.samples[e.sample] = { value: e.sample === 'A' ? 70 : 20, session: 'hujan-0900' };
      message = `Botol ${e.sample} berlabel disimpan. Indeks kekeruhan: ${next.samples[e.sample]!.value}/100 (skala model).`; break;
    case 'trial':
      if (!hasEvidence(p)) return reject('Lengkapi dugaan, dua sumber, rencana pengamatan, serta pengukuran A dan B terlebih dahulu.');
      next.trial = 35; message = 'Penahan sedimen terpasang. Dengan hujan yang sama, indeks A turun dari 70 menjadi 35.'; break;
    case 'conclude': {
      if (!hasEvidence(p) || p.trial !== 35) return reject('Kesimpulan memerlukan dua sampel, sumber pengetahuan, dan hasil uji sedimen.');
      const correct = e.answer === 'sediment';
      if (!p.completed) next.attempts.push({ answer: e.answer, correct });
      if (correct) {
        next.completed = true; next.reward = 100;
        message = 'M01 selesai! Bukti mendukung kontribusi sedimen. Keamanan air minum tetap memerlukan pemeriksaan lain.';
      } else {
        message = e.answer === 'drink' ? 'Kekeruhan turun tidak berarti semua mikroorganisme atau zat berbahaya hilang. Perbaiki kesimpulanmu.' : 'Data tidak membuktikan semua kekeruhan berasal dari limbah. Hubungkan perubahan A dengan uji sedimen.';
      }
      return { progress: next, message, ok: correct };
    }
  }
  return { progress: next, message, ok: true };
}
export function steps(p: Progress) {
  return [
    { title: 'Temui Bu Nara', detail: 'Mulai penyelidikan di alun-alun.', done: p.accepted, place: 'nara' },
    { title: 'Dengarkan dugaan warga', detail: 'Bicara dengan Pak Wira.', done: p.hypothesis, place: 'warga' },
    { title: 'Cari dua sumber pengetahuan', detail: 'Baca buku dan catatan hujan.', done: p.sources.book && p.sources.rain, place: p.sources.book ? 'rain' : 'book' },
    { title: 'Bandingkan sampel A & B', detail: 'Pilih alat, lalu ukur dua lokasi.', done: !!p.samples.A && !!p.samples.B, place: p.samples.A ? 'sampleB' : 'sampleA' },
    { title: 'Uji penahan sedimen', detail: 'Pertahankan kondisi hujan.', done: p.trial === 35, place: 'barrier' },
    { title: 'Tarik kesimpulan', detail: 'Diskusikan hasil dengan Bu Nara.', done: p.completed, place: 'nara' },
  ];
}

/** Reject malformed, future-version, or internally inconsistent imported saves. */
export function parseProgress(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null) throw new Error('Berkas bukan cadangan Jelajah Sains.');
  const p = raw as Progress;
  if (p.version !== 1 || typeof p.accepted !== 'boolean' || typeof p.hypothesis !== 'boolean' ||
      typeof p.sources?.book !== 'boolean' || typeof p.sources.rain !== 'boolean' || typeof p.plan !== 'boolean' ||
      !p.samples || typeof p.samples !== 'object' || typeof p.completed !== 'boolean' ||
      !Array.isArray(p.attempts) || p.attempts.length > 1000 ||
      p.attempts.some(a => !a || !['sediment', 'drink', 'waste'].includes(a.answer) || typeof a.correct !== 'boolean' || a.correct !== (a.answer === 'sediment')) ||
      (p.trial !== null && p.trial !== 35) || (p.reward !== 0 && p.reward !== 100) ||
      (p.savedAt !== null && (typeof p.savedAt !== 'string' || !Number.isFinite(Date.parse(p.savedAt)))))
    throw new Error('Format atau versi cadangan tidak didukung.');
  for (const key of ['A', 'B'] as const) {
    const r = p.samples[key];
    if (r !== undefined && (typeof r !== 'object' || r === null || r.value !== (key === 'A' ? 70 : 20) || r.session !== 'hujan-0900'))
      throw new Error('Data pengukuran cadangan tidak valid.');
  }
  if ((!p.accepted && (p.hypothesis || p.sources.book || p.sources.rain || p.plan)) ||
      ((p.samples.A || p.samples.B) && !p.plan) || (p.trial !== null && !hasEvidence(p)) ||
      (p.completed && (!hasEvidence(p) || p.trial !== 35 || p.reward !== 100 || !p.attempts.some(a => a.correct))) ||
      (!p.completed && p.reward !== 0)) throw new Error('Urutan bukti dalam cadangan tidak konsisten.');
  return structuredClone(p);
}
