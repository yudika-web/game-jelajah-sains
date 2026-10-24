# Patch gerak responsif dan kemampuan berlari

Patch ini mempertahankan model balok, tinggi karakter, bangunan, radius navigasi/interaksi, pilihan kamera, galeri, dan format progres M01/M14. Tidak ada stamina, wilayah, atau misi tambahan.

## Temuan dan hasil

Kode awal menggunakan satu kecepatan **4,6 unit/detik**. `World.frame()` membatasi waktu ke **0,05 detik**, sehingga frame 0,1 detik hanya memindahkan karakter untuk setengah waktu yang berlalu: kecepatan efektif turun menjadi sekitar 2,3 unit/detik pada interval 10 Hz. Input analog masih ditolak selama panjang vektor di bawah 0,05 tanpa pemetaan ulang; tidak ada mode lari. Perjalanan otomatis menggunakan toleransi waypoint 0,16 dan langkah tanpa batas jarak tersisa, yang berisiko melewati titik saat kecepatan dinaikkan.

Konfigurasi akhir berada di [`movement.ts`](../src/engine/movement.ts):

| Pengaturan | Nilai |
| --- | --- |
| Jalan | **5,2 unit/detik** |
| Lari | **8,0 unit/detik** |
| Akselerasi | 60 unit/detik² |
| Perlambatan | 90 unit/detik² |
| Area mati analog radial | 0,06; sisa rentang dipetakan ulang ke 0–1 |
| Substep simulasi maksimum | 1/120 detik; perpindahan maksimum sekitar 0,067 unit |
| Interval frame yang diterima | hingga 0,25 detik; lonjakan lebih besar dibuang |

Dari diam, kecepatan penuh dicapai sekitar 0,087 detik saat jalan dan 0,133 detik saat lari. Berhenti dari lari membutuhkan sekitar 0,089 detik dengan jarak pengereman maksimum sekitar 0,356 unit. Jeda/dialog menghentikan gerak langsung, tanpa pengereman lanjutan. Interval pertama setelah input dibersihkan diabaikan agar waktu tab tidak aktif tidak menyebabkan loncatan.

## Kontrol dan animasi

- **Laptop:** WASD/panah berjalan, tahan Shift kiri atau kanan untuk berlari. Lepas Shift kembali berjalan; Shift sendiri tidak memulai gerakan. Vektor diagonal dinormalisasi.
- **HP:** toggle **Jalan / Lari** menampilkan teks, warna aktif, dan `aria-pressed`. Analog tetap menentukan arah dan kekuatan dorongan; kamera memakai pointer terpisah. Tidak perlu menahan jari ketiga. Pada lanskap, toggle berada di kanan atas ruang bermain untuk menghindari dock.
- **IFP:** toggle besar memilih kecepatan untuk ketuk tanah, Peta, analog, dan kartu misi. Memilih tujuan dari Peta membawa mode sebelum peta dibuka ke rute baru. Menutup peta tanpa tujuan kembali ke Jalan. Berhenti atau input manual membatalkan jalur; pulsa tombol yang sangat singkat juga membatalkannya segera pada event input.

Gerakan memakai integrator yang sama untuk semua perangkat/wilayah, terpisah dari skala model. Sapuan per sumbu menghentikan gerak manual tepat pada batas penghalang pertama, sekaligus mempertahankan geser sepanjang dinding. Ini juga menghilangkan rayapan sangat kecil yang ditemukan oleh regresi langkah di tembok pada interval frame pecahan. Tiap segmen otomatis dibatasi tepat pada waypoint; titik berikutnya tidak dituju dengan memotong sudut. Callback kedatangan dikonsumsi sekali, lalu dialog dibuka. Ketika tiba pada NPC, arah menghadap NPC dipertahankan terhadap gerak terakhir.

Animator membaca jarak setelah tabrakan untuk keadaan **diam, berjalan, berlari, berinteraksi**. Saat lari, ayunan bahu/pinggul membesar, irama lebih cepat mengikuti jarak, dan torso condong ringan. Akar navigasi tetap stabil. Di tembok, siklus langkah berhenti dan anggota tubuh kembali diam. NPC tanpa perpindahan tidak ikut berlari. Pengurangan gerakan tetap membatasi ayunan/condong tanpa mengubah kecepatan perpindahan; tidak ada perubahan FOV atau guncangan kamera.

Dialog, jurnal, menu jeda, mode perangkat, perpindahan wilayah, kembali ke pos, blur, dan tab tersembunyi membersihkan tombol, analog, jalur, inersia, dan mode lari. Tombol yang masih ditahan sesudah jeda tidak diterima melalui key-repeat sampai ada tekanan baru. Input/select/textarea dan konten editable tidak mengendalikan pemain. Pointer cancel/lost capture menghentikan gerak seketika, dengan mode Jalan/Lari tetap dipilih. Pelepasan analog normal memakai pengereman singkat. Mode lari tidak ditulis ke penyimpanan misi atau preferensi.

## Pemeriksaan terkontrol

Lintasan lurus kosong selama **2 detik dari diam**, termasuk akselerasi:

| Interval masukan simulasi | Jalan (unit) | Lari (unit) |
| --- | ---: | ---: |
| 10 Hz | 10,174667 | 15,466667 |
| 15 Hz | 10,174667 | 15,466667 |
| 20 Hz | 10,174667 | 15,466667 |
| 30 Hz | 10,174667 | 15,466667 |
| 60 Hz | 10,174667 | 15,466667 |
| 120 Hz | 10,174667 | 15,466667 |

[Data perbandingan dan konfigurasi](evidence/running/controlled-intervals.json). Unit test juga memeriksa interval berubah-ubah. Angka Hz di atas adalah masukan waktu simulasi terkontrol, **bukan FPS HP yang diukur**.

Unit test memeriksa normalisasi diagonal, perlambatan setelah Shift dilepas, analog proporsional, berhenti, spike waktu, semua penghalang/batas kedua wilayah, kedatangan satu kali ke seluruh objek misi saat jalan/lari, pembatalan manual, jalur terhalang, dan animasi berdasarkan perpindahan nyata. Browser memeriksa kedua Shift, perbandingan laju perpindahan, input sesudah jeda, editable, HP dua jari dan pointer cancel/end, IFP, pergantian wilayah, tabrakan saat lari, label/raycast, galeri, progres lama, penyelesaian M01/M14, serta cadangan.

| Perintah | Hasil akhir |
| --- | --- |
| `npm test` | **60/60 lolos** |
| `npm run build` | **Lolos**, termasuk pemeriksaan TypeScript dan kedua entry Vite |
| `CAPTURE_RUNNING_EVIDENCE=1 npm run test:e2e` | **19/19 lolos**, sekitar 5,9 menit |

[Ringkasan hasil perintah](evidence/running/verification.json).

Regresi yang ditemukan selama pengujian diperbaiki pada implementasi: rayapan mikro di dinding, pembatalan sentuhan yang masih mengerem, dan pulsa input manual di antara frame yang tidak membatalkan navigasi. Uji otomatis lama dipertahankan; tidak ada pelonggaran validasi misi. Pemeriksaan akhir browser menuntaskan M01 dan M14, melanjutkan fixture M01 lama, melewati gerbang dua arah, serta memeriksa cadangan dan hadiah.

## Bukti visual

- [Cuplikan jalan, lari, berbelok, berhenti, tembok, dan perjalanan otomatis](evidence/running/walk-run-navigation.webm).
- [Metadata dan sampel keadaan dari rekaman](evidence/running/recording.json).
- [Laptop saat berlari](evidence/running/laptop-running.png), [tertahan tembok](evidence/running/running-wall.png).
- [HP potret mode Jalan](evidence/running/hp-portrait-toggle.png), [HP potret mode Lari](evidence/running/hp-portrait-running.png), [HP lanskap](evidence/running/hp-landscape-toggle.png), [IFP](evidence/running/ifp-toggle.png).

Cuplikan berdurasi **12,7 detik**, resolusi **960 × 676**, dengan 144 frame yang diterima dari screencast sebelum encoding. Angka frame capture ini tidak dipakai sebagai benchmark FPS.

Rekaman memakai input browser nyata dan frame WebGL dari build produksi melalui Chromium SwiftShader. Kamera Dekat dipilih melalui pengaturan yang sudah ada, tanpa perubahan model atau jarak preset. Ulangi dengan `node scripts/capture-running-evidence.mjs` setelah menyalakan server preview pada port 4173; `EVIDENCE_ORIGIN` dapat mengganti asal server.

## Keterbatasan

Belum diuji pada HP atau IFP fisik, GPU perangkat sekolah, variasi browser sentuh, maupun keyboard fisik. Uji browser emulasi dan interval waktu terkontrol tidak membuktikan FPS atau latensi sentuhan perangkat tersebut. Interval lebih besar dari 0,25 detik sengaja tidak dikejar; target perbandingan numerik patch ini 10–120 Hz. Animasi balok tetap bergaya sederhana, tanpa penempatan kaki berbasis IK. Build masih memberi peringatan ukuran chunk Three.js di atas 500 kB seperti versi sebelumnya.
