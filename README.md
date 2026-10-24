# Jelajah Sains

**W03 Rimba dan Gambut — Bantu Pos Rimba (W03-LOG01)** sudah dapat dimainkan: pengangkutan air dengan ember/gerobak, perbaikan roda, jurnal perjalanan, dan pemulihan habitat. [Cara bermain, aturan, dan bukti hasil](docs/rimba-logistics-review.md).

Gerak mendukung **Jalan 5,2 / Lari 8,0 unit/detik**: tahan Shift pada laptop, atau pilih Jalan/Lari pada HP dan IFP. Lihat [laporan gerak, konfigurasi, dan cuplikan browser](docs/running-review.md).

Patch karakter terbaru memakai avatar balok enam bagian sesuai acuan **Karakter Balok Sederhana**. Tinggi siswa/siswi 1,60 unit, Bu Nara 1,70, Pak Wira 1,75, Bu Sari 1,68; ukuran dinormalisasi satu kali dari geometri netral. Lihat [laporan proporsi, sebelum/sesudah, dan pengujian](docs/block-avatar-review.md).

Prototipe petualangan IPA SMP berbasis **Vite, TypeScript, dan Three.js**. Tiga wilayah yang terhubung: **W01 Kota Sains / M01 Detektif Air Kota**, **W02 Kebun Kehidupan / M14 Kebun Percobaan**, dan **W03 Rimba dan Gambut / W03-LOG01 Bantu Pos Rimba**. M14 dapat dimainkan dari menerima benih hingga membandingkan hasil pertumbuhan enam tanaman.

Fondasi kamera dan gerak tetap mencakup langkah berdasarkan perpindahan nyata, putaran halus, serta gestur NPC. [Laporan tahap sebelumnya](docs/character-camera-review.md) disimpan sebagai riwayat; model terbaru menggunakan enam balok dan socket alat sesuai laporan patch di atas.

Model acuan tiga sisi terdahulu dan perbandingannya tersedia pada [arsip pemeriksaan model](docs/reference-model-review.md). Gambar tersebut mendokumentasikan tahap sebelum penyederhanaan avatar balok terbaru.

Varian siswi dapat dimainkan dengan menambahkan `?avatar=siswi` pada alamat server (misalnya path `/?avatar=siswi`). Pilihan ini tidak mengubah progres; hilangkan parameter untuk memakai siswa. Tautan galeri mempertahankan varian ketika kembali ke permainan. Tidak ada onboarding avatar tambahan.

Untuk memeriksa model secara langsung, buka **Pengaturan → Galeri karakter · tiga sisi**. Galeri menampilkan model 3D yang sama dari depan, samping, dan belakang secara bersamaan, dengan tombol detail wajah serta pilihan siswa/siswi/Bu Nara/Pak Wira/Bu Sari/Pak Damar. Galeri memakai pose diam agar bentuk dapat dinilai. Halaman `character.html` disertakan dalam build produksi.

## Menjalankan

Gunakan Node.js 24 LTS (minimum 22.12) dan npm. Tidak memerlukan API key, akun, database server, atau aset CDN. Setelah mengunduh ZIP, ekstrak dan buka terminal di folder yang memuat `package.json`.

```sh
npm ci
npm run dev
```

Pada lingkungan cloud ini, repositori berada di `/workspace/game-jelajah-sains`; bila cache npm bawaan tidak dapat ditulis, gunakan `npm ci --cache /tmp/jelajah-npm`.

Dev server memakai port **5173**, bind `0.0.0.0`, dan tidak berpindah port otomatis. Buka alamat server melalui browser yang mendukung WebGL 2. Untuk HP di LAN, gunakan alamat IP laptop/server pada port 5173; perangkat harus berada di jaringan yang sama dan firewall harus mengizinkannya. Perubahan alamat/origin membuat penyimpanan browser terpisah: ekspor cadangan sebelum berpindah alamat. Akses LAN antarperangkat belum diuji pada mesin cloud ini.

```sh
npm test          # M01/M14/Rimba, air, perjalanan, cadangan, navigasi, karakter
npm run build     # TypeScript + bundle produksi di dist/
npm run preview   # periksa bundle produksi di port 4173
npm run test:e2e  # Chromium: misi lengkap, input, simpan, fallback
```

E2E menggunakan Chromium sistem di `/usr/bin/chromium`. Di komputer lain, atur `CHROMIUM_PATH` ke executable Chromium yang terpasang. Pengujian memakai SwiftShader agar WebGL dapat diperiksa tanpa GPU. Ini bukan pengukuran performa perangkat sekolah. Playwright menjalankan dev server sendiri bila port belum digunakan.

## Cara bermain

Pilih mode perangkat pada layar pembuka, lalu **Mulai menjelajah**. Pilihan **Misi aktif** pada kartu misi mengganti petunjuk dan jurnal M01/M14/W03-LOG01. Ketiganya dapat dijalankan bergantian. Buka Peta Kota → Ke Kebun Kehidupan, berjalan menuju gerbang, lalu pilih Masuk. Peta Kota → Ke Rimba dan Gambut membuka episode Pos Rimba. Kedua wilayah menyediakan gerbang kembali ke Kota; M01 tidak harus selesai atau diterima dahulu. Setiap langkah pada kartu misi atau lokasi di **Peta** dapat dipilih untuk berjalan otomatis; avatar benar-benar menempuh jalur yang menghindari bangunan dan sungai. Tidak ada teleportasi atau kebutuhan melompat pada rute M01.

| Tindakan | Laptop | HP | IFP |
| --- | --- | --- | --- |
| Berjalan | WASD / panah | Analog kiri | Ketuk tanah, pilih lokasi di Peta, atau analog besar |
| Berlari | Tahan Shift kiri/kanan sambil bergerak | Toggle **Jalan / Lari**, lalu analog | Toggle **Jalan / Lari**, lalu ketuk tujuan / pilih Peta |
| Kamera | Seret dunia; R mengembalikan arah | Seret dunia, terpisah dari jari analog | Tombol putar kiri/kanan; mengikuti otomatis |
| Interaksi | E / tombol aksi | Tombol aksi / ketuk label | Ketuk label atau Peta lalu Aksi; panel terbuka saat tiba |
| Jurnal / Tas / Peta | J / I / M | Tombol bawah | Tombol besar bawah |
| Gerobak Rimba | Bengkel → Dorong; WASD/Shift; kembali ke Bengkel → Parkir | Tombol Bengkel/Tas → Parkir; analog + toggle | Tujuan Peta/kartu; tombol Dorong/Parkir |
| Jeda | Esc / Pengaturan | Pengaturan | Pengaturan |

Jalan **5,2 unit/detik**, lari **8,0 unit/detik**, tanpa stamina. Saat mendorong gerobak, kecepatannya **3,4 / 4,2 unit/detik** dengan ruang tabrakan lebih lebar. Parkir mengembalikan gerak biasa. Dorongan analog kecil memberi kecepatan proporsional. Shift/toggle sendiri tidak menggerakkan pemain. **Berhenti** atau input manual membatalkan perjalanan otomatis. Saat memilih tujuan dari Peta, mode sebelum membuka peta dipakai untuk rute itu.

Membuka dialog, jurnal, menu jeda, mengganti kontrol/wilayah, atau kembali ke pos menghentikan gerakan dan mengembalikan mode Jalan. Sesudah ditutup, diperlukan input baru. Mode lari tidak disimpan dalam progres. Melepas analog hanya menghentikan gerakan; pilihan Jalan/Lari tetap berlaku sampai salah satu jeda tersebut. Pergantian tab, kehilangan fokus, pointer cancel, dan pelepasan analog menghentikan input. **Kembali ke Pos** tersedia di Pengaturan tanpa menghapus bukti. Layar penuh opsional; bila ditolak browser, permainan tetap berjalan.

**Pengaturan → Jarak kamera** menyediakan Dekat (8,5 unit), Normal (10,8), dan Jauh (14). Pilihan jarak, pengurangan gerakan, serta resolusi rendah disimpan terpisah dari penyelidikan, melalui preferensi lokal browser. R mengembalikan sudut pandang yang nyaman tanpa mengganti pilihan jarak. Kamera manual tetap dipertahankan ketika karakter berbelok. Panel misi awalnya menampilkan langkah aktif; tombol **+** atau **Lihat semua langkah** membuka seluruh daftar.

Saat berbicara/membaca/mengukur, panel ditempatkan di sisi layar lebar atau bagian bawah layar potret. Karakter tetap terlihat, dengan pose dan alat yang sesuai. Berjalan berhenti selama panel terbuka, tetapi animasi interaksi tetap berjalan; pengurangan gerakan menghentikan ayunan idle, kedipan, dan langkah dekoratif.

## Menuntaskan M01

1. Temui **Bu Nara** dan terima misi serta alat pinjaman.
2. Catat pendapat **Pak Wira** sebagai dugaan, bukan fakta.
3. Baca dan catat **Buku Sains** serta **Catatan hujan**.
4. Di titik sampel, pilih **alat kekeruhan virtual**, **lokasi pengambilan** sebagai variabel yang dibandingkan, dan **kondisi hujan serta waktu yang sama**. Ukur kedua sampel: **A 70**, **B 20**.
5. Di **Tempat uji**, pasang model penahan sedimen. Hujan simulasi sama menghasilkan **A 35**. Susunan penahan juga muncul di dunia 3D.
6. Kembali ke **Bu Nara**, lalu pilih kesimpulan tentang kontribusi sedimen dan keterbatasan bukti. Kesimpulan keliru diberi umpan balik dan dapat diperbaiki. Upaya awal tetap tercatat; hadiah 100 XP hanya sekali.

Angka adalah **indeks model 0–100, bukan NTU**. Dua sampel menggunakan sesi hujan simulasi 09.00, bukan jam nyata. Kekeruhan yang turun **tidak membuktikan air aman diminum**. Materi prototipe masih memerlukan telaah guru.

## Menuntaskan M14

1. Masuk Kebun lewat gerbang Kota. Temui **Bu Sari**, lalu terima M14.
2. Baca **Buku tumbuhan** dan **Catatan Bu Sari**. Di Bu Sari, pilih rencana: ubah air saja, kondisi lain sama, A 100 mL / B 50 mL per tanaman per hari.
3. Ambil enam benih, penyiram, dan penggaris di **Benih & alat**. Tanam tiga benih kacang hijau di setiap petak.
4. Catat kondisi awal hari 0 memakai **Ukur Kelompok** pada kedua petak. Isi penyiram di **Tandon air**: kapasitas 1.000 mL, persediaan awal 5.000 mL.
5. Hari 0–5: siram A total 300 mL dan B total 150 mL. Isi ulang bila kurang. Pada hari 0, 2, dan 4, ukur kedua kelompok sebelum melanjutkan hari di **Meja hasil**. Hari 6 hanya pengukuran akhir.
6. Periksa tabel/grafik yang berasal dari pengukuran sendiri. Hari 6: rata-rata A **8 cm**, B **5 cm**. Simpulkan di Meja hasil atau bersama Bu Sari, pilih bukti dan keterbatasan yang sesuai.

Jumlah air dan tinggi adalah **data buatan model pembelajaran**, bukan hasil eksperimen nyata atau anjuran penyiraman. Lebih banyak air tidak selalu lebih baik; dosis lain dan jenis tanaman lain belum diuji. Waktu nyata tidak menumbuhkan tanaman. Refleksi bebas disimpan lokal untuk dibaca guru, tanpa penilaian kata kunci atau pengiriman otomatis.

**Ulangi Percobaan M14** di Pengaturan meminta konfirmasi, lalu mereset percobaan saja. M01, sumber yang sudah dibaca, dan riwayat hadiah pertama tetap ada. Hadiah M14 maksimal 100 XP, termasuk setelah ulang, muat ulang, dan pemulihan cadangan lama pada perangkat ini.

Lihat [catatan implementasi, pengujian, dan gambar Kebun](docs/garden-review.md).

## Menuntaskan Bantu Pos Rimba

Pilih **W03** lalu gunakan gerbang penjaga hutan dari Kota. Terima tugas Pak Damar, baca peta aman dan dua sumber pengetahuan. Periksa A/B, catat kebutuhan C dari peta, lalu pilih total **24 L**. Ambil/bawa ember **4 L**, atau ambil roda dan alat, pasang roda, lalu dorong gerobak **12 L**.

Isi wadah di tandon, bawa melalui dunia 3D, lalu tuangkan jumlah terpilih ke A **8 L**, B **6 L**, C **10 L**. Minta konfirmasi jalur C kepada Pak Damar setelah mulai mengirim A/B. Semua jumlah memakai kelipatan 1 L, dengan pratinjau dan tombol maksimal. Kapasitas berbeda dari isi. Sisa air tetap berada di alat saat ditukar; air berlebih dapat dikembalikan ke sumber. Sumber akhir **16 L**, kedua alat kosong, neraca keseluruhan tetap **40 L**.

Jurnal mencatat transfer serta perjalanan nyata. Setelah pengiriman, pilih kesimpulan berbukti, baca papan habitat, terima laporan petugas, dan pilih restorasi tumbuhan lokal. Hadiah pertama **100 XP** tidak berulang setelah reset atau impor. Air latihan bukan kebutuhan pemadaman nyata; petugas menangani kebakaran, dan area terdampak tidak menjadi jalur pemain. Tidak ada batas waktu. Lihat [panduan lengkap dan bukti](docs/rimba-logistics-review.md).

## Penyimpanan

Progres disimpan otomatis ke **IndexedDB `jelajah-sains`, skema 1**, object store `saves`. Rekaman `M01` lama dipertahankan; rekaman `M14`, `W03-LOG01`, dan `world` menyimpan Kebun, logistik Rimba, serta wilayah/misi aktif. Ketiga misi ditulis dalam satu transaksi. Muat ulang mempertahankan hari, petak, air, data, dan hadiah; pemain ditempatkan pada pos aman wilayah terakhir. Preferensi kamera/kontrol tetap terpisah.

**Pengaturan → Ekspor cadangan / Impor cadangan** menyediakan format cadangan **versi 3** berisi ketiga misi dan wilayah. Versi cadangan berbeda dari versi skema IndexedDB. Cadangan M01 **versi 1** tetap diterima: impor menjelaskan bahwa hanya M01 dipulihkan dan M14/Rimba yang ada dipertahankan. Cadangan gabungan **versi 2** memulihkan M01/M14 dan wilayah, sambil mempertahankan Rimba. Impor diperiksa sebelum mengubah progres; nilai air negatif, melebihi kapasitas, data masa depan, neraca air/transfer yang tidak konsisten, atau hadiah yang tidak konsisten ditolak.

Status sukses tampil setelah transaksi selesai. Bila pembacaan penyimpanan gagal, data lama tidak ditimpa otomatis. Cadangkan sebelum membersihkan browser atau berganti alamat/origin. **Ulangi penyelidikan M01**, **Ulangi Percobaan M14**, dan **Ulangi Latihan Pos Rimba** adalah tindakan terpisah dengan konfirmasi masing-masing.

## Struktur

```text
src/
  data/content.ts       lokasi dan pengetahuan M01
  data/regions.ts       lokasi, batas, penghalang, dan titik masuk tiap wilayah
  engine/world.ts       satu renderer, pertukaran wilayah, avatar dan raycast
  engine/gardenWorld.ts Kebun, pot/tanaman, tandon dan efek penyiraman
  engine/rimbaWorld.ts  pos Rimba, wadah, gerobak, roda dan perubahan lingkungan
  data/rimbaRegion.ts   jalur C, footprint dan konfigurasi kecepatan gerobak
  engine/character.ts   model bersendi, penampilan, titik label dan alat
  engine/characterModel.ts enam balok, tekstur canvas lokal, rambut dan ransel
  engine/characterConfig.ts tinggi absolut, target kamera dan dimensi lingkungan
  engine/characterAnimator.ts napas, langkah, gestur dan interpolasi sendi
  engine/cameraController.ts kamera mengikuti, jarak, framing, jarak aman tembok
  engine/input.ts       keyboard, multi-pointer, analog, pemulihan input
  engine/navigation.ts grid rute aman, batas kota, tabrakan bangunan/air
  game/mission.ts       transisi M01 dan validasi progres, bebas dari renderer
  game/gardenMission.ts aturan M14, air, hari, pertumbuhan, validasi
  game/gardenUI.ts      kegiatan kebun, jurnal, tabel dan grafik
  game/rimbaMission.ts  aturan logistik, transfer atomik, perjalanan dan validasi
  game/rimbaSession.ts  pengukuran gerak nyata dan batas perjalanan sumber
  game/rimbaUI.ts       materi, transaksi, jurnal dan kesimpulan Pos Rimba
  game/gameState.ts     keadaan wilayah, cadangan v3 dan kompatibilitas v1/v2
  game/storage.ts       transaksi IndexedDB atomik ketiga misi
  game/preferences.ts   preferensi tampilan terpisah dari progres misi
  main.ts              panel UI dan integrasi sistem
  style.css            UI responsif laptop, HP, IFP
  characterGallery.ts  galeri model diam dengan tiga kamera ortografis
tests/                 unit dan pengujian browser
docs/rancangan-game.md rancangan asli yang diberikan pengguna
docs/development.md    lingkup prototipe dan pengembangan berikutnya
docs/evidence/         gambar pembanding dan rekaman WebGL
scripts/capture-character-evidence.mjs  pengambilan bukti visual yang dapat diulang
scripts/capture-reference-model.mjs    gambar model terbaru dan tampilan perangkat
scripts/capture-garden-evidence.mjs     bukti tambahan Kebun pada build produksi
scripts/capture-block-avatar.mjs        bukti karakter/proporsi pada kamera pembanding
```

Seluruh model dibuat dari geometri lokal orisinal; teks, font sistem, dan pustaka dibundel. Bundle produksi tidak memerlukan internet setelah disajikan oleh server lokal. Belum ada service worker/PWA: membuka berkas `index.html` langsung melalui `file://` bukan cara menjalankan yang didukung.

## Batas prototipe

Belum mencakup wilayah di luar tiga wilayah ini, lompat/berenang, kendaraan selain gerobak, audio, kustomisasi avatar selain siswa/siswi, mode guru/dasbor, pengiriman nilai, atau multiplayer. Browser tanpa WebGL 2 mendapat materi 2D dan petunjuk pemulihan; itu bukan petualangan 3D. Ukuran tombol, keterbacaan kelas, FPS, dan akses LAN perlu diperiksa pada HP serta panel IFP fisik sebelum penggunaan kelas. Tidak ada data siswa yang dikirim ke server.
