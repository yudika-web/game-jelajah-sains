# Catatan pengembangan prototipe 0.1

Pemeriksaan gerak terbaru tersedia di [Patch respons gerak dan lari](running-review.md). Pemeriksaan karakter terbaru tersedia di [Patch avatar balok dan ukuran absolut](block-avatar-review.md). Bagian penyempurnaan karakter dan kamera di bawah mencatat fondasi tahap sebelumnya.

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
