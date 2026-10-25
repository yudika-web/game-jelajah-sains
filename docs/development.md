# Catatan pengembangan prototipe 0.1

Wilayah terbaru tersedia di [W05 / S16 Jaring Kehidupan Pesisir](coastal-foodweb-review.md). Episode energi tersedia di [W06 / M17-E3 Energi untuk Pos Riset](workshop-energy-review.md). Episode elektromagnet tersedia di [W06 / M17-E2 Derek Elektromagnet](workshop-electromagnet-review.md). Episode rangkaian tersedia di [W06 / M17-E1 Nyalakan Lampu Pos Riset](workshop-circuit-review.md). Catatan W04 / S13 tersedia di [Catatan Ikan Dua Titik](river-fishing-review.md). Episode sebelumnya tersedia di [W03 Bantu Pos Rimba](rimba-logistics-review.md). Pemeriksaan gerak terbaru tersedia di [Patch respons gerak dan lari](running-review.md). Pemeriksaan karakter terbaru tersedia di [Patch avatar balok dan ukuran absolut](block-avatar-review.md). Bagian penyempurnaan karakter dan kamera di bawah mencatat fondasi tahap sebelumnya.

> Bagian M14 dan W03 di bawah mencatat keadaan ketika tahap tersebut dibuat. Format cadangan mutakhir adalah **v10**, dengan sepuluh misi/episode; rincian mutakhir ada pada bagian S16.

## Sumber dan keputusan implementasi

`rancangan-game.md` adalah salinan lampiran pengguna. Cakupan implementasi mengikuti permintaan irisan pertama dan bagian **Cakupan irisan awal**, **M01**, **Kontrol**, **Penyimpanan**, serta **Pengujian penerimaan**. Rencana delapan wilayah dan sistem lain tetap menjadi rujukan tahap berikutnya, bukan klaim sudah selesai.

M01 memisahkan peristiwa membaca, merancang, mengukur, menguji, dan menyimpulkan. `transition` adalah sumber kebenaran data A 70, B 20, dan uji A 35. Panel menampilkan hasil peristiwa; membuka panel sendiri tidak menghasilkan pengukuran. Uji harus memiliki dugaan, kedua sumber, rencana yang sesuai, dan kedua sampel. Kesimpulan harus memiliki hasil uji. Klaim air aman diminum dan generalisasi semua kekeruhan dari limbah ditolak.

Kartu pengetahuan adalah naskah awal dari dokumen rancangan, belum merupakan materi final yang telah ditelaah guru. Simulasi sengaja tidak memakai satuan NTU atau menyatakan model memeriksa mikroorganisme, zat terlarut, maupun standar air minum.

## Dunia dan kontrol

Kota dibangun dengan geometri Three.js, tanpa model atau font dari jaringan. Geometri statis digabung berdasarkan material untuk mengurangi draw call. Resolusi dibatasi 1,5 kali CSS pixel; Pengaturan menyediakan rasio 1. Tidak ada bayangan dinamis, refleksi air, atau pointer lock. Bayangan kontak avatar hanya cakram transparan.

Gerak keyboard/analog relatif terhadap arah kamera. Navigasi ketuk memakai grid kecil dengan pencarian breadth-first, batas wilayah, dan penghalang bangunan/sungai. Cocok untuk blok kecil; ganti dengan navmesh/A* atau sistem wilayah ketika skala berkembang. Kamera merapat sebelum menembus volume bangunan. Kamera otomatis mengikuti posisi, dan IFP memakai tombol putar sehingga tidak membutuhkan dua sentuhan.

Mode IFP meningkatkan ukuran kontrol dan teks dialog. Perjalanan otomatis dapat dibatalkan dengan Berhenti atau input gerak. Jalur M01 tidak memerlukan lompatan. Uji browser satu pointer membuktikan alur input, tetapi tidak menggantikan uji jangkauan tangan dan keterbacaan pada panel kelas.

## Data lokal dan pemulihan

Versi simpan 1 berisi progres misi; posisi avatar tidak dipersistenkan. Preferensi jarak kamera, pengurangan gerakan, dan resolusi disimpan terpisah di localStorage dengan kunci `jelajah-sains.preferences.v1`. Tidak ada migrasi ataupun reset progres untuk perubahan visual ini. Jurnal dan tas diturunkan dari progres yang sama. Penulisan IndexedDB diserialkan dan status sukses baru muncul setelah transaksi selesai. Upaya kesimpulan salah tersimpan terpisah dari hasil akhir. Hadiah tetap 100, tidak diakumulasi ulang.

Cadangan dibatasi 1 MB dan harus melalui `parseProgress` sebelum menggantikan status aktif. Penghapusan data browser atau pindah origin dapat menghilangkan akses ke simpanan; ekspor JSON adalah jalur pemulihan lokal. Belum ada sinkronisasi/server siswa, jadi tidak ada status “terkirim” palsu.

## Validasi dan pengembangan berikutnya

Unit test mencakup gerbang bukti, rencana keliru, kedua sampel, batas kesimpulan, koreksi upaya, hadiah idempoten, cadangan tidak valid, dan rute antarsemua lokasi misi. E2E memakai Chromium: rendering WebGL, alur M01 satu pointer, keyboard, input HP bersamaan, pointer cancel, simpan/muat ulang, cadangan, dan fallback WebGL.

Sebelum dipakai di kelas: telaah konsep oleh guru; ukur FPS pada HP sasaran; uji layar penuh dan kegagalan penyimpanan pada browser sekolah; uji HP dan IFP fisik termasuk multitouch; periksa akses LAN antarperangkat. Target dokumen 30 fps HP / 45–60 fps laptop belum merupakan hasil ukur prototipe ini.

W02 dan M14 kini diimplementasikan, dengan penambahan rekaman pada object store lama tanpa mengubah skema. Lihat catatan W02 di bawah. Pengembangan berikutnya: telaah materi, pemeriksaan perangkat fisik, lalu penyempurnaan laporan guru lokal dan aksesibilitas sesuai kebutuhan kelas.

## Penyempurnaan karakter dan kamera

`character.ts` membangun model orisinal dari RoundedBoxGeometry yang ringan, dengan material/geometri dasar yang dipakai ulang dan penggabungan detail kaku per sendi/material. Root posisi dunia terpisah dari visual. Pemain, Bu Nara, dan Pak Wira memakai struktur bahu/siku/tangan serta pinggul/lutut/pergelangan kaki yang sama. `toolSocket` pada kedua tangan dan `labelSocket` di atas kepala disiapkan untuk alat selanjutnya. Metadata `place` tetap tersedia pada seluruh bagian NPC untuk raycast.

Pemain memiliki jaket biru, lapisan kaus, rambut tersisir geometris, ransel, serta sepatu ber-sol. Bu Nara memakai cardigan, kacamata, rok, dan sanggul; Pak Wira memakai rompi, lengan digulung, topi, dan celana kerja. Gestur Bu Nara berupa sambutan dengan tangan terangkat; gestur Pak Wira berupa percakapan dengan tangan lebih rendah dan anggukan pendek. Fase idle NPC berbeda dan NPC jauh diperbarui lebih jarang. Posisi misi keduanya tetap.

`characterAnimator.ts` menerima jarak perpindahan setelah resolusi tabrakan. Siklus langkah tidak maju saat tertahan dinding; pose berjalan berhenti melalui settling singkat. Arah tubuh memakai putaran terpendek dengan exponential damping. Gerak napas berada pada torso, bukan root atau seluruh kaki. Pose menyapa, membaca, memegang alat kekeruhan, dan mengambil sampel ditampilkan tanpa menambah syarat misi. Buku, meter, dan botol adalah geometri lokal pada socket tangan. Array/scratch buffer untuk update dipakai ulang; tidak ada pembuatan geometri/material dalam loop animasi.

`cameraController.ts` mengikuti root stabil dengan jarak 8,5/10,8/14 unit. Framing normal sedikit ke kanan pada layar lebar untuk memberi ruang panel misi. Pada interaksi, framing bergeser menuju area bebas di sebelah panel; potret menempatkan karakter di atas panel bawah. Kamera tidak otomatis memutar yaw ketika pemain berbelok. Pemeriksaan terhadap volume bangunan yang diperlebar melindungi bidang dekat kamera; pemeriksaan kedua setelah smoothing mencegah orbit menyapu sudut tembok. Kamera tetap boleh kehilangan pandangan di balik pohon: kamera hanya menghindari bangunan, tanpa sistem transparansi pohon.

Navigasi juga diperbaiki untuk pemain di tepi tembok: sel awal yang dibulatkan dapat berada di dalam bangunan meskipun posisi pemain sah. Pencarian kini memilih sel grid yang dapat disambungkan melalui segmen aman dari posisi aktual. Ini menjaga navigasi ketuk tetap tersedia setelah menabrak dinding.

Lihat [laporan pemeriksaan visual](character-camera-review.md), gambar dan video pada `docs/evidence/`, serta regresi baru di `tests/character.test.ts` dan `tests/characters.spec.ts`. Fixture `tests/fixtures/m01-v1.json` mewakili simpanan versi 1 yang sudah memiliki sampel A/B sebelum pembaruan, kemudian dilanjutkan sampai M01 selesai pada browser.

## Pembentukan ulang dari acuan tiga sisi

`character.ts` mempertahankan kontrak rig yang sudah dipakai dunia dan animator. Pembangunan geometri kini berada di `characterModel.ts`. Kepala bertepi membulat memiliki rahang yang mengecil, mata oval berlapis dengan sorotan, telinga, hidung, alis, dan senyum dari geometri lokal. Rambut memakai cangkang yang membungkus sisi/belakang kepala serta volume poni berlapis yang terhubung pada pangkalnya. Jaket memiliki pinggang yang mengecil, bukaan kaus, kerah, manset, tali ransel melengkung, saku, serta sol sepatu yang terpisah. Posisi pinggul dan panjang ruas kaki disesuaikan agar kepala, badan, dan kaki seimbang pada kamera bermain.

Pemain dibentuk dan diperiksa dahulu sebelum factory yang sama diterapkan ke NPC. Bu Nara mempertahankan cardigan ungu, kacamata, dan sanggul; Pak Wira mempertahankan rompi, topi, dan kumis. Titik tangan, alat, label, root navigasi, serta metadata interaksi tetap tersedia. Label mengikuti tinggi model baru dan uji raycast memakai posisi label yang diproyeksikan oleh kamera, sehingga tidak bergantung pada piksel dari model lama.

Galeri `character.html` memakai tiga kamera ortografis pada satu model diam. Tidak ada animator atau update posisi pada galeri. Tombol detail dan pilihan karakter memicu render ulang; geometri unik dari pilihan lama dibersihkan ketika model diganti. Model dan material dasar dipakai ulang, dan tidak ada layanan model/tekstur eksternal. Build Vite memiliki dua entry: permainan dan galeri. Galeri tidak mengimpor atau mengubah data penyelidikan.

Animator, validasi M01, hadiah, serta format IndexedDB versi 1 dipertahankan. Pengujian tambahan memeriksa proporsi, posisi kaki pada lantai, pose galeri yang tetap diam, serta pemulihan misi setelah keluar dari galeri. Bukti tiga sisi, detail wajah, dan tampilan bermain berada pada `docs/evidence/reference-model/`.

## W02 Kebun Kehidupan dan M14

Lihat [laporan W02/M14](garden-review.md) untuk alur, bukti visual, dan hasil pemeriksaan. Permintaan tahap ini menetapkan satu percobaan enam kacang hijau; kolam budidaya, kandang, dan kegiatan lain dalam rancangan besar tetap di luar lingkup.

`regions.ts` menetapkan lokasi, gerbang, spawn, batas, dan penghalang setiap wilayah. `findPath`/`walkable` menerima area navigasi; default Kota dipertahankan untuk pemanggil lama. `World` mempertahankan satu renderer, loop, pemain, dan binding input. Pertukaran wilayah menghapus grup objek lama, membuang geometri/material/tekstur unik, lalu membangun wilayah tujuan. Cache geometri/material karakter bersama ditandai dan dipertahankan. Tidak ada listener input atau loop milik wilayah yang ditambahkan saat perpindahan. Penghalang kamera diganti bersama wilayah. Label yang disembunyikan dan objek dengan induk tersembunyi tidak ikut dipilih oleh raycast. Karakter Bu Sari memakai rig yang sama, dengan topi kebun, sanggul, apron, dan pakaian kerja. Penyiram dan penggaris memakai socket tangan.

`gardenMission.ts` adalah sumber kebenaran untuk persediaan air, petak, perlakuan, hari simulasi, pengukuran, dan hadiah. Penyiraman memeriksa total dosis sebelum memindahkan air; peristiwa berulang pada kelompok/hari yang sama tidak menambah dosis. Tombol hari membawa nomor hari yang diharapkan, sehingga event lama tidak memajukan dua hari. Benih diturunkan dari dua status kelompok (masing-masing tiga). Semua aksi dunia diperiksa jaraknya di integrasi UI. Pertumbuhan visual dihitung deterministik dari titik model yang sama dengan pengukuran, tetapi hanya event pengukuran yang menambahkan baris jurnal. Grafik memakai `measurements` yang sama dengan tabel, termasuk rata-rata yang dihitung dari ketiga tinggi.

Skema IndexedDB tetap **1**, store `saves`, dengan key `M01`, `M14`, dan `world`. Format internal masing-masing misi tetap **1**; format ekspor gabungan **2**. `loadGame` hanya mengisi default untuk key yang belum ada, dan kegagalan validasi tidak menimpa simpanan lama. `saveGame` menulis ketiga key secara atomik. `importBackup` memeriksa semua bagian sebelum mutasi dan mempertahankan M14 untuk cadangan M01 v1. Riwayat `firstCompletedAt` dan hadiah pertama M14 dipertahankan saat reset dan digabung secara monoton ketika mengimpor cadangan lebih lama pada perangkat yang sama. XP diturunkan dari hadiah per misi, bukan ditambah setiap klik. Ini penyimpanan lokal untuk pembelajaran, bukan sistem anti manipulasi atau penilaian daring.

## Patch avatar balok dan ukuran absolut

Lihat [laporan patch](block-avatar-review.md). `characterConfig.ts` menjadi sumber tinggi target semua varian, lantai kaki, label, tinggi sasaran kamera, radius navigasi/interaksi, pintu, bangku, dan meja. Model baru tetap memakai kontrak rig lama, tetapi siku/lutut hanya socket kompatibilitas tanpa ruas visual terpisah. Enam mesh utama adalah kepala, torso, lengan kiri/kanan, serta kaki kiri/kanan. Wajah, pakaian, tangan, dan sepatu memakai canvas lokal/material datar yang dibagi pakai; rambut terdiri dari tiga bentuk besar dan tambahan kuncir/sanggul bila sesuai.

`bodyMeshes` memisahkan tubuh dari alat, bayangan, label, dan penanda. Batas geometri netral dihitung sebelum label/bayangan dibuat. Faktor `targetHeight / baseHeight` ditetapkan dengan `visual.scale.setScalar`, bukan dikalikan dengan skala sebelumnya. Posisi visual mengoreksi telapak ke Y 0,10; akar navigasi tetap berskala 1. Alat pada socket diwarisi skala visual sekali. Animator mempertahankan root navigasi, mengayun anggota utuh dari bahu/pinggul, membatasi kaki di dalam rok Nara, dan mengoreksi sudut terendah kaki saat melangkah.

Siswa dan siswi sama-sama 1,60 unit. `?avatar=siswi` memilih varian pada awal konstruksi dunia; query dipertahankan saat membuka/menutup galeri dan tidak masuk format misi/cadangan. Galeri memakai factory yang sama, tanpa skala tambahan. Mode biasa membingkai model sesuai tinggi aktual untuk inspeksi; `?framing=compare` memakai frustum lama yang tetap agar perubahan ukuran terlihat. Kamera permainan tetap memakai 8,5/10,8/14 unit dan sudut kontrol lama, dengan tinggi sasaran 1,02 unit.

Pintu 2,10 unit dan tapak bangunan dipertahankan. Bangku diturunkan ke 0,50 dan permukaan meja kebun ke 0,84. Pot/bed serta tanaman disesuaikan secara visual; tinggi pertumbuhan ditampilkan 5× (`0,05 unit/cm`) dan panel menjelaskannya, sementara data cm dan aturan M14 tidak berubah. Penghalang tidak memerlukan perubahan tapak. Jangkauan interaksi 2,6, pendekatan 1,4, dan radius navigasi 0,45 dipertahankan.


## Patch respons gerak dan lari

Lihat [laporan pemeriksaan](running-review.md). `src/engine/movement.ts` menjadi konfigurasi dan integrator gerak bersama keyboard, analog, serta navigasi otomatis. Target Jalan 5,2 / Lari 8,0 unit per detik; akselerasi 60 dan perlambatan 90 unit/detik². Skala karakter tidak terlibat. Integrasi ramp kecepatan memakai luas trapesium dengan koreksi waktu saat mencapai target, dan substep maksimal 1/120 detik (perpindahan maksimal 0,067 unit). Pergerakan manual memakai sapuan per sumbu sampai batas dinding pertama (`sweepAxis`), lalu dapat bergeser sepanjang dinding; tidak ada rayapan dari penolakan endpoint. Navigasi tetap di segmen waypoint dan membatasi jarak terhadap sisa segmen. Arrival dikonsumsi sekali; jalur terhalang tidak melaporkan sukses.

Batas delta lama 0,05 menyebabkan kecepatan dunia turun saat frame lebih lambat dari 20 Hz. Kini interval hingga 0,25 detik diproses seluruhnya; lonjakan lebih besar dibuang. Blur/tab tersembunyi membersihkan input/inersia serta mengabaikan delta pertama setelah reset. Tidak ada catch-up terhadap waktu nyata. Uji numerik 10/15/20/30/60/120 Hz serta interval bervariasi membandingkan jarak yang sama; ini bukan benchmark FPS perangkat.

Analog memiliki area mati radial 0,06 dengan rentang sisanya dinormalisasi kembali ke 0–1. Arah gabungan dinormalisasi hanya jika panjangnya >1. Shift kiri/kanan dilacak terpisah. Input pada input/select/textarea dan konten editable diabaikan; fokus masuk ke editor membersihkan input lama. Tombol yang masih ditahan sesudah jeda tidak diterima melalui key-repeat; pemain perlu menekan ulang. Pembukaan panel, perubahan mode/wilayah, kembali ke pos, blur, dan visibilitychange memakai clear yang sama. Pointer cancel/lost capture menghentikan perpindahan langsung sambil mempertahankan pilihan mode; pelepasan normal memakai pengereman singkat. Input manual membatalkan jalur saat event diterima, termasuk pulsa tombol yang seluruhnya berada di antara dua frame. Toggle Jalan/Lari bersifat sementara, bukan preferensi atau data misi. Peta menghentikan gerak saat terbuka; memilih tujuan mengembalikan mode sebelumnya khusus untuk rute baru itu. Menutup Peta tanpa memilih tujuan tetap Jalan.

Animator membaca jarak aktual setelah tabrakan, mengklasifikasikan idle/walk/run/interact, lalu membaurkan amplitudo dan kemiringan tubuh. Irama langkah tetap berdasarkan jarak sehingga otomatis lebih cepat saat berlari. Lengan/kaki tetap balok utuh; NPC tanpa perpindahan tetap diam. Pengurangan gerakan menekan ayunan/condong dekoratif tanpa mengubah integrator. Kamera, FOV, skala, penghalang, radius interaksi, misi, dan format simpan tidak diubah.

Reproduksi bukti video setelah build: `node scripts/capture-running-evidence.mjs` (server preview 4173; dapat diganti lewat `EVIDENCE_ORIGIN`). Memerlukan Chromium sistem dan ffmpeg. Tangkapan HP/IFP diperbarui dengan `CAPTURE_RUNNING_EVIDENCE=1 npm run test:e2e -- tests/running.spec.ts`.


## W03 Rimba dan Gambut — W03-LOG01

Episode mengikuti bagian dukungan pos kebakaran dan prototipe pembuktian pada rancangan, dengan ID sendiri. M01/M14 tetap memakai aturan dan identitas lama. `rimbaMission.ts` menyimpan reducer logistik murni: mL integer, neraca 40.000, dua wadah independen, transfer atomik, syarat jalur C, bukti pengiriman, dan hadiah pertama. `parseRimba` memutar ulang transfer, menghubungkannya ke muatan/perjalanan, lalu memeriksa volume agregat, prasyarat, kesimpulan, dan hadiah. Cadangan v3 menambah key `W03-LOG01`; IndexedDB tetap skema 1/store saves. Impor v1/v2 mempertahankan misi yang tidak dicakup. Fixture gabungan lama berada di `tests/fixtures/m01-m14-v2.json`.

`rimbaUI.ts` menangani materi, pemilihan jumlah, pratinjau, tanda terima sekali pakai, jurnal, serta kesimpulan. Main hanya mengintegrasikan reducer, kedekatan objek, perpindahan wilayah, alat, dan penyimpanan. Tidak ada transaksi air atau keadaan misi yang diturunkan dari animasi. Pengembalian sisa air ke sumber tersedia agar pemain yang mengisi lebih dari kebutuhan tidak terjebak.

`rimbaRegion.ts` mendefinisikan posisi, jalur C, dan area navigasi yang di-cache untuk kondisi terbuka/tertutup serta pemain/gerobak. Batas area sumber dibagi oleh domain dan renderer dari `rimbaMission.ts`. `NavigationArea.radius` opsional, default tetap 0,45. Gerobak memakai radius bundar 1,65 yang mencakup seluruh model pada semua arah; bounds dipersempit sesuai selisih radius. Kecepatan khusus 3,4/4,2 diteruskan ke integrator bersama. Rute tetap menahan setiap waypoint, dan tabrakan manual memakai sweep. Tiang gerbang baru memiliki penghalang yang sesuai. Unit test memeriksa semua pasangan pendekatan gerobak, volume model dalam footprint, dan rotasi roda dari jarak.

`rimbaWorld.ts` memakai geometri lokal untuk pos dan benda logistik. Pak Damar memakai rig factory yang sama, varian penampilan baru, tinggi 1,74. Ember menjadi attachment di tangan dan tidak ikut pengukuran tubuh. `CharacterAnimator.pushing` mengatur tangan tanpa menghentikan locomotion dari jarak aktual. Saat dilepas, pengaturan lama kembali berlaku. Satu renderer/loop/input dipakai seluruh wilayah; grup dan sumber daya wilayah lama dilepas, cache karakter bersama dipertahankan.

`RimbaSession` menerima callback substep integrator hanya ketika benar-benar berpindah. Di luar area sumber, muatan memulai trip; kembali ke area menutupnya. Jarak/waktu dikumpulkan dan ditulis sekitar satu detik gerak atau sebelum panel/lifecycle, dengan mm/ms integer. Tidak ada penambahan untuk waktu membaca, perbaikan, jeda, atau aplikasi tertutup. Ini waktu gerak, bukan pengukuran waktu total alat. Batas area ditandai garis krem. Parkir di Bengkel, keluar wilayah, Kembali ke Pos, dan reload menyimpan alat pada titik parkir tetap tanpa menghapus isi/perbaikan. Reload menutup trip terbuka, tidak melanjutkan hitungan selama aplikasi tidak aktif.

Jurnal membandingkan hanya alat yang benar-benar mengirim. Enam muatan ember / dua gerobak merupakan perhitungan kapasitas yang dilabeli, bukan data uji alat yang belum dipakai. Upaya kesimpulan yang salah dan benar tetap tercatat; refleksi bebas tidak dinilai otomatis. Petugas melaporkan penanganan setelah kesimpulan, lalu pemulihan habitat menyelesaikan episode. Langit berubah lebih tenang, tetapi batas area terdampak tetap berlaku.

Bukti dapat direproduksi melalui `CAPTURE_RIMBA_EVIDENCE=1 npm run test:e2e -- tests/rimba.spec.ts`. Pengujian browser memakai input nyata pada dunia WebGL; alur IFP mencakup persiapan penuh dan perbaikan gerobak. Pengujian ember enam muatan memakai fixture persiapan, lalu melakukan setiap pengisian, perjalanan, dan penuangan di browser tanpa perbaikan gerobak. HP memeriksa dua jari, penuangan sebagian, dan pembukaan C. Laptop memeriksa Shift/kecepatan khusus, roda, batas penghalang, parkir, dan pemulihan lari normal. Ukuran viewport bukan perangkat fisik.


## W04 Sungai dan Danau — S13

Implementasi mengikuti W04, S13, dan “Memancing sebagai pengamatan ekosistem”, dengan cakupan tahap pengguna: satu umpan, tiga kategori ciri tanpa spesies, enam hasil deterministik, seluruh ikan dilepaskan. Habitat/makanan dari rancangan yang belum diverifikasi tidak disajikan sebagai hasil pemain. Berenang, menyelam, perahu, umpan peluang, dan pemindahan ikan ke kolam ditunda.

`riverRegion.ts` mendefinisikan tepian, pos, dan dermaga 4 unit lebar. Air di x≥3 diblokir kecuali dek z=-9 sampai -5; radius pemain 0,45 memberi jarak aman. Setiap pendekatan serta posisi memancing diuji dengan pathfinder bersama. Area air tidak menjadi target raycast tanah. Model rumah memakai pintu 2,1 unit dan Kak Lestari 1,68 unit dari factory enam balok; model baru tersedia pada galeri yang sama. Rod socket tidak ikut pengukuran tinggi tubuh.

`riverContent.ts` menyimpan urutan A pipih/pipih/memanjang dan B berkumis/memanjang/berkumis, kartu 35–70 kata, serta ilustrasi ciri. `riverMission.ts` bebas renderer: penerimaan, sumber, rencana, upaya salah/benar, catatan dan pelepasan atomik, kesimpulan serta hadiah 50 XP pertama. ID rekaman A-1 sampai B-3 stabil. Revision dan indeks berikutnya menolak event ganda. Parser memeriksa dataset, urutan per lokasi, pelepasan, bukti jawaban ciri, prasyarat, kesimpulan, dan hadiah. Refleksi tidak dinilai berdasarkan kata kunci.

`FishingSession` sementara mengatur idle → casting (0,8 detik aktif) → waiting (1,6 detik aktif) → ready (tanpa batas reaksi) → observing → released (0,75 detik aktif) → idle. Angka pendek ini durasi presentasi model, bukan durasi sampling sungai atau jam perangkat. `World.onRiverFrame` memanggil tick dari render loop lama; tidak ada timer, RAF, renderer, atau input baru. Fokus hilang/tab tersembunyi menghentikan tick. Menu/cancel/perubahan mode/wilayah membatalkan keadaan belum disahkan. Reload tidak menyimpan animasi dan kembali ke pos, tanpa mengganti ikan berikutnya.

`riverWorld.ts` membangun aset lokal. Tiga siluet ikan, 14 garis air, tiga ikan dekoratif, satu pelampung/tali dan tiga model hasil dipakai ulang. Atribut posisi tali diubah di tempat. Dekorasi tidak menentukan hasil. Pengurangan gerakan menekan dekorasi dan goyangan; status/alat tetap tampil. Animasi lempar, tarik, dan lepas sederhana tidak membutuhkan drag presisi. Grup daerah dimusnahkan saat pergantian termasuk geometri/material `Line`; cache tubuh/alat karakter bersama tetap dimiliki factory. Tidak ada backend/CDN.

`riverUI.ts` memisahkan panel pancing kecil dari dialog biasa agar dunia tetap terlihat. UI ini menghentikan gerak darat melalui jeda World, tetapi state pancing tetap ditick jika aktif. Tab/Enter memakai tombol HTML, shortcut game diabaikan ketika mengedit catatan. Tabel dan diagram membaca `riverCounts` yang sama dari rekaman sah. Sebelum ada catatan di suatu titik, semua selnya null/“Belum diamati”; sesudahnya angka berlabel jumlah sampel yang sudah dicatat, termasuk nol kategori yang belum tercatat. Urutan masa depan tidak ditampilkan.

Cadangan **v4**, skema IndexedDB tetap **1**. Key S13 ditambah dalam store saves dan transaksi bersama empat misi; key lama tidak dihapus. V1 hanya M01, v2 M01/M14/world, v3 tiga misi/world; progres S13 yang tidak dicakup dipertahankan. V4 memvalidasi seluruh misi sebelum mengubah state. Riwayat hadiah pertama S13 digabung monoton agar impor/reset tidak menggandakan XP. Fixture `tests/fixtures/m01-m14-rimba-v3.json` berasal dari hasil W03 sebelum S13: gerobak diperbaiki, 24 L dikirim, sumber 16 L, hadiah 100 XP, M14 hari 4, dan sampel M01 tetap ada.

Bukti browser: `CAPTURE_RIVER_EVIDENCE=1 npm run test:e2e -- tests/river.spec.ts`. Cuplikan: `node scripts/capture-river-evidence.mjs`, sesudah alur penuh menghasilkan final-state.json dan server 5173 hidup; EVIDENCE_ORIGIN dapat mengganti server. Lihat [laporan S13](river-fishing-review.md) untuk hasil dan batas pengujian.


## Kolam terbatas dan S14 (commit tahap mandiri)

Branch main pada awal pemeriksaan hanya sampai 51a2b22/S13; tidak ada branch berenang/S14 di remote. Atas arahan pengguna, perubahan perahu/S15 disimpan sementara dalam Git stash, lalu kolam/S14 dibuat sebagai tahap mandiri. `poolRegion.ts` membatasi area dan ramp; navigation berganti otomatis saat masuk/keluar. `poolWorld.ts` memotong tanah untuk kolam, menampilkan ramp, rompi, penanda, serta benda uji. Integrator dan loop lama digunakan; tidak ada sistem input kedua. Kecepatan renang 2,2 unit/detik, Shift tidak menambah kecepatan. Kembali ke Tepian tidak mengurangi XP. Reload kembali ke pos darat.

`buoyancyMission.ts` menyimpan prediksi, hasil model, upaya kesimpulan, refleksi dan hadiah. A 100g/200cm³ dan C 200g/400cm³ sama-sama 0,5g/cm³ (terapung); B 100g/50cm³ = 2g/cm³ (tenggelam). Air 1g/cm³. Prediksi salah tetap tersimpan; hasil perlu uji dan Catat. `BuoyancyTrial` sementara, dipanggil loop World dan berhenti pada blur/tab tersembunyi. Catatan ganda ditolak. S14 menggunakan key sendiri pada IndexedDB skema 1, cadangan v5; impor v1–v4 mempertahankan S14. Tahap ini: 144 unit lulus, build lulus, 4 browser khusus S14 lulus.


## Integrasi perahu W04 / S15 sesudah S14

Tahap mandiri berenang/S14 berada pada commit 137f4fd, dengan 144 unit, build dan 4 browser khusus lulus. Perubahan perahu yang disimpan sebelum tahap ini dipulihkan dari stash dan konflik disatukan secara eksplisit, termasuk rig rompi, animasi, navigasi, frame hooks, penyimpanan, serta UI. Tidak ada pekerjaan pengguna yang dihapus atau diganti placeholder.

Prioritas area gerak: jika naik perahu gunakan boatNavigation; jika berenang gunakan poolSwimmingNavigation; selebihnya area darat wilayah aktif. Kolam tidak menjadi rute perahu, dan jalur perahu tidak membuka izin berenang. Integrator lama memakai kecepatan 3,5/5,0 untuk perahu, 2,2/2,2 untuk renang, dan 5,2/8,0 di darat. Circle radius 1,65 mencakup hull pada semua rotasi. Docking memerlukan tanda air dengan toleransi 0,5; turun memeriksa titik darat walkable. Posisi kendaraan/transient sampling tidak dipersistenkan; reload kembali ke pos dan dermaga awal.

Model aliran dipisahkan dalam irrigationContent.ts; aturan misi dalam irrigationMission.ts; state sampling dalam flowSampling.ts. Volume 30 detik = debit × 30/60. Data sebelum 10/2/2 L dan sesudah 10/6/6 L. Tidak ada operasi pada volume M14/Rimba. Record hanya setelah menekan Catat hasil, revision dan ID kondisi-titik menolak duplikasi, cleaning memerlukan ketiga data awal + dugaan + alat, dan conclusion memerlukan enam rekaman serta tindakan.

Cadangan v6 menambah S15 setelah v5/S14; skema IndexedDB tetap 1. Impor v1–v5 mempertahankan misi yang tidak dicakup, semua bagian divalidasi dahulu, dan hadiah pertama tetap monoton. Fixture v4 dari S13 asli dan v5 dari hasil S14 disertakan untuk migrasi. Lihat boat-irrigation-review.md untuk panduan, bukti, hasil akhir dan batas perangkat.


## Peluncur Windows dan server produksi lokal

Tiga BAT di akar repository memanggil `scripts/local/prepare.mjs`, `launch.mjs`, dan `diagnose.mjs` dari lokasi file, dengan path dikutip, UTF-8, `pushd`, delayed expansion dimatikan, dan jeda sebelum jendela ditutup. Syarat minimum Node 22.12/npm 10 diperiksa; launcher harian tidak memanggil npm. [Panduan pengguna](windows-launcher.md) dan [hasil pemeriksaan](windows-launcher-review.md).

`static-server.mjs` memakai HTTP/fs bawaan Node, root `dist` saja. GET/HEAD, MIME aset, status identitas, URL rusak, dotfile, traversal, dan symlink keluar root ditangani. Identitas memuat ID protokol, hash folder, dan hash kedua entry build; tidak ada path asli atau data browser. Bind IPv4 0.0.0.0:5173 untuk kandidat LAN; browser laptop selalu localhost:5173. EADDRINUSE memicu pemeriksaan identitas: folder/build sama digunakan kembali, selain itu gagal tanpa mematikan proses atau mengganti port. Pemeriksaan kesiapan selesai sebelum browser dibuka.

`prepare.mjs` mencocokkan SHA-256 package.json/package-lock.json + versi mayor Node/platform/arsitektur dan keberadaan dependensi utama. Marker lokal di `.jelajah-local` bukan data game. Instalasi memakai npm ci --include=dev dan cache TEMP, tanpa audit/fund. Build dijalankan melalui script proyek dengan outDir sementara. Build lama dipindahkan setelah staging tervalidasi, lalu dipulihkan jika promosi gagal. Kunci persiapan mencegah dua proses memperbarui bersamaan. Log ditaruh di LOCALAPPDATA atau TEMP, tidak membaca cadangan/IndexedDB. Folder marker/staging/log diabaikan Git.

`npm run test:launcher` memakai node:test tanpa dependensi baru. `tests/production.spec.ts` membuka server statis pada port uji terisolasi, memblokir seluruh permintaan di luar origin, memeriksa permainan/semua karakter galeri di empat viewport dan memastikan rekaman enam misi IndexedDB tetap sama. Port uji dinamis tidak menjadi perilaku peluncur publik; CLI selalu 5173. Uji ini memerlukan build terbaru terlebih dahulu.


## W06 dan episode rangkaian M17-E1

`workshopRegion.ts` menetapkan lokasi dan penghalang W06. `workshopContent.ts` memuat kartu lokal, terminal, serta dugaan. `circuitModel.ts` mengevaluasi lintasan dari sumber 3 V melalui sakelar, slot kabel S2–L1, lampu yang sesuai, dan jalur kembali. World, diagram, dan status memakai evaluasi yang sama. Satu renderer/loop/input tetap dipakai; `workshopWorld.ts` dimiliki regionRoot dan dibersihkan melalui pola yang sudah ada. Kak Bima memakai factory/rig enam balok dengan tinggi 1,72 unit, helm teknisi dan rompi mustard; tersedia juga di galeri.

`workshopMission.ts` memisahkan aturan dari renderer: uji awal dan pemeriksaan visual mendahului isolasi; kontinuitas dan alat uji lampu hanya tersedia sesudah sumber dilepas. Lampu diuji memakai tester virtual terpisah, bukan menyambungkan ulang rangkaian utama. Kabel hanya terpasang pada slot yang dibuktikan putus, sementara pilihan salah disimpan tanpa mengubah koneksi. Revision menolak event lama/klik ganda. Uji sesudah dan pengamatan nyala wajib sebelum kesimpulan. Membuka sakelar setelah selesai tidak menghapus bukti historis.

Parser memutar ulang riwayat tindakan lalu mencocokkan status, pemeriksaan, sambungan, uji, kesimpulan, dan hadiah. Reset memiliki epoch baru dan mempertahankan hadiah pertama. Cadangan v7 menambah key M17-E1 di store saves yang tetap berskema IndexedDB 1. Impor v1–v6 mempertahankan episode yang tidak tercakup; impor trial v7 lebih lama tetap menggabungkan riwayat hadiah secara monoton. Bab M17 tidak memiliki flag completed dari episode ini: pada tahap E1 UI masih menampilkan Dalam pengembangan. Kini status dihitung dari ketiga episode.

Panel `workshopUI.ts` mengikuti dialog samping/bawah lama. Perakitan dapat memakai dua terminal berurutan atau daftar pasangan, tanpa presisi drag. Keyboard, sentuh, dan ukuran IFP memakai kontrol proyek. Lihat [laporan pemeriksaan W06](workshop-circuit-review.md). Setelah kode final, gunakan jalur persiapan untuk memperbarui dist secara aman agar launcher klik ganda membuka build terbaru.


## M17-E2 dan halaman daur ulang W06

`electromagnetContent` memisahkan materi, dataset 2/4/6, enam ID, dan terminal. `electromagnetModel` mengevaluasi sumber/sakelar/lintasan tersendiri. `electromagnetMission` memeriksa prosedur dan bukti; parser memutar ulang riwayat, termasuk bukti hadiah pertama. `craneState` memegang transaksi benda, posisi, pengangkatan dan pengiriman. `electromagnetSession` memakai delta dari render loop World yang sama, tanpa listener/renderer baru. `electromagnetWorld` memvisualisasikan state; `electromagnetUI` mengelola panel dan instruksi.

Batas W06 diperluas hingga x=33, titik pendekatan dan footprint sesuai meja/derek diuji antarsemua stasiun. Bay derek merupakan penghalang navigasi terbuka; kamera hanya memperhitungkan tiangnya, bukan kotak udara penuh. Saat panel derek terbuka, kamera yang sama membidik bay dengan sudut pengguna dan bingkai yang memuat lebar alat pada layar potret; preferensi jarak tetap, saat ditutup, kembali membidik pemain.

IndexedDB tetap skema 1, store saves menambah key `M17-E2`. Cadangan **v8** menerima format **1–7**, mempertahankan episode yang tidak dicakup dan hadiah yang sudah diperoleh. Reload/import/keluar wilayah mengembalikan klip dibawa ke baki, mematikan sumber, dan menjaga yang sudah terkirim. Reset hanya episode ini. Pada tahap E2 status M17 masih Dalam pengembangan; kini dihitung dari ketiga episode. S11 tidak diselesaikan.

Pemeriksaan dan bukti mutakhir: [workshop-electromagnet-review.md](workshop-electromagnet-review.md). Rekaman produksi dapat diulang dengan `node scripts/capture-electromagnet-evidence.mjs` setelah build dan pengambilan fixture browser. Peluncur harian tetap server statis localhost:5173; jalur persiapan mempromosikan build baru hanya setelah berhasil.


## M17-E3 dan status bab M17

`energyModel` memisahkan daya tersedia dari energi integer mWh dan transaksi interval. `energyMission` memegang prediksi, catatan, percobaan rencana, parser replay dan bukti hadiah. `energySession` memakai loop World yang sama; pembatalan tidak mengubah energi permanen. `energyWorld` dan `energyUI` memakai model yang sama untuk objek, pratinjau, tabel dan grafik. `m17ChapterStatus` hanya membaca completed ketiga episode, tanpa hadiah atau flag bab tersimpan.

W06 diperluas ke utara hingga z=-32; semua titik pendekatan lama/baru diuji antarstasiun. Konektor DC berpasangan mencakup jalur pergi/kembali dan pengatur yang cocok, sehingga episode berfokus pada sumber/penyimpan, bukan mengulang puzzle kabel panjang E1. Model E1/E2 dan catatan historisnya dipertahankan.

Rekaman M17-E3 ditambahkan pada IndexedDB skema 1; cadangan v9 menerima v1–v8 dan mempertahankan episode yang tidak tercakup. Runtime dibatalkan saat reload, suplai dimatikan, tetapi energi dan interval sah tetap ada. Retry uji rencana memulai percobaan baru dari 2 Wh tanpa menghapus hasil awal. Rincian dan bukti: [workshop-energy-review.md](workshop-energy-review.md).


## W05 / S16 — Pesisir

`coastalContent.ts` memisahkan lima kelompok, lima hubungan berarah dan tiga kartu dari `coastalMission.ts` (transaksi bukti dan replay validator), `coastalRegion.ts` (wilayah/jalur), `coastalWorld.ts` (model dan animasi) dan `coastalUI.ts` (pengamatan, jurnal, papan dan kasus). Hanya loop World, FollowCamera, input dan HUD perahu lama yang dipakai. `BoatController.configure` memulihkan runtime kendaraan sebelum mengganti konfigurasi dermaga. `boatModel.ts` dipakai W04 dan W05.

W05 dibagi tepian pantai dan titik predator, dihubungkan hanya dengan perahu. Navigasi darat membatasi laut; navigasi kendaraan memakai radius lambung 1,65 dan sweep gerakan lama. Pengamatan memerlukan jarak di darat, membuka specimen, memilih ciri/peran, lalu Catat. Kamera inspeksi sementara memakai target baru tanpa mengubah preferensi jarak. Pada reload dan transisi, kendaraan diparkir aman; sumber daya region lama dilepas, sementara geometri/material rig bersama tetap dilindungi.

IndexedDB tetap skema 1, key S16 ditambahkan dalam transaksi sepuluh misi. Cadangan v10 menerima v1–v9; versi lama tidak menghapus S16. Validator mengulang riwayat untuk menolak pengamatan/tautan ganda, urutan bukti keliru, klaim selesai/hadiah tanpa bukti. Reset mempertahankan receipt hadiah pertama. Status M17 tetap berasal dari completed E1/E2/E3, terpisah dari S16. Laporan dan bukti: [coastal-foodweb-review.md](coastal-foodweb-review.md).
