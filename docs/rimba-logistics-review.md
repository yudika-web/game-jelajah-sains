# W03 Rimba dan Gambut — Bantu Pos Rimba

> Catatan tahap W03. Sejak penambahan W04/S13, format ekspor menjadi v4 dan tetap menerima v1–v3. Lihat [laporan S13](river-fishing-review.md) untuk keadaan terbaru; aturan logistik W03 tetap sama.

Episode **W03-LOG01** mengimplementasikan bagian “Misi khusus dukungan pos kebakaran hutan” dan tahap prototipe pembuktian dalam [rancangan-game.md](rancangan-game.md). ID episode ini berdiri sendiri; identitas M01, M14, dan misi utama dalam rancangan dipertahankan.

## Implementasi

Kota memiliki gerbang jalur penjaga hutan menuju Rimba, dengan jalur kembali ke Kota. Wilayah ringkas memuat pos Pak Damar, papan peta aman, buku dan catatan, tandon sumber, rak ember, bengkel dan gerobak, tiga penampung, serta titik pengamatan habitat. Pohon, tanah, semak, batu, pagar, dan siluet habitat terdampak memakai geometri lokal bergaya balok. Tiga volume kabut statis di kejauhan menggantikan sistem partikel. Area terdampak berada di luar batas permainan.

Karakter Pak Damar memakai factory dan rig bersama dengan topi hijau, rompi cokelat, dan tinggi 1,74 unit. Siswa/siswi tetap 1,60 unit; geometri dan proporsi karakter lama tidak diubah. Galeri menambahkan Pak Damar pada lima karakter yang sudah tersedia. Bangunan pos memiliki pintu 2,10 unit. Jalur utama sekitar empat unit memberi ruang bagi gerobak.

Hanya satu grup wilayah aktif. Pergantian wilayah menggunakan renderer, pemain, loop, dan binding input yang sama. Geometri/material lokal wilayah dibuang sesuai kepemilikan; cache karakter bersama dipertahankan. Kamera dan preferensinya tetap memakai sistem yang tersedia.

## Cara memainkan

1. Di Kota, pilih **W03 · Bantu Pos Rimba** atau buka Peta → **Ke Rimba dan Gambut**. Datangi gerbang dan pilih Masuk.
2. Temui **Pak Damar** dan terima tugas. Pemain membantu logistik; petugas menangani kebakaran. Tidak ada batas waktu.
3. Baca dan catat **Peta aman**, **Kapasitas dan Volume**, dan **Rencana Persediaan Pos**.
4. Periksa penampung **A** dan **B**. Kebutuhan **C** dicatat dari papan peta saat jalurnya masih tertutup. Pada papan itu pilih total **24 L**.
5. Pilih alat: di rak **Ambil ember → Bawa ember**, atau di bengkel **Ambil roda dan alat → Pasang roda → Dorong gerobak**.
6. Datangi sumber. Pilih jumlah dalam kelipatan 1 L atau **Isi maksimal**, periksa pratinjau, lalu konfirmasi.
7. Bawa air melalui dunia 3D. Di penampung, pilih jumlah tuang atau **Tuang maksimal**. Sisa air tetap di wadah dan dapat dipakai pada tujuan berikutnya.
8. Setelah mulai mengirim ke A/B, temui Pak Damar dan pilih **Minta konfirmasi jalur C**. Petugas membuka jalur langsung, tanpa waktu tunggu nyata.
9. Lengkapi A 8 L, B 6 L, dan C 10 L. Jika masih ada air dalam alat, **Kembalikan sisa air** di sumber. Keadaan akhir pengiriman: sumber 16 L, kedua alat kosong.
10. Baca papan **Habitat Setelah Kebakaran**, lalu temui Pak Damar → **Periksa catatan dan simpulkan**. Pilih perbedaan kapasitas/isi, satu transfer nyata, dan penjelasan efisiensi sesuai alat yang benar-benar dicoba. Jawaban keliru dapat diperbaiki dan tetap tercatat.
11. Terima laporan petugas, lalu pilih restorasi tumbuhan lokal dan pemantauan. Episode memberi **100 XP pertama**.

Contoh ember: enam isi penuh. Dua muatan untuk A, satu untuk B, muatan berikutnya 2 L ke B dan 2 L ke C, lalu dua muatan lagi untuk C. Minta konfirmasi C ketika kembali dengan ember kosong setelah pengiriman awal.

Contoh gerobak: muatan 12 L pertama → 8 L A + 4 L B. Minta konfirmasi C ketika gerobak kosong, lalu muatan 12 L kedua → 2 L B + 10 L C. Rencana campuran dan isi sebagian juga diterima. Jangan menyimpulkan gerobak selalu tercepat.

## Volume dan transaksi

| Komponen | Kapasitas / target |
| --- | ---: |
| Tandon sumber awal | 40 L = 40.000 mL |
| Ember | 4 L = 4.000 mL |
| Gerobak | 12 L = 12.000 mL |
| A / B / C | 8 / 6 / 10 L |
| Total pengiriman | 24 L |
| Sisa sumber akhir | 16 L |

Aturan disimpan di [`rimbaMission.ts`](../src/game/rimbaMission.ts), tanpa ketergantungan renderer. Semua volume bilangan bulat mL. Pengisian, penuangan, dan pengembalian memindahkan seluruh jumlah terpilih atau ditolak seluruhnya. Pengisian dibatasi isi sumber dan ruang wadah; penuangan dibatasi isi wadah dan ruang target. Tidak ada air tumpah atau terisi sendiri. Model selalu mempertahankan:

`Sumber + Ember + Gerobak + A + B + C = 40.000 mL`

Ember dan gerobak memiliki isi terpisah. Menukar, memarkir, keluar wilayah, dan memuat ulang tidak mengosongkannya. Aksi pengembalian mencegah pemain terjebak dengan air berlebih setelah target penuh. Transaksi memakai revisi keadaan dan konfirmasi sekali pakai. Sesudah berhasil, panel menjadi tanda terima, sehingga klik ganda tidak mengulangi penuangan sebagian. Catatan transfer diputar ulang saat validasi impor; volume agregat harus sama dengan hasil catatan.

Kapasitas dan isi ditampilkan terpisah. Volume latihan merupakan model logistik pendidikan; ukuran geometri wadah bersifat ilustratif dan bukan pengukuran volume geometris dalam meter kubik atau kebutuhan pemadaman nyata.

## Alat, kontrol, dan perjalanan

Ember memakai socket tangan yang sama dengan alat lama, dengan indikator air. Pemain berjalan 5,2 dan berlari 8,0 unit/detik seperti sebelumnya. Gerobak adalah objek kinematik dengan roda rusak/pengganti, tandon, indikator isi, dan pegangan. Roda berputar dari jarak perpindahan nyata. Pose mendorong membatasi tangan, sedangkan kaki tetap mengikuti perpindahan.

Konfigurasi [`rimbaRegion.ts`](../src/data/rimbaRegion.ts) menetapkan kecepatan dorong **3,4 / 4,2 unit/detik**, radius konservatif **1,65 unit**, dan pendekatan interaksi **2,8 unit**. Navigasi dan sapuan tabrakan memakai radius ini, termasuk saat berbelok, sehingga seluruh gerobak berada dalam batas aman. Ketika dilepas, pemain kembali ke radius dan kecepatan biasa. Pagar C menambah penghalang sampai konfirmasi petugas; batas permanen mencegah masuk ke area terdampak.

- Laptop: WASD/panah, Shift kiri/kanan, E, serta kamera yang sudah tersedia.
- HP: analog dan kamera dua jari, toggle Jalan/Lari, dan panel jumlah tanpa pengetikan angka.
- IFP: toggle besar, tujuan Peta/kartu misi, dan semua tindakan melalui sentuhan.

Untuk parkir, kembali ke Bengkel melalui Peta, atau buka Tas → **Ke bengkel untuk parkir**, lalu pilih **Parkir gerobak**. Alat juga disimpan di titik bengkel saat keluar wilayah, Kembali ke Pos, atau memuat ulang. Ini pemindahan penyimpanan aman, bukan simulasi parkir kendaraan dengan fisika.

[`rimbaSession.ts`](../src/game/rimbaSession.ts) membaca substep gerak yang benar-benar terjadi. Perjalanan bermuatan dimulai saat wadah berisi melewati garis krem area sumber, dan berakhir saat kembali ke area, diparkir/ditukar, keluar wilayah, kembali ke pos, dimuat ulang, atau pengiriman disimpulkan. Isi berulang tanpa keluar tidak menambah perjalanan. Jarak dan waktu aktif dihitung hanya pada substep yang berpindah; dialog, perbaikan, jeda, tab tersembunyi, dan aplikasi tertutup tidak dihitung sebagai waktu bergerak. Jarak dalam meter model dan waktu dalam detik, dengan pembulatan penyimpanan ke mm/ms. Ketelitian batas area mengikuti substep simulasi, bukan alat ukur fisik.

Jurnal memakai catatan transfer dan perjalanan yang sama dengan aturan episode. Hanya alat yang benar-benar mengirim mendapat hasil pengamatan; “6 muatan ember / 2 muatan gerobak” diberi label **perhitungan kapasitas**, bukan hasil uji alat lain. Waktu gerak tidak mewakili waktu total, karena waktu membaca dan perbaikan tidak diukur. Refleksi bebas disimpan untuk guru tanpa penilaian kata kunci atau pengiriman otomatis.

## Penyimpanan dan kompatibilitas

IndexedDB tetap skema **1**, store `saves`. Key baru **`W03-LOG01`** ditambahkan di samping `M01`, `M14`, dan `world`. Data lama tidak dihapus atau dimigrasi dengan reset. Memuat ulang menempatkan pemain di pos aman dan gerobak di bengkel, menutup perjalanan terbuka dengan alasan muat ulang, serta mempertahankan isi, transfer, perbaikan, dan hadiah.

Format cadangan baru adalah **versi 3**, berisi ketiga misi dan wilayah. Cadangan M01 versi 1 tetap didukung; M14, Rimba, dan wilayah yang tidak dicakup tetap dipertahankan. Cadangan gabungan versi 2 memulihkan M01/M14 dan wilayah, sambil mempertahankan progres Rimba. Kedua format lama diperiksa melalui fixture, termasuk [`m01-m14-v2.json`](../tests/fixtures/m01-m14-v2.json).

Semua bagian cadangan divalidasi sebelum keadaan aktif diganti. Validasi mencakup kapasitas, bilangan bulat, neraca air, catatan transfer, muatan/perjalanan, perbaikan, jalur C, prasyarat misi, kesimpulan, dan hadiah. Riwayat hadiah pertama digabung monoton saat mengimpor cadangan lama. **Ulangi Latihan Pos Rimba** membutuhkan konfirmasi, hanya mengulang episode ini, dan mempertahankan catatan 100 XP pertama. XP diturunkan dari hadiah per misi, bukan ditambahkan ulang setiap klik.

## Pengujian dan bukti

| Perintah | Hasil akhir |
| --- | --- |
| `npm test` | **96/96 lolos** |
| `npm run build` | **Lolos**, termasuk pemeriksaan TypeScript dan dua entry Vite |
| `CAPTURE_RIMBA_EVIDENCE=1 npm run test:e2e` | **23/23 lolos**, sekitar 9,6 menit |

Alur IFP penuh menggunakan gerobak, dengan persiapan dan perbaikan di browser, berhasil mengirim 24 L melalui dua perjalanan bermuatan dan menyisakan 16 L di sumber. Alur ember berhasil menuntaskan enam muatan tanpa memperbaiki gerobak. Kedua alur menerima laporan, memilih pemulihan habitat, dan memberi hadiah pertama. Browser juga menyelesaikan M01/M14 dan melanjutkan simpanan lama. [Ringkasan pemeriksaan](evidence/rimba/verification.json).

 Pemeriksaan mencakup rute ember, gerobak, dan campuran; kelipatan/kapasitas; pengembalian air; klik ganda; C terkunci/terbuka; larangan selesai hanya dengan kuis; hadiah; simpan/muat dan cadangan v1/v2/v3; jejak model gerobak; kedua kecepatan dorong; tabrakan; roda dari jarak; serta regresi M01, M14, lari, kamera, dan galeri.

Bukti browser:

- [Wilayah Rimba dan pos alat](evidence/rimba/01-rimba-region.png).
- [Roda rusak](evidence/rimba/02-broken-cart.png) dan [roda terpasang](evidence/rimba/03-repaired-cart.png).
- [Tanda terima isi 12 L](evidence/rimba/04-fill-receipt.png), [pengiriman A](evidence/rimba/05-delivery-A.png), [pengiriman C](evidence/rimba/06-delivery-C.png).
- [Penyelesaian dan hadiah](evidence/rimba/07-complete.png), [jurnal perjalanan](evidence/rimba/08-journal.png).
- [HP potret](evidence/rimba/09-hp-portrait.png) dan [HP lanskap](evidence/rimba/09-hp-landscape.png).
- [Gerbang kembali ke Kota](evidence/rimba/10-return-gate.png).
- [Keadaan akhir tiga misi dari alur IFP](evidence/rimba/final-state.json).

Bukti ini memakai ukuran layar dan input browser yang disimulasikan melalui Chromium SwiftShader. Bukti tidak dinyatakan sebagai pengujian pada HP/IFP fisik atau benchmark GPU.

## Keterbatasan

Belum diuji pada HP/IFP fisik, GPU sekolah, browser sentuh selain Chromium, atau jaringan LAN sekolah. Gerobak memakai penggerak kinematik dan radius bundar konservatif, tanpa simulasi suspensi, massa, tumpahan, atau baut. Wadah diilustrasikan lebih besar agar mudah dikenali. Perbaikan adalah dua tindakan, tanpa pengukuran waktu kerja nyata; jangan memakai waktu gerak jurnal untuk menyimpulkan alat selalu tercepat. Langit dan siluet menunjukkan kondisi, bukan simulasi penyebaran kebakaran. Area terdampak tetap tidak dapat dimasuki setelah laporan petugas.

Batas catatan impor adalah 2.000 transfer, 1.000 perjalanan, dan 1.000 upaya kesimpulan per latihan. Ini penyimpanan lokal untuk pembelajaran, bukan sistem anti manipulasi atau nilai terpusat. Build tetap memiliki peringatan chunk Three.js di atas 500 kB seperti tahap sebelumnya. Pengembangan selanjutnya sebaiknya dimulai dari pemeriksaan kenyamanan gerobak dan keterbacaan panel pada perangkat sekolah fisik, sebelum wilayah atau misi lain ditambahkan.
