# Tahap 07 — Koin Sains dan hadiah misi

30 Oktober 2026 (Asia/Bangkok). Branch `feat/visual-stage-07`, berdasarkan tahap 06 `fd0a4c9`. Semua branch remote diperiksa; hasil visual, lemari, astronot dan menyelam terbaru berada pada rantai feature, bukan main lama. Worktree awal bersih dan AGENTS.md tidak ditemukan. README, rancangan hadiah/misi, parser, XP/rewardProof, penyimpanan, cadangan serta laporan tahap 01–06 diperiksa sebelum mengubah kode.

Tahap ini menambahkan ekonomi lokal saja: **tidak ada misi baru, toko, pembelian, pembayaran, bonus kemampuan atau hadiah berdasarkan waktu bermain**. Katalog starter dan perlengkapan fungsional tetap gratis.

## Cara mencoba

1. Jalankan build terbaru melalui peluncur biasa pada alamat yang sama. Tutup tab versi lama, lalu muat ulang permainan. Tidak perlu menghapus IndexedDB.
2. Progres lama yang sah diperiksa otomatis dalam transaksi. Jika ada hak baru, satu ringkasan muncul sesudah Mulai: jumlah koin dan ID misi yang diakui.
3. Selesaikan misi beserta bukti dan kesimpulannya. HUD koin baru berubah **setelah transaksi selesai**, bukan setelah tombol diklik atau animasi selesai.
4. Tekan tombol koin pada header, atau **Pengaturan → Dompet · riwayat koin**. Dompet menampilkan saldo, nama misi, jumlah dan tanggal hadiah. Tidak ada tombol toko yang belum berfungsi.
5. Ekspor dari Pengaturan menghasilkan **cadangan v19** berisi identitas profil, ledger, bukti, misi dan penampilan. Reload, impor ulang dan reset misi tidak menggandakan hadiah.

Jika tab lain lebih dulu menyimpan, tab dengan revisi lama ditolak dan menampilkan **Muat ulang data tersimpan**. Gunakan satu tab permainan untuk menulis progres. Jika penyimpanan gagal, saldo tetap pada transaksi terakhir dan **Coba simpan lagi** tersedia. Tombol ini tetap memeriksa revisi; tidak menimpa perubahan tab lain secara paksa.

## Aturan versi 1

| Misi yang tersedia | Jenis | Koin sekali |
|---|---|---:|
| M01, M02, M07, M13, M14 | Utama | 100 per misi |
| M16: E1, E2, E3 dan E4 lengkap | Bab utama | 100 untuk bab |
| M17: E1, E2 dan E3 lengkap | Bab utama | 100 untuk bab |
| S13, S14, S15, S16 | Sampingan | 30 per misi |
| W03-LOG01 | Tambahan logistik | 50 |

Registry tidak memuat misi yang belum tersedia. Episode M16/M17 tidak memiliki aturan koin tersendiri. Membaca, kunjungan, pengamatan, checkpoint, pengulangan dan pergantian wilayah tidak menambah koin. Seluruh aturan/jumlah XP episode tetap terpisah. Bab tidak memperoleh tambahan XP dari fitur ini, dan S11/S17 atau misi lain tidak otomatis selesai.

Fixture lengkap yang menyelesaikan **M01, M07, M13, M14, M16, M17** memperoleh 600; **S13–S16** memperoleh 120; **W03-LOG01** memperoleh 50: **770 koin**. Ini bukan saldo awal. Fixture v16 lama di repository ternyata belum menyelesaikan M01/M14, sehingga haknya hanya **570**. Fixture contoh 770 dibangun melalui tindakan M01 dan helper percobaan M14 yang sah. M02 yang selesai kemudian menambah 100; seluruh 12 hadiah yang tersedia berjumlah paling banyak **870**, sementara XP memiliki perhitungannya sendiri.

## Registry dan bukti

- `missionRecords.ts` memusatkan ID penyimpanan, properti game dan parser 17 misi/episode yang sudah ada.
- `coinEconomy.ts` memuat registry jenis, nama, jumlah, versi aturan dan dependensi bukti. Pemeriksa kelayakan memakai parser tersebut, termasuk replay riwayat pada format yang menyediakannya.
- Profil lokal memakai UUID v4 dari `crypto.getRandomValues`, dibuat sekali dalam transaksi. Tidak bergantung pada API `randomUUID` yang terbatas secure context, agar HTTP LAN tetap didukung. Tidak ada login atau sidik perangkat.
- ID hadiah: **`<profileId>:mission:<missionId>`**. Versi aturan hanya metadata; bukan bagian kunci yang membuka hadiah ulang.
- Receipt berisi ID, misi, jenis transaksi, jumlah, versi aturan, sumber, waktu ISO dan snapshot bukti. Bukti bab mengarsipkan keempat/tiga episode yang benar-benar lengkap pada saat pemberian.
- Saldo adalah cache yang wajib sama dengan jumlah ledger. Bilangan tidak aman, negatif, pecahan, NaN, overflow, versi tak dikenal, ID palsu, hadiah ganda, bukti atau jumlah yang tidak sesuai ditolak. Parser juga mencocokkan riwayat XP misi terhadap receipt koin.
- Tanggal memakai jam perangkat untuk riwayat; bukan bukti waktu terpercaya atau sumber hadiah harian.

M16/M17 memerlukan `completed` semua episode **saat pemberian**. Sekumpulan receipt XP episode yang sudah direset tidak dianggap bukti bahwa satu bab pernah tuntas bersamaan. Tanpa receipt bab yang telah diarsipkan, hak bab baru diberikan saat syarat tersebut terpenuhi berikutnya. Status bab di HUD tetap mengikuti completed saat ini, sehingga reset mengubah status belajar tetapi tidak menarik koin yang sudah sah.

Format lama M14, W03-LOG01, S13, S14 dan S15 mempertahankan receipt XP per misi berupa reward dan `firstCompletedAt` setelah reset. Receipt native yang lolos parser ini diakui; **total XP tidak dipakai untuk menebak misi**. M02/M07/M13/S16 memakai bukti XP yang dapat diputar ulang. M01 diperluas dengan proof penyelesaian opsional agar reset/impor lama mempertahankan XP 100 dan tidak memulai hadiah baru. Berkas M01 lama tetap didukung. Jika M01 pernah direset pada versi lama hingga seluruh bukti dan receipt XP hilang, riwayat itu tidak dapat direka; selesaikan lagi untuk memperoleh hak yang belum tercatat.

## Transaksi dan ketahanan

Cadangan **v19**, versi model dompet **1**, dan skema IndexedDB **2** adalah tiga nomor berbeda. Store `saves` dan semua key misi lama dipertahankan. Skema 2 sengaja menolak kode lama yang membuka database versi 1 dan belum memeriksa revisi; bukan penghapusan/membangun ulang progres.

`loadGame()` membaca misi yang sah dan melakukan pengakuan progres lama dalam satu transaksi readwrite. Migrasi menciptakan profil/ledger hanya jika belum ada, lalu menambah ID hadiah yang belum tercatat. Reload tidak memulai saldo baru.

`saveGame()` membaca revisi dan wallet terbaru di dalam transaksi readwrite yang sama. Jika revisi kandidat berbeda, **seluruh transaksi dibatalkan**. Jika sesuai, transaksi menulis misi, XP, penampilan, world, ledger, arsip profil dan revisi berikutnya sekaligus. UI menerima saldo/notifikasi pada `oncomplete`. Antrean autosave menggunakan revisi hasil commit sebelumnya; snapshot dari tab lama tidak bisa melewati pemeriksaan ini. Helper simpan M01 juga memerlukan revisi pemanggil.

Kegagalan yang disuntikkan pada penulisan wallet setelah penulisan misi dijadwalkan membuktikan rollback: misi, XP, ledger dan revisi tetap sama. Coba ulang dapat menyimpan kandidat yang belum tersimpan satu kali. Reload di tengah penyelesaian menghasilkan seluruh transaksi atau keadaan sebelumnya, bukan hadiah parsial.

## Impor dan kontrak tahap toko

[Petunjuk pemain dan cadangan](backup-economy.md).

Semua versi **1–18** tetap diterima sesuai cakupan semula. Tanpa ekonomi, impor mempertahankan wallet/receipt aktif, memulihkan misi dalam cakupannya dan merekonsiliasi hak yang belum diberikan. Data baru divalidasi seluruhnya sebelum transaksi; keadaan dunia/penampilan aktif baru diganti setelah commit.

Untuk profil sama, **ledger bersifat append-only dengan aturan prefix**:

- Cadangan lebih lama yang merupakan prefix tidak memangkas ledger aktif yang lebih panjang.
- Cadangan lebih baru boleh memperpanjang prefix yang sama.
- Riwayat bercabang, metadata transaksi yang berubah, atau saldo tidak sesuai ditolak. Tidak ada penjumlahan dua saldo, penukaran ID atau penggabungan fork diam-diam. Urutan properti JSON tidak dianggap konflik.

Profil berbeda memerlukan tombol **Pulihkan profil dan dompet dari cadangan** atau Batal. Pemulihan mengganti profil serta misi/XP/penampilannya, tidak mencampurkan reward profil lama. Arsip ledger `economy-history:<profileId>` mempertahankan checkpoint profil yang pernah dikenal pada origin ini. Saat kembali ke profil tersebut, importer memeriksa checkpoint miliknya sendiri; berpindah profil tidak menjadi cara memangkas riwayat. Arsip profil lain tidak ikut diekspor sebagai bagian profil aktif.

**Kontrak tahap 8:** pengeluaran dan pembelian harus menjadi transaksi append-only ber-ID stabil, disahkan bersama kepemilikan kosmetik dan revisi dalam transaksi penyimpanan yang sama. Perluas model/parser wallet dan versi cadangan secara eksplisit; migrasikan reward versi 1 tanpa mengubah ID-nya. Rekonsiliasi cadangan lama harus mempertahankan pengeluaran/kepemilikan yang lebih baru, termasuk checkpoint profil yang tidak sedang aktif. Jangan menghitung ulang saldo dari reward saja, mengurangi DOM, atau memulihkan array kepemilikan lama yang menghapus pembelian terbaru. Transaksi belanja saat ini **belum diimplementasikan dan ditolak parser**.

Sistem sepenuhnya lokal. Tidak ada tanda tangan server atau klaim kebal manipulasi JSON/IndexedDB. Pada perangkat/origin baru, atau setelah seluruh data browser sengaja dihapus, aplikasi tidak dapat mengetahui transaksi yang tidak ada dalam cadangan. Gunakan cadangan terbaru; pencegahan lintas perangkat yang benar-benar otoritatif memerlukan sistem lain yang tidak termasuk tahap ini.

## UI dan bukti dari permainan

Ikon dan saldo menggunakan header yang sudah ada, bukan renderer atau loop baru. Dompet memakai dialog yang sama, dapat dipakai melalui keyboard/sentuhan dan menggulir riwayat pada layar kecil. Pengurangan gerakan tidak memengaruhi hak koin; tidak ada animasi wajib. Menutup Dompet memerlukan input gerak baru.

- [M01 selesai dan hadiah](evidence/coin-economy/01-reward.png) · [riwayat satu hadiah](evidence/coin-economy/02-wallet.png).
- [Satu ringkasan migrasi](evidence/coin-economy/03-migration.png) · [fixture v18 yang sah](evidence/coin-economy/legacy-v18.json) · [rincian 770](evidence/coin-economy/migration.json).
- [Transaksi gagal, saldo tetap nol](evidence/coin-economy/04-storage-failure.png) · [tab usang ditolak](evidence/coin-economy/05-stale-tab.png) · [konfirmasi profil di HP](evidence/coin-economy/06-profile-confirmation.png).
- HUD [laptop](evidence/coin-economy/07-hud-1440.png), [HP potret](evidence/coin-economy/07-hud-390.png), [HP lanskap](evidence/coin-economy/07-hud-844.png), [IFP](evidence/coin-economy/07-hud-1920.png).
- Dompet [laptop](evidence/coin-economy/08-wallet-1440.png), [HP potret](evidence/coin-economy/08-wallet-390.png), [HP lanskap](evidence/coin-economy/08-wallet-844.png), [IFP](evidence/coin-economy/08-wallet-1920.png).

Gambar berasal dari aplikasi yang berjalan di Chromium, bukan mockup. Fixture dan identitas yang ditampilkan adalah data pengujian.

## Pemeriksaan

| Pemeriksaan | Hasil |
|---|---|
| `npm test` | **818 lulus**, 28 berkas, termasuk 53 pemeriksaan ekonomi baru |
| `npm run test:launcher` | **16 lulus** |
| `npm run build` / `npm run prepare:local` | **Lulus**; produksi dibangun melalui staging aman |
| Browser ekonomi | **12 kasus lulus**: M01 utuh, migrasi 1→2, hadiah/klik ganda, rollback, dua tab, transaksi paralel, profil/arsip, reload dan empat viewport |
| Regresi browser penuh | **139/140 lulus pada putaran penuh**; satu kasus resource diperbaiki dan lulus pada pemeriksaan ulang empat siklus. Kasus notifikasi profil tambahan juga lulus. |

Linux/Chromium dengan SwiftShader. HP/IFP adalah emulasi viewport dan sentuhan, bukan perangkat fisik. Windows BAT, perangkat Windows/HP/IFP, GPU sasaran dan LAN antarperangkat belum diuji langsung. Peringatan chunk besar dan deprecation THREE.Clock yang sudah ada tetap dicatat. Tidak ada dependensi runtime baru, API, CDN, backend atau penghapusan data pemain.

### Penyelesaian prasyarat sebelum tahap toko

Lingkungan sempat tidak dapat diakses, tetapi proses pengujian terus berjalan. Log akhir menunjukkan 139/140 lulus, bukan 140 yang diasumsikan selesai. Kegagalan membandingkan dua angka GPU sesaat ditelaah kembali: geometri wilayah yang direferensikan tetap **127** pada empat siklus, sedangkan buffer GPU yang sudah diunggah **106 → 106 → 105 → 106**, tekstur tetap 57; satu avatar/wilayah/kendaraan. Pemeriksaan kini membandingkan struktur dan plateau beberapa siklus. [Hasil empat siklus](evidence/coin-economy/resource-recheck.json). Tidak ada bukti pertumbuhan resource pada alur tersebut.

Pemeriksaan ulang juga menangkap race reload perjalanan: fase persiapan sempat tampil sebelum lokasi tersimpan. Transisi kini menunggu transaksi lokasi sebelum mengubah wilayah/menampilkan fase. Reload persiapan serta keberangkatan lulus. Pergantian profil membatalkan notifikasi profil sebelumnya. Kedua pemeriksaan ulang lulus; hasil regresi penuh dan pemeriksaan ulang dilaporkan terpisah.

Sesudah koreksi akhir, unit **818**, launcher **16**, ekonomi browser **12**, paket produksi offline **4**, serta build/persiapan lulus kembali. Paket tahap 07 berisi build sumber `10486ed`, **638.101 byte**, jalur maksimum 43 karakter. [Manifest pemeriksaan paket](evidence/coin-economy/ready-package.json).
