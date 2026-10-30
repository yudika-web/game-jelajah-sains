import {shopItems,shopCategories,shopCategoryNames,type ShopCategory} from '../data/paidCosmetics';
import {cosmetic,type CosmeticItem,type CosmeticSlot} from '../data/appearanceCatalog';
import {chooseCosmetic,type Appearance} from './appearance';
import type {Economy} from './coinEconomy';
interface Context {get():Appearance;wallet():Economy|null;allowed():boolean;lock():void;unlock():void;preview(a:Appearance,stage:HTMLElement):void;rotate(angle:number):void;end():void;buy(id:string,version:number):Promise<void>;apply(a:Appearance):Promise<void>;}
/** One studio shared with the wardrobe and the world renderer. No card owns a WebGL context. */
export function createCosmeticShopUI(ctx:Context){
 const dialog=document.createElement('dialog');dialog.id='cosmetic-shop';dialog.className='wardrobe-dialog shop-dialog';dialog.setAttribute('aria-labelledby','shop-title');document.body.append(dialog);
 let category:ShopCategory='outfits',selected:CosmeticItem,trial:Appearance,angle=0,busy=false;
 const q=<T extends HTMLElement=HTMLElement>(id:string)=>dialog.querySelector<T>(`#${id}`)!;
 const owned=()=>ctx.wallet()?.owned??[];
 function message(text:string){q('shop-status').textContent=text;}
 function preview(){ctx.preview(trial,q('shop-stage'));ctx.rotate(angle);}
 function refresh(){
  const wallet=ctx.wallet(),has=owned().includes(selected.id),worn=ctx.get()[selected.category]===selected.id;
  q('shop-balance').textContent=`◉ ${wallet?.balance??0} koin`;
  q('shop-selected').textContent=selected.name;
  q('shop-price').textContent=`${selected.price} koin · ${worn?'Dipakai':has?'Dimiliki':'Belum dimiliki'}`;
  q<HTMLButtonElement>('shop-buy').disabled=busy||has;q<HTMLButtonElement>('shop-wear').disabled=busy||!has||worn;
  q<HTMLButtonElement>('shop-remove').disabled=busy||!['headwear','facewear','backpack'].includes(selected.category);
  q('shop-items').innerHTML=shopItems(category).map(i=>`<button type="button" data-item="${i.id}" aria-pressed="${selected.id===i.id}"><strong>${i.name}</strong><span>${i.price} koin · ${ctx.get()[i.category]===i.id?'Dipakai':owned().includes(i.id)?'Dimiliki':'Belum dimiliki'}</span></button>`).join('');
  q('shop-items').querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b=>b.onclick=()=>{if(busy)return;selected=cosmetic(b.dataset.item!)!;q('shop-confirm').hidden=true;refresh();message('Tekan Coba untuk melihat barang. Pembelian tidak langsung mengganti penampilan.');});
 }
 function close(){if(!dialog.open||busy)return;ctx.end();dialog.close();document.body.classList.remove('wardrobe-open');ctx.unlock();}
 async function operation(action:()=>Promise<void>,success:string){
  if(busy)return;busy=true;dialog.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);message('Menyimpan transaksi…');
  try{await action();message(success);}catch(e){message(e instanceof Error?e.message:'Belum tersimpan. Tidak ada pembelian sebagian.');}
  finally{busy=false;dialog.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);q('shop-confirm').hidden=true;refresh();}
 }
 function open(){
  if(dialog.open||!ctx.allowed())return;ctx.lock();trial={...ctx.get()};category='outfits';selected=shopItems(category)[0];angle=0;
  dialog.innerHTML=`<header class="wardrobe-header"><div><small>KAK MIRA · BUTIK KOTA</small><h2 id="shop-title">Gaya Penjelajah</h2></div><strong id="shop-balance"></strong><button id="shop-close" type="button" aria-label="Kembali dari toko">✕</button></header><div class="wardrobe-layout"><section class="wardrobe-preview" aria-label="Preview karakter permainan"><div id="shop-stage" role="img" aria-label="Model 3D karakter dengan barang pilihan"></div><div class="wardrobe-views"><button data-view="0">Depan</button><button data-view="-1.5707963267948966">Samping</button><button data-view="3.141592653589793">Belakang</button><button id="shop-left" aria-label="Putar kiri">↶</button><button id="shop-right" aria-label="Putar kanan">↷</button></div></section><section class="wardrobe-options shop-options"><div class="shop-categories" role="group" aria-label="Kategori barang">${shopCategories.map(c=>`<button data-category="${c}" aria-pressed="${c===category}">${shopCategoryNames[c]}</button>`).join('')}</div><div id="shop-items" aria-label="Katalog barang"></div><h3 id="shop-selected"></h3><p id="shop-price"></p><p class="model-note">Coba gratis. Barang hanya mengubah tampilan. Pakai menerapkan satu barang yang dimiliki; percobaan slot lain dibatalkan.</p><div id="shop-confirm" hidden><p id="shop-confirm-text"></p><button id="shop-confirm-buy" class="primary">Ya, beli</button><button id="shop-cancel-buy">Batal beli</button></div></section></div><footer class="wardrobe-footer"><p id="shop-status" role="status"></p><div><button id="shop-try">Coba</button><button id="shop-buy" class="primary">Beli</button><button id="shop-wear">Pakai</button><button id="shop-remove">Lepas</button><button id="shop-cancel">Batal / Kembali</button></div></footer>`;
  dialog.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.onclick=()=>{if(busy)return;category=b.dataset.category as ShopCategory;selected=shopItems(category)[0];q('shop-confirm').hidden=true;dialog.querySelectorAll('[data-category]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));refresh();});
  dialog.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b=>b.onclick=()=>{angle=Number(b.dataset.view);ctx.rotate(angle);});q('shop-left').onclick=()=>ctx.rotate(angle+=Math.PI/4);q('shop-right').onclick=()=>ctx.rotate(angle-=Math.PI/4);
  q('shop-try').onclick=()=>{if(busy)return;trial=chooseCosmetic(trial,selected.category,selected.id,'preview');preview();message(`${selected.name} dicoba gratis. Saldo dan penampilan pribadi belum berubah.`);};
  q('shop-buy').onclick=()=>{if(busy)return;const balance=ctx.wallet()?.balance??0,price=selected.price!;if(balance<price){q('shop-confirm').hidden=true;message(`Kurang ${price-balance} koin. Dapatkan koin dari penyelesaian misi; Coba tetap gratis.`);return;}q('shop-confirm-text').textContent=`Beli ${selected.name}: ${price} koin — sisa ${balance-price} koin. Tidak langsung dipakai.`;q('shop-confirm').hidden=false;q('shop-confirm-buy').focus();};
  q('shop-confirm-buy').onclick=()=>{const item=selected;void operation(()=>ctx.buy(item.id,item.priceVersion!),`${item.name} dimiliki. Pilih Pakai jika ingin mengenakannya.`);};
  q('shop-cancel-buy').onclick=()=>{q('shop-confirm').hidden=true;};
  q('shop-wear').onclick=()=>{const item=selected;if(!owned().includes(item.id))return;const next=chooseCosmetic(ctx.get(),item.category,item.id,owned());void operation(async()=>{await ctx.apply(next);trial={...ctx.get()};preview();},`${item.name} dipakai. Barang lain yang hanya dicoba tidak ikut diterapkan.`);};
  q('shop-remove').onclick=()=>{const slot=selected.category as CosmeticSlot,id=slot==='headwear'?'head-none':slot==='facewear'?'face-none':'back-none';if(!['headwear','facewear','backpack'].includes(slot))return;void operation(async()=>{await ctx.apply(chooseCosmetic(ctx.get(),slot,id,owned()));trial={...ctx.get()};preview();},'Aksesori dilepas. Kepemilikan tetap ada.');};
  q('shop-close').onclick=close;q('shop-cancel').onclick=close;document.body.classList.add('wardrobe-open');dialog.showModal();refresh();preview();message('Coba barang gratis. Koin hanya dipotong setelah konfirmasi pembelian tersimpan.');q('shop-try').focus();
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('keydown',e=>{if(!busy&&e.key.startsWith('Arrow')){const target=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-item],[data-category]');if(target){const selector=target.hasAttribute('data-item')?'[data-item]':'[data-category]',buttons=[...dialog.querySelectorAll<HTMLButtonElement>(selector)],delta=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='ArrowUp'?-2:2,next=buttons[(buttons.indexOf(target)+delta+buttons.length)%buttons.length];e.preventDefault();next.click();dialog.querySelector<HTMLButtonElement>(selector==='[data-item]'?`[data-item="${next.dataset.item}"]`:`[data-category="${next.dataset.category}"]`)?.focus();}}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
 return {open,cancel:close,isOpen:()=>dialog.open};
}
