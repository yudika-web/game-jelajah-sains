# Perahu W04 dan S15 — Misteri Saluran Irigasi

Tahap integrasi sesudah berenang/S14, 24 Oktober 2026. Pemeriksaan seluruh branch remote menemukan main pada 51a2b22/S13, tanpa branch berenang/S14. Sesuai arahan pengguna, perubahan perahu disimpan sementara, berenang/S14 diselesaikan dan diuji dalam commit **137f4fd**, lalu perubahan perahu/S15 dipulihkan dan digabung tanpa mengganti misi lain. Lihat [laporan tahap S14](swimming-buoyancy-review.md).

## Cara memainkan

1. Dari Kota masuk W04 melalui gerbang dermaga. Pilih **S15** pada Misi aktif, temui Kak Lestari, lalu terima tugas.
2. Baca dan catat **Buku debit** dan **Catatan pasokan**. Kartu durasi tersedia melalui Pelajari Lagi pada buku; kartu pembagian aliran tersedia di saringan.
3. Di **Dermaga riset**, Naik perahu. Rompi terpasang, ransel/alat tangan dilepas sementara, dan karakter duduk di bangku. Pilih **Mulai bergerak**. Laptop memakai WASD/panah dan Shift; HP analog serta kamera dua jari dan toggle **Pelan/Jelajah**; IFP memilih dermaga di Peta atau mengetuk air yang sah.
4. Berlayar ke **Dermaga pengamatan** melalui jalur air. Setelah tiba pada tanda, pilih **Sandar**, lalu **Turun**. E juga berinteraksi di titik sandar. Menu/Peta menghentikan gerak, dan rute baru memulai kendali kembali. Berhenti tersedia di layar. Tidak ada timer.
5. Di darat, periksa **Saringan daun**. Jalankan pengukuran **P1, P2, P3** secara terpisah: Jalankan pengukuran, amati penampung, lalu **Catat hasil**. Tabel tetap Belum diukur sampai disahkan.
6. Setelah tiga data awal, pilih dugaan berdasarkan data. Dugaan keliru mendapat petunjuk dan tetap disimpan. Ambil alat dari rak, lalu bersihkan saringan. Pembersihan tidak tersedia sebelum data awal lengkap.
7. Daun berkurang dan indikator cabang berubah. Ukur ulang ketiga titik dengan durasi yang sama. Pembersihan sendiri tidak menambahkan data pengukuran.
8. Periksa jurnal, bandingkan tabel, lalu kembali menggunakan perahu dari dermaga pengamatan ke dermaga riset. Sampaikan kesimpulan kepada Kak Lestari. Jawaban keliru dapat diperbaiki; hadiah pertama **50 XP**, hanya sekali.
9. Simpan refleksi opsional di jurnal. Kembali ke Kota melalui gerbang. Reset S15 di Pengaturan meminta konfirmasi dan mempertahankan semua misi lain serta riwayat hadiah pertama.

**Kembali ke Dermaga** membatalkan rute dan menempatkan pemain pada titik darat aman dermaga riset, dengan perahu tersandar. Bukti dan XP tetap ada. Naik/turun hanya di dermaga sah; titik turun yang terhalang ditolak. Saat reload, pemain berada di pos darat dan perahu di dermaga awal. Posisi tengah sungai tidak disimpan.

## Model ilmiah

Angka hanya berlaku untuk **saluran latihan**, bukan seluruh sungai. Pengukuran memakai alat sampling virtual tersendiri berkapasitas **12 L**. Setiap titik memakai **30 detik simulasi dipercepat**; durasi presentasi tidak dicampur dengan waktu nyata pemain. Pengukuran tidak mengambil air dari inventaris Rimba atau Kebun.

| Besaran | Sebelum | Sesudah pembersihan |
| --- | ---: | ---: |
| Pasokan model | 20 L/menit | 20 L/menit |
| Cabang irigasi | 4 L/menit | 12 L/menit |
| Diteruskan ke jalur utama | 16 L/menit | 8 L/menit |
| Neraca | 20 = 4 + 16 | 20 = 12 + 8 |
| P1, volume 30 detik | 10 L | 10 L |
| P2, volume 30 detik | 2 L | 6 L |
| P3, volume 30 detik | 2 L | 6 L |

Volume = debit × 30/60 menit. P2 dan P3 sama pada keadaan stabil karena tidak ada kebocoran atau penyimpanan di antaranya dalam model. Air yang tidak masuk cabang diteruskan ke jalur utama. Kesimpulan harus menyatakan P1 tetap, P2/P3 meningkat pada durasi sama, hambatan memengaruhi cabang dalam model, dan hasil tidak membuktikan semua masalah irigasi disebabkan daun. Pembersihan saringan tidak membuktikan air aman diminum.

## Desain teknis

- `boatRegion.ts`: dua dermaga, jalur air, ruang putar, buoy/penghalang, dimensi dan kecepatan perahu. Kecepatan **3,5/5,0 unit/detik** adalah parameter kendali, bukan data eksperimen.
- `BoatController`: keadaan naik/mulai/berhenti/sandar/turun/pemulihan sementara. Integrasi gerak, substep, sapuan tabrakan, waypoint, kontrol, dan loop World yang sudah ada dipakai. Radius konservatif **1,65 unit** mencakup seluruh lambung pada semua rotasi. Batas dan penghalang memperhitungkan radius; perahu tidak naik ke darat atau menembus dermaga/buoy.
- Kolam latihan memiliki izin renang sendiri, jalur perahu memiliki navigasi air sendiri, dan air lain tetap dibatasi. Berenang tidak dibuka pada seluruh sungai. Tidak ada renderer/input/loop kedua. Perpindahan wilayah melepas aset lokal dan mempertahankan cache karakter bersama.
- `irrigationContent.ts`: model aliran dan kartu. `irrigationMission.ts`: aturan murni, tutorial, urutan bukti, enam rekaman, dugaan, tindakan, kesimpulan serta hadiah. `FlowSampling`: percobaan sementara yang baru disahkan dengan Catat. `boatWorld.ts`: lambung, posisi duduk, dermaga, saluran, daun, penampung dan indikator. `irrigationUI.ts`: konteks kontrol, kartu, jurnal, dan pratinjau hasil.
- Tutorial S15 memerlukan naik setelah membaca sumber, perjalanan nyata minimal 8 unit dari dermaga riset, sandar di pengamatan, lalu turun. Navigasi otomatis tidak langsung menandai pengukuran selesai.
- Revision/ID rekaman menolak klik ganda; parser memeriksa data awal kondisi tersumbat, tindakan setelah tiga data awal, dan data sesudah kondisi bersih. Salah memilih dugaan atau kesimpulan tidak mengunci misi. Refleksi disimpan lokal tanpa penilaian kata kunci.

## Penyimpanan dan migrasi

IndexedDB tetap **skema 1**, store saves. Key M01/M14/W03-LOG01/S13/S14 tetap ada; key **S15** ditambahkan, semua ditulis atomik. Cadangan gabungan **v6** berisi enam misi dan wilayah. V1 hanya M01; v2 dua misi; v3 menambah Rimba; v4 menambah S13; v5 menambah S14. Impor format lama mempertahankan misi yang tidak dicakup, dan seluruh validasi selesai sebelum perubahan state disimpan. Hadiah pertama digabung monoton. Reset hanya misi yang dipilih.

## Pemeriksaan dan bukti

**173 unit test lulus** dan **build produksi lulus**. **35/35 browser gabungan lulus** (15,7 menit). **4/4 kasus perahu lulus ulang** (2,3 menit) setelah perapian kontrol dan visual akhir, termasuk pembatalan sentuhan kamera, pilihan Jelajah sebelum Mulai, dan pemeriksaan kontrol HP tidak bertumpuk. Tahap S14 mandiri: 144 unit, build, dan empat browser khusus lulus. Pengujian gabungan mencakup berenang, memancing, perahu, S14/S15, gerobak, lari, kamera, serta misi lama.

| Bukti | Tautan |
| --- | --- |
| Dermaga riset | [Gambar](evidence/boat/01-starting-dock.png) |
| Karakter duduk dan rompi | [Gambar](evidence/boat/02-seated-boat.png) |
| Berlayar pada jalur air | [Gambar](evidence/boat/03-sailing.png) |
| Sandar sebelum turun | [Gambar](evidence/boat/04-moored.png) |
| Saringan sebelum / sesudah | [Sebelum](evidence/boat/05-blocked-screen.png) · [Sesudah](evidence/boat/06-clean-screen.png) |
| Alat sampling, volume dan durasi | [Gambar](evidence/boat/07-sample-result.png) |
| Tabel jurnal enam pengukuran | [Gambar](evidence/boat/08-journal.png) |
| S15 selesai | [Gambar](evidence/boat/09-complete.png) |
| HP potret / lanskap | [Potret](evidence/boat/10-hp-portrait.png) · [Lanskap](evidence/boat/10-hp-landscape.png) |
| Cuplikan naik, berlayar, berhenti, sandar dan turun | [WebM](evidence/boat/motion/board-sail-moor-exit.webm) |
| Hasil pemeriksaan | [JSON](evidence/boat/verification.json) |
| Data akhir | [JSON](evidence/boat/final-state.json) |

Reproduksi: `CAPTURE_BOAT_EVIDENCE=1 CAPTURE_SWIM_EVIDENCE=1 npm run test:e2e -- tests/boat.spec.ts tests/swimming.spec.ts`. Cuplikan perahu tersedia sebagai WebM VP9 960×600. Video: setelah build dan server preview 4173 tersedia, `node scripts/capture-boat-evidence.mjs`. Cuplikan memakai fixture misi selesai, tetapi gerak/naik/sandar/turun dilakukan lewat kontrol browser; alur S15 penuh dari penerimaan diuji terpisah.

## Keterbatasan

Browser memakai Chromium dan WebGL 2 melalui SwiftShader. HP potret/lanskap dan IFP adalah simulasi viewport/sentuhan, bukan perangkat fisik. Belum ada benchmark FPS, baterai, panas, GPU sekolah, atau uji LAN antarperangkat. Lambung memakai footprint bundar konservatif; tidak ada simulasi arus, gelombang berat, mesin kapal atau fluida. Renang hanya kolam latihan, tanpa penyelaman atau timer napas. Pengujian sekolah dan telaah guru masih diperlukan sebelum pemakaian kelas.
