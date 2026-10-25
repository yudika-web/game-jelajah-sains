# W06 — M17-E2 Derek Elektromagnet

M17-E2 memperluas Bengkel dengan halaman daur ulang yang dapat dikunjungi dari Kota tanpa menyelesaikan M17-E1. Empat pengamatan bahan, tiga pengujian kumparan, pengangkutan nyata enam klip, jurnal, kesimpulan, penyimpanan, dan hadiah pertama menjadi satu alur. **M17 tetap Dalam pengembangan** karena episode energi alternatif belum tersedia. S11 tidak diberi status selesai. Sumber dan lampu M17-E1 memakai model terpisah.

## Cara memainkan

1. Jalankan persiapan setelah memperbarui kode, lalu peluncur harian. Dari Kota pilih gerbang Bengkel melalui peta; masuk, pilih **M17-E2**, dan temui Kak Bima.
2. Baca dan catat **Buku magnet** serta **Catatan elektromagnet**. Halaman di timur bengkel tersambung dengan jalan lama. Semua lokasi tersedia pada peta dan kartu tujuan.
3. Di **Meja pengamatan bahan**, pilih benda dan prediksi. Dekatkan magnet, tunggu gerakan, tekan **Amati hasil**, pilih hasil yang terlihat, lalu catat. Ulangi untuk baja, tembaga, aluminium, dan plastik. Prediksi keliru boleh diperbaiki; upaya awal disimpan.
4. Di **Rak komponen**, pilih lilitan sebagai variabel yang diubah, sumber arus terkontrol, dan kondisi lain sama. Pasang inti, lalu modul 20 lilitan saat sumber mati.
5. Hubungkan **I+–S1**, **S2–C1**, **C2–I−**, lalu **Periksa rangkaian**. Pilih dua terminal atau daftar pasangan. Hubungan salah tidak dipasang; hubungan langsung I+–I− ditolak. Pilihan terminal dapat dibatalkan.
6. Di **Stasiun pengujian**, gerakkan kepala ke posisi uji, nyalakan sumber, amati pengangkatan, lalu **Catat hasil**. Matikan sumber dan tunggu klip kembali. Pasang/periksa/uji modul 40 dan 60 dengan prosedur sama. Membuka tabel tidak mengisi hasil.
7. Di **Derek mini**, pilih modul berdasarkan tiga catatan, lalu periksa rangkaian. Semua modul sah. Urutan sederhana: **Turunkan → Magnet ON → Angkat → Ke Penampung → Turunkan → Magnet OFF**. Angkat dan kembali ke baki untuk muatan berikutnya. Pada model ini, modul 20 membutuhkan 3 pengangkutan, 40 membutuhkan 2, dan 60 membutuhkan 1. Rencana campuran juga diterima.
8. Lepaskan dengan kepala rendah di penampung agar tercatat terkirim. Pelepasan di tempat lain masuk baki atau area pemulihan. **Pulihkan Derek** mengembalikan muatan belum terkirim ke baki tanpa menghapus hasil atau pengiriman sah. Tidak ada hukuman waktu.
9. Periksa jurnal, simpan refleksi opsional, dan simpulkan bersama Kak Bima. Empat pengamatan, tiga uji, enam klip terkirim, dan empat jawaban berbukti wajib untuk **50 XP sekali**. Pemain dapat kembali ke Kota.

Panel memakai tombol asli browser, urutan Tab, Enter, dan panah pada pilihan. HP/IFP memiliki tombol tujuan tetap dan daftar terminal, tanpa drag presisi. Membuka panel menghentikan eksplorasi; menutupnya tidak mengaktifkan input lama. Kamera yang sama membidik area derek selama pengoperasian dan kembali ke pemain setelah panel ditutup. Sudut dan preferensi jarak pengguna dipertahankan. Bingkai operasi dapat ditarik lebih jauh agar lebar alat tetap terlihat pada layar potret; setelah ditutup kamera kembali ke jarak menjelajah.

## Model ilmiah dan penyederhanaan

- Pada kekuatan/kondisi magnet model ini, klip baja feromagnetik terangkat. Tembaga, aluminium, dan plastik **tidak terangkat pada pengujian ini**. Ini bukan pernyataan bahwa bahan lain sama sekali tidak memiliki respons magnetik atau semua logam tertarik magnet.
- Elektromagnet memerlukan inti, modul, lintasan terminal lengkap, pemeriksaan, sumber aktif, dan sakelar tertutup. Sumber mati atau lintasan terbuka tidak menghasilkan pengangkatan.
- Sumber arus terkontrol virtual menjaga **0,2 A**. Inti, bentuk/ukuran kumparan, enam klip identik, posisi, jarak, dan prosedur tetap. Baterai biasa tidak otomatis menjaga arus tetap ketika lilitan diganti.
- Dataset buatan: **20 → 2**, **40 → 4**, **60 → 6 klip**. Angka bukan hukum proporsional universal dan tidak menyatakan kemampuan alat nyata. Hasil yang belum diperoleh bertuliskan **Belum diuji**.
- Model inti besi lunak mengabaikan magnet sisa, panas, dan perubahan energi. Mematikan magnet melepaskan muatan. Energi tidak diukur; tidak ada klaim efisiensi atau 60 lilitan selalu terbaik.
- Semua kegiatan adalah alat virtual tegangan/arus model, bukan panduan merakit listrik rumah.

## State dan transaksi benda

`K1`–`K6` merupakan enam ID stabil. Awalnya K1 menjadi sampel baja di meja, lima lainnya di baki. Setelah empat pengamatan, K1 kembali ke baki. Pengujian kumparan memakai enam objek yang sama dan tidak menghabiskannya. Setiap klip berada tepat pada salah satu lokasi: sampel, baki, kepala, penampung, atau pemulihan. Jumlah selalu enam.

Pengambilan hanya terjadi ketika magnet aktif, kepala rendah dan dalam jangkauan baki/pemulihan; kapasitas mengikuti modul terpasang. Pengiriman hanya disahkan ketika kepala rendah di penampung dan magnet dimatikan. Satu transaksi memindahkan ID, bukan menambah objek. Revision dan penguncian callback DOM mengabaikan klik lama/ganda. Jurnal membedakan **pengambilan bermuatan** dari **pengangkutan berhasil**; percobaan yang dipulihkan tidak dihitung sebagai pengiriman.

Menutup panel atau kehilangan fokus membekukan gerak pada pecahan posisi aktual dan mempertahankan muatan. Pengujian yang belum disahkan dibatalkan. **Reload, impor, keluar wilayah, dan Kembali ke Pos** mematikan sumber serta mengembalikan kepala dan muatan belum terkirim ke baki; klip terkirim dan data sah tetap ada. Tidak ada loop animasi atau input kedua.

## Penyimpanan dan kompatibilitas

IndexedDB `jelajah-sains`, store `saves`, tetap **skema 1**. Rekaman baru **M17-E2** ikut transaksi penyimpanan delapan misi/episode. Cadangan menjadi **v8**, terpisah dari versi skema. Format **1–7** tetap diterima, mempertahankan episode yang tidak dicakup. Fixture v7 ada di `tests/fixtures/all-through-m17-e1-v7.json`.

Parser memutar ulang tindakan dan mencocokkan rangkaian, urutan bukti, dataset, posisi/ID klip, kesimpulan, dan hadiah. Impor diperiksa seluruhnya sebelum mengubah penyimpanan. Reset meminta konfirmasi, hanya mereset M17-E2, dan mempertahankan bukti hadiah pertama. Memuat cadangan lama atau percobaan ulang tidak menambah 50 XP lagi. Refleksi disimpan lokal tanpa penilaian kata kunci.

## Pemeriksaan

Pemeriksaan tahap ini menggunakan Node 24.19.0, npm 11.9.0, dan Chromium 154 di Linux.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 257 lulus, 12 berkas; 43 uji baru M17-E2 |
| `npm run test:launcher` | 14 lulus |
| `npm run build` melalui `node scripts/local/prepare.mjs` | Lulus; build sementara berhasil dipromosikan ke dist |
| Browser khusus M17-E2 | 4 lulus: alur IFP lengkap, laptop, HP potret/lanskap |
| Regresi browser lengkap | 47 lulus (21,7 menit), termasuk semua misi lama |
| Pemeriksaan ulang UI/build akhir | 8 lulus (3,9 menit), setelah perapian pilihan bahan dan kabel visual |
| Rekaman build produksi | Sekitar 10 detik; enam klip benar-benar dikirim, tanpa page error |

Pengujian lengkap dijalankan sebelum perapian terakhir pilihan bahan dan kabel gantung visual. Setelah perapian, unit/build dan pemeriksaan browser episode serta produksi dijalankan kembali. Pengujian baru mencakup sumber/sakelar/lintasan, penggantian modul hanya OFF, pengamatan sebelum pencatatan, hasil 2/4/6, seluruh pilihan transport dan campuran, klik ganda, neraca enam ID, pemulihan, reload, reset/hadiah, migrasi v1–v7, serta semua rute stasiun lama/baru. Browser memainkan seluruh episode melalui interaksi nyata, termasuk pemilihan bahan di luar urutan daftar; fixture hanya digunakan untuk memeriksa checkpoint dan regresi tertentu.

## Bukti visual

- [Meja dan halaman](evidence/electromagnet/01-yard-and-materials.png).
- [Baja terangkat](evidence/electromagnet/02-material-steel.png), [tembaga](evidence/electromagnet/02-material-copper.png), [aluminium](evidence/electromagnet/02-material-aluminium.png), [plastik](evidence/electromagnet/02-material-plastic.png).
- [Perakitan dan terminal](evidence/electromagnet/03-assembly.png).
- [Uji 20](evidence/electromagnet/04-test-20.png), [40](evidence/electromagnet/04-test-40.png), [60 lilitan](evidence/electromagnet/04-test-60.png).
- [Derek membawa muatan](evidence/electromagnet/05-loaded-crane.png), [enam terkirim](evidence/electromagnet/06-delivered.png).
- [Jurnal](evidence/electromagnet/07-journal.png), [kesimpulan](evidence/electromagnet/08-complete.png).
- HP potret: [perakitan](evidence/electromagnet/09-assembly-390.png), [derek](evidence/electromagnet/10-crane-390.png). HP lanskap: [perakitan](evidence/electromagnet/09-assembly-844.png), [derek](evidence/electromagnet/10-crane-844.png).
- [Cuplikan produksi: ambil, angkut, lepaskan](evidence/electromagnet/motion/pickup-carry-release.webm), [metadata perekaman](evidence/electromagnet/motion/recording.json), [tangkapan produksi](evidence/electromagnet/11-production-loaded-crane.png).
- [Ringkasan verifikasi dan hash build](evidence/electromagnet/verification.json).
- [State akhir dari alur browser](evidence/electromagnet/final-state.json). Berkas hanya berisi data model dan refleksi uji, tanpa data pemain pribadi.

## Keterbatasan

Pemeriksaan berjalan pada Chromium Linux dengan WebGL SwiftShader. Ukuran laptop, HP potret/lanskap, dan IFP adalah **simulasi browser**, bukan perangkat fisik. Windows BAT, sentuhan/performa HP/IFP nyata, dan koneksi LAN perangkat lain belum diuji langsung pada tahap ini. Pengujian peluncur Node dijalankan di Linux; tidak ada klaim koneksi LAN atau FPS perangkat fisik.

Derek memakai tween posisi tetap tanpa mesin fisika, dan klip dilepas/dipulihkan sebagai transaksi model. Tidak ada simulasi jatuh, magnet sisa, panas, atau energi. Bundle Three.js bersama masih menghasilkan peringatan ukuran chunk; build tetap dapat dijalankan lokal tanpa CDN. Telaah materi guru dan uji perangkat sasaran masih diperlukan. Episode energi alternatif, S11 tersendiri, serta wilayah lain tidak ditambahkan.
