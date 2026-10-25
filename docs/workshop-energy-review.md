# W06 — M17-E3 Energi untuk Pos Riset

Episode ketiga M17 menambahkan halaman energi di utara Bengkel. Panel surya, turbin, penyimpan 8 Wh, konektor DC teratur, tester, dan layanan baru 4 W memakai model tersendiri. Sumber, lampu, alat, serta bukti historis M17-E1/E2 tidak diubah oleh model baru. Prosedur reload E2 yang sudah ada tetap memulihkan posisi derek ke baki tanpa mengubah data uji, ID terkirim, atau bukti hadiah. Seluruh wilayah tetap memakai satu renderer, loop World, dan input yang sama.

## Cara bermain

1. Masuk Bengkel dari Kota. Pilih **M17-E3** dan terima tugas Kak Bima. Misi lama tidak menjadi syarat kunjungan.
2. Baca empat kartu **Buku energi** dan **Catatan kebutuhan pos**. Jalan tengah menuju halaman utara tersambung; semua stasiun tersedia pada peta dan kartu tujuan.
3. Di Panel surya, Turbin, atau Tester daya, pilih sumber/kondisi, simpan prediksi W, lalu jalankan. Amati indikator dan objek 3D, tekan **Amati indikator**, lalu **Catat hasil**. Lengkapi enam kondisi. Prediksi boleh berbeda dari hasil; upaya awal tetap tersimpan.
4. Di **Rencana & konektor**, susun tiga interval. Pilih panel, turbin, dan penggunaan baterai untuk tiap interval. Kebutuhan layanan selalu 4 W. Tidak ada satu pola pilihan wajib selama kebutuhan terpenuhi menurut model.
5. Dengan suplai mati, hubungkan port berpasangan **PV–BUS**, **WT–BUS**, **BAT–BUS**, dan **BUS–POS** sesuai komponen yang dipakai. Setiap port mencakup jalur pergi/kembali (+/−) dan pengaturan DC yang cocok. Pilih dua terminal atau daftar pasangan; hubungan langsung PV–POS ditolak. Periksa kecocokan, lalu aktifkan sistem.
6. Dekati **Layanan baru 4 W**. Jalankan interval, tunggu animasi **1 jam simulasi dipercepat**, amati pratinjau, lalu **Catat interval**. Energi permanen tidak berubah sebelum pengesahan. Gunakan tombol **Lihat panel/turbin/baterai/layanan** untuk membidik objek pada kamera yang sama.
7. Jika kebutuhan belum terpenuhi, hasil tetap dapat dicatat. Matikan suplai dan pilih **Ulangi Uji Rencana**. Ini memulai percobaan baru tepat dari 2 Wh, bukan menambah 2 Wh. Hasil lama dan enam uji sumber tetap ada. Ubah rencana di konektor, periksa kembali, lalu jalankan tiga interval baru.
8. Periksa tabel dan grafik di jurnal. Sampaikan kesimpulan kepada Kak Bima berdasarkan enam uji dan satu percobaan tiga interval yang seluruhnya terpenuhi. Refleksi opsional disimpan tanpa penilaian kata kunci. Hadiah **50 XP sekali**.
9. Kembali ke Kota melalui gerbang Bengkel. Reload menempatkan pemain di pos aman, membatalkan pratinjau belum disahkan, dan mempertahankan hasil sah.

Laptop memakai WASD/panah/Shift dan E seperti sebelumnya; panel memakai Tab, panah pada pilihan, Enter, serta checkbox. HP/IFP menggunakan tombol besar, daftar pasangan, dan peta tanpa drag presisi. Membuka panel menghentikan eksplorasi; setelah ditutup input baru diperlukan. Tidak ada batas waktu membaca atau reaksi cepat.

## Dataset sumber

| Sumber | Kondisi model | Daya tersedia |
| --- | --- | ---: |
| Panel surya | Terang | 6 W |
| Panel surya | Mendung | 2 W |
| Panel surya | Malam tanpa pencahayaan lain | 0 W |
| Turbin | Angin cukup | 5 W |
| Turbin | Angin lemah | 1 W |
| Turbin | Angin tenang | 0 W |

Kondisi dipilih pada alat simulasi, bukan jam/cuaca perangkat. Data adalah parameter latihan, bukan spesifikasi alat nyata. Label sumber menunjukkan **daya tersedia**; pratinjau interval menunjukkan daya yang benar-benar dipakai dari sumber yang dipilih dan terhubung. Tester sumber tidak mengisi baterai latihan. Hasil yang belum disahkan bertuliskan **Belum diuji**.

Panel surya tetap diam; warna/indikatornya mengikuti kondisi cahaya. Turbin berputar sesuai kondisi angin, termasuk berhenti saat tenang. Gerak dekoratif tidak menentukan hasil. Pengurangan gerakan memperlambat rotasi dekoratif, tanpa mengubah daya atau transaksi energi.

## Model energi dan neraca

Kebutuhan lampu/instrumen baru **4 W**, kapasitas penyimpan **8 Wh**, energi awal **2 Wh** dari pengisian sebelum latihan, durasi setiap interval **1 jam simulasi**. Internal memakai integer **mWh**: 1 Wh = 1.000 mWh. Versi data dan nama field tidak mengubah satuan fisik tersebut.

**Energi = daya × waktu. Contoh: 4 W selama 1 jam memerlukan 4 Wh.** Baterai menyimpan energi, bukan menciptakannya; kapasitas 8 Wh tidak sama dengan daya 8 W.

Sumber melayani beban dahulu. Kelebihan mengisi baterai bila terhubung dan dipilih, sampai kapasitas. Jika penuh/tidak digunakan, kelebihan dicatat sebagai surplus tidak disimpan. Kekurangan dilayani baterai selama cukup; sisanya dicatat sebagai kebutuhan belum terpenuhi. Mematikan atau melepaskan beban tidak dianggap sukses: layanan 4 W dan konektornya wajib untuk menjalankan interval.

Setiap baris memenuhi:

**energi sumber + baterai awal = energi beban terlayani + baterai akhir + surplus tidak disimpan**.

Kebutuhan belum terpenuhi dicatat terpisah dan tidak ditambahkan ke neraca energi yang tersedia.

| Interval | Cahaya / angin | Sumber | Baterai awal | Beban terlayani | Baterai akhir | Surplus | Belum terpenuhi |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Terang / tenang | 6 Wh | 2 Wh | 4 Wh | 4 Wh | 0 Wh | 0 Wh |
| 2 | Mendung / tenang | 2 Wh | 4 Wh | 4 Wh | 2 Wh | 0 Wh | 0 Wh |
| 3 | Malam / cukup | 5 Wh | 2 Wh | 4 Wh | 3 Wh | 0 Wh | 0 Wh |

Contoh bukan satu-satunya susunan sah. Misalnya baterai tidak dipakai pada interval 3: turbin tetap melayani 4 Wh, surplus 1 Wh tidak disimpan, baterai tetap 2 Wh. Model menerima hasil itu. Unit test juga mencakup baterai kosong, penuh, pengisian, pengosongan, dan seluruh rentang integer yang dipakai.

Daya dinyatakan tersedia pada **bus DC teratur model**, dengan konektor cocok. Ini bukan kegiatan menyambungkan tegangan sembarang atau petunjuk listrik rumah. Model mengabaikan rugi konversi/penyimpanan, pengosongan sendiri, serta menganggap batas daya baterai cukup. Tidak ada simulasi cuaca nyata, degradasi, biaya, atau pemilihan sistem terbaik universal.

## Bukti, pengulangan, dan status bab

Pengujian sumber serta interval memiliki tahap berjalan → pratinjau → diamati → dicatat. Hanya tindakan terakhir menambah bukti; interval memindahkan energi secara atomik. Revision mengabaikan klik ganda/lama. Menutup panel, jeda/fokus hilang, tab tersembunyi, reload, impor, dan perpindahan wilayah membatalkan transaksi belum disahkan; waktu nyata tidak menghabiskan energi.

Jurnal memuat prediksi dan perbaikannya, enam daya sah, rencana tiap percobaan, baterai awal/akhir, sumber, beban terlayani, surplus, kekurangan, kesimpulan, dan refleksi. Percobaan gagal tetap dapat dibaca setelah retry. Grafik memakai catatan yang sama dengan tabel, termasuk nilai awal 2 Wh; interval masa depan tidak diberi angka nol palsu.

**Bab M17 = Tuntas hanya jika completed E1, E2, dan E3 semuanya true.** Status dihitung dari tiga flag saat ini, tidak disimpan sebagai hadiah/flag terpisah. Reset salah satu episode mengembalikan bab ke **Dalam pengembangan**, walaupun XP pertama masih tersimpan. Tidak ada hadiah bab tambahan. S11 tidak otomatis selesai.

## Penyimpanan dan struktur

- `energyContent.ts`, `energyRegion.ts`: dataset, materi, kondisi, port, lokasi dan footprint.
- `energyModel.ts`: daya, energi, pembagian sumber/baterai, neraca murni.
- `energyMission.ts`: urutan bukti, percobaan, transaksi, parser replay, hadiah.
- `energySession.ts`: animasi dari delta loop World yang sudah ada, tanpa clock energi waktu nyata.
- `energyWorld.ts`: panel tetap, rotor, indikator baterai, konektor dan layanan baru.
- `energyUI.ts`: pengujian, perencanaan, perakitan sederhana, interval, tabel/grafik dan jurnal.
- `m17Chapter.ts`: status bab berdasarkan ketiga episode.

IndexedDB tetap `jelajah-sains`, store `saves`, **skema 1**. Rekaman **M17-E3** ditambahkan ke transaksi sembilan misi/episode. Cadangan **v9** menerima semua format **v1–v8**, mempertahankan episode yang tidak dicakup. Fixture v8: `tests/fixtures/all-through-m17-e2-v8.json`. Versi format cadangan berbeda dari skema IndexedDB.

Parser memutar ulang prosedur dan mencocokkan status, dataset, setiap neraca, urutan interval, sambungan, kesimpulan, serta bukti hadiah pertama. Impor tidak sah ditolak sebelum mengubah progres. Reset episode meminta konfirmasi dan menyimpan bukti hadiah pertama. Reload mematikan suplai runtime tetapi mempertahankan interval sah; mengaktifkannya kembali tidak memindahkan energi sampai interval berikutnya disahkan.

## Pemeriksaan

Lingkungan: Linux, Node 24.19.0, npm 11.9.0, Chromium 154 dengan WebGL SwiftShader.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | **314 lulus**, 13 berkas, termasuk 57 uji baru |
| `npm run test:launcher` | **14 lulus** pada Node Linux |
| `npm run build` melalui `node scripts/local/prepare.mjs` | **Lulus**; staging build dipromosikan setelah validasi |
| Browser khusus E3 | **4 lulus**, alur lengkap IFP, laptop, HP potret/lanskap |
| `npm run test:e2e` lengkap | **51 lulus**, 25,2 menit, sesudah koreksi footprint meja dan kamera tiang |
| Produksi setelah perapian satu teks petunjuk E1 | **4 lulus**, game/galeri offline, sembilan misi tersimpan, reset E1 menghitung ulang bab |
| Cuplikan produksi | Sekitar **33 detik**, enam kondisi sumber dan tiga interval melalui UI, tanpa page error |

Rangkaian lengkap terakhir sudah lulus sebelum perapian satu teks petunjuk lama E1 yang masih menyebut bab selalu dikembangkan. Setelah perubahan teks itu, jalur persiapan dan pemeriksaan produksi empat viewport dijalankan lagi. Tidak ada perubahan aturan atau data model setelah regresi lengkap.

Pemeriksaan browser juga menemukan dan memperbaiki binding tombol Jalankan setelah prediksi disimpan, serta urutan pemilihan episode setelah transisi wilayah. Grafik memakai tinggi sesuai viewBox, dan kamera objek memudahkan pemeriksaan alat yang tersebar. Lingkungan memakai Node/npm proyek dan Chromium Linux dengan WebGL SwiftShader. Browser memainkan alur lengkap dengan percobaan kekurangan, perbaikan, pembatalan/reload pratinjau, enam uji sumber, dua metode konektor, tiga interval, kesimpulan, ekspor/impor semua format lama, serta reset E2/E3 yang mengubah status bab tanpa menghapus hadiah.

Uji produksi memakai server statis peluncur, memblokir permintaan di luar origin, membuka game/galeri pada empat viewport, menyimpan sembilan misi, dan memeriksa reset E1 mengubah status bab. Regresi mencakup seluruh mekanik lama dan uji peluncur.

## Bukti visual

Tautan berikut adalah simulasi browser, bukan perangkat fisik:

- [Halaman energi](evidence/energy/01-energy-yard.png).
- Panel surya: [terang](evidence/energy/02-solar-bright.png), [mendung](evidence/energy/02-solar-cloudy.png), [malam](evidence/energy/02-solar-night.png).
- Turbin: [cukup](evidence/energy/02-wind-enough.png), [lemah](evidence/energy/02-wind-weak.png), [tenang](evidence/energy/02-wind-calm.png).
- [Rencana dan konektor](evidence/energy/03-assembly.png), [percobaan pertama kekurangan](evidence/energy/04-first-plan-shortage.png).
- [Interval 1](evidence/energy/05-interval-1.png), [interval 2](evidence/energy/05-interval-2.png), [interval 3](evidence/energy/05-interval-3.png).
- [Jurnal](evidence/energy/06-journal.png), [bab tuntas](evidence/energy/07-chapter-complete.png).
- HP: [perakitan potret](evidence/energy/08-hp-assembly-390.png), [lanskap](evidence/energy/08-hp-assembly-844.png), [pratinjau potret](evidence/energy/09-hp-preview-390.png), [lanskap](evidence/energy/09-hp-preview-844.png), [grafik potret](evidence/energy/10-hp-graph-390.png), [lanskap](evidence/energy/10-hp-graph-844.png).
- [Cuplikan sumber dan penyimpan](evidence/energy/motion/sources-and-storage.webm), [metadata](evidence/energy/motion/recording.json), [layanan produksi](evidence/energy/11-production-service.png).
- [Ringkasan verifikasi dan hash build](evidence/energy/verification.json).
- [State akhir browser](evidence/energy/final-state.json). Data hanya model dan refleksi uji, bukan data pribadi pemain.

Pengambilan ulang gambar: `CAPTURE_ENERGY_EVIDENCE=1 npm run test:e2e -- tests/energy.spec.ts`. Perekaman produksi: `node scripts/capture-energy-evidence.mjs` setelah build dan fixture browser tersedia; alat pengembang ini memerlukan Chromium dan ffmpeg. Game harian tidak memerlukan ffmpeg.

## Keterbatasan

Belum diuji pada HP/IFP fisik, Windows BAT secara langsung, atau LAN antarperangkat. Viewport/sentuhan Chromium bukan pengukuran FPS perangkat fisik atau jangkauan tangan di kelas. Baling-baling memakai animasi sederhana, listrik tidak memakai solver fisika, dan efek lampu ringan. Bundle Three.js bersama masih memberi peringatan ukuran chunk, tetapi build berhasil dan aset lokal tidak memerlukan CDN.

Materi masih memerlukan telaah guru serta pengujian pada perangkat sasaran. Tidak ada wilayah baru, hadiah bab tambahan, atau perluasan S11 di tahap ini.
