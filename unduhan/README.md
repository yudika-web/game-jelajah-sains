# Paket siap main Windows

Unduh **JS-Windows.zip** melalui tombol **Download raw**, lalu ekstrak seluruhnya ke folder pendek, misalnya `C:\Game`. Buka folder `JS` dan klik ganda `JALANKAN_JELAJAH_SAINS.bat`.

Build produksi sudah disertakan. **Node.js >=22.12 masih diperlukan**; disarankan Node.js 24 LTS dari https://nodejs.org/. Pemain tidak memerlukan npm, Python, pemasangan dependensi atau build. Ini bukan EXE mandiri. Diagnostik tersedia melalui `DIAGNOSTIK_JELAJAH_SAINS.bat`.

Paket branch `feat/m04-cargo-motion` menambahkan [M04 Kiriman ke Dermaga](../docs/cargo-motion-review.md). Pilih M04 pada Misi aktif dan temui Pak Wira sebelum menuju W04. M03, perjalanan W08, EVA, selam, butik, galeri, dan dompet tetap tersedia. Cadangan aktif **v22** dan IndexedDB tetap **skema 2**. Tutup tab versi lama sebelum membuka paket baru.

Kesalahan `0x80010135: Path too long` berasal dari panjang jalur gabungan folder tujuan dan isi arsip. ZIP sumber GitHub memiliki awalan nama repository/commit serta dokumen bertingkat. Paket ini memakai awalan `JS/`; semua jalur internal dibatasi 64 karakter. Tetap gunakan folder tujuan pendek; tidak ada paket yang dapat menjamin berhasil jika folder tujuan sendiri sudah terlalu panjang.

Alamat tetap `http://localhost:5173`. Jangan membuka `index.html` langsung. Tutup jendela server lama dari folder lain sendiri sebelum menjalankan paket baru. Jangan menghapus data browser. Jika sebelumnya memakai `127.0.0.1`, port lain atau IP LAN, ekspor progres pada alamat lama lalu impor di alamat baru.

Untuk membuat ulang paket (pengembang):

1. Jalankan `npm run prepare:local`.
2. Jalankan `python3 scripts/package_windows.py`.
3. Jalankan `npm run test:launcher` dan `npm run test:e2e -- tests/runtimePackage.spec.ts`.
4. Untuk mengulang alur M04 dari ZIP, ekstrak dan jalankan paket pada port 5173. Dari checkout jalankan `CARGO_ORIGIN=http://localhost:5173 npm run test:e2e -- tests/cargo.spec.ts`. Uji alur penuh membatasi akses browser ke origin paket.

Paket dibuat dengan ZIP DEFLATE standar, tanpa symlink. Verifikasi CRC, hash isi dan panjang jalur dijalankan. Pengujian ekstraksi, server dan browser dilakukan di Linux; pengekstrak Explorer Windows serta perangkat Windows fisik belum diuji langsung.

[Metadata build, checksum, dan hasil verifikasi paket M04](verification.json).
