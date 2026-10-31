# Tahap 08 — Gaya Penjelajah

Tanggal pemeriksaan: 30–31 Oktober 2026. Branch `feat/visual-stage-08` memakai hasil tahap 07 dari `feat/visual-stage-07`, bukan kembali ke main lama. Tahap 07 diselesaikan lebih dahulu: registry hadiah, profil, ledger, revisi atomik dan bukti XP menjadi dasar toko. Tidak ditemukan AGENTS.md. README, rancangan, implementasi karakter/lemari, pergantian wilayah dan penyimpanan diperiksa. Tahap ini tidak menambah misi atau wilayah.

## Cara bermain

1. Masuk Kota Sains. Buka Peta → **Kak Mira · Butik**, atau dekati **Butik Gaya Penjelajah**.
2. Pemain benar-benar berjalan melalui pintu ke meja. E atau Buka toko memulai interaksi. Tidak bisa membeli dari luar tembok.
3. Pilih Kostum, Rambut atau Aksesori. Pilih barang lalu Coba; saldo dan kostum pribadi tetap.
4. Beli memperlihatkan harga dan sisa saldo, lalu **Ya, beli**. Jika kurang, tampil selisih dan petunjuk koin dari misi. Tidak ada uang nyata atau pemberian saldo produksi.
5. Pembelian tersimpan dahulu, tidak langsung dikenakan. **Pakai** menerapkan hanya barang terpilih yang sudah dimiliki, membatalkan percobaan slot lain. **Lepas** mengosongkan topi/headset, kacamata atau tas.
6. Batal/Kembali menutup preview. Transaksi/pemakaian yang sudah dikonfirmasi tetap; percobaan belum diterapkan dibatalkan. Pengaturan → Penampilan menyediakan starter gratis dan semua barang milik sendiri di wilayah mana pun.
7. Dompet menampilkan penerimaan dan pengeluaran. Ekspor cadangan v20 sesudah bermain.

## Katalog

Semua kompatibel dengan siswa/siswi. Dua belas ID starter tetap gratis. Perlengkapan fungsional selam dan astronot tetap gratis dan terpisah.

| Kategori | ID stabil | Barang | Koin | Pembeda bentuk |
|---|---|---|---:|---|
| Kostum | outfit-field | Penjelajah lapangan | 180 | Rompi berkantong timbul dan sabuk |
| Kostum | outfit-lab | Peneliti laboratorium | 180 | Kerah jas, kantong dan lencana |
| Kostum | outfit-gardener | Pekebun | 180 | Celemek, tali dan kantong depan |
| Kostum | outfit-technician | Teknisi bengkel | 180 | Strip kontras dan sabuk perkakas |
| Rambut | hair-curls | Keriting pendek | 60 | Lima kelompok ikal besar |
| Rambut | hair-undercut | Cepak samping | 60 | Sisi rendah dan poni atas |
| Rambut | hair-braid | Kepang | 60 | Tiga ruas kepang dan pengikat |
| Rambut | hair-bun | Sanggul | 60 | Sanggul membulat di belakang |
| Aksesori | hat-widebrim | Topi lapangan bertepi lebar | 40 | Tepi melingkar dan pita |
| Aksesori | glasses-research | Kacamata bingkai bulat | 40 | Bingkai 3D, gagang dan tali |
| Aksesori | pack-expedition | Tas ekspedisi berkompartemen | 40 | Kantong samping, gulungan dan tali |
| Aksesori | headset-field | Headset kosmetik | 40 | Bando, bantalan telinga dan mikrofon |

Total katalog berbayar 1.120 koin. Registry misi yang saat ini tersedia menyediakan maksimal 870 koin per profil (fixture migrasi tanpa M02: 770), sehingga pemain memilih barang terlebih dahulu; belum seluruh katalog dapat dikoleksi dari misi yang ada. Tidak ada hadiah palsu untuk nomor misi yang belum diimplementasikan.

Kepala, badan, lengan dan kaki tetap enam blok utama. Tinggi netral siswa/siswi 1,60, socket alat dan skala tidak berubah. Outfit/rambut/aksesori hanya penampilan, tanpa bonus kemampuan. Topi dan headset berbagi slot kepala. Kacamata slot terpisah. Helm kegiatan menyembunyikan rambut, topi, kacamata, tas dan detail kostum sementara; pilihan dan kepemilikan pribadi tidak ditimpa.

## Implementasi dan transaksi

- `paidCosmetics.ts`: katalog dan buku harga historis v1. Harga berasal dari katalog/server lokal aplikasi, bukan payload tombol.
- `coinEconomy.ts`: ledger gabungan reward/debit. Receipt `profil:purchase:item` unik per barang/profil; versi harga metadata, bukan kesempatan membeli ulang. Parser memeriksa setiap saldo antara, jumlah integer, ID, harga, versi, duplikasi dan cache kepemilikan.
- `storage.ts`: satu transaksi readwrite membaca revisi/profil terbaru, memvalidasi misi, merekonsiliasi hadiah, memotong koin, menyimpan receipt dan owned. Beli mempertahankan penampilan tersimpan. Kegagalan mengabort semua writes. Tab usang menerima SaveConflict dan harus reload.
- `main.ts`: antrean simpan bersama; UI mengakui Beli/Pakai hanya setelah oncomplete. Pakai memvalidasi semua slot, bukan hanya barang yang sedang dipilih.
- `cosmeticShopUI.ts`: preview menggunakan studio lemari pada renderer dan loop dunia yang sama. Tidak ada renderer per kartu. Resource milik preview dilepas; cache geometri/material avatar bersama tetap hidup.
- `cosmeticShopWorld.ts` dan `shopRegion.ts`: tapak bangunan lama, pintu 1,8 m, counter/rak/cermin, navigasi dinding dan titik pendekatan nyata. Kak Mira memakai rig bersama dan tersedia di galeri.

Contoh fixture uji: hadiah misi tervalidasi 770 koin → rompi 180 → rambut 60 → topi 40 → saldo 490. Ini fixture pengujian, bukan saldo awal pemain. Saldo produksi baru tetap nol sampai berhak atas reward.

## Cadangan dan pemulihan

Format cadangan **20**, model ekonomi **2**, IndexedDB tetap **2**. v19/model1 dimigrasikan tanpa mengganti identitas atau receipt hadiah. Seluruh v1–v19 diterima. Backup lama yang tidak memuat toko mempertahankan pengeluaran dan kepemilikan saat ini. Profil sama memakai perbandingan prefix ledger; riwayat lebih panjang menang, tidak menjumlahkan saldo. Riwayat bercabang atau overspend ditolak sebelum menyimpan. Profil berbeda memerlukan konfirmasi pemulihan utuh; checkpoint profil lokal tetap menjadi batas riwayat.

Kepemilikan berbayar harus didukung receipt. Harga historis tetap dapat dibaca jika barang kelak pensiun; ID visual tak tersedia memakai fallback aman tanpa menghapus debit. Reset misi tidak menghapus wallet/barang/penampilan. Reload membatalkan preview dan memulihkan penampilan tersimpan. Sistem lokal tidak diklaim kebal edit manual atau dapat mengetahui transaksi yang tidak pernah ada pada perangkat baru.

## Pemeriksaan dan bukti

Pemeriksaan inti: `npm test` **859 lulus** (29 berkas; 41 pengujian baru khusus toko), `npm run test:launcher` **16 lulus**, build/typecheck lulus, dan **10 kasus browser toko lulus**. Cakupan: harga/receipt, saldo antara dan overspend, seluruh format impor v1–v19, fallback ID pensiun, klik ganda, penolakan tab usang, abort transaksi UI dan backend, pemulihan kostum selam/astronot, seluruh 12 preview, serta resource preview berulang. Tiga kasus persistensi tambahan juga lulus: dua debit 40 dari saldo 50 menghasilkan satu pembelian dan saldo 10; migrasi IndexedDB skema 2/model 1 hanya sekali; serta checkpoint pengeluaran tetap bertahan setelah pindah profil dan mengimpor backup v19 lama. Regresi luas dan paket siap main diperiksa terpisah di bawah. Bukti berasal dari Chromium yang menjalankan game, bukan mockup. Viewport laptop 1440×960, HP 390×844 dan 844×390, IFP 1920×1080 merupakan simulasi browser di Linux; belum pengujian Windows/HP/IFP/LAN fisik.

## Batas tahap

Tidak ada penjualan kembali, refund, transfer, gacha, ekonomi daring atau bonus kemampuan. Cermin memakai material ilustratif, bukan refleksi real-time. Butik menggunakan atap cutaway agar kamera dapat melihat interior. Satu pohon dipindah ke tepi Kota setelah terbukti menutupi fasad/karakter. Tinjauan gambar juga memperbaiki poni cepak dan kepang yang menembus kepala/badan, serta menyelaraskan bingkai kacamata dengan mata. Bidang lantai disamakan dengan telapak kaki; penghalang kamera mengikuti tinggi dinding dan perabot sebenarnya, tanpa mengubah collider tubuh atau preferensi jarak kamera. Katalog masih dua belas barang berbayar, belum keseluruhan mode/selera busana. Tahap 09 tidak dikerjakan.


## Bukti dari game berjalan

- [Butik dari luar](evidence/cosmetic-shop/13-boutique-exterior.png) dan [meja Kak Mira/interior](evidence/cosmetic-shop/02-boutique-interior.png).
- Katalog [kostum](evidence/cosmetic-shop/01-catalog-outfits.png), [rambut](evidence/cosmetic-shop/03-catalog-hair.png), [aksesori](evidence/cosmetic-shop/04-catalog-accessories.png). Setiap ID juga memiliki screenshot `item-ID.png` dalam folder bukti.
- Kombinasi [depan](evidence/cosmetic-shop/05-front.png), [samping](evidence/cosmetic-shop/06-side.png), [belakang](evidence/cosmetic-shop/07-back.png), [avatar dunia](evidence/cosmetic-shop/08-world-worn.png) dan [galeri Kak Mira](evidence/cosmetic-shop/10-mira-gallery.png).
- [Dompet sesudah transaksi](evidence/cosmetic-shop/09-wallet-after.png), [receipt dan saldo fixture](evidence/cosmetic-shop/transactions.json), [siklus resource preview](evidence/cosmetic-shop/preview-resources.json).
- [HP potret](evidence/cosmetic-shop/viewport-390-accessories.png), [HP lanskap](evidence/cosmetic-shop/viewport-844-accessories.png), [laptop](evidence/cosmetic-shop/viewport-1440-accessories.png), [IFP](evidence/cosmetic-shop/viewport-1920-accessories.png).
- [Perlengkapan selam](evidence/cosmetic-shop/11-paid-diving.png) dan [astronot](evidence/cosmetic-shop/12-paid-astronaut.png) mempertahankan penampilan pribadi.
- [Cuplikan Coba → Beli → Pakai → berjalan → reload](evidence/cosmetic-shop/purchase-wear-reload.mp4), rekaman kontinu browser game, dikompresi dari WebM Playwright ke H.264 tanpa mengganti adegan dengan mockup.

Saat uji awal ditemukan footer HP terpotong 8 px; tata letak/status dibuat terbatas dan diulang sampai seluruh tombol berada dalam viewport. Pesan kegagalan penyimpanan kini Bahasa Indonesia dan mengarahkan pemuatan ulang, sementara transaksi tidak berubah. Build masih memiliki peringatan ukuran chunk Vite dan browser mencatat deprecation `THREE.Clock` yang sudah ada; keduanya bukan kegagalan transaksi.


## Hasil regresi dan build serah terima

- `npm run test:e2e`: run luas awal **150 lulus / 152**, dua kegagalan berasal dari ekspektasi nama berkas v19 yang sudah berubah menjadi v20. Kedua asersi diperbarui; alur lengkap M01 dan pengujian backup M14 lulus pada pengulangan berikutnya.
- Setelah perapian bentuk/kamera: **35 kasus browser lulus** (Kota dan resource antarwilayah, M01/M14, avatar, lemari, pembelian, migrasi dan empat viewport). Jadi dua kegagalan run luas telah diverifikasi selesai, bukan diabaikan.
- Setelah penyambungan kepang terakhir: **51 unit terdampak lulus**, dan **dua alur visual toko lulus** kembali, termasuk seluruh katalog, resource preview berulang dan rekaman pembelian/pemakaian/reload.
- `npm run prepare:local` membangun ulang kode final; `npm run test:launcher`: **16 lulus**. Build/typecheck lulus. `npm run test:e2e -- tests/runtimePackage.spec.ts`: **5 lulus** pada ZIP final, dengan permintaan di luar server lokal diblokir. Cakupan: W08/EVA/lemari/galeri pada laptop dan HP, selam/keluar/reload pada dua viewport, serta Beli → Pakai → reload butik. Angka ini terpisah dari pengujian perangkat fisik.

Build paket berasal dari commit `6949e829fcff5a5e13d1581d9353589887c8bfef`. [JS-Windows.zip](../unduhan/JS-Windows.zip) berukuran 644.751 byte, 20 anggota, awalan `JS/`, jalur terpanjang 43 karakter. CRC dan seluruh 19 hash file manifest cocok; [hasil verifikasi](evidence/cosmetic-shop/package-verification.json). Ini paket siap main dengan seluruh aset produksi lokal, tidak menyertakan node_modules, dokumentasi dan rekaman pengembangan. Node.js masih diperlukan. Pengujian ekstraksi dijalankan di Linux, bukan Explorer Windows fisik.

Tambahan tampilan: [tas ekspedisi dari belakang](evidence/cosmetic-shop/item-pack-expedition-back.png), [sanggul dari samping](evidence/cosmetic-shop/item-hair-bun-side.png), dan [kepang dari samping](evidence/cosmetic-shop/item-hair-braid-side.png). Tidak ada tugas tahap 09 yang ditambahkan.

[Ringkasan pemeriksaan terstruktur](evidence/cosmetic-shop/test-summary.json).
