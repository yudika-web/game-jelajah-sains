# W06 Bengkel dan Energi — M17-E1

**Nyalakan Lampu Pos Riset** adalah episode pertama M17, dengan hadiah pertama **50 XP**. Bab M17 tetap **Dalam pengembangan**. Episode magnet dan sumber energi alternatif belum diimplementasikan.

## Cara bermain

1. Buka Peta Kota → **Ke Bengkel dan Energi**. Dekati gerbang lalu Masuk. Tidak ada syarat menyelesaikan misi sebelumnya.
2. Terima **M17-E1** dari **Kak Bima**. Baca dan catat Buku rangkaian serta Catatan gangguan.
3. Bersama Kak Bima, catat dugaan awal. Dugaan belum membuktikan kerusakan; pemain boleh mencatat dugaan baru setelah melihat bukti.
4. Periksa **Sumber 3 V**, **Sakelar**, dan visual **Kabel S2–L1**. Pada **Lampu pos riset**, jalankan dan catat uji awal: lampu mati walaupun sumber 3 V dan sakelar tertutup.
5. Pada Sumber, pilih **Buka sakelar dan lepaskan sumber**. Setelah itu, uji kontinuitas di Kabel. Hasil: S2–L1 terputus, sedangkan jalur pergi dan kembali lain lengkap.
6. Gunakan **Meja pemeriksaan** untuk menguji lampu 3 V dengan tester virtual terpisah. Rangkaian utama tetap tanpa sumber. Lampu model berfungsi.
7. Ambil satu kabel di **Rak komponen**. Di **Diagram & terminal**, pilih S2 lalu L1, atau pilih pasangan berlabel dari daftar. Tidak perlu drag. Batalkan pilihan jika perlu. Hubungan B+–B− ditolak dan tidak dipasang.
8. Sambungkan sumber kembali, tutup sakelar, lalu jalankan uji sesudah di Lampu pos. Pilih **Catat pengamatan lampu pos**.
9. Simpulkan bersama Kak Bima menggunakan bukti jalur terputus dan uji sebelum/sesudah. Refleksi opsional disimpan di jurnal, tanpa penilaian otomatis. Kembali ke Kota melalui gerbang yang sama.

Peta dan kartu langkah menyediakan perjalanan otomatis yang benar-benar menempuh jalur sebelum berinteraksi. Keyboard memakai WASD/panah/Shift dan E; panel memakai Tab, Enter, serta select biasa. HP memakai analog dan kamera dua jari. IFP memakai tujuan sentuh dan tombol besar. Panel menghentikan gerak dan memerlukan input baru setelah ditutup.

## Model ilmiah dan batasnya

Sumber DC virtual **3 V**, lampu model sesuai **3 V**, sakelar, jalur pergi dan kembali, serta satu slot kabel pengganti membentuk rangkaian latihan. `evaluateCircuit` pada `circuitModel.ts` menelusuri koneksi B+ → S1 → S2 → L1, lampu L1/L2, dan L2 → B−. Diagram, status UI, lampu meja, dan lampu pos memakai keadaan yang sama.

| Keadaan | Lampu |
| --- | --- |
| Sumber dilepas | Mati |
| Sakelar terbuka | Mati |
| Kabel S2–L1 putus | Mati |
| Sumber terhubung, sakelar tertutup, jalur lengkap | Menyala |

Gangguan awal adalah kabel putus; sumber dan lampu berfungsi. Menjawab soal, memasang kabel di pasangan lain, atau menutup sakelar pada jalur putus tidak menyalakan lampu. Hasil uji awal dan sesudah disahkan secara eksplisit, bukan karena membuka jurnal. Membuka sakelar setelah episode selesai mematikan lampu, tetapi mempertahankan bukti historis dan hadiah.

**Ini bukan petunjuk memperbaiki instalasi listrik rumah.** Pemeriksaan kontinuitas diblokir selama sumber rangkaian masih terhubung. Uji lampu pada meja adalah alat uji komponen virtual terpisah dan tidak menyambungkan kembali rangkaian utama. Model tidak menyimulasikan baterai habis, arus/daya kontinu, panas, sengatan, atau sifat listrik nyata secara lengkap. Materi tetap memerlukan telaah guru sebelum pemakaian kelas.

## Implementasi dan penyimpanan

- `workshopRegion.ts` dan `workshopContent.ts`: lokasi/penghalang, kartu pengetahuan, label terminal, serta dugaan.
- `circuitModel.ts`: model koneksi murni dan pemeriksaan pasangan.
- `workshopMission.ts`: urutan bukti, perbaikan, uji, kesimpulan, refleksi, dan hadiah. Parser memutar ulang riwayat tindakan dan mencocokkan seluruh status. Bukti penyelesaian pertama dipertahankan sebagai `rewardProof` saat reset dan diperiksa ulang sebelum menerima riwayat hadiah.
- `workshopWorld.ts`: bangunan, stasiun, kabel pengganti, sakelar, serta kedua lampu dengan material emisi/glow sederhana. Sumber daya dimiliki wilayah dan dilepas dengan pola regionRoot lama; geometri/material karakter bersama dipertahankan.
- `workshopUI.ts`: diagram, dua cara memilih pasangan, tindakan kontekstual dan jurnal. Pemasangan memakai transisi pose memasang yang sudah ada; pemeriksaan memakai pose meter. Avatar tetap enam balok.

Kak Bima memakai rig bersama, tinggi terukur **1,72 unit**, helm teknisi dan rompi mustard. Ia juga tersedia pada galeri yang sama dengan permainan. Pintu tetap **2,10 unit** dan meja sekitar **0,84 unit**. Tidak ada renderer, input, atau loop permainan kedua; animasi NPC dan gerak tetap ditangani World.

Rekaman baru **`M17-E1`** ditambahkan ke IndexedDB `jelajah-sains`, object store `saves`, **skema tetap 1**. Cadangan menjadi **v7**, berbeda dari versi skema. Versi **1–6** tetap diterima, mempertahankan M17-E1 yang tidak dicakup. Fixture v6 berisi enam misi lama tersedia di `tests/fixtures/all-through-s15-v6.json`.

Reset meminta konfirmasi, hanya mengulang episode, dan menyimpan bukti hadiah pertama. Impor trial lebih lama tidak mengembalikan hadiah menjadi nol. Semua validasi selesai sebelum status hidup/penyimpanan diganti. Reload menempatkan pemain di pos aman W06 dan memulihkan kabel, sumber, sakelar, hasil, serta refleksi secara konsisten.

## Pengujian

Lingkungan: Linux, Node.js 24.19.0, npm 11.9.0, Chromium sistem dengan SwiftShader. Rangkaian penuh dan pemeriksaan terarah berikut dijalankan setelah implementasi. Dialog hasil Kak Bima dibedakan menurut keadaan pemeriksaan, perbaikan, uji, dan penyelesaian; build serta pemeriksaan terarah diulang setelah perapian dialog tersebut.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | **214 lulus** |
| `npm run test:launcher` | **14 lulus** |
| `npm run build` | **Lulus**, permainan dan galeri produksi |
| W06 dan server produksi setelah dialog serta build final | **8 lulus** dalam 2,7 menit; termasuk kedua orientasi HP dan interaksi lampu pada produksi |
| `npm run test:e2e` | **43 lulus** dalam 18,3 menit setelah perbaikan target sentuh HP |
| Jalur persiapan final | **Lulus** lewat `node scripts/local/prepare.mjs`; instalasi dilewati karena dependensi sesuai, staging build dan promosi dist berhasil |

Uji domain mencakup delapan kombinasi sumber/sakelar/kabel; hubungan salah dan hubungan langsung sumber; kontinuitas/alat uji lampu hanya tanpa sumber; pemeriksaan, uji, serta pengamatan wajib; klik ganda/stale revision; lampu dimatikan kembali setelah selesai; refleksi tanpa penilaian kata kunci; reset dan hadiah pertama; bukti hadiah yang berubah atau tidak lengkap; parser status/history yang tidak konsisten; migrasi keenam format lama; cadangan v7; serta semua rute pendekatan W06, footprint meja sesuai geometri, tinggi rig Kak Bima, batas revision integer, dan perubahan material kedua lampu/glow tanpa menambah objek adegan.

Uji browser W06 memakai alur nyata dari Kota, pemeriksaan semua stasiun, salah sambung lalu koreksi, kedua metode terminal, reload sebelum penyambungan sumber, uji sesudah dan kesimpulan, impor tidak valid yang tidak mengubah progres, impor v1–v6 yang mempertahankan M17-E1, reset konfirmasi dengan hadiah tersimpan, serta kembali ke Kota. Progres S15 selesai, hadiah S14, serta hari percobaan M14 tetap diperiksa. Uji HP menambahkan analog/kamera bersamaan dan pointercancel; keyboard mengoperasikan daftar pemasangan melalui Enter.

Uji produksi juga memeriksa kedelapan karakter galeri dan data tujuh misi/episode melalui server statis, dengan permintaan di luar origin lokal diblokir. Rangkaian lama mencakup M01, M14, Rimba/gerobak, memancing, berenang, perahu, lari, kamera, dan penyimpanan. Uji peluncur memastikan dist, MIME, penanganan port, penggunaan ulang server, traversal, serta rollback build tetap benar.

Gestur kamera HP memakai titik yang diverifikasi menyentuh kanvas melalui `elementFromPoint`, sehingga panel misi tidak keliru dianggap sebagai area kamera. Setelah perapian dialog hasil Kak Bima, build diulang lewat jalur persiapan dan delapan pemeriksaan W06/produksi lulus lagi. [Ringkasan verifikasi](evidence/workshop/verification.json).

## Bukti visual

Tangkapan adalah browser, bukan perangkat fisik. Pengambilan ulang: `CAPTURE_WORKSHOP_EVIDENCE=1 npm run test:e2e -- tests/workshop.spec.ts` setelah build. Data akhir tersimpan di [final-state.json](evidence/workshop/final-state.json).

| Bukti | Gambar |
| --- | --- |
| Wilayah dan Kak Bima | [Masuk Bengkel](evidence/workshop/01-arrival.png) |
| Jalur awal sebelum isolasi | [Kontinuitas diblokir](evidence/workshop/02-before-isolation.png) |
| Lampu sebelum perbaikan | [Uji awal](evidence/workshop/03-lamp-before.png) |
| Bukti lokasi putus | [Kontinuitas](evidence/workshop/04-continuity.png) |
| Terminal dan kabel terpasang | [Pemasangan](evidence/workshop/05-wire-installed.png) |
| Lampu pos menyala | [Uji sesudah](evidence/workshop/06-lamp-after.png) |
| Data dan kesimpulan | [Jurnal](evidence/workshop/07-journal.png) · [Episode selesai](evidence/workshop/08-complete.png) |
| Kak Bima tiga sisi pada galeri produksi | [Galeri](evidence/workshop/11-bima-gallery.png) |
| Laptop | [Daftar pasangan](evidence/workshop/09-laptop-1280.png) |
| HP potret/lanskap | [Potret](evidence/workshop/09-hp-390.png) · [Lanskap](evidence/workshop/09-hp-844.png) |

## Keterbatasan dan tahap berikutnya

Belum diuji pada HP/IFP fisik, Windows BAT langsung, atau LAN antarperangkat. Simulasi viewport/multitouch browser bukan pengukuran FPS atau uji jangkauan tangan pada IFP kelas. Build masih memberi peringatan chunk bersama Three.js di atas 500 kB; build berhasil. Lampu memakai emisi/glow ringan, tanpa simulasi pencahayaan/arus fisik atau bayangan dinamis.

Tahap berikutnya adalah telaah materi dan uji perangkat sasaran. Episode magnet dan energi alternatif belum tersedia dan tidak diberi status selesai oleh M17-E1. Tidak ada perluasan wilayah/misi lain pada patch ini.
