import type {World} from '../engine/world';
import type {PlaceId} from '../data/content';
import {evaPoints,preparationPlaces,expeditionNotes as notes,type EvaPointId} from '../data/spaceExpedition';
import type {ExpeditionAction} from './spaceExpedition';
interface Context{world:()=>World|null;started:()=>boolean;blocked:()=>boolean;open:(title:string,html:string,kicker?:string)=>void;close:()=>void;clear:()=>void;town:()=>Promise<void>;toast:(text:string)=>void;}
const button=(id:string,text:string)=>`<button data-expedition="${id}">${text}</button>`;
/** A single HUD over the existing canvas. No renderer, timers or saved mission evidence. */
export function createSpaceExpeditionUI(c:Context){
 const hud=document.createElement('aside');hud.id='expedition-hud';hud.hidden=true;hud.setAttribute('aria-label','Kendali ekspedisi');document.body.append(hud);let key='',busy=false;
 const w=()=>c.world()!,state=()=>w().expedition;
 async function action(id:string,revision=state().revision){
  if(busy||revision!==state().revision)return;
  if(id==='town'){busy=true;c.clear();c.close();try{await c.town();}finally{busy=false;}return;}
  if(id==='stop'){c.clear();return;}
  if(id==='up'||id==='down'){state().eva.changeHeight(id==='up'?1:-1);return;}
  if(id.startsWith('go:')){go(id.slice(3) as EvaPointId);return;}
  if(id.startsWith('walk:')){const p=w().places.find(p=>p.id===id.slice(5));if(p){c.close();c.clear();w().goTo({x:p.x,z:p.z+w().approach(p.id)},()=>interact(p.id));}return;}
  if(id==='observe'){const near=state().eva.nearby();if(near)interact(near);return;}
  c.clear();c.close();const ok=w().expeditionAction(id as ExpeditionAction,revision);
  if(!ok){c.toast(state().message||'Tindakan belum tersedia pada keadaan ini.');return;}
  if(state().phase==='leaving'){busy=true;try{await c.town();}finally{busy=false;}}
  render();
 }
 function bind(root:HTMLElement){const revision=state().revision;root.querySelectorAll<HTMLButtonElement>('[data-expedition]').forEach(b=>{b.onclick=()=>void action(b.dataset.expedition!,revision);});}
 function go(id:EvaPointId){if(!state().outside)return;c.close();c.clear();if(!state().eva.navigate(id))c.toast('Rute belum dapat dilalui. Pilih titik lain atau Kembali ke Airlock.');}
 function interact(id:PlaceId){
  if(id in evaPoints){if(!state().outside||state().eva.nearby()!==id){c.toast('Dekati titik pengamatan terlebih dahulu.');return;}const p=evaPoints[id as EvaPointId];c.open(p.name,`<p>${p.text}</p><p class="model-note">Pengayaan eksplorasi · tanpa bukti misi atau hadiah baru.</p>${id==='evaAnchor'?button('enter-return','Masuk kembali ke Airlock'):''}`,'LUAR STASIUN · SIMULASI');bind(document.getElementById('panel-content')!);return;}
  const p=w().places.find(p=>p.id===id);if(!p||Math.hypot(w().position.x-p.x,w().position.z-p.z)>2.65)return;
  if(id==='spaceLocker')c.open('Perlengkapan astronot gratis',`<p>Pakaian, helm, sarung tangan, sepatu, ransel, penambat dan pendorong bantu dipinjamkan gratis. Penampilan pribadi tetap tersimpan.</p><p>${notes.microgravity}</p>${button(state().equipped?'remove':'equip',state().equipped?'Lepas perlengkapan':'Pakai perlengkapan astronot')}`,'LEMARI PERLENGKAPAN');
  else if(id==='spaceAirlock')c.open('Airlock · persiapan keluar',`<p>${notes.airlock}</p><p>Kenakan perlengkapan sebelum masuk. Pintu luar dan dalam saling terkunci.</p>${state().equipped?button('enter-airlock','Masuk airlock'):button('walk:spaceLocker','Menuju lemari perlengkapan')}`,'PROSEDUR PERMAINAN');
  else if(id==='shuttleDoor')c.open('Kendaraan ekspedisi',`<p>Masuk melalui pintu, duduk, lalu pilih Mulai Perjalanan. ${notes.trip}</p>${button('board','Naik kendaraan')}`,'AREA PERSIAPAN');
  else if(id==='prepBrief')c.open('Persiapan ekspedisi',`<p>${notes.trip}</p><p>Dekati pintu kendaraan. Sesudah docking, keluar ke stasiun untuk menjelajah dan menemui Bu Nara. Perlengkapan luar stasiun tersedia di lemari.</p>${button('walk:shuttleDoor','Menuju kendaraan')}`,'OBSERVATORIUM KOTA');
  else if(id==='prepExit')c.open('Batalkan persiapan?',`<p>Kembali ke Observatorium Kota. Seluruh bukti tetap tersimpan.</p>${button('town','Kembali ke Kota')}`);
  else return;
  bind(document.getElementById('panel-content')!);
 }
 function map(){if(state().outside){c.open('Peta luar stasiun',`<p>Tujuan bantu mengikuti rute tiga dimensi. Tiba di lokasi belum menghasilkan catatan misi.</p><div class="destination-list">${Object.entries(evaPoints).map(([id,p])=>button('go:'+id,p.name)).join('')}</div>`,'ZONA PENAMBAT');bind(document.getElementById('panel-content')!);return true;}if(state().phase==='preparation'){c.open('Peta area persiapan',`<div class="destination-list">${preparationPlaces.map(p=>button('walk:'+p.id,p.short)).join('')}</div>`);bind(document.getElementById('panel-content')!);return true;}if(!state().landControls){c.toast('Selesaikan langkah perjalanan atau airlock melalui kendali ekspedisi.');return true;}return false;}
 function render(){
  const world=c.world();hud.hidden=!world||world.region!=='space'||!c.started()||c.blocked()||state().phase==='interior';if(hud.hidden){key='';return;}
  const s=state(),p=s.phase,near=s.outside?s.eva.nearby():null;const next=`${p}:${s.revision}:${near}`;if(key!==next){key=next;let title='',info='',controls='';
   if(p==='preparation'){title='Persiapan ekspedisi';info='Berjalan ke pintu kendaraan, lalu masuk. Simulasi perjalanan pendidikan.';controls=button('walk:prepBrief','Baca persiapan')+button('walk:shuttleDoor','Menuju kendaraan')+button('town','Kembali ke Kota');}
   else if(p==='boarding'){title='Masuk kendaraan';info='Karakter menuju tempat duduk melalui pintu.';}
   else if(p==='seated'){title='Siap berangkat';info=notes.trip;controls=button('start','Mulai Perjalanan');}
   else if(s.flight){title=p==='departure'?'Keberangkatan':p==='transit'?'Perjalanan simulasi':'Docking';info='Transisi dipercepat. Menonton atau melewati menghasilkan posisi akhir yang sama.';controls=button('skip','Lewati Animasi');}
   else if(p==='docked'){title='Docking selesai';info=s.direction==='outbound'?'Selamat datang di stasiun observasi W08.':'Kendaraan tiba di Observatorium Kota.';controls=button('disembark',s.direction==='outbound'?'Keluar ke stasiun':'Keluar ke Kota');}
   else if(p==='outside'){title='Eksplorasi luar stasiun';info=notes.assist;controls=button('up','Naik 1 m')+button('down','Turun 1 m')+button('stop','Berhenti / stabilkan')+button('observe',near?`Amati ${evaPoints[near].name}`:'Dekati objek untuk mengamati')+`<details><summary>Tujuan bantu</summary><div class="eva-targets">${Object.entries(evaPoints).map(([id,v])=>button('go:'+id,v.name)).join('')}</div></details>`+button('recover','Kembali ke Airlock');}
   else{title='Airlock';info=notes.airlock;const steps:Record<string,[string,string]>={chamber:['close-inner','Tutup pintu dalam'],sealed:['check','Periksa perlengkapan'],checked:['cycle-out','Jalankan transisi keluar'],'outer-ready':['open-outer','Buka pintu luar'],'outer-open':['exit','Keluar stasiun'],'sealed-return':['cycle-in','Jalankan transisi masuk'],'inner-ready':['open-inner','Buka pintu dalam'],'inner-open':['leave-airlock','Masuk interior']};controls=steps[p]?button(...steps[p]):'<p>Transisi berlangsung…</p>';controls+=button('recover','Pulihkan ke Airlock');}
   hud.innerHTML=`<span class="eyebrow">W08 · EKSPEDISI</span><h2>${title}</h2><p>${info}</p>${s.chamber?`<p>Pintu dalam: ${s.innerOpen?'terbuka':'tertutup'} · Pintu luar: ${s.outerOpen?'terbuka':'tertutup'}</p>`:''}<output id="eva-readout"></output><div class="expedition-buttons">${controls}</div>`;bind(hud);
  }
  const readout=hud.querySelector('output')!;readout.textContent=s.outside?`Ketinggian ${s.eva.position.y.toFixed(1)} unit · Penambat ${s.eva.length.toFixed(1)} / 36 unit${s.eva.message?' · '+s.eva.message:''}`:'';
 }
 return{render,interact,map,go,action,special:(id:PlaceId)=>id==='spaceLocker'||id==='spaceAirlock'||id.startsWith('prep')||id==='shuttleDoor'||id in evaPoints};
}
