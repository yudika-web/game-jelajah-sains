# W04 Sungai dan Danau — S13 Catatan Ikan Dua Titik

Implementasi 24 Oktober 2026. W04 terhubung ke Kota tanpa syarat penyelesaian misi lain. S13 dapat diselesaikan melalui enam sesi memancing 3D, pencatatan ciri, pelepasan ikan, perbandingan sampel, dan kesimpulan kepada Kak Lestari. M01, M14, W03-LOG01, gerobak, karakter, lari, kamera, dan galeri memakai sistem yang sama.

## Cara memainkan

1. Dari Peta Kota pilih **Ke Sungai dan Danau**, berjalan ke gerbang dermaga, lalu **Masuk Sungai dan Danau**. Misi aktif berpindah ke S13; misi lain tetap dapat dipilih.
2. Temui **Kak Lestari**, lalu **Terima S13**.
3. Baca dan catat **Buku pengamatan** serta **Prosedur sampling**. Pinjam pancing dan umpan pada **Alat pancing**.
4. Bersama Kak Lestari, pilih alat sama, umpan standar sama, tiga percobaan per titik, durasi model sama, satu sesi virtual, dan faktor lokasi. Jawaban keliru diberi petunjuk dan disimpan sebelum perbaikan.
5. Pilih **A · tepian** atau **B · dermaga** di Peta/kartu tujuan. Setelah tiba, **Mulai memancing** mengantar pemain ke tanda aman dan menghadap air. Gerak darat berhenti, pancing tampil di tangan, lalu tali dan pelampung dilempar.
6. Tunggu indikator ikan mendekat. **Tarik** tetap tersedia sampai dipilih; tidak ada tuntutan reaksi cepat. Lihat ikan 3D dan ilustrasi, pilih ciri yang tampak, isi catatan opsional, lalu **Catat dan lepaskan**. Catatan sah dan pelepasan adalah satu tindakan. Ikan tidak masuk tas, dimakan, atau dijual.
7. Ulangi sampai **A 3/3 dan B 3/3**. Boleh bergantian. Titik yang sudah lengkap tidak menghasilkan pengamatan keempat; arahkan ke titik yang masih kurang.
8. Baca **Papan hasil** untuk kartu keterbatasan dan tabel/diagram. **Meja catatan** serta **Jurnal** juga membuka rekaman individu, upaya jawaban, dan refleksi opsional.
9. Kembali ke Kak Lestari dan **Bandingkan dan simpulkan**. Kenali pola sampel dan dua keterbatasannya. Jawaban keliru dapat diperbaiki. Penyelesaian pertama memberi **50 XP**, tidak berulang setelah reload, reset, atau impor pada perangkat ini.
10. Kembali melalui **Kembali ke Kota**. **Pengaturan → Ulangi pengamatan S13** meminta konfirmasi dan hanya mereset latihan S13; tiga misi lain serta riwayat hadiah pertama tetap ada.

Laptop memakai WASD/panah, Shift kiri/kanan, dan E. Tombol kegiatan pancing dapat dioperasikan dengan Tab/Enter. Saat mengetik catatan, shortcut permainan diabaikan. HP memakai analog dan kamera terpisah serta toggle Jalan/Lari. IFP dapat menyelesaikan seluruh alur melalui Peta, kartu tujuan, dan tombol. Kamera dan pengurangan gerakan tetap tersedia.

## Aturan sampling dan dataset

Dataset berada di `src/data/riverContent.ts`, terpisah dari domain, UI, dan renderer. Urutan sengaja tetap untuk latihan, bukan sampling alam atau tabel peluang.

| Nomor per titik | A — tepian bervegetasi | B — dermaga |
| --- | --- | --- |
| 1 | Tubuh pipih | Ikan berkumis |
| 2 | Tubuh pipih | Tubuh memanjang |
| 3 | Tubuh memanjang | Ikan berkumis |

Ketiga kelompok adalah **kategori ciri sederhana**, bukan klasifikasi taksonomi atau nama spesies. Ciri badan/sungut dapat diperiksa pada model. Informasi buku diberi label sumber, bukan hasil pengukuran pemain. Materi tidak mengarang makanan atau habitat spesies nyata.

Hanya lokasi yang dibandingkan. Alat, umpan, tiga percobaan, durasi, dan sesi virtual sama. Durasi/sesi adalah kondisi model pembelajaran, bukan jam nyata perangkat. Waktu animasi singkat tidak mewakili lamanya sampling lapangan.

Hasil berikutnya ditentukan oleh jumlah rekaman sah pada titik tersebut. Membatalkan, menutup menu, atau reload tidak mengganti urutan. Hasil masa depan tidak muncul dalam jurnal. Ketika suatu titik belum memiliki rekaman, selnya **Belum diamati**, bukan nol. Setelah ada rekaman, angka menghitung sampel yang sudah tercatat; nol berarti kelompok itu belum tercatat dalam sampel tersebut. Label jumlah pengamatan menegaskan bila hasil masih sebagian.

Tabel dan diagram membaca fungsi agregasi yang sama dari rekaman sah. Diagram memiliki angka, label A/B, pola batang B, serta tabel pendamping. Hasil lengkap:

| Kelompok | A | B | Seluruh sampel |
| --- | --- | --- | --- |
| Pipih | 2 | 0 | 2 |
| Memanjang | 1 | 1 | 2 |
| Berkumis | 0 | 2 | 2 |

Kesimpulan memerlukan keenam rekaman, tiga sumber, dan lima pilihan benar: pipih lebih sering di sampel A; berkumis di B; memanjang di keduanya; tiga pengamatan belum menentukan populasi; penyebab perbedaan/kebersihan belum dibuktikan. Tidak ada penyelesaian dari kuis akhir saja. Refleksi bebas disimpan lokal untuk dibaca guru, tanpa penilaian kata kunci atau pengiriman otomatis.

## Keputusan desain dan pemulihan

- `riverRegion.ts`: wilayah ringkas, pos riset berpintu 2,1 unit, rak alat, sumber materi, dua titik, meja catatan, dan papan hasil. Jalur darat serta dermaga 4 unit lebar sesuai avatar siswa/siswi 1,60 unit. Kak Lestari memakai rig enam balok bersama, tinggi 1,68, palet riset teal, dan rambut berkuncir; tersedia juga di galeri.
- Air diblokir navigasi dan tabrakan. Hanya dek dermaga yang dapat dilalui di luar tepian. Pathfinding menuju titik aman, bukan pelampung. Berenang, menyelam, dan perahu belum diimplementasikan.
- `riverMission.ts`: reducer murni, rekaman A-1…B-3, indeks berikutnya, revision, validasi ciri, upaya keliru, kesimpulan, dan hadiah. Konfirmasi sekali pakai di UI dan validasi revision/indeks mencegah pengesahan ganda.
- `fishingSession.ts`: keadaan sementara **idle → casting → waiting → ready → observing → released → idle**, tanpa timer tambahan. Presentasi: lempar 0,8 detik aktif; tunggu 1,6; pelepasan 0,75. Ready/observing tidak memiliki tenggat. Tick dipanggil dari loop World yang sudah ada. Delta besar dibatasi sehingga tidak mengejar waktu ketika aplikasi tidak aktif.
- Hilang fokus/tab tersembunyi menghentikan proses menunggu. **Batalkan**, Esc, membuka menu/jurnal/peta/tas, perubahan kontrol/wilayah, dan Kembali ke Pos membatalkan proses belum sah. Input lari dibersihkan dan perlu input baru sesudahnya. Reload selalu idle di pos aman; catatan yang sudah sah tetap ada. Tidak ada ikan atau tali ganda yang tersisa.
- `riverWorld.ts`: aset geometri lokal, tiga siluet, 14 garis air, tiga ikan dekoratif, tali dengan buffer posisi yang dipakai ulang, pelampung, serta animasi tangkap/lepas sederhana. Ikan dekoratif tidak menentukan misi. Pembaruan hanya selama W04 aktif. Pengurangan gerakan mengurangi dekorasi/goyangan tanpa menyembunyikan alat dan status.
- Satu renderer, input, navigasi, dan loop permainan tetap digunakan. Sumber daya grup wilayah termasuk material/geometri `Line` dilepas saat berpindah; geometri/material karakter dan alat bersama tetap disimpan sesuai pemiliknya.
- Panel pancing kecil di sisi layar lebar atau bawah layar potret memberi ruang melihat karakter. Pada layar lanskap pendek, kartu memakai model 3D dunia sebagai ilustrasi agar tombol tetap terjangkau dan Pengaturan tidak tertutup. Formulir panjang dapat digulir. Tidak perlu menahan tombol sambil menggerakkan kamera.

## Penyimpanan dan kompatibilitas

IndexedDB `jelajah-sains`, **skema 1**, store `saves` tetap dipakai. Rekaman baru **S13** ditulis bersama M01/M14/W03-LOG01/world secara atomik. Tidak ada upgrade skema atau penghapusan key lama. Animasi, input Shift, dan mode lari tidak disimpan.

Cadangan baru **versi 4**, berbeda dari versi skema DB. Impor v1 hanya memulihkan M01; v2 M01/M14/world; v3 tiga misi/world. S13 yang tidak dicakup tetap ada. V4 memvalidasi seluruh data sebelum mengganti state, termasuk ID, urutan/kuota, dataset, pelepasan, upaya ciri, prasyarat, kesimpulan, serta hadiah. Riwayat hadiah pertama digabung monoton; reset S13 tidak menghapusnya.

## Hasil pengujian

Unit test terbaru: **128 lulus**. Build produksi: **lulus** (TypeScript + Vite). Suite browser lengkap: **27/27 lulus** (12,2 menit), mencakup keempat wilayah dan fitur lama. Setelah peninjauan layar HP, **4/4 kasus W04 lulus ulang** (2,6 menit) untuk memastikan pesan koreksi tetap terlihat serta panel lanskap memberi akses ke Pengaturan. Ada peringatan ukuran chunk Three.js bersama >500 kB yang sudah ada sebelumnya; build tetap berhasil. Pengujian browser memakai Chromium sistem dengan WebGL 2 melalui SwiftShader, bukan GPU/perangkat sekolah.

Cakupan pemeriksaan:

- Unit: tiga catatan per titik, dataset deterministik, pergantian lokasi, pilihan salah, transaksi catat/lepas ganda, tabel dari rekaman, larangan selesai tanpa bukti, hadiah sekali, validasi impor rusak, migrasi v1–v4 (termasuk fixture v3 dari pengiriman gerobak W03 yang benar-benar selesai), pause/cancel/session, semua pasangan pendekatan, dan tabrakan lari tepian pada interval 120/60/30/10 Hz.
- IFP 1440×960: dari gerbang Kota, penerimaan/materi/pinjaman/rencana, enam sesi memancing bergantian A/B, perbaikan jawaban ciri/rencana/kesimpulan, jurnal/diagram/refleksi, reload, ekspor v4, penolakan impor rusak, impor v1/v2/v3, reset terpisah, dan kembali Kota. Fixture lama M01/M14 dipakai untuk membuktikan progres tetap ada.
- Laptop 1440×960: keyboard tombol, catatan tanpa input bergerak, pembatalan, blur/focus terkontrol, reload saat mengamati, tabrakan air, pancing berikutnya tetap sama, dan pemulihan Shift berlari.
- HP 390×844 dan 844×390: input dua jari analog/kamera, toggle lari, navigasi dermaga, model/tali/kartu terlihat, catat/lepas, pemulihan Jalan, dan lebar halaman.
- Regresi: seluruh pengujian lama M01/M14/Rimba, neraca air, ember/gerobak, kamera, karakter/galeri, dan kontrol lari ikut dijalankan.

## Screenshot dan cuplikan

Semua bukti berasal dari browser. Tidak ada klaim sebagai pengujian HP atau IFP fisik.

| Bukti | Tautan |
| --- | --- |
| Wilayah dan Kak Lestari | [Gambar](evidence/river/01-region.png) |
| Pancing, tali, pelampung, indikator Tarik | [Gambar](evidence/river/02-line-and-float.png) |
| Model dan kartu ciri | [Gambar](evidence/river/03-observation.png) |
| Hasil sebagian dan Belum diamati | [Gambar](evidence/river/04-partial-results.png) |
| Tabel enam sampel | [Gambar](evidence/river/05-table.png) |
| Diagram batang dari jurnal | [Gambar](evidence/river/06-chart.png) |
| S13 selesai 50 XP | [Gambar](evidence/river/07-complete.png) |
| HP potret siap menarik / mengamati | [Siap](evidence/river/08-hp-portrait-ready.png) · [Amati](evidence/river/09-hp-portrait-observing.png) |
| HP lanskap siap menarik / mengamati | [Siap](evidence/river/08-hp-landscape-ready.png) · [Amati](evidence/river/09-hp-landscape-observing.png) |
| Proses memancing, tarik, catat, dan pelepasan | [Video WebM](evidence/river/motion/fishing-process.webm) |
| Hasil pemeriksaan | [JSON](evidence/river/verification.json) |
| Data akhir alur IFP | [JSON](evidence/river/final-state.json) |

Reproduksi gambar melalui `CAPTURE_RIVER_EVIDENCE=1 npm run test:e2e -- tests/river.spec.ts`. Setelah alur tersebut menghasilkan final-state.json, jalankan `node scripts/capture-river-evidence.mjs` dengan server 5173 aktif untuk cuplikan. `EVIDENCE_ORIGIN` dapat diganti. Cuplikan 9,3 detik (WebM VP9 960×600) memakai fixture rencana siap, lalu merekam satu siklus memancing lewat tombol browser setelah navigasi ke titik A; alur enam pengamatan diuji terpisah dari awal di E2E.

## Keterbatasan

HP/IFP diuji sebagai simulasi viewport dan sentuhan browser. Fokus hilang diuji melalui event browser terkontrol karena headless tidak mewakili perpindahan fokus OS/perangkat fisik. Belum ada benchmark FPS, baterai, panas, GPU fisik, keterbacaan dari belakang kelas, atau akses LAN antarperangkat. Diagram dan air bersifat sederhana; ikan dekoratif mengambang sebagai siluet model, bukan simulasi ekologi/pergerakan bawah air. Umpan peluang, spesies nyata, fisika tali, berenang, perahu, dan audio berada di luar tahap ini. Materi masih perlu telaah guru sebelum pemakaian kelas.
