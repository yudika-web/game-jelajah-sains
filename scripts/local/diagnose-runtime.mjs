import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {APP_ROOT,PORT,requireNode,createLog,reporter,instanceId,buildId,SERVER_ID} from './common.mjs';
import {validateDist,probeServer,sameServer} from './static-server.mjs';
import {lanAddresses} from './launch.mjs';
/** The ready-to-play distribution does not require npm or source dependencies. */
export async function diagnoseRuntime({root=APP_ROOT,port=PORT,log=createLog('diagnostik')}={}){
 const say=reporter(log);let ok=true;
 say(`Log: ${log.file}`);say(`Lokasi aplikasi: ${root}`);say(`Node.js: ${process.versions.node}`);
 say('Paket siap main: npm, npm ci dan build tidak diperlukan.');
 try{requireNode();}catch(e){say(e.message);ok=false;}
 let identity;
 try{const dist=await validateDist(path.join(root,'dist'));identity={server:SERVER_ID,instance:instanceId(root),build:buildId(dist)};say('Build permainan dan galeri: tersedia.');}
 catch{say('Build tidak lengkap. Ekstrak ulang seluruh JS-Windows.zip ke folder pendek.');ok=false;}
 say(`Alamat tetap: http://localhost:${port}`);
 const probe=await probeServer(port);
 if(!probe.occupied)say('Port tersedia; buka JALANKAN_JELAJAH_SAINS.bat.');
 else if(identity&&sameServer(probe.identity,identity))say('Server dari folder dan build ini sudah aktif.');
 else{say('Port dipakai aplikasi lain atau folder/build berbeda. Tidak ada proses yang dimatikan.');ok=false;}
 say(`Kandidat LAN: ${lanAddresses().map(a=>`http://${a}:${port}`).join(' | ')||'tidak ditemukan'}`);
 say('LAN memerlukan jaringan yang sama dan izin firewall; belum dijamin dari perangkat lain.');
 say('Node.js resmi: https://nodejs.org/ . Jangan membuka index.html langsung.');
 say('Progres browser tidak dihapus. Gunakan alamat lama yang sama atau ekspor/impor bila alamat berubah.');
 return ok;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)process.exitCode=await diagnoseRuntime()?0:1;
