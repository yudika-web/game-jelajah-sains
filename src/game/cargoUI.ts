import { cargoBay, cargoDepot, cargoFinish, cargoPackageId, cargoRouteIds, cargoRoutes, cargoStart, routeLength, type CargoRoute } from '../data/cargoRegion';
import type { PlaceId } from '../data/content';
import type { CargoRunKind } from '../engine/cargoController';
import type { World } from '../engine/world';
import { cargoFastest, cargoPrepared, twoCargoReadings, type CargoEvent, type CargoProgress } from './cargoMission';
import { averageCargoSpeed, type CargoReading } from './cargoMotion';

interface Options {
  get(): CargoProgress;
  world(): World | null;
  send(event: CargoEvent, place?: PlaceId): boolean;
  open(title: string, html: string): void;
  close(): void;
  navigate(place: PlaceId): void;
  clear(): void;
  toast(message: string): void;
}

const decimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
const n = (x: number) => decimal.format(x);
const button = (id: string, text: string, disabled = false) =>
  `<button id="${id}" class="secondary" ${disabled ? 'disabled' : ''}>${text}</button>`;
const routes = '<option value="A">Rute A</option><option value="B">Rute B</option>';
const fastest = (value: string | null) => value == null ? 'Belum ada data' : value === 'tie' ? 'Hampir sama' : `Rute ${value}`;

function table(readings: CargoReading[]) {
  if (!readings.length) return '<p>Belum ada uji yang dicatat.</p>';
  return `<div class="cargo-table"><table><caption>Hasil pengukuran dari gerbang ke gerbang</caption>
    <thead><tr><th scope="col">Rute</th><th scope="col">Jarak (m)</th><th scope="col">Waktu (s)</th><th scope="col">Rata-rata (m/s)</th></tr></thead>
    <tbody>${[...readings].sort((a,b) => a.route.localeCompare(b.route)).map(r => `<tr><th scope="row">${r.route}</th>
      <td>${n(r.distanceMm / 1000)}</td><td>${n(r.elapsedMs / 1000)}</td><td>${n(averageCargoSpeed(r))}</td></tr>`).join('')}</tbody>
  </table></div><p>Kelajuan rata-rata = seluruh jarak (m) ÷ seluruh waktu (s). Waktu berhenti di jalur ikut dihitung.</p>`;
}

const routeInfo = () => cargoRouteIds.map(key => `<p><strong>${cargoRoutes[key].name}</strong> · sekitar ${n(routeLength(key))} m pada garis tengah. ${cargoRoutes[key].description}</p>`).join('');

export function cargoMapPaths() {
  return cargoRouteIds.slice().reverse().map(key => `<polyline points="${cargoRoutes[key].points.map(p => `${p.x},${p.z}`).join(' ')}" fill="none" stroke="${key === 'A' ? '#77501c' : '#31646d'}" stroke-width=".34" stroke-linecap="round" ${key === 'B' ? 'stroke-dasharray=".62 .36"' : ''}/>`).join('');
}

function diagram() {
  return `<svg class="cargo-diagram" viewBox="-17 8 15 15" role="img" aria-label="Dua rute kargo dengan pangkalan dan petak dermaga yang sama">
    <rect x="-17" y="8" width="15" height="15" rx="1" fill="#e8eddb"/>
    ${cargoMapPaths()}
    <circle cx="${cargoDepot.x}" cy="${cargoDepot.z}" r=".28" fill="#5d4c2a"/>
    <circle cx="${cargoBay.x}" cy="${cargoBay.z}" r=".28" fill="#35634a"/>
    <text x="-16.4" y="17.1" font-size=".56">Pangkalan</text><text x="-7" y="10.5" font-size=".56">Dermaga</text>
    <text x="-10.9" y="16.3" font-size=".65">A</text><text x="-9.6" y="21.5" font-size=".65">B</text>
    <path d="M${cargoStart.x} 17.55v.9M${cargoFinish.x-.4} ${cargoFinish.z}h.8" stroke="#4d534b" stroke-width=".10"/>
  </svg>`;
}

export function createCargoUI(o: Options) {
  const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const bind = (id: string, fn: () => void) => { const e = get(id); if(e) e.onclick = fn; };
  const open = (title: string, html: string) => o.open(title, html);
  const returnDepot = () => { o.world()?.recoverCargo(true); o.close(); frame(); o.toast('Kendaraan siap di pangkalan. Bukti yang dicatat tetap tersimpan.'); };

  function mentor() {
    const p = o.get();
    open('Pak Wira · Kiriman ke Dermaga', p.accepted
      ? '<p>Kak Lestari menunggu di dermaga W04. Baca buku gerak dan catatan kiriman sebelum berlatih.</p>' + button('cargo-go-source', 'Menuju Buku Gerak')
      : '<p>Tolong kirim perlengkapan penelitian ke Kak Lestari. Coba dua jalur dengan kendaraan kargo listrik, lalu pilih rute yang sesuai dari hasilmu.</p>' +
      button('cargo-accept', 'Terima tugas M04'));
    bind('cargo-accept', () => { if (o.send({ type: 'accept' }, 'warga')) mentor(); });
    bind('cargo-go-source', () => o.navigate('cargoBook'));
  }

  function source(id: 'cargoBook' | 'cargoNotes') {
    const p = o.get(), book = id === 'cargoBook';
    open(book ? 'Buku gerak dan gaya' : 'Catatan pengiriman dermaga', book
      ? '<p>Jarak adalah panjang seluruh lintasan. Perpindahan menunjukkan perubahan posisi dari awal ke akhir. Bagilah total jarak dengan total waktu untuk mendapat kelajuan rata-rata.</p><p>Resultan gaya dapat mengubah kelajuan atau arah. Jika kendaraan melaju lurus dengan kelajuan tetap, gaya pendorong seimbang dengan gaya yang melawan gerak.</p>'
      : `<p>Mulai dan selesai di gerbang yang sama. Gunakan kendaraan dan peti latihan yang sama. Sesudah kedua uji, muat paket ${cargoPackageId} dan serahkan kepada Kak Lestari setelah turun di petak dermaga.</p>${diagram()}${routeInfo()}`);
    const content = get('panel-content')!;
    content.insertAdjacentHTML('beforeend', button('cargo-read', p[book ? 'book' : 'notes'] ? 'Sudah dicatat' : 'Catat bacaan', p[book ? 'book' : 'notes']));
    bind('cargo-read', () => { if (o.send({ type: 'read', source: book ? 'book' : 'notes' }, id)) source(id); });
  }

  function depot() {
    const p = o.get(), world = o.world(), truck = world?.cargo;
    if (!truck) return;
    if (p.completed) { journal(); return; }
    if (!cargoPrepared(p)) {
      open('Pangkalan kargo listrik', '<p>Terima tugas Pak Wira dan baca kedua sumber sebelum naik.</p>' +
        button('cargo-next', p.accepted ? 'Menuju sumber yang belum dibaca' : 'Menuju Pak Wira'));
      bind('cargo-next', () => o.navigate(!p.accepted ? 'warga' : !p.book ? 'cargoBook' : 'cargoNotes'));
      return;
    }
    if (truck.run) {
      open('Pangkalan kargo listrik', '<p>Pulihkan kendaraan sebelum menyiapkan perjalanan berikutnya.</p>' + button('cargo-recover', 'Pulihkan kendaraan'));
      bind('cargo-recover', returnDepot);
      return;
    }
    const staged = truck.staged;
    let html = '<p>W atau ↑ memberi daya. A/D atau ←/→ membelok. Lepaskan pendorong untuk meluncur, lalu rem dengan Spasi atau tombol Rem. Pada HP gunakan analog. Pandu otomatis tersedia untuk semua mode.</p>';
    if (!p.practice) html += '<p>Latihan menggunakan rute A. Gerakkan kendaraan, belok, lepas pendorong, rem, parkir, lalu turun. Pandu latihan akan memperagakan urutannya.</p>' +
      button('cargo-prepare-practice', 'Siapkan latihan', staged?.kind === 'practice');
    else {
      html += diagram() + routeInfo() + table(p.records);
      if (!p.prediction) html += `<label>Prediksi rute dengan waktu lebih singkat<select id="cargo-guess"><option value="">Pilih…</option>${routes}<option value="tie">Hampir sama</option></select></label>` +
        button('cargo-predict', 'Simpan prediksi');
      else if (!twoCargoReadings(p)) {
        html += `<p>Prediksi tersimpan: ${fastest(p.prediction)}. Pilih rute dan muat peti latihan yang sama.</p><div class="cargo-actions">` +
          cargoRouteIds.map(key => button('cargo-load-' + key, `Muat peti latihan · ${key}`,
            p.records.some(r => r.route === key) || staged?.kind === 'test' && staged.route === key)).join('') + '</div>';
      } else {
        html += '<p>Jarak dan batas kelajuan kedua rute berbeda. Pilih rute berdasarkan prioritas pengiriman.</p>';
        if (!p.decision || !staged) html += `<form id="cargo-choice"><label>Rute kiriman<select name="route" required><option value="">Pilih…</option>${routes}</select></label>
          <label>Alasan<select name="reason" required><option value="">Pilih…</option><option value="time">Waktu terukur lebih singkat atau hampir sama</option>
          <option value="distance">Jarak terukur lebih pendek atau hampir sama</option><option value="wide">Saya memilih ruang gerak di jalur lapang B</option></select></label>
          <button class="primary">Simpan pilihan kiriman</button></form>`;
        if (p.decision) html += `<p>Pilihan kiriman: rute ${p.decision.route}.</p>` +
          button('cargo-load-delivery', `Muat paket ${cargoPackageId}`, staged?.kind === 'delivery');
      }
    }
    if (staged) html += `<p>Rute ${staged.route} siap. ${staged.kind === 'practice' ? 'Kabinnya kosong untuk latihan.' :
      staged.kind === 'test' ? 'Peti latihan ada di bak.' : `Paket ${cargoPackageId} ada di bak.`}</p>` + button('cargo-board', 'Naik kendaraan');
    open('Pangkalan kargo listrik', html);
    const prepare = (kind: CargoRunKind, route: CargoRoute) => { if (truck.prepare(kind, route)) depot(); };
    bind('cargo-prepare-practice', () => prepare('practice', 'A'));
    for (const key of cargoRouteIds) bind('cargo-load-' + key, () => prepare('test', key));
    bind('cargo-load-delivery', () => { if (p.decision) prepare('delivery', p.decision.route); });
    bind('cargo-predict', () => {
      const prediction = get<HTMLSelectElement>('cargo-guess')!.value as 'A' | 'B' | 'tie';
      if (o.send({ type: 'predict', prediction }, 'cargoDepot')) depot();
    });
    const choice = get<HTMLFormElement>('cargo-choice');
    if (choice) choice.onsubmit = e => {
      e.preventDefault();
      const fields = new FormData(choice);
      if (o.send({ type: 'decide', route: fields.get('route') as CargoRoute, reason: fields.get('reason') as 'time' | 'distance' | 'wide' }, 'cargoDepot')) depot();
    };
    bind('cargo-board', () => {
      o.close(); o.clear();
      if (world!.boardCargo()) { frame(); o.toast('Kendaraan siap. Gunakan pendorong atau Pandu.'); }
      else o.toast('Dekati sisi kendaraan sebelum naik.');
    });
  }

  function result() {
    const world = o.world(), truck = world?.cargo;
    if (!truck?.run) return;
    const reading = truck.reading;
    if (truck.parked === 'depot' || !reading) {
      open('Kendaraan di pangkalan', '<p>Siapkan ulang kendaraan untuk memulai perjalanan.</p>' + button('cargo-next-run', 'Siapkan ulang'));
      bind('cargo-next-run', returnDepot);
      return;
    }
    const p = o.get(), kind = truck.run.kind;
    const recorded = kind === 'practice' ? !!p.practice : p.records.some(r => r.route === reading.route);
    const explanation = kind === 'practice' ? (truck.practicePassed ? 'Belok, lepas pendorong, rem, parkir dan turun teramati.' :
      'Ulangi untuk memperagakan setiap langkah. Pandu dapat membantu.') : kind === 'test' ?
      'Periksa jarak dan waktu, lalu catat hasil rute.' : `Paket ${cargoPackageId} ada di bak yang terparkir. Temui Kak Lestari untuk menyerahkannya.`;
    open('Petak parkir dermaga', `<p>${explanation}</p>${table([reading])}` + (kind === 'delivery'
      ? button('cargo-go-lestari', 'Menuju Kak Lestari')
      : button('cargo-record', recorded ? 'Sudah dicatat' : 'Catat hasil', recorded || kind === 'practice' && !truck.practicePassed)) +
      (kind !== 'delivery' || !p.completed ? button('cargo-next-run', recorded ? 'Siapkan perjalanan berikutnya' : 'Pulihkan tanpa mencatat') : ''));
    bind('cargo-go-lestari', () => o.navigate('lestari'));
    bind('cargo-record', () => { if (o.send({ type: kind === 'practice' ? 'practice' : 'record' })) result(); });
    bind('cargo-next-run', returnDepot);
  }

  function receiver() {
    const p = o.get(), truck = o.world()?.cargo;
    if (!truck) return;
    if (p.completed) {
      open('Kiriman diterima Kak Lestari', `<div class="success-banner">M04 selesai · 100 XP dan 100 Koin Sains sekali</div><p>Paket ${cargoPackageId} diterima.</p>${table(p.records)}`);
      return;
    }
    if (truck.run?.kind !== 'delivery' || truck.parked !== 'bay' || truck.aboard) {
      open('Kak Lestari · Petak dermaga', '<p>Siapkan kendaraan di pangkalan. Setelah dua uji, bawa paket ke petak dermaga, parkir, lalu turun untuk menyerahkannya.</p>' +
        button('cargo-go-depot', 'Menuju pangkalan'));
      bind('cargo-go-depot', () => o.navigate('cargoDepot'));
      return;
    }
    open('Kak Lestari · Terima kiriman', `<p>Paket ${cargoPackageId} sudah tiba lewat rute ${p.decision?.route}. Mari periksa kesimpulanmu.</p>${table(p.records)}
      <form id="cargo-report"><label>Rute mana yang waktu terukurnya lebih singkat?<select name="fastest" required><option value="">Pilih…</option>${routes}<option value="tie">Hampir sama (selisih ≤ 0,01 s)</option></select></label>
      <label>Apa yang dibandingkan?<select name="explanation" required><option value="">Pilih…</option><option value="both">Dua pilihan dengan lintasan dan batas kelajuan berbeda</option><option value="one">Hanya panjang rute yang berbeda</option></select></label>
      <label>Refleksi opsional<textarea name="reflection" maxlength="1000" rows="2"></textarea></label>
      <button class="primary">Serahkan paket dan laporkan hasil</button></form>`);
    const report = get<HTMLFormElement>('cargo-report')!;
    report.onsubmit = e => {
      e.preventDefault();
      const fields = new FormData(report);
      if (o.send({ type: 'deliver', fastest: fields.get('fastest') as 'A' | 'B' | 'tie', explanation: String(fields.get('explanation')),
        reflection: String(fields.get('reflection')).trim() }, 'lestari')) receiver();
    };
  }

  function journal() {
    const p = o.get();
    const reasons = { time: 'waktu terukur', distance: 'jarak terukur', wide: 'jalur lebih lapang' };
    open('Jurnal Sains · M04', `<p>Prediksi waktu tersingkat: ${fastest(p.prediction)}.</p>${routeInfo()}${table(p.records)}
      ${p.decision ? `<p>Pilihan pengiriman: ${p.decision.route} · ${reasons[p.decision.reason]}.</p>` : ''}
      ${p.delivered ? `<p>Paket ${cargoPackageId} diterima. Kesimpulan dari dua uji: ${fastest(cargoFastest(p))}.
        Perbandingan melibatkan lintasan dan batas kelajuan yang berbeda.</p>` : ''}
      ${p.reflection ? '<h3>Refleksi</h3><p id="cargo-reflection"></p>' : ''}`);
    const reflection = get('cargo-reflection');
    if (reflection) reflection.textContent = p.reflection;
  }

  function exit() {
    if (o.world()?.exitCargo()) { frame(); result(); }
    else o.toast('Rem hingga berhenti di petak pangkalan atau petak dermaga.');
  }

  function guide() {
    o.clear();
    if (o.world()?.cargo.guide()) o.toast('Pandu bergerak melewati tiap penanda. Rem atau kendali manual mengambil alih.');
    else o.toast('Kendaraan sudah tiba di petak.');
    frame();
  }

  const hud = get('cargo-hud')!;
  const status = get('cargo-telemetry')!;
  const forceLine = get('cargo-force')!;
  const brakeButton = get('cargo-brake')!;
  const parkButton = get<HTMLButtonElement>('cargo-park')!;
  const exitButton = get<HTMLButtonElement>('cargo-exit')!;
  function frame() {
    const world = o.world(), truck = world?.cargo;
    if (!truck || !world) return;
    hud.hidden = !truck.aboard;
    document.body.classList.toggle('cargo-driving', truck.aboard);
    if (world.region !== 'river') return;
    const run = truck.run;
    const canvas = world.canvas;
    canvas.dataset.cargoAboard = String(truck.aboard);
    canvas.dataset.cargoSpeed = truck.speed.toFixed(3);
    canvas.dataset.cargoParked = truck.parked ?? '';
    canvas.dataset.cargoWheel = truck.wheel.toFixed(3);
    canvas.dataset.cargoDistance = String(Math.round((run?.distance ?? 0) * 1000));
    canvas.dataset.cargoTime = String(Math.round((run?.elapsed ?? 0) * 1000));
    canvas.dataset.cargoGates = String(run?.nextGate ?? 0);
    canvas.dataset.cargoLoad = o.get().completed ? 'received' : (run ?? truck.staged)?.kind === 'delivery' ? cargoPackageId :
      (run ?? truck.staged)?.kind === 'test' ? 'practice-crate' : 'empty';
    if (!truck.aboard || !run) return;
    const brakeLabel = world.mode === 'ifp' ? 'Berhenti' : 'Rem';
    if (brakeButton.textContent !== brakeLabel) brakeButton.textContent = brakeLabel;
    const stage = truck.parked === 'bay' ? 'Terparkir' : run.finished ? 'Masuk petak parkir' :
      !run.nextGate ? 'Sebelum gerbang mulai' : `Penanda ${run.nextGate}/${cargoRoutes[run.route].points.length - 2}`;
    const text = `Rute ${run.route} · ${stage} · ${n(truck.speed)} m/s · ${n(run.distance)} m · ${n(run.elapsed)} s`;
    if (status.textContent !== text) status.textContent = text;
    const f = truck.forces;
    const forces = f.contact ? 'Kendaraan tertahan. Kembali ke jalur atau aktifkan pandu.' :
      Math.abs(truck.steer) >= .05 ? 'Berbelok · arah gerak berubah' :
      `Lurus · pendorong → ${Math.round(f.drive)} N · hambatan ← ${Math.round(f.drag)} N · rem ${Math.round(f.brake)} N · resultan ${Math.round(f.net)} N`;
    if (forceLine.textContent !== forces) forceLine.textContent = forces;
    parkButton.disabled = truck.speed > .005 || !run.finished && truck.parked !== 'depot';
    exitButton.disabled = truck.speed > .005;
  }

  bind('cargo-guide', guide);
  bind('cargo-brake', () => { o.clear(); o.world()?.cargo.brake(); frame(); });
  bind('cargo-park', () => { if (o.world()?.cargo.park()) o.toast('Kendaraan diparkir. Pilih Turun.'); else o.toast('Berhenti di dalam petak parkir.'); frame(); });
  bind('cargo-exit', exit);
  function map() {
    const route = o.world()?.cargo.run?.route;
    open('Peta lintasan kargo', `${diagram()}${routeInfo()}<p>Rute aktif ${route ?? '—'}. Pandu melaju melalui gerbang, lalu parkir.</p>` +
      button('cargo-map-guide', 'Pandu ke petak dermaga') + button('cargo-map-recover', 'Batalkan perjalanan dan pulihkan'));
    bind('cargo-map-guide', () => { o.close(); guide(); });
    bind('cargo-map-recover', returnDepot);
  }
  return { mentor, source, depot, receiver, journal, frame, map, exit };
}
