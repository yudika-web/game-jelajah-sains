import type { PlaceId } from '../data/content';
import { canStartHeat, comparedHeat, heatReady, solvedHeat, type GreenhouseProgress, type HeatEvent } from './greenhouseMission';
import { durationS, formatC, heatCases, heatLabels, initialC, outsideC, sampleHeat, sampleTimes } from './greenhouseModel';
import { expectedPrediction, predictions, type GreenhouseSession, type Prediction } from './greenhouseSession';

interface Options {
  session: GreenhouseSession;
  get(): GreenhouseProgress;
  send(event: HeatEvent, place: PlaceId): boolean;
  open(title: string, html: string): void;
  replace(title: string, html: string): void;
  navigate(place: PlaceId): void;
  visual(): void;
  toast(message: string): void;
  pose(active: boolean): void;
  garden(): void;
}

const labels: Record<Prediction, string> = { less: 'Lebih rendah', same: 'Sama', more: 'Lebih tinggi' };
const choices = (selected?: Prediction | null) => '<option value="">Pilih…</option>' +
  predictions.map(p => `<option value="${p}" ${selected === p ? 'selected' : ''}>${labels[p]}</option>`).join('');
const button = (id: string, text: string, disabled = false) =>
  `<button class="secondary" id="${id}" ${disabled ? 'disabled' : ''}>${text}</button>`;
const titles = {
  sari: 'Bu Sari · Rumah Semai Terlalu Panas',
  heatBook: 'Buku suhu dan kalor',
  heatNotes: 'Catatan kebutuhan rumah semai',
  heatMeter: 'Termometer digital',
  heatOutside: 'Sensor luar rumah semai',
  heatInside: 'Sensor dalam rumah semai',
  heatShade: 'Rak modul peneduh',
  heatVent: 'Engsel dan pengunci ventilasi',
} as const;
type Station = keyof typeof titles;

function dataChart(p: GreenhouseProgress) {
  const records = heatCases.flatMap(key => p.records.filter(r => r.key === key));
  if (!records.length) return '<p>Belum ada uji yang dicatat.</p>';
  const series = records.map(r => ({ ...r, readings: sampleHeat(r.key) }));
  return `<figure class="heat-chart"><figcaption>Suhu akhir · batang dari 0 hingga 60 °C</figcaption>${
    series.map(r => `<div><b>${r.key}</b><meter min="0" max="60" value="${r.readings.at(-1)}" aria-label="Suhu akhir uji ${r.key}"></meter><span>${formatC(r.readings.at(-1)!)}</span></div>`).join('')
  }</figure><div class="heat-table"><table><caption>Suhu dalam rumah semai (°C)</caption><thead><tr><th scope="col">Menit virtual</th>${
    series.map(r => `<th scope="col">${r.key}</th>`).join('')
  }</tr></thead><tbody>${sampleTimes.map((t, i) => `<tr><th scope="row">${t / 60}</th>${
    series.map(r => `<td>${formatC(r.readings[i]).replace(' °C', '')}</td>`).join('')
  }</tr>`).join('')}</tbody></table></div><ul>${series.map(r =>
    `<li><strong>${r.key}</strong> · ${heatLabels[r.key]}. Prediksi awal: ${labels[r.prediction].toLowerCase()}.${
      r.correction ? ` Koreksi: ${labels[r.correction].toLowerCase()}.` : ''
    }</li>`).join('')}</ul>`;
}

export function createGreenhouseUI(o: Options) {
  const s = o.session;
  let station: Station | null = null;
  let frame = 0;
  let last = 0;
  const node = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const shortcuts = (places: Station[]) => `<div class="heat-actions">${places.map(place =>
    `<button class="secondary" data-heat-go="${place}">Menuju ${titles[place].split(' · ')[0]}</button>`).join('')}</div>`;
  const setupLine = () => `<p><strong>Uji ${s.key}.</strong> ${heatLabels[s.key]}.</p>`;
  const prepare = () => button('heat-prepare', 'Siapkan Ulang', !s.locked);
  const meter = (c: number) => `<div class="instrument"><span>TERMOMETER DIGITAL</span><strong id="heat-reading">${formatC(c)}</strong></div>`;

  function lab(p: GreenhouseProgress) {
    const captured = p.records.some(r => r.key === s.key);
    const allowed = canStartHeat(p, s.key);
    const expected = expectedPrediction(s.key);
    const compare = s.key === 'A' ? 'suhu awal' : 'suhu akhir uji A';
    return `${setupLine()}<p>Setiap uji mulai pada 30,0 °C. Sepuluh menit virtual berjalan dalam sepuluh detik. Langkah memajukan dua menit virtual.</p>
      <p>A: tanpa peneduh, tertutup. B: pasang peneduh saja. C: buka ventilasi saja. D: gunakan keduanya setelah A, B, dan C.</p>
      ${shortcuts(['heatShade', 'heatVent'])}
      ${meter(s.temperature)}
      <p id="heat-clock">${Math.floor(s.seconds)} / ${durationS} detik virtual</p>
      ${s.prediction === null && allowed ? `<label for="heat-prediction">Prediksi suhu akhir dibanding ${compare}</label>
        <select id="heat-prediction">${choices()}</select> ${button('heat-predict', 'Simpan prediksi')}`
        : s.prediction !== null ? `<p>Prediksi awal: ${labels[s.prediction]} dari ${compare}.</p>`
        : `<p>${captured ? 'Uji ini sudah tercatat. Siapkan ulang dan ubah konfigurasi untuk uji berikutnya.' : 'Catat A sebelum B atau C. Lengkapi ketiganya sebelum D.'}</p>`}
      <div class="heat-actions">
        ${button('heat-run', 'Jalankan', !s.locked || s.finished || s.running)}
        ${button('heat-pause', 'Jeda', !s.running)}
        ${button('heat-step', 'Langkah', !s.locked || s.finished || s.running)}
        ${prepare()}
        ${button('heat-observe', 'Amati bacaan', !s.finished || s.observed)}
        ${button('heat-record', 'Catat', !s.observed || !allowed)}
      </div>
      ${s.observed ? `<p>Suhu akhir ${labels[expected].toLowerCase()} dari ${compare}.${
        s.key === 'D' ? ' Uji gabungan memenuhi target latihan 35 °C.' : ''
      }</p>${s.prediction !== expected ? `<label for="heat-correction">Koreksi setelah pengamatan (opsional)</label>
        <select id="heat-correction">${choices(s.correction)}</select>` : ''}` : ''}
      ${captured || comparedHeat(p) ? dataChart(p) : ''}`;
  }

  function content(id: Station) {
    const p = o.get();
    if (id === 'sari') {
      if (!p.accepted) return '<p>Rumah semai terlalu panas pada latihan hari ini. Ukur suhu, coba peneduh dan ventilasi, lalu bawa hasilnya kembali.</p>' +
        button('heat-accept', 'Terima tugas M03') + button('heat-m14', 'Bicara tentang M14');
      if (p.completed) return `<div class="success-banner">M03 selesai · 100 XP dan 100 Koin Sains sekali</div>${dataChart(p)}${button('heat-m14', 'Bicara tentang M14')}`;
      if (!solvedHeat(p)) return `<p>Ukur dulu, lalu coba satu perubahan setiap kali. Target latihan adalah maksimal 35 °C setelah 10 menit virtual.</p>
        ${shortcuts(heatReady(p) ? ['heatInside'] : ['heatBook', 'heatNotes', 'heatMeter', 'heatOutside', 'heatInside'])}
        ${button('heat-m14', 'Bicara tentang M14')}`;
      return `${dataChart(p)}<form id="heat-report">
        <label>Uji mana yang menjelaskan pengaruh masing-masing perubahan?
        <select name="comparison" required><option value="">Pilih…</option><option value="one-factor">A–B untuk peneduh, A–C untuk ventilasi</option><option value="both">D saja untuk keduanya</option></select></label>
        <label>Apa yang ditunjukkan uji D?
        <select name="solution" required><option value="">Pilih…</option><option value="combined">Solusi gabungan memenuhi target latihan</option><option value="universal">Semua bibit selalu butuh suhu ini</option></select></label>
        <label>Refleksi (opsional)<textarea name="reflection" maxlength="1000" rows="2"></textarea></label>
        <button class="primary">Sampaikan kesimpulan</button></form>${!s.shade || !s.vent ? `<p>Pasang kembali peneduh dan buka ventilasi sebelum melapor.</p>${shortcuts(['heatShade', 'heatVent'])}` : ''}
        ${button('heat-m14', 'Bicara tentang M14')}`;
    }
    if (!p.accepted) return '<p>Temui Bu Sari untuk menerima tugas rumah semai.</p>' + shortcuts(['sari']);
    switch (id) {
      case 'heatBook': return '<p>Termometer mengukur suhu, yaitu seberapa panas atau dingin suatu benda. Kalor adalah energi yang berpindah karena perbedaan suhu. Saat ruangan lebih panas, kalor dapat berpindah ke udara luar yang lebih dingin. Jika udara luar lebih panas, membuka ventilasi belum tentu mendinginkan ruangan.</p>' +
        button('heat-read', p.book ? 'Sudah dibaca' : 'Catat bacaan', p.book) + shortcuts(['heatNotes']);
      case 'heatNotes': return '<p>Untuk latihan ini, suhu akhir rumah semai harus maksimal 35 °C setelah 10 menit virtual. Tiap jenis bibit bisa membutuhkan suhu berbeda. Peneduh mengurangi panas yang masuk. Untuk membandingkan dengan adil, ubah satu hal saja setiap uji.</p>' +
        button('heat-read', p.notes ? 'Sudah dibaca' : 'Catat bacaan', p.notes) + shortcuts(['heatMeter']);
      case 'heatMeter': return `<p>Gunakan termometer digital untuk membaca suhu dalam derajat Celsius.</p>${p.borrowed
        ? `<p>Letakkan alat pada kondisi acuan simulasi 30,0 °C. Pemeriksaan ini hanya untuk memastikan bacaan alat latihan sesuai acuan.</p>
          ${p.checked ? meter(initialC) : ''}${button('heat-check', p.checked ? 'Acuan terperiksa' : 'Periksa pada acuan', p.checked)}${p.checked ? shortcuts(['heatOutside', 'heatInside']) : ''}`
        : button('heat-borrow', 'Ambil termometer')}`;
      case 'heatOutside': return `<p>Ukur udara di luar sebelum membandingkannya dengan udara di dalam. Model mempertahankan suhu luar yang sama di setiap uji.</p>
        ${p.outsideC === null ? button('heat-baseline', 'Ukur suhu luar', !p.checked) : meter(p.outsideC)}
        ${p.checked ? shortcuts(['heatInside']) : shortcuts(['heatMeter'])}`;
      case 'heatInside': return heatReady(p) ? lab(p) : `<p>Ukur suhu awal di sensor dalam. Lengkapi kedua bacaan dan sumber sebelum menjalankan uji.</p>
        ${p.insideC === null ? button('heat-baseline', 'Ukur suhu awal di dalam', !p.checked) : meter(p.insideC)}
        ${shortcuts(['heatBook', 'heatNotes', 'heatMeter', 'heatOutside'])}`;
      case 'heatShade': return `${setupLine()}<p>Bentangkan modul di atas atap. Peneduh mengurangi energi pemanas yang masuk pada model.</p>
        ${button('heat-shade', s.shade ? 'Lepas peneduh' : 'Pasang peneduh', !heatReady(p) || s.locked)}
        ${prepare()}${shortcuts(['heatVent', 'heatInside'])}`;
      case 'heatVent': return `${setupLine()}<p>Pengunci ${s.unlocked ? 'terlepas' : 'terpasang'}. Ventilasi ${s.vent ? 'terbuka' : 'tertutup'}. Panah menunjukkan contoh arah pertukaran udara.</p>
        ${button('heat-latch', s.unlocked ? 'Kunci ventilasi' : 'Lepas pengunci', !heatReady(p) || s.locked || s.vent)}
        ${button('heat-vent', s.vent ? 'Tutup ventilasi' : 'Buka ventilasi', !s.unlocked || s.locked)}
        ${prepare()}${shortcuts(['heatShade', 'heatInside'])}`;
    }
  }

  function paint() {
    const readout = node('heat-reading'), clock = node('heat-clock');
    if (readout && clock) {
      readout.textContent = formatC(s.temperature);
      clock.textContent = `${Math.floor(s.seconds)} / ${durationS} detik virtual`;
    }
    o.visual();
  }

  function pause(renderControls = false) {
    const wasRunning = s.running;
    cancelAnimationFrame(frame);
    s.running = false;
    if (renderControls && wasRunning && station === 'heatInside' && node('heat-clock')) render();
  }

  function tick(now: number) {
    if (document.hidden || !document.hasFocus() || !node('heat-clock')) {
      pause(true);
      return;
    }
    s.advance((now - last) * .06);
    last = now;
    paint();
    if (s.finished) render('heat-observe');
    else if (s.running) frame = requestAnimationFrame(tick);
  }

  function render(focus?: string) {
    const id = station;
    if (!id) return;
    o.replace(titles[id], content(id));
    bind(id);
    if (focus) node(focus)?.focus();
  }

  function bind(id: Station) {
    const click = (key: string, run: () => void) => {
      const element = node(key);
      if (element) element.onclick = run;
    };
    const send = (event: HeatEvent, focus?: string) => {
      if (o.send(event, id)) { o.visual(); render(focus); }
    };
    const action = (key: string, fn: () => void, focus = key) => click(key, () => {
      fn(); o.visual(); render(focus);
    });
    document.querySelectorAll<HTMLButtonElement>('[data-heat-go]').forEach(b => {
      b.onclick = () => o.navigate(b.dataset.heatGo as PlaceId);
    });
    click('heat-m14', o.garden);
    click('heat-accept', () => send({ type: 'accept' }));
    click('heat-read', () => send({ type: 'read', source: id === 'heatBook' ? 'book' : 'notes' }));
    click('heat-borrow', () => { o.pose(true); send({ type: 'borrow' }, 'heat-check'); });
    click('heat-check', () => send({ type: 'check' }));
    click('heat-baseline', () => {
      o.pose(true);
      send({ type: 'baseline', location: id === 'heatInside' ? 'inside' : 'outside' });
    });
    action('heat-shade', () => s.setShade(!s.shade));
    action('heat-latch', () => s.setUnlocked(!s.unlocked), 'heat-vent');
    action('heat-vent', () => s.setVent(!s.vent));
    action('heat-prepare', () => { pause(); s.prepare(); o.toast('Kondisi awal dipulihkan ke 30,0 °C. Uji yang belum dicatat dibatalkan.'); });
    click('heat-predict', () => {
      const value = node<HTMLSelectElement>('heat-prediction')!.value as Prediction;
      if (!predictions.includes(value)) { o.toast('Pilih prediksi terlebih dahulu.'); return; }
      if (canStartHeat(o.get(), s.key)) { s.predict(value); render('heat-run'); }
    });
    action('heat-run', () => {
      s.running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }, 'heat-pause');
    action('heat-pause', () => pause(), 'heat-run');
    click('heat-step', () => { s.advance(120); o.visual(); render(s.finished ? 'heat-observe' : 'heat-step'); });
    action('heat-observe', () => s.observe(), 'heat-record');
    click('heat-record', () => {
      const correction = node<HTMLSelectElement>('heat-correction')?.value as Prediction;
      if (predictions.includes(correction)) s.correct(correction);
      send({ type: 'record' }, 'heat-prepare');
    });
    const form = node<HTMLFormElement>('heat-report');
    if (form) form.onsubmit = event => {
      event.preventDefault();
      const data = new FormData(form);
      send({ type: 'report', comparison: String(data.get('comparison')), solution: String(data.get('solution')),
        reflection: String(data.get('reflection')).trim() });
    };
  }

  return {
    interact(id: Station) { station = id; o.open(titles[id], content(id)); bind(id); },
    journal() {
      const p = o.get();
      station = null;
      o.open('Jurnal Sains · M03', `<p>${p.completed ? 'Misi selesai.' : 'Rumah Semai Terlalu Panas'} Uji A–B membandingkan peneduh. Uji A–C membandingkan ventilasi. Uji D memeriksa solusi gabungan.</p>
        <p>Suhu awal dalam: ${p.insideC === null ? 'belum diukur' : formatC(p.insideC)} · Luar: ${p.outsideC === null ? 'belum diukur' : formatC(p.outsideC)}.</p>
        ${dataChart(p)}${p.reflection ? '<h3>Refleksi</h3><p id="heat-saved-reflection"></p>' : ''}`);
      const reflection = node('heat-saved-reflection');
      if (reflection) reflection.textContent = p.reflection;
    },
    pause,
    recover() { pause(); station = null; s.recover(); o.visual(); },
  };
}
