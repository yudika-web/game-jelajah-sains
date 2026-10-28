# Rencana pembaruan visual Jelajah Sains

Diperiksa 28 Oktober 2026 (Asia/Bangkok). Dasar aktual: delapan wilayah, 17 misi termasuk M02, cadangan v17, satu renderer/loop dan akar wilayah aktif. Brief lampiran menjadi acuan arah; daftar rencana bukan bukti fitur sudah tersedia. Dokumen ini menetapkan urutan, bukan persetujuan menjalankan seluruh tahap sekaligus. Tahap yang dikerjakan sekarang hanya **01**.

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

Tahap 01 mempertahankan baseline: sRGB, ACES Filmic, exposure 1,05; hemisphere hangat/kehijauan 1,6 dan directional hangat 2,2 dari (-15,25,10). Nilai terpusat pada `environmentStyle.ts`. Kabut dasar 48–100 unit; warna wilayah yang sudah ada tetap diatur wilayahnya. Jangan merombak suasana sambil mendiagnosis kedipan.

Permukaan lingkungan buram menggunakan material Lambert dengan depth test/write. Transparansi hanya untuk air/kaca/indikator yang membutuhkan; urutan lapisan diperiksa per objek. Cegah bidang atas tanah yang menimpa pada ketinggian sama; jangan memakai renderOrder, polygon offset global, atau mematikan depth untuk menutup masalah geometri. Satu pemilik tiap permukaan terlihat. Bidang dekat/jauh tetap 0,1/110 untuk menjaga alat detail, tabrakan kamera dan kedalaman ROV.

Shadow map dinamis belum aktif pada baseline. Bayangan kontak karakter tetap ada. Penambahan shadow map/cascades/postprocessing memerlukan evaluasi tahap terpisah; bukan bagian patch ini. Material/geometri bersama milik cache avatar tidak boleh dihapus saat wilayah dibuang. Tidak membuat sumber daya baru setiap frame.

## Kualitas Normal dan Rendah

| Pengaturan | Normal | Rendah |
| --- | --- | --- |
| Rasio piksel | min(DPR perangkat, 1,5) | min(DPR perangkat, 1) |
| Antialias context | aktif | tetap aktif, tidak membuat renderer baru |
| Depth / cahaya / data IPA | sama | sama |
| Bayangan kontak / jarak kamera | tetap | tetap |
| Tujuan | keterbacaan normal | mengurangi jumlah piksel pada layar berkepadatan tinggi |

Gunakan Pengaturan → Kualitas Rendah; tanpa centang berarti Normal. Pada layar DPR 1 keduanya bisa sama. Rendah dapat memperjelas gerigi tepi; pengaturan bukan obat z-fighting atau jaminan FPS. Preferensi `lowQuality` lama tetap kompatibel di localStorage terpisah dari progres IndexedDB; cadangan tetap v17. Pengurangan gerakan tetap opsi tersendiri.

## Urutan kerja dan gerbang pemeriksaan

1. **Stabilkan rendering** — reproduksi bergerak, bedakan z-fighting/aliasing/transparansi/bayangan/duplikasi, perbaiki penyebab terbukti, simpan pasangan bukti. **Tahap sekarang.**
2. **Perbaiki Kota Sains sebagai contoh kualitas** — variasi bentuk/material dan detail berfungsi, audit rute serta tampilan perangkat.
3. **Buat avatar modular dan lemari** — pertahankan rig, proporsi, socket dan identitas; penggantian kosmetik aman bagi progres.
4. **Perbaiki visual astronomi dan stasiun** — cahaya/gerak/fase tetap berasal dari model ilmiah yang sama.
5. **Tambahkan perjalanan dan aktivitas astronot** — lingkup tersendiri, tidak mengklaim perjalanan simulasi sebagai fisika nyata.
6. **Perbaiki bawah laut dan aktivitas menyelam** — baca ulang izin gerak air, kamera, keselamatan model dan kompatibilitas ROV.
7. **Tambahkan koin hadiah misi** — tentukan transaksi dan receipt sekali; jangan mengubah XP historis atau menggandakan hadiah.
8. **Tambahkan toko kosmetik** — transaksi atomik, kepemilikan dan migrasi diuji setelah sistem koin tersedia.
9. **Sebarkan detail dan aktivitas ke seluruh wilayah** — gunakan Kota sebagai acuan, satu wilayah per iterasi, batas GPU dan navigasi diperiksa.
10. **Periksa integrasi keseluruhan** — regresi luas, semua format cadangan, pergantian wilayah, launcher/offline, perangkat dan bukti penutup.

Setiap tahap memiliki commit/review sendiri, bukti dari game aktual, build dan pemeriksaan terdampak. Tahap berikutnya baru dikerjakan atas permintaan berikutnya. Tidak ada misi baru, koin, lemari atau toko yang ditambahkan pada tahap 01.
