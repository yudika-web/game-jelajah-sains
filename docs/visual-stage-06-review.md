# Visual tahap 06 — Teluk latihan dan menyelam

30 Oktober 2026 (Asia/Bangkok). Branch `feat/visual-stage-06` berbasis hasil tahap 05 `84185e0`. Semua branch remote diperiksa; main masih pada baseline lama `afda146`, sedangkan tahap 05 adalah hasil terbaru. Worktree awal bersih, AGENTS.md tidak ditemukan di proyek/induk. README, rancangan W05/kontrol air, laporan S16, S14, perahu, ROV M16-E1, karakter modular dan visual 01–05 dibaca. Tidak ada misi, wilayah, XP, koin atau toko baru.

## Cara bermain

1. Kota → Sungai → dermaga **Ke Pesisir**. Tidak ada prasyarat menyelesaikan misi lama.
2. Peta W05 → **Persiapan menyelam**. Pos latihan berada di perluasan pantai selatan, di darat yang tersambung ke jalur lama.
3. Datangi **Perlengkapan selam**, lalu **Ambil & pakai perlengkapan selam**. Pakaian, masker, sirip, tabung dan ransel gratis. Pilihan pribadi tetap tersimpan.
4. Datangi **Masuk teluk latihan**. Pilih **Masuk air melalui tangga**. Avatar utama bergerak melalui titik masuk dan mengapung di permukaan; tidak ada avatar preview pengganti.
5. Berenang, gunakan **Turun 1 m**, lalu jelajahi ikan, lamun, batu, cahaya dari permukaan dan bagian bawah dermaga. **Peta** atau **Tujuan bantu** mengantar melalui rute 3D. Panel pengamatan hanya terbuka dalam jarak sah; tiba tidak menghasilkan bukti IPA atau XP.
6. **Amati** memperlihatkan objek dunia dengan kamera yang sama dan panel penjelasan di sisi/bawah layar. Tidak perlu menangkap, menyentuh organisme atau melakukan drag.
7. Pilih **Ke tangga · permukaan**. Setelah benar-benar tiba dekat tangga dan kedalaman pusat tubuh kurang dari 0,35 m, pilih **Keluar melalui tangga**.
8. Datangi lemari dan **Lepas perlengkapan** untuk memulihkan kostum pribadi. **Kembali ke Dermaga** tersedia kapan saja tanpa menghapus bukti; perlengkapan tetap dipakai sampai dilepas di lemari.

Perahu, ROV dan pengamatan S16 tetap melalui lokasi serta aturan semula. Lepas perlengkapan selam sebelum menggunakan aktivitas lain. Human diver tidak dapat mengambil data tekanan ROV atau mengesahkan catatan S16 dari titik dekoratif baru.

## Kontrol

| Perangkat | Kendali |
|---|---|
| Laptop | WASD/panah horizontal relatif kamera; Space naik target 1 m, Q turun target 1 m; Shift tidak menambah laju selam |
| HP | Analog dan kamera dengan dua jari terpisah; tombol Naik/Turun mengubah target tanpa harus ditahan |
| IFP | Peta/daftar tujuan 3D, tombol Maju/Mundur/Kiri/Kanan 1 m, Naik/Turun dan Berhenti |
| Semua | Berhenti / melayang, Amati, Keluar melalui tangga, Kembali ke Dermaga; tombol dan daftar, tanpa hover/drag wajib |

Kecepatan horizontal **2,2 unit/detik**, vertikal **1,2 unit/detik**, independen dari skala avatar dan laju jalan/lari 5,2/8,0. Tidak ada roll bebas. Bantuan kendali permainan menstabilkan gerak saat input dilepas; ini bukan simulasi gerak/arus atau keterampilan berenang nyata. Tombol pada panel rendah dapat digulir pada HP lanskap.

## Model, kedalaman dan batas zona

Permukaan visual memakai `pressureConfig.surfaceY = −0,175`, sama dengan W05 dan ROV. Titik acuan kedalaman manusia adalah pusat tubuh pada akar avatar, **0,8 unit di atas telapak netral**: `kedalaman = permukaan − posisi_y_pusat_tubuh`. Ini bukan kedalaman kamera atau sensor ROV. Batas pusat tubuh **0–6 m**. Dasar sekitar 7,4 m di bawah permukaan memberi ruang untuk envelope tubuh dan sirip; kontur/batu lebih tinggi memiliki penghalang tersendiri. Tubuh tidak diperbolehkan menembus dasar untuk mencapai angka 6 m.

Teluk baru berada di x sekitar −17…3 dan z 26…45. ROV tetap pada wilayah pengukuran lama, batas sensor 9,5 m, sensor eksternal dan rumus M16-E1 yang tidak berubah. Perahu tetap di jalur lamanya, tidak masuk ke teluk baru. Kolam S14 berada di W04 dan tetap memiliki izin gerak sendiri. Perluasan batas darat sempat membuka jalan memutari air; unit test menangkapnya dan penghalang laut diperpanjang sehingga kedua tepian lama tetap memerlukan perahu. Tepian timur di luar area lama ditutup pagar.

`volumeNavigation.ts` mengekstrak pemeriksaan volume yang sebelumnya digunakan EVA. Envelope konservatif penyelam mencakup tubuh/sirip: setengah ukuran (0,6; 0,9; 1,05). Sweep per sumbu dan substep maksimum 1/120 detik mencegah tembus. Jalur enam arah menggunakan x/y/z, segmen diperiksa dan langkah dibatasi jarak tersisa agar arrival terjadi sekali. EVA memakai wrapper dengan parameter lamanya; ROV tetap memakai controller/aturan episode sendiri.

`DivingController` memiliki keadaan shore, ready, entering, surface, diving dan exiting. Aksi masuk/keluar/perlengkapan memeriksa posisi dan revisi. Perubahan permukaan ke bawah air tidak me-reset kontrol di tengah gerak. Pengendali perahu, ROV, kolam, darat dan astronot memiliki keadaan aktif yang saling eksklusif; perlengkapan siap di darat memblokir dispatch ROV/perahu sampai dilepas.

## Lingkungan dan rendering

Teluk menampilkan pasir, punggungan rendah, batu bersegi tidak seragam, petak lamun pada sedimen, tiga kelompok ikan model dengan badan elipsoid, sirip, ekor dan mata, serta tiang/tangga dermaga dari bawah. Tidak ada karang hidup baru. Mangrove lama tetap di tepian kawasan lain; tidak dicampur ke petak lamun bawah air. Kelompok ikan generik bukan identifikasi spesies, kategori makanan S16, atau hasil sampling alam. Plankton S16 tetap pada alat berlabel **Diperbesar**; tidak ada plankton raksasa yang berenang di teluk.

Air lama yang berupa kotak transparan diganti satu bidang dua sisi, dengan depth test tetap aktif dan satu pass transparan. Teluk memakai bidang tetangga dengan permukaan yang sama. Tidak ada lapisan atmosfer air atau refleksi berat. Kamera memakai hysteresis: masuk suasana bawah air setelah 0,30 m di bawah permukaan, keluar setelah 0,20 m di atas. Getaran kecil di batas tidak menukar warna/kabut setiap frame.

Di bawah air, warna biru kehijauan dan kabut jarak 4–30 unit (Rendah 23) menjaga keterbacaan. Efek mengikuti tinggi kamera sebenarnya selama mode selam; kembali ke darat/instrumen/ROV/wilayah lain memulihkan pengaturan yang sesuai. ROV mempertahankan pencahayaan episode lamanya. Label darat disembunyikan saat menyelam agar tidak mengambang di bidang pengamatan.

Jalur ikan dasar dijauhkan dari titik pendekatan setelah potret awal menunjukkan ikan bertumpuk dengan kaki avatar. Ikan utama, lamun, batu pengamatan dan tiang juga dapat dipilih langsung melalui raycast, selain tombol/daftar. Pemulihan dermaga langsung memulihkan pose kamera agar tidak melintas dari bawah lantai.

Normal menampilkan 12 ikan, 120 bilah lamun instanced, 12 gelembung kecil; Rendah mengurangi ikan menjadi enam, bilah menjadi 60 dan menghilangkan gelembung. Pengurangan gerakan menghentikan gerak dekoratif, tetapi gerak karakter dan navigasi tetap tersedia. Geometri/material ikan serta batu dibagi dalam wilayah, buffer gelembung digunakan ulang. Satu renderer, kamera, loop World dan regionRoot tetap digunakan. Resource wilayah dilepas saat pindah; cache karakter/perlengkapan bersama dilindungi.

## Perlengkapan, penyimpanan dan pemulihan

`divingEquipment.ts` memakai rig enam balok yang sama, mengganti material tubuh sementara dan menempelkan masker, tabung serta sirip. Tidak mengubah tinggi normalisasi 1,60 m, socket alat, collider, pilihan penampilan atau kepemilikan kosmetik. Transisi perlengkapan astronot → selam → pribadi diuji pada siswa dan siswi. Memakai/lepas berulang tidak membuat salinan model.

Format cadangan tetap **v18**, IndexedDB tetap skema **1**. Tidak ada rekaman misi/inventaris/XP baru. Mode, animasi dan panel selam tidak disimpan. Reload memulihkan dermaga kedatangan W05 (−3, 12) dengan kostum pribadi; Kembali ke Dermaga saat bermain memakai titik aman tangga latihan (−7, 24). Pengamatan sementara tidak disahkan atau dilanjutkan offline. Impor lama dan reset misi tetap melalui aturan semula; data tidak dihapus untuk pemulihan.

Panel, menu, blur, tab tersembunyi, pointercancel dan pergantian kontrol menghentikan input serta rute. Setelah ditutup diperlukan input baru. Masuk/keluar air dijeda saat fokus hilang. Kembali ke Pos atau perpindahan wilayah melepas mode/perlengkapan sementara dan memulihkan kamera. Tidak ada oksigen, kematian, batas waktu atau kehilangan progres. Ini **penyederhanaan permainan pendidikan, bukan panduan praktik menyelam nyata**.

## Sumber dan batas konten

Halaman primer NOAA Ocean Service dicoba pada 30 Oktober 2026 (Asia/Bangkok):

- [Seagrass](https://oceanservice.noaa.gov/facts/seagrass.html).
- [Coral](https://oceanservice.noaa.gov/facts/coral.html).
- [Mangroves](https://oceanservice.noaa.gov/facts/mangroves.html).

**Ketiga halaman ditolak CONNECT 403, sehingga isinya tidak berhasil dibaca langsung.** [Log akses](evidence/visual-stage-06/source-access.json). Tidak diklaim telah menyelesaikan telaah primer. Materi dibatasi pada pembeda dasar lamun sebagai tumbuhan terendam di sedimen bercahaya, mangrove di tepian, dan ikan generik tanpa nama spesies/diet. Kondisi suhu, salinitas, pasang-surut dan batas sebaran organisme nyata belum dimodelkan. Telaah guru/ahli serta sumber primer yang dapat diakses masih diperlukan sebelum penggunaan pembelajaran resmi.

## Bukti permainan dan pemeriksaan

[Rekaman alur utuh, sekitar 48 detik](evidence/visual-stage-06/diving.mp4): pos persiapan → perlengkapan → tangga → permukaan → turun → lima pengamatan → naik → keluar → kostum pribadi. Ini rekaman Chromium dari game yang berjalan, dikodekan H.264 tanpa mengubah urutan atau kecepatan waktu, bukan mockup.

- [Persiapan](evidence/visual-stage-06/01-preparation.png) · [perlengkapan](evidence/visual-stage-06/02-equipped.png) · [permukaan](evidence/visual-stage-06/03-surface.png) · [turun](evidence/visual-stage-06/04-descending.png).
- [Ikan](evidence/visual-stage-06/diveFish.png) · [lamun](evidence/visual-stage-06/diveGrass.png) · [batu](evidence/visual-stage-06/diveRocks.png) · [cahaya](evidence/visual-stage-06/diveLight.png) · [pengamatan dermaga](evidence/visual-stage-06/05-observation.png).
- [Kembali ke permukaan](evidence/visual-stage-06/06-surfaced.png) · [keluar](evidence/visual-stage-06/07-exit.png) · [penampilan pribadi](evidence/visual-stage-06/08-personal.png).
- [Laptop](evidence/visual-stage-06/09-viewport-1440.png) · [HP potret](evidence/visual-stage-06/09-viewport-390.png) · [HP lanskap](evidence/visual-stage-06/09-viewport-844.png) · [IFP](evidence/visual-stage-06/09-viewport-1920.png).

Perbandingan lokasi lama: [pantai sebelum](evidence/visual-stage-06/before-shore.png) / [sesudah](evidence/visual-stage-06/after-shore.png), dan [ROV A4 sebelum](evidence/visual-stage-06/before-underwater.png) / [sesudah](evidence/visual-stage-06/after-underwater.png), viewport 1440×960 dan rute/kamera yang sebanding. Teluk latihan adalah area baru; gambar teluk tidak diklaim sebagai kamera yang sama dengan stasiun ROV lama. Kedua gambar bawah air menunggu posisi aktual A4 (x=7, z=−5, kedalaman sensor 4 m), bukan hanya menunggu kedalamannya. Baseline direkam ulang dari ZIP tahap 05 ber-manifest commit `b2fd329`; hasil sesudah memakai build produksi tahap 06. Reproduksi sesudah: build, lalu `node scripts/capture-visual-stage-06.mjs`; `JELAJAH_BASELINE_ROOT` dapat menunjuk folder JS hasil ekstraksi ZIP lama untuk merekam baseline yang sebanding.

[Snapshot 17 misi dan penampilan](evidence/visual-stage-06/preserved-evidence.json) tidak berubah setelah alur selam. [Tiga siklus wilayah](evidence/visual-stage-06/resource-cycles.json): geometri 129 → 129 → 129, tekstur 48 → 48 → 48, satu root wilayah dan satu avatar. Ini pemeriksaan kestabilan pada alur yang diuji, bukan jaminan universal tanpa kebocoran atau benchmark perangkat.

| Pemeriksaan | Hasil |
|---|---|
| `npm test` | **765 lulus**, 27 berkas; 19 pemeriksaan baru pengendali, batas, perlengkapan, permukaan dan resource |
| TypeScript/build dan `npm run prepare:local` | **Lulus**, build baru dipromosikan dari staging sesudah sukses |
| `tests/visualStage06.spec.ts` | **7 lulus**: alur utuh, empat viewport, dua jari/pointercancel, reload, impor lama, eksklusivitas dan tiga siklus wilayah |
| Regresi browser terpilih | **39 lulus**: S16 lengkap, ROV M16-E1, kolam S14, perahu S15, jalan/lari, lemari/galeri, M07 dan aktivitas astronot |
| `git diff --check` | **Lulus** |

Regresi memakai `tests/coastal.spec.ts tests/pressure.spec.ts tests/swimming.spec.ts tests/boat.spec.ts tests/wardrobe.spec.ts tests/visualStage05.spec.ts tests/running.spec.ts tests/space.spec.ts`. Setelah penyesuaian akhir jalur ikan dan kamera pemulihan, unit, build/persiapan, tujuh kasus browser selam dan pasangan gambar produksi diulang. Pemeriksaan ini terarah; seluruh kasus browser proyek tidak dijalankan ulang.

Pada iterasi awal, satu pemeriksaan memakai persamaan float persis pada batas permukaan dan disesuaikan ke toleransi numerik. Pemeriksaan lain menangkap jalur darat antarbank yang terbuka setelah perluasan batas; penghalang laut diperbaiki dan seluruh unit lulus. Tidak ada kegagalan yang diabaikan.

Linux, Chromium/SwiftShader; HP/IFP adalah emulasi viewport/sentuhan, bukan perangkat fisik. Windows BAT, GPU/HP/IFP fisik dan LAN antarperangkat belum diuji. Peringatan chunk build besar dan deprecation THREE.Clock yang sudah ada tetap dicatat; tidak ada API, login, CDN atau dependensi runtime baru.
