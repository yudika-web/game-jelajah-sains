# Cadangan, profil lokal dan Koin Sains

Versi aktif: **cadangan 20**, model wallet **2**, IndexedDB **2**. Cadangan tidak sama dengan versi database. Pembaruan mempertahankan store dan seluruh progres lama.

Untuk menyimpan hasil, buka **Pengaturan → Ekspor cadangan**. Tunggu hingga penyimpanan selesai. Berkas v20 memuat pembelian, kepemilikan, misi, penampilan, identitas profil lokal, wallet dan receipt hadiah. Gunakan berkas terbaru dari profil tersebut. ID profil bukan akun daring dan tidak memuat nama siswa.

Untuk memulihkan, buka **Pengaturan → Impor cadangan**. Data diperiksa seluruhnya sebelum perubahan disimpan. Jika ada kesalahan, aplikasi tidak menerapkan sebagian berkas. Batas berkas 5 MB. Misi yang tidak tercakup cadangan lama tetap dipertahankan.

- **v1–v18 tanpa ekonomi:** wallet saat ini dipertahankan. Hak misi sah yang belum tercatat dapat diberikan sekali. Impor berulang tidak menambah hadiah yang sama.
- **v19–v20 profil sama:** riwayat yang lebih lama tidak memangkas transaksi terbaru. Riwayat berurutan direkonsiliasi; saldo tidak dijumlahkan. Dua salinan offline yang bercabang dapat ditolak—gunakan cadangan dari riwayat yang sama dan paling baru.
- **Profil berbeda:** aplikasi menjelaskan bahwa pemulihan mengganti profil dan dompet, bukan mencampur saldo. Ekspor profil aktif dahulu jika ingin menyimpannya. Pilih Pulihkan untuk melanjutkan atau Batal. Checkpoint ledger profil yang pernah dipakai pada browser ini tetap diperiksa ketika profil dipulihkan kembali.

Reset hanya mengulang pembelajaran misi yang dipilih. Koin dan receipt hadiah pertama tetap ada. Status M16/M17 mengikuti episode yang selesai saat ini; reset satu episode dapat membuat status bab belum tuntas tanpa menarik kembali hadiah yang sudah sah.

Gunakan **satu tab permainan untuk menyimpan**. Jika tab lain sudah mengubah data, tab usang menampilkan tombol muat ulang dan tidak menimpa progres terbaru. Saldo baru muncul setelah transaksi berhasil. Jika penyimpanan gagal, jangan menganggap hadiah sudah masuk; pilih Coba simpan lagi. Jangan menghapus IndexedDB untuk mengatasi pesan ini.

Setelah memasang paket baru, tutup tab versi lama lalu buka ulang **http://localhost:5173**. `localhost`, `127.0.0.1`, IP LAN dan port berbeda memiliki penyimpanan berbeda. Bila berpindah alamat, ekspor pada alamat lama dan impor pada alamat baru.

Sistem ini lokal. Jika seluruh data browser dihapus atau cadangan lama dipakai pada perangkat baru, aplikasi tidak mengetahui transaksi yang tidak tercakup berkas tersebut. Tidak ada pemulihan akun dari server. Tahap 08 mempertahankan riwayat pengeluaran dan kepemilikan ketika mengimpor cadangan lama pada browser yang masih memiliki riwayat tersebut.

## Tahap 08: pembelian dan kepemilikan

Cadangan aktif **v20**, model wallet **2**, skema IndexedDB tetap **2**. v19/model 1 dibaca sebagai ledger hadiah dengan kepemilikan berbayar kosong; receipt hadiah dan identitas tidak diganti. Semua format v1–v19 tetap diterima.

Pembelian menambahkan debit dan kepemilikan dalam transaksi yang sama. Saldo adalah jumlah hadiah dikurangi pembelian sah. Daftar `owned` wajib sama dengan ID barang pada receipt pembelian. Mengubah saldo, harga atau daftar barang sendiri membuat validasi menolak data.

Cadangan lama tanpa toko tidak menghapus pembelian yang sudah tersimpan. Untuk profil sama, ledger harus merupakan riwayat yang berurutan: versi lebih panjang dipertahankan, bukan kedua saldo dijumlahkan. Jadi impor backup sebelum belanja tidak mengembalikan koin yang sudah dibelanjakan. Dua riwayat bercabang ditolak sebelum ada perubahan. Pemulihan penampilan tetap harus didukung kepemilikan pada seluruh slot; ID barang yang tidak dikenal memakai pilihan dasar aman. Riwayat harga v1 tetap dipertahankan walaupun ketersediaan katalog kelak berubah.

Reset misi mempertahankan transaksi, barang dan penampilan. Pembelian gagal atau tab usang tidak menerapkan sebagian keadaan. Muat ulang data tersimpan jika tab lain sudah menulis; buka kembali toko untuk mencoba lagi. Tidak ada tombol koin gratis atau pembelian uang nyata.
