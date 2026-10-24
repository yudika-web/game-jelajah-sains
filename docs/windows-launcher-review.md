# Pemeriksaan peluncur Windows dan server produksi

Panduan pengguna: [windows-launcher.md](windows-launcher.md).

## Perubahan yang tersedia

- `SIAPKAN_ATAU_PERBARUI.bat`: berangkat dari lokasi BAT, memeriksa Node/npm, memasang dependensi sesuai lock bila perlu, dan membangun versi pengganti sebelum mengganti `dist`.
- `JALANKAN_JELAJAH_SAINS.bat`: menyajikan build melalui server HTTP bawaan Node, memeriksa identitas/kesiapan, lalu membuka browser Windows. Tidak menjalankan npm, build, atau Vite.
- `DIAGNOSTIK_JELAJAH_SAINS.bat`: versi, folder, build, port, LAN, ringkasan kegagalan terakhir, dan lokasi log; menunggu tombol sebelum menutup.
- `scripts/local/common.mjs`: syarat runtime, log di luar repositori, identitas build/folder, npm dan pembukaan browser.
- `scripts/local/prepare.mjs`: fingerprint dependensi, kunci persiapan, staging build, promosi dan pemulihan build lama.
- `scripts/local/static-server.mjs`: HTTP GET/HEAD, MIME, batas akses `dist`, endpoint identitas, kesiapan dan benturan port.
- `scripts/local/launch.mjs` dan `diagnose.mjs`: peluncuran, penghentian, informasi LAN, serta pemeriksaan masalah.
- Dua file `tests/local-launcher/*.test.mjs` dan `tests/production.spec.ts`: pemeriksaan peluncur serta halaman produksi.

Tidak ada perubahan pada `src`, renderer, input, aturan misi, atau penyimpanan game. Tidak ada dependensi baru. Node minimal 22.12 tetap dipakai; npm minimal 10 dideklarasikan untuk persiapan. Node.js tetap harus terpasang, sehingga ini bukan paket EXE.

## Keputusan alamat dan sumber daya

Browser laptop dibuka pada **http://localhost:5173**, memakai port pengembangan terdahulu. Tidak ada pemilihan port otomatis. Bind IPv4 `0.0.0.0` menyediakan kandidat akses LAN, sementara protokol identitas hanya mengekspos ID server dan hash folder/build, tanpa path atau data siswa. Jika port sudah dipakai, hanya server dengan ketiga identitas cocok yang digunakan kembali. Server lain dibiarkan berjalan dan pengguna mendapat petunjuk.

`localhost`, `127.0.0.1`, IP LAN, dan port 4173 tetap merupakan origin browser berbeda. Panduan meminta ekspor dari alamat lama lalu impor pada alamat baru jika berpindah. Server ini juga menerima akses manual ke 127.0.0.1:5173 untuk mempertahankan origin tersebut. Tidak ada penghapusan/migrasi paksa IndexedDB.

Server menyajikan `dist` saja. Tidak ada directory listing, fallback HTML untuk aset hilang, akses source repository, atau pemuatan CDN. URL rusak/control characters/backslash/ADS ditolak, traversal/dotfile ditolak, dan realpath diperiksa agar symlink tidak keluar root. Log tidak mencatat URL permintaan, cookie, isi lingkungan, atau progres browser.

Persiapan menjalankan script build proyek dengan `--outDir` sementara. `dist` lama tetap ada selama instalasi dan build. Halaman permainan, galeri, serta aset script/link yang dirujuk HTML diverifikasi sebelum pergantian; kegagalan memindahkan build pengganti memicu pemulihan build lama. Tidak ada `rm dist` pada proses persiapan. Marker lokal dan folder staging tidak masuk Git.

## Pemeriksaan

Lingkungan: Linux, Node.js 24.19.0, npm 11.9.0, Chromium sistem dengan WebGL SwiftShader. Pengujian otomatis tidak menggantikan uji Windows atau perangkat sekolah.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run test:launcher` | **14 lulus** |
| `npm test` | **173 lulus** |
| `npm run build` | **Lulus**, kedua halaman dan aset produksi dibuat |
| `node scripts/local/prepare.mjs`, instalasi pertama | npm ci aktual dan build staging berhasil; promosi berhasil |
| Persiapan kedua | Instalasi dilewati; build staging dan promosi berhasil |
| `npm run test:e2e -- tests/production.spec.ts` | **4 lulus**, empat viewport dan seluruh tujuh model galeri |
| Rangkaian regresi `npm run test:e2e` | **39 lulus** dalam 16,1 menit, termasuk semua misi lama dan empat uji produksi |

Empat uji browser produksi diulang setelah pemeriksaan aset HTML ditambahkan: **4 lulus** dalam 17,0 detik.

Uji peluncur mencakup:

1. Permainan, galeri, query avatar, HEAD, MIME JS/CSS/SVG, dan nama aset berspasi.
2. Folder aplikasi berspasi/beraksen dan `&`; peluncur disalin ke lokasi lain dan dijalankan dari working directory berbeda.
3. Peluncuran tanpa `node_modules` dan dengan PATH kosong (npm tidak dapat dipanggil). Node dijalankan melalui executable yang diketahui; server tetap melayani halaman dan dapat digunakan kembali.
4. `dist` hilang, hanya memiliki satu entry, atau aset HTML hilang: ditolak dengan petunjuk persiapan.
5. Port diisi server sama: digunakan kembali. Folder/build berbeda, aplikasi HTTP lain, atau layanan yang tidak merespons: ditolak tanpa mematikan server atau berpindah port.
6. Node di bawah syarat, kandidat IPv4 privat, dan pengecualian loopback/link-local/non-IPv4.
7. Lock/manifest berubah, file dependensi hilang, dan marker instalasi; instalasi gagal tidak dianggap berhasil.
8. Pengganti build tidak lengkap, kegagalan instalasi/build yang disimulasikan, serta kegagalan rename yang disuntikkan: build lama tetap dapat dibaca; pemulihan diperiksa.
9. Dua persiapan bersamaan: persiapan kedua ditolak melalui lock.
10. URL invalid, traversal biasa/encoded, dotfile, source repository, POST, serta symlink menuju luar `dist`.

Benturan port **5173** juga diperiksa langsung ketika Vite lama masih aktif. Peluncur menolak port tersebut dan diagnostik menampilkan penyebab. Vite dibiarkan berjalan. Server positif diuji pada port terisolasi agar tidak mengganggu proses itu; port uji bukan mekanisme fallback pada peluncur pengguna.

Uji browser produksi membuka permainan dan galeri pada **1280×900**, **390×844**, **844×390**, dan **1920×1080**. Seluruh permintaan di luar origin lokal diblokir. Tidak ada permintaan jaringan luar, aset HTTP gagal, atau error JavaScript; seluruh tujuh karakter dapat dipilih. Fixture progres enam misi disimpan ke IndexedDB, lalu dibandingkan sebelum/sesudah perjalanan ke galeri dan reload: rekaman tetap sama.

## Keterbatasan

- **BAT belum diuji langsung pada Windows.** Syntax/path dikutip dan CRLF diperiksa pada Linux; klik ganda, `npm.cmd`, browser default, path UNC, serta Windows Firewall memerlukan uji Windows nyata.
- Folder berspasi/beraksen diuji pada filesystem Linux, bukan bukti semua konfigurasi filesystem Windows.
- Tidak ada HP/IFP fisik atau akses LAN antarperangkat yang diuji. Empat viewport di atas adalah simulasi browser, dan IP LAN yang ditampilkan hanya kandidat.
- Kegagalan npm/build/rename pada pengujian rollback sebagian disimulasikan; bukan klaim pengujian antivirus/permission Windows.
- Peringatan chunk Three.js di atas 500 kB masih muncul saat build; build berhasil. Patch ini tidak mengubah performa atau gameplay.
