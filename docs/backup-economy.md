# Cadangan, profil lokal dan Koin Sains

Versi aktif: **cadangan 19**, model wallet **1**, IndexedDB **2**. Cadangan tidak sama dengan versi database. Pembaruan mempertahankan store dan seluruh progres lama.

Untuk menyimpan hasil, buka **Pengaturan → Ekspor cadangan**. Tunggu hingga penyimpanan selesai. Berkas v19 memuat misi, penampilan, identitas profil lokal, wallet dan receipt hadiah. Gunakan berkas terbaru dari profil tersebut. ID profil bukan akun daring dan tidak memuat nama siswa.

Untuk memulihkan, buka **Pengaturan → Impor cadangan**. Data diperiksa seluruhnya sebelum perubahan disimpan. Jika ada kesalahan, aplikasi tidak menerapkan sebagian berkas. Batas berkas 5 MB. Misi yang tidak tercakup cadangan lama tetap dipertahankan.

- **v1–v18 tanpa ekonomi:** wallet saat ini dipertahankan. Hak misi sah yang belum tercatat dapat diberikan sekali. Impor berulang tidak menambah hadiah yang sama.
- **v19 profil sama:** riwayat yang lebih lama tidak memangkas transaksi terbaru. Riwayat berurutan direkonsiliasi; saldo tidak dijumlahkan. Dua salinan offline yang bercabang dapat ditolak—gunakan cadangan dari riwayat yang sama dan paling baru.
- **Profil berbeda:** aplikasi menjelaskan bahwa pemulihan mengganti profil dan dompet, bukan mencampur saldo. Ekspor profil aktif dahulu jika ingin menyimpannya. Pilih Pulihkan untuk melanjutkan atau Batal. Checkpoint ledger profil yang pernah dipakai pada browser ini tetap diperiksa ketika profil dipulihkan kembali.

Reset hanya mengulang pembelajaran misi yang dipilih. Koin dan receipt hadiah pertama tetap ada. Status M16/M17 mengikuti episode yang selesai saat ini; reset satu episode dapat membuat status bab belum tuntas tanpa menarik kembali hadiah yang sudah sah.

Gunakan **satu tab permainan untuk menyimpan**. Jika tab lain sudah mengubah data, tab usang menampilkan tombol muat ulang dan tidak menimpa progres terbaru. Saldo baru muncul setelah transaksi berhasil. Jika penyimpanan gagal, jangan menganggap hadiah sudah masuk; pilih Coba simpan lagi. Jangan menghapus IndexedDB untuk mengatasi pesan ini.

Setelah memasang paket baru, tutup tab versi lama lalu buka ulang **http://localhost:5173**. `localhost`, `127.0.0.1`, IP LAN dan port berbeda memiliki penyimpanan berbeda. Bila berpindah alamat, ekspor pada alamat lama dan impor pada alamat baru.

Sistem ini lokal. Jika seluruh data browser dihapus atau cadangan lama dipakai pada perangkat baru, aplikasi tidak mengetahui transaksi yang tidak tercakup berkas tersebut. Tidak ada pemulihan akun dari server. Tahap toko berikutnya wajib mempertahankan riwayat pengeluaran dan kepemilikan ketika mengimpor cadangan lama; toko belum tersedia sekarang.
