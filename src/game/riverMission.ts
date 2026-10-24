import { fishingDataset, fishingSites, fishGroups, samplingModel, type FishingSite, type FishGroup, type RiverSource, riverCards } from '../data/riverContent';
export interface FishRecord { id: string; site: FishingSite; index: number; group: FishGroup; feature: FishGroup; note: string; released: true; }
export interface PlanAttempt { tool: string; bait: string; trials: string; duration: string; session: string; factor: string; correct: boolean; }
export interface FishAttempt { site: FishingSite; index: number; feature: string; correct: boolean; }
export const conclusionKeys = ['flatA', 'whiskeredB', 'longBoth', 'sampleLimit', 'causeLimit'] as const;
export type RiverAnswers = Record<typeof conclusionKeys[number], string>;
export const correctRiverAnswers: RiverAnswers = { flatA: 'A', whiskeredB: 'B', longBoth: 'both', sampleLimit: 'small', causeLimit: 'unproven' };
export interface RiverProgress {
  version: 1; mission: 'S13'; revision: number; accepted: boolean; sources: Record<RiverSource, boolean>; rod: boolean; plan: boolean;
  plans: PlanAttempt[]; records: FishRecord[]; fishAttempts: FishAttempt[]; conclusions: (RiverAnswers & { correct: boolean })[];
  completed: boolean; reward: 0 | 50; firstCompletedAt: string | null; reflection: string;
}
export const initialRiver = (): RiverProgress => ({ version: 1, mission: 'S13', revision: 0, accepted: false, sources: { observation: false, procedure: false, limits: false }, rod: false, plan: false, plans: [], records: [], fishAttempts: [], conclusions: [], completed: false, reward: 0, firstCompletedAt: null, reflection: '' });
export const siteRecords = (p: RiverProgress, site: FishingSite) => p.records.filter(r => r.site === site);
export const nextFish = (p: RiverProgress, site: FishingSite) => fishingDataset[site][siteRecords(p, site).length];
export const fishingPrepared = (p: RiverProgress) => p.accepted && p.sources.observation && p.sources.procedure && p.rod && p.plan;
export const validPlan = (a: Omit<PlanAttempt, 'correct'>) => Object.entries(samplingModel).every(([k, v]) => a[k as keyof typeof samplingModel] === v);
export const validConclusion = (a: RiverAnswers) => conclusionKeys.every(k => a[k] === correctRiverAnswers[k]);
export type RiverEvent = { type: 'accept' } | { type: 'read'; source: RiverSource } | { type: 'rod' } | { type: 'plan'; choices: Omit<PlanAttempt, 'correct'> } | { type: 'record'; site: FishingSite; index: number; feature: string; note: string; revision: number } | { type: 'conclude'; answers: RiverAnswers } | { type: 'reflect'; text: string } | { type: 'reset' };
export function riverTransition(p: RiverProgress, event: RiverEvent): { progress: RiverProgress; ok: boolean; message: string } {
  const fail = (message: string) => ({ progress: p, ok: false, message });
  if (event.type === 'reset') return { progress: { ...initialRiver(), revision: p.revision + 1, reward: p.reward, firstCompletedAt: p.firstCompletedAt }, ok: true, message: 'Latihan S13 diulang. Riwayat hadiah pertama tetap tersimpan.' };
  if (event.type !== 'accept' && !p.accepted) return fail('Terima tugas dari Kak Lestari dahulu.');
  const n = structuredClone(p); let ok = true, message = 'Catatan disimpan.';
  switch (event.type) {
    case 'accept': if (p.accepted) return fail('Tugas sudah diterima.'); n.accepted = true; break;
    case 'read': if (!(event.source in riverCards) || p.sources[event.source]) return fail('Sumber sudah tercatat atau tidak valid.'); n.sources[event.source] = true; break;
    case 'rod': if (p.rod) return fail('Alat pinjaman sudah ada di tas.'); n.rod = true; break;
    case 'plan': {
      if (!p.sources.observation || !p.sources.procedure || p.plan) return fail('Baca buku dan prosedur sebelum menyusun rencana.');
      ok = validPlan(event.choices); n.plans.push({ ...event.choices, correct: ok }); n.plan = ok;
      message = ok ? 'Rencana adil: hanya lokasi yang dibandingkan.' : 'Samakan alat, umpan, tiga percobaan, durasi, dan sesi virtual. Ubah hanya lokasi. Upaya awal disimpan.'; break;
    }
    case 'record': {
      if (!fishingPrepared(p) || !fishingSites.includes(event.site) || event.revision !== p.revision || event.index !== siteRecords(p, event.site).length || event.index >= 3) return fail('Pengamatan sudah disahkan atau keadaan berubah. Mulai pengamatan berikutnya.');
      const group = nextFish(p, event.site); ok = event.feature === group;
      n.fishAttempts.push({ site: event.site, index: event.index, feature: event.feature, correct: ok });
      if (ok) n.records.push({ id: `${event.site}-${event.index+1}`, site: event.site, index: event.index, group, feature: group, note: event.note.slice(0,300), released: true });
      message = ok ? 'Satu catatan disahkan dan ikan dilepaskan kembali.' : 'Lihat lagi: perhatikan lebar dan panjang badan serta garis di sekitar mulut. Pilih ciri yang tampak. Upaya awal disimpan.'; break;
    }
    case 'conclude': {
      if (p.completed || p.records.length !== 6 || !Object.values(p.sources).every(Boolean)) return fail('Lengkapi enam pengamatan dan tiga sumber sebelum menyimpulkan.');
      ok = validConclusion(event.answers); n.conclusions.push({ ...event.answers, correct: ok }); n.completed = ok;
      if (ok && !p.firstCompletedAt) { n.reward = 50; n.firstCompletedAt = new Date().toISOString(); }
      message = ok ? 'S13 selesai. Enam ikan telah dicatat dan dilepaskan. Hadiah pertama 50 XP.' : 'Bandingkan angka pada tabel. Bedakan catatan sampel dari populasi dan penyebab. Jawaban awal tetap disimpan.'; break;
    }
    case 'reflect': n.reflection = event.text.slice(0,1000); break;
  }
  n.revision++; return { progress: n, ok, message };
}
export function riverCounts(p: RiverProgress) {
  return Object.fromEntries(fishGroups.map(group => [group, Object.fromEntries(fishingSites.map(site => [site, siteRecords(p,site).length ? siteRecords(p,site).filter(r=>r.group===group).length : null]))])) as Record<FishGroup, Record<FishingSite, number | null>>;
}
export function parseRiver(raw: unknown): RiverProgress {
  const invalid = () => { throw new Error('Progres S13 tidak valid.'); };
  if (!raw || typeof raw !== 'object') return invalid();
  const p = structuredClone(raw) as RiverProgress;
  const bool = (v: unknown) => typeof v === 'boolean', str = (v: unknown, max=1000) => typeof v === 'string' && v.length <= max;
  if (p.version!==1 || p.mission!=='S13' || !Number.isSafeInteger(p.revision) || p.revision<0 || !bool(p.accepted) || !bool(p.rod) || !bool(p.plan) || !bool(p.completed) || !p.sources || !Object.keys(riverCards).every(k=>bool(p.sources[k as RiverSource])) || !str(p.reflection)) return invalid();
  if (![p.records,p.plans,p.fishAttempts,p.conclusions].every(a=>Array.isArray(a)&&a.length<=1000) || p.records.length>6) return invalid();
  const counts={A:0,B:0};
  for(const r of p.records) {
    if(!r || !fishingSites.includes(r.site) || r.index!==counts[r.site] || r.index>=3 || r.id!==`${r.site}-${r.index+1}` || r.group!==fishingDataset[r.site][r.index] || r.feature!==r.group || r.released!==true || !str(r.note,300)) return invalid(); counts[r.site]++;
  }
  for(const a of p.plans) if(!a || !Object.keys(samplingModel).every(k=>str(a[k as keyof typeof samplingModel],60)) || !bool(a.correct) || a.correct!==validPlan(a)) return invalid();
  if(p.plan!==p.plans.some(a=>a.correct) || p.plans.filter(a=>a.correct).length>1 || (p.plan&&(!p.sources.observation||!p.sources.procedure))) return invalid();
  for(const a of p.fishAttempts) if(!a || !fishingSites.includes(a.site) || !Number.isInteger(a.index) || a.index<0 || a.index>2 || a.index>counts[a.site] || !str(a.feature,60) || !bool(a.correct) || a.correct!==(a.feature===fishingDataset[a.site][a.index])) return invalid();
  for(const r of p.records) if(p.fishAttempts.filter(a=>a.site===r.site&&a.index===r.index&&a.correct).length!==1) return invalid();
  if(p.fishAttempts.filter(a=>a.correct).length!==p.records.length || p.records.length&&!fishingPrepared(p) || p.fishAttempts.length&&!fishingPrepared(p)) return invalid();
  for(const a of p.conclusions) if(!a || !conclusionKeys.every(k=>str(a[k],60)) || !bool(a.correct) || a.correct!==validConclusion(a)) return invalid();
  if(p.conclusions.length&&(p.records.length!==6||!Object.values(p.sources).every(Boolean)) || p.completed!==p.conclusions.some(a=>a.correct) || p.conclusions.filter(a=>a.correct).length>1) return invalid();
  if(!p.accepted&&(p.rod||Object.values(p.sources).some(Boolean)||p.plans.length||p.records.length||p.conclusions.length||p.reflection)) return invalid();
  if(![0,50].includes(p.reward) || (p.reward===50)!==(typeof p.firstCompletedAt==='string'&&!isNaN(Date.parse(p.firstCompletedAt))) || p.reward===0&&p.firstCompletedAt!==null || p.completed&&p.reward!==50) return invalid();
  return p;
}
export function riverSteps(p: RiverProgress) {
  const a=siteRecords(p,'A').length,b=siteRecords(p,'B').length;
  return [
    {title:'Temui Kak Lestari',detail:'Terima S13 di pos riset.',place:'lestari',done:p.accepted},
    {title:'Baca buku pengamatan',detail:'Bedakan ciri terlihat dan informasi buku.',place:'fishBook',done:p.sources.observation},
    {title:'Baca prosedur sampling',detail:'Samakan prosedur pada dua titik.',place:'samplingNotes',done:p.sources.procedure},
    {title:'Pinjam alat pancing',detail:'Satu alat dan umpan standar.',place:'rodRack',done:p.rod},
    {title:'Pilih rencana yang adil',detail:'Bandingkan lokasi; kondisi lain sama.',place:'lestari',done:p.plan},
    {title:`Catat titik A · ${a}/3`,detail:'Amati ciri, catat, lalu lepaskan.',place:'fishingA',done:a===3},
    {title:`Catat titik B · ${b}/3`,detail:'Boleh bergantian dengan titik A.',place:'fishingB',done:b===3},
    {title:'Baca keterbatasan sampel',detail:'Sampel bukan seluruh populasi.',place:'fishResults',done:p.sources.limits},
    {title:'Bandingkan dan simpulkan',detail:'Gunakan enam catatan dan batas data.',place:'lestari',done:p.completed},
  ];
}
