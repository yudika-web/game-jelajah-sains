# W08 — Antariksa / M07 — Catatan dari Observatorium

28 Oktober 2026. Dikembangkan dari main `cdbe60f` tanpa mengembalikan branch. AGENTS.md tidak ditemukan. W08 adalah wilayah kedelapan dan lingkungan **simulasi ekspedisi**, bukan perjalanan antariksa seketika. M07 memiliki tiga checkpoint dalam satu misi, dengan satu hadiah 100 XP. M16 tetap mengikuti empat episode, M17 tiga episode. S22/S23/S24 tidak diselesaikan otomatis.

## Cara bermain

1. Pilih M07 jika ingin petunjuk. Pada Peta Kota, pilih **Observatorium / Antariksa**. Avatar mendekati bangunan observatorium, membaca pengantar dan memilih **Masuk Simulasi Antariksa**. Tidak ada prasyarat misi lain.
2. Temui **Bu Nara** di pos W08 dan terima M07. Baca dua kartu pada **Buku astronomi** dan dua kartu pada **Catatan astronomi**, di lokasi berbeda.
3. Pada **Rotasi Bumi**, simpan prediksi lalu **Buka alat**. Jalankan atau gunakan **Langkah ¼ putaran**. Di posisi menghadap cahaya, **Amati → pilih Siang → Catat pengamatan**. Di posisi membelakangi cahaya, lakukan hal yang sama untuk Malam. Posisi batas siang–malam bukan sampel wajib. Catat penjelasan rotasi untuk menyimpan checkpoint pertama.
4. Pada **Revolusi Bumi**, prediksi dan buka alat. Amati/Catat posisi 0°, 90°, 180° dan 270°. Selesaikan gerak sedikitnya satu putaran melalui langkah atau **Satu putaran otomatis**, lalu **Catat satu revolusi** dengan penjelasan satu tahun. Kembali ke posisi awal tidak menambah penghitung gerak. Empat posisi saja belum menyelesaikan checkpoint.
5. Pada **Fase Bulan**, prediksi dan buka alat. Bandingkan **Posisi Matahari–Bumi–Bulan** dengan **Penampakan dari Bumi**. Pada pandangan dari Bumi, Amati, pilih nama fase, lalu Catat. Gunakan **Langkah posisi Bulan** untuk Bulan baru, perbani awal, purnama dan perbani akhir. Tidak perlu menilai arah terang kiri/kanan atau mengejar waktu.
6. Periksa tabel pada **Jurnal & kesimpulan**, lalu sampaikan kesimpulan di terminal atau bersama Bu Nara. Refleksi opsional disimpan tanpa penilaian kata kunci. Hadiah 100 XP hanya sekali.
7. **Terminal kembali ke Kota** mengantar ke depan Observatorium. Semua bukti tetap tersimpan. **Kembali ke Pos Antariksa** memulihkan posisi tanpa membuat pengamatan.

Checkpoint yang sudah selesai dapat dibuka kembali dan model boleh diulang. Data sah tidak dihapus atau digandakan. Sebelum reload, tunggu indikator **Tersimpan**. Setelah reload, avatar berada di pos aman dan model sementara dibatalkan.

## Kontrol dan jeda

Laptop memakai WASD/panah, Shift dan E seperti sebelumnya. Panel memakai Tab, panah pada pilihan, dan Enter. HP/IFP memakai tombol besar, pilihan berlabel dan tujuan peta; analog/kamera dua jari tetap untuk eksplorasi. Tidak ada hover atau drag wajib. Dek dibatasi oleh navigasi, tanpa penerbangan bebas atau keluar ke ruang hampa.

**Jalankan**, **Jeda**, **Langkah**, **Kembali ke posisi awal**, **Amati** dan **Catat** dipisahkan. Waktu animasi hanya berasal dari delta aktif loop World. Kehilangan fokus atau tab tersembunyi menghentikan waktu. Menu lain, penutupan, perpindahan wilayah, pemulihan atau reload membatalkan hasil belum disahkan. Penutupan panel memerlukan input baru. Pilihan pengurangan gerakan mempertahankan pengamatan melalui langkah tetap; tidak mengubah konsep atau hasil.

Avatar berjalan di dek sebagai konvensi permainan. Ini tidak mengajarkan bahwa antariksa tidak memiliki gravitasi. Audio tidak ditambahkan dan tidak ada klaim bunyi merambat melalui ruang hampa.

## Geometri, cahaya dan waktu model

**Ukuran, jarak, dan kecepatan model tidak berskala.** Matahari, Bumi dan Bulan memiliki radius tampilan berbeda: 0,75 / 0,35 / 0,12 unit. Angka ini bukan perbandingan diameter nyata. Orbit Bumi dibuat lingkaran, poros Y tetap dan tidak dimiringkan untuk pelajaran musim. Model tidak menjelaskan musim sebagai akibat jarak dekat/jauh.

`astronomyModel.ts` menghitung posisi Matahari, Bumi, Bulan, normal penanda ekuator, arah cahaya pada setiap benda dan arah pengamat dari Bulan menuju Bumi. Shader permukaan membaca arah cahaya dari keadaan yang sama; sinar pada setiap bola dianggap sejajar dari arah pusat Matahari, tanpa perhitungan penumbra dari ukuran cakramnya; cahaya dekoratif dunia tidak menentukan siang/malam atau fase. Penanda ikut rotasi tubuh Bumi. Orbit dan arah gerak memakai koordinat yang sama dengan model.

- Penanda ekuator menghadap Matahari → siang; membelakangi → malam. Gerak lain dijeda pada alat, bukan berhenti di alam. Konteks waktu dasar: **sekitar 24 jam** per siklus siang–malam.
- Revolusi mengubah posisi Bumi mengelilingi Matahari, sedangkan rotasi mengubah orientasinya. Penghitung integer miliderajat menjumlahkan gerak maju yang benar-benar dijalankan/di-step pada model. Reset posisi mengembalikannya ke nol. Bukti tahun memerlukan empat posisi, akumulasi gerak ≥360° dan pengesahan. Konteks: **sekitar 365 hari**.
- Untuk fase, `L` adalah arah dari Bulan ke Matahari dan `O` arah dari Bulan ke pengamat di Bumi. Bagian terang geometris dihitung dari **(1 + L·O)/2**. Nama fase utama ditentukan dari geometri dan sisi lintasan, bukan gambar jawaban terpisah. Tampilan dari Bumi memakai kamera yang sama pada posisi instrumen di sisi Bumi menuju Bulan.
- Karena jarak Matahari dipendekkan pada alat, posisi perbani ditentukan dengan menyelesaikan sudut Matahari–Bulan–pengamat 90°, sehingga fraksi terang sekitar setengah. Sudut posisi orbitnya tidak dipaksakan 90° apabila geometri tampilan tidak mendukungnya. Posisi baru/purnama mendekati 0/100%; kemiringan membuat nilainya tidak harus persis nol/satu. Indikator memakai tanda perkiraan dan pembulatan persen.
- Orbit Bulan miring **5,1°** dengan arah simpul contoh tetap. Ukuran/jarak diperbesar/diperkecil, sehingga **bayangan antarbenda dan gerhana tidak disimulasikan**. Jangan menafsirkan kesejajaran gambar tak berskala sebagai gerhana. Gerhana memerlukan kondisi kesejajaran tambahan; fase biasa bukan bayangan Bumi.
- Konteks siklus fase **sekitar 29,5 hari**, berbeda dari periode orbit relatif bintang **sekitar 27,3 hari**. Gerak Bumi juga berperan. Alat memisahkan gerak untuk pengamatan dan tidak menghitung ephemeris atau mengonversi durasi animasi menjadi tanggal nyata.

Citra instrumen dari Bumi hanya menampilkan Bulan yang diperbesar; benda lain, orbit dan avatar disembunyikan melalui layer kamera sementara. Sumber cahaya model tetap sama. Ini bukan foto langit atau simulasi gerhana. Preferensi jarak kamera eksplorasi tidak berubah dan dipulihkan ketika panel ditutup.

## Sumber primer dan aset

Upaya pemeriksaan **28 Oktober 2026**:

| Sumber NASA | Pokok yang dirujuk | Status akses lingkungan |
| --- | --- | --- |
| [Earth Facts](https://science.nasa.gov/earth/facts/) | Rotasi, revolusi, panjang hari/tahun | CONNECT ditolak 403; tidak ada respons isi halaman yang dapat diverifikasi |
| [Moon Phases](https://science.nasa.gov/moon/moon-phases/) | Pencahayaan dan penampakan dari Bumi | CONNECT ditolak 403 |
| [Top Moon Questions](https://science.nasa.gov/moon/top-moon-questions/) | Cahaya pantulan dan periode | CONNECT ditolak 403 |
| [Eclipses](https://science.nasa.gov/moon/eclipses/) | Perbedaan fase dan bayangan/gerhana | CONNECT ditolak 403 |

Tautan dan tanggal upaya dicatat, tetapi isi primer terkini **belum berhasil dibaca langsung** pada lingkungan ini. Telaah primer langsung tetap merupakan keterbatasan; tidak diganti dengan klaim bahwa NASA telah diverifikasi. Angka dasar dan ketentuan konseptual mengikuti spesifikasi tugas, dengan pemeriksaan matematis internal terhadap geometri.

Semua bentuk, tekstur prosedural, permukaan, orbit dan bintang dibuat lokal. Tidak memakai gambar NASA atau aset pihak ketiga baru; tidak ada CDN/API saat bermain. Three.js tetap dependensi proyek yang sudah ada. Tidak diperlukan unduhan gambar astronomi saat membuka game.

## Struktur dan penyimpanan

`spaceContent.ts` menyimpan parameter/materi. `astronomyModel.ts` memisahkan posisi, arah cahaya dan hasil pengamatan dari renderer. `spaceMission.ts` memvalidasi peristiwa dan checkpoint; `spaceSession.ts` hanya menginterpolasi presentasi memakai delta World. `spaceWorld.ts` membangun visual. `spaceUI.ts` mengurus panel, tabel, pilihan fase dan jurnal. `spaceRegion.ts` mengatur batas dek serta titik pendekatan.

Satu renderer, satu loop World dan input global lama digunakan. Bu Nara memakai rig bersama. Posisi pemain tetap pada dek saat kamera instrumen aktif. Geometri/material wilayah dimiliki root wilayah. `disposeRegion.ts` menangani Mesh, Line, Sprite **dan Points** untuk melepas bintang; aset bersama karakter dilindungi oleh penanda kepemilikan yang sama seperti sebelumnya.

Rekaman M07 ditambahkan ke IndexedDB **skema 1**. Cadangan baru **v16** menerima seluruh versi **v1–v15**. Versi cadangan berbeda dari versi database. Cadangan lama yang tidak memuat M07 mempertahankannya. Parser mereplay peristiwa, menghitung ulang pengamatan, memeriksa gerak, urutan, jawaban dan receipt hadiah sebelum mengganti data aktif. Animasi/calon pengamatan tidak dilanjutkan setelah reload. Reset memerlukan konfirmasi, hanya M07, dengan riwayat hadiah pertama tetap ada.

## Pengujian dan bukti

Pemeriksaan pada 28 Oktober 2026, Linux, Node.js 24.19.0 / npm 11.9.0, Chromium 154 dengan SwiftShader:

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 646 pengujian lulus dalam 20 berkas, termasuk geometri, checkpoint, validasi impor dan kepemilikan aset |
| `npm run test:launcher` | 14 lulus; server Node, origin tetap, port terpakai, jalur dan promosi build |
| `npm run build` | Lulus pemeriksaan TypeScript dan build produksi |
| `npm run test:e2e` | 84 skenario browser lulus: seluruh misi, kendaraan, kontrol dan 5 skenario Antariksa |
| `npm run prepare:local` | Lulus; build pengganti dibuat di staging lalu dipromosikan, tanpa menghapus build lama sebelum pengganti siap |
| Pemeriksaan akhir terarah | 9 lulus: 5 Antariksa dan 4 produksi/galeri. Ini pengulangan dari suite 84, bukan 9 skenario unik tambahan |
| Perekaman produksi | Rotasi, satu revolusi, empat fase, tabel, empat ukuran layar dan tiga siklus Kota/Antariksa; tidak ada permintaan luar atau error browser |

Suite luas dijalankan pada sumber yang dibekukan. Setelahnya, satu perapian tampilan mempertahankan pilihan nama fase dan penjelasan yang sudah dipilih/dicatat saat panel dirender ulang. Model astronomi, aturan misi, penyimpanan, navigasi dan pelepasan aset tidak berubah. Unit, jalur persiapan build dan sembilan skenario terarah dijalankan ulang setelah perapian tersebut. Manifest/hash, data hasil, rincian gerak revolusi dan scope pemeriksaan ada di [verifikasi](evidence/space/verification.json).

Alur lengkap browser benar-benar mengunjungi Observatorium, Bu Nara, dua sumber dan tiga stasiun; menyimpan prediksi salah dan perbaikannya; mencatat siang/malam; merekam empat posisi serta gerak penuh; mengamati empat fase dari Bumi; reload pada setiap checkpoint; menyimpulkan dan kembali ke Kota. Bukti awal yang belum disahkan dibatalkan. Klik berulang tidak menggandakan rekaman. Reset mempertahankan receipt 100 XP. Impor geometri yang diubah ditolak tanpa mengganti progres. Kelima belas rekaman misi sebelum M07 dibandingkan dengan sesudah M07; hanya timestamp penyimpanan M01 dikecualikan. Status M16/M17 tetap benar.

Angka nyata dari cadangan hasil UI: fase baru/perbani awal/purnama/perbani akhir memiliki fraksi terang terbulatkan 2/500/999/500 per mil. Rekaman revolusi mencakup 0°/90°/180°/270° serta gerak terakumulasi sedikitnya satu putaran. Seluruhnya dihitung ulang oleh parser yang sama. [Cadangan selesai v16](evidence/space/completed-v16.json) merupakan bukti pengujian; jangan mengimpornya ke progres pribadi tanpa cadangan sendiri.

Bukti visual produksi menggunakan model dan renderer permainan:

- [Dek Antariksa](evidence/space/11-production-deck.png) dan [malam](evidence/space/12-production-night.png) / [siang](evidence/space/13-production-day.png).
- [Empat posisi orbit dan satu tahun](evidence/space/14-production-year.png).
- [Geometri posisi Bulan](evidence/space/15-production-position-first.png); penampakan [baru](evidence/space/16-production-phase-new.png), [perbani awal](evidence/space/16-production-phase-first.png), [purnama](evidence/space/16-production-phase-full.png), [perbani akhir](evidence/space/16-production-phase-last.png).
- [Jurnal data sah](evidence/space/17-production-data.png).
- Viewport sentuh [HP potret 390×844](evidence/space/18-production-390-first.png), [HP lanskap 844×390](evidence/space/18-production-844-full.png), dan [IFP 1920×1080](evidence/space/18-production-1920-last.png); [jurnal potret](evidence/space/19-production-journal-390.png).
- [Cuplikan rotasi, revolusi dan fase](evidence/space/motion/rotation-revolution-moon-phases.webm), [metadata rekaman](evidence/space/motion/recording.json) dan [tiga siklus sumber daya](evidence/space/resource-cycles.json). Cuplikan memperlihatkan gerak, bukan hanya gambar diam.

Reproduksi bukti: setelah `npm run prepare:local`, jalankan `CAPTURE_SPACE_EVIDENCE=1 npm run test:e2e -- tests/space.spec.ts tests/production.spec.ts`, lalu `node scripts/capture-space-evidence.mjs`. Variabel lingkungan contoh ini memakai sintaks shell Linux; skrip bukti memerlukan Chromium dan ffmpeg. Keduanya hanya alat pemeriksaan, bukan syarat bermain harian.

## Keterbatasan

Viewport browser **bukan pengujian HP/IFP fisik**. BAT Windows dan LAN dari perangkat lain belum diuji langsung pada lingkungan Linux ini. SwiftShader tidak mewakili FPS/performa GPU HP atau panel kelas. Pengujian memastikan fungsi dan keterbacaan pada ukuran yang disimulasikan, bukan sertifikasi semua perangkat.

Akses empat halaman NASA ditolak CONNECT 403; isi primer terkini belum berhasil diverifikasi. Geometri dipastikan lewat rumus, dot product dan uji renderer, dengan angka/konsep dasar mengikuti spesifikasi tugas. Telaah langsung sumber primer tetap perlu dilakukan saat akses tersedia. Rincian upaya ada di [catatan akses](evidence/space/source-access.json).

Build masih memberi peringatan chunk JavaScript di atas 500 kB; build tetap berhasil. Efek air/cahaya serta orbit sengaja sederhana; tidak ada gerhana, musim terperinci, mikrogravitasi, kendaraan antariksa atau misi sampingan baru. Semua aset bermain tersedia lokal.

ZIP sumber GitHub tidak memuat `node_modules` atau `dist` yang diabaikan Git. Node.js ≥22.12 dan npm ≥10 tetap diperlukan: pada Windows jalankan **SIAPKAN_ATAU_PERBARUI.bat** untuk penggunaan pertama/pembaruan, lalu **JALANKAN_JELAJAH_SAINS.bat** untuk bermain harian. Origin harian tetap `http://localhost:5173`; jangan membuka `index.html` langsung. Jalur persiapan tidak menghapus IndexedDB/progres.
