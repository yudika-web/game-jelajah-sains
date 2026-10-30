# Rencana pembaruan visual Jelajah Sains

Diperbarui 29 Oktober 2026 (Asia/Bangkok). Dasar aktual: delapan wilayah, 17 misi termasuk M02, cadangan v18 (termasuk penampilan), satu renderer/loop dan akar wilayah aktif. Brief lampiran menjadi acuan arah; daftar rencana bukan bukti fitur sudah tersedia. Dokumen ini menetapkan urutan, bukan persetujuan menjalankan seluruh tahap sekaligus. Tahap **01–04** sudah diimplementasikan; tahap saat ini hanya **04**.

## Arah seni dan proporsi

Petualangan 3D stylized low-poly, berwarna, hangat dan mudah dibaca. Avatar tetap enam bagian balok sederhana; lingkungan menggunakan variasi bentuk, siluet dan material sesuai fungsi: atap miring, tajuk pohon berbeda, batu bersisi, penyangga, sambungan dan papan petunjuk. Detail diprioritaskan pada jarak kamera bermain. Jangan menempelkan dekorasi di jalur atau menutupi alat IPA/label. Tidak mengandalkan tekstur foto, refleksi mahal atau aset daring.

Satu unit dunia kira-kira satu meter. Pertahankan siswa/siswi 1,60; tinggi mentor mengikuti `characterConfig`, pintu 2,10; target kamera 1,02. Ukur model netral tanpa label/bayangan/alat. Jangan mengalikan skala berulang. Meja sekitar 0,84; bangku 0,50. Jika tapak bangunan berubah pada tahap berikutnya, ubah geometri, penghalang, titik pendekatan dan rute bersama. Maket sains memiliki label pembesaran sendiri, bukan perubahan skala dunia.

## Palet delapan wilayah

Palet berikut adalah sasaran tahapan mendatang, **belum diterapkan sekaligus**. Warna objek eksperimen tidak boleh menyamarkan data atau menjadi satu-satunya penanda jawaban.

| Wilayah | Dasar / bentuk utama | Aksen / fungsi |
| --- | --- | --- |
| W01 Kota Sains | krem `#E8D7B8`, hijau taman `#88A573` | teal atap `#327F83`, mustard rambu `#D9A441`, biru air `#70B8C2` |
| W02 Kebun Kehidupan | tanah `#8B6848`, hijau daun `#60965D` | rumah semai krem `#E6DDBB`, air `#76B9C1`, panen `#E5B754` |
| W03 Rimba dan Gambut | hijau hutan `#496C45`, tanah `#817052` | kayu `#9B7950`, pos `#D0B67A`, rambu aman `#E3BA58` |
| W04 Sungai dan Danau | air `#5AADB5`, tepian `#8AAB78` | kayu dermaga `#A78055`, alat `#DDBD69`, batu `#849997` |
| W05 Pesisir dan Laut | pasir `#E8D7A5`, laut `#44AEB1` | mangrove `#527C53`, bawah air `#347C96`, organisme `#E6AF62` |
| W06 Bengkel dan Energi | beton hangat `#B2BAA7`, baja `#71969A` | kuning fungsi `#DBAE4E`, teal `#438A8D`, tembaga `#B78050` |
| W07 Geopark | batu `#A8896D`, lapisan `#C4AA83` | vegetasi `#738F62`, biru pos `#527D92`, rambu `#DCA75B` |
| W08 Antariksa | biru gelap `#182B47`, modul `#DCE5E9` | cyan instrumen `#6AC3D1`, kuning arah `#E8BB58`, Bumi `#4988B5` |

## Pencahayaan dan material

Tahap 01–02 mempertahankan baseline: sRGB, ACES Filmic, exposure 1,05; hemisphere hangat/kehijauan 1,6 dan directional hangat 2,2 dari (-15,25,10). Nilai terpusat pada `environmentStyle.ts`. Kabut dasar 48–100 unit; warna wilayah yang sudah ada tetap diatur wilayahnya. Jangan merombak suasana sambil mendiagnosis kedipan.

Permukaan lingkungan buram menggunakan material Lambert dengan depth test/write. Transparansi hanya untuk air/kaca/indikator yang membutuhkan; urutan lapisan diperiksa per objek. Cegah bidang atas tanah yang menimpa pada ketinggian sama; jangan memakai renderOrder, polygon offset global, atau mematikan depth untuk menutup masalah geometri. Satu pemilik tiap permukaan terlihat. Bidang dekat/jauh tetap 0,1/110 untuk menjaga alat detail, tabrakan kamera dan kedalaman ROV.

Shadow map dinamis belum aktif pada baseline. Bayangan kontak karakter tetap ada. Penambahan shadow map/cascades/postprocessing memerlukan evaluasi tahap terpisah; bukan bagian patch ini. Material/geometri bersama milik cache avatar tidak boleh dihapus saat wilayah dibuang. Tidak membuat sumber daya baru setiap frame.

## Kualitas Normal dan Rendah

| Pengaturan | Normal | Rendah |
| --- | --- | --- |
| Rasio piksel | min(DPR perangkat, 1,5) | min(DPR perangkat, 1) |
| Antialias context | aktif | tetap aktif, tidak membuat renderer baru |
| Depth / cahaya / data IPA | sama | sama |
| Bayangan kontak / jarak kamera | tetap | tetap |
| Detail Kota (tahap 02) | 3 warga dekoratif + 24 bunga instanced | 2 warga; pejalan dan bunga opsional disembunyikan |
| W08 (tahap 04) | Bumi/Matahari 64×40, Bulan 48×32; halo dan atmosfer | bola 32×20, tanpa halo/atmosfer, awan diperingan |
| Tujuan | keterbacaan normal | mengurangi jumlah piksel dan detail opsional |

Gunakan Pengaturan → Kualitas Rendah; tanpa centang berarti Normal. Pada layar DPR 1 keduanya bisa sama. Rendah dapat memperjelas gerigi tepi; pengaturan bukan obat z-fighting atau jaminan FPS. Preferensi `lowQuality` lama tetap kompatibel di localStorage terpisah dari progres IndexedDB; cadangan kini v18 dengan penampilan terpisah dari misi. Pengurangan gerakan tetap opsi tersendiri.

## Urutan kerja dan gerbang pemeriksaan

1. **Stabilkan rendering** — reproduksi bergerak, bedakan z-fighting/aliasing/transparansi/bayangan/duplikasi, perbaiki penyebab terbukti, simpan pasangan bukti. **Selesai pada branch visual tahap 01.**
2. **Perbaiki Kota Sains sebagai contoh kualitas** — variasi atap/kusen/kanopi, tiga siluet pohon, benda interaksi, label dekat dan aktivitas warga. **Diimplementasikan tahap 02**, lihat [laporan](visual-stage-02-review.md); interior belum tersedia.
3. **Buat avatar modular dan lemari** — **diimplementasikan tahap 03**: dua outfit, empat rambut, slot topi/kacamata/tas, Coba/Terapkan/Batal, satu pembangun dan renderer. Ukuran tubuh tanpa kosmetik, penyimpanan v18 serta override perlengkapan sementara tersedia. [Laporan](visual-stage-03-review.md).
4. **Perbaiki visual astronomi dan stasiun** — **diimplementasikan tahap 04**: ruang konsol, peta lokal Bumi, permukaan Matahari/Bulan, detail kamera dan petunjuk opsional, LOD dan ownership resource. Cahaya/gerak/fase tetap berasal dari model ilmiah yang sama. [Laporan](visual-stage-04-review.md).
5. **Tambahkan perjalanan dan aktivitas astronot** — **diimplementasikan tahap 05**: persiapan, kendaraan, docking, perlengkapan sementara, airlock dan EVA terbatas. [Laporan](visual-stage-05-review.md). — lingkup tersendiri, tidak mengklaim perjalanan simulasi sebagai fisika nyata.
6. **Perbaiki bawah laut dan aktivitas menyelam** — **diimplementasikan tahap 06**: teluk pasir/lamun, avatar bersirip, kendali 3D, pengamatan, air stabil dan pemulihan. [Laporan](visual-stage-06-review.md). baca ulang izin gerak air, kamera, keselamatan model dan kompatibilitas ROV.
7. **Tambahkan koin hadiah misi — diimplementasikan** — registry reward misi/bab, ledger profil, transaksi/revisi, migrasi, Dompet dan cadangan v19. XP tetap terpisah; toko belum tersedia. [Laporan tahap 07](coin-economy-review.md).
8. **Tambahkan toko kosmetik** — transaksi atomik, kepemilikan dan migrasi diuji setelah sistem koin tersedia.
9. **Sebarkan detail dan aktivitas ke seluruh wilayah** — gunakan Kota sebagai acuan, satu wilayah per iterasi, batas GPU dan navigasi diperiksa.
10. **Periksa integrasi keseluruhan** — regresi luas, semua format cadangan, pergantian wilayah, launcher/offline, perangkat dan bukti penutup.

Setiap tahap memiliki commit/review sendiri, bukti dari game aktual, build dan pemeriksaan terdampak. Tahap berikutnya baru dikerjakan atas permintaan berikutnya. Tahap 01–02 tidak menambahkan misi/koin/lemari/toko; tahap 03 menambahkan lemari gratis saja.

## Keadaan setelah tahap 02

Kota menjadi contoh kualitas awal: geometri lokal bervariasi, palet 19 warna bersama, fasad yang terbaca dan aktivitas terbatas dalam loop yang sama. Tajuk koplanar lama dan volume kamera meja yang terlalu tinggi diperbaiki. Palet sasaran pada tabel tetap panduan artistik, bukan kewajiban mengubah seluruh wilayah sekaligus. Tinjau performa pada perangkat sasaran sebelum menyebarkan detail ke wilayah lain. Tahap 03 sudah tersedia. Tahap 04–06 tersedia; tahap 07 dan seterusnya menunggu permintaan berikutnya.

## Keadaan setelah tahap 03

Siswa/siswi berbagi tubuh netral 1,60 unit tanpa rambut, topi atau tas dalam pengukuran; NPC legacy dipertahankan. Katalog starter memuat 12 ID gratis yang stabil, kompatibel dengan kedua varian. Preview tidak memakai renderer kedua. Memilih ulang penampilan tidak mengubah kemampuan atau XP. Cadangan v18 menambah record penampilan; versi lama mempertahankan record yang tidak tercakup. Toko, koin, pakaian aktivitas penuh dan perluasan Antariksa/selam belum dibuat.

## Keadaan setelah tahap 04

W08 memiliki ruang observasi dengan atap potongan terbuka, tiga konsol berbeda dan alat detail kamera pada renderer yang sama. Daratan berasal dari Natural Earth lokal; awan dan kawah ilustratif. Tampilan dan input tetap terpisah dari bukti M07. Format cadangan tetap v18. Sumber NASA dicoba namun ditolak CONNECT 403; telaah halaman primer masih terbatas. Tidak ada perjalanan astronot, docking atau tahap 05 baru.


## Keadaan setelah tahap 05

Perjalanan kendaraan dan docking dapat dimainkan pergi/pulang; perlengkapan gratis mempertahankan kostum pribadi. Airlock memiliki penguncian dua pintu. Zona luar stasiun memakai navigasi dan tabrakan tiga dimensi, penambat terbatas dan stabilisasi aktif. Renderer/loop, delapan wilayah, seluruh misi, XP dan format cadangan v18 dipertahankan. Tidak ada kegiatan menyelam, ekonomi atau toko pada tahap ini. Pernyataan tahap 04 tentang belum adanya docking merupakan catatan baseline historis.


## Keadaan setelah tahap 06

W05 memiliki teluk selam terbatas yang terpisah dari ROV, jalur perahu dan bukti S16. Permukaan memakai bidang dua sisi stabil, kamera memiliki hysteresis air, geometri/material wilayah dibagi, dan perlengkapan memakai rig modular yang sama. Semua data misi/XP serta format cadangan v18 dipertahankan. Koin/toko dan wilayah baru tidak ditambahkan. Pernyataan tahap sebelumnya tentang belum adanya selam manusia merupakan catatan historis.

## Keadaan setelah tahap 07

Ekonomi lokal terhubung dengan penyelesaian misi. Registry hanya memuat 12 hadiah misi/bab yang sudah tersedia, bukan seluruh nomor rancangan. Koin dan receipt disimpan atomik dengan progres serta XP; impor mempertahankan ledger append-only dan checkpoint profil. Cadangan kini v19, skema IndexedDB 2. Stage visual 01–06 tetap tersedia. Tahap 08 toko, transaksi belanja, koin harian dan misi baru belum dikerjakan.
