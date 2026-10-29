# Paket siap main Windows

Unduh **JS-Windows.zip** melalui tombol **Download raw**, lalu ekstrak seluruhnya ke folder pendek, misalnya `C:\Game`. Buka folder `JS` dan klik ganda `JALANKAN_JELAJAH_SAINS.bat`.

Build produksi sudah disertakan. **Node.js >=22.12 masih diperlukan**; disarankan Node.js 24 LTS dari https://nodejs.org/. Pemain tidak memerlukan npm, Python, pemasangan dependensi atau build. Ini bukan EXE mandiri. Diagnostik tersedia melalui `DIAGNOSTIK_JELAJAH_SAINS.bat`.

Paket tahap visual 03 ini berisi game, Lemari Penampilan, dan galeri dengan model yang sama. Pilihan awal gratis: dua pakaian, empat rambut, topi, kacamata dan tas. Buka Peta Kota → Lemari Penampilan atau Pengaturan → Penampilan. Cadangan v18 menyertakan penampilan; impor cadangan lama mempertahankannya. Kode sumber, pengujian, screenshot dan video pengembangan tetap tersedia di repositori, tetapi tidak dimasukkan ke paket siap main agar ukurannya kecil dan jalurnya pendek.

Kesalahan `0x80010135: Path too long` berasal dari panjang jalur gabungan folder tujuan dan isi arsip. ZIP sumber GitHub memiliki awalan nama repository/commit serta dokumen bertingkat. Paket ini memakai awalan `JS/`; semua jalur internal dibatasi 64 karakter. Tetap gunakan folder tujuan pendek; tidak ada paket yang dapat menjamin berhasil jika folder tujuan sendiri sudah terlalu panjang.

Alamat tetap `http://localhost:5173`. Jangan membuka `index.html` langsung. Tutup jendela server lama dari folder lain sendiri sebelum menjalankan paket baru. Jangan menghapus data browser. Jika sebelumnya memakai `127.0.0.1`, port lain atau IP LAN, ekspor progres pada alamat lama lalu impor di alamat baru.

Untuk membuat ulang paket (pengembang):

1. Jalankan `npm run prepare:local`.
2. Jalankan `python3 scripts/package_windows.py`.
3. Jalankan `npm run test:launcher` dan `npm run test:e2e -- tests/runtimePackage.spec.ts`.

Paket dibuat dengan ZIP DEFLATE standar, tanpa symlink. Verifikasi CRC, hash isi dan panjang jalur dijalankan. Pengujian ekstraksi, server dan browser dilakukan di Linux; pengekstrak Explorer Windows serta perangkat Windows fisik belum diuji langsung.
