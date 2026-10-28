# W01 / M02 — Persediaan Es Pasar

28 Oktober 2026, Asia/Bangkok. Dikembangkan dari baseline W08/M07 `afda146`, setelah memeriksa main terbaru. AGENTS.md tidak ditemukan. Perubahan disiapkan pada branch `feat/m02-market-ice` untuk ditinjau. M02 adalah satu misi utama dengan tiga checkpoint dan satu hadiah 100 XP. Tidak ada wilayah baru atau NPC baru; Pak Wira mendampingi dan Bu Nara menerima kiriman. S02, M03, S14, M16 dan M17 tetap memiliki status masing-masing.

## Cara mencoba

1. Buka game melalui peluncur yang sudah tersedia. Pilih **M02 · Persediaan Es Pasar** pada Misi aktif, lalu **Peta → Pak Wira** dan **Terima M02**.
2. Kunjungi **Buku IPA pasar** dan **Catatan pasar**, di dua tempat berbeda. Baca dan catat empat kartu.
3. Pada **Es & penguapan**, periksa alat, sampel dan tara. Siapkan es tertutup, simpan prediksi, Jalankan, Amati, Baca neraca ditara, pilih pengamatan lalu Catat. Berikutnya siapkan sampel air terbuka terpisah, prediksi, Jalankan, Amati, pilih penjelasan dan Catat. Prediksi boleh diperbaiki setelah Amati sebelum Catat; dugaan awal tetap di jurnal.
4. Pada **Massa & volume**, pilih ketiga sampel dalam urutan bebas. Sampel yang dipilih berada pada neraca; bingkai volume menandai sampel setelah dibaca. Periksa massa isi dan volume sampel sebelum **Hitung ρ dan Catat**. Bandingkan massa jenis C terhadap B dan A terhadap C. Checkpoint kedua baru sah setelah perbandingan yang sesuai.
5. Pada **Uji wadah es**, pilih sistem dinding sebagai faktor. Untuk setiap A/B/C: Ambil wadah → Isi sampel 1.000 g → Prediksi → Jalankan → Amati → Baca neraca → Catat. Sesi dipulihkan setelah pencatatan; tidak menghasilkan paket kiriman.
6. Pada **Kemas kiriman**, pilih wadah dan alasan berdasarkan jumlah es padat. Kemas satu paket. Bawa melalui jalan pasar ke **Bu Nara**. **Periksa hasil interval distribusi**, lalu **Serahkan paket**. Memilih C saja belum membuktikan pengiriman. A/B dapat dicoba, tetapi belum memenuhi 750 g es padat pada dataset.
7. Kembali ke **Pak Wira**, sampaikan kesimpulan berbukti dan simpan refleksi bila diinginkan. M02 memberi 100 XP hanya pertama kali.

Gunakan Peta atau kartu misi untuk berjalan otomatis; avatar tetap menempuh jalan dan menghindari meja/bangunan. Tiba di stasiun belum menambah bukti. Tombol Amati, Baca dan Catat tetap harus digunakan.

## Kontrol dan pemulihan

WASD/panah, Shift, E dan kamera lama tetap. Kecepatan jalan 5,2 dan lari 8,0 unit/detik tidak berubah. Panel memakai Tab, panah pada pilihan, dan Enter. HP memakai analog serta kamera dengan jari terpisah; IFP memakai tombol dan tujuan tetap. Tidak ada hover, drag wajib, stamina atau penilaian kecepatan.

**Mode langkah** dipilih sebelum Jalankan; empat langkah menyelesaikan presentasi tanpa menunggu waktu nyata. Pengurangan gerakan mengaktifkan pendekatan ini. Pilihan mode dikunci ketika pengurangan gerakan aktif atau selama satu animasi berjalan agar perpindahan ke langkah tidak memundurkan gambar. Menu, blur dan tab tersembunyi tidak memajukan percobaan. Menutup panel atau membatalkan sebelum Catat memulihkan sampel tanpa bukti baru. Kamera detail memakai kamera yang sama, menyembunyikan label yang menutupi alat, dan mengembalikan preferensi eksplorasi sesudahnya.

Paket **M02-ICE-001** terlihat pada socket tangan saat dibawa. Ukuran karakter tidak berubah. Saat alat lain memerlukan tangan kanan, tampilan paket disimpan sementara lalu kembali saat berjalan. **Tas → Pulihkan paket belum terkirim** mengembalikannya ke kios. Reload, Kembali ke Pos atau perpindahan wilayah juga memulihkan paket yang belum diterima ke kios. Bukti uji dan pilihan wadah tetap ada. Paket yang sudah diterima tetap di penerima. Pemulihan tidak membuat bukti penyerahan.

## Model perubahan wujud

Percobaan tertutup dimulai dengan **100 g es**. Wadah menahan seluruh air, tanpa kebocoran atau penguapan. Setelah mencair:

| Pembacaan | Massa |
| --- | ---: |
| Isi, setelah tara | 100 g |
| Wadah/tara | 40 g |
| Isi + wadah/bruto | 140 g |

Massa isi tidak dikacaukan dengan massa wadah. Bentuk es menyusut dan air cair muncul; zat tidak dihapus dari model. Massa air cair akhir dihitung dari massa awal yang sama. Sesi penguapan memakai alat terbuka dan sampel terpisah. Sebagian cairan berpindah ke udara; tidak ada klaim massa cairan dalam wadah terbuka selalu tetap, angka laju penguapan, atau kebutuhan mendidih.

Model partikel memakai dua belas penanda H₂O dengan ID stabil dan ukuran sama. Jumlah penanda bukan jumlah molekul dalam sampel nyata. Jarak antartitik bersifat kualitatif dan tidak digunakan untuk menghitung massa jenis pada tabel. Es memiliki susunan teratur yang lebih renggang; cairan lebih rapat dan tidak tersusun sebagai kisi es, dengan pergeseran ringan; sebagian penanda gas berjauhan dan bergerak. Mode langkah mengurangi gerak dekoratif, tetapi keadaan pengamatan sama. Gas air sebenarnya tidak terlihat; penanda pembesaran bukan kabut putih. Model tidak menggambarkan molekul membesar, mengecil atau berganti identitas.

Alat dan sampel visual diperbesar agar terbaca. Volume diperoleh dari pembacaan alat virtual, bukan mengukur piksel atau ukuran balok di layar. Di dalam perbandingan massa jenis, rasio volume C terhadap A tetap dua, bukan rasio panjang dua.

## Massa jenis dan satuan

`marketModel.ts` memakai **ρ = massa / volume sampel**. Konversi eksplisit: 1 g = 0,001 kg; 1 cm³ = 0,000001 m³. Model, tabel dan validator mengambil parameter yang sama.

| Sampel | Massa | Volume sampel | Massa jenis |
| --- | ---: | ---: | ---: |
| A · es | 92 g | 100 cm³ | 0,92 g/cm³ |
| B · air cair | 100 g | 100 cm³ | 1,00 g/cm³ |
| C · es | 184 g | 200 cm³ | 0,92 g/cm³ |

Volume es merupakan volume padatan, bukan kapasitas wadah atau tumpukan dengan celah udara. Nilai es dan air cair adalah pendekatan pada kondisi acuan berbeda, bukan nilai tepat pada semua suhu. C bermassa lebih besar daripada B, tetapi massa jenisnya lebih kecil. A dan C memiliki massa jenis sama pada kondisi latihan. Ini tidak mengubah atau menyelesaikan S14/M16.

## Wadah dan interval distribusi

Massa awal **1.000 g es** sama pada tiga sistem. Bentuk es, kondisi awal, lingkungan, ukuran ruang dalam dan keadaan tutup dikendalikan. Yang dibandingkan adalah sistem dinding. Semua wadah tertutup menahan seluruh air, dengan penguapan diabaikan.

| Sistem dinding | Es setelah 20 menit virtual | Air cair | Massa isi total |
| --- | ---: | ---: | ---: |
| A · logam | 200 g | 800 g | 1.000 g |
| B · plastik | 600 g | 400 g | 1.000 g |
| C · berinsulasi | 800 g | 200 g | 1.000 g |

Ini **dataset latihan yang ditetapkan**, bukan hasil pengujian produk atau hukum umum bahan. Insulasi memperlambat masuknya kalor; tidak menciptakan dingin atau mencegah pencairan selamanya. Angka sisa es ditetapkan pada konten, sedangkan air cair dihitung dari massa awal dikurangi massa es. Neraca total tetap 1.000 g pada ketiganya.

Sampel latihan tidak dimasukkan ke tas sebagai persediaan. Kios mengemas satu paket terpisah dengan satu ID tetap. Saat dibawa, status awalnya 1.000 g es. **Periksa hasil** di Bu Nara menjalankan satu interval distribusi tetap **20 menit virtual** dan menampilkan hasil dataset. Penyerahan memerlukan paket, jarak membawa nyata sedikitnya 2 m, posisi dalam jangkauan Bu Nara, hasil diperiksa dan es padat sedikitnya 750 g. Jarak minimum hanya memverifikasi perpindahan, bukan skor IPA atau waktu tantangan.

Lama berjalan, membaca, jeda, tab tersembunyi atau waktu offline tidak mengurangi es. Tidak ada pencampuran waktu nyata dengan data 20 menit virtual. A/B tetap memiliki total 1.000 g, tetapi ditolak karena es padatnya kurang. Pemain dapat memulihkan paket ke kios dan mencoba pilihan yang sesuai. Pengesahan terjadi satu kali ketika paket diterima, bukan saat memilih wadah atau mencapai tujuan.

## Jurnal dan penyimpanan

Jurnal membedakan pengamatan dengan penjelasan, menyimpan prediksi awal, upaya salah dan perbaikan, tiga data massa/volume, tiga data wadah, alasan pilihan, jarak/bukti pengiriman, kesimpulan serta refleksi opsional. Hasil belum diperoleh bertuliskan **Belum diamati**, **Belum diukur** atau **Belum diuji**. Refleksi tidak dinilai dengan kata kunci.

M02 memakai rekaman tersendiri dalam transaksi IndexedDB **skema 1**, bersama enam belas misi lama dan world. Cadangan baru **v17** menerima seluruh **v1–v16**. Cadangan yang tidak mencakup M02 mempertahankan progresnya. Parser mereplay sejarah, menghitung ulang massa/massa jenis, memeriksa urutan, posisi penyerahan, paket dan receipt sebelum mengganti data aktif. Animasi yang belum disahkan dibatalkan saat reload atau impor; paket belum diterima dipulihkan ke kios ketika posisi pemain dipulihkan. Tidak ada hasil offline.

Reset meminta konfirmasi dan hanya mengulang M02. Riwayat hadiah pertama tetap, sehingga reset, impor atau pengulangan tidak menggandakan 100 XP. S02 dan M03 tidak ditambahkan sebagai selesai. Status M16 tetap memakai completed empat episode, sedangkan M17 tiga episode.

## Struktur implementasi

- `marketContent.ts`: materi, parameter, dataset dan pilihan terstruktur.
- `marketModel.ts`: massa isi/tara/bruto, campuran dan massa jenis dari satu sumber.
- `marketMission.ts`: checkpoint, urutan bukti, transaksi paket, posisi dan hadiah.
- `marketSession.ts`: presentasi memakai delta loop World dan mode langkah.
- `marketRegion.ts`: titik pendekatan, tapak meja dan pemeriksaan kedekatan bersama.
- `marketWorld.ts`: visual lokal, molekul ber-ID tetap dan attachment paket.
- `marketUI.ts`: dialog, tabel, jurnal, Tas dan tombol/daftar.

Root Kota memiliki meja dan model baru; sumber daya miliknya dilepas melalui mekanisme wilayah lama. Geometri/material dipakai ulang dan tidak dibuat setiap frame. Attachment paket dibuat satu kali bersama pemain. Tidak ada renderer, loop permainan, input global, backend, login, CDN atau dependensi baru. Bangunan pasar memakai tapak lama; satu bangku dekoratif digeser untuk memberi ruang meja. Seluruh tujuan M01 dan gerbang tetap dapat dicapai.

## Sumber ilmiah dan keterbatasan akses

Upaya telaah **28 Oktober 2026**:

| Acuan USGS | Keperluan telaah | Hasil akses |
| --- | --- | --- |
| [Water Density](https://www.usgs.gov/water-science-school/science/water-density) | Massa per volume, es dan air, pengaruh kondisi | CONNECT ditolak 403; isi halaman tidak diperoleh |
| [Evaporation and the Water Cycle](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle) | Perpindahan air cair ke udara, penguapan | CONNECT ditolak 403; isi halaman tidak diperoleh |

Tautan adalah acuan yang diminta untuk pemeriksaan, bukan klaim bahwa halaman terkini sudah dibaca. Telaah primer langsung belum berhasil dan perlu dilengkapi ketika akses tersedia. [Catatan akses](evidence/market/source-access.json) mencatat kegagalan tersebut. Konsep serta angka awal mengikuti spesifikasi tugas; hubungan massa/volume dan neraca diuji secara internal. Dataset wadah tidak diklaim berasal dari pengukuran USGS. Tidak ada aset gambar dari USGS atau pihak ketiga baru.

## Hasil pemeriksaan dan bukti visual

Pemeriksaan 28 Oktober 2026 pada Linux, Node.js 24.19.0 / npm 11.9.0, Chromium 154 dan SwiftShader:

| Pemeriksaan | Hasil final |
| --- | --- |
| `npm test` | 700 lulus, 21 berkas: massa, satuan, urutan bukti, paket, receipt, impor dan seluruh aturan lama |
| `npm run test:launcher` | 14 lulus; server statis, port, jalur, kesiapan build dan promosi build |
| `npm run build` | TypeScript dan build produksi lulus |
| `npm run test:e2e` | 90 skenario lulus: 84 regresi lama dan 6 M02 |
| Pemeriksaan browser akhir terarah | 10 lulus: 6 M02 dan 4 produksi/galeri; pengulangan dari suite 90, bukan skenario unik tambahan |
| `npm run prepare:local` | Lulus; build pengganti dibuat di staging dan dipromosikan untuk peluncur harian |
| Bukti produksi | Alur nyata dari checkpoint penerimaan/sumber, model bergerak, pengukuran, wadah, pengiriman dan jurnal; nol error browser atau permintaan aset luar |

Kode dibekukan selama regresi 90 skenario. Sesudahnya, M02 disempurnakan agar prediksi dapat diperbaiki secara opsional **setelah Amati**, dengan dugaan awal tetap tersimpan. Keterangan alat/sampel yang diperbesar dan mode langkah saat pengurangan gerakan aktif juga diperjelas. Neraca dan bingkai volume pada meja dibuat lebih jelas dalam scene yang sama. Angka fisika, penyimpanan, navigasi, kamera, input global, aturan pengiriman, renderer dan loop global tidak diubah sesudah regresi luas. Seluruh unit, build melalui prepare dan sepuluh skenario browser terkait dijalankan kembali setelah koreksi terakhir. [Verifikasi dan hash sumber/build](evidence/market/verification.json) mencatat versi yang diperiksa serta lingkup pengujian.

Alur browser lengkap benar-benar mengunjungi NPC, dua sumber dan semua meja. Uji mencair mencatat 100 g isi, 40 g tara dan 140 g bruto. Tiga sampel diukur dalam urutan C/A/B. Tiga wadah diuji dalam urutan B/A/C. Wadah A dikemas dan dibawa, lalu ditolak karena hanya 200 g es; kemudian C dibawa dan diterima dengan 800 g es. Reset, reload setelah checkpoint, reload saat membawa, impor seluruh v1–v16, data campuran yang diubah, koreksi jawaban dan hadiah pertama diperiksa.

Enam belas rekaman lama dibandingkan sebelum/sesudah M02 terhadap fixture v16; hanya timestamp simpan M01 dikecualikan. M01 dan M14 juga dijalankan sampai selesai pada regresi luas. M16/M17 tetap tuntas menurut episode masing-masing pada fixture yang sudah tuntas. S02/M03 tidak ditambahkan sebagai hasil otomatis. Berpindah Kota–Kebun saat membawa paket memulihkannya satu kali ke kios dan mempertahankan bukti. Analog dan kamera dua jari diperiksa bersama paket pada HP potret/lanskap.

Bukti berikut berasal dari game, bukan ilustrasi rancangan:

- [Pasar dan stasiun](evidence/market/20-production-market.png), [pencairan tertutup dan tara](evidence/market/21-production-closed-melt.png), [penguapan terbuka dan partikel](evidence/market/22-production-open-evaporation.png).
- [Pembacaan massa/volume pada alat](evidence/market/23-production-density-reading.png) dan [tabel massa jenis](evidence/market/23-production-density.png).
- Wadah [A](evidence/market/24-production-container-A.png), [B](evidence/market/24-production-container-B.png), dan [C](evidence/market/24-production-container-C.png).
- [Paket pada socket tangan](evidence/market/25-production-parcel-side.png), [hasil distribusi dan penerima](evidence/market/26-production-delivery.png), serta [jurnal dari data sah](evidence/market/27-production-journal.png).
- Bukti jalur salah dan koreksi: [kiriman A yang ditolak](evidence/market/07-rejected-A.png), [cadangan UI selesai v17](evidence/market/completed-v17.json). Cadangan ini adalah data pengujian; ekspor progres sendiri sebelum mencoba mengimpornya.
- Viewport eksperimen: [HP potret 390×844](evidence/market/28-production-390-melt.png), [HP lanskap 844×390](evidence/market/29-production-844-evap.png), [IFP 1920×1080](evidence/market/30-production-1920-density.png).
- [Cuplikan perubahan wujud, wadah dan pengiriman](evidence/market/motion/melting-density-containers-delivery.webm), [metadata rekaman](evidence/market/motion/recording.json), dan [tiga siklus Kota–Kebun](evidence/market/resource-cycles.json).

Reproduksi bukti: `npm run prepare:local`, lalu `CAPTURE_MARKET_EVIDENCE=1 npm run test:e2e -- tests/market.spec.ts tests/production.spec.ts` dan `node scripts/capture-market-evidence.mjs`. Contoh variabel lingkungan memakai shell Linux. Skrip bukti memerlukan Chromium dan ffmpeg sebagai alat pemeriksaan; keduanya bukan syarat bermain harian.

## Keterbatasan dan serah terima

HP/IFP di atas adalah **simulasi viewport browser**, bukan perangkat fisik. BAT Windows, koneksi LAN dari perangkat lain, keterbacaan kelas dan performa GPU HP/IFP belum diuji langsung di lingkungan Linux ini. SwiftShader bukan tolok ukur FPS perangkat sasaran. Build masih memberi peringatan chunk JavaScript di atas 500 kB; build tetap berhasil.

Kedua sumber USGS tidak berhasil dibaca karena CONNECT 403. Telaah primer langsung belum selesai; tautan/tanggal/keterbatasan dicatat tanpa mengklaim isi terkini telah diverifikasi. Dataset wadah adalah parameter permainan. Model partikel, neraca dan transfer kalor bukan simulasi molekul atau kalor rinci, dan hasil tidak menilai produk penyimpanan nyata.

Perubahan disiapkan pada branch tinjauan; main tidak digabung otomatis. ZIP sumber tidak memuat `node_modules` atau `dist` yang diabaikan Git. Node.js ≥22.12 dan npm ≥10 masih diperlukan. Pada Windows, ekstrak ZIP dan jalankan **SIAPKAN_ATAU_PERBARUI.bat**, lalu gunakan **JALANKAN_JELAJAH_SAINS.bat** untuk bermain harian. Jangan membuka `index.html` langsung. Origin harian tetap `http://localhost:5173`; IndexedDB tidak dihapus.
