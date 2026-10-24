import { average, capacity, completeEvidence, doses, groups, measured, observationDays, seedsRemaining, type GardenEvent, type GardenProgress, type Group } from './gardenMission';
import type { PlaceId } from '../data/content';
import type { InteractionPose } from '../engine/characterAnimator';
export const escapeText = (text: string) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const sourceCards = {
  needs: { title: 'Kebutuhan tumbuhan dan pertumbuhan', text: 'Tumbuhan berdaun memerlukan air, cahaya, udara, nutrisi mineral, serta suhu yang sesuai. Saat berkecambah, biji memakai cadangan makanan. Pertumbuhan adalah pertambahan ukuran yang dapat diukur; perkembangan meliputi perubahan seperti munculnya daun. Air diperlukan, tetapi air berlebihan dapat mengurangi udara di media dan mengganggu akar. Lebih banyak air tidak selalu lebih baik.' },
  fair: { title: 'Catatan Bu Sari · percobaan adil', text: 'Bandingkan dua kelompok kacang hijau, masing-masing tiga tanaman. Ubah jumlah air saja. Samakan jenis benih, ukuran pot, media, cahaya, dan waktu pengamatan. A menerima 100 mL per tanaman per hari; B 50 mL. Ukur ketiganya dan hitung rata-rata, jangan hanya memilih tanaman tertinggi. Jumlah air ini pengaturan model pembelajaran, bukan anjuran untuk semua tanaman.' },
};
interface Context {
  get(): GardenProgress;
  open(title: string, html: string, kicker?: string): void;
  close(): void;
  send(event: GardenEvent, place?: PlaceId): boolean;
  navigate(id: PlaceId): void;
  pose(pose: InteractionPose): void;
  water(group: Group): void;
}
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const button = (id: string, text: string, disabled = false, style = 'primary') => `<button class="${style}" id="${id}" ${disabled ? 'disabled' : ''}>${text}</button>`;
const number = (n: number) => n.toLocaleString('id-ID');
const modelNote = '<p class="model-note">Data buatan dari model pembelajaran. Pertumbuhan dipercepat; bukan hasil percobaan nyata atau rekomendasi penyiraman. Waktu nyata tidak mengubah tanaman.</p>';
export function measurementTable(p: GardenProgress) {
  const rows = [...p.measurements].sort((a,b) => a.day-b.day || a.group.localeCompare(b.group));
  return `<div class="table-scroll"><table id="growth-table"><caption>Pengukuran yang benar-benar dicatat · cm</caption><thead><tr><th>Hari</th><th>Kelompok</th><th>1</th><th>2</th><th>3</th><th>Rata-rata (cm)</th></tr></thead><tbody>${rows.length ? rows.map(m => `<tr data-reading="${m.day}-${m.group}" data-average="${average(m.heights)}"><td>${m.day}</td><th>${m.group}</th>${m.heights.map(h=>`<td>${h}</td>`).join('')}<td>${average(m.heights)}</td></tr>`).join('') : '<tr><td colspan="6">Belum diukur. Gunakan penggaris di kedua petak.</td></tr>'}</tbody></table></div>`;
}
export function growthGraph(p: GardenProgress) {
  const x = (day: number) => 58 + day / 6 * 305, y = (cm: number) => 212 - cm / 10 * 170;
  return `<figure class="growth-figure"><svg id="growth-graph" viewBox="0 0 420 275" role="img" aria-label="Grafik tinggi rata-rata kelompok A dan B dari pengukuran jurnal. Tabel data tersedia di bawah."><rect x="0" y="0" width="420" height="275" rx="12" fill="#f9f5e8"/>
    ${[0,2,4,6,8,10].map(cm=>`<path d="M58 ${y(cm)}H365" stroke="#d9decd"/><text x="46" y="${y(cm)+4}" text-anchor="end">${cm}</text>`).join('')}
    <path d="M58 30V212H370" fill="none" stroke="#526952"/>
    ${observationDays.map(d=>`<text x="${x(d)}" y="231" text-anchor="middle">${d}</text>`).join('')}
    <text x="210" y="260" text-anchor="middle">Hari Simulasi</text><text transform="translate(17 130) rotate(-90)" text-anchor="middle">Tinggi Rata-rata (cm)</text>
    ${groups.map(g=> { const rows = p.measurements.filter(m=>m.group===g).sort((a,b)=>a.day-b.day); return `<polyline data-series="${g}" data-values="${rows.map(m=>`${m.day}:${average(m.heights)}`).join(',')}" points="${rows.map(m=>`${x(m.day)},${y(average(m.heights))}`).join(' ')}" fill="none" stroke="${g==='A'?'#28798b':'#a27438'}" stroke-width="3" ${g==='B'?'stroke-dasharray="7 4"':''}/>${rows.map(m=>`<circle cx="${x(m.day)}" cy="${y(average(m.heights))}" r="4" fill="${g==='A'?'#28798b':'#a27438'}"/><text x="${x(m.day)+7}" y="${y(average(m.heights))+(g==='A'?-7:15)}">${g}: ${average(m.heights)}</text>`).join('')}`; }).join('')}
    </svg><figcaption>A: garis utuh · B: garis putus-putus. Hanya data yang sudah diukur. Bandingkan juga tabel.</figcaption></figure>`;
}
export function gardenInventory(p: GardenProgress) {
  return `<h3>Pinjaman Kebun · M14</h3><div class="inventory-grid">${[
    ['Benih kacang hijau', `${seedsRemaining(p)} dari 6 benih tersisa`], ['Penyiram', `${number(p.can)} / ${number(capacity)} mL`], ['Penggaris', 'Tinggi tanaman dalam cm'], ['Kartu kebutuhan tumbuhan', 'Air, cahaya, udara, nutrisi, suhu'],
  ].map(([name,info])=>`<div class="inventory-item"><strong>${name}</strong><small>${p.supplies?info:'Ambil pinjaman di tempat benih dan alat.'}</small></div>`).join('')}</div><p class="model-note">Alat esensial tidak hilang atau habis dipakai. Kunjungi tempat alat untuk memulihkan akses pinjaman; benih yang sudah ditanam tidak digandakan.</p>`;
}
export function createGardenUI(ctx: Context) {
  function learnMore() {
    return `<details class="learn-more"><summary>Pelajari lagi</summary><p>M14 · Kelas IX: Pertumbuhan dan Perkembangan, dengan penguatan kebutuhan tumbuhan kelas VII. Variabel bebas: jumlah air. Variabel terikat: tinggi dalam cm. Variabel kontrol: benih, pot, media, cahaya, waktu. Tiga tanaman per kelompok memperlihatkan variasi, sehingga kita membandingkan rata-ratanya.</p>${modelNote}</details>`;
  }
  function plan() {
    ctx.pose('read');
    ctx.open('Rencana Kebun Percobaan', `<p>Bu Sari: “Ubah satu hal saja agar perbandingan adil.”</p><form id="garden-plan-form" class="form-grid">
      <label>Variabel yang diubah<select name="variable" required><option value="">Pilih</option><option value="water">Jumlah air per tanaman</option><option value="water-light">Jumlah air dan cahaya</option></select></label>
      <label>Kondisi lain<select name="controls" required><option value="">Pilih</option><option value="same">Benih, pot, media, cahaya, waktu sama</option><option value="different">Pot dan jenis benih juga berbeda</option></select></label>
      <label>Air per tanaman per hari<select name="water" required><option value="">Pilih</option><option value="100-50">A 100 mL · B 50 mL</option><option value="100-100">A 100 mL · B 100 mL</option></select></label>
      ${button('garden-plan-save','Simpan rencana')}</form><p id="garden-feedback" class="feedback" role="status"></p>${learnMore()}`, 'M14 · SATU VARIABEL');
    $<HTMLFormElement>('garden-plan-form').onsubmit = e => {
      e.preventDefault(); const data=new FormData(e.currentTarget as HTMLFormElement);
      if(ctx.send({type:'plan',variable:String(data.get('variable')),controls:String(data.get('controls')),water:String(data.get('water'))},'sari')) { ctx.close(); }
      else $('garden-feedback').textContent='Ubah jumlah air saja. Samakan benih, pot, media, cahaya, serta waktu. Coba perbaiki pilihanmu.';
    };
  }
  function plot(group: Group, pose: InteractionPose = 'ruler') {
    const p=ctx.get(), id=group==='A'?'plotA':'plotB', today=p.watered[p.day]?.[group]??false;
    const reading=p.measurements.find(m=>m.day===p.day&&m.group===group);
    ctx.pose(p.planted[group]?pose:'plant');
    ctx.open(`Petak ${group} · hari ${p.day}`, `<p>Tiga tanaman kacang hijau: <strong>${group}1, ${group}2, ${group}3</strong>. Perlakuan ${doses[group]/3} mL per tanaman per hari simulasi 0–5.</p>
      <div class="garden-metrics"><span>Benih tersisa<strong>${seedsRemaining(p)}</strong></span><span>Isi penyiram<strong>${number(p.can)} mL</strong></span><span>Kapasitas<strong>1.000 mL</strong></span></div>
      ${!p.planted[group]?`<label>Benih<select id="plant-seed"><option value="mung">Kacang hijau · 3 benih</option><option value="other">Benih jenis lain</option></select></label>${button('plant-group',`Tanam 3 benih ${group}`,!p.plan||!p.supplies)}<p class="model-note">Buat rencana bersama Bu Sari dan ambil pinjaman di tempat alat dahulu.</p>`:`<p>✓ Tiga benih telah ditanam. ${p.day===0?'Belum muncul tunas. Ukur kondisi awal 0 cm.':'Tinggi visual mengikuti pertumbuhan model; data baru tercatat saat kamu mengukur.'}</p>
      ${button('water-group',today?'✓ Sudah disiram hari ini':p.day===6?'Perlakuan selesai':`Siram ${group} · ${doses[group]} mL untuk 3 tanaman`,today||p.day===6||!p.planted.A||!p.planted.B)}
      ${button('measure-group',reading?'✓ Pengukuran hari ini tercatat':`Ukur kelompok ${group} dengan penggaris`,!!reading||!observationDays.includes(p.day as 0|2|4|6)||!p.planted.A||!p.planted.B,'secondary')}
      <div class="plant-readings">${[0,1,2].map(i=>`<span>${group}${i+1}<strong>${reading?`${reading.heights[i]} cm`:'Belum diukur'}</strong><small>${today?`✓ ${doses[group]/3} mL hari ${p.day}`:'Belum ada perlakuan hari ini'}</small></span>`).join('')}</div><p>Rata-rata tercatat: <strong>${reading?`${average(reading.heights)} cm`:'—'}</strong></p>`}
      <p id="garden-feedback" class="feedback" role="status"></p><div class="garden-links">${button('go-tank','Ke tandon',false,'secondary')}${button('go-results','Ke meja hasil',false,'secondary')}</div>${modelNote}`, 'M14 · MENANAM, MERAWAT, MENGUKUR');
    if(!p.planted[group]) {
      const seedInput=$<HTMLSelectElement>('plant-seed');
      $('plant-group').onclick=()=> { if(ctx.send({type:'plant',group,seed:seedInput.value},id)) plot(group,'plant'); };
    }
    else {
      $('water-group').onclick=()=> { if(ctx.send({type:'water',group,day:p.day},id)) {plot(group,'water');ctx.water(group);} else $('garden-feedback').textContent=`Air belum cukup? Perlu ${doses[group]} mL untuk tiga tanaman. Isi penyiram di tandon; tidak ada perlakuan sebagian.`; };
      $('measure-group').onclick=()=> { if(ctx.send({type:'measure',group,day:p.day},id)) plot(group,'ruler'); };
    }
    $('go-tank').onclick=()=>ctx.navigate('waterTank'); $('go-results').onclick=()=>ctx.navigate('recordTable');
  }
  function results() {
    const p=ctx.get(), canAdvance=p.day<6&&p.watered[p.day].A&&p.watered[p.day].B&&(!observationDays.includes(p.day as 0|2|4|6)||groups.every(g=>measured(p,p.day,g)));
    const finalA=p.measurements.find(m=>m.day===6&&m.group==='A'), finalB=p.measurements.find(m=>m.day===6&&m.group==='B');
    ctx.pose('read');
    ctx.open(`Meja hasil · hari ${p.day}`, `<p>Periksa perlakuan dan pengamatan hari ini, lalu lanjutkan tepat satu hari simulasi.</p><div class="garden-metrics"><span>Hari simulasi<strong>${p.day} / 6</strong></span><span>Isi penyiram<strong>${number(p.can)} mL</strong></span><span>Sisa tandon<strong>${number(p.tank)} mL</strong></span></div>
      ${p.day<6?`<ul class="daily-checklist">${groups.map(g=>`<li>${p.watered[p.day][g]?'✓':'○'} Siram ${g}: ${doses[g]/3} mL × 3</li>`).join('')}${observationDays.includes(p.day as 0|2|4|6)?groups.map(g=>`<li>${measured(p,p.day,g)?'✓':'○'} Ukur ${g} hari ${p.day}</li>`).join(''):''}</ul>${button('next-day',`Lanjut Hari · ${p.day} → ${p.day+1}`,!canAdvance)}${!canAdvance?'<p class="feedback">Lengkapi tanda ○ terlebih dahulu. Tidak ada hari yang dilewati.</p>':''}`:'<p>Hari 6: perlakuan selesai. Catat pengukuran terakhir kedua kelompok.</p>'}
      <div class="garden-links">${button('visit-A','Ke petak A',false,'secondary')}${button('visit-B','Ke petak B',false,'secondary')}</div>
      ${growthGraph(p)}${measurementTable(p)}
      ${finalA&&finalB?`<p class="callout" id="reading-help">Pada hari ke-6, rata-rata A adalah ${average(finalA.heights)} cm dan B adalah ${average(finalB.heights)} cm.</p>`:''}
      ${button('garden-conclusion',p.completed?'Lihat kesimpulan':'Simpulkan bersama Bu Sari',!completeEvidence(p))}${learnMore()}`, 'M14 · DATA MODEL PEMBELAJARAN');
    if(p.day<6) $('next-day').onclick=()=> { if(ctx.send({type:'advance',day:p.day},'recordTable')) results(); };
    $('visit-A').onclick=()=>ctx.navigate('plotA'); $('visit-B').onclick=()=>ctx.navigate('plotB');
    $('garden-conclusion').onclick=()=>conclusion('recordTable');
  }
  function conclusion(place: 'sari' | 'recordTable') {
    const p=ctx.get(); ctx.pose('read');
    ctx.open(p.completed?'M14 selesai!':'Apa yang ditunjukkan data?',`${p.completed?'<div class="success-banner">✓ M14 selesai · Hadiah pertama 100 XP</div>':''}
      <p>Hari 6: A1–A3 = 8, 7, 9 cm; B1–B3 = 5, 4, 6 cm. Rata-rata A 8 cm, B 5 cm.</p>
      <form id="garden-conclusion-form" class="form-grid">
      <label>Kesimpulan<select name="claim"><option value="model-A">Pada kondisi model ini, A tumbuh lebih tinggi</option><option value="unlimited">Semakin banyak air tanpa batas selalu lebih baik</option><option value="all-plants">Semua jenis tanaman pasti memberi hasil sama</option></select></label>
      <label>Bukti pendukung<select name="evidence"><option value="day6-8-5">Hari 6: rata-rata A 8 cm dan B 5 cm</option><option value="looks">Tanaman terlihat bagus</option><option value="guess">Dugaan sebelum percobaan</option></select></label>
      <label>Batas hasil<select name="limit"><option value="limited">Dosis lain dan jenis tanaman lain belum diuji</option><option value="universal">Hasil membuktikan air tanpa batas selalu baik</option></select></label>
      ${button('submit-garden-conclusion','Simpan kesimpulan',p.completed)}</form><p id="garden-feedback" class="feedback" role="status"></p>
      ${reflectionForm(p)}${modelNote}`, 'M14 · BUKTI DAN BATAS KESIMPULAN');
    $<HTMLFormElement>('garden-conclusion-form').onsubmit=e=> {e.preventDefault(); const d=new FormData(e.currentTarget as HTMLFormElement);
      if(ctx.send({type:'conclude',claim:String(d.get('claim')),evidence:String(d.get('evidence')),limit:String(d.get('limit'))},place)) conclusion(place);
      else $('garden-feedback').textContent='Periksa rata-rata A 8 cm dan B 5 cm. Air berlebihan tidak selalu baik, dan tanaman jenis lain belum diuji.';
    }; bindReflection();
  }
  function reflectionForm(p: GardenProgress) { return `<form id="reflection-form"><label>Refleksi untuk guru (opsional)<textarea id="garden-reflection" maxlength="1000" rows="3" placeholder="Apa yang ingin kamu uji berikutnya?">${escapeText(p.reflection)}</textarea></label>${button('save-reflection','Simpan refleksi',false,'secondary')}<small>Tersimpan lokal. Tidak dinilai otomatis dan belum dikirim ke guru.</small><p id="reflection-feedback" role="status"></p></form>`; }
  function bindReflection() { $<HTMLFormElement>('reflection-form').onsubmit=e=> {e.preventDefault(); if(ctx.send({type:'reflect',text:$<HTMLTextAreaElement>('garden-reflection').value})) $('reflection-feedback').textContent='Refleksi tersimpan lokal untuk dibaca guru.'; }; }
  function interact(id: PlaceId) {
    const p=ctx.get();
    if(id==='sari') {
      ctx.pose('greet');
      ctx.open('Bu Sari · Kebun Percobaan', `<p>“Apakah jumlah air yang berbeda memengaruhi pertumbuhan kacang hijau? Bantu saya membandingkan dua kelompok dalam kondisi yang sama.”</p>
        ${!p.accepted?button('accept-garden','Terima M14 · Kebun Percobaan'):`<p>${!p.sources.needs||!p.sources.fair?'Baca dua sumber pengetahuan di kebun terlebih dahulu.':!p.plan?'Pilih rencana percobaan yang adil.':!p.supplies?'Ambil benih dan alat pinjaman.':'Rawat dan ukur kedua kelompok, lalu catat di meja hasil.'}</p>${button('open-garden-plan',p.plan?'Lihat / periksa rencana':'Pilih rencana percobaan')}${button('recover-supplies','Ke tempat benih & alat',false,'secondary')}${completeEvidence(p)?button('discuss-garden','Diskusikan kesimpulan'):''}`}${learnMore()}`,'M14 · PENDAMPING KEBUN');
      if(!p.accepted) $('accept-garden').onclick=()=> {ctx.send({type:'accept'},'sari');ctx.close();};
      else { $('open-garden-plan').onclick=plan; $('recover-supplies').onclick=()=>ctx.navigate('seedStore'); if(completeEvidence(p)) $('discuss-garden').onclick=()=>conclusion('sari'); }
    } else if(id==='gardenBook'||id==='fairNotes') {
      const source=id==='gardenBook'?'needs':'fair', c=sourceCards[source]; ctx.pose('read');
      ctx.open(c.title,`<p>${c.text}</p>${button('read-garden-source',p.sources[source]?'✓ Sudah dicatat':'Baca & catat di jurnal')}${learnMore()}`,'M14 · SUMBER PENGETAHUAN');
      $('read-garden-source').onclick=()=> {if(ctx.send({type:'read',source},id))ctx.close();};
    } else if(id==='seedStore') {
      ctx.pose('read');ctx.open('Benih dan alat pinjaman',`${gardenInventory(p)}${button('borrow-garden',p.supplies?'Periksa / pulihkan pinjaman':'Ambil 6 benih dan alat',!p.accepted)}${learnMore()}`,'M14 · ALAT ESENSIAL');
      $('borrow-garden').onclick=()=> {if(ctx.send({type:'borrow'},id)) interact(id);};
    } else if(id==='plotA'||id==='plotB') plot(id==='plotA'?'A':'B');
    else if(id==='waterTank') {
      ctx.pose('water'); ctx.open('Tandon air percobaan',`<div class="garden-metrics"><span>Kapasitas penyiram<strong>1.000 mL</strong></span><span>Isi sekarang<strong id="can-volume">${number(p.can)} mL</strong></span><span>Sisa tandon<strong id="tank-volume">${number(p.tank)} mL</strong></span></div><p>Pengisian memindahkan paling banyak ${number(Math.min(capacity-p.can,p.tank))} mL sekarang. Tidak ada air yang dibuat atau dibuang diam-diam.</p>${button('fill-can','Isi penyiram',!p.supplies||p.can===capacity||p.tank===0)}<div class="callout">1.000 mL = 1 L. A perlu total 300 mL; B perlu 150 mL per hari.</div><div class="garden-links">${button('tank-to-A','Ke petak A',false,'secondary')}${button('tank-to-B','Ke petak B',false,'secondary')}</div>${modelNote}`,'M14 · PINDAHKAN AIR');
      $('fill-can').onclick=()=> {if(ctx.send({type:'fill'},id))interact(id);}; $('tank-to-A').onclick=()=>ctx.navigate('plotA');$('tank-to-B').onclick=()=>ctx.navigate('plotB');
    } else if(id==='recordTable') results();
  }
  function journal() {
    const p=ctx.get();ctx.pose('read');
    ctx.open('Jurnal M14 · Kebun Percobaan',`<div class="journal-summary"><span class="mission-tag">M14</span><span>${p.completed?'Percobaan selesai':`Hari simulasi ${p.day}`}</span></div><h3>Masalah dan dugaan</h3><p>Bagaimana jumlah air memengaruhi pertumbuhan kacang hijau? Dugaan awal model: air 100 mL per tanaman dapat menghasilkan pertumbuhan lebih tinggi daripada 50 mL pada kondisi yang sama. Dugaan perlu diuji.</p>
      <h3>Dua sumber pengetahuan</h3>${(['needs','fair'] as const).map(k=>`<div class="journal-entry"><strong>${p.sources[k]?'✓':'○'} ${sourceCards[k].title}</strong><p>${p.sources[k]?sourceCards[k].text:'Belum dibaca dan dicatat.'}</p></div>`).join('')}
      <h3>Rencana dan variabel</h3><p>${p.plan?'Air: A 100 mL/tanaman/hari, B 50 mL/tanaman/hari. Variabel terikat: tinggi (cm). Sama: benih, pot, media, cahaya, waktu. Tiga tanaman per kelompok.':'Belum dipilih bersama Bu Sari.'}</p>
      <h3>Perlakuan harian</h3><div class="table-scroll"><table id="watering-table"><thead><tr><th>Hari</th><th>A · total 300 mL</th><th>B · total 150 mL</th></tr></thead><tbody>${p.watered.slice(0,Math.min(6,p.day+1)).map((w,d)=>`<tr><td>${d}</td><td>${w.A?'✓ 100 mL × 3':'Belum'}</td><td>${w.B?'✓ 50 mL × 3':'Belum'}</td></tr>`).join('')}</tbody></table></div>
      <h3>Data dan grafik tinggi</h3>${growthGraph(p)}${measurementTable(p)}
      <h3>Kesimpulan</h3><p>${p.completed?'Dalam kondisi model ini A tumbuh lebih tinggi: rata-rata hari 6 A 8 cm, B 5 cm. Ini tidak membuktikan bahwa air tanpa batas selalu baik atau semua jenis tanaman bereaksi sama.':'Belum disimpulkan. Lengkapi data, lalu diskusikan di meja hasil atau bersama Bu Sari.'}</p><small>Upaya kesimpulan: ${p.attempts.length} · Hadiah pertama: ${p.reward} XP</small>${reflectionForm(p)}${modelNote}`,'M14 · CATATAN SISWA'); bindReflection();
  }
  return {interact,journal};
}
