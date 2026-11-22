# Paket siap main Windows

Unduh **JS-Windows.zip** melalui tombol **Download raw**, lalu ekstrak seluruhnya ke folder pendek, misalnya `C:\Game`. Buka folder `JS` dan klik ganda `JALANKAN_JELAJAH_SAINS.bat`.

Build produksi sudah disertakan. **Node.js >=22.12 masih diperlukan**; disarankan Node.js 24 LTS dari https://nodejs.org/. Pemain tidak memerlukan npm, Python, pemasangan dependensi atau build. Ini bukan EXE mandiri. Diagnostik tersedia melalui `DIAGNOSTIK_JELAJAH_SAINS.bat`.

Paket terbaru pada branch `feat/m03-greenhouse-heat` menambahkan [M03 Rumah Semai Terlalu Panas](../docs/greenhouse-heat-review.md). Setelah membuka game, pilih M03 pada Misi aktif, masuk Kebun Kehidupan, dan temui Bu Sari. Fitur tahap 09 tersedia, termasuk perjalanan W08, EVA, eksplorasi selam, butik, galeri, dan dompet. Cadangan aktif **v21** dan IndexedDB tetap **skema 2**. Tutup tab versi lama sebelum membuka paket baru.

Kesalahan `0x80010135: Path too long` berasal dari panjang jalur gabungan folder tujuan dan isi arsip. ZIP sumber GitHub memiliki awalan nama repository/commit serta dokumen bertingkat. Paket ini memakai awalan `JS/`; semua jalur internal dibatasi 64 karakter. Tetap gunakan folder tujuan pendek; tidak ada paket yang dapat menjamin berhasil jika folder tujuan sendiri sudah terlalu panjang.

Alamat tetap `http://localhost:5173`. Jangan membuka `index.html` langsung. Tutup jendela server lama dari folder lain sendiri sebelum menjalankan paket baru. Jangan menghapus data browser. Jika sebelumnya memakai `127.0.0.1`, port lain atau IP LAN, ekspor progres pada alamat lama lalu impor di alamat baru.

Untuk membuat ulang paket (pengembang):

1. Jalankan `npm run prepare:local`.
2. Jalankan `python3 scripts/package_windows.py`.
3. Jalankan `npm run test:launcher` dan `npm run test:e2e -- tests/runtimePackage.spec.ts`.
4. Untuk mengulang alur M03 dari ZIP, ekstrak dan jalankan paket pada port 5173. Dari checkout jalankan `GREENHOUSE_ORIGIN=http://localhost:5173 npm run test:e2e -- tests/greenhouse.spec.ts`. Uji alur penuh membatasi akses browser ke origin paket.

Paket dibuat dengan ZIP DEFLATE standar, tanpa symlink. Verifikasi CRC, hash isi dan panjang jalur dijalankan. Pengujian ekstraksi, server dan browser dilakukan di Linux; pengekstrak Explorer Windows serta perangkat Windows fisik belum diuji langsung.

[Metadata build, checksum, dan hasil verifikasi paket M03](verification.json).
