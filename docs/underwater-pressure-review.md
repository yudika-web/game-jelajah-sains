# W05 / M16-E1 — Ekspedisi Tekanan Bawah Air

> Keadaan terkini menambahkan [M16-E3 Pijakan Aman Pos Rimba](solid-pressure-review.md), cadangan v13 dan key ketiga belas. Laporan di bawah mendokumentasikan tahap sebelumnya; aturan serta bukti historisnya dipertahankan.

> Laporan historis tahap ROV. Tahap berikutnya menambahkan [M16-E2 hidraulik](hydraulic-lift-review.md), cadangan v12 dan key kedua belas tanpa mengubah data ROV. Bab M16 tetap Dalam pengembangan.

Pengembangan sesudah W05/S16 (`9149c0c`), 26 Oktober 2026. Tidak ditemukan AGENTS.md. Rancangan M16 membahas tekanan zat padat, kedalaman, hidraulik dan gaya apung; tahap ini hanya episode tekanan air dengan ROV. **Bab M16 tetap Dalam pengembangan**. S17 tidak otomatis selesai dan tidak memperoleh hadiah tambahan.

## Cara bermain

1. Dari Kota masuk Sungai, lalu dermaga keberangkatan ke Pesisir. Misi lama bukan prasyarat. Di W05 pilih **M16-E1**, temui Kak Lestari dan terima episode.
2. Baca **Buku tekanan** dan **Rencana tekanan** di lokasi masing-masing. Di **Sensor tekanan**, Ambil lalu Periksa fungsi sensor virtual.
3. Dekati **Pos kendali ROV** dan pilih Kendalikan. Avatar tetap di pos darat. Robot mulai di dok, sensor pada permukaan air. Pilih **Stabilkan → Jalankan pembacaan → Catat**. Angka nol merupakan **nol relatif**, bukan tekanan total nol.
4. Pilih variabel **kedalaman sensor**. Jawaban jarak horizontal dapat diperbaiki dan upaya awal tersimpan. Massa jenis, gravitasi, sensor serta air tenang tetap.
5. Praktikkan gerak horizontal minimal 1 unit, perubahan kedalaman minimal 0,5 m, Stabilkan dan Kembali ke Dok. Bantuan **Pilih tujuan → A2** boleh digunakan untuk praktik. Kembali ke dok merupakan tombol pemulihan tanpa pengurangan XP. Kendalikan lagi setelah tutorial.
6. Pilih A2, A4, A8 atau B4 pada peta kedalaman ROV. Urutan bebas. Tiba hanya memindahkan robot; **Stabilkan** tetap diperlukan. Pilih dan simpan prediksi dibanding 2 m, jalankan pembacaan, amati hasil, lalu Catat. Prediksi keliru tidak mengunci percobaan. Sebelum Catat, prediksi dapat diperbaiki: jika pratinjau sudah terbuka, pilih Batalkan pembacaan, perbaiki prediksi, lalu jalankan pembacaan lagi. Prediksi awal tetap tersimpan.
7. Setelah empat data sah, pilih **Kembali ke Dok**. Periksa tabel/grafik di jurnal, lalu sampaikan kesimpulan kepada Kak Lestari. Jawaban keliru disimpan dan dapat diperbaiki. Hadiah pertama **50 XP satu kali**.
8. Simpan refleksi opsional, tanpa penilaian kata kunci. Kembali ke Sungai melalui dermaga biasa. Pengaturan → Ulangi M16-E1 meminta konfirmasi dan hanya mereset episode ini; receipt hadiah pertama tetap ada.

Peta dan kartu misi pada darat mengantar pemain ke stasiun. Saat mengendalikan ROV, tombol Peta membuka tujuan bawah air berkoordinat 3D. Kunjungan otomatis tidak memberikan bukti pengukuran. Seluruh episode dapat dijalankan tanpa mengetik angka panjang, drag presisi, hover, atau batas waktu.

## Kontrol dan pemulihan

| Perangkat | Horizontal | Kedalaman dan tindakan |
| --- | --- | --- |
| Laptop | WASD/panah relatif kamera | Space naik 1 m; Q turun 1 m. Tab/Enter untuk tombol |
| HP | Analog kiri; kamera dengan jari kedua | Naik/Turun 1 m, Stabilkan, baca, Catat, Kembali ke Dok |
| IFP | Pilih tujuan pengamatan pada peta | Robot menempuh rute sah; Stabilkan dan Catat tetap eksplisit |

Space menaikkan **robot**, sehingga target kedalaman berkurang 1 m. Q menurunkan robot sehingga target bertambah 1 m. Tidak perlu menahan tombol. Tidak ada konflik dengan shortcut darat; Space/Q hanya dialihkan ketika ROV aktif dan diabaikan ketika mengetik. Shift tidak mempercepat robot. Kecepatan **2,5 unit/detik horizontal** dan **1,5 unit/detik vertikal**, tanpa stamina/napas.

Berhenti, menu, kehilangan fokus, pointercancel dan tab tersembunyi menghentikan input dan target vertikal pada posisi saat itu. Pembacaan sementara dibatalkan ketika menu/fokus mengharuskannya. Setelah kembali, diperlukan input baru. Kembali ke Dok membatalkan rute dan pembacaan sementara tanpa menghapus data sah. Reload memarkir robot di dok serta menempatkan pemain di pos darat; tidak memulihkan input atau animasi.

Kamera FollowCamera yang sama mengikuti sensor/robot dengan sasaran vertikal dan pengali jarak sementara. Sudut awal ROV menjauhi batu dekat A8; kontrol kamera manual tetap tersedia. Arah gerak horizontal memperhitungkan sudut kamera eksplorasi beserta offset kamera ROV, sehingga sesuai tampilan yang terlihat. Pilihan Dekat/Normal/Jauh dan pengurangan gerakan tidak diubah oleh kendaraan. Setelah operasi, sasaran kembali ke avatar. Tidak ada renderer atau loop kedua.

## Rumus, satuan dan asumsi

Permukaan geometris air: **y = −0,175**. Pusat sensor terletak **0,12 unit di atas akar robot**, dan kedalaman dihitung sebagai:

`h = y_permukaan − y_sensor_dunia`

Satu unit tetap satu meter. Offset diukur melalui transformasi objek sensor yang sama di dunia 3D. Kedalaman tidak berasal dari kamera, jarak horizontal, ukuran robot, atau jarak ke dasar laut.

`p = ρ × g × h`, dengan ρ = **1.025 kg/m³**, g = **10 m/s²**. Hasil Pa dibagi **1.000** untuk kPa. Parameter ini asumsi air laut model yang tenang dan bermassa jenis tetap, bukan nilai universal seluruh perairan. Sensor membaca **tekanan air di luar robot**.

| Pemeriksaan | Kedalaman | Tekanan tambahan hasil rumus |
| --- | ---: | ---: |
| Nol relatif permukaan | 0 m | 0 kPa |
| A2 | 2 m | 20,5 kPa |
| A4 | 4 m | 41 kPa |
| A8 | 8 m | 82 kPa |
| B4 | 4 m | 41 kPa |

Label utama: **Tekanan air akibat kedalaman**. Nilai merupakan tambahan relatif terhadap permukaan. **0 kPa tambahan tidak berarti tekanan total di permukaan nol.** Tekanan atmosfer tidak ditambahkan untuk menampilkan tekanan absolut dalam episode ini. Tidak ada simulasi tekanan kabin, fisiologi, oksigen atau penyelam manusia.

A4 dan B4 berada di posisi horizontal berbeda pada kedalaman sama. Keduanya menghasilkan 41 kPa dalam asumsi yang sama. Grafik memplot dua catatan pada koordinat sama dengan simbol ● A dan □ B, label terpisah, serta tabel pendamping. Nilai tidak dijumlahkan. Data belum disahkan ditampilkan Belum diukur; pembacaan kontinu belum menjadi bukti jurnal.

## Desain dan penyimpanan

- `pressureContent.ts` memuat asumsi, koordinat dan materi. `pressureModel.ts` memuat rumus, sensor dan konversi; UI tidak memiliki dataset tekanan tersendiri.
- `rovController.ts` mengelola target vertikal, gerak, rute, stabilisasi dan pemulihan. `rovNavigation.ts` memakai BFS grid **3D enam arah**, pemeriksaan lintasan serta envelope robot. Radius konservatif **0,9** dan setengah tinggi **0,45** mencakup badan, kamera serta pendorong. Robot tidak memakai rute darat. Platform peluncuran virtual ditarik saat ROV aktif dan muncul kembali setelah pemulihan; jalur turun dari dok tidak berisi pelat padat.
- Batas pusat robot x=4…16, z=−13…14, kedalaman sensor 0…9,5 m. Dasar berada di sekitar 10,6 m di bawah permukaan, dengan ruang aman untuk badan. Batu, tiang, bagian bawah dermaga dan platform pengamatan lama menjadi penghalang 3D sesuai visualnya. Substep dan sapuan tiap sumbu mencegah tembus serta melampaui target pada frame lambat.
- `pressureWorld.ts` membangun robot, alat, dasar, batu, penanda dan ikan terbatas dalam **regionRoot W05 yang sama**. Aset lokal dilepas bersama wilayah; material/geometri rig bersama tetap dilindungi. Tiga siklus Sungai–Pesisir mempertahankan satu regionRoot aktif dan 104 → 104 → 104 geometri renderer; lihat [resource-cycles.json](evidence/pressure/resource-cycles.json). Ini pemeriksaan kestabilan sumber daya, bukan seluruh memori perangkat atau FPS. Pembaruan bawah air berhenti ketika wilayah tidak aktif. Pengurangan gerakan menghentikan dekorasi, tanpa membatasi kendali atau indikator.
- `pressureMission.ts` memisahkan aturan dan validasi replay. `pressureSampling.ts` mengubah fase membaca menjadi hasil memakai delta aktif dari World. **Mulai → amati hasil → Catat** merupakan transaksi terpisah; pembacaan tanpa pengesahan, pembatalan dan klik ganda tidak menggandakan rekaman.
- Setiap record menyimpan ID, posisi sensor, kedalaman integer mm dan tekanan integer Pa. Koordinat, urutan bukti, nilai hasil rumus, tutorial, kepulangan dan hadiah divalidasi sebelum menerima impor.
- IndexedDB tetap **skema 1**, key baru **M16-E1** dalam transaksi sebelas misi/episode. Cadangan **v11** menerima **v1–v10**. Cadangan lama mempertahankan episode baru yang tidak tercakup. Hadiah pertama digabung monoton dan tetap dibuktikan receipt riwayat setelah reset.
- Reload/keluar wilayah memarkir robot dan membatalkan trial belum disahkan. Parkir pemulihan setelah empat data dapat memenuhi kepulangan ke dok; tutorial tetap memerlukan tombol Kembali ke Dok. Tidak ada pengurangan XP atau simulasi waktu aplikasi ditutup.
- M16 tidak memiliki status Tuntas keseluruhan pada tahap ini. Status M17 tetap berasal dari completed E1/E2/E3 dan tidak berubah karena episode ROV.

## Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 399 lulus, 15 berkas; 46 pengujian baru |
| `npm run test:launcher` | 14 lulus pada Node/Linux |
| `npm run build` | TypeScript dan Vite lulus |
| Jalur persiapan peluncur | Build pengganti berhasil dibuat dan dipromosikan |
| Browser khusus M16-E1 | Empat skenario lulus pada pemeriksaan awal |
| Regresi browser penuh | 59 lulus (30,1 menit), seluruh misi dan empat ukuran produksi |

Unit memeriksa 0/2/4/8 m, sensor 3D sebenarnya, kesamaan A4/B4, Pa/kPa, gerak pada empat interval frame, tab tersembunyi, sweep penghalang, batas vertikal, urutan titik bebas, kedatangan sekali, stabilisasi eksplisit, envelope model, pembacaan sementara, klik ganda, reset/hadiah, pemalsuan impor, semua sepuluh format lama, serta jalur stasiun lama dan baru.

Browser IFP memulai episode baru dari cadangan S16 v10, membaca sumber di dunia, meminjam sensor, mencatat nol, memperbaiki variabel keliru, menjalankan tutorial, mengukur empat titik pada urutan A8/B4/A2/A4, membatalkan dan mengulang pembacaan, memperbaiki kesimpulan, menyimpan refleksi, memuat ulang, menolak impor tidak sah, mengimpor semua format lama, reset, memeriksa M17 dan kembali ke Sungai. Avatar tetap di pos selama operasi. Laptop memeriksa Space/Q, WASD, kehilangan fokus dan reload hasil belum disahkan. HP potret/lanskap memeriksa analog/kamera dua jari, kedalaman, pembacaan dan pointercancel. Pengujian ini simulasi browser, bukan perangkat fisik.

Setelah penyempurnaan visual penarikan platform dok, 399 unit test serta build/persiapan lulus kembali. Delapan pemeriksaan ROV/produksi juga diulang dan semuanya lulus (3,4 menit). Pemeriksaan peluncur tetap 14 lulus; kode peluncur tidak berubah. Setelah penyelarasan arah input terhadap sudut kamera ROV, keempat skenario ROV dijalankan lagi pada kode akhir dan semuanya lulus (2,7 menit), disertai 399 unit test serta build/persiapan yang berhasil.

Ringkasan mesin, hash build, dan pemisahan pemeriksaan regresi/final: [verification.json](evidence/pressure/verification.json).

## Bukti visual

- [Sensor dan persiapan](evidence/pressure/01-sensor.png).
- [Pemeriksaan nol relatif](evidence/pressure/02-zero.png).
- [Robot pada dok](evidence/pressure/03-robot.png).
- [Pengukuran A2](evidence/pressure/04-A2.png), [A4](evidence/pressure/04-A4.png), [A8](evidence/pressure/04-A8.png), [B4](evidence/pressure/04-B4.png).
- [Tabel dan grafik](evidence/pressure/05-graph.png).
- [HP potret](evidence/pressure/06-hp-read-390.png) dan [HP lanskap](evidence/pressure/06-hp-read-844.png).
- [Pos kendali produksi](evidence/pressure/07-production-control.png) dan [A8 produksi](evidence/pressure/08-production-A8.png).
- [Tabel/grafik produksi](evidence/pressure/09-production-table-graph.png), [HP potret](evidence/pressure/10-production-graph-390.png), [HP lanskap](evidence/pressure/10-production-graph-844.png), [IFP 1920×1080](evidence/pressure/10-production-graph-1920.png).
- [Cuplikan ekspedisi ROV](evidence/pressure/motion/rov-expedition.webm) dan [metadata perekaman](evidence/pressure/motion/recording.json). Cuplikan kontinu dari build produksi, dimulai pada checkpoint tutorial dan nol relatif yang telah dilakukan melalui UI browser; seluruh empat pengukuran pada rekaman dijalankan serta disahkan melalui kontrol game. Ini bukan rekaman perangkat fisik atau benchmark FPS.

## Keterbatasan

Pengujian HP/IFP menggunakan Chromium dengan viewport dan sentuhan simulasi. Windows BAT dan LAN belum diuji pada perangkat fisik. SwiftShader bukan pengukuran performa GPU/HP sekolah. Build masih memberi peringatan chunk Three.js bersama lebih dari 500 kB. ROV adalah volume latihan kecil, tanpa arus, tekanan absolut, perubahan massa jenis terhadap kedalaman, kendaraan realistis, atau pengoperasian alat nyata. Episode tekanan zat padat/hidraulik/gaya apung lanjutan dan penyelaman manusia tidak ditambahkan pada tahap ini.
