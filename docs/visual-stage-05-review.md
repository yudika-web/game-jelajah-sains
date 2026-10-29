# Visual tahap 05 — Perjalanan dan aktivitas astronot

29 Oktober 2026. Dasar kerja: `feat/visual-stage-04` pada `7d216ff`, bukan main lama. Worktree awal bersih; AGENTS.md tidak ditemukan di proyek atau induknya. README, rancangan W08, laporan M07, tahap visual 01–04, karakter modular, lemari, input, kamera, pergantian wilayah dan kepemilikan resource diperiksa. Tahap ini tidak menambah misi, XP, koin, toko, atau aktivitas menyelam.

## Cara bermain

1. Di Kota, gunakan Peta → Observatorium / Antariksa. Dekati pintu observatorium dan pilih **Masuk Simulasi Antariksa**.
2. Di area persiapan, baca meja pengantar. Berjalan atau gunakan **Menuju kendaraan**. Di pintu, pilih **Naik kendaraan**. Avatar masuk melalui pintu ke tempat duduk yang terlihat.
3. Pilih **Mulai Perjalanan**. Keberangkatan, perubahan latar dan docking berlangsung singkat. **Lewati Animasi** menghasilkan posisi akhir yang sama. **Kurangi gerakan** mempercepat transisi tanpa mengubah aturan.
4. Pilih **Keluar ke stasiun**. Interior, Bu Nara dan seluruh instrumen M07 tetap dapat dikunjungi. Perjalanan tidak memberikan bukti ilmiah atau hadiah.
5. Peta → **Perlengkapan astronot**. Pakai perlengkapan gratis. Pakaian pribadi tetap tersimpan; helm menyembunyikan rambut, topi dan aksesori wajah sementara.
6. Peta → **Airlock / luar stasiun**. Masuk, tutup pintu dalam, periksa perlengkapan, jalankan transisi keluar, buka pintu luar, lalu keluar. Kedua pintu tidak pernah terbuka bersamaan.
7. Jelajahi panel surya, antena, jendela dan modul observasi. Gunakan Peta atau daftar **Tujuan bantu**. Panel informasi baru terbuka setelah avatar benar-benar tiba dalam jangkauan 3D. Tidak ada catatan misi atau XP baru.
8. Kembali mendekati titik tambat untuk masuk kembali, atau gunakan **Kembali ke Airlock**. Jalankan transisi masuk, buka pintu dalam, lalu masuk interior.
9. Lepas perlengkapan di lemari untuk memulihkan pakaian pribadi. Peta → **Dok kendaraan / Kota** → naik → mulai perjalanan → keluar ke Kota. Persiapan dapat dibatalkan melalui tombol Kembali ke Kota.

## Kontrol

| Tempat/perangkat | Kendali |
|---|---|
| Darat/interior | WASD/panah, Shift, E; analog HP dan navigasi IFP tetap seperti sebelumnya |
| Luar stasiun, laptop | WASD/panah relatif kamera; Space menaikkan target 1 unit, Q menurunkannya 1 unit; Shift tidak mengaktifkan lari darat |
| Luar stasiun, HP | Analog horizontal, kamera dengan jari kedua; tombol Naik/Turun mengubah target tanpa perlu ditahan |
| Luar stasiun, IFP | Peta/daftar titik pendekatan; rute tiga dimensi; tombol Naik, Turun dan Berhenti |
| Semua perangkat | Berhenti / stabilkan, Kembali ke Airlock; tombol bisa dijangkau melalui Tab dan Enter; panel memiliki tombol tutup |

Kecepatan horizontal luar stasiun 2,4 unit/detik, vertikal 1,5 unit/detik. Angka adalah konfigurasi permainan. Jangkauan penambat 36 unit, termasuk belokan jalur. Tidak ada roll bebas, stamina, oksigen, kematian, batas waktu atau penilaian motorik.

## Keadaan, pemulihan dan penampilan

`SpaceExpedition` memisahkan persiapan, masuk kendaraan, duduk, keberangkatan, perjalanan, docking, interior, tahap airlock dan eksplorasi luar. Semua perubahan keadaan memiliki revisi; aksi lama atau klik ganda tidak memulai transisi kedua. Animasi membaca loop utama, bukan timer atau callback tertunda. Menu/jeda/tab tersembunyi/kehilangan fokus menghentikan pembaruan; input dibersihkan pada perpindahan mode. Setelah panel ditutup diperlukan input baru.

Persiapan adalah subadegan observatorium dalam wilayah W08 aktif. Kota sudah dilepas, tidak berada bersama W08 secara permanen. Satu kendaraan digunakan ulang antara pangkalan persiapan dan dok stasiun. Avatar dunia yang sama menempati tempat duduk; bukan model preview terpisah. Pintu dan kanopi potongan membuat interior kendaraan terbaca pada kamera orang ketiga.

**Reload di persiapan, perjalanan, airlock atau luar stasiun:** pemain berada di interior W08 dekat airlock, koordinat darat (14, 16,2); kendaraan di dok; pakaian pribadi dipulihkan. Perjalanan sementara tidak dilanjutkan secara offline. Kembali ke Pos juga membatalkan aktivitas sementara. Saat pulang, Kota baru menjadi wilayah tersimpan setelah pemain keluar dari kendaraan; reload sebelum itu kembali ke interior W08.

Format cadangan tetap **v18**, skema IndexedDB tetap **1**. Tidak ada data misi, receipt hadiah, inventaris, kepemilikan atau pilihan kosmetik baru yang ditulis oleh ekspedisi. Hanya wilayah aktif disimpan melalui mekanisme lama. Kostum astronot memakai material/geometri bersama pada rig enam balok yang sama, tanpa mengubah normalisasi tubuh 1,60 unit, collider atau socket alat. Lemari dan galeri tetap memakai penampilan pribadi. Memakai/melepas perlengkapan tidak membuat pembelian atau saldo.

## Kendali 3D dan kepemilikan resource

`evaNavigation.ts` memperluas penghalang dengan setengah ukuran avatar dan melakukan sweep per sumbu. Batas operasi memperhitungkan tubuh, bukan hanya titik pusat. A* enam tetangga menggunakan x/y/z; penyederhanaan waypoint memeriksa segmen terhadap struktur. Perpindahan dibatasi jarak tersisa dan arrival terjadi sekali. Input manual membatalkan rute otomatis; stabilisasi aktif meredam kecepatan dan tombol Berhenti langsung menghapus gerak serta target vertikal.

Penambat adalah garis terbatas dari titik tambat melalui jejak gerak yang sah ke ransel. Segmen hanya dipangkas jika jalur bebas struktur; pertumbuhan melampaui 36 unit ditolak. Ini bukan simulasi tali fisik atau prosedur spacewalk nyata. Pemulihan membawa avatar ke ruang airlock dengan kedua pintu tertutup.

Satu renderer, kamera dan loop World digunakan. Kamera kendaraan/airlock sementara menggunakan pengendali kamera instrumen yang sama; preferensi jarak tetap. Setelah keluar, framing EVA menghindari array surya dekat pintu; arah kamera eksplorasi dipulihkan saat kembali. Objek ekspedisi dimiliki regionRoot dan dilepas bersama wilayah. Material/geometri rig dan pakaian yang memang bersama tetap milik cache; tidak dibuang saat meninggalkan wilayah. Garis penambat memakai buffer tetap, bukan geometri baru per frame. Bintang stabil, tidak ada bloom atau API/CDN baru.

## Model ilmiah dan sumber

- Mikrogravitasi bukan tidak adanya gravitasi. Stasiun orbit dan penghuninya mengalami jatuh bebas bersama.
- Pijakan bantu interior dan pengendalian avatar adalah konvensi simulasi. Ini tidak mengajarkan bahwa stasiun orbit mempunyai gravitasi Bumi biasa.
- Perlambatan saat input dilepas berasal dari **bantuan pendorong aktif**, bukan gesekan udara di ruang hampa. Tidak ada simulasi momentum/propelan rinci.
- Perjalanan/docking dipersingkat; lintasan orbit, peluncuran, tekanan, aliran gas, dekompresi dan prosedur keselamatan spacewalk tidak disimulasikan. Airlock hanya memperlihatkan penguncian dua pintu dan pemeriksaan perlengkapan.
- Model astronomi, pencahayaan, parameter dan validator M07 tidak diubah. Semua instrumen tetap mensyaratkan prediksi/pengamatan/pencatatan sendiri.

Sumber primer NASA dicoba pada **29 Oktober 2026, 18:01 (UTC+7, Asia/Bangkok)**:

- [What Is Microgravity? (Grades 5–8)](https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-microgravity-grades-5-8/)
- [What Is Microgravity?](https://www.nasa.gov/reference/what-is-microgravity/)
- [What Is a Spacewalk? (Grades 5–8)](https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-spacewalk-grades-5-8/)

**Ketiganya ditolak jaringan dengan CONNECT 403; isi halaman tidak berhasil dibaca.** Tidak diklaim sudah ditelaah langsung. [Catatan akses](evidence/visual-stage-05/source-access.json) disertakan. Materi konservatif di atas dibedakan dari penyederhanaan permainan. Telaah primer yang dapat diakses masih perlu dilengkapi sebelum penggunaan pembelajaran resmi.

## Pemeriksaan dan bukti

| Pemeriksaan | Hasil |
|---|---|
| `npm test` | **746 lulus**, 26 berkas; termasuk 20 pemeriksaan baru ekspedisi/EVA/perlengkapan |
| `npm run test:launcher` | **16 lulus** |
| `npm run build` dan `npm run prepare:local` | **Lulus**, TypeScript dan build staging atomik; dependensi sudah sesuai |
| Browser tahap 05 | **5 lulus**: perjalanan nyata, airlock, rute/manual 3D, tiga viewport sentuh, reload dan tiga siklus resource |
| Regresi browser terpilih | **40 lulus**: S15/perahu, M01, ROV M16-E1, lari, M07 lengkap, Kota, tahap 04, lemari/galeri dan penggunaan alat |
| `git diff --check` | **Lulus** |

Perintah browser baru: `npm run test:e2e -- tests/visualStage05.spec.ts`. Regresi memakai `tests/space.spec.ts tests/visualStage04.spec.ts tests/wardrobe.spec.ts tests/running.spec.ts tests/boat.spec.ts tests/pressure.spec.ts tests/game.spec.ts tests/visualStage02.spec.ts`. Ini 45 pemeriksaan terarah; seluruh 116 kasus browser tidak dijalankan ulang. Ke-40 regresi mula-mula menghasilkan 39 lulus dan satu perbandingan jumlah geometri 103 versus 102. Assertion lama diperbaiki agar menolak pertumbuhan resource, sambil tetap memeriksa avatar, root, model, bukti dan kosmetik. Kasus tersebut diulang dan lulus. Tidak ada kegagalan yang diabaikan.

Unit, launcher, TypeScript/build serta browser dijalankan pada Linux dengan Chromium/SwiftShader. Viewport HP dan IFP adalah emulasi browser, bukan pengujian perangkat fisik. Windows BAT, GPU/HP/IFP nyata dan akses LAN antarperangkat tidak diuji pada tahap ini.

### Bukti render dari permainan

Rekaman **[ekspedisi lengkap, sekitar 75 detik](evidence/visual-stage-05/expedition.mp4)** berasal dari Chromium yang menjalankan game: berjalan ke kendaraan, masuk/duduk, keberangkatan/docking, keluar, memakai perlengkapan, dua pintu airlock, gerak vertikal/manual dan empat tujuan bantu, kembali melalui airlock, melepas pakaian dan pulang. MP4 merupakan pengodean H.264 dari rekaman browser, bukan mockup; urutan dan kecepatan waktu tidak diubah.

- [Persiapan](evidence/visual-stage-05/01-preparation.png) · [avatar duduk di kabin](evidence/visual-stage-05/02-seated.png) · [keberangkatan](evidence/visual-stage-05/03-departure.png) · [docking](evidence/visual-stage-05/04-docking.png).
- [Interior](evidence/visual-stage-05/05-interior.png) · [astronot di luar](evidence/visual-stage-05/06-eva.png) · [panel surya](evidence/visual-stage-05/07-evaSolar.png) · [antena](evidence/visual-stage-05/07-evaAntenna.png) · [jendela tembus ke interior](evidence/visual-stage-05/07-evaWindow.png) · [modul observasi](evidence/visual-stage-05/07-evaModule.png) · [kostum pribadi kembali](evidence/visual-stage-05/08-personal-restored.png).
- [HP potret 390×844](evidence/visual-stage-05/09-eva-390.png) · [HP lanskap 844×390](evidence/visual-stage-05/09-eva-844.png) · [IFP 1920×1080](evidence/visual-stage-05/09-eva-1920.png). Laptop memakai viewport 1440×960.

Gambar dan beberapa posisi cuplikan diperiksa. Framing keluar airlock yang pada iterasi awal terlalu dekat dengan avatar diperbaiki dengan arah kamera awal menjauhi array surya. Jendela terlihat ke interior setelah kamera dihadapkan ke jendela (tombol R atau putar kamera); dari samping, dinding modul menutup pandangan secara wajar. Petunjuk Shift darat diganti dengan Space/Q selama EVA.

[Perbandingan data tersimpan](evidence/visual-stage-05/preserved-evidence.json) mencakup 17 misi dan penampilan: tidak berubah setelah perjalanan dan aktivitas. [Tiga siklus resource](evidence/visual-stage-05/resource-cycles.json) mencatat 106 → 106 → 105 geometri dan 57 → 57 → 57 tekstur GPU yang diunggah, satu root wilayah dan satu avatar. Nilai dapat turun karena visibilitas/frustum dan pengunggahan malas; pemeriksaan menolak pertumbuhan setelah pemanasan. Angka ini bukti pembatasan pada alur yang diuji, bukan jaminan tidak ada kebocoran pada seluruh kombinasi tindakan/perangkat.


Peringatan build tentang chunk lebih besar dari 500 kB masih ada. Tidak ada dependensi runtime baru; pengukuran performa pada GPU/HP/IFP fisik belum dilakukan. Kualitas rendah dan pengurangan gerakan tetap tersedia. Bukti browser menguji alur dan keterbacaan, bukan sertifikasi kinerja perangkat atau prosedur keselamatan astronot.
