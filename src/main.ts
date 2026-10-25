import {initialEnergy,energyTransition,energySteps,settleEnergy,type EnergyEvent} from './game/energyMission';
import {createEnergyUI} from './game/energyUI';
import {energyPlaces} from './data/energyRegion';
import {energyCards} from './data/energyContent';
import {m17ChapterStatus} from './game/m17Chapter';
import {initialElectromagnet,electromagnetTransition,electromagnetSteps,settleElectromagnet,type MagnetEvent} from './game/electromagnetMission';
import {createElectromagnetUI,magnetJournal} from './game/electromagnetUI';
import {magnetCards,magnetNote} from './data/electromagnetContent';
import {electromagnetPlaces} from './data/electromagnetRegion';
import {evaluateCircuit} from './game/circuitModel';
import {initialWorkshop,workshopTransition,workshopSteps,type WorkshopEvent} from './game/workshopMission';
import {createWorkshopUI} from './game/workshopUI';
import {initialBuoyancy,buoyancyTransition,buoyancySteps,type BuoyancyEvent} from './game/buoyancyMission';
import {createBuoyancyUI} from './game/buoyancyUI';
import {poolEntry,poolMarker,poolExit} from './data/poolRegion';
import { initialIrrigation,irrigationTransition,irrigationSteps,type IrrigationEvent } from './game/irrigationMission';
import { createIrrigationUI } from './game/irrigationUI';
import { docks,nearbyDock,type DockId } from './data/boatRegion';
import { initialRiver, riverTransition, riverSteps, nextFish, siteRecords, type RiverEvent } from './game/riverMission';
import { createRiverUI } from './game/riverUI';
import { fishingPositions } from './data/riverRegion';
import './style.css';
import { initialRimba, rimbaTransition, rimbaSteps, litres, type RimbaEvent } from './game/rimbaMission';
import { createRimbaUI, rimbaInventory } from './game/rimbaUI';
import { RimbaSession } from './game/rimbaSession';
import { cards, conclusions, type PlaceId } from './data/content';
import { initialProgress, transition, steps, type MissionEvent } from './game/mission';
import { loadGame, saveGame } from './game/storage';
import { World, type InputMode } from './engine/world';
import { bindInput } from './engine/input';
import { loadPreferences, savePreferences } from './game/preferences';
import type { InteractionPose } from './engine/characterAnimator';
import type { CameraDistance } from './engine/cameraController';
import { regions, regionOf } from './data/regions';
import { initialGarden, gardenTransition, gardenSteps, type GardenEvent } from './game/gardenMission';
import { importBackup, makeBackup, type TravelState, type RegionId, type MissionId } from './game/gameState';
import { createGardenUI, gardenInventory } from './game/gardenUI';

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
      <label class="mission-picker">Misi aktif<select id="active-mission"><option value="M01">M01 · Detektif Air Kota</option><option value="M14">M14 · Kebun Percobaan</option><option value="W03-LOG01">W03 · Bantu Pos Rimba</option><option value="S13">S13 · Catatan Ikan Dua Titik</option><option value="S14">S14 · Terapung atau Tenggelam?</option><option value="S15">S15 · Misteri Saluran Irigasi</option><option value="M17-E1">M17-E1 · Nyalakan Lampu Pos Riset</option><option value="M17-E2">M17-E2 · Derek Elektromagnet</option><option value="M17-E3">M17-E3 · Energi untuk Pos Riset</option></select></label>
      <h1 id="mission-name">Detektif Air Kota</h1><p class="mission-intro">Ada cerita di balik air yang keruh.<br>Temukan jawabannya lewat bukti.</p>
      <div class="progress-track"><span id="progress-fill"></span></div>
      <div class="progress-caption"><span id="progress-text">0 dari 6 langkah</span><span>+100 XP</span></div>
      <p id="garden-status" hidden></p><ol id="mission-steps"></ol>
      <button class="mission-details" id="mission-details">Lihat semua langkah ${icon('arrow')}</button>
      <div class="mission-note">${icon('leaf')} Amati. Bandingkan. Temukan.</div>
    </aside>
    <div class="world-note"><span class="north">N</span>${icon('compass')}<span>ALUN-ALUN KOTA</span></div>
    <button class="minimap" id="mini-map" aria-label="Buka peta Kota Sains"><svg viewBox="0 0 160 120" aria-hidden="true"><rect width="160" height="120" rx="12" fill="#dce4cb"/><path d="M121 0v120" stroke="#80b5bd" stroke-width="20"/><path d="M65 0v120M0 65h115" stroke="#f9f0d7" stroke-width="14"/><path d="M12 13h34v25H12Zm0 67h24v22H12Zm62-69h20v20H74Z" fill="#b5c5af"/><circle cx="65" cy="68" r="6" fill="#225e50" stroke="#fff" stroke-width="3"/><circle cx="106" cy="46" r="4" fill="#d6a558"/><circle cx="106" cy="96" r="4" fill="#589caf"/></svg><span>${icon('map')} Peta wilayah <kbd>M</kbd></span></button>
    <div class="bottom-left"><div class="save-status" id="save-status" role="status">● Progres lokal</div><div class="keyboard-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> bergerak <span>·</span> Shift berlari</div></div>
    <button id="run-toggle" class="run-toggle" aria-pressed="false" aria-label="Mode Jalan; ketuk untuk Lari"><span>Jalan</span><small>Ketuk untuk Lari</small></button>
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
      <p>Jelajahi Kota Sains, Kebun Kehidupan, Pos Rimba, Sungai dan Danau, serta Bengkel dan Energi untuk memahami dunia. Siap mencari bukti pertamamu?</p>
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
  <div id="travel-transition" role="status" hidden></div>
  <div id="toast" role="status" aria-live="polite" hidden></div>
`;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let progress = initialProgress();
let garden = initialGarden();
let rimba = initialRimba();
let river = initialRiver();
let buoyancy=initialBuoyancy();
let irrigation=initialIrrigation();
let workshop=initialWorkshop();
let electromagnet=initialElectromagnet();
let energy=initialEnergy();
const chapterLabel=()=>m17ChapterStatus(workshop,electromagnet,energy);
let travel: TravelState = { region: 'town', activeMission: 'M01' };
let travelling = false;
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
  const snapshot = structuredClone({ M01: progress, M14: garden, Rimba:rimba, S13:river, S14:buoyancy,S15:irrigation, M17E1:workshop, M17E2:electromagnet,M17E3:energy, world: travel });
  snapshot.M01.savedAt = new Date().toISOString();
  const generation = ++saveGeneration;
  saveLabel('◌ Menyimpan progres…');
  saveChain = saveChain.then(async () => {
    try {
      await saveGame(snapshot);
      if (generation === saveGeneration) {
        progress.savedAt = snapshot.M01.savedAt;
        saveLabel(`● Tersimpan ${new Date(snapshot.M01.savedAt!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
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
function gateTo(target:RegionId) {return travel.region==='town'?(target==='workshop'?'workshopGate':target==='rimba'?'rimbaGate':target==='river'?'riverGate':'gardenGate'):regions[travel.region].gate;}
function updateMission() {
  const isGarden = travel.activeMission === 'M14',isRimba=travel.activeMission==='W03-LOG01',isRiver=travel.activeMission==='S13',isIrrigation=travel.activeMission==='S15',isBuoyancy=travel.activeMission==='S14',isWorkshop=travel.activeMission==='M17-E1',isMagnet=travel.activeMission==='M17-E2',isEnergy=travel.activeMission==='M17-E3';
  const list = isEnergy?energySteps(energy):isMagnet?electromagnetSteps(electromagnet):isWorkshop?workshopSteps(workshop):isBuoyancy?buoyancySteps(buoyancy):isIrrigation?irrigationSteps(irrigation):isRiver?riverSteps(river):isRimba?rimbaSteps(rimba):isGarden ? gardenSteps(garden) : steps(progress);
  const title=isEnergy?'Energi untuk Pos Riset':isMagnet?'Derek Elektromagnet':isWorkshop?'Nyalakan Lampu Pos Riset':isBuoyancy?'Terapung atau Tenggelam?':isIrrigation?'Misteri Saluran Irigasi':isRiver?'Catatan Ikan Dua Titik':isRimba?'Bantu Pos Rimba':isGarden?'Kebun Percobaan':'Detektif Air Kota';
  $('mission-name').textContent = title;
  document.querySelector('.mission-intro')!.innerHTML=isEnergy?`Uji sumber, rencanakan, catat neraca.<br>Bab M17 · ${chapterLabel()}.`:isMagnet?`Amati bahan, bandingkan modul, angkut klip.<br>Bab M17 · ${chapterLabel()}.`:isWorkshop?`Telusuri lintasan, periksa, lalu uji.<br>Bab M17 · ${chapterLabel()}.`:isBuoyancy?'Prediksi, uji, lalu catat.<br>Bandingkan massa dan volume.':isIrrigation?'Periksa saluran sebelum bertindak.<br>Bandingkan data sebelum dan sesudah.':isRiver?'Amati ikan pada dua titik.<br>Bandingkan sampel dan batas buktinya.':isRimba?'Bantu persediaan pos aman.<br>Rencanakan pengiriman dengan data.':isGarden?'Dua kelompok tanaman, satu percobaan.<br>Catat pertumbuhan dan bandingkan.':'Ada cerita di balik air yang keruh.<br>Temukan jawabannya lewat bukti.';
  document.querySelector('.welcome-mission .mission-tag')!.textContent = isRimba?'W03':travel.activeMission;
  document.querySelector('.welcome-mission strong')!.textContent = title;
  document.querySelector('.welcome-mission small')!.textContent = isEnergy?'W06 · Daya dan energi · Episode 3':isMagnet?'W06 · Elektromagnet · Episode 2':isWorkshop?'W06 · Rangkaian virtual 3 V · Episode 1':isBuoyancy?'W04 · Kolam · Massa jenis':isIrrigation?'W04 · Perahu · Debit · Hambatan':isRiver?'W04 · Ciri ikan · Sampling':isRimba?'W03 · Kapasitas · Volume · Habitat':isGarden ? `Hari ${garden.day}/6 · Enam tanaman · Satu percobaan` : 'Metode ilmiah · Dua sampel · Satu penyelidikan';
  document.querySelector('.mission-card .mission-tag')!.textContent = isRimba?'W03':travel.activeMission;
  $<HTMLSelectElement>('active-mission').value = travel.activeMission;
  $('garden-status').hidden = !isGarden&&!isRimba&&!isRiver&&!isIrrigation&&!isBuoyancy&&!isWorkshop&&!isMagnet&&!isEnergy;
  $('garden-status').textContent = isEnergy?`${energy.records.length}/6 uji · ${energy.batteryMWh/1000}/8 Wh · Bab M17 ${chapterLabel()} · XP ${progress.reward+garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`:isMagnet?`${electromagnet.observations.length}/4 bahan · ${electromagnet.coilRecords.length}/3 modul · ${Object.values(electromagnet.crane.clips).filter(x=>x==='bin').length}/6 terkirim · M17 ${chapterLabel()}`:isWorkshop?`Lampu ${evaluateCircuit(workshop).lampOn?'menyala':'mati'} · M17 ${chapterLabel()} · XP ${progress.reward+garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`:isBuoyancy?`${buoyancy.records.length}/3 benda diuji · Latihan ${buoyancy.practice?'selesai':'belum selesai'}`:isIrrigation?`${irrigation.records.length}/6 pengukuran · ${irrigation.cleaned?'Sesudah':'Sebelum'} tindakan · XP ${progress.reward+garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`:isRiver?`A ${siteRecords(river,'A').length}/3 · B ${siteRecords(river,'B').length}/3 · XP ${progress.reward+garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`:isRimba?`Sumber ${litres(rimba.source)} · ${rimba.activeTool?(rimba.activeTool==='bucket'?'Ember ':'Gerobak ')+litres(rimba[rimba.activeTool]):'Alat di pos'} · XP ${progress.reward+garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`:`Hari ${garden.day}/6 · Penyiram ${garden.can}/1.000 mL · XP ${progress.reward + garden.reward+rimba.reward+river.reward+irrigation.reward+buoyancy.reward+workshop.reward+electromagnet.reward+energy.reward}`;
  document.querySelector('.progress-caption > span:last-child')!.textContent=isEnergy||isMagnet||isWorkshop||isRiver||isIrrigation||isBuoyancy?'+50 XP':'+100 XP';
  const completed = isEnergy?energy.completed:isMagnet?electromagnet.completed:isWorkshop?workshop.completed:isBuoyancy?buoyancy.completed:isIrrigation?irrigation.completed:isRiver?river.completed:isRimba?rimba.completed:isGarden ? garden.completed : progress.completed;
  const listForRegion = list.map(step => ({ ...step, place: regionOf(step.place as PlaceId) === travel.region ? step.place : gateTo(regionOf(step.place as PlaceId)) }));
  const effectiveList = listForRegion; const done = list.filter(s => s.done).length;
  $('progress-fill').style.width = `${done / list.length * 100}%`;
  $('progress-text').textContent = `${done} dari ${list.length} langkah${completed ? ' · Selesai!' : ''}`;
  $('mission-steps').innerHTML = effectiveList.map((s, i) => `<li class="${s.done ? 'done' : list.findIndex(t => !t.done) === i ? 'active' : ''}"><span class="step-number">${s.done ? '✓' : String(i + 1).padStart(2, '0')}</span><button data-guide="${s.place}"><strong>${s.title}</strong><small>${s.detail}</small></button></li>`).join('');
  $('mission-steps').querySelectorAll<HTMLButtonElement>('[data-guide]').forEach(b => { b.onclick = () => navigate(b.dataset.guide as PlaceId); });
}
function closePanel() { energyUI.pause();electromagnetUI.pause();panel.close(); if (world) { world.paused = !started; world.endInteraction(); } }
function openPanel(title: string, html: string, kicker = 'CATATAN PENJELAJAH') {
  energyUI.pause();electromagnetUI.pause();buoyancyUI.cancel();irrigationUI.cancel();riverUI.cancel();rimbaSession.flush(); clearInput(); if (world) world.paused = true;
  panel.classList.toggle('character-interaction', started && world?.playerAnimator.pose !== 'none');
  $('panel-title').textContent = title; $('panel-kicker').textContent = kicker;
  $('panel-content').innerHTML = html;
  if (!panel.open) panel.showModal();
  $('close-panel').focus();
}
function navigate(id: PlaceId, running?: boolean) {
  if (!world || !started) { toast('Mulai menjelajah terlebih dahulu.'); return; }
  if(regionOf(id) !== world.region) { toast(`Gunakan gerbang menuju ${regions[regionOf(id)].name} dahulu.`); id = gateTo(regionOf(id)); }
  if(world.region==='river'&&world.swimming&&id!=='poolRamp'&&id!=='poolBuoy'){toast('Keluar melalui ramp atau Kembali ke Tepian dahulu.');id='poolRamp';}
  if(id==='poolBuoy'&&!world.swimming&&!world.boat.aboard&&world.position.x<=15){closePanel();world.goTo(poolEntry,()=>world?.goTo(poolMarker,()=>interactAt('poolBuoy')));return;}
  if(world.boat.aboard){const d:DockId=(world.places.find(p=>p.id===id)?.x??0)>15?'irrigation':'research';closePanel();if(running!==undefined)world.running=running;world.sailTo(d,()=>{toast('Tiba di tanda sandar. Pilih Sandar, lalu Turun.');});return;}
  if(world.region==='river'&&((id==='boatObservation'||id==='irrigationScreen'||id==='cleaningRack'||id==='P1'||id==='P2'||id==='P3')!== (world.position.x>15)) && !['lestari','boatStart','flowBook','irrigationNotes','fishBook','samplingNotes','fishingA','fishingB','fishTable','fishResults','riverTownGate'].includes(id)){id=world.position.x>15?'boatObservation':'boatStart';toast('Gunakan perahu untuk berpindah tepian.');}
  if(world.region==='river'&&world.position.x>15&&['lestari','boatStart','flowBook','irrigationNotes','fishBook','samplingNotes','fishingA','fishingB','fishTable','fishResults','riverTownGate'].includes(id)){id='boatObservation';toast('Gunakan perahu untuk kembali ke pos riset.');}
  if(id==='receiverC'&&!rimba.cOpen){toast('Jalur C masih ditutup. Minta konfirmasi Pak Damar.');id='damar';}
  closePanel(); if (running !== undefined) world.running = running;
  const place = world.places.find(p => p.id === id);
  if(!place) return;
  // Stop in front of the object instead of overlapping the NPC or sample bottle.
  const approach = id==='poolRamp'?poolExit:id==='poolBuoy'?poolMarker:id==='boatStart'||id==='boatObservation'?{x:place.x,z:place.z}:{ x: place.x, z: place.z + world.approach(id) };
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
  if(world?.boat.aboard&&started){if(world.boat.dock){if(!world.exitBoat())toast('Titik turun terhalang. Sandar dengan benar.');}else if(!world.moorBoat())toast('Dekati tanda sandar dahulu.');return;}
  const place = world?.places.find(p => p.id === id);
  if (!world || !started || travelling || !place || Math.hypot(world.position.x-place.x,world.position.z-place.z)>world.interactionRadius+.05) return;
  if(id==='workshopGate'||id==='workshopTownGate'||id==='gardenGate'||id==='townGate'||id==='rimbaGate'||id==='forestTownGate'||id==='riverGate'||id==='riverTownGate') {
    const target: RegionId = id==='workshopGate'?'workshop':id==='gardenGate'?'garden':id==='rimbaGate'?'rimba':id==='riverGate'?'river':'town';
    world.beginInteraction(id,'read');
    openPanel(`Gerbang menuju ${regions[target].name}`, `<p>Masuk ke ${regions[target].name}. Semua misi dan isi tas tetap tersimpan.</p><button class="primary" id="enter-region">Masuk ${regions[target].name}</button>`,`${regions[target].code} · PERJALANAN`);
    $('enter-region').onclick=()=>void changeRegion(target); return;
  }
  if(world.region==='workshop'&&(energyPlaces.some(p=>p.id===id)||id==='bima'&&travel.activeMission==='M17-E3')){world.beginInteraction(id,id==='bima'?'greet':'measure');energyUI.interact(id);return;}
  if(world.region==='workshop'&&(electromagnetPlaces.some(p=>p.id===id)||id==='bima'&&travel.activeMission==='M17-E2')){world.beginInteraction(id,id==='bima'?'greet':'measure');electromagnetUI.interact(id);return;}
  if(world.region==='workshop'){world.beginInteraction(id,id==='bima'?'greet':id==='circuitBoard'?'plant':'measure');workshopUI.interact(id);return;}
  if(world.region==='river'&&(id==='poolRamp'||id==='poolBuoy'||id==='densityBook'||id==='floatBench'||id==='lestari'&&travel.activeMission==='S14')){world.beginInteraction(id,id==='lestari'?'greet':'read');buoyancyUI.interact(id);return;}
  if(world.region==='river'&&(id==='boatStart'||id==='boatObservation'||id==='flowBook'||id==='irrigationNotes'||id==='irrigationScreen'||id==='cleaningRack'||id==='P1'||id==='P2'||id==='P3'||id==='lestari'&&travel.activeMission==='S15')){world.beginInteraction(id,id==='lestari'?'greet':'read');irrigationUI.interact(id);return;}
  if(world.region==='river'){world.beginInteraction(id,id==='lestari'?'greet':'read');riverUI.interact(id);return;}
  if(world.region==='rimba') {rimbaSession.flush();world.beginInteraction(id,id==='damar'?'greet':'read');rimbaUI.interact(id);return;}
  if(world.region==='garden') { world.beginInteraction(id,id==='sari'?'greet':'read'); gardenUI.interact(id); return; }
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
  if(travel.activeMission==='M17-E3'){energyUI.journal();return;}
  if(travel.activeMission==='M17-E2'){electromagnetUI.journal();return;}
  if(travel.activeMission==='M17-E1'){workshopUI.journal();return;}
  if(travel.activeMission==='S14'){buoyancyUI.journal();return;}
  if(travel.activeMission==='S15'){irrigationUI.journal();return;}
  if(travel.activeMission==='S13'){riverUI.journal();return;}
  rimbaSession.flush();if(travel.activeMission==='W03-LOG01'){world?.setInteractionPose('read');rimbaUI.journal();return;}
  if(travel.activeMission==='M14') {gardenUI.journal();return;}
  world?.setInteractionPose('read');
  openPanel('Jurnal Sains', `<div class="journal-summary"><span class="mission-tag">M01</span><span>${progress.completed ? 'Penyelidikan selesai' : 'Penyelidikan berlangsung'}</span></div><h3>Dugaan awal</h3><p>${progress.hypothesis ? '“Semua air keruh pasti berasal dari limbah.” — Pak Wira. Status: dugaan, bukan fakta.' : 'Belum dicatat. Temui Pak Wira.'}</p><h3>Sumber pengetahuan</h3>${(['book', 'rain'] as const).map(id => `<div class="journal-entry"><strong>${progress.sources[id] ? '✓' : '○'} ${cards[id].title}</strong>${progress.sources[id] ? `<p>${cards[id].text}</p>` : '<p>Belum dibaca dan dicatat.</p>'}</div>`).join('')}<h3>Data pengamatan</h3><p class="model-note">Indeks model /100, bukan NTU. Semua menggunakan hujan simulasi yang sama.</p><table><thead><tr><th>Sampel</th><th>Awal</th><th>Sesudah uji</th></tr></thead><tbody><tr><td>A · lahan terbuka</td><td>${progress.samples.A?.value ?? 'Belum diukur'}</td><td>${progress.trial ?? 'Belum diuji'}</td></tr><tr><td>B · pembanding</td><td>${progress.samples.B?.value ?? 'Belum diukur'}</td><td>Tidak diuji ulang</td></tr></tbody></table><h3>Rencana & kesimpulan</h3><p>${progress.plan ? 'Alat kekeruhan virtual; lokasi berbeda; kondisi hujan dan waktu pengambilan sama.' : 'Rencana pengamatan belum dibuat.'}</p><p>${progress.completed ? conclusions[0].text : 'Kumpulkan bukti dan lakukan uji sebelum menyimpulkan.'}</p><small class="source">Percobaan kesimpulan: ${progress.attempts.length} · Hadiah: ${progress.reward} XP · Data lokal pada browser ini.</small>`, 'PENEMUAN · DATA · DUGAAN · PERCOBAAN');
}
function inventory() {
  world?.endInteraction();
  openPanel('Tas penjelajah', `<p>Alat esensial dipinjamkan Bu Nara saat misi diterima. Tidak perlu membeli alat.</p><div class="inventory-grid">${[{ name: 'Botol berlabel A', info: progress.samples.A ? 'Terisi · sampel A · indeks 70' : 'Kosong · khusus titik A' }, { name: 'Botol berlabel B', info: progress.samples.B ? 'Terisi · sampel B · indeks 20' : 'Kosong · khusus titik B' }, { name: 'Alat kekeruhan virtual', info: 'Skala model 0–100 · bukan NTU' }, { name: 'Jurnal & peta', info: 'Catatan otomatis setelah pengamatan' }].map(item => `<div class="inventory-item">${icon('flask')}<strong>${item.name}</strong><small>${progress.accepted ? item.info : 'Terima misi untuk meminjam'}</small></div>`).join('')}</div><h3>M17-E1 · Kabel pengganti</h3><p>${workshop.spareWire?'Kabel di tas; pasang pada terminal yang diperiksa.':workshop.repaired?'Kabel sudah terpasang pada S2–L1.':'Pinjam kabel di rak W06 setelah pemeriksaan lengkap.'}</p><h3>M17-E3 · Energi</h3><p>Penyimpan: ${energy.batteryMWh/1000}/8 Wh. Energi awal 2 Wh berasal dari pengisian sebelum latihan; alat E3 terpisah dari E1/E2.</p><h3>M17-E2 · Alat elektromagnet</h3><p>${electromagnet.core?`Inti terpasang; modul ${electromagnet.coil??"belum ada"}; sumber arus terkontrol virtual terpisah dari E1.`:"Komponen dipinjam di rak halaman daur ulang setelah pengamatan dan rencana."}</p>${gardenInventory(garden)}${rimbaInventory(rimba)}<h3>S13 · Alat pengamatan</h3><p>${river.rod?'Pancing pinjaman dan umpan standar tersedia.':'Pinjam pancing di pos riset W04.'} Ikan dicatat dan dilepaskan; tidak masuk tas atau dijual.</p>${world?.pushing?'<button id="rimba-park-route" class="secondary">Ke bengkel untuk parkir</button>':''}<div class="callout">Botol A dan B terpisah; membaca hasil tersimpan tidak mengambil sampel baru atau menggandakan hadiah.</div>`, 'PERALATAN M01 · M14 · POS RIMBA · S13 · M17-E1 · M17-E2');
  const parkButton=$('rimba-park-route');if(parkButton)parkButton.onclick=()=>navigate('workshop');
}
function regionMapSvg() {
  const r = regions[travel.region], navigation=world?.navigation??r.navigation, isTown = travel.region === 'town';
  return `<svg id="town-map" viewBox="-20 ${travel.region==='workshop'?-35:-19} ${travel.region==='workshop'?56:travel.region==='river'?46:40} ${travel.region==='workshop'?56:38}" role="img" aria-label="Peta ${r.name}"><rect x="-20" y="${travel.region==='workshop'?-35:-19}" width="${travel.region==='workshop'?56:40}" height="${travel.region==='workshop'?56:38}" rx="1" fill="#dce4cb"/>${isTown?'<path d="M14-19v38" stroke="#80b5bd" stroke-width="4"/>':''}<path d="M0-17v34M-17 4h33" stroke="#f6e5bc" stroke-width="3"/>${navigation.obstacles.map(o=>`<rect x="${o.x-o.width/2}" y="${o.z-o.depth/2}" width="${o.width}" height="${o.depth}" fill="#a7b99e"/>`).join('')}${r.places.map(p=>`<circle cx="${p.x}" cy="${p.z}" r=".7" fill="${p.color}" stroke="#fff" stroke-width=".25"/><text x="${p.x-1}" y="${p.z-1}" font-size="1" fill="#244b42">${p.short}</text>`).join('')}<circle cx="${world?.position.x??0}" cy="${world?.position.z??6}" r=".6" fill="#163d34" stroke="#fff" stroke-width=".3"/></svg>`;
}
function map() {
  const running = world?.running ?? false;
  world?.endInteraction(); const r=regions[travel.region];
  openPanel(`Peta ${r.name}`, `<p>Pilih tujuan. Pemain berjalan di jalur wilayah ini dan berinteraksi saat tiba. Gerbang menghubungkan Kota, Kebun, Rimba, Sungai dan Danau, serta Bengkel dan Energi. Air biasa tetap dibatasi. Jalur bertanda dapat dilalui perahu; naik dan turun melalui dermaga. Ini tidak membuka izin berenang di seluruh sungai. Jalur C memerlukan konfirmasi Pak Damar.</p><div class="map-layout">${regionMapSvg()}<div class="destination-list">${r.places.filter(p=>!world?.boat.aboard||p.id==='boatStart'||p.id==='boatObservation').map(p=>`<button data-destination="${p.id}"><span class="place-dot" style="background:${p.color}"></span>${p.short}${p.id==='receiverC'&&!rimba.cOpen?' · terkunci':''}${icon('arrow')}</button>`).join('')}</div></div>`, `${r.code} · JELAJAH WILAYAH`);
  document.querySelectorAll<HTMLButtonElement>('[data-destination]').forEach(b=>{b.onclick=()=>navigate(b.dataset.destination as PlaceId, running);});
}
function updateRegionUI() {
  const r=regions[travel.region];
  document.querySelector('.welcome-world-label')!.innerHTML=`<span class="live-dot"></span> ${r.code} / ${r.name.toUpperCase()} <span>Lingkungan belajar 3D</span>`;
  document.querySelector('.location')!.innerHTML=`<span class="live-dot"></span><div>${r.name}<small>${r.code} · ${travel.region==='workshop'?'KELAS IX':travel.region==='garden'?'KELAS IX / VII':'KELAS VII'}</small></div>`;
  document.querySelector('.world-note > span:last-child')!.textContent=r.name.toUpperCase();
  $('mini-map').setAttribute('aria-label',`Buka peta ${r.name}`);
  $('mini-map').innerHTML=`${regionMapSvg()}<span>${icon('map')} Peta wilayah <kbd>M</kbd></span>`;
  $('world').setAttribute('aria-label',`Dunia 3D ${r.name}. Gunakan WASD atau kontrol sentuh untuk berjalan.`);
}
function refreshWorld() {world?.setEnergy(energy);world?.setElectromagnet(electromagnet);world?.setWorkshop(workshop);world?.setIrrigation(irrigation);world?.setTrial(progress.trial===35);world?.setGarden(garden);world?.setRimba(rimba);}
async function changeRegion(target: RegionId) {
  if(!world||travelling||world.region===target) return;
  energyUI.pause();if(energy.supplyOn){energy=settleEnergy(energy);persist();}electromagnetUI.pause();if(world.region==='workshop')dispatchElectromagnet({type:'recover'},undefined,true);buoyancyUI.cancel();irrigationUI.cancel();riverUI.cancel();if(world.region==='rimba')rimbaSession.settle('leave');
  travelling=true; clearInput();closePanel();world.paused=true;
  $('travel-transition').textContent=`Menuju ${regions[target].name}…`;$('travel-transition').hidden=false;
  if(!world.reducedMotion) await new Promise(resolve=>setTimeout(resolve,300));
  try {
    world.setRegion(target,true);travel.region=target;travel.activeMission=target==='workshop'?'M17-E1':target==='garden'?'M14':target==='rimba'?'W03-LOG01':target==='river'?'S13':'M01';
    refreshWorld();updateRegionUI();updateMission();persist();
  } finally {$('travel-transition').hidden=true;travelling=false;world.paused=!started;}
}
function dispatchGarden(event: GardenEvent, place?: PlaceId) {
  if(place) {
    const target=world?.places.find(p=>p.id===place);
    if(!world||world.region!=='garden'||!target||Math.hypot(world.position.x-target.x,world.position.z-target.z)>2.65) {toast('Dekati objek di kebun terlebih dahulu.');return false;}
  }
  const result=gardenTransition(garden,event), changed=result.progress!==garden;
  garden=result.progress;if(changed)persist();refreshWorld();updateMission();toast(result.message);return result.ok;
}
const gardenUI=createGardenUI({get:()=>garden,open:openPanel,close:closePanel,send:dispatchGarden,navigate,pose:pose=>world?.setInteractionPose(pose),water:group=>world?.waterGarden(group)});
function dispatchRimba(event:RimbaEvent,place?:PlaceId,quiet=false) {
  if(place) {
    const target=world?.places.find(p=>p.id===place);
    if(!world||world.region!=='rimba'||!target||Math.hypot(world.position.x-target.x,world.position.z-target.z)>world.interactionRadius+.05){toast('Dekati objek di Pos Rimba terlebih dahulu.');return false;}
    if(event.type==='transfer'&&event.tool==='cart'&&!world.pushing){toast('Dorong gerobak berisi menuju objek dahulu.');return false;}
  }
  const result=rimbaTransition(rimba,event);
  if(result.progress!==rimba){rimba=result.progress;persist();world?.setRimba(rimba);if(event.type!=='travel')updateMission();}
  if(!quiet&&result.message)toast(result.message);return result.ok;
}
const rimbaSession=new RimbaSession(()=>rimba,e=>{dispatchRimba(e,undefined,true);});
const rimbaUI=createRimbaUI({get:()=>rimba,open:openPanel,close:closePanel,send:dispatchRimba,navigate,pushing:()=>world?.pushing??false,
  push:()=>{
    if(!world?.canPushCart()){toast('Dekati gerobak dari jalur lapang di depan bengkel.');return;}
    rimbaSession.flush();if(dispatchRimba({type:'select',tool:'cart'},'workshop')){world.setPushing(true);closePanel();toast('Gerobak terhubung. Berjalan atau pilih tujuan; Parkir tersedia di bengkel.');}
  },
  park:()=>{if(dispatchRimba({type:'settle',reason:'park'},'workshop')){world?.setPushing(false);closePanel();}},
});
function dispatchRiver(event:RiverEvent,place?:PlaceId) {
  if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='river'||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Dekati objek di tepian dahulu.');return false;}}
  const result=riverTransition(river,event);if(result.progress!==river){river=result.progress;persist();updateMission();}if(result.message)toast(result.message);return result.ok;
}
const riverUI=createRiverUI({get:()=>river,open:openPanel,close:closePanel,send:dispatchRiver,navigate,
  approach:(site,arrive)=>{clearInput();if(!world?.goTo(fishingPositions[site],arrive))toast('Pilih jalur tepian yang aman menuju titik pancing.');},
  lock:session=>{clearInput();world?.beginFishing(session,nextFish(river,session.site));},
  unlock:()=>{clearInput();world?.endFishing();if(world)world.paused=panel.open||!started;},
});
function dispatchBuoyancy(e:BuoyancyEvent,place?:PlaceId,quiet=false){if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='river'||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Dekati objek kolam terlebih dahulu.');return false;}}const r=buoyancyTransition(buoyancy,e);if(r.progress!==buoyancy){buoyancy=r.progress;persist();updateMission();}if(!quiet)toast(r.message);return r.ok;}
const buoyancyUI=createBuoyancyUI({get:()=>buoyancy,send:dispatchBuoyancy,open:openPanel,close:closePanel,swimming:()=>world?.swimming??false,go:p=>world?.goTo(p),recover:()=>{buoyancyUI.cancel();riverUI.cancel();clearInput();world?.returnShore();toast('Kembali ke Tepian; bukti dan XP tetap ada.');},trial:t=>world?.setBuoyancyTrial(t),lock:()=>{clearInput();world?.endInteraction();if(world)world.paused=true;},unlock:()=>{clearInput();world?.endInteraction();if(world)world.paused=panel.open||!started;}});
function dispatchIrrigation(e:IrrigationEvent,place?:PlaceId,quiet=false){
 if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='river'||world.boat.aboard||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Turun dan dekati objek di darat terlebih dahulu.');return false;}}
 const r=irrigationTransition(irrigation,e);if(r.progress!==irrigation){irrigation=r.progress;persist();world?.setIrrigation(irrigation);updateMission();}if(!quiet&&r.message)toast(r.message);return r.ok;
}
const irrigationUI=createIrrigationUI({get:()=>irrigation,send:dispatchIrrigation,open:openPanel,close:closePanel,navigate,
 boat:()=>({aboard:world?.boat.aboard??false,dock:world?.boat.dock??null,enabled:world?.boat.enabled??false,near:world?nearbyDock(world.position):null}),
 board:()=>{buoyancyUI.cancel();irrigationUI.cancel();riverUI.cancel();clearInput();return world?.boardBoat()??false;},
 start:()=>{const selected=world?.mode!=='laptop'&&world?.running;clearInput();world?.startBoat();if(world)world.running=!!selected;},stop:()=>clearInput(),
 moor:()=>{clearInput();const d=world?.moorBoat();toast(d?'Perahu tersandar. Pilih Turun.':'Dekati tanda sandar atau pilih dermaga di Peta.');return!!d;},
 exit:()=>{clearInput();const ok=world?.exitBoat()??false;if(!ok)toast('Sandar di tanda yang sah; titik turun harus bebas penghalang.');return ok;},
 recover:()=>{buoyancyUI.cancel();irrigationUI.cancel();riverUI.cancel();clearInput();world?.recoverBoat();toast('Kembali ke Dermaga Riset; bukti tetap tersimpan.');},
 sail:d=>{closePanel();world?.sailTo(d);},sample:s=>world?.setFlowSampling(s),
 lock:()=>{clearInput();world?.endInteraction();world?.setInteractionPose('measure');if(world)world.paused=true;},unlock:()=>{clearInput();world?.endInteraction();if(world)world.paused=panel.open||!started;},
});
function dispatchWorkshop(e:WorkshopEvent,place?:PlaceId){
 if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='workshop'||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Dekati objek di Bengkel terlebih dahulu.');return false;}}
 const r=workshopTransition(workshop,e);if(r.progress!==workshop){workshop=r.progress;persist();world?.setWorkshop(workshop);updateMission();}toast(r.message);return r.ok;
}
const workshopUI=createWorkshopUI({get:()=>workshop,send:dispatchWorkshop,open:openPanel,pose:p=>world?.setInteractionPose(p),chapter:chapterLabel});
function dispatchElectromagnet(e:MagnetEvent,place?:PlaceId,quiet=false){
 if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='workshop'||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Dekati stasiun elektromagnet dahulu.');return false;}}
 const r=electromagnetTransition(electromagnet,e);if(r.progress!==electromagnet){electromagnet=r.progress;persist();world?.setElectromagnet(electromagnet);updateMission();}if(!quiet)toast(r.message);return r.ok;
}
const electromagnetUI=createElectromagnetUI({get:()=>electromagnet,send:dispatchElectromagnet,open:(title,html)=>openPanel(title,html,'W06 · M17-E2'),replace:(title,html)=>{$('panel-title').textContent=title;$('panel-content').innerHTML=html;},pose:p=>world?.setInteractionPose(p),isOpen:()=>panel.open,fraction:f=>{if(world)world.electromagnetFraction=f;},camera:active=>{if(world)world.electromagnetCamera=active;},chapter:chapterLabel});
function dispatchEnergy(e:EnergyEvent,place?:PlaceId){
 if(place){const p=world?.places.find(p=>p.id===place);if(!world||world.region!=='workshop'||!p||Math.hypot(world.position.x-p.x,world.position.z-p.z)>world.interactionRadius+.05){toast('Dekati stasiun energi dahulu.');return false;}}
 const r=energyTransition(energy,e);if(r.progress!==energy){energy=r.progress;persist();world?.setEnergy(energy);updateMission();}toast(r.message);return r.ok;
}
const energyUI=createEnergyUI({get:()=>energy,send:dispatchEnergy,open:(title,html)=>openPanel(title,html,'W06 · M17-E3'),replace:(title,html)=>{$('panel-title').textContent=title;$('panel-content').innerHTML=html;},isOpen:()=>panel.open,pose:p=>world?.setInteractionPose(p),fraction:f=>{if(world)world.energyFraction=f;},camera:k=>{if(world)world.energyFocus=k;},chapter:chapterLabel});
function settings() {
  world?.endInteraction();
  openPanel('Atur petualanganmu', `<div class="form-grid"><label>Kontrol<select id="settings-mode"><option value="laptop">Laptop · WASD / panah + mouse</option><option value="hp">HP · analog + seret kamera</option><option value="ifp">IFP · satu sentuhan, tombol besar</option></select></label><label>Jarak kamera<select id="camera-distance"><option value="near">Dekat · detail karakter</option><option value="normal">Normal · menjelajah</option><option value="far">Jauh · gambaran wilayah</option></select></label><label class="check-label"><input id="reduced-motion" type="checkbox" ${world?.reducedMotion ? 'checked' : ''}> Kurangi gerakan kamera & animasi</label><label class="check-label"><input id="low-quality" type="checkbox" ${preferences.lowQuality ? 'checked' : ''}> Resolusi rendah untuk perangkat ringan</label></div><div class="controls-reference"><h3>Petunjuk kontrol</h3><p>WASD bergerak · Shift berlari (tahan kiri atau kanan) · Panah: bergerak · E: interaksi · J: jurnal · I: tas · M: peta · R: pulihkan kamera · Esc: jeda/tutup.</p><p>HP: pilih Jalan/Lari, lalu gunakan analog kiri dan seret kamera di kanan bersamaan. IFP: pilih Jalan/Lari, lalu ketuk tujuan atau pilih lokasi di Peta. Ketuk Berhenti untuk membatalkan perjalanan. Kolam: masuk/keluar melalui ramp; WASD/analog atau tujuan sentuh untuk berenang. Kembali ke Tepian tersedia. Perahu W04: Naik di dermaga, Mulai bergerak, WASD/analog atau tujuan air/Peta; Shift atau Pelan/Jelajah; Berhenti, Sandar, lalu Turun. Kembali ke dermaga memulihkan posisi tanpa menghapus bukti. W04: pilih Mulai memancing, tunggu indikator Tarik, amati ciri, lalu Catat dan lepaskan. Tombol dapat dipakai dengan Tab dan Enter; tidak ada batas waktu reaksi. Membuka menu membatalkan proses yang belum disahkan. W06 M17-E2: terminal atau daftar pasangan untuk merakit; tujuan derek tetap, Turunkan, Magnet ON/OFF, Angkat, Berhenti, dan Pulihkan Derek. Di Pos Rimba, pilih Dorong di Bengkel; Parkir tersedia di bengkel dan melalui Tas.</p></div><div class="settings-actions"><a class="secondary" href="/character.html" id="character-gallery-link">Galeri karakter · tiga sisi</a><button class="secondary" id="home">Kembali ke Pos</button><button class="secondary" id="fullscreen-button">Layar penuh</button><button class="secondary" id="export">Ekspor cadangan</button><button class="secondary" id="import">Impor cadangan</button><input type="file" id="import-file" accept="application/json,.json" hidden><button class="danger" id="reset-progress">Ulangi penyelidikan M01</button><button class="danger" id="reset-garden">Ulangi Percobaan M14</button><button class="danger" id="reset-rimba">Ulangi Latihan Pos Rimba</button><button class="danger" id="reset-river">Ulangi pengamatan S13</button><button class="danger" id="reset-buoyancy">Ulangi S14</button><button class="danger" id="reset-irrigation">Ulangi penyelidikan S15</button><button class="danger" id="reset-workshop">Ulangi episode M17-E1</button><button class="danger" id="reset-energy">Ulangi episode M17-E3</button><button class="danger" id="reset-electromagnet">Ulangi episode M17-E2</button></div><p id="settings-feedback" class="feedback" role="status"></p><p class="model-note">Progres tersimpan di IndexedDB pada alamat browser ini. Cadangkan sebelum membersihkan data atau berpindah alamat LAN. Posisi kembali ke pos saat dimuat ulang. Prototipe belum memiliki audio, multiplayer, atau pengiriman nilai.</p>`, 'AKSESIBILITAS & PENYIMPANAN LOKAL');
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
  $('home').onclick = () => { energy=settleEnergy(energy);persist();world?.setEnergy(energy); if(world?.region==='workshop')dispatchElectromagnet({type:'recover'},undefined,true); if(world?.region==='rimba')rimbaSession.settle('home'); world?.resetPosition(); closePanel(); toast('Kembali ke Pos. Seluruh bukti misi tetap tersimpan.'); };
  $('fullscreen-button').onclick = fullscreen;
  $('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(makeBackup({M01:progress,M14:garden,Rimba:rimba,S13:river,S14:buoyancy,S15:irrigation,M17E1:workshop,M17E2:electromagnet,M17E3:energy,world:travel}), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'jelajah-sains-cadangan-v9.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('settings-feedback').textContent = 'Cadangan dibuat. Simpan berkas di tempat yang aman.';
  };
  $('import').onclick = () => $<HTMLInputElement>('import-file').click();
  $('import-file').onchange = async e => {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error('Cadangan terlalu besar (maksimum 1 MB).');
      const imported = importBackup(JSON.parse(await file.text()),{M01:progress,M14:garden,Rimba:rimba,S13:river,S14:buoyancy,S15:irrigation,M17E1:workshop,M17E2:electromagnet,M17E3:energy,world:travel});
      // Import is explicit replacement; parsing must finish before changing live state.
      progress=imported.game.M01;garden=imported.game.M14;travel=imported.game.world;rimba=imported.game.Rimba;river=imported.game.S13;buoyancy=imported.game.S14;if(world?.swimming)world.returnShore();irrigation=imported.game.S15;workshop=imported.game.M17E1;electromagnet=settleElectromagnet(imported.game.M17E2);energy=settleEnergy(imported.game.M17E3);world?.recoverBoat(); rimbaSession.settle('reload');storageBlocked=false;
      world?.setRimba(rimba);world?.setRegion(travel.region);refreshWorld();updateRegionUI();persist();updateMission();
      $('settings-feedback').textContent = (imported.scope==='M01'?'Cadangan valid dimuat: hanya M01 versi 1. M14, Pos Rimba, dan wilayah saat ini tetap dipertahankan. S13 juga tetap tersimpan.':imported.scope==='both'?'Cadangan valid dimuat: M01 dan M14 versi 2. Pos Rimba tetap dipertahankan. S13 juga tetap tersimpan.':imported.scope==='three'?'Cadangan valid dimuat: M01, M14, Pos Rimba, dan wilayah versi 3 dipulihkan. S13 tetap tersimpan.':imported.scope==='four'?'Cadangan valid dimuat: M01, M14, Pos Rimba, S13, dan wilayah versi 4 dipulihkan.':imported.scope==='five'?'Cadangan valid dimuat: M01, M14, Pos Rimba, S13, S14, dan wilayah versi 5 dipulihkan.':imported.scope==='six'?'Cadangan valid dimuat: enam misi lama versi 6; M17-E1 tetap dipertahankan.':imported.scope==='seven'?'Cadangan valid dimuat: tujuh misi/episode versi 7; M17-E2 tetap dipertahankan.':imported.scope==='eight'?'Cadangan valid dimuat: delapan misi versi 8; M17-E3 tetap dipertahankan.':'Cadangan valid dimuat: M01, M14, Pos Rimba, S13, S14, S15, M17-E1, M17-E2, M17-E3, dan wilayah dipulihkan. Hadiah pertama tidak digandakan.')+(imported.scope!=='all'?' M17-E1, M17-E2, M17-E3, dan misi lain yang tidak tercakup tetap dipertahankan.':'');
    } catch (error) { $('settings-feedback').textContent = error instanceof Error ? error.message : 'Cadangan tidak dapat dibaca.'; }
    (e.target as HTMLInputElement).value = '';
  };
  $('character-gallery-link').onclick=async e=>{e.preventDefault();await saveChain;location.assign('/character.html'+location.search);};
  $('reset-energy').onclick=()=>{openPanel('Ulangi episode M17-E3?', '<p>Hanya M17-E3 diulang. Hadiah pertama dan episode lain tetap ada; status bab dihitung kembali.</p><button class="danger" id="confirm-energy-reset">Ya, ulangi M17-E3</button>');$('confirm-energy-reset').onclick=()=>{dispatchEnergy({type:'reset'});closePanel();};};
  $('reset-electromagnet').onclick=()=>{openPanel('Ulangi episode M17-E2?', '<p>Hanya episode elektromagnet diulang. Bukti hadiah pertama dan semua misi lain tetap ada.</p><button class="danger" id="confirm-electromagnet-reset">Ya, ulangi M17-E2</button>');$('confirm-electromagnet-reset').onclick=()=>{dispatchElectromagnet({type:'reset'});closePanel();};};
  $('reset-workshop').onclick=()=>{openPanel('Ulangi episode M17-E1?', '<p>Hanya episode rangkaian diulang. Misi lain dan hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-workshop-reset">Ya, ulangi M17-E1</button>');$('confirm-workshop-reset').onclick=()=>{dispatchWorkshop({type:'reset'});if(world?.region==='workshop')world.resetPosition();closePanel();};};
  $('reset-buoyancy').onclick=()=>{openPanel('Ulangi S14?', '<p>Hanya S14 diulang; misi lain dan hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-buoyancy-reset">Ya, ulangi S14</button>');$('confirm-buoyancy-reset').onclick=()=>{dispatchBuoyancy({type:'reset'});if(world?.swimming)world.returnShore();closePanel();};};
  $('reset-irrigation').onclick=()=>{openPanel('Ulangi penyelidikan S15?', '<p>Hanya S15 diulang. Misi lain dan hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-irrigation-reset">Ya, ulangi S15</button>');$('confirm-irrigation-reset').onclick=()=>{dispatchIrrigation({type:'reset'});world?.recoverBoat();if(world?.region==='river')world.resetPosition();closePanel();};};
  $('reset-river').onclick=()=>{openPanel('Ulangi pengamatan S13?', '<p>Hanya S13 diulang. M01, M14, Pos Rimba, dan riwayat hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-river-reset">Ya, ulangi S13</button>');$('confirm-river-reset').onclick=()=>{dispatchRiver({type:'reset'});if(world?.region==='river')world.resetPosition();closePanel();};};
  $('reset-rimba').onclick=()=>{openPanel('Ulangi Latihan Pos Rimba?', '<p>Hanya latihan W03-LOG01 yang diulang. M01, M14, dan riwayat hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-rimba-reset">Ya, ulangi Latihan Pos Rimba</button>');$('confirm-rimba-reset').onclick=()=>{rimbaSession.settle('home');dispatchRimba({type:'reset'});if(world?.region==='rimba')world.resetPosition();closePanel();};};
  $('reset-garden').onclick=()=>{
    openPanel('Ulangi Percobaan M14?', '<p>Hari, rencana, petak, air, data, dan kesimpulan M14 akan dimulai ulang. M01 dan catatan hadiah pertama tetap tersimpan.</p><button class="danger" id="confirm-garden-reset">Ya, ulangi percobaan M14</button>');
    $('confirm-garden-reset').onclick=()=>{dispatchGarden({type:'reset'});closePanel();};
  };
  $('reset-progress').onclick = () => {
    openPanel('Ulangi penyelidikan?', '<p>Bukti, jurnal, dan hasil M01 lokal akan dihapus dan digantikan penyelidikan baru. Ekspor cadangan melalui Pengaturan jika ingin menyimpan hasil lama.</p><button class="danger" id="confirm-reset">Ya, mulai ulang M01</button><button class="secondary" id="cancel-reset">Batal</button>');
    $('cancel-reset').onclick = settings;
    $('confirm-reset').onclick = () => { progress = initialProgress(); storageBlocked = false; persist(); world?.setTrial(false); world?.resetPosition(); updateMission(); closePanel(); toast('Penyelidikan baru dimulai. Temui Bu Nara.'); };
  };
}
function setMode(mode: InputMode) {
  buoyancyUI.cancel();irrigationUI.cancel();riverUI.cancel();clearInput(); modeSelect.value = mode; document.body.dataset.mode = mode;
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
  toast(progress.accepted || garden.accepted ? 'Selamat kembali! Buka Jurnal untuk melihat bukti yang tersimpan.' : 'Selamat datang! Temui Bu Nara atau pilih langkah pertama pada kartu misi.');
};
$('close-panel').onclick = closePanel;
panel.addEventListener('close', () => { if (world) { world.paused = !started || panel.open; if (!panel.open) world.endInteraction(); } });
panel.addEventListener('click', e => {
  const r = panel.getBoundingClientRect();
  if (e.target === panel && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) closePanel();
});
$('settings').onclick = settings;
$('active-mission').onchange=e=>{energyUI.pause();electromagnetUI.pause();travel.activeMission=(e.target as HTMLSelectElement).value as MissionId;updateMission();persist();};
$('journal').onclick = journal; $('inventory').onclick = inventory;
$('map').onclick = map; $('mini-map').onclick = map;
$('run-toggle').onclick = () => { if (world && !world.paused) world.running = !world.running; };
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
    const saved = await loadGame();
    progress=saved.M01;garden=saved.M14;travel=saved.world;rimba=saved.Rimba;river=saved.S13;buoyancy=saved.S14;irrigation=saved.S15;workshop=saved.M17E1;electromagnet=settleElectromagnet(saved.M17E2);energy=settleEnergy(saved.M17E3);if(energy!==saved.M17E3||electromagnet!==saved.M17E2)persist();
    const resumed=rimbaTransition(rimba,{type:'settle',reason:'reload'});rimba=resumed.progress;if(resumed.ok)persist();
    if (progress.accepted || garden.accepted || rimba.accepted || river.accepted || buoyancy.accepted || irrigation.accepted || workshop.accepted || electromagnet.accepted || energy.accepted || travel.region!=='town') { $('start').firstChild!.textContent = 'Lanjutkan petualangan '; saveLabel('● Progres sebelumnya dimuat'); }
  } catch {
    storageBlocked = true;
    toast('Progres lokal tidak dapat dibaca. Gunakan cadangan atau mulai ulang lewat Pengaturan. Data lama tidak ditimpa otomatis.');
    saveLabel('⚠ Progres lokal tidak tersedia', true);
  }
  updateMission();
  try {
    world = new World($<HTMLCanvasElement>('world'));world.onEnergyFrame=(dt,active)=>energyUI.frame(dt,active);world.onElectromagnetFrame=(dt,active)=>electromagnetUI.frame(dt,active);world.onRiverFrame=(dt,active)=>riverUI.frame(dt,active);world.onBuoyancyFrame=(dt,active)=>buoyancyUI.frame(dt,active);world.onSwimPractice=()=>{if(buoyancy.accepted&&!buoyancy.practice)dispatchBuoyancy({type:'practice'},undefined,true);};world.onIrrigationFrame=(dt,active)=>irrigationUI.frame(dt,active);world.onBoatTutorial=(stage,distanceMm)=>{if(irrigation.accepted)dispatchIrrigation({type:'tutorial',stage,distanceMm},undefined,true);}; world.setRimba(rimba);world.onRimbaMotion=(d,t,p)=>rimbaSession.motion(d,t,p);world.setRegion(travel.region);refreshWorld();updateRegionUI();
    world.cameraDistance = preferences.cameraDistance; world.reducedMotion = preferences.reducedMotion;
    world.renderer.setPixelRatio(preferences.lowQuality ? 1 : Math.min(devicePixelRatio, 1.5));
    world.onRunModeChange = running => {
      if(world?.boat.aboard){$('run-toggle').setAttribute('aria-pressed',String(running));$('run-toggle').setAttribute('aria-label',`Mode ${running?'Jelajah':'Pelan'}; ketuk untuk ${running?'Pelan':'Jelajah'}`);$('run-toggle').innerHTML=`<span>${running?'Jelajah':'Pelan'}</span><small>Ketuk untuk ${running?'Pelan':'Jelajah'}</small>`;return;}
      $('run-toggle').setAttribute('aria-pressed', String(running));
      $('run-toggle').setAttribute('aria-label', `Mode ${running ? 'Lari' : 'Jalan'}; ketuk untuk ${running ? 'Jalan' : 'Lari'}`);
      $('run-toggle').innerHTML = `<span>${running ? 'Lari' : 'Jalan'}</span><small>Ketuk untuk ${running ? 'Jalan' : 'Lari'}</small>`;
    };
    world.onUpdate = near => {
      const place = world!.places.find(p => p.id === near);
      $('near-name').textContent = place?.name ?? 'Dekati warga atau penanda';
      $('interact').querySelector('span')!.textContent = place?.action ?? 'Jelajahi';
      $<HTMLButtonElement>('interact').disabled = !place;
    };
    clearInput = bindInput(world, $('joystick'), interaction, key => {
      if (key === 'escape') { if(buoyancyUI.trial.phase!=='idle'){buoyancyUI.cancel();return;} if(irrigationUI.sampling.phase!=='idle'){irrigationUI.cancel();return;} if(riverUI.session.active){riverUI.cancel();return;} if (panel.open) closePanel(); else if (started) settings(); return; }
      if (!started || panel.open) return;
      if (key === 'j') journal(); if (key === 'i') inventory(); if (key === 'm') map(); if (key === 'r') world?.resetCamera();
    }, (x, y) => {
      const hit = world!.pick(x, y);
      if (hit.place) {
        const p = world!.places.find(p => p.id === hit.place)!;
        if (Math.hypot(world!.position.x - p.x, world!.position.z - p.z) < world!.interactionRadius) interactAt(hit.place);
        else navigate(hit.place);
      } else if (hit.point && !world!.goTo(hit.point)) toast('Tujuan tidak dapat dicapai. Pilih jalur tanah lain.');
    });
    $<HTMLButtonElement>('start').disabled = false;
  } catch {
    $<HTMLButtonElement>('start').disabled = true;
    document.querySelector<HTMLElement>('.welcome')!.innerHTML = `<div class="welcome-card fallback"><div class="eyebrow">MODE MATERI 2D</div><h1>WebGL 2 belum tersedia.</h1><p>Petualangan 3D memerlukan browser dengan WebGL 2 dan akselerasi grafis. Aktifkan akselerasi grafis atau coba perangkat lain, kemudian muat ulang.</p><h3>${cards.book.title}</h3><p>${cards.book.text}</p><h3>${cards.rain.title}</h3><p>${cards.rain.text}</p>${[...Object.values(energyCards),...Object.values(magnetCards)].map(c=>`<h3>${c.title}</h3><p>${c.text}</p>`).join('')}<p>${magnetNote}</p><p class="callout">Materi 2D dapat dibaca. Gerak dan penyelidikan 3D belum dapat dijalankan di perangkat ini.</p><button class="primary" id="retry-webgl">Coba lagi</button></div>`;
    $('retry-webgl').onclick = () => location.reload();
  }
}
addEventListener('pagehide',()=>rimbaSession.flush());
addEventListener('blur',()=>{energyUI.suspend(true);electromagnetUI.suspend(true);rimbaSession.flush();riverUI.suspend(true);buoyancyUI.suspend(true);irrigationUI.suspend(true);});
addEventListener('focus',()=>{energyUI.suspend(false);electromagnetUI.suspend(false);riverUI.suspend(false);buoyancyUI.suspend(false);irrigationUI.suspend(false);});
document.addEventListener('visibilitychange',()=>{energyUI.suspend(document.hidden);if(document.hidden)electromagnetUI.suspend(true);else electromagnetUI.suspend(false);if(document.hidden)rimbaSession.flush();});
// Wait for IndexedDB before enabling the start button so resume cannot race a new mission.
$<HTMLButtonElement>('start').disabled = true;
void initialize();
