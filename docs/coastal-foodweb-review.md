# W05 / S16 — Jaring Kehidupan Pesisir

Implementasi pada branch terbaru sesudah M17-E3 (`1c308f2`), 25 Oktober 2026. Tidak ditemukan AGENTS.md. Acuan: W05, hubungan Sungai–Pesisir, dan S16 pada rancangan. Episode ini tidak membuka penyelaman bebas, M16, M05, atau M06.

## Cara bermain

1. Kota → gerbang Sungai. Pada Peta W04 pilih **Ke Pesisir**, dekati dermaga, lalu **Berangkat ke Pesisir**. Transisi singkat menutup W04, memarkir kendaraan, dan membuka dermaga W05. Misi lama bukan prasyarat. Jalur kembali menggunakan **Ke Sungai** pada Peta W05.
2. Temui **Kak Lestari** dan **Terima S16**. Baca serta catat Buku ekosistem, Catatan makanan, dan Batas model pada tiga lokasi berbeda.
3. Dekati alat plankton. Pilih satu kelompok, amati tampilan **Diperbesar**, kenali ciri dan peran, lalu **Catat**. Lakukan untuk fitoplankton dan zooplankton. Membuka kartu atau tiba melalui navigasi tidak menghasilkan rekaman.
4. Dekati Jendela bawah air. Amati serta catat ikan F dan ikan Z. Ikan terlihat di bawah permukaan transparan; kamera inspeksi sementara memakai kamera yang sama. Menutup pengamatan kembali ke pemain, tanpa mengubah pengaturan jarak.
5. Dekati **Perahu · pantai**, Naik, lalu pilih **Perahu · titik ikan** di Peta. Perahu menempuh jalur nyata. **Sandar → Turun**, dekati titik predator, amati dan catat. Kembali dengan perahu atau **Kembali ke dermaga**. Laut dibatasi; berenang hanya tetap berlaku pada kolam latihan W04.
6. Di papan jaring, gunakan **asal → tujuan** melalui tombol organisme atau dua daftar berlabel. Pasang lima hubungan. Panah dimulai pada makanan dan berakhir pada pemakannya. Hubungan salah memberi petunjuk dan menyimpan upaya, tetapi tidak dipasang. Tidak diperlukan drag, hover, atau gerakan presisi.
7. Pilih **Tinjau kasus gangguan**. Garis jalur ikan Z menuju predator menjadi putus-putus. Jalur melalui ikan F tetap utuh. Model ikan Z diperkecil sebagai simbol skenario, dengan penjelasan bahwa ini bukan pengukuran jumlah atau ukuran populasi.
8. Kembali ke Kak Lestari. Jelaskan satu sumber makanan berkurang, alternatif masih tersedia, perubahan populasi belum dapat dipastikan, arah energi, dan batas model. Kesimpulan salah dapat diperbaiki dan jawaban awal tetap ada. Hadiah **50 XP satu kali**.
9. Refleksi opsional tersedia di Jurnal, disimpan lokal tanpa penilaian kata kunci. Kembali ke Sungai melalui dermaga. Reload menempatkan pemain di dermaga W05 dan perahu di pantai, sambil mempertahankan semua bukti sah.

Kontrol darat dan kendaraan tetap sama: laptop WASD/panah, Shift, E; HP analog/kamera dua jari dan toggle Jalan/Lari atau Pelan/Jelajah; IFP tujuan sentuh/Peta, Berhenti, Sandar, Turun. Panel menghentikan gerak, dan setelah ditutup diperlukan input baru. Kehilangan fokus membatalkan tampilan pengamatan belum disahkan; buka kembali untuk mencatat.

## Organisme dan hubungan model

| ID stabil | Kelompok | Peran | Informasi makanan/sumber |
| --- | --- | --- | --- |
| phyto | Fitoplankton | Produsen | Memanfaatkan cahaya untuk menghasilkan bahan organik |
| zoo | Zooplankton | Konsumen | Fitoplankton |
| grazer | Ikan pemakan fitoplankton / ikan F | Konsumen | Fitoplankton |
| hunter | Ikan pemakan zooplankton / ikan Z | Konsumen | Zooplankton |
| predator | Ikan predator | Konsumen | Ikan F dan ikan Z |

Lima panah: fitoplankton → zooplankton; fitoplankton → ikan F; zooplankton → ikan Z; ikan F → predator; ikan Z → predator. Dua rantai terhubung pada produsen dan predator. Tidak ada panah yang dipasang otomatis sebagai jawaban. Diagram dan daftar berasal dari hubungan sah yang sama di jurnal.

Ciri terlihat dibedakan dari makanan yang diketahui melalui buku/catatan peneliti. Bentuk tubuh ikan tidak membuktikan dietnya. Plankton hanya ditampilkan pada pembesaran alat virtual atau ilustrasi berlabel. Matahari bukan organisme dan tidak dimakan langsung oleh ikan. Energi diteruskan, bukan berputar kembali seperti daur materi.

Model tidak mencakup seluruh mangrove/perairan nyata, pengurai, atau seluruh hubungan dan variasi makanan. Gangguan satu jalur bukan simulasi populasi kontinu; tidak ditambahkan angka populasi hasil pengukuran palsu. Predator tidak dinyatakan pasti punah, pasti tidak berubah, atau memiliki laju perubahan tertentu. Materi masih memerlukan telaah guru sebelum penggunaan kelas.

## Arsitektur dan penyimpanan

- Data organisme, hubungan, serta tiga kartu 35–70 kata: `coastalContent.ts`. Lokasi dan dua navigasi: `coastalRegion.ts`. Transaksi bukti dan validator replay: `coastalMission.ts`. Model/animasi: `coastalWorld.ts`. UI/jurnal: `coastalUI.ts`.
- `BoatController` menerima konfigurasi dermaga wilayah. Model lambung `boatModel.ts`, MovementController, input, FollowCamera, HUD, dan render loop lama dipakai bersama. Kecepatan 3,5/5,0 unit per detik; radius konservatif 1,65 mencakup lambung. Titik sandar aman dan jalur menghindari buoy. Jalan di pantai tidak dapat melewati laut untuk mencapai titik predator.
- Hanya satu regionRoot aktif. Transisi melepas geometri, tekstur dan material milik wilayah; sumber daya karakter bersama tetap dilindungi. W04 dan W05 tidak dimuat bersamaan. Ikan dekoratif dan air tidak diperbarui saat W05 tidak aktif; pengurangan gerakan menghentikan gerak dekoratif.
- IndexedDB tetap skema **1** dengan key baru **S16**, ditulis atomik bersama sembilan misi/episode lama dan world. Posisi perahu tengah laut serta tampilan pengamatan belum disahkan tidak disimpan.
- Cadangan **v10** menerima **v1–v9**. Cadangan lama mempertahankan S16 yang tidak tercakup. Sebelum mengubah progres aktif, validator mengulang riwayat: penerimaan, sumber, ID organisme, ciri/peran, lima hubungan, kasus dan kesimpulan, termasuk receipt hadiah. Data cacat ditolak tanpa menyentuh progres lama.
- Reset S16 meminta konfirmasi, hanya menghapus percobaan episode ini, dan mempertahankan receipt hadiah pertama. Mengimpor percobaan lama tidak menggandakan XP. Status bab M17 tetap dihitung dari completed E1/E2/E3, tanpa kaitan dengan S16 atau receipt hadiah.
- Peluncur tetap memakai localhost:5173 dan hanya menyajikan `dist`; tidak mengubah origin penyimpanan, menghapus IndexedDB, atau memakai CDN. Build diperbarui lewat `scripts/local/prepare.mjs`, jalur yang sama dengan BAT persiapan.

## Pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 353 lulus, 14 berkas |
| `npm run test:launcher` | 14 lulus pada Node/Linux |
| `npm run build` | Lulus TypeScript dan Vite |
| Jalur persiapan | Build pengganti dipromosikan sesudah berhasil |
| Browser khusus S16 | Empat skenario lulus, termasuk regresi final |
| Seluruh browser | 55 lulus (27,8 menit), termasuk empat ukuran produksi tanpa akses eksternal |

Unit baru memeriksa produsen/konsumen, arah panah, sumber wajib, empat pengamatan belum cukup, hubungan keliru bukan bukti, skenario dan alternatif, klik ganda, hadiah/reset, pemalsuan impor, semua sembilan versi lama, isolasi M17, jalur darat/air, radius lambung, kedatangan sekali, konfigurasi perahu, dan model ikan tanpa alokasi per frame. Uji gerak lama diperluas untuk kedua tepian W05.

Browser S16 menjalankan alur IFP dari cadangan v9 melalui perjalanan Sungai–Pesisir sampai lima pengamatan, berlayar, jaring, kesimpulan, refleksi, ekspor v10, impor tak sah/versi lama, reload/reset, dan perjalanan kembali. Misi lama dibandingkan sebelum/sesudah; timestamp `M01.savedAt` memang diperbarui oleh penyimpanan lama, tanpa mengubah bukti. Laptop memeriksa kendali nyata, Shift kanan, kehilangan fokus, pemulihan dan reload pengamatan belum disahkan. HP 390×844 dan 844×390 memakai sentuhan, pilihan daftar, kesimpulan, analog/kamera dua jari dan pointercancel. Produksi diperiksa dengan permintaan eksternal diblokir, termasuk galeri dan sepuluh simpanan. Tiga siklus Sungai–Pesisir mempertahankan satu regionRoot aktif dan jumlah geometri renderer 70 → 70 → 70; ini pemeriksaan kestabilan sumber daya, bukan pengukuran FPS atau seluruh memori perangkat. Data: [resource-cycles.json](evidence/coastal/resource-cycles.json).

Ringkasan pemeriksaan mesin, hash build, dan bukti cadangan: [verification.json](evidence/coastal/verification.json).

## Bukti visual

| Bukti | Gambar |
| --- | --- |
| Dermaga kedatangan dan wilayah | [01-arrival.png](evidence/coastal/01-arrival.png) |
| Plankton diperbesar | [02-plankton.png](evidence/coastal/02-plankton.png) |
| Jendela bawah air, produksi final | [14-production-window.png](evidence/coastal/14-production-window.png) |
| Perahu bergerak | [12-production-sailing.png](evidence/coastal/12-production-sailing.png) |
| Sandar | [05-moored.png](evidence/coastal/05-moored.png) |
| Pengamatan predator, produksi final | [13-production-predator.png](evidence/coastal/13-production-predator.png) |
| Lima hubungan | [07-foodweb.png](evidence/coastal/07-foodweb.png) |
| Kasus gangguan | [08-disturbance.png](evidence/coastal/08-disturbance.png) |
| Jurnal | [09-journal.png](evidence/coastal/09-journal.png) |
| HP potret, jaring di jurnal | [16-hp-journal-390.png](evidence/coastal/16-hp-journal-390.png) |
| HP lanskap, pengamatan | [17-hp-observation-844.png](evidence/coastal/17-hp-observation-844.png) |
| IFP 1920×1080 | [15-ifp-case-1920.png](evidence/coastal/15-ifp-case-1920.png) |

[Cuplikan eksplorasi perahu, sandar, pengamatan dan kasus](evidence/coastal/motion/coastal-exploration.webm). Rekaman kontinu dari build produksi, memakai checkpoint episode yang telah dituntaskan melalui browser. Pemulihan di tengah rekaman memakai tombol Kembali ke Dermaga yang tersedia pada game. Metadata: [recording.json](evidence/coastal/motion/recording.json). Ini bukan rekaman perangkat fisik atau benchmark FPS.

## Keterbatasan

HP/IFP adalah simulasi viewport/sentuhan Chromium, bukan perangkat sekolah fisik. BAT tidak dieksekusi pada Windows dan LAN belum diuji dari perangkat lain. Rendering menggunakan SwiftShader; kelancaran GPU/HP nyata belum diukur. Build masih memberi peringatan chunk Three.js bersama lebih dari 500 kB. Laut merupakan jalur terbatas dengan air ringan dan specimen model, tanpa arus, penyelaman bebas, populasi kontinu, atau perluasan M16. Tidak ada backend atau pengiriman nilai guru.
