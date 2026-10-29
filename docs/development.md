# Catatan pengembangan prototipe 0.1

## Visual tahap 04 — stasiun dan instrumen W08

`spaceStation.ts` membatch interior, sedangkan `spaceSurfaces.ts` memakai peta lokal dan arah cahaya astronomi. `SpaceInstrumentCamera` mengatur pose sementara pada kamera World; tidak menulis preferensi kamera eksplorasi. Preset Normal/Rendah menukar LOD yang dimiliki wilayah. `disposeRegion` kini juga melepas tekstur uniform shader dan LOD yang belum terpasang, sekali saja, tanpa menyentuh cache avatar. Model astronomi, sesi waktu, bukti M07, IDB dan cadangan v18 tidak berubah. [Laporan, aset, perbandingan dan hasil](visual-stage-04-review.md).

## Visual tahap 03

Katalog terpusat `appearanceCatalog.ts` memisahkan varian awal dan lima slot. `appearance.ts` memvalidasi ID/kategori serta fallback. `characterModel.ts` tetap pembangun tunggal; tubuh siswa dinormalisasi tanpa kosmetik, dan `setTemporaryEquipment` menyediakan override sementara. Lemari `wardrobeUI.ts` memakai preview studio `wardrobePreview.ts` pada renderer/loop World yang sama. Peta Kota memiliki kabinet; menu Pengaturan menyediakan Penampilan. Terapkan menunggu transaksi simpan, Coba/Batal tidak menulis penampilan.

Cadangan mutakhir **v18** memuat penampilan, seluruh **v1–v17** tetap diterima. IndexedDB tetap skema 1, ditambah key `appearance`; reset misi tidak menyentuhnya. URL siswa/siswi hanya menjadi default ketika belum ada rekaman. Galeri membaca key itu tanpa menulis misi. Bagian versi lama di bawah adalah catatan historis. [Laporan, katalog dan bukti](visual-stage-03-review.md).

## Visual tahap 02

`townEnvironment.ts` membangun detail Kota, batching statis, objek ber-ID dan tiga kegiatan dekoratif. Dipanggil satu kali saat membangun Kota dan diperbarui oleh loop World; tidak mengubah aturan misi. Kamera meja memakai slab tabletop; collider navigasi tetap. Label Kota dibatasi jarak dan piksel. Kualitas Rendah menyembunyikan satu pejalan dan bunga opsional; reduced motion/jeda membekukan aktivitas. [Laporan](visual-stage-02-review.md) memuat bukti dan batas pemeriksaan. Cadangan tetap v17.

## Visual tahap 01

Lihat [laporan diagnosis dan bukti](visual-stage-01-review.md) serta [arah visual dan urutan tahap](visual-upgrade-plan.md). `groundLayout.ts` menetapkan sambungan tanah W03/W06 tanpa dua permukaan atas koplanar. `environmentStyle.ts` memusatkan nilai cahaya/material lama dan batas DPR Normal/Rendah. Tidak ada perubahan format cadangan v17, IndexedDB, data misi, ukuran dunia, kamera, atau kepemilikan cache avatar. Untuk reproduksi: build baseline 41fae90 lalu `node scripts/capture-visual-stage-01.mjs before`; build patch lalu jalankan dengan `after`. Perintah menangkap build `dist`, bukan dev server. Jangan menimpa bukti before dengan build after.

Misi pasar terbaru tersedia di [W01 / M02 Persediaan Es Pasar](market-ice-review.md). Wilayah terbaru tersedia di [W08 / M07 Catatan dari Observatorium](space-observatory-review.md). Geopark tersedia di [W07 / M13](geopark-review.md). Episode ponton tersedia di [M16-E4 / Ponton Pengangkut Peralatan](pontoon-buoyancy-review.md). Fondasi tekanan air tersedia di [M16-E1 / ROV Tekanan Bawah Air](underwater-pressure-review.md). Wilayah pesisir tersedia di [W05 / S16 Jaring Kehidupan Pesisir](coastal-foodweb-review.md). Episode energi tersedia di [W06 / M17-E3 Energi untuk Pos Riset](workshop-energy-review.md). Episode elektromagnet tersedia di [W06 / M17-E2 Derek Elektromagnet](workshop-electromagnet-review.md). Episode rangkaian tersedia di [W06 / M17-E1 Nyalakan Lampu Pos Riset](workshop-circuit-review.md). Catatan W04 / S13 tersedia di [Catatan Ikan Dua Titik](river-fishing-review.md). Episode sebelumnya tersedia di [W03 Bantu Pos Rimba](rimba-logistics-review.md). Pemeriksaan gerak terbaru tersedia di [Patch respons gerak dan lari](running-review.md). Pemeriksaan karakter terbaru tersedia di [Patch avatar balok dan ukuran absolut](block-avatar-review.md). Bagian penyempurnaan karakter dan kamera di bawah mencatat fondasi tahap sebelumnya.

> Bagian M14 dan W03 di bawah mencatat keadaan ketika tahap tersebut dibuat. Format cadangan mutakhir adalah **v18**, dengan tujuh belas misi/episode dan delapan wilayah; rincian mutakhir ada pada bagian W01/M02.

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


## M16-E1 — ROV dan tekanan relatif

ROV beroperasi di volume terbatas W05, sementara akar pemain tetap di pos. Input horizontal lama dipakai dan Space/Q hanya dialihkan ketika ROV aktif. Target vertikal berubah 1 m; gerak memakai substep dan batas kecepatan 2,5 m/s horizontal, 1,5 m/s vertikal. `rovNavigation.ts` memakai grid 3D enam arah dengan penghalang yang diperluas sesuai radius konservatif 0,9 dan setengah tinggi 0,45 unit. Tiba tidak menandai Stabilkan atau Catat.

`pressureModel.ts` menghitung h dari tinggi sensor eksternal sebenarnya, bukan kamera/dasar. Sensor memiliki offset vertikal 0,12 unit dari akar robot. Permukaan y=-0,175; p=1025×10×h Pa. `pressureMission.ts` memisahkan kalibrasi nol relatif, variabel, tutorial, prediksi, sesi pembacaan, empat rekaman, kembali dok dan kesimpulan. `pressureSampling.ts` memakai delta World aktif; pembacaan tidak memakai jam nyata atau loop kedua.

Kamera FollowCamera yang sama mendapat tinggi target dan pengali jarak sementara; preferensi Dekat/Normal/Jauh tetap. Renderer, Scene dan regionRoot tetap satu. Aset dasar laut dimiliki W05 dan dilepas bersama region; update berhenti di wilayah lain. Reload/keluar wilayah memarkir robot serta membatalkan pembacaan belum disahkan. Key M16-E1 ditambahkan pada IndexedDB skema 1, cadangan v11 menerima v1–v10. Status M16 kini mengikuti completed keempat episode, status M17 tidak berubah. Bukti lengkap: [underwater-pressure-review.md](underwater-pressure-review.md).


## W06 / M16-E2 — Lift Hidraulik

`hydraulicContent.ts` memuat parameter, tiga luas keluaran dan materi. `hydraulicModel.ts` menghitung tambahan tekanan F/A, gaya, perpindahan setara volume serta usaha ideal dengan konversi SI eksplisit. Record memakai integer mm, mm³ dan mJ. Pengujian awal dan tantangan memakai fungsi hasil yang sama. Batas gaya tidak cukup menahan kedua piston; batas gerak menghasilkan kenaikan parsial yang tepat.

`hydraulicMission.ts` mengelola bukti, revisi transaksi, prediksi/perbaikan, percobaan, tantangan, kesimpulan dan receipt hadiah. Parser mereplay tindakan lalu memeriksa kesamaan keadaan serta hasil rumus; impor ditolak sebelum state aktif berubah. `hydraulicSession.ts` hanya memakai delta dari render loop World yang sudah ada, tanpa timer/renderer baru. Fokus dan visibility menghentikan waktu presentasi. Menutup panel atau reload memulihkan alat tanpa mencatat preview.

`hydraulicWorld.ts` memiliki geometri, material dan tekstur wilayah. Dua piston dan satu peti stable ID bergerak dalam SI, volume cairan visual tetap. Penampang radial diperbesar ×12 dengan label; tidak mengubah luas data atau jarak vertikal. `hydraulicUI.ts` memakai dialog dan kamera yang sama; diagram pembesaran menjelaskan gerak sentimeter. Tidak ada drag wajib. Kamera detail bersifat sementara dan tidak mengubah preferensi.

Batas W06 diperpanjang ke z=36, tanah, jalur, peta serta obstacle ikut diperbarui. Titik pendekatan seluruh stasiun baru dan lama diuji. RegionRoot lama tetap dibersihkan oleh World; aset karakter bersama tidak dilepas. Tidak ada wilayah atau misi baru selain episode ini.

IndexedDB tetap skema 1 dengan key M16-E2. Ekspor v12 berisi dua belas misi; v1–v11 tetap diterima dan mempertahankan episode yang tidak dicakup. Reset episode mempertahankan receipt hadiah pertama; Status M16 kini mengikuti completed keempat episode dan status M17 hanya memakai completed E1/E2/E3. Lihat [hydraulic-lift-review.md](hydraulic-lift-review.md).


## W03 / M16-E3 — Pijakan Aman Pos Rimba

`solidContent.ts` menyimpan ukuran, gaya tetap 400 N, batas media 6 kPa, jalur 30 cm dan materi. `solidModel.ts` menghitung luas dari ukuran, konversi cm²/m², p=F/A dan Pa/kPa. Result untuk tantangan C memisahkan tekanan referensi dari `observedPressurePa=null`, karena tidak melewati gerbang dan tidak terjadi kontak.

`solidMission.ts` memvalidasi penerimaan, tiga sumber, pemeriksaan gaya, ukuran A/B/C, variabel adil, pemasangan aman, prediksi, fase running/preview/observed/recorded serta reset media. `solidSession.ts` memakai delta World yang sama. Revisi menolak tindakan lama dan klik ganda. Parser mereplay bukti, menghitung hasil dari model, lalu membandingkan keadaan dan receipt hadiah pertama.

`solidWorld.ts` membangun maket, tiga penopang ber-ID tetap yang berpindah dari rak, satu beban, baki, penggaris serta gerbang ukur. Panjang/lebar penopang dan jalur memakai faktor ×3. Gerbang menghalangi C sebelum sisi depannya menembus pengukur; bebannya tetap terangkat. Tidak ada penghalang navigasi manusia selebar 30 cm. Seluruh meja menjadi obstacle darat; kamera memakai tinggi meja untuk menghindari pembingkaian dari dalam obstacle bangunan. Warna memproyeksikan bidang kontak di atas penopang, tanpa mengubah luas data. Tidak ada simulasi deformasi tanah numerik.

`solidUI.ts` memakai panel, input dan kamera yang sama. Seluruh langkah memakai tombol/daftar native, tanpa drag. Fokus/tab tersembunyi menghentikan presentasi; pembatalan, menu lain atau reload memulihkan beban dan media. Tidak ada loop/render/input kedua. Aset lokal dilepas bersama regionRoot Rimba.

Rimba diperpanjang sampai z=37; tanah, jalur, pagar, peta dan obstacle ikut diperbarui. Batas utara area api dan aturan jalur C logistik tetap. Navigasi diuji dengan radius karakter dan gerobak, memakai titik awal yang sah untuk masing-masing. Aturan air, kecepatan gerobak dan W03-LOG01 tidak diubah.

Key IndexedDB baru M16-E3 tetap pada skema 1, store saves. Cadangan v13 berisi tiga belas misi/episode dan menerima v1–v12, sambil mempertahankan misi baru yang tidak dicakup. Hadiah 50 XP sekali. Status M16 kini mengikuti completed keempat episode; M17 masih diturunkan hanya dari completed M17-E1/E2/E3. Lihat [solid-pressure-review.md](solid-pressure-review.md).


## W04 / M16-E4 — gaya apung dan integrasi bab Tekanan

`pontoonModel` menghitung berat, volume terendam, apung aktual/maksimum dan bacaan neraca dari parameter tunggal. `pontoonMission` memvalidasi replay persiapan, tiga neraca, tiga modul, pengiriman dan pembongkaran. `pontoonSession` memakai delta aktif World; `pontoonDelivery` mengelola jalur tetap dan envelope lambung, tanpa renderer/input baru. `pontoonWorld` memiliki satu benda uji 1 L, tiga modul dan satu perlengkapan ber-ID stabil. UI menyediakan daftar/tombol, penampang diperbesar, tabel dan jurnal.

W04 diperpanjang ke z=37, jalur penarik x=7/z=24…34. Navigasi darat membatasi air baru; perahu/kolam/irigasi lama tidak diubah. Seluruh aset dimiliki root wilayah dan dilepas bersama W04. Kamera detail memakai FollowCamera dan tidak mengubah preferensi pengguna. Batas 75%/1,2 m hanya latihan; tidak ada klaim keselamatan kapal nyata.

Key M16-E4 ditambahkan ke transaksi empat belas misi, IndexedDB skema 1. Cadangan v14 menerima v1–v13 dan mempertahankan episode yang tidak tercakup. `m16ChapterStatus` hanya menggunakan completed E1/E2/E3/E4; reset satu episode menurunkan status bab, receipt XP tidak menggantikannya. M17 tetap tiga episode; S14/S17 terpisah. Laporan dan hasil final: [pontoon-buoyancy-review.md](pontoon-buoyancy-review.md).


## W07 / M13 — Geopark

Wilayah ketujuh terhubung melalui geoTerminal W06 / geoReturn W07. Tidak ada kendaraan atau renderer/input baru. Geopark memakai karakter Kak Raka pada rig enam balok bersama dan sumber daya root wilayah. Model data, pose, aturan misi, presentasi, visual dan UI dipisahkan dalam geoparkContent/Region/Model/Mission/Session/World/UI.

Tiga checkpoint turunan dari bukti: urutan lapisan; tiga pengamatan meja; kedatangan sah setelah peta/penanda/pilihan jalur. Animasi sementara bukan bukti. Rute lama dibatalkan saat skenario mengaktifkan pagar; navigasi dan sweep memakai obstacle kondisi yang sama. Konfirmasi titik kumpul menerima koordinat sebenarnya dari World di main, bukan koordinat dari panel. Kembali ke pos tidak menghasilkan kedatangan.

Key M13 ditambahkan dalam transaksi lima belas misi, tetap IndexedDB skema 1. Cadangan v15 menerima v1–v14; yang tidak dicakup dipertahankan. Parser mereplay riwayat, memvalidasi hasil/urutan/posisi/hadiah. Reset hanya M13 dengan konfirmasi; receipt hadiah pertama dipertahankan. M16 dan M17 tetap mengikuti empat/tiga completed saat ini, S19/S20/S21 tidak otomatis selesai. Lihat [geopark-review.md](geopark-review.md) untuk batas model, kendala akses sumber primer dan pemeriksaan akhir.


## W08 / M07 — Observatorium

Wilayah kedelapan dicapai lewat observatory di Kota, memakai footprint pos pengamatan lama dan kubah lokal. spaceReturn kembali ke depan Observatorium. Bu Nara memakai rig bersama; tidak ada avatar atau kendaraan baru. Gerak avatar di dek adalah konvensi simulasi.

spaceContent/Region menyimpan parameter dan materi/dek; astronomyModel menghitung posisi, normal lokasi ekuator, arah Matahari serta observer dan fraksi terang (1+L·O)/2. Posisi perbani diselesaikan dari geometri tampilan, bukan gambar jawaban. spaceMission memvalidasi tiga checkpoint, motion/observation/record, jawaban dan receipt. spaceSession menerima delta aktif dari World, tanpa loop/timer/input global kedua. spaceWorld memakai shader pencahayaan mandiri dari vektor model, orbit lokal dan 256 bintang ringan. Pandangan dari Bumi memakai layer sementara kamera yang sama; preferensi eksplorasi tidak diubah.

Satu putaran memerlukan akumulasi gerak >=360.000 miliderajat; reset posisi mengosongkan penghitung, bukan menambah gerak. Empat posisi dan penjelasan tahun tetap wajib. Catatan sah disimpan terpisah dari trial sementara. Tutup, reload dan pindah wilayah membatalkan trial. Checkpoint dapat dikunjungi ulang tanpa duplikasi bukti.

IndexedDB tetap skema 1; key M07 ditambahkan dalam transaksi enam belas misi. Cadangan v16 menerima semua v1–v15 dan mempertahankan M07 yang tidak tercakup. Parser replay memeriksa geometri, urutan, jawaban dan hadiah. Reset hanya M07 dengan konfirmasi. M16/M17 tetap mengikuti empat/tiga completed saat ini; S22/S23/S24 tidak otomatis selesai.

Pelepasan root diekstrak ke disposeRegion dengan aturan kepemilikan lama ditambah Points. Ini mencegah geometri/material bintang tertinggal saat beralih wilayah; cache bersama karakter tetap dilindungi. Lihat [space-observatory-review.md](space-observatory-review.md) untuk sumber, batas model, uji dan bukti.

## W01 / M02 — Persediaan Es Pasar

`marketContent.ts` memisahkan parameter latihan dan materi. `marketModel.ts` menghitung massa, campuran, tara/bruto dan massa jenis. `marketMission.ts` mengelola urutan bukti, tiga checkpoint, satu paket ber-ID tetap, penyerahan dengan posisi dan receipt 100 XP. Parser replay memeriksa seluruh hasil sebelum impor. `marketSession.ts` hanya mengelola interpolasi memakai delta World; langkah tetap tersedia. `marketUI.ts` memakai dialog dan tombol/daftar yang sama. `marketWorld.ts` membangun meja, sampel, partikel H2O dan wadah pada root Kota; tidak menambah renderer, loop atau input global.

Pak Wira dan Bu Nara memakai karakter yang sudah tersedia, dengan dialog berdasarkan misi aktif. Navigasi Kota mencakup tapak meja, dengan titik interaksi di depannya. Kamera detail mengabaikan hanya kotak penghalang alat yang sedang diamati, menyembunyikan label selama pengamatan dan memulihkan penghalang kamera setelahnya. Preferensi jarak tidak berubah. Paket pada socket kanan mengikuti skala rig satu kali; bila alat kanan dipakai untuk interaksi lain, tampilan paket disimpan sementara dan kembali saat eksplorasi. Satu objek tetap dimiliki pemain; representasi rak/penerima saling eksklusif sesuai status.

Jarak membawa dikumpulkan dari substep perpindahan nyata sebelum callback kedatangan, lalu disahkan sebelum panel dibuka, blur atau perpindahan wilayah. Tidak ada pengurangan es berdasarkan waktu nyata. Pemeriksaan pada penerima menerapkan satu dataset distribusi tetap 20 menit virtual. Penyerahan menuntut paket, jarak membawa dan posisi sah; navigasi saja tidak menyerahkan. Reload/perpindahan wilayah/pemulihan mengembalikan paket belum diterima ke kios; bukti sah tetap.

Key M02 ditambahkan pada store IndexedDB skema 1, dalam transaksi atomik tujuh belas misi dan world. Cadangan **v17** menerima **v1–v16**, mempertahankan M02 yang tidak dicakup dan menggabungkan bukti hadiah pertama secara monoton. Nomor format cadangan berbeda dari skema database. M16/M17 dan S02/M03/S14 tidak berubah. Lihat [laporan dan batas model](market-ice-review.md).
