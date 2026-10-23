import './style.css';
import { places, cards, conclusions, type PlaceId } from './data/content';
import { initialProgress, transition, steps, parseProgress, type MissionEvent } from './game/mission';
import { loadProgress, saveProgress } from './game/storage';
import { World, type InputMode } from './engine/world';
import { bindInput } from './engine/input';
import { loadPreferences, savePreferences } from './game/preferences';
import type { InteractionPose } from './engine/characterAnimator';
import type { CameraDistance } from './engine/cameraController';

const icons: Record<string, string> = {
  flask: '<path d="M9 3h6m-5 0v7L4 19q-1 2 2 2h12q3 0 2-2l-6-9V3M7 15h10"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  book: '<path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Zm0 0v15"/>',
  bag: '<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2M8 14h8v4H8Z"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
  gear: '<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
  leaf: '<path d="M20 3C7 1 1 10 6 16s15 1 14-13ZM5 21l10-12"/>',
};
const icon = (name: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.compass}</svg>`;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <canvas id="world" aria-label="Dunia 3D Kota Sains. Gunakan WASD atau kontrol sentuh untuk berjalan."></canvas>
  <div class="vignette" aria-hidden="true"></div>
  <header class="topbar">
    <a class="brand" href="#" aria-label="Jelajah Sains, beranda">${icon('flask')}<span>jelajah<span class="brand-light">sains</span><small>PETUALANGAN · PENEMUAN</small></span></a>
    <div class="location"><span class="live-dot"></span><div>Kota Sains<small>W01 · KELAS VII</small></div></div>
    <div class="top-right"><span class="prototype">PROTOTIPE 0.1</span><button class="icon-button" id="settings" aria-label="Pengaturan">${icon('gear')}</button></div>
  </header>
  <main class="hud" hidden>
    <aside class="mission-card compact">
      <div class="eyebrow"><span class="mission-tag">M01</span> MISI PENYELIDIKAN <button id="toggle-mission" aria-label="Buka rincian misi" aria-expanded="false">+</button></div>
      <h1>Detektif Air Kota</h1><p class="mission-intro">Ada cerita di balik air yang keruh.<br>Temukan jawabannya lewat bukti.</p>
      <div class="progress-track"><span id="progress-fill"></span></div>
      <div class="progress-caption"><span id="progress-text">0 dari 6 langkah</span><span>+100 XP</span></div>
      <ol id="mission-steps"></ol>
      <button class="mission-details" id="mission-details">Lihat semua langkah ${icon('arrow')}</button>
      <div class="mission-note">${icon('leaf')} Amati. Bandingkan. Temukan.</div>
    </aside>
    <div class="world-note"><span class="north">N</span>${icon('compass')}<span>ALUN-ALUN KOTA</span></div>
    <button class="minimap" id="mini-map" aria-label="Buka peta Kota Sains"><svg viewBox="0 0 160 120" aria-hidden="true"><rect width="160" height="120" rx="12" fill="#dce4cb"/><path d="M121 0v120" stroke="#80b5bd" stroke-width="20"/><path d="M65 0v120M0 65h115" stroke="#f9f0d7" stroke-width="14"/><path d="M12 13h34v25H12Zm0 67h24v22H12Zm62-69h20v20H74Z" fill="#b5c5af"/><circle cx="65" cy="68" r="6" fill="#225e50" stroke="#fff" stroke-width="3"/><circle cx="106" cy="46" r="4" fill="#d6a558"/><circle cx="106" cy="96" r="4" fill="#589caf"/></svg><span>${icon('map')} Peta wilayah <kbd>M</kbd></span></button>
    <div class="bottom-left"><div class="save-status" id="save-status" role="status">● Progres lokal</div><div class="keyboard-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> berjalan <span>·</span> seret untuk melihat</div></div>
    <div class="joystick" id="joystick" aria-label="Analog gerak sentuh"><span class="stick-ring"></span><span class="stick-knob">${icon('compass')}</span></div>
    <nav class="dock" aria-label="Peralatan penjelajah">
      <button id="journal">${icon('book')}<span>Jurnal</span><kbd>J</kbd></button>
      <button id="inventory">${icon('bag')}<span>Tas</span><kbd>I</kbd></button>
      <button id="map">${icon('map')}<span>Peta</span><kbd>M</kbd></button>
      <span class="dock-separator"></span><button id="camera-reset">${icon('reset')}<span>Kamera</span><kbd>R</kbd></button>
    </nav>
    <div class="action-area"><span id="near-name">Dekati warga atau penanda</span><button id="interact" disabled>${icon('arrow')}<span>Jelajahi</span><kbd>E</kbd></button></div>
    <div class="ifp-camera"><button id="rotate-left" aria-label="Putar kamera kiri">↶</button><button id="rotate-right" aria-label="Putar kamera kanan">↷</button><button id="stop-walk">Berhenti</button></div>
  </main>
  <section class="welcome" aria-labelledby="welcome-title">
    <div class="welcome-card"><div class="eyebrow"><span class="live-dot"></span> SELAMAT DATANG, PENJELAJAH</div>
      <h1 id="welcome-title">Rasa ingin tahu.<br>Awal sebuah<br><em>penemuan.</em></h1>
      <p>Langkah kecil di Kota Sains, petualangan besar untuk memahami dunia. Siap mencari bukti pertamamu?</p>
      <div class="welcome-mission"><span class="mission-tag">M01</span><div><strong>Detektif Air Kota</strong><small>Metode ilmiah · Dua sampel · Satu penyelidikan</small></div></div>
      <label class="mode-label" for="input-mode">Saya bermain dengan</label>
      <select id="input-mode"><option value="laptop">Laptop · keyboard & mouse</option><option value="hp">HP · analog & sentuh</option><option value="ifp">IFP · satu sentuhan & tombol besar</option></select>
      <button class="primary start-button" id="start">Mulai menjelajah ${icon('arrow')}</button>
      <label class="check-label"><input type="checkbox" id="fullscreen"> Gunakan layar penuh</label>
      <small class="welcome-footnote">Tanpa akun · Progres tersimpan di perangkat ini</small>
    </div>
    <div class="welcome-world-label"><span class="live-dot"></span> W01 / KOTA SAINS <span>Lingkungan belajar 3D</span></div>
  </section>
  <dialog id="panel" aria-labelledby="panel-title"><div class="dialog-header"><div><span class="eyebrow" id="panel-kicker">JELAJAH SAINS</span><h2 id="panel-title"></h2></div><button class="icon-button" id="close-panel" aria-label="Tutup panel">${icon('close')}</button></div><div id="panel-content"></div></dialog>
  <div id="toast" role="status" aria-live="polite" hidden></div>
`;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let progress = initialProgress();
let started = false;
let world: World | null = null;
let clearInput = () => {};
let toastTimer = 0;
let saveChain = Promise.resolve();
let saveGeneration = 0;
let storageBlocked = false;
const preferences = loadPreferences(matchMedia('(prefers-reduced-motion: reduce)').matches);
const panel = $<HTMLDialogElement>('panel');
const modeSelect = $<HTMLSelectElement>('input-mode');
modeSelect.value = matchMedia('(pointer: coarse)').matches ? 'hp' : 'laptop';

function toast(message: string) {
  $('toast').textContent = message; $('toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = window.setTimeout(() => { $('toast').hidden = true; }, 6500);
}
function saveLabel(text: string, failed = false) {
  $('save-status').textContent = text; $('save-status').classList.toggle('failed', failed);
}
function persist() {
  if (storageBlocked) { saveLabel('⚠ Simpan nonaktif · cadangkan melalui Pengaturan', true); return; }
  const snapshot = structuredClone(progress);
  snapshot.savedAt = new Date().toISOString();
  const generation = ++saveGeneration;
  saveLabel('◌ Menyimpan progres…');
  saveChain = saveChain.then(async () => {
    try {
      await saveProgress(snapshot);
      if (generation === saveGeneration) {
        progress.savedAt = snapshot.savedAt;
        saveLabel(`● Tersimpan ${new Date(snapshot.savedAt!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch {
      saveLabel('⚠ Gagal menyimpan · ekspor cadangan di Pengaturan', true);
      toast('Penyimpanan browser tidak tersedia. Progres masih ada selama tab terbuka; gunakan Ekspor cadangan.');
    }
  });
}
function dispatch(event: MissionEvent) {
  const result = transition(progress, event);
  const changed = result.progress !== progress;
  progress = result.progress;
  if (changed) persist();
  updateMission(); world?.setTrial(progress.trial === 35); toast(result.message);
  return result.ok;
}
function updateMission() {
  const list = steps(progress); const done = list.filter(s => s.done).length;
  $('progress-fill').style.width = `${done / list.length * 100}%`;
  $('progress-text').textContent = `${done} dari 6 langkah${progress.completed ? ' · Selesai!' : ''}`;
  $('mission-steps').innerHTML = list.map((s, i) => `<li class="${s.done ? 'done' : list.findIndex(t => !t.done) === i ? 'active' : ''}"><span class="step-number">${s.done ? '✓' : String(i + 1).padStart(2, '0')}</span><button data-guide="${s.place}"><strong>${s.title}</strong><small>${s.detail}</small></button></li>`).join('');
  $('mission-steps').querySelectorAll<HTMLButtonElement>('[data-guide]').forEach(b => { b.onclick = () => navigate(b.dataset.guide as PlaceId); });
}
function closePanel() { panel.close(); if (world) { world.paused = !started; world.endInteraction(); } }
function openPanel(title: string, html: string, kicker = 'CATATAN PENJELAJAH') {
  clearInput(); if (world) world.paused = true;
  panel.classList.toggle('character-interaction', started && world?.playerAnimator.pose !== 'none');
  $('panel-title').textContent = title; $('panel-kicker').textContent = kicker;
  $('panel-content').innerHTML = html;
  if (!panel.open) panel.showModal();
  $('close-panel').focus();
}
function navigate(id: PlaceId) {
  if (!world || !started) { toast('Mulai menjelajah terlebih dahulu.'); return; }
  closePanel(); const place = places.find(p => p.id === id)!;
  // Stop in front of the object instead of overlapping the NPC or sample bottle.
  const approach = { x: place.x, z: place.z + 1.4 };
  const ok = world.goTo(approach, () => {
    world!.facePoint(place);
    interactAt(id);
  });
  toast(ok ? `Menuju ${place.short}. Gerakkan analog/WASD atau pilih Berhenti untuk membatalkan.` : 'Tujuan tidak dapat dicapai. Pilih jalur lain di peta.');
}
function openPlan(id: 'sampleA' | 'sampleB') {
  world?.setInteractionPose('read');
  openPanel('Rancang pengamatanmu', `
    <p>Sebelum mengambil sampel, pilih alat dan variabel yang sesuai untuk membandingkan kekeruhan.</p>
    <form id="plan-form" class="form-grid">
      <label>Alat pengamatan<select name="tool" required><option value="">Pilih alat</option><option value="thermometer">Termometer</option><option value="turbidity">Alat kekeruhan virtual</option><option value="ruler">Penggaris</option></select></label>
      <label>Variabel yang dibandingkan<select name="variable" required><option value="">Pilih variabel</option><option value="location">Lokasi pengambilan sampel</option><option value="bottle">Warna botol</option></select></label>
      <label>Kondisi yang dibuat sama<select name="control" required><option value="">Pilih kondisi</option><option value="rain">Kondisi hujan dan waktu pengambilan</option><option value="different">Waktu dan hujan berbeda</option></select></label>
      <p id="plan-feedback" class="feedback" role="status"></p><button class="primary" type="submit">Simpan rencana & lanjutkan</button>
    </form>`, 'M01 · RENCANA PENYELIDIKAN');
  $<HTMLFormElement>('plan-form').onsubmit = e => {
    e.preventDefault(); const data = new FormData(e.currentTarget as HTMLFormElement);
    const ok = dispatch({ type: 'plan', tool: String(data.get('tool')), variable: String(data.get('variable')), control: String(data.get('control')) });
    if (ok) interactAt(id);
    else $('plan-feedback').textContent = 'Bandingkan lokasi dengan alat kekeruhan. Samakan kondisi hujan dan waktu, bukan menggantinya.';
  };
}
function interactAt(id: PlaceId) {
  if (!world || !started || Math.hypot(world.position.x - places.find(p => p.id === id)!.x, world.position.z - places.find(p => p.id === id)!.z) > 2.65) return;
  if (id === 'nara' || progress.accepted) {
    const pose: InteractionPose = id === 'nara' || id === 'warga' ? 'greet' : id === 'book' || id === 'rain' ? 'read' : id === 'sampleA' || id === 'sampleB' ? 'sample' : 'measure';
    world.beginInteraction(id, pose);
  }
  if (id === 'nara') {
    if (!progress.accepted) {
      openPanel('Halo, penjelajah muda!', `<div class="speaker"><span class="avatar-badge">N</span><div><strong>Bu Nara</strong><small>Guru & mentor sains</small></div></div><p>Warga melihat air sungai lebih keruh setelah hujan. Kita perlu mencari penjelasan sebelum memilih tindakan.</p><blockquote>“Pendapat adalah awal pertanyaan. Pengamatan dan percobaan membantu kita memeriksanya.”</blockquote><p>Temui Pak Wira, baca buku serta catatan hujan, lalu bandingkan sampel A dan B. Dua botol berlabel dan alat kekeruhan akan kupinjamkan.</p><button class="primary" id="accept-mission">Terima misi M01 ${icon('arrow')}</button>`, 'M01 · DETEKTIF AIR KOTA');
      $('accept-mission').onclick = () => { dispatch({ type: 'accept' }); closePanel(); };
    } else if (progress.trial === 35) openConclusion();
    else {
      const next = steps(progress).find(s => !s.done)!;
      openPanel('Ikuti bukti, satu per satu', `<p>Kita belum bisa menyimpulkan hanya dari tampilan air. Lengkapi sumber pengetahuan, kedua sampel, dan uji penahan sedimen.</p><div class="callout"><strong>Langkah berikutnya</strong><p>${next.title} — ${next.detail}</p></div><button class="primary" id="next-guide">Menuju petunjuk ${icon('arrow')}</button>`,'BU NARA · MENTOR SAINS');
      $('next-guide').onclick = () => navigate(next.place as PlaceId);
    }
    return;
  }
  if (!progress.accepted) { toast('Temui Bu Nara terlebih dahulu untuk menerima alat dan misi.'); return; }
  if (id === 'warga') {
    openPanel('Air keruh setelah hujan', `<div class="speaker"><span class="avatar-badge amber">W</span><div><strong>Pak Wira</strong><small>Warga Kota Sains</small></div></div><blockquote>“Menurut saya, semua air keruh pasti berasal dari limbah. Apa benar begitu?”</blockquote><p>Ini adalah <strong>dugaan warga</strong>, belum fakta yang teruji. Kita perlu membandingkannya dengan pengukuran dan informasi lokasi.</p><button class="primary" id="record-hypothesis">Catat sebagai dugaan</button>`, 'M01 · DUGAAN AWAL');
    $('record-hypothesis').onclick = () => { dispatch({ type: 'hypothesis' }); closePanel(); };
  } else if (id === 'book' || id === 'rain') {
    const card = cards[id];
    openPanel(card.title, `<div class="reading-illustration">${icon(id === 'book' ? 'book' : 'map')}<span>${id === 'book' ? 'HUJAN → LIMPASAN → SUNGAI' : 'A · LAHAN TERBUKA / B · TEPIAN HIJAU'}</span></div><p>${card.text}</p><div class="callout">${id === 'book' ? 'Air jernih tidak otomatis aman diminum. Kekeruhan bukan uji keamanan air.' : 'Kedua sampel menggunakan sesi hujan simulasi 09.00 yang sama; bukan waktu nyata.'}</div><small class="source">${card.source}</small><button class="primary" id="record-source">Catat di jurnal</button>`, 'SUMBER PENGETAHUAN');
    $('record-source').onclick = () => { dispatch({ type: 'read', source: id }); closePanel(); };
  } else if (id === 'sampleA' || id === 'sampleB') {
    if (!progress.plan) { openPlan(id); return; }
    const key = id === 'sampleA' ? 'A' : 'B'; const reading = progress.samples[key];
    openPanel(`Sampel ${key} · ${key === 'A' ? 'lahan terbuka' : 'titik pembanding'}`, `<p>${key === 'A' ? 'Air sungai dekat jalur limpasan dari lahan terbuka.' : 'Air dari titik pembanding dengan tepian bervegetasi.'} Gunakan botol berlabel ${key} yang terpisah.</p><div class="instrument"><span>INDEKS KEKERUHAN MODEL</span><strong>${reading ? reading.value : '—'}<small>/100</small></strong><div class="meter"><i style="width:${reading?.value ?? 0}%"></i></div><small>${reading ? 'Tercatat · hujan simulasi 09.00' : 'Belum diukur'}</small></div><p class="model-note">Skala simulasi, bukan satuan laboratorium (NTU). Angka tidak menentukan kelayakan minum.</p><button class="primary" id="measure">${reading ? 'Lihat pengukuran tersimpan' : `Ambil & ukur sampel ${key}`} ${icon('flask')}</button>`, 'M01 · PENGUKURAN');
    $('measure').onclick = () => { dispatch({ type: 'measure', sample: key }); interactAt(id); world?.setInteractionPose('measure'); };
  } else if (id === 'barrier') {
    openPanel('Uji jalur limpasan', `<p>Pasang <strong>model penahan sedimen</strong> pada aliran dari lahan terbuka. Ulangi pengamatan dengan kondisi hujan yang sama. Hanya penahan sedimen yang diubah.</p><div class="comparison"><div><small>A · SEBELUM</small><strong>${progress.samples.A?.value ?? '—'}</strong></div><span>→</span><div><small>A · SESUDAH</small><strong>${progress.trial ?? '—'}</strong></div></div><p class="model-note">Indeks model /100 · B awal ${progress.samples.B?.value ?? '—'} · Bukan uji keamanan minum.</p><p id="trial-feedback" role="status"></p><button class="primary" id="run-trial">${progress.trial ? 'Lihat kembali hasil uji' : 'Pasang penahan & uji ulang'}</button>${progress.trial ? '<button class="secondary" id="return-nara">Diskusikan dengan Bu Nara</button>' : ''}`, 'M01 · SATU VARIABEL DIUBAH');
    $('run-trial').onclick = () => {
      if (dispatch({ type: 'trial' })) interactAt('barrier');
      else $('trial-feedback').textContent = 'Belum siap: catat dugaan Pak Wira, baca buku dan catatan hujan, lalu ukur A dan B.';
    };
    if (progress.trial) $('return-nara').onclick = () => navigate('nara');
  }
}
function openConclusion() {
  openPanel(progress.completed ? 'Penyelidikan selesai!' : 'Apa yang didukung bukti?', `${progress.completed ? '<div class="success-banner">✓ M01 selesai · Lencana Penyelidik Air · 100 XP</div>' : ''}<p>Data awal A <strong>70</strong>, B <strong>20</strong>. Sesudah penahan sedimen, A menjadi <strong>35</strong> dengan hujan yang sama.</p><p>Pilih kesimpulan yang menghubungkan hasil uji dengan batas bukti:</p><div class="answer-list">${conclusions.map(a => `<button class="answer" data-answer="${a.id}">${a.text}</button>`).join('')}</div><p id="conclusion-feedback" class="feedback" role="status"></p><p class="model-note">Hasil simulasi memerlukan telaah guru. Tidak ada pengujian air nyata dalam prototipe.</p>`, 'M01 · KESIMPULAN BERDASARKAN BUKTI');
  document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b => {
    b.onclick = () => {
      if (dispatch({ type: 'conclude', answer: b.dataset.answer! })) {
        openConclusion(); $('conclusion-feedback').textContent = 'Bagus! Kamu membedakan dugaan, hasil pengukuran, dan batas kesimpulan.';
      } else $('conclusion-feedback').textContent = b.dataset.answer === 'drink' ? 'Air lebih jernih belum berarti aman diminum. Data kita hanya tentang kekeruhan.' : 'Jangan menggeneralisasi semua air keruh. Uji kita mendukung kontribusi sedimen di lokasi A.';
    };
  });
}
function journal() {
  world?.setInteractionPose('read');
  openPanel('Jurnal Sains', `<div class="journal-summary"><span class="mission-tag">M01</span><span>${progress.completed ? 'Penyelidikan selesai' : 'Penyelidikan berlangsung'}</span></div><h3>Dugaan awal</h3><p>${progress.hypothesis ? '“Semua air keruh pasti berasal dari limbah.” — Pak Wira. Status: dugaan, bukan fakta.' : 'Belum dicatat. Temui Pak Wira.'}</p><h3>Sumber pengetahuan</h3>${(['book', 'rain'] as const).map(id => `<div class="journal-entry"><strong>${progress.sources[id] ? '✓' : '○'} ${cards[id].title}</strong>${progress.sources[id] ? `<p>${cards[id].text}</p>` : '<p>Belum dibaca dan dicatat.</p>'}</div>`).join('')}<h3>Data pengamatan</h3><p class="model-note">Indeks model /100, bukan NTU. Semua menggunakan hujan simulasi yang sama.</p><table><thead><tr><th>Sampel</th><th>Awal</th><th>Sesudah uji</th></tr></thead><tbody><tr><td>A · lahan terbuka</td><td>${progress.samples.A?.value ?? 'Belum diukur'}</td><td>${progress.trial ?? 'Belum diuji'}</td></tr><tr><td>B · pembanding</td><td>${progress.samples.B?.value ?? 'Belum diukur'}</td><td>Tidak diuji ulang</td></tr></tbody></table><h3>Rencana & kesimpulan</h3><p>${progress.plan ? 'Alat kekeruhan virtual; lokasi berbeda; kondisi hujan dan waktu pengambilan sama.' : 'Rencana pengamatan belum dibuat.'}</p><p>${progress.completed ? conclusions[0].text : 'Kumpulkan bukti dan lakukan uji sebelum menyimpulkan.'}</p><small class="source">Percobaan kesimpulan: ${progress.attempts.length} · Hadiah: ${progress.reward} XP · Data lokal pada browser ini.</small>`, 'PENEMUAN · DATA · DUGAAN · PERCOBAAN');
}
function inventory() {
  world?.endInteraction();
  openPanel('Tas penjelajah', `<p>Alat esensial dipinjamkan Bu Nara saat misi diterima. Tidak perlu membeli alat.</p><div class="inventory-grid">${[{ name: 'Botol berlabel A', info: progress.samples.A ? 'Terisi · sampel A · indeks 70' : 'Kosong · khusus titik A' }, { name: 'Botol berlabel B', info: progress.samples.B ? 'Terisi · sampel B · indeks 20' : 'Kosong · khusus titik B' }, { name: 'Alat kekeruhan virtual', info: 'Skala model 0–100 · bukan NTU' }, { name: 'Jurnal & peta', info: 'Catatan otomatis setelah pengamatan' }].map(item => `<div class="inventory-item">${icon('flask')}<strong>${item.name}</strong><small>${progress.accepted ? item.info : 'Terima misi untuk meminjam'}</small></div>`).join('')}</div><div class="callout">Botol A dan B terpisah; membaca hasil tersimpan tidak mengambil sampel baru atau menggandakan hadiah.</div>`, 'PERALATAN MISI M01');
}
function map() {
  world?.endInteraction();
  openPanel('Peta Kota Sains', `<p>Pilih lokasi untuk berjalan ke sana dan berinteraksi saat tiba. Jalur menghindari bangunan serta sungai. Semua lokasi misi dapat dicapai tanpa melompat.</p><div class="map-layout"><svg id="town-map" viewBox="-20 -19 40 38" role="img" aria-label="Peta wilayah. Sekolah di barat laut, sungai di timur."><rect x="-20" y="-19" width="40" height="38" rx="1" fill="#dce4cb"/><path d="M14-19v38" stroke="#80b5bd" stroke-width="4"/><path d="M0-18v36M-18 2h28" stroke="#f9f0d7" stroke-width="3"/>${obstaclesMap()}${places.map(p => `<circle cx="${p.x}" cy="${p.z}" r="0.8" fill="${p.color}" stroke="#fff" stroke-width=".3"/><text x="${p.x - 0.5}" y="${p.z - 1.3}" font-size="1.3" fill="#244b42">${p.short}</text>`).join('')}<circle cx="${world?.position.x ?? -1}" cy="${world?.position.z ?? 6}" r="0.7" fill="#163d34" stroke="#fff" stroke-width=".35"/></svg><div class="destination-list">${places.map(p => `<button data-destination="${p.id}"><span class="place-dot" style="background:${p.color}"></span>${p.short}${icon('arrow')}</button>`).join('')}</div></div><p class="model-note">Ketuk tanah kosong di dunia 3D untuk berjalan, atau gunakan daftar lokasi untuk navigasi yang lebih mudah.</p>`, 'W01 · SATU BLOK, BANYAK PERTANYAAN');
  document.querySelectorAll<HTMLButtonElement>('[data-destination]').forEach(b => { b.onclick = () => navigate(b.dataset.destination as PlaceId); });
}
function obstaclesMap() {
  return '<path d="M-13-12h8v6h-8ZM-14.5 3.5h5v5h-5ZM-7.5 11h5v4h-5ZM0-15h4v4H0Z" fill="#a7b99e"/>';
}
function settings() {
  world?.endInteraction();
  openPanel('Atur petualanganmu', `<div class="form-grid"><label>Kontrol<select id="settings-mode"><option value="laptop">Laptop · WASD / panah + mouse</option><option value="hp">HP · analog + seret kamera</option><option value="ifp">IFP · satu sentuhan, tombol besar</option></select></label><label>Jarak kamera<select id="camera-distance"><option value="near">Dekat · detail karakter</option><option value="normal">Normal · menjelajah</option><option value="far">Jauh · gambaran wilayah</option></select></label><label class="check-label"><input id="reduced-motion" type="checkbox" ${world?.reducedMotion ? 'checked' : ''}> Kurangi gerakan kamera & animasi</label><label class="check-label"><input id="low-quality" type="checkbox" ${preferences.lowQuality ? 'checked' : ''}> Resolusi rendah untuk perangkat ringan</label></div><div class="controls-reference"><h3>Petunjuk kontrol</h3><p>WASD / panah: berjalan · E: interaksi · J: jurnal · I: tas · M: peta · R: pulihkan kamera · Esc: jeda/tutup.</p><p>HP: analog kiri dan seret dunia di kanan dapat dipakai bersamaan. IFP: ketuk tujuan atau pilih lokasi di Peta. Ketuk Berhenti untuk membatalkan perjalanan.</p></div><div class="settings-actions"><button class="secondary" id="home">Kembali ke Pos</button><button class="secondary" id="fullscreen-button">Layar penuh</button><button class="secondary" id="export">Ekspor cadangan</button><button class="secondary" id="import">Impor cadangan</button><input type="file" id="import-file" accept="application/json,.json" hidden><button class="danger" id="reset-progress">Ulangi penyelidikan</button></div><p id="settings-feedback" class="feedback" role="status"></p><p class="model-note">Progres tersimpan di IndexedDB pada alamat browser ini. Cadangkan sebelum membersihkan data atau berpindah alamat LAN. Posisi kembali ke pos saat dimuat ulang. Prototipe belum memiliki audio, multiplayer, atau pengiriman nilai.</p>`, 'AKSESIBILITAS & PENYIMPANAN LOKAL');
  $<HTMLSelectElement>('settings-mode').value = world?.mode ?? modeSelect.value;
  $('settings-mode').onchange = e => setMode((e.target as HTMLSelectElement).value as InputMode);
  $<HTMLSelectElement>('camera-distance').value = world?.cameraDistance ?? preferences.cameraDistance;
  const storePreferences = () => {
    if (!savePreferences(preferences)) $('settings-feedback').textContent = 'Preferensi hanya berlaku pada tab ini karena penyimpanan pengaturan tidak tersedia. Progres misi tetap terpisah.';
  };
  $('camera-distance').onchange = e => {
    preferences.cameraDistance = (e.target as HTMLSelectElement).value as CameraDistance;
    if (world) world.cameraDistance = preferences.cameraDistance; storePreferences();
  };
  $('reduced-motion').onchange = e => {
    preferences.reducedMotion = (e.target as HTMLInputElement).checked;
    if (world) world.reducedMotion = preferences.reducedMotion; storePreferences();
  };
  $('low-quality').onchange = e => {
    preferences.lowQuality = (e.target as HTMLInputElement).checked;
    world?.renderer.setPixelRatio(preferences.lowQuality ? 1 : Math.min(devicePixelRatio, 1.5)); storePreferences();
  };
  $('home').onclick = () => { world?.resetPosition(); closePanel(); toast('Kembali ke Pos. Seluruh bukti misi tetap tersimpan.'); };
  $('fullscreen-button').onclick = fullscreen;
  $('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'jelajah-sains-M01.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('settings-feedback').textContent = 'Cadangan dibuat. Simpan berkas di tempat yang aman.';
  };
  $('import').onclick = () => $<HTMLInputElement>('import-file').click();
  $('import-file').onchange = async e => {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error('Cadangan terlalu besar (maksimum 1 MB).');
      const imported = parseProgress(JSON.parse(await file.text()));
      // Import is explicit replacement; parsing must finish before changing live state.
      progress = imported; storageBlocked = false; persist(); updateMission(); world?.setTrial(progress.trial === 35);
      $('settings-feedback').textContent = 'Cadangan valid dimuat. Progres sebelumnya digantikan oleh cadangan ini.';
    } catch (error) { $('settings-feedback').textContent = error instanceof Error ? error.message : 'Cadangan tidak dapat dibaca.'; }
    (e.target as HTMLInputElement).value = '';
  };
  $('reset-progress').onclick = () => {
    openPanel('Ulangi penyelidikan?', '<p>Bukti, jurnal, dan hasil M01 lokal akan dihapus dan digantikan penyelidikan baru. Ekspor cadangan melalui Pengaturan jika ingin menyimpan hasil lama.</p><button class="danger" id="confirm-reset">Ya, mulai ulang M01</button><button class="secondary" id="cancel-reset">Batal</button>');
    $('cancel-reset').onclick = settings;
    $('confirm-reset').onclick = () => { progress = initialProgress(); storageBlocked = false; persist(); world?.setTrial(false); world?.resetPosition(); updateMission(); closePanel(); toast('Penyelidikan baru dimulai. Temui Bu Nara.'); };
  };
}
function setMode(mode: InputMode) {
  clearInput(); modeSelect.value = mode; document.body.dataset.mode = mode;
  if (world) world.mode = mode;
}
async function fullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch { toast('Layar penuh tidak tersedia. Kamu tetap dapat bermain di tampilan ini.'); }
}
function interaction() { const near = world?.nearest(); if (near) interactAt(near); }

$('start').onclick = () => {
  if (!world) return;
  started = true; setMode(modeSelect.value as InputMode); world.paused = false;
  document.querySelector<HTMLElement>('.welcome')!.hidden = true;
  document.querySelector<HTMLElement>('.hud')!.hidden = false;
  if ($<HTMLInputElement>('fullscreen').checked) void fullscreen();
  toast(progress.accepted ? 'Selamat kembali! Buka Jurnal untuk melihat bukti yang tersimpan.' : 'Selamat datang! Temui Bu Nara atau pilih langkah pertama pada kartu misi.');
};
$('close-panel').onclick = closePanel;
panel.addEventListener('close', () => { if (world) { world.paused = !started || panel.open; if (!panel.open) world.endInteraction(); } });
panel.addEventListener('click', e => {
  const r = panel.getBoundingClientRect();
  if (e.target === panel && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) closePanel();
});
$('settings').onclick = settings;
$('journal').onclick = journal; $('inventory').onclick = inventory;
$('map').onclick = map; $('mini-map').onclick = map;
$('camera-reset').onclick = () => world?.resetCamera();
$('rotate-left').onclick = () => { if (world) world.yaw += Math.PI / 4; };
$('rotate-right').onclick = () => { if (world) world.yaw -= Math.PI / 4; };
$('stop-walk').onclick = () => { clearInput(); toast('Perjalanan dihentikan.'); };
$('interact').onclick = interaction;
function toggleMissionDetails() {
  const compact = document.querySelector('.mission-card')!.classList.toggle('compact');
  $('toggle-mission').textContent = compact ? '+' : '−';
  $('toggle-mission').setAttribute('aria-expanded', String(!compact));
  $('toggle-mission').setAttribute('aria-label', compact ? 'Buka rincian misi' : 'Ringkas daftar misi');
  $('mission-details').innerHTML = `${compact ? 'Lihat semua langkah' : 'Ringkas misi'} ${icon('arrow')}`;
}
$('toggle-mission').onclick = toggleMissionDetails;
$('mission-details').onclick = toggleMissionDetails;
document.querySelector('.brand')!.addEventListener('click', e => { e.preventDefault(); settings(); });

async function initialize() {
  try {
    const saved = await loadProgress();
    if (saved) { progress = saved; $('start').firstChild!.textContent = 'Lanjutkan petualangan '; saveLabel('● Progres sebelumnya dimuat'); }
  } catch {
    storageBlocked = true;
    toast('Progres lokal tidak dapat dibaca. Gunakan cadangan atau mulai ulang lewat Pengaturan. Data lama tidak ditimpa otomatis.');
    saveLabel('⚠ Progres lokal tidak tersedia', true);
  }
  updateMission();
  try {
    world = new World($<HTMLCanvasElement>('world')); world.setTrial(progress.trial === 35);
    world.cameraDistance = preferences.cameraDistance; world.reducedMotion = preferences.reducedMotion;
    world.renderer.setPixelRatio(preferences.lowQuality ? 1 : Math.min(devicePixelRatio, 1.5));
    world.onUpdate = near => {
      const place = places.find(p => p.id === near);
      $('near-name').textContent = place?.name ?? 'Dekati warga atau penanda';
      $('interact').querySelector('span')!.textContent = place?.action ?? 'Jelajahi';
      $<HTMLButtonElement>('interact').disabled = !place;
    };
    clearInput = bindInput(world, $('joystick'), interaction, key => {
      if (key === 'escape') { if (panel.open) closePanel(); else if (started) settings(); return; }
      if (!started || panel.open) return;
      if (key === 'j') journal(); if (key === 'i') inventory(); if (key === 'm') map(); if (key === 'r') world?.resetCamera();
    }, (x, y) => {
      const hit = world!.pick(x, y);
      if (hit.place) {
        const p = places.find(p => p.id === hit.place)!;
        if (Math.hypot(world!.position.x - p.x, world!.position.z - p.z) < 2.6) interactAt(hit.place);
        else navigate(hit.place);
      } else if (hit.point && !world!.goTo(hit.point)) toast('Tujuan tidak dapat dicapai. Pilih jalur tanah lain.');
    });
    $<HTMLButtonElement>('start').disabled = false;
  } catch {
    $<HTMLButtonElement>('start').disabled = true;
    document.querySelector<HTMLElement>('.welcome')!.innerHTML = `<div class="welcome-card fallback"><div class="eyebrow">MODE MATERI 2D</div><h1>WebGL 2 belum tersedia.</h1><p>Petualangan 3D memerlukan browser dengan WebGL 2 dan akselerasi grafis. Aktifkan akselerasi grafis atau coba perangkat lain, kemudian muat ulang.</p><h3>${cards.book.title}</h3><p>${cards.book.text}</p><h3>${cards.rain.title}</h3><p>${cards.rain.text}</p><p class="callout">Materi 2D dapat dibaca. Gerak dan penyelidikan 3D belum dapat dijalankan di perangkat ini.</p><button class="primary" id="retry-webgl">Coba lagi</button></div>`;
    $('retry-webgl').onclick = () => location.reload();
  }
}
// Wait for IndexedDB before enabling the start button so resume cannot race a new mission.
$<HTMLButtonElement>('start').disabled = true;
void initialize();
