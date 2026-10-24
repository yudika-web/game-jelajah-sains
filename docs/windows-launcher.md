# Membuka Jelajah Sains di Windows

Paket ini memakai **Node.js**, bukan EXE mandiri. Tidak perlu Electron, akun, atau backend. Setelah disiapkan, bermain tidak memerlukan npm, build ulang, ataupun internet.

## Pertama kali

1. Unduh dan **ekstrak seluruh ZIP**. Jangan menjalankan BAT dari dalam tampilan ZIP. Nama folder boleh mengandung spasi dan karakter Indonesia; simpan pada folder yang dapat ditulis.
2. Pasang **Node.js 24 LTS beserta npm** dari [nodejs.org](https://nodejs.org/). Syarat proyek: Node.js minimal **22.12.0**, npm minimal **10**. Sesudah memasang, tutup jendela peluncur lama.
3. Klik ganda **SIAPKAN_ATAU_PERBARUI.bat**. Tunggu sampai muncul **BERHASIL**. Internet diperlukan bila dependensi perlu diunduh.
4. Klik ganda **JALANKAN_JELAJAH_SAINS.bat**. Browser akan membuka **http://localhost:5173** setelah server siap.

**Jangan membuka `index.html` langsung**, termasuk `dist/index.html`. Alamat `file://` tidak didukung. Galeri tersedia lewat Pengaturan atau **http://localhost:5173/character.html**.

## Setiap kali bermain

Klik ganda **JALANKAN_JELAJAH_SAINS.bat**. File ini hanya membutuhkan Node.js dan `dist` yang sudah dibuat. Ia tidak menginstal dependensi atau menjalankan Vite.

Saat muncul **“Server aktif; biarkan jendela ini terbuka selama bermain”**, biarkan jendelanya terbuka. Jika browser tidak muncul, buka alamat yang tercetak secara manual. Untuk mengakhiri, tutup permainan, tekan **Ctrl+C** pada jendela server, lalu jawab **Y** bila Windows meminta konfirmasi. Menutup jendela server juga menghentikan layanan lokal; progres yang sudah disimpan browser tetap ada.

Klik ganda kedua dari folder dan build yang sama akan membuka server yang sudah aktif. Jendela kedua boleh ditutup; jendela server pertama tetap harus terbuka. Server dari salinan folder atau build berbeda tidak digunakan secara diam-diam.

## Memperbarui setelah kode berubah

1. Bila perlu, buat cadangan lewat **Pengaturan → Ekspor cadangan** pada alamat bermain lama.
2. Hentikan server. Perbarui atau ekstrak kode terbaru ke folder aplikasi.
3. Klik **SIAPKAN_ATAU_PERBARUI.bat** kembali. Instalasi hanya dijalankan jika dependensi belum lengkap, manifest/lock berubah, atau lingkungan Node/platform berubah. Pemeriksaan pertama setelah memakai peluncur ini memasang ulang sesuai lock agar keadaan dependensi diketahui.
4. Jika berhasil, klik **JALANKAN_JELAJAH_SAINS.bat**.

Build pengganti dibuat di folder sementara. `dist` lama baru dipindahkan setelah build baru berhasil dan halaman permainan/galeri tersedia. Jika pemasangan atau build gagal, `dist` lama tetap ada. Jika penggantian folder gagal, peluncur mencoba memulihkan build lama dan menampilkan lokasi salinannya jika pemulihan terhalang. File persiapan tidak menghapus data browser.

## Alamat tetap dan progres

Peluncur selalu memakai **http://localhost:5173**, port yang sama dengan server pengembangan sebelumnya. Ia tidak mencari port lain otomatis. `http://127.0.0.1:5173` juga dapat diakses secara manual pada server ini jika itulah alamat progres lama Anda.

Browser memisahkan penyimpanan berdasarkan **protokol, hostname, dan port**. Karena itu, `localhost:5173`, `127.0.0.1:5173`, `localhost:4173`, dan alamat IP laptop memiliki progres terpisah. Ini tidak berarti progres lama dihapus.

Jika berpindah alamat, buka game pada **alamat lama**, pilih **Ekspor cadangan**, kemudian buka alamat baru dan **Impor cadangan**. Bila sebelumnya memakai port 4173 dan server lama masih tersedia, ekspor dari sana dahulu. Jangan membersihkan data browser untuk mengatasi perbedaan alamat. Launcher tidak membaca atau mengubah IndexedDB pemain; sistem simpan dan format cadangan game tetap sama.

Jika port 5173 dipakai aplikasi lain atau Vite, peluncur menolak membuka aplikasi tersebut. Baca pesan, hentikan server yang memang Anda kelola sendiri, lalu coba lagi. Peluncur tidak mematikan proses lain. Jika masih ada server dari build sebelumnya, tutup jendela server lama sebelum menjalankan build baru.

## HP dan IFP melalui LAN

Jendela server menampilkan alamat laptop **http://localhost:5173** dan kandidat IPv4 jaringan privat, misalnya **http://192.168.1.10:5173**. Di HP/IFP, gunakan alamat IP laptop itu, bukan `localhost`.

Perangkat harus berada pada jaringan Wi-Fi/LAN yang sama. Windows Firewall mungkin meminta izin Node.js pada jaringan privat. Wi-Fi tamu, isolasi perangkat, firewall sekolah, atau VPN dapat menghalangi sambungan. Kandidat IP dapat berasal dari adaptor virtual; pilih adaptor Wi-Fi/Ethernet yang terhubung. Daftar IP bukan jaminan sambungan berhasil. **Akses LAN dari perangkat lain belum diuji pada lingkungan Linux ini.**

Server menyajikan isi `dist` saja, dengan endpoint identitas tanpa data pemain. Folder sumber, cadangan, log, dan berkas lain pada repository tidak disajikan. Progres HP dan IFP tetap tersimpan pada browser masing-masing; tidak disinkronkan dengan laptop.

## Bila gagal

Klik ganda **DIAGNOSTIK_JELAJAH_SAINS.bat**. Jendela menampilkan lokasi aplikasi, versi Node/npm, kelengkapan `dist`, port, kandidat LAN, serta masalah yang ditemukan. Ringkasan hasil persiapan/peluncuran terakhir beserta alasan kegagalan juga ditampilkan jika tersedia; tanggalnya membantu membedakan masalah lama dari pemeriksaan saat ini. Jendela menunggu tombol sebelum menutup. npm dibutuhkan untuk persiapan, sedangkan peluncuran harian cukup Node.js dan build.

Log tiap tindakan disimpan pada **`%LOCALAPPDATA%\Jelajah-Sains\logs`**, atau **`%TEMP%\Jelajah-Sains\logs`** jika lokasi pertama tidak dapat ditulis. Alamat lengkap log tercetak pada jendela. Jika Node belum tersedia, BAT menulis pesan awal ke **`%TEMP%\Jelajah-Sains-bootstrap.log`**. Log persiapan memuat keluaran instalasi/build dan sebab kegagalan; diagnostik tidak menyalin seluruh log itu ke layar.

Log tidak membaca progres, catatan refleksi, cadangan siswa, cookie, atau isi variabel lingkungan. Diagnostik menampilkan path aplikasi dan alamat LAN untuk membantu pemeriksaan, bukan data pemain. Bila menyampaikan log kepada orang lain, pilih log tindakan yang bermasalah.

## Status pemeriksaan

Implementasi server, persiapan, dan browser diuji pada Linux. Folder berspasi/beraksen diuji pada filesystem Linux. **Klik ganda BAT, pembukaan browser Windows, path Windows/UNC, Windows Firewall, dan HP/IFP fisik belum diuji langsung.** Lihat [laporan pemeriksaan](windows-launcher-review.md) untuk skenario dan hasil.
