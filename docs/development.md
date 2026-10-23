# Catatan pengembangan prototipe 0.1

## Sumber dan keputusan implementasi

`rancangan-game.md` adalah salinan lampiran pengguna. Cakupan implementasi mengikuti permintaan irisan pertama dan bagian **Cakupan irisan awal**, **M01**, **Kontrol**, **Penyimpanan**, serta **Pengujian penerimaan**. Rencana delapan wilayah dan sistem lain tetap menjadi rujukan tahap berikutnya, bukan klaim sudah selesai.

M01 memisahkan peristiwa membaca, merancang, mengukur, menguji, dan menyimpulkan. `transition` adalah sumber kebenaran data A 70, B 20, dan uji A 35. Panel menampilkan hasil peristiwa; membuka panel sendiri tidak menghasilkan pengukuran. Uji harus memiliki dugaan, kedua sumber, rencana yang sesuai, dan kedua sampel. Kesimpulan harus memiliki hasil uji. Klaim air aman diminum dan generalisasi semua kekeruhan dari limbah ditolak.

Kartu pengetahuan adalah naskah awal dari dokumen rancangan, belum merupakan materi final yang telah ditelaah guru. Simulasi sengaja tidak memakai satuan NTU atau menyatakan model memeriksa mikroorganisme, zat terlarut, maupun standar air minum.

## Dunia dan kontrol

Kota dibangun dengan geometri Three.js, tanpa model atau font dari jaringan. Geometri statis digabung berdasarkan material untuk mengurangi draw call. Resolusi dibatasi 1,5 kali CSS pixel; Pengaturan menyediakan rasio 1. Tidak ada bayangan dinamis, refleksi air, atau pointer lock. Bayangan kontak avatar hanya cakram transparan.

Gerak keyboard/analog relatif terhadap arah kamera. Navigasi ketuk memakai grid kecil dengan pencarian breadth-first, batas wilayah, dan penghalang bangunan/sungai. Cocok untuk blok kecil; ganti dengan navmesh/A* atau sistem wilayah ketika skala berkembang. Kamera merapat sebelum menembus volume bangunan. Kamera otomatis mengikuti posisi, dan IFP memakai tombol putar sehingga tidak membutuhkan dua sentuhan.

Mode IFP meningkatkan ukuran kontrol dan teks dialog. Perjalanan otomatis dapat dibatalkan dengan Berhenti atau input gerak. Jalur M01 tidak memerlukan lompatan. Uji browser satu pointer membuktikan alur input, tetapi tidak menggantikan uji jangkauan tangan dan keterbacaan pada panel kelas.

## Data lokal dan pemulihan

Versi simpan 1 berisi progres misi; posisi avatar tidak dipersistenkan. Preferensi jarak kamera, pengurangan gerakan, dan resolusi disimpan terpisah di localStorage dengan kunci `jelajah-sains.preferences.v1`. Tidak ada migrasi ataupun reset progres untuk perubahan visual ini. Jurnal dan tas diturunkan dari progres yang sama. Penulisan IndexedDB diserialkan dan status sukses baru muncul setelah transaksi selesai. Upaya kesimpulan salah tersimpan terpisah dari hasil akhir. Hadiah tetap 100, tidak diakumulasi ulang.

Cadangan dibatasi 1 MB dan harus melalui `parseProgress` sebelum menggantikan status aktif. Penghapusan data browser atau pindah origin dapat menghilangkan akses ke simpanan; ekspor JSON adalah jalur pemulihan lokal. Belum ada sinkronisasi/server siswa, jadi tidak ada status “terkirim” palsu.

## Validasi dan pengembangan berikutnya

Unit test mencakup gerbang bukti, rencana keliru, kedua sampel, batas kesimpulan, koreksi upaya, hadiah idempoten, cadangan tidak valid, dan rute antarsemua lokasi misi. E2E memakai Chromium: rendering WebGL, alur M01 satu pointer, keyboard, input HP bersamaan, pointer cancel, simpan/muat ulang, cadangan, dan fallback WebGL.

Sebelum dipakai di kelas: telaah konsep oleh guru; ukur FPS pada HP sasaran; uji layar penuh dan kegagalan penyimpanan pada browser sekolah; uji HP dan IFP fisik termasuk multitouch; periksa akses LAN antarperangkat. Target dokumen 30 fps HP / 45–60 fps laptop belum merupakan hasil ukur prototipe ini.

Tahap berikutnya yang disarankan: personalisasi avatar, audio lokal opsional, asesmen/refleksi lebih kaya, laporan guru lokal, kemudian wilayah Kebun beserta M14. Perluas skema progres dengan migrasi eksplisit ketika menambah wilayah atau misi; jangan menganggap semua simpanan lama bisa langsung dibaca.

## Penyempurnaan karakter dan kamera

`character.ts` membangun model orisinal dari RoundedBoxGeometry yang ringan, dengan material/geometri dasar yang dipakai ulang dan penggabungan detail kaku per sendi/material. Root posisi dunia terpisah dari visual. Pemain, Bu Nara, dan Pak Wira memakai struktur bahu/siku/tangan serta pinggul/lutut/pergelangan kaki yang sama. `toolSocket` pada kedua tangan dan `labelSocket` di atas kepala disiapkan untuk alat selanjutnya. Metadata `place` tetap tersedia pada seluruh bagian NPC untuk raycast.

Pemain memiliki jaket biru, lapisan kaus, rambut tersisir geometris, ransel, serta sepatu ber-sol. Bu Nara memakai cardigan, kacamata, rok, dan sanggul; Pak Wira memakai rompi, lengan digulung, topi, dan celana kerja. Gestur Bu Nara berupa sambutan dengan tangan terangkat; gestur Pak Wira berupa percakapan dengan tangan lebih rendah dan anggukan pendek. Fase idle NPC berbeda dan NPC jauh diperbarui lebih jarang. Posisi misi keduanya tetap.

`characterAnimator.ts` menerima jarak perpindahan setelah resolusi tabrakan. Siklus langkah tidak maju saat tertahan dinding; pose berjalan berhenti melalui settling singkat. Arah tubuh memakai putaran terpendek dengan exponential damping. Gerak napas berada pada torso, bukan root atau seluruh kaki. Pose menyapa, membaca, memegang alat kekeruhan, dan mengambil sampel ditampilkan tanpa menambah syarat misi. Buku, meter, dan botol adalah geometri lokal pada socket tangan. Array/scratch buffer untuk update dipakai ulang; tidak ada pembuatan geometri/material dalam loop animasi.

`cameraController.ts` mengikuti root stabil dengan jarak 8,5/10,8/14 unit. Framing normal sedikit ke kanan pada layar lebar untuk memberi ruang panel misi. Pada interaksi, framing bergeser menuju area bebas di sebelah panel; potret menempatkan karakter di atas panel bawah. Kamera tidak otomatis memutar yaw ketika pemain berbelok. Pemeriksaan terhadap volume bangunan yang diperlebar melindungi bidang dekat kamera; pemeriksaan kedua setelah smoothing mencegah orbit menyapu sudut tembok. Kamera tetap boleh kehilangan pandangan di balik pohon: kamera hanya menghindari bangunan, tanpa sistem transparansi pohon.

Navigasi juga diperbaiki untuk pemain di tepi tembok: sel awal yang dibulatkan dapat berada di dalam bangunan meskipun posisi pemain sah. Pencarian kini memilih sel grid yang dapat disambungkan melalui segmen aman dari posisi aktual. Ini menjaga navigasi ketuk tetap tersedia setelah menabrak dinding.

Lihat [laporan pemeriksaan visual](character-camera-review.md), gambar dan video pada `docs/evidence/`, serta regresi baru di `tests/character.test.ts` dan `tests/characters.spec.ts`. Fixture `tests/fixtures/m01-v1.json` mewakili simpanan versi 1 yang sudah memiliki sampel A/B sebelum pembaruan, kemudian dilanjutkan sampai M01 selesai pada browser.
