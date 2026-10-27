# W06 / M16-E2 — Lift Hidraulik Pos Riset

> Pembaruan M16-E4: [Ponton Pengangkut Peralatan](pontoon-buoyancy-review.md) kini tersedia di W04. M16 hanya Tuntas jika completed E1/E2/E3/E4 saat ini semuanya true. Keterangan status/fitur pada laporan tahap di bawah merupakan catatan historis, bukan status bab mutakhir. S14 tetap terpisah.


> Tahap E3 sebelumnya menambahkan [M16-E3 Pijakan Aman Pos Rimba](solid-pressure-review.md), cadangan v13 dan key ketiga belas. Laporan di bawah mendokumentasikan tahap sebelumnya; aturan serta bukti historisnya dipertahankan.

26 Oktober 2026. Dibangun di atas `9745c05`, tanpa mengembalikan branch ke commit lama. Tidak ditemukan AGENTS.md. Rancangan bab M16 mencakup tekanan zat padat, kedalaman, hidraulik dan gaya apung. Tahap ini menambahkan episode hidraulik di W06; ROV M16-E1 tetap tersedia di W05. **M16 kini mengikuti completed E1/E2/E3/E4**; tekanan padat dan ponton tersedia pada versi mutakhir. Status M17 hanya berasal dari completed ketiga episode M17; tidak ada penyelesaian S17 atau hadiah bab otomatis.

## Cara bermain

1. Dari Peta Kota, pilih gerbang Bengkel dan masuk W06. Pilih **M16-E2** pada Misi aktif. Temui Kak Bima dan terima episode. Misi lama bukan prasyarat.
2. Di **Buku hidraulik**, baca dan catat Tekanan yang Diteruskan serta Gaya Lebih Kecil, Gerak Lebih Panjang. Di **Catatan lift**, baca Alat Harus Sesuai Kebutuhan.
3. Dekati **Kebutuhan peti**, periksa berat **100 N** dan target **5 cm**. Pilih variabel **luas piston keluaran**. Berat, luas masukan 5 cm², target dan asumsi cairan tetap. Upaya rencana keliru tetap disimpan dan dapat diperbaiki.
4. Pada **Rak modul** atau **Lift hidraulik**, pasang A/B/C saat platform awal dan peti tersangga. Pilih prediksi, Simpan prediksi, Jalankan uji awal, Amati kedua piston, Catat hasil, lalu Kembalikan platform. Ulangi tiga konfigurasi. Urutan bebas; prediksi tidak dinilai melalui ketepatan motorik. Prediksi awal dan perbaikannya disimpan.
5. Setelah tiga hasil sah, Jalankan tantangan dengan penggerak **maksimal 50 N dan 12 cm**. A tertahan; C berhenti pada kenaikan 3 cm; B mencapai 5 cm. Pemain boleh mencoba dan mencatat kegagalan untuk menjelaskan perbaikan. Pilihan B tanpa pengangkatan serta pengesahan hasil tidak menyelesaikan tantangan.
6. Kembalikan platform atau Pulihkan Alat. Temui Kak Bima, sampaikan lima kesimpulan berdasarkan bukti. Jawaban keliru dapat diperbaiki dan upaya awal disimpan. Hadiah **50 XP sekali** untuk episode ini.
7. Simpan refleksi opsional, tanpa pencocokan kata kunci. Jurnal memuat data yang sudah disahkan. Kembali melalui gerbang Kota bila selesai. Pengaturan → Ulangi M16-E2 meminta konfirmasi dan hanya mereset episode ini, sambil mempertahankan receipt hadiah pertama.

## Kontrol, pengamatan dan pemulihan

- Laptop: eksplorasi memakai kontrol lama. Pilihan modul berupa tombol; Tab berpindah fokus, Enter mengaktifkan tombol, panah memilih opsi pada daftar native. Tidak ada drag atau ketukan cepat.
- HP potret/lanskap dan IFP: navigasi melalui peta/kartu, tombol besar untuk modul, prediksi, uji, Amati, Catat dan Pulihkan. Analog/kamera tetap dipakai ketika menjelajah. Panel menghentikan gerak avatar dan mode lari; menutup panel memerlukan input baru.
- Kamera FollowCamera yang sama membingkai alat sementara. Preferensi Dekat/Normal/Jauh tidak diubah. Label wilayah disembunyikan saat detail agar tidak menutupi alat; kembali setelah panel ditutup.
- **Kehilangan fokus dan tab tersembunyi menghentikan waktu animasi**, lalu dapat dilanjutkan. Membuka menu lain, menutup panel, membatalkan, meninggalkan wilayah, Kembali ke Pos atau reload memulihkan alat ke posisi aman. Hasil yang belum ditekan Catat tidak ditambahkan.
- Pulihkan Alat mengembalikan kedua piston, platform dan peti ke posisi awal; data sah serta XP tidak dihapus. Setelah Catat, modul tetap terkunci sampai platform dikembalikan.

Tidak ada persyaratan menahan tombol, menekan dengan gaya fisik, atau batas waktu siswa membaca.

## Model ilmiah dan satuan

Asumsi: cairan tidak termampatkan, tidak ada kebocoran, gesekan serta massa piston diabaikan. Gerak kuasistatik; perubahan kecepatan dan perbedaan tekanan hidrostatis antara piston diabaikan. Ini **alat virtual**, bukan petunjuk memperbaiki alat industri atau instalasi nyata.

- `Δp = F₁ / A₁`
- `F₂ = Δp × A₂`
- `A₁ × s₁ = A₂ × s₂`
- `F₁ × s₁ = F₂ × s₂`

Δp adalah **tambahan tekanan yang diteruskan**, bukan tekanan absolut nol pada keadaan awal. Kondisi awal peti ditopang penyangga. Luas berbeda dari diameter; luas lingkaran empat kali berarti diameter dua kali.

Konversi eksplisit: **1 cm² = 0,0001 m²**, **1 cm = 0,01 m**, 1 mm = 0,001 m. Perhitungan gaya/tekanan memakai SI. Transaksi menyimpan integer **mm**, **mm³**, dan **mJ**; 1.000 mJ = 1 J. Volume perpindahan berasal dari luas × gerak dan sama pada kedua piston.

| Modul | Luas keluar | Gaya masuk yang diperlukan | Gerak masuk | Gerak keluar | Usaha ideal |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 5 cm² | 100 N | 5 cm | 5 cm | 5 J |
| B | 10 cm² | 50 N | 10 cm | 5 cm | 5 J |
| C | 20 cm² | 25 N | 20 cm | 5 cm | 5 J |

Angka di atas dihitung oleh `hydraulicResult`, fungsi yang sama untuk animasi, rekaman jurnal dan pemeriksaan impor. UI tidak memiliki dataset hasil salinan. Pengujian awal menyediakan gaya/gerak yang cukup untuk ketiganya.

Pada tantangan, kedua batas berlaku bersamaan:

| Modul | Penggerak / gerak aktual | Kenaikan aktual | Hasil |
| --- | --- | ---: | --- |
| A | 50 N tersedia; kedua piston diam | 0 cm | Perlu 100 N; tertahan. Tidak ada cairan mengalir atau piston menembus cairan |
| B | 50 N; masuk 10 cm | 5 cm | Memenuhi batas gaya dan gerak |
| C | 25 N; masuk dibatasi 12 cm | 3 cm | Gerak belum cukup untuk target; usaha aktual 3 J |

Keuntungan gaya tidak menciptakan energi: pengurangan gaya memerlukan gerak masukan lebih panjang. Alat nyata dapat mengalami gesekan dan kerugian. Model ini tidak menghitung efisiensi alat nyata atau gerak dinamis.

## Visual dan arsitektur

Halaman hidraulik tersambung ke jalur Bengkel. Tanah, batas z=36, penghalang, titik pendekatan dan tinggi peta ikut diperluas. Semua stasiun M17 lama tetap dapat dicapai. W06 tetap satu regionRoot aktif; tidak ada renderer, loop input, atau frame loop kedua.

`hydraulicWorld.ts` membangun meja, tiga modul, pengukur gaya, penggaris, saluran, dua piston, platform dan **satu** peti ber-ID `research-supply-crate`. Peti bergerak bersama platform dan tidak menjadi item tas. Mesh dan marker digunakan ulang setiap frame. Aset stasiun dimiliki wilayah dan dibersihkan melalui pelepasan region World, tanpa menghapus geometri karakter bersama.

Penampang radial silinder diperbesar **×12** agar terlihat (luas visual bertambah kuadratnya), dengan label eksplisit. Ini diagram alat, bukan representasi ukuran silinder asli. **Perpindahan vertikal tetap 1:1 dalam meter dunia**; kenaikan 5 cm tetap 0,05 unit. Kamera detail dan diagram panel memperjelas perpindahan tersebut tanpa mengubah skala dunia. Diameter keluaran mengikuti akar rasio luas. Jumlah marker cairan tetap; selama gerak, volume visual masuk yang berkurang sama dengan volume keluaran yang bertambah. A tertahan tidak menggerakkan marker cairan.

Pembagian kode:

- `hydraulicContent.ts` / `hydraulicRegion.ts`: parameter, materi, identitas serta stasiun.
- `hydraulicModel.ts`: konversi, model ideal dan batas tantangan.
- `hydraulicMission.ts`: urutan bukti, revisi transaksi, aturan penggantian, catatan dan hadiah.
- `hydraulicSession.ts`: animasi presentasi dari delta loop World yang sudah ada; tidak memakai jam nyata atau timer tambahan.
- `hydraulicWorld.ts`: geometri dan visual dari hasil model.
- `hydraulicUI.ts`: kontrol, diagram pembesaran, tabel, jurnal dan kesimpulan.

Fase uji: **running → preview → observed → recorded → recover**. Tiba otomatis, membuka tabel, atau menunggu animasi tidak mencatat hasil. Catat adalah transaksi atomik berbasis revisi; klik/event lama ditolak. Pembatalan memulihkan keadaan tanpa bukti baru. Tiga percobaan, pengangkatan tantangan sah serta kesimpulan benar wajib sebelum completed.

## Penyimpanan dan kompatibilitas

IndexedDB tetap **skema 1** pada store `saves`, key baru **M16-E2**. Dua belas misi/episode disimpan dalam satu transaksi. Format cadangan **v12** menerima semua versi **v1–v11**; episode yang tidak dicakup cadangan lama dipertahankan.

Parser memutar ulang riwayat yang sah, menghitung hasil dari model, lalu membandingkan seluruh keadaan. Pemalsuan gaya, gerak, keberhasilan tantangan, urutan bukti atau receipt hadiah ditolak sebelum menyimpan. Reload membatalkan trial sementara, mengembalikan peti ke posisi awal serta mempertahankan hasil yang disahkan. Status completed saat ini terpisah dari bukti hadiah pertama. Reset dan impor percobaan lebih awal tidak menambahkan hadiah kedua.

Fixture cadangan sebelumnya dibekukan di `tests/fixtures/all-through-m16-e1-v11.json`. Riwayat ROV dan M17 tidak diubah oleh episode ini.

## Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | **446 lulus**, 16 berkas; **47 baru** untuk hidraulik |
| `npm run test:launcher` | **14 lulus**, Node/Linux |
| `npm run build` | TypeScript dan Vite lulus |
| `npm run test:e2e` | **64 lulus** dalam 33,1 menit, seluruh regresi game |
| Pengulangan pada kode akhir | **13 lulus** dalam 6,3 menit: hidraulik, ROV, empat ukuran produksi |
| `npm run prepare:local` | Build terbaru berhasil dibuat dan dipromosikan untuk peluncur harian |

Rangkaian 64 browser dijalankan sebelum koreksi UI akhir: mempertahankan pilihan rencana/prediksi setelah render, memperlebar bingkai detail dan memperbarui teks ROV tentang episode hidraulik yang tersedia. Setelah koreksi tersebut, 446 unit test serta jalur persiapan lulus kembali, kemudian **seluruh 13 pemeriksaan terkait diulang pada kode akhir dan lulus**. Model fisika, aturan misi, serta transaksi penyimpanan tidak berubah dalam koreksi tersebut. Bukti mesin dan hash source/build: [verification.json](evidence/hydraulic/verification.json).

Unit test memeriksa konversi cm²/m² dan cm/m, F/A, rasio diameter, kesetaraan volume, tiga usaha 5 J, A tertahan, B berhasil, C hanya 3 cm, penggantian saat aman, fase Amati/Catat, pembatalan/reload, replay impor, reset dan pengulangan hadiah, satu peti, mesh yang dipakai ulang, gerak pada empat interval frame dan semua sebelas format cadangan lama. Jalur ke setiap stasiun W06 lama serta baru diperiksa.

Alur browser hidraulik dimulai dari Kota dengan progres lama v11, kemudian menerima episode, membaca sumber di lokasi, memeriksa peti, memperbaiki variabel yang keliru, memasang modul dari rak, menjalankan serta mencatat A/B/C, membatalkan uji yang belum disahkan, mencoba tantangan A/C/B, memperbaiki kesimpulan, menyimpan refleksi, reload, ekspor v12, menolak impor yang memalsukan hasil, mengimpor v1–v11, reset dengan hadiah tetap dan kembali ke Kota. Seluruh sebelas progres sebelumnya dibandingkan; hanya timestamp penyimpanan M01 yang boleh berubah.

Laptop memeriksa Enter pada tombol, jeda fokus, pembatalan reload/penutupan, input diam setelah panel dan preferensi kamera. HP 390×844, 844×390 serta IFP 1920×1080 menjalankan tantangan C/B dengan sentuhan, pemulihan dan tabel tanpa overflow. Pemeriksaan produksi menutup akses eksternal, membuka game/seluruh model galeri serta memeriksa round trip IndexedDB dua belas misi pada empat viewport. ROV, M17, lari, berenang, perahu, gerobak, air Rimba, M01 dan M14 semuanya tercakup regresi penuh.

## Bukti visual

- [Kebutuhan dan rencana](evidence/hydraulic/01-requirements.png).
- [Meja dan modul](evidence/hydraulic/02-apparatus.png).
- [Pengujian A](evidence/hydraulic/03-test-A.png), [B](evidence/hydraulic/03-test-B.png), [C](evidence/hydraulic/03-test-C.png).
- [Tantangan A tertahan](evidence/hydraulic/04-challenge-A.png), [C hanya 3 cm](evidence/hydraulic/04-challenge-C.png), [B mencapai 5 cm](evidence/hydraulic/04-challenge-B.png).
- [Jurnal](evidence/hydraulic/05-journal.png).
- [HP potret](evidence/hydraulic/06-touch-390.png), [HP lanskap](evidence/hydraulic/06-touch-844.png), [IFP](evidence/hydraulic/06-touch-1920.png).
- [Meja produksi](evidence/hydraulic/07-production-apparatus.png), [uji C](evidence/hydraulic/08-production-test-C.png), [tantangan A](evidence/hydraulic/08-production-challenge-A.png), [C](evidence/hydraulic/08-production-challenge-C.png), [B](evidence/hydraulic/08-production-challenge-B.png).
- [Jurnal produksi](evidence/hydraulic/09-production-journal.png), [HP potret](evidence/hydraulic/10-production-touch-390.png), [HP lanskap](evidence/hydraulic/10-production-touch-844.png), [IFP](evidence/hydraulic/10-production-touch-1920.png).
- [Tabel HP potret](evidence/hydraulic/11-production-table-390.png), [lanskap](evidence/hydraulic/11-production-table-844.png), [IFP](evidence/hydraulic/11-production-table-1920.png).
- [Cuplikan kedua piston dan tantangan](evidence/hydraulic/motion/hydraulic-pistons.webm), [metadata](evidence/hydraulic/motion/recording.json). Cuplikan sekitar 31 detik, direkam kontinu dari build produksi, mulai checkpoint persiapan yang diperoleh melalui UI browser; tiga uji dan tiga tantangan dijalankan serta disahkan melalui tombol game. Tidak menggunakan data hasil otomatis atau perangkat fisik.
- [Siklus sumber daya](evidence/hydraulic/resource-cycles.json): tiga kali Kota–Bengkel memeriksa satu regionRoot aktif, satu peti dan jumlah geometri 109 → 109 → 109 serta tekstur 47 → 47 → 47. Ini bukan seluruh pengukuran memori atau benchmark FPS.

## Keterbatasan

HP/IFP diperiksa melalui viewport dan sentuhan simulasi Chromium, **bukan perangkat fisik**. BAT Windows dan koneksi LAN belum diuji langsung pada perangkat Windows/HP/IFP. SwiftShader bukan benchmark performa GPU sekolah. Build masih memiliki peringatan chunk Three.js bersama di atas 500 kB; tidak menghalangi build. Silinder memakai penampang ilustratif yang diperbesar; geraknya tetap sesuai data. Tidak ada simulasi kebocoran, viskositas, pemampatan, rugi mekanik, tekanan absolut atau efek dinamis. Tekanan zat padat dan pengayaan gaya apung M16 menjadi tahap terpisah.
