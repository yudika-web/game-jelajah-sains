# Jelajah Sains

Prototipe petualangan IPA SMP berbasis **Vite, TypeScript, dan Three.js**. Irisan pertama: satu blok Kota Sains, avatar manusia balok, Bu Nara, Pak Wira, buku, catatan hujan, dua titik sampel, dan misi **M01 Detektif Air Kota**.

Penyempurnaan karakter dan kamera: jaket berlapis, ransel, rambut geometris, tangan/sepatu bervolume, sendi siku/lutut, animasi berdasarkan perpindahan nyata, serta NPC dengan identitas dan gestur berbeda. Lihat [perbandingan visual dan rekaman gerak](docs/character-camera-review.md).

## Menjalankan

Gunakan Node.js 24 LTS (minimum 22.12) dan npm. Tidak memerlukan API key, akun, database server, atau aset CDN.

```sh
cd /workspace/game-jelajah-sains
npm ci --cache /tmp/jelajah-npm
npm run dev
```

Dev server memakai port **5173**, bind `0.0.0.0`, dan tidak berpindah port otomatis. Buka alamat server melalui browser yang mendukung WebGL 2. Untuk HP di LAN, gunakan alamat IP laptop/server pada port 5173; perangkat harus berada di jaringan yang sama dan firewall harus mengizinkannya. Perubahan alamat/origin membuat penyimpanan browser terpisah: ekspor cadangan sebelum berpindah alamat. Akses LAN antarperangkat belum diuji pada mesin cloud ini.

```sh
npm test          # aturan bukti M01, validasi cadangan, navigasi
npm run build     # TypeScript + bundle produksi di dist/
npm run preview   # periksa bundle produksi di port 4173
npm run test:e2e  # Chromium: misi lengkap, input, simpan, fallback
```

E2E menggunakan Chromium sistem di `/usr/bin/chromium`. Di komputer lain, atur `CHROMIUM_PATH` ke executable Chromium yang terpasang. Pengujian memakai SwiftShader agar WebGL dapat diperiksa tanpa GPU. Ini bukan pengukuran performa perangkat sekolah. Playwright menjalankan dev server sendiri bila port belum digunakan.

## Cara bermain

Pilih mode perangkat pada layar pembuka, lalu **Mulai menjelajah**. Setiap langkah pada kartu misi atau lokasi di **Peta** dapat dipilih untuk berjalan otomatis; avatar benar-benar menempuh jalur yang menghindari bangunan dan sungai. Tidak ada teleportasi atau kebutuhan melompat pada rute M01.

| Tindakan | Laptop | HP | IFP |
| --- | --- | --- | --- |
| Berjalan | WASD / panah | Analog kiri | Ketuk tanah, pilih lokasi di Peta, atau analog besar |
| Kamera | Seret dunia; R mengembalikan arah | Seret dunia, terpisah dari jari analog | Tombol putar kiri/kanan; mengikuti otomatis |
| Interaksi | E / tombol aksi | Tombol aksi / ketuk label | Ketuk label atau Peta lalu Aksi; panel terbuka saat tiba |
| Jurnal / Tas / Peta | J / I / M | Tombol bawah | Tombol besar bawah |
| Jeda | Esc / Pengaturan | Pengaturan | Pengaturan |

Membuka dialog atau jurnal menghentikan gerakan. Pergantian tab, kehilangan fokus, pointer cancel, dan pelepasan analog menghentikan input. **Kembali ke Pos** tersedia di Pengaturan tanpa menghapus bukti. Layar penuh opsional; bila ditolak browser, permainan tetap berjalan.

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

## Penyimpanan

Progres M01, sumber jurnal, rencana, data, upaya kesimpulan, dan hadiah disimpan otomatis ke **IndexedDB**. Tas diturunkan dari status misi sehingga botol dan alat tidak berganda. Setelah memuat ulang, progres dilanjutkan dan avatar kembali ke pos. Waktu simpan muncul di kiri bawah; status gagal simpan ditampilkan secara eksplisit.

**Pengaturan → Ekspor cadangan / Impor cadangan** menyediakan JSON berversi. Impor menggantikan progres setelah format dan konsistensinya diperiksa. **Ulangi penyelidikan** meminta konfirmasi; ekspor dahulu bila ingin menyimpan hasil lama. Bila pembacaan penyimpanan gagal, aplikasi tidak menimpa data lama secara otomatis; gunakan cadangan atau mulai ulang secara eksplisit.

## Struktur

```text
src/
  data/content.ts       lokasi, kartu pengetahuan, pilihan kesimpulan
  engine/world.ts       Three.js, avatar, kota, kamera, interaksi raycast
  engine/character.ts   model bersendi, penampilan, titik label dan alat
  engine/characterAnimator.ts napas, langkah, gestur dan interpolasi sendi
  engine/cameraController.ts kamera mengikuti, jarak, framing, jarak aman tembok
  engine/input.ts       keyboard, multi-pointer, analog, pemulihan input
  engine/navigation.ts grid rute aman, batas kota, tabrakan bangunan/air
  game/mission.ts       transisi M01 dan validasi progres, bebas dari renderer
  game/storage.ts       transaksi IndexedDB
  game/preferences.ts   preferensi tampilan terpisah dari progres misi
  main.ts              panel UI dan integrasi sistem
  style.css            UI responsif laptop, HP, IFP
tests/                 unit dan pengujian browser
docs/rancangan-game.md rancangan asli yang diberikan pengguna
docs/development.md    lingkup prototipe dan pengembangan berikutnya
docs/evidence/         gambar pembanding dan rekaman WebGL
scripts/capture-character-evidence.mjs  pengambilan bukti visual yang dapat diulang
```

Seluruh model dibuat dari geometri lokal orisinal; teks, font sistem, dan pustaka dibundel. Bundle produksi tidak memerlukan internet setelah disajikan oleh server lokal. Belum ada service worker/PWA: membuka berkas `index.html` langsung melalui `file://` bukan cara menjalankan yang didukung.

## Batas prototipe

Belum mencakup wilayah lain, lompat/berenang, kendaraan, audio, variasi avatar, mode guru/dasbor, pengiriman nilai, atau multiplayer. Browser tanpa WebGL 2 mendapat materi 2D dan petunjuk pemulihan; itu bukan petualangan 3D. Ukuran tombol, keterbacaan kelas, FPS, dan akses LAN perlu diperiksa pada HP serta panel IFP fisik sebelum penggunaan kelas. Tidak ada data siswa yang dikirim ke server.
