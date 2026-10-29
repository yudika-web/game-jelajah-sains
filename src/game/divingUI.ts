import type {World} from '../engine/world';
import type {PlaceId} from '../data/content';
import {divePoints,divePlaces,diveNote,diveConfig,type DivePointId} from '../data/diving';
import type {DiveAction} from '../engine/divingController';
interface Context{world:()=>World|null;started:()=>boolean;blocked:()=>boolean;open:(title:string,html:string,kicker?:string)=>void;close:()=>void;clear:()=>void;toast:(text:string)=>void;}
const button=(id:string,text:string)=>`<button data-dive="${id}">${text}</button>`;
export function createDivingUI(c:Context){
 const hud=document.createElement('aside');hud.id='diving-hud';hud.hidden=true;hud.setAttribute('aria-label','Kendali menyelam');document.body.append(hud);let key='';
 const world=()=>c.world()!,state=()=>world().dive;
 function pause(){if(c.world())c.world()!.diveFocus=null;document.getElementById('panel')?.classList.remove('dive-observation');}
 function action(id:string,revision=state().revision){if(revision!==state().revision)return;
  if(id==='up'||id==='down'){state().changeHeight(id==='up'?1:-1);return;}
  if(id==='stop'){c.clear();return;}
  if(id.startsWith('go:')){go(id.slice(3) as DivePointId|'entry');return;}
  if(id.startsWith('walk:')){const p=world().places.find(p=>p.id===id.slice(5));if(p){c.close();c.clear();world().goTo({x:p.x,z:p.z+world().approach(p.id)},()=>interact(p.id));}return;}
  if(id.startsWith('step:')){c.clear();const [x,z]=({left:[-1,0],right:[1,0],forward:[0,-1],back:[0,1]} as Record<string,number[]>)[id.slice(5)]??[0,0],s=state(),yaw=world().yaw;s.navigatePoint({x:s.position.x+x*Math.cos(yaw)+z*Math.sin(yaw),y:s.position.y,z:s.position.z-x*Math.sin(yaw)+z*Math.cos(yaw)});return;}
  if(id==='observe'){const p=state().nearby();if(p)interact(p);return;}
  c.clear();c.close();if(!world().diveAction(id as DiveAction,revision))c.toast(state().message||'Dekati alat atau tangga yang sesuai sebelum melakukan tindakan ini.');render();
 }
 function bind(root:HTMLElement){const rev=state().revision;root.querySelectorAll<HTMLButtonElement>('[data-dive]').forEach(b=>{b.onclick=()=>action(b.dataset.dive!,rev);});}
 function go(id:DivePointId|'entry'){if(!state().active)return;c.close();c.clear();if(!state().navigate(id))c.toast('Rute belum dapat dilalui. Pilih tujuan lain atau Kembali ke Dermaga.');}
 function interact(id:PlaceId){
  if(id in divePoints){const p=divePoints[id as DivePointId];if(!state().active||Math.hypot(state().position.x-p.position.x,state().position.y-p.position.y,state().position.z-p.position.z)>diveConfig.range){c.toast('Dekati objek dalam tiga dimensi terlebih dahulu.');return;}c.open(p.name,`<p>${p.text}</p><p class="model-note">Yang terlihat: objek model pada teluk. Penjelasan habitat berasal dari materi, bukan hasil pengukuran. Pengayaan ini tidak mencatat bukti atau hadiah misi.</p>`,'TELUK LATIHAN · AMATI TANPA MENYENTUH');world().diveFocus=id as DivePointId;world().followCamera.interactionFraming=true;document.getElementById('panel')!.classList.add('dive-observation');return;}
  const p=divePlaces.find(p=>p.id===id);if(!p||Math.hypot(world().position.x-p.x,world().position.z-p.z)>2.6)return;
  if(id==='divePrep')c.open('Persiapan teluk latihan',`<p>${diveNote}</p><p>Ambil dan pakai perlengkapan di lemari. Masuk lewat tangga dermaga. Renang di permukaan, lalu turunkan target kedalaman. Avatar utama yang sama digunakan.</p>${button('walk:diveLocker','Menuju perlengkapan')}`,'POS LATIHAN KAK LESTARI');
  if(id==='diveLocker')c.open('Perlengkapan selam gratis',`<p>Pakaian, masker, sirip, tabung dan ransel dipinjamkan untuk simulasi. Penampilan pribadi tetap tersimpan. Lepas perlengkapan sebelum mengoperasikan perahu atau ROV.</p>${button(state().equipped?'remove':'equip',state().equipped?'Lepas perlengkapan':'Ambil & pakai perlengkapan selam')}`,'LEMARI · TANPA KOIN');
  if(id==='diveDock')c.open('Tangga masuk teluk',`<p>${diveNote}</p>${state().equipped?button('enter','Masuk air melalui tangga'):button('walk:diveLocker','Ambil perlengkapan dahulu')}`,'DERMAGA LATIHAN');
  bind(document.getElementById('panel-content')!);
 }
 function map(){if(state().active){c.open('Peta teluk latihan',`<p>Pilih tujuan bantu 3D. Robot ROV dan jalur perahu berada di area lain. Kedatangan tidak menghasilkan bukti misi.</p><div class="destination-list">${Object.entries(divePoints).map(([id,p])=>button('go:'+id,`${p.name} · sekitar ${(diveConfig.surfaceY-p.approach.y).toFixed(1)} m`)).join('')}${button('go:entry','Tangga masuk · permukaan')}</div>`,'PASIR DAN LAMUN');bind(document.getElementById('panel-content')!);return true;}if(state().controlled){c.toast('Tunggu masuk/keluar air selesai.');return true;}return false;}
 function render(){const w=c.world();hud.hidden=!w||w.region!=='coast'||!c.started()||c.blocked()||!state().equipped;if(hud.hidden){key='';return;}const s=state(),near=s.active?s.nearby():null,next=`${s.phase}:${s.revision}:${near}`;if(next!==key){key=next;const controls=s.active?button('up','Naik 1 m')+button('down','Turun 1 m')+button('stop','Berhenti / melayang')+button('observe',near?`Amati ${divePoints[near].name}`:'Dekati objek untuk mengamati')+`<div class="dive-direction">${button('step:forward','Maju 1 m')}${button('step:back','Mundur 1 m')}${button('step:left','Kiri 1 m')}${button('step:right','Kanan 1 m')}</div><details><summary>Tujuan bantu</summary><div class="dive-targets">${Object.entries(divePoints).map(([id,p])=>button('go:'+id,p.name)).join('')}${button('go:entry','Ke tangga · permukaan')}</div></details>`+button('exit','Keluar melalui tangga'):s.phase==='ready'?button('walk:diveDock','Menuju tangga masuk')+button('walk:diveLocker','Lemari · lepas perlengkapan'):'<p>Masuk/keluar melalui tangga…</p>';hud.innerHTML=`<span class="eyebrow">W05 · TELUK LATIHAN</span><h2>${s.active?(s.phase==='surface'?'Renang permukaan':'Eksplorasi bawah air'):s.phase==='ready'?'Perlengkapan siap':'Tangga dermaga'}</h2><p>Bantuan kendali menstabilkan gerak saat input dilepas. Bukan panduan menyelam nyata.</p><output id="dive-depth"></output><div class="dive-buttons">${controls}${button('recover','Kembali ke Dermaga')}</div>`;bind(hud);}hud.querySelector('output')!.textContent=s.active?`Kedalaman pusat tubuh ${s.depth.toFixed(1)} / 6 m · perlengkapan gratis`:'';}
 return{action,go,interact,map,render,pause,suspend:(v:boolean)=>{if(c.world()){c.world()!.diveSuspended=v;c.clear();}},special:(id:PlaceId)=>divePlaces.some(p=>p.id===id)||id in divePoints};
}
