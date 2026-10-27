# W07 — Geopark / M13 — Pesan dari Geopark

27 Oktober 2026. Dasar pengembangan: main `3ebb17e`. AGENTS.md tidak ditemukan. Satu misi dengan tiga checkpoint, satu hadiah 100 XP. S19, S20 dan S21 tetap terpisah. Status M16 tetap berasal dari empat episode selesai saat ini; M17 dari tiga episode, tanpa hadiah bab tambahan.

## Cara bermain dan perjalanan

1. Pilih M13 pada kartu misi untuk mengikuti petunjuk dari Kota melalui Bengkel. M13 tetap aktif saat melewati Bengkel. Masuk Bengkel dari Kota. Dekati **Terminal kunjungan Geopark**, pilih **Berangkat ke Geopark**. Tidak ada prasyarat penyelesaian misi lain atau kendaraan baru. Kembali melalui terminal di pos Geopark.
2. Temui **Kak Raka** dan terima M13. Baca buku lapisan Bumi. Pada stasiun penampang, amati nama dan sifat lapisan, lalu susun dari luar ke dalam. Tombol bagian atau daftar urutan tersedia; tidak perlu drag.
3. Baca catatan gerak lempeng dan papan bentang alam pada lokasi berbeda. Pada setiap meja, simpan prediksi, **Jalankan model → Amati → pilih gejala → Catat hasil**. Urutan ketiga meja bebas. Jawaban keliru dapat diperbaiki dan upaya awal tersimpan.
4. Kembali ke Kak Raka untuk mengaktifkan latihan terjadwal. Latihan dimulai **setelah guncangan simulasi berhenti**, dengan pemberitahuan, tanpa guncangan kamera. Game tidak meramal gempa dari retakan visual.
5. Baca peta beserta legenda. Datangi dan periksa penanda A, B dan C. A melewati bangunan model rusak; C berada di bawah tebing dengan potensi jatuhan batu. Keduanya dipagari. B terbuka pada skenario.
6. Pilih jalur dan alasan berdasarkan kondisi. Tempuh B menuju titik kumpul. Tekan **Konfirmasi tiba kepada Kak Raka** di lokasi. Kedatangan memakai posisi dunia pemain, bukan sekadar jawaban, callback navigasi atau `moving=false`.
7. Sampaikan kesimpulan bersama Kak Raka. Refleksi opsional disimpan tanpa penilaian kata kunci. Hadiah pertama 100 XP; ulang/reset tidak menggandakannya.

Laptop memakai WASD/panah, Shift dan E seperti sebelumnya. Panel memakai Tab, panah pada daftar dan Enter. HP memakai analog/kamera dua jari dan tombol besar. IFP dapat memakai Peta atau kartu tujuan dan seluruh panel sentuh. Tidak ada hover, drag presisi, tuntutan kecepatan atau hukuman waktu.

## Model dan batas ilmiah

- Urutan: **kerak → mantel → inti luar → inti dalam**. Mantel terutama batuan padat yang dapat berubah bentuk dan mengalir sangat lambat pada waktu geologi. Inti luar cair; inti dalam padat.
- Lempeng litosfer mencakup kerak dan bagian paling atas mantel yang kaku. Lempeng tidak digambarkan mengapung pada lautan magma. Penampang memperbesar ketebalan agar terbaca: **ukuran lapisan tidak berskala**.
- Divergen: dua lempeng samudra menjauh, memperlihatkan kerak samudra baru.
- Konvergen: satu contoh samudra menunjam di bawah benua; palung dan zona subduksi. Tumbukan dua benua dapat berbeda.
- Transform: bergeser sejajar batas, penanda kedua sisi bergeser. Tidak ada gunung api otomatis.
- Animasi meja dipercepat, bukan laju lempeng alami. Gerak, label dan catatan memakai `geoparkContent.ts` dan `geoparkModel.ts` yang sama.
- Batu dekoratif tidak menghasilkan klasifikasi atau menyelesaikan S19. Pengamatan maket dibedakan dari informasi bentang alam.
- Peta adalah latihan skenario, bukan sertifikasi keselamatan lokasi nyata. Tidak ada ramalan tanggal, magnitudo atau lokasi gempa berikutnya. Tidak semua gempa menyebabkan tsunami.

## Sumber primer dan status pemeriksaan

Daftar pemeriksaan konten **27 Oktober 2026**:

| Sumber primer | Pokok yang dirujuk | Status akses lingkungan |
| --- | --- | --- |
| [USGS — The Science of Earthquakes](https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes) | Struktur Bumi, litosfer dan mekanisme gempa | HTTP 403 pada pengambilan langsung; isi terbaru belum dapat diverifikasi ulang |
| [USGS — Are tectonic plates floating on magma?](https://www.usgs.gov/faqs/are-tectonic-plates-floating-magma) | Mantel terutama padat; litosfer bukan rakit di lautan magma | HTTP 403; isi terbaru belum dapat diverifikasi ulang |
| [USGS — Inside the Earth](https://pubs.usgs.gov/gip/dynamic/inside.html) | Empat lapisan serta sifat inti | CONNECT ditolak 403 oleh akses jaringan lingkungan |
| [USGS — Understanding plate motions](https://pubs.usgs.gov/gip/dynamic/understanding.html) | Divergen, konvergen, transform | CONNECT ditolak 403 oleh akses jaringan lingkungan |
| [BMKG — Antisipasi Gempabumi](https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi) | Arahan setelah guncangan, menghindari bangunan rusak dan memperhatikan kondisi | HTTP 403; isi terbaru belum dapat diverifikasi ulang |

Tautan primer tetap dicantumkan untuk telaah guru/pengelola. Pembatasan akses tidak diganti dengan klaim bahwa halaman sudah dibaca. Materi menggunakan konsep dasar yang disebut di atas; telaah langsung atas halaman primer terkini masih merupakan keterbatasan serah terima.

## Checkpoint, pemulihan dan arsitektur

`geoparkContent.ts` menyimpan lapisan, arah, gejala, materi dan label; `geoparkModel.ts` menghitung pose model; `geoparkMission.ts` mengatur bukti dan checkpoint; `geoparkRegion.ts` mengatur lokasi/batas jalur; `geoparkWorld.ts` membangun visual; `geoparkSession.ts` mengelola waktu presentasi aktif; `geoparkUI.ts` menangani panel. Kak Raka memakai rig enam balok bersama, helm, rompi biru dan buku catatan.

Satu renderer, satu World loop dan input lama dipakai. Wilayah lama dilepas sesuai kepemilikan geometri/material; aset bersama karakter dipertahankan. Pengaktifan skenario membatalkan rute lama dan memperbarui penghalang navigasi serta visual pagar. Pemeriksaan swept movement lama juga berlaku ketika berlari.

Reload memulihkan pemain ke pos W07 dan membatalkan animasi belum disahkan. Lapisan sah, tiga hasil, peta, penanda dan kedatangan yang sudah dikonfirmasi tetap tersimpan. Pagar mengikuti progres latihan. **Kembali ke Pos Geopark** tidak menambah bukti kedatangan. Penutupan panel membatalkan percobaan sementara; kehilangan fokus/tab tersembunyi menghentikan waktu animasi. Input perlu diberikan ulang.

Cadangan **v15**, menerima v1–v14. IndexedDB tetap skema 1 dengan rekaman tambahan M13; versi cadangan tidak disamakan dengan versi skema database. Cadangan lama mempertahankan M13 saat ini. Validasi replay memeriksa urutan, model, posisi kedatangan, jawaban dan bukti hadiah sebelum mengganti progres. Reset hanya M13 dan memerlukan konfirmasi.

## Pengujian dan bukti

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | **596 lulus**, 19 berkas; 45 pemeriksaan baru Geopark |
| `npm run test:launcher` | **14 lulus**, Node.js pada Linux |
| `npm run build` | TypeScript dan build produksi berhasil |
| `npm run prepare:local` | Berhasil membangun ke staging dan mempromosikan build terbaru ke dist; dependensi sudah sesuai |
| `npm run test:e2e` | **79 lulus**, 37,6 menit, termasuk seluruh misi/mekanik lama |
| Pengulangan terarah akhir | **9 lulus**, 4,2 menit: M13 lengkap, keyboard, tiga viewport sentuh, serta empat viewport produksi/galeri tanpa internet |

Kode aplikasi dibekukan selama regresi 79 skenario. Sesudahnya ada perapian lima berkas: label kelas VIII dan kelanjutan petunjuk M13 melalui Bengkel; penjelasan aktivitas subduksi; pose membaca arah dari data yang sama; metadata pemilihan model; serta jurnal jawaban awal/perbaikan. Aturan bukti, checkpoint, penyimpanan dan penghalang tidak berubah. Unit test diulang, build diperbarui melalui jalur persiapan, lalu sembilan skenario relevan diperiksa kembali. Angka 79 dan 9 **tidak dijumlahkan sebagai skenario unik**.

Pemeriksaan mencakup urutan/sifat lapisan, gerak/gejala tiga batas, prediksi dan jawaban salah yang dipertahankan, pembatalan/kehilangan fokus, reload tiap bagian, klik ganda, konfirmasi posisi nyata, penghalang aktif dan pembatalan rute, hadiah sekali, reset, roundtrip v15 dan seluruh fixture v1–v14. Snapshot empat belas misi lama dibandingkan sebelum/sesudah M13; hanya timestamp autosave M01 yang diabaikan. Status M16 dan M17 tetap Tuntas ketika bukti lama lengkap, termasuk setelah reset M13.

Uji sentuh akhir juga menjalankan model Transform sampai Catat sebelum memeriksa jalur B dan jurnal. Pemeriksaan produksi memblokir permintaan luar dan membuka permainan serta galeri sembilan karakter. Layar diuji pada laptop 1440×960, produksi 1280×900, HP potret 390×844, HP lanskap 844×390 dan IFP 1920×1080. Ini **simulasi viewport Chromium**, bukan pengujian HP/IFP fisik.

## Screenshot dan cuplikan

| Bukti | Berkas |
| --- | --- |
| Wilayah dan Kak Raka | [Tampilan bermain](evidence/geopark/01-region.png) |
| Penampang dan urutan lapisan | [Penampang produksi](evidence/geopark/10-production-earth.png) |
| Tiga model meja | [Divergen](evidence/geopark/11-production-Divergen.png) · [Konvergen](evidence/geopark/11-production-Konvergen.png) · [Transform](evidence/geopark/11-production-Transform.png) |
| Peta dan konfirmasi lokasi | [Peta produksi](evidence/geopark/12-production-map.png) · [Titik kumpul](evidence/geopark/13-production-muster.png) |
| Model pada HP/IFP | [Potret](evidence/geopark/07-touch-model-390.png) · [Lanskap](evidence/geopark/07-touch-model-844.png) · [IFP](evidence/geopark/07-touch-model-1920.png) |
| Jurnal dan data produksi | [Laptop](evidence/geopark/14-production-journal-1440.png) · [Potret](evidence/geopark/15-production-data-390.png) · [Lanskap](evidence/geopark/15-production-data-844.png) · [IFP](evidence/geopark/15-production-data-1920.png) |
| Cuplikan gerak, pengamatan dan perjalanan | [WebM — tiga model dan jalur B](evidence/geopark/motion/plates-and-safe-route.webm) |
| Metadata pemeriksaan | [Rekaman](evidence/geopark/motion/recording.json) · [Siklus wilayah](evidence/geopark/resource-cycles.json) · [Verifikasi](evidence/geopark/verification.json) |

Cuplikan memakai server statis produksi dari dist, renderer dan kontrol yang sama. Persiapan lapisan/sumber dilakukan melalui UI sebenarnya pada M13 baru. Rekaman memperlihatkan eksplorasi, prediksi, gerak ketiga model, Amati/Catat, aktivasi latihan setelah guncangan berhenti, pemeriksaan penanda dan perjalanan B sampai konfirmasi lokasi. Cuplikan berdurasi **55,7 detik / 894 frame**, tanpa galat browser atau permintaan luar. Metadata mencatat waktu, frame dan lingkungan. Tiga siklus Bengkel/Geopark menunjukkan **1 root wilayah**, **62 geometri** dan **24 tekstur** pada setiap pemeriksaan setelah pemanasan; ini bukan tolok ukur FPS atau seluruh penggunaan memori.

## Keterbatasan

- Halaman primer USGS/BMKG terhalang akses 403; pemeriksaan langsung atas isi terkini belum selesai. Daftar sumber dan tanggal upaya dicatat di atas serta `source-access.json`.
- Tidak ada pengujian pada HP, IFP, Windows BAT atau koneksi LAN fisik. Pengujian server/peluncur dilakukan melalui Node.js di Linux; hasil browser memakai Chromium/SwiftShader.
- Build masih memberi peringatan chunk melebihi 500 kB. Performa perangkat sekolah, kenyamanan sentuhan fisik serta telaah guru tetap perlu diperiksa.
- Model kinematik tidak menyimulasikan tegangan batuan, besaran gempa atau keamanan lokasi nyata. Tidak ada prediksi gempa, klasifikasi batu dari warna, W08 atau misi sampingan otomatis.

Build lokal sudah diperbarui melalui jalur persiapan. ZIP sumber memerlukan Node.js dan **SIAPKAN_ATAU_PERBARUI.bat** setelah diekstrak; berikutnya gunakan **JALANKAN_JELAJAH_SAINS.bat**. Ini bukan EXE mandiri. Progres tetap berada pada origin browser yang sama.
