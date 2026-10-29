# Visual tahap 04 — Antariksa dan stasiun observasi

29 Oktober 2026 (Asia/Bangkok). Dikembangkan dari branch tahap 03, commit `6ba07e9`, bukan main lama. Branch kerja `feat/visual-stage-04`. AGENTS.md tidak ditemukan di proyek/induk. README, rancangan game, laporan M07, rencana visual, tahap 01–03, model astronomi, sesi, UI, kamera, pergantian wilayah dan resource diperiksa. Worktree awal bersih; rendering, Kota dan lemari dipertahankan.

## Cara mencoba

Kota → Peta → Observatorium / Antariksa → Masuk Simulasi Antariksa. Bu Nara memberi M07; baca buku dan catatan pada lokasi terpisah. Datangi konsol Rotasi, Revolusi atau Bulan.

- **Kamera & petunjuk tampilan** menyediakan Keseluruhan model, detail Bumi/penanda atau detail Bulan dari luar, serta nama benda/orbit/panah cahaya. Petunjuk berada pada tampilan keseluruhan; penanda ilmiah tetap ada saat detail.
- Pada rotasi, **Ikuti penanda Bumi** memperlihatkan lokasi penanda menghadap atau membelakangi sumber. Kamera mengitari model; posisi/bukti astronomi tidak dimodifikasi.
- Untuk fase, **Penampakan dari Bumi** adalah pandangan pengamatan yang sah. Detail Bulan dari luar hanya untuk inspeksi bentuk, bukan pengganti pandangan dari Bumi. Tombol kamera model dinonaktifkan selama pandangan Bumi aktif.
- Jalankan/Jeda/Langkah/Amati/Catat tetap terpisah. Tunggu kamera detail stabil sebelum Amati; pilihan Kurangi gerakan melewati transisi pose. Menutup alat memulihkan kamera eksplorasi dan memerlukan input baru.
- Pengaturan Rendah mengurangi segmen dan meniadakan halo/atmosfer; arah cahaya, bentuk, pengamatan dan catatan tetap sama.

## Implementasi visual

`spaceStation.ts` membangun ruang observasi dengan lantai panel terpisah, jalur cahaya, rangka sisi, jendela observasi, tiga konsol berbeda (roda kontrol rotasi, empat tombol posisi orbit dan optik Bulan), modul persiapan, kabinet dan pintu cadangan airlock. Atap disajikan sebagai potongan terbuka untuk kamera orang ketiga. Balok tengah yang pada iterasi awal menutupi avatar dihapus setelah gambar diperiksa. Pintu model 2,10 unit; tidak ada gerak luar stasiun/docking baru. Geometri statis dibatch menurut material. Buku berada pada konsol baca, catatan di meja, dan label kedekatan dibatasi ukuran piksel.

`spaceSurfaces.ts` memisahkan material astronomi dari cahaya dekoratif stasiun. Daratan Bumi memakai peta geografis lokal Natural Earth, bukan fungsi noise. Awan digabung dalam satu shader permukaan. Atmosfer adalah satu shell tipis backside dengan depth test dan tanpa depth write; hanya sisi yang mendapat cahaya diberi rim. Matahari memiliki variasi warna statis dan satu halo lemah. Bulan memakai variasi permukaan/kawah ilustratif, tanpa komponen terang dasar pada sisi yang tidak mendapat cahaya Matahari. Bumi memiliki lantai keterbacaan 0,8% pada shader, bukan data cahaya malam yang diukur. Bulan tidak memiliki cahaya sendiri. Gelapnya sisi malam tidak dipenuhi oleh lampu interior.

Bola Normal: Bumi/Matahari 64×40 segmen, Bulan 48×32. Rendah: 32×20 untuk ketiganya. LOD dibangun satu kali per wilayah dan digunakan ulang; perubahan kualitas tidak membuat bola baru per frame. Rangka melintang dan tiang memakai daftar koordinat Z yang sama agar tidak ada batang melayang. Bintang 256 titik deterministik, tidak berkedip. Jendela satu bidang ber-opacity rendah, tanpa dua permukaan bertumpuk. Lantai dan sambungan tidak koplanar. Tidak ada bloom, shadow map atau renderer/loop/input kedua.

Ketika instrumen aktif, stasiun dan Bumi dekoratif di latar disembunyikan agar tidak menutupi model. Ini merupakan tampilan alat dari scene/kamera/renderer yang sama. Preview lemari tetap menggunakan pembangun avatar yang sama, tidak dipengaruhi material astronomi.

## Model ilmiah dan penyimpanan

`astronomyModel.ts`, `spaceSession.ts`, parameter `astroConfig`, aturan/parser M07 dan format bukti tidak diubah. Posisi, penanda, arah cahaya dan fase tetap dibaca dari `astronomicalState`. Detail hanya mengubah presentasi kamera. Radius tampilan tetap Matahari 0,75, Bumi 0,35 dan Bulan 0,12; ukuran, jarak dan kecepatan **tidak berskala**.

Rotasi memutar penanda ekuator; revolusi tetap memerlukan empat posisi dan gerak terakumulasi sedikitnya 360°. Kamera fase berada pada sisi Bumi menuju Bulan. Fraksi terang dihitung dari arah Matahari–Bulan–pengamat; tidak memakai gambar jawaban terpisah. Gerhana/bayangan antarbenda tidak disimulasikan; orbit Bulan miring 5,1°. Fase biasa bukan bayangan Bumi.

Cadangan tetap **v18**, IndexedDB skema **1**. Tidak ada migrasi baru, penghapusan progres atau perubahan hadiah. Penampilan dan seluruh versi cadangan lama tetap didukung. M07 tetap satu misi/100 XP sekali; M16/M17 mengikuti status episode masing-masing.

## Resource dan kamera

`SpaceInstrumentCamera` menginterpolasi pose pada kamera yang sudah ada, tanpa menulis preferensi jarak eksplorasi. Saat pose bergerak, Amati/Catat ditahan hingga stabil. Reduced motion langsung menerapkan pose. FollowCamera tidak bersaing dengan pose detail setiap frame. Kamera eksplorasi memakai volume modul persiapan setinggi 3,6 unit (sebelumnya 1,3), sehingga atap modul 3,45 unit tidak menutupi avatar saat mengorbit atau menempuh jalur. Tapak navigasi pemain tidak diubah.

Resource wilayah mencakup geometri Normal/Rendah yang sedang aktif maupun belum terpasang, texture uniform shader, label dan gambar peta. `disposeRegion` memakai Set agar setiap resource milik wilayah dilepas sekali, tetap menghormati cache avatar bersama. Uji siklus masuk/keluar dan kualitas memeriksa jumlah geometri/tekstur setelah cache hangat, bukan klaim FPS atau profil VRAM perangkat fisik.

## Sumber dan keterbatasan telaah

Keempat URL NASA yang diminta benar-benar dicoba pada 29 Oktober 2026, namun **seluruhnya gagal pada CONNECT 403 Forbidden** di jaringan lingkungan. Tidak ada isi halaman yang berhasil dibaca; laporan ini tidak mengklaim telaah NASA selesai:

- https://science.nasa.gov/earth/facts/
- https://science.nasa.gov/moon/moon-phases/
- https://science.nasa.gov/moon/top-moon-questions/
- https://science.nasa.gov/moon/eclipses/

Konsep dan bukti ilmiah M07 sebelumnya dipertahankan; shader dan kamera diuji terhadap model itu. Telaah isi halaman primer perlu dilengkapi ketika akses tersedia. Natural Earth dan lisensinya berhasil diakses/dibaca; [atribusi, sumber generator dan batas tekstur](assets/space-attribution.md). [Status akses aktual](evidence/visual-stage-04/source-access.json).

## Bukti dan hasil pemeriksaan

Kondisi awal diambil sebelum mengubah sumber W08, dari build tahap 03. Pasangan berikut memakai viewport 1440×960, input IFP, jarak Normal, yaw/pitch awal dan titik navigasi yang sama. Pada instrumen, pemusatan presentasi sedikit disesuaikan ke pusat model; gambar detail baru merupakan sudut tambahan, bukan perbandingan skala ilmiah.

| Tampilan | Sebelum | Sesudah |
| --- | --- | --- |
| Kedatangan/interior | [Dek awal](evidence/visual-stage-04/before/01-arrival.png) | [Ruang observasi](evidence/visual-stage-04/after/01-arrival.png) |
| Matahari dan Bumi/rotasi | [Model awal](evidence/visual-stage-04/before/02-rotation-day.png) | [Peta dan cahaya](evidence/visual-stage-04/after/02-rotation-day.png) |
| Revolusi | [Sebelum](evidence/visual-stage-04/before/04-revolution.png) | [Sesudah](evidence/visual-stage-04/after/04-revolution.png) |
| Sistem Bulan | [Sebelum](evidence/visual-stage-04/before/05-moon-system.png) | [Sesudah](evidence/visual-stage-04/after/05-moon-system.png) |

Detail Bumi: [penanda siang](evidence/visual-stage-04/after/08-detail-earth-day.png), [penanda malam](evidence/visual-stage-04/after/09-detail-earth-night.png). Empat fase melalui kamera dari Bumi: [baru](evidence/visual-stage-04/after/06-moon-new.png), [perbani awal](evidence/visual-stage-04/after/06-moon-first.png), [purnama](evidence/visual-stage-04/after/06-moon-full.png), [perbani akhir](evidence/visual-stage-04/after/06-moon-last.png). [Sudut interior](evidence/visual-stage-04/after/10-interior-side.png), [konsol rotasi](evidence/visual-stage-04/after/11-rotation-console.png) dan [cuplikan berjalan, memutar kamera, mendekati konsol dan mencatat siang–malam](evidence/visual-stage-04/after/station-and-rotation.webm). Semua gambar/video berasal dari game produksi yang berjalan, bukan mockup.

Pemeriksaan iteratif juga menemukan [sambungan tekstur Bulan](evidence/visual-stage-04/iterations/moon-longitude-seam.png), [awan](evidence/visual-stage-04/iterations/cloud-longitude-seam.png), dan [celah rangka sisi](evidence/visual-stage-04/iterations/frame-gap.png). Kasus [kamera terhalang modul persiapan](evidence/visual-stage-04/iterations/storage-camera-occlusion.png) juga diperbaiki melalui volume kamera sesuai tinggi bangunan. Ini arsip **cacat iterasi**, bukan hasil final. Generator dibuat periodik pada bujur dan rangka dirapatkan, lalu bukti sesudah serta pemeriksaan W08 diulang. Angka/geometri astronomi tetap sama.

| Pemeriksaan | Hasil aktual |
| --- | --- |
| `npm test` sesudah koreksi kamera terakhir | **726 lulus**, 25 berkas. Mencakup rumus/gerak M07, bukti/reload/hadiah/migrasi lama, pencahayaan fase, kualitas, kepemilikan texture/LOD dan kasus kamera terhalang modul. |
| Regresi browser terpilih | **33 lulus** (10,4 menit): M07, visual W08, lemari, alat pancing/rompi/perahu, lari/analog/IFP, rendering tahap 1 dan seluruh tujuan Kota tahap 2. Ini bukan klaim seluruh 115 skenario browser dijalankan pada tahap ini. |
| Uji ulang final setelah seluruh koreksi gambar/rangka/kamera | **10 lulus** (M07 + visual W08, 3,8 menit). M07 selesai dari kunjungan Kota, checkpoint, pengamatan sah, satu revolusi penuh dan empat fase, sampai kesimpulan/100 XP/reset/impor/kembali Kota. |
| `npm run test:launcher` pada ZIP baru | **16 lulus**, termasuk ekstraksi pada folder Unicode/berspasi, CRC/hash/path, server dan diagnostik tanpa npm. |
| Browser dari ZIP baru | **2 lulus**, 1280×900 dan 390×844. Ketiga PNG W08 berhasil dimuat secara lokal; instrumen, lemari, galeri, penampilan reload/cadangan v18 dan progres lama diuji tanpa internet. |
| `npm run build` / `npm run prepare:local` | Berhasil. Peringatan chunk >500 kB dan deprecation `THREE.Clock` masih ada; keduanya tidak disembunyikan dan bukan hasil pengukuran FPS. |
| Tiga siklus Kota ↔ Antariksa, Low ↔ Normal | Masing-masing **91 geometri, 50 tekstur, satu akar wilayah, satu avatar, tiga model** setelah stabil. Penampilan dan seluruh rekaman misi dibandingkan tetap sama. |
| Rekaman produksi | Sekitar **19,5 detik / 138 frame**, dari game produksi; tidak ada error JavaScript atau permintaan aset eksternal pada sesi rekaman. |

Viewport dan gambar preset Rendah: [laptop 1440×960](evidence/visual-stage-04/checks/moon-quarter-1440.png), [HP potret 390×844](evidence/visual-stage-04/checks/moon-quarter-390.png), [HP lanskap 844×390](evidence/visual-stage-04/checks/moon-quarter-844.png), [IFP 1920×1080](evidence/visual-stage-04/checks/moon-quarter-1920.png). [Hasil dan konfigurasi mesin](evidence/visual-stage-04/checks.json), [unit](evidence/visual-stage-04/unit-tests.txt), [regresi 33](evidence/visual-stage-04/browser-regression-33.txt), [W08 final](evidence/visual-stage-04/browser-final-w08.txt), [launcher](evidence/visual-stage-04/launcher-tests.txt), [ZIP di browser](evidence/visual-stage-04/browser-package.txt), [resource](evidence/visual-stage-04/checks/resource-cycles.json). Pengujian ulang W08 mengulang sebagian skenario regresi, bukan menambah jumlah misi atau perangkat fisik.

Gambar dan frame cuplikan ditinjau langsung: bentuk bola/garis siang–malam, dua perbani berlawanan, purnama, sambungan peta, avatar saat berjalan di dekat modul, konsol, jendela serta sambungan rangka. Generator tekstur menyambung pada bujur; [selisih piksel batas](evidence/visual-stage-04/asset-seams.json) juga dicatat. Pada rute/pose yang diuji tidak ditemukan kedipan permukaan, duplikasi atau garis sambungan tekstur yang semula tampak. Ini tidak menjamin seluruh sudut kamera dan perangkat telah tercakup.

Hash **146 berkas sumber/aset/konfigurasi** diperiksa tetap sama setelah koreksi terakhir, pengujian final, capture dan persiapan produksi. Format data tetap v18. ZIP [siap main Windows](../unduhan/JS-Windows.zip): **613.737 byte**, 20 entri, jalur terpanjang **43 karakter**, CRC serta hash setiap isi cocok dengan build. Ekstrak ke `C:\Game`, buka `JS/JALANKAN_JELAJAH_SAINS.bat`. Node.js tetap diperlukan; pemain tidak membutuhkan npm, Python atau build ulang. [Verifikasi paket](../unduhan/verification.json).

## Batas lingkup

HP/IFP memakai simulasi viewport/sentuhan Chromium Linux/SwiftShader, bukan perangkat fisik atau pengukuran performa HP. Explorer Windows dan LAN antarperangkat belum diuji langsung. Ruang observasi merupakan interior dengan atap potongan terbuka; belum memiliki docking, perjalanan astronot, mikrogravitasi atau kegiatan luar stasiun. Peta/awan/kawah stylized tidak dimaksudkan sebagai citra pengukuran sains. Tahap 05 dan seterusnya belum dikerjakan.
