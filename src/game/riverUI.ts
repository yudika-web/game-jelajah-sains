import { riverCards, fishLabels, featureLabels, fishGroups, fishingSites, fishIllustration, riverModelNote, type FishingSite, type RiverSource } from '../data/riverContent';
import { riverCounts, siteRecords, nextFish, fishingPrepared, type RiverEvent, type RiverProgress, type RiverAnswers } from './riverMission';
import { FishingSession } from './fishingSession';
import type { PlaceId } from '../data/content';
import { escapeText } from './gardenUI';
interface Context {
  get():RiverProgress;open(title:string,html:string,kicker?:string):void;close():void;
  send(event:RiverEvent,place?:PlaceId):boolean;navigate(id:PlaceId):void;
  approach(site:FishingSite,arrive:()=>void):void;lock(session:FishingSession):void;unlock():void;
}
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const btn=(id:string,text:string,disabled=false)=>`<button id="${id}" class="primary" ${disabled?'disabled':''}>${text}</button>`;
const note=`<p class="model-note">${riverModelNote}</p>`;
const sourcePlace:Record<RiverSource,PlaceId>={observation:'fishBook',procedure:'samplingNotes',limits:'fishResults'};
const answerText:Record<string,string>={A:'A',B:'B',both:'A dan B',onlyA:'hanya A',small:'sampel kecil belum menentukan populasi',population:'menganggap sampel sama dengan populasi',unproven:'penyebab/kebersihan belum dibuktikan',clean:'menganggap A pasti lebih bersih','':'belum memilih'};
const planText:Record<string,string>={'same-rod':'Alat sama',different:'Berbeda','standard':'Umpan standar','three':'Tiga percobaan','same-duration':'Durasi model sama','same-session':'Sesi virtual sama',location:'Lokasi','bait':'Umpan'};
export function riverResults(p:RiverProgress) {
  const counts=riverCounts(p),a=siteRecords(p,'A').length,b=siteRecords(p,'B').length;
  const cell=(v:number|null)=>v===null?'Belum diamati':String(v);
  return `<h3>Catatan yang sudah disahkan</h3><p>A: ${a}/3 · B: ${b}/3. ${a<3||b<3?'Hasil masih sebagian; angka hanya menghitung sampel yang sudah dicatat.':'Enam ikan dicatat dan dilepaskan.'}</p>
    <table id="river-counts"><caption>Jumlah dalam sampel pemain, bukan populasi</caption><thead><tr><th>Kelompok ciri</th><th>A (${a}/3)</th><th>B (${b}/3)</th><th>Seluruh sampel tercatat</th></tr></thead><tbody>${fishGroups.map(g=>`<tr><th>${fishLabels[g]}</th><td>${cell(counts[g].A)}</td><td>${cell(counts[g].B)}</td><td>${p.records.length?Number(counts[g].A)+Number(counts[g].B):'Belum diamati'}</td></tr>`).join('')}</tbody></table>
    <div id="river-chart" class="river-chart" role="img" aria-label="Diagram batang jumlah sampel di A dan B, skala 0 sampai 3. Nilai dan label juga tersedia pada tabel."><p>Jumlah sampel · skala 0–3 ikan</p>${fishGroups.map(g=>`<div class="river-bar-group"><strong>${fishLabels[g]}</strong>${fishingSites.map(s=>`<div class="river-bar-row"><span>${s}</span><div class="river-bar-track"><i class="bar-${s}" style="width:${(counts[g][s]??0)/3*100}%"></i></div><span>${cell(counts[g][s])}</span></div>`).join('')}</div>`).join('')}</div>${note}`;
}
export function riverJournal(p:RiverProgress) {
  return `${p.completed?'<div class="success-banner">✓ S13 selesai · 50 XP pertama</div>':''}<h3>Rencana dan sumber</h3><p>Alat pancing dan umpan standar · tiga percobaan per titik · durasi model sama · satu sesi virtual. Hanya lokasi dibandingkan. ${p.plan?'✓ Rencana sesuai':'Rencana belum disahkan'}.</p><ul>${Object.entries(riverCards).map(([key,c])=>`<li>${p.sources[key as RiverSource]?'✓':'○'} ${c.title} · informasi buku, bukan hasil pengukuran</li>`).join('')}</ul>
    ${riverResults(p)}<div class="table-scroll"><table id="river-records"><caption>Rekaman individu dan pelepasan</caption><thead><tr><th>ID</th><th>Kelompok / ciri</th><th>Catatan opsional</th><th>Status</th></tr></thead><tbody>${p.records.map(r=>`<tr><th>${r.id}</th><td>${fishLabels[r.group]} · ${featureLabels[r.feature]}</td><td>${escapeText(r.note)||'—'}</td><td>Dilepaskan</td></tr>`).join('')||'<tr><td colspan="4">Belum ada pengamatan sah.</td></tr>'}</tbody></table></div>
    <h3>Upaya awal dan perbaikan</h3><ul>${p.plans.map((a,i)=>`<li>Rencana ${i+1}: ${['tool','bait','trials','duration','session','factor'].map(k=>planText[a[k as keyof typeof a] as string]??'Belum memilih').join(' · ')} — ${a.correct?'sesuai':'perlu diperbaiki'}</li>`).join('')}${p.fishAttempts.map(a=>`<li>Ciri ${a.site}-${a.index+1}: ${featureLabels[a.feature as keyof typeof featureLabels]??'Belum memilih'} — ${a.correct?'sesuai model':'perlu diperbaiki'}</li>`).join('')}${p.conclusions.map((a,i)=>`<li>Kesimpulan ${i+1}: pipih ${answerText[a.flatA]??'belum memilih'}; berkumis ${answerText[a.whiskeredB]??'belum memilih'}; memanjang ${answerText[a.longBoth]??'belum memilih'}; ${answerText[a.sampleLimit]??'belum memilih'}; ${answerText[a.causeLimit]??'belum memilih'} — ${a.correct?'sesuai enam catatan dan keterbatasannya':'perlu diperbaiki; jawaban awal tersimpan'}</li>`).join('')}</ul>`;
}
export function createRiverUI(ctx:Context) {
  const session=new FishingSession();
  const overlay=document.createElement('section');overlay.id='fishing-panel';overlay.className='fishing-panel';overlay.hidden=true;overlay.setAttribute('aria-label','Kegiatan memancing');document.body.append(overlay);
  let lastPhase=session.phase, focused=true;
  const feedback=(text:string)=>{const el=$('river-feedback');if(el)el.textContent=text;};
  function read(source:RiverSource) {
    const p=ctx.get(),c=riverCards[source];ctx.open(c.title,`<p>${c.text}</p>${btn('river-read',p.sources[source]?'✓ Sumber tercatat':'Baca dan catat',p.sources[source])}${source==='limits'?riverResults(p):''}${note}`,'S13 · SUMBER PENGETAHUAN');
    $('river-read').onclick=()=>{if(ctx.send({type:'read',source},sourcePlace[source]))read(source);};
  }
  function plan() {
    const p=ctx.get();const options=[['tool','Alat pancing','same-rod','Alat yang sama','Alat berbeda'],['bait','Umpan','standard','Umpan standar sama','Umpan berbeda'],['trials','Jumlah percobaan','three','Tiga per titik','Jumlah berbeda'],['duration','Durasi simulasi','same-duration','Durasi model sama','Durasi berbeda'],['session','Sesi','same-session','Satu sesi virtual','Sesi berbeda'],['factor','Faktor yang dibandingkan','location','Lokasi A dan B','Umpan']];
    ctx.open('Rencana perbandingan yang adil',`<p>Samakan prosedur dan bandingkan satu faktor. Durasi dan sesi adalah kondisi model, bukan waktu nyata perangkat.</p><form id="river-plan-form" class="form-grid">${options.map(([name,label,value,text,wrong])=>`<label>${label}<select name="${name}"><option value="">Pilih</option><option value="${value}">${text}</option><option value="different">${wrong}</option></select></label>`).join('')}${btn('river-plan-save',p.plan?'✓ Rencana tercatat':'Simpan rencana',p.plan)}</form><p id="river-feedback" role="status"></p>${note}`,'S13 · PROSEDUR SAMPLING');
    $('river-plan-form').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement));if(ctx.send({type:'plan',choices:d as unknown as Parameters<typeof import('./riverMission').validPlan>[0]},'lestari'))lestari();else feedback('Samakan alat, umpan, tiga percobaan, durasi, dan sesi. Bandingkan hanya lokasi. Upaya awal tersimpan.');};
  }
  function conclusion() {
    const p=ctx.get();const questions=[['flatA','Tubuh pipih lebih sering tercatat pada sampel…',[['A','A'],['B','B']]],['whiskeredB','Ikan berkumis lebih sering tercatat pada sampel…',[['A','A'],['B','B']]],['longBoth','Tubuh memanjang tercatat di…',[['both','A dan B'],['onlyA','Hanya A']]],['sampleLimit','Apakah tiga pengamatan menentukan populasi sungai?',[['small','Belum; sampel terlalu kecil'],['population','Ya; sama dengan seluruh populasi']]],['causeLimit','Apa arti perbedaan hasil?',[['unproven','Penyebab dan kebersihan belum dibuktikan'],['clean','A pasti lebih bersih dan lebih baik']]]] as const;
    ctx.open('Kesimpulan Catatan Ikan Dua Titik',`${riverResults(p)}<form id="river-conclusion-form" class="form-grid">${questions.map(([name,label,choices])=>`<label>${label}<select name="${name}"><option value="">Pilih</option>${choices.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`).join('')}${btn('river-conclude','Sampaikan kesimpulan',p.completed||p.records.length!==6||!p.sources.limits)}</form><p id="river-feedback" role="status"></p>`,'S13 · BUKTI DAN KETERBATASAN');
    $('river-conclusion-form').onsubmit=e=>{e.preventDefault();const answers=Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)) as RiverAnswers;if(ctx.send({type:'conclude',answers},'lestari'))lestari();else feedback('Baca angka pada tabel dan batas sampel. Jawaban awal tersimpan; kamu dapat memperbaikinya.');};
  }
  function lestari() {
    const p=ctx.get();ctx.open(p.completed?'S13 · Catatan Ikan selesai':'Kak Lestari · pos riset',`${p.completed?'<div class="success-banner">✓ S13 selesai · hadiah pertama 50 XP</div>':''}<p>“Bantu catat ikan pada dua titik yang diizinkan. Pakai prosedur sama, amati cirinya, lalu lepaskan kembali. Kamu boleh membaca dan menarik pancing tanpa terburu-buru.”</p>${btn('river-accept',p.accepted?'✓ S13 diterima':'Terima S13',p.accepted)}${p.accepted?`${btn('river-plan','Pilih rencana perbandingan',!p.sources.observation||!p.sources.procedure)}${btn('river-open-conclusion','Bandingkan dan simpulkan',p.records.length!==6)}<p>A ${siteRecords(p,'A').length}/3 · B ${siteRecords(p,'B').length}/3. Baca keterbatasan pada Papan hasil sebelum menyimpulkan.</p>`:''}${note}`,'S13 · CATATAN IKAN DUA TITIK');
    $('river-accept').onclick=()=>{if(ctx.send({type:'accept'},'lestari'))lestari();};if(p.accepted){$('river-plan').onclick=plan;$('river-open-conclusion').onclick=conclusion;}
  }
  function site(site:FishingSite) {
    const p=ctx.get(),count=siteRecords(p,site).length;ctx.open(`Titik ${site} · pengamatan ikan`,`<p>${site==='A'?'Tepian bervegetasi':'Dermaga dekat bagian sungai lebih dalam'}. Tetap di darat. ${count}/3 pengamatan telah dicatat dan ikan dilepaskan.</p>${!fishingPrepared(p)?'<p>Terima tugas, baca buku dan prosedur, pinjam pancing, lalu sahkan rencana bersama Kak Lestari.</p>':''}${btn('river-start-fishing',count===3?'✓ Titik ini lengkap':'Mulai memancing',!fishingPrepared(p)||count===3)}${count===3?btn('river-other-site',`Menuju titik ${site==='A'?'B':'A'}`):''}<p>Prosedur model sama pada setiap percobaan. Tombol Tarik tetap tersedia sampai kamu siap. Tidak ada batas waktu reaksi.</p>${note}`,'S13 · PENGAMATAN TEPIAN');
    $('river-start-fishing').onclick=()=>{ctx.close();ctx.approach(site,()=>{if(!fishingPrepared(ctx.get())||!nextFish(ctx.get(),site))return;if(session.start(site,siteRecords(ctx.get(),site).length)){ctx.lock(session);renderFishing();}});};
    const other=$('river-other-site');if(other)other.onclick=()=>ctx.navigate(site==='A'?'fishingB':'fishingA');
  }
  function cancel(){if(!session.active)return;session.cancel();overlay.hidden=true;document.body.classList.remove('fishing-active');ctx.unlock();lastPhase='idle';}
  function renderFishing() {
    lastPhase=session.phase;
    if(!session.active){overlay.hidden=true;document.body.classList.remove('fishing-active');ctx.unlock();return;}
    overlay.hidden=false;document.body.classList.add('fishing-active');
    const p=ctx.get(),phase=session.phase,fish=nextFish(p,session.site);
    const status={casting:'Melempar pancing…',waiting:'Menunggu ikan mendekat…',ready:'Ikan mendekat · siap ditarik',observing:'Amati ciri yang terlihat',released:'Ikan dilepaskan · catatan disahkan',idle:''}[phase];
    overlay.innerHTML=`<div class="eyebrow">S13 · TITIK ${session.site} · ${session.index+1}/3</div><h2 id="fishing-status" role="status">${status}</h2>${phase==='observing'?`${fishIllustration(fish)}<p>Pilih ciri model yang sedang diamati.</p><form id="river-record-form"><label>Ciri yang terlihat<select id="river-feature" required><option value="">Pilih ciri</option>${fishGroups.map(g=>`<option value="${g}">${featureLabels[g]}</option>`).join('')}</select></label><details id="river-note"><summary>Catatan singkat (opsional)</summary><label>Catatan ciri<textarea id="river-fish-note" rows="2" maxlength="300" placeholder="Tuliskan yang terlihat"></textarea></label></details>${btn('river-record-release','Catat dan lepaskan')}</form><p id="river-feedback" role="status"></p>`:phase==='released'?'<p>Data tersimpan satu kali. Ikan kembali ke air.</p>':`<p>Alat, umpan, durasi model, dan sesi sama. ${phase==='ready'?'Tarik kapan kamu siap.':'Menunggu berhenti ketika tab tersembunyi atau jendela kehilangan fokus.'}</p>${btn('river-pull','Tarik',phase!=='ready')}`}<button id="river-cancel-fishing" class="secondary">${phase==='released'?'Selesai':'Batalkan'}</button>`;
    $('river-cancel-fishing').onclick=cancel;
    if(phase==='ready'){$('river-pull').onclick=()=>{if(session.pull())renderFishing();};$('river-pull').focus({preventScroll:true});}
    if(phase==='observing'){
      let committed=false;
      $('river-record-form').onsubmit=e=>{e.preventDefault();if(committed||session.phase!=='observing')return;
        if(ctx.send({type:'record',site:session.site,index:session.index,feature:$<HTMLSelectElement>('river-feature').value,note:$<HTMLTextAreaElement>('river-fish-note').value,revision:ctx.get().revision},session.site==='A'?'fishingA':'fishingB')){committed=true;session.release();renderFishing();}else feedback('Perhatikan bentuk badan dan garis di sekitar mulut. Pilih ciri yang tampak; catatan belum disahkan.');
      };$('river-feature').onchange=()=>feedback('');$('river-feature').focus({preventScroll:true});
    }
  }
  function journal() {
    const p=ctx.get();ctx.open('Jurnal Catatan Ikan Dua Titik',`${riverJournal(p)}<form id="river-reflection-form"><label>Refleksi untuk guru (opsional)<textarea id="river-reflection" rows="3" maxlength="1000">${escapeText(p.reflection)}</textarea></label>${btn('river-save-reflection','Simpan refleksi',!p.accepted)}<p id="river-feedback" role="status"></p><small>Disimpan lokal, belum dikirim. Tidak dinilai otomatis.</small></form>`,'S13 · CATATAN LAPANGAN');
    $('river-reflection-form').onsubmit=e=>{e.preventDefault();if(ctx.send({type:'reflect',text:$<HTMLTextAreaElement>('river-reflection').value}))feedback('Refleksi disimpan.');else feedback('Terima S13 dari Kak Lestari dahulu.');};
  }
  function interact(id:PlaceId) {
    if(id==='lestari'){lestari();return;}
    if(!ctx.get().accepted){ctx.open('Temui Kak Lestari',`<p>Terima tugas dahulu.</p>${btn('river-go-lestari','Menuju Kak Lestari')}`);$('river-go-lestari').onclick=()=>ctx.navigate('lestari');return;}
    if(id==='fishBook')read('observation');else if(id==='samplingNotes')read('procedure');else if(id==='fishResults')read('limits');
    else if(id==='fishingA'||id==='fishingB')site(id==='fishingA'?'A':'B');
    else if(id==='fishTable')journal();
    else if(id==='rodRack'){ctx.open('Alat pancing pinjaman',`<p>Satu pancing dan satu umpan standar untuk kedua titik. Alat terlihat di tangan ketika memancing. Ikan dicatat lalu dilepaskan, tidak masuk tas.</p>${btn('river-borrow-rod',ctx.get().rod?'✓ Pancing tersedia':'Pinjam pancing dan umpan',ctx.get().rod)}${note}`,'S13 · ALAT PENGAMATAN');$('river-borrow-rod').onclick=()=>{if(ctx.send({type:'rod'},'rodRack'))interact(id);};}
  }
  return {interact,journal,cancel,session,suspend(value:boolean){focused=!value;},frame(dt:number,active:boolean){session.tick(dt,active&&focused);if(lastPhase!==session.phase)renderFishing();}};
}
