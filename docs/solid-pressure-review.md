# W03 / M16-E3 — Pijakan Aman Pos Rimba

> Pembaruan M16-E4: [Ponton Pengangkut Peralatan](pontoon-buoyancy-review.md) kini tersedia di W04. M16 hanya Tuntas jika completed E1/E2/E3/E4 saat ini semuanya true. Keterangan status/fitur pada laporan tahap di bawah merupakan catatan historis, bukan status bab mutakhir. S14 tetap terpisah.


27 Oktober 2026. Dikembangkan dari main `bb8ea22` tanpa mengembalikan branch ke versi lama. Tidak ditemukan AGENTS.md. Rancangan M16 mencakup luas pijakan, kedalaman, hidraulik dan gaya apung. Episode ini melengkapi tekanan padat melalui maket meja di pos aman. **M16 kini mengikuti completed keempat episode**; pengayaan gaya apung M16-E4 tersedia di W04. M17 tetap mengikuti completed ketiga episodenya; tidak ada hadiah bab tambahan.

## Cara bermain

1. Dari Kota, datangi gerbang Rimba dan masuk. Pilih **M16-E3** lalu temui Pak Damar dan terima episode. W03-LOG01 maupun misi lain bukan prasyarat.
2. Baca **Gaya dan Tekanan Berbeda** dan **Mengapa Luas Kontak Penting?** pada Buku tekanan padat. Baca **Rancangan Harus Memenuhi Semua Batas** pada Kebutuhan penopang.
3. Dekati **Gaya alat**, periksa gaya virtual tetap 400 N. Pada **Ukur penopang**, ukur lebar dan panjang A/B/C. Tidak perlu mengetik hitungan panjang.
4. Pilih **luas kontak** sebagai variabel. Gaya, jenis media, kondisi awal dan orientasi tetap. Pilihan gaya/media yang keliru dapat diperbaiki; upaya awal tetap ada.
5. Pilih penopang di rak atau maket saat beban terangkat dan media siap. Simpan prediksi tekanan dibanding A. **Letakkan beban → Amati bidang kontak → Catat hasil → Angkat beban & siapkan ulang media**. Ulangi ketiganya dalam urutan bebas.
6. Setelah tiga hasil sah, jalankan **Geser pada jalur**. Tantangan memerlukan tekanan maksimal 6 kPa dan lebar yang muat dalam 30 cm sekaligus. Panjang penopang selalu sejajar jalur. A muat tetapi gagal tekanan; C tertahan di gerbang ukur; B memenuhi keduanya. Pilihan B saja tidak mencukupi tanpa menjalankan, mengamati dan mencatat uji.
7. Pulihkan Maket, lalu sampaikan lima kesimpulan kepada Pak Damar. Jawaban salah tersimpan dan dapat diperbaiki. Refleksi bebas opsional disimpan untuk guru tanpa penilaian kata kunci. Hadiah pertama **50 XP sekali**.
8. Kembali ke Kota melalui gerbang lama bila selesai. **Pengaturan → Ulangi M16-E3** meminta konfirmasi, hanya mereset episode ini dan mempertahankan receipt hadiah pertama.

## Model ilmiah

`p = F / A`

Luas persegi panjang = lebar × panjang. Konversi: **1 cm² = 0,0001 m²**, **1 kPa = 1.000 Pa**. Angka tekanan berasal dari rumus yang sama pada visual, jurnal dan validator; UI tidak memiliki tabel hasil lain.

| Penopang | Lebar | Panjang | Luas kontak | Gaya tetap | Tekanan rata-rata |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 20 cm | 20 cm | 400 cm² = 0,04 m² | 400 N | 10 kPa |
| B | 20 cm | 40 cm | 800 cm² = 0,08 m² | 400 N | 5 kPa |
| C | 40 cm | 40 cm | 1.600 cm² = 0,16 m² | 400 N | 2,5 kPa |

Gaya adalah dorongan total, sedangkan tekanan rata-rata membagi gaya terhadap luas kontak. Pada gaya tetap, luas dua kali menghasilkan tekanan setengah; luas empat kali menghasilkan tekanan seperempat. Gaya **tidak meningkat** saat luas bertambah. Angka 400 N merupakan parameter alat virtual dan tidak dihitung dari karakter atau inventaris.

Asumsi: gaya vertikal, penopang kaku dan mendatar, kontak penuh serta distribusi merata; berat penopang diabaikan. Ini **tekanan rata-rata**, bukan tekanan puncak di tanah nyata. Tidak ada simulasi sifat mekanik tanah, kedalaman ambles, kebocoran atau energi hidraulik. Tanah nyata memiliki sifat dan kemampuan dukung yang beragam. **Batas 6 kPa khusus media latihan**, bukan panduan menentukan keamanan bangunan atau seluruh tanah gambut.

## Tantangan dan visual

| Penopang | Lebar terhadap jalur 30 cm | Tekanan terhadap batas 6 kPa | Hasil |
| --- | --- | --- | --- |
| A | Muat | 10 kPa, melampaui batas | Menyeberang gerbang, beban diletakkan, indikator tekanan melebihi batas |
| B | Muat | 5 kPa, memenuhi batas | Menyeberang, melakukan kontak penuh dan memenuhi dua batas |
| C | Tidak muat: lebar 40 cm | 2,5 kPa dari uji awal | Berhenti sebelum menyentuh dinding gerbang; beban tetap terangkat; tidak ada pembacaan tekanan kontak baru pada jalur |

Maket memperbesar **lebar, panjang penopang dan lebar jalur ×3** dengan faktor yang sama. Persegi A/C tetap persegi; B memiliki panjang dua kali lebar. Ukuran ditampilkan dalam cm asli. Skala dunia, karakter, gaya serta data IPA tidak diubah. Jalur sempit hanya milik maket meja; tidak digunakan sebagai batas navigasi manusia atau gerobak.

Warna di atas penopang memproyeksikan bidang kontak yang berada di bawahnya. Diagram tampak atas dan angka mendampingi warna. Satu panah berukuran tetap menunjukkan gaya total 400 N saat terjadi kontak, tanpa menambah jumlah/panjang panah untuk penopang besar. C yang tertahan tidak menampilkan gaya terapan atau tekanan kontak seolah-olah sudah diukur. Media hanya indikator visual; tidak ada hukum kedalaman ambles buatan.

Satu beban ber-ID `forest-observation-load` dan tiga penopang `solid-support-A/B/C` digunakan ulang. Penopang terpilih berpindah dari rak ke meja; tidak dibuat menjadi barang tas. Beban turun melalui animasi, sedangkan tantangan memakai penggeseran pada tujuan tetap. Pemulihan mengangkat beban dan menyiapkan ulang media agar jejak sebelumnya tidak menjadi variabel tambahan.

## Kontrol dan pemulihan

Laptop tetap memakai WASD/panah, Shift dan E di darat. Panel memakai Tab, Enter pada tombol, serta panah pada daftar native. HP dan IFP memakai kartu/daftar penopang, tombol besar dan navigasi peta/kartu misi. Tidak ada drag wajib, penekanan cepat, tenaga fisik atau hukuman waktu.

Panel menghentikan avatar dan input lari. Kamera FollowCamera yang sama membingkai maket sementara dan kembali ke pemain tanpa mengganti preferensi jarak. Kehilangan fokus serta tab tersembunyi menghentikan waktu animasi. Menutup panel, membuka menu lain, membatalkan, reload, berpindah wilayah dan Kembali ke Pos membatalkan trial belum disahkan lalu memulihkan beban/media.

**Pulihkan Maket** tidak menghapus data sah atau XP. Setelah Catat, penopang tetap terkunci sampai beban diangkat dan media disiapkan ulang. Membuka jurnal atau tiba melalui navigasi tidak menghasilkan hasil pengamatan.

## Arsitektur dan penyimpanan

- `solidContent.ts` dan `solidRegion.ts`: parameter, materi, ukuran dan lokasi.
- `solidModel.ts`: luas, konversi, tekanan rata-rata dan dua batas.
- `solidMission.ts`: persiapan, ukuran yang benar-benar dibaca, prediksi, urutan bukti, tantangan, kesimpulan, hadiah dan validasi replay.
- `solidSession.ts`: waktu presentasi dari delta loop World, tanpa timer atau renderer baru.
- `solidWorld.ts`: model meja, media, penggaris, penopang, beban dan gerbang; mesh digunakan ulang setiap frame.
- `solidUI.ts`: tombol, tabel, diagram, jurnal dan kesimpulan.

Rimba diperpanjang sampai z=37, dengan tanah, jalan, pagar, peta dan obstacle yang sesuai. Batas menuju area api dan penguncian jalur C tetap. Stasiun baru diuji dengan radius karakter maupun gerobak dari titik awal yang sah. Hanya satu regionRoot aktif. Aset maket dilepas bersama Rimba; aset karakter bersama dilindungi. Renderer, loop permainan dan input tetap satu.

Fase: **running → preview → observed → recorded → recover**. Mulai atau menunggu animasi tidak mencatat hasil. Revisi dan fase membuat Catat atomik; klik ganda serta event lama tidak menggandakan rekaman atau hadiah. Rekaman C pada tantangan memuat `observedPressurePa=null`, terpisah dari tekanan referensi yang dihitung dari uji awal.

IndexedDB tetap **skema 1**, store `saves`, key baru **M16-E3**. Cadangan **v13** memuat tiga belas misi/episode dan menerima **semua v1–v12**. Cadangan lama mempertahankan episode yang tidak dicakup. Parser menghitung ulang dari model dan mereplay urutan tindakan, termasuk ukuran, persiapan media, gerbang dan bukti hadiah. Impor tidak valid ditolak sebelum perubahan disimpan. Reload mempertahankan hasil sah, membatalkan trial sementara dan memulihkan maket di pos aman. Reset serta impor percobaan lebih awal mempertahankan receipt 50 XP pertama.

Aturan dan volume air, gerobak serta progres W03-LOG01 tidak menjadi bagian model tekanan padat. Status M17 tidak bergantung pada episode ini. M16-E4 kini tersedia; status bab mengikuti completed keempat episode saat ini.

## Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | **494 lulus**, 17 berkas; **48 baru** untuk tekanan padat |
| `npm run test:launcher` | **14 lulus**, Node/Linux |
| `npm run build` | TypeScript serta Vite lulus |
| `npm run prepare:local` | Build final berhasil dibuat dan dipromosikan ke dist |
| `npm run test:e2e` | **69 lulus dalam 32,4 menit**, pada source akhir |
| Episode baru dalam rangkaian | Lima skenario: alur penuh, laptop, HP potret, HP lanskap dan IFP |

Unit test memeriksa luas dan konversi, nilai 10/5/2,5 kPa, gaya tetap, rasio luas/tekanan, penggantian aman, data belum diperoleh, urutan C/A/B, pembatalan tiga fase, klik ganda, A gagal tekanan, B memenuhi dua batas, C gagal lebar tanpa tekanan kontak, reset/pengulangan hadiah, validasi replay serta semua dua belas format cadangan lama. Geometry test memeriksa satu beban, tiga penopang ber-ID tetap, rasio bentuk, faktor ×3, batas gerbang dan mesh yang tidak bertambah per frame. Navigasi seluruh stasiun lama/baru diuji pada jalur C terbuka/tertutup, dengan radius karakter maupun gerobak.

Alur IFP penuh memulai dari Kota, menerima tugas, membaca sumber di lokasi, memeriksa 400 N, mengukur A/B/C, memperbaiki variabel keliru, menjalankan C/A/B, memperbaiki prediksi setelah pembatalan, mencoba A/C/B pada jalur, memperbaiki kesimpulan, menyimpan refleksi, reload, menolak impor hasil palsu, mengimpor v1–v12, reset dengan hadiah pertama tetap dan kembali ke Kota. Seluruh dua belas progres sebelumnya dibandingkan, termasuk **W03-LOG01 selesai dengan sumber 16 L**; hanya timestamp penyimpanan M01 yang boleh berubah. Status M17 Tuntas tetap benar, sementara Status M16 kini mengikuti completed keempat episode.

Laptop memeriksa Enter pada tombol, jeda fokus, reload pratinjau, pemulihan kamera dan input diam setelah penutupan panel. Viewport sentuh **390×844, 844×390 dan 1920×1080** memeriksa C tertahan, B berhasil, pemulihan serta tabel tanpa overflow. Ini simulasi browser, bukan perangkat fisik.

Regresi penuh menyelesaikan M01, M14, logistik Rimba dengan gerobak maupun enam muatan ember, S13, S14, S15, S16, M16-E1/E2 dan M17-E1/E2/E3, serta kontrol lari, perahu, tabrakan, kamera dan galeri. Produksi diuji tanpa akses eksternal pada empat viewport dan round trip IndexedDB tiga belas misi/episode. Pemeriksaan awal maket menemukan kamera terlalu dekat akibat tinggi obstacle meja; perbaikan dan penanda kontak sudah termasuk dalam source akhir yang melewati seluruh 69 skenario. Ringkasan mesin, data dan hash source/build: [verification.json](evidence/solid/verification.json).

## Bukti visual

- [Pengukur gaya](evidence/solid/01-force.png), [pengukuran ukuran](evidence/solid/02-sizes.png), [maket](evidence/solid/03-apparatus.png).
- [Uji A](evidence/solid/04-test-A.png), [B](evidence/solid/04-test-B.png), [C](evidence/solid/04-test-C.png).
- [Tantangan A](evidence/solid/05-challenge-A.png), [C tertahan](evidence/solid/05-challenge-C.png), [B memenuhi batas](evidence/solid/05-challenge-B.png).
- [Jurnal](evidence/solid/06-journal.png), [HP potret](evidence/solid/07-touch-390.png), [lanskap](evidence/solid/07-touch-844.png), [IFP](evidence/solid/07-touch-1920.png).
- [Maket produksi](evidence/solid/08-production-apparatus.png), [uji A](evidence/solid/09-production-test-A.png), [B](evidence/solid/09-production-test-B.png), [C](evidence/solid/09-production-test-C.png).
- [Tantangan A produksi](evidence/solid/09-production-challenge-A.png), [C](evidence/solid/09-production-challenge-C.png), [B](evidence/solid/09-production-challenge-B.png), [jurnal](evidence/solid/10-production-journal.png).
- [HP potret produksi](evidence/solid/11-production-touch-390.png), [lanskap](evidence/solid/11-production-touch-844.png), [IFP](evidence/solid/11-production-touch-1920.png).
- [Tabel HP potret](evidence/solid/12-production-table-390.png), [lanskap](evidence/solid/12-production-table-844.png), [IFP](evidence/solid/12-production-table-1920.png).
- [Cuplikan maket](evidence/solid/motion/solid-support-trials.webm) dan [metadata](evidence/solid/motion/recording.json). Cuplikan sekitar 29 detik, direkam kontinu dari build produksi, dimulai pada checkpoint persiapan yang diperoleh melalui UI browser. Tiga uji awal serta tiga tantangan dijalankan, diamati dan disahkan melalui tombol game. Bukan rekaman perangkat fisik atau pengukuran FPS.
- [Siklus sumber daya](evidence/solid/resource-cycles.json): tiga kali Kota–Rimba memeriksa satu regionRoot aktif, satu beban dan jumlah geometri 77 → 77 → 77. Ini bukan pengukuran seluruh memori atau performa perangkat fisik.

## Keterbatasan

Pengujian HP/IFP memakai viewport dan sentuhan simulasi Chromium, **bukan perangkat fisik**. BAT Windows dan LAN belum diuji langsung pada perangkat Windows, HP atau IFP. SwiftShader bukan benchmark FPS perangkat sekolah. Build masih memberi peringatan chunk Three.js bersama lebih dari 500 kB. Maket sengaja diperbesar dan model kontak ideal; hasil tidak mengukur tekanan puncak, sifat dukung atau keamanan tanah nyata. Tidak ada cedera, kehilangan item, deformasi tanah numerik atau episode gaya apung baru.
