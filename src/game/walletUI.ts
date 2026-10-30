import {cosmetic} from '../data/appearanceCatalog';
import {coinRule,type Economy,type CoinReceipt} from './coinEconomy';
interface Context {open:(title:string,content:string,kicker?:string)=>void;started:()=>boolean;}
const number=(n:number)=>n.toLocaleString('id-ID');
export function createWalletUI(ctx:Context){
 const button=document.getElementById('coin-wallet') as HTMLButtonElement;
 const balance=document.getElementById('coin-balance')!;
 const notice=document.createElement('div');notice.id='coin-notice';notice.hidden=true;notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');document.body.append(notice);
 let wallet:Economy|null=null,pending='',timer=0;
 function showNotice(){if(!pending||!ctx.started())return;notice.textContent=pending;pending='';notice.hidden=false;clearTimeout(timer);timer=window.setTimeout(()=>notice.hidden=true,9000);}
 function show(){
  if(!wallet)return;
  ctx.open('Dompet Koin Sains',`<p class="wallet-total"><span aria-hidden="true">◉</span> <strong>${number(wallet.balance)}</strong> koin</p><p>Koin berbeda dari XP. Hadiah diberikan sekali untuk misi lengkap; buku, checkpoint dan kunjungan tidak memberi koin. Barang milik sendiri dapat dipakai melalui Penampilan. Belanja tersedia di butik Gaya Penjelajah, Kota Sains.</p><h3>Riwayat transaksi</h3>${wallet.ledger.length?`<ol class="wallet-history">${[...wallet.ledger].reverse().map(r=>`<li><div><strong>${r.kind==='mission-reward'?r.missionId+' · '+coinRule(r.missionId)!.name:(cosmetic(r.itemId)?.name??r.itemId)}</strong><small>${new Date(r.at).toLocaleDateString('id-ID')} · ${r.kind==='cosmetic-purchase'?'Pembelian · harga v'+r.priceVersion:r.source==='legacy-reconciliation'?'Pengakuan progres lama':'Penyelesaian misi'}</small></div><b>${r.kind==='cosmetic-purchase'?'−':'+'}${number(r.amount)}</b></li>`).join('')}</ol>`:'<p>Belum ada hadiah koin. Selesaikan misi dan simpulkan berdasarkan bukti.</p>'}<p class="model-note">Profil lokal …${wallet.profileId.slice(-8)}. Saldo berasal dari riwayat tersimpan. Reset misi tidak menghapus hadiah. Ekspor cadangan melalui Pengaturan untuk menyimpan profil dan dompet.</p>`,'HADIAH MISI · BUKAN NILAI AKADEMIK');
 }
 button.onclick=show;button.disabled=true;
 return {show,started:showNotice,commit(next:Economy,grants:CoinReceipt[]=[],migration=false){
  if(wallet&&wallet.profileId!==next.profileId){pending='';notice.textContent='';notice.hidden=true;clearTimeout(timer);}
  wallet=structuredClone(next);balance.textContent=number(wallet.balance);button.disabled=false;button.setAttribute('aria-label',`Dompet: ${number(wallet.balance)} koin`);
  if(grants.length){const sum=grants.reduce((s,r)=>s+r.amount,0);pending=migration?`Progres lama diakui — +${number(sum)} koin dari ${grants.length} misi: ${grants.map(r=>r.missionId).join(', ')}.`:`Misi selesai — +${number(sum)} koin (${grants.map(r=>r.missionId).join(', ')}).`;showNotice();}
 }};
}
