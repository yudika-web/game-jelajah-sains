# Kolam latihan dan S14 — Terapung atau Tenggelam?

Tahap mandiri sebelum integrasi perahu/S15, 24 Oktober 2026. Branch lokal work dan remote main awal sama-sama pada 51a2b22; seluruh remote branch diperiksa dan tidak ada kode berenang/S14. Pengguna mengarahkan pembuatan tahap ini dahulu. Perubahan perahu/S15 dipertahankan melalui Git stash untuk integrasi sesudah commit S14.

## Cara bermain

Pilih S14 pada Misi aktif di W04, terima bersama Kak Lestari, lalu baca Buku gaya apung. Di Ramp kolam pilih Masuk melalui ramp. Kontrol beralih otomatis saat masuk air. Berenang ke Penanda kolam dengan WASD/panah, analog HP, atau memilih tujuan melalui Peta pada IFP. Rompi terpasang; kamera dan dua jari HP tetap digunakan. Kembali ke Tepian selalu tersedia tanpa pengurangan XP. Keluar biasa juga dapat dilakukan melalui ramp. Sungai di luar kolam tetap tidak dapat direnangi.

Setelah mencapai penanda melalui perpindahan nyata, kembali ke darat. Pada Meja uji A/B/C, pilih benda dan prediksi, Simpan prediksi, Jalankan uji, amati model, lalu Catat hasil. Lakukan pada tiga benda. Prediksi keliru tidak mengunci latihan dan tetap terlihat di jurnal. Sampaikan kesimpulan bersama Kak Lestari. Hadiah pertama 50 XP hanya sekali. Refleksi opsional disimpan lokal, tidak dinilai dengan kata kunci.

| Benda | Massa | Volume | Massa jenis rata-rata | Hasil model |
| --- | --- | --- | --- | --- |
| A | 100 g | 200 cm³ | 0,5 g/cm³ | Terapung |
| B | 100 g | 50 cm³ | 2 g/cm³ | Tenggelam |
| C | 200 g | 400 cm³ | 0,5 g/cm³ | Terapung |

Massa jenis air model **1 g/cm³**. Bandingkan massa dibagi volume; massa saja tidak menentukan hasil. Model sederhana ini bukan panduan keselamatan berenang. Tidak ada timer napas atau tuntutan reaksi cepat.

## Implementasi dan penyimpanan

Data, area/ramp, aturan misi, trial sementara, visual kolam, dan UI dipisahkan. Satu renderer, loop, integrator, dan input lama dipakai. Renang 2,2 unit/detik; Shift tidak menambah laju. Batas kolam/ramp mencegah akses air lain. Pose renang dari perpindahan aktual, rompi terlihat, ransel disembunyikan sementara. Opsi pengurangan gerakan tetap berlaku.

Hasil hanya disahkan setelah uji dan tombol Catat, dengan indeks objek/revision yang mencegah duplikasi. Membatalkan atau reload membuang trial belum sah, bukan data jurnal. Reload kembali ke pos darat. S14 memakai rekaman sendiri dalam store saves/IndexedDB skema 1. Cadangan tahap ini v5; versi 1–4 tetap diterima dan mempertahankan S14. Reset meminta konfirmasi, hanya mereset S14, dan mempertahankan riwayat hadiah pertama serta misi lain.

## Pemeriksaan tahap mandiri

- `npm test`: **144 lulus**.
- `npm run build`: **lulus**, dengan peringatan ukuran chunk Three.js bersama yang sudah ada.
- `CAPTURE_SWIM_EVIDENCE=1 npm run test:e2e -- tests/swimming.spec.ts`: **4/4 lulus**.
- Browser: IFP 1440×960 sampai selesai, laptop keyboard/batas/jeda, HP 390×844 dan 844×390 dengan analog/kamera dua jari dan pemulihan. Catatan lama M01/M14/S13 dipertahankan selama alur browser.

Bukti: [berenang](evidence/swimming/01-swimming.png), [keluar ramp](evidence/swimming/02-ramp-exit.png), [terapung](evidence/swimming/03-floating-result.png), [tenggelam](evidence/swimming/04-sinking-result.png), [jurnal](evidence/swimming/05-journal.png), [selesai](evidence/swimming/06-complete.png), [HP potret](evidence/swimming/07-hp-portrait.png), [HP lanskap](evidence/swimming/07-hp-landscape.png), [data akhir](evidence/swimming/final-state.json).

Pengujian ini simulasi browser Chromium/SwiftShader, bukan perangkat HP/IFP fisik atau benchmark FPS. Tidak ada penyelaman, arus sungai, atau fisika fluida. Regresi gabungan seluruh misi dijalankan kembali setelah integrasi perahu/S15.
