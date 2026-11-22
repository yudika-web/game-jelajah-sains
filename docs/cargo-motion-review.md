# M04 · Kiriman ke Dermaga

Misi utama gerak dan gaya untuk kelas VII SMP. Branch `feat/m04-cargo-motion` dibuat dari M03 `c822ce7`, yang sudah mencakup tahap 09. Checkout bersih dan daftar branch GitHub saat mulai tidak menunjukkan dasar yang lebih baru.

## Cara bermain

1. Pilih **M04 · Kiriman ke Dermaga** pada Misi aktif. Terima tugas dari Pak Wira di Kota Sains, masuk W04 Sungai dan Danau, lalu baca **Buku gerak** dan **Catatan kiriman** pada dua meja. Peta menampilkan kedua lintasan dan pangkalan.
2. Di pangkalan, pilih **Siapkan latihan** dan **Naik kendaraan**. Laptop memakai W/↑ untuk pendorong, A/D atau ←/→ untuk belok, dan S/↓, Spasi, atau **Rem** untuk mengerem. Melepaskan pendorong membiarkan kendaraan meluncur dengan hambatan. Tekan E atau **Turun** ketika kendaraan berhenti di petak yang sah. Analog HP membawa fungsi yang sama, sementara jari lain dapat menyeret kamera. Pada IFP, pilih **Peta → Pandu ke petak dermaga**. **Pandu** juga tersedia di HUD dan memperagakan pelepasan pendorong dan rem untuk latihan.
3. Di petak dermaga, pilih **Parkir** dan **Turun**, lalu catat latihan. Pilih **Siapkan perjalanan berikutnya** untuk mengembalikan kendaraan ke pangkalan. Setelah membaca rute, simpan prediksi. Muat peti latihan untuk A dan B secara bergantian, tempuh masing-masing, parkir, turun, periksa, lalu pilih **Catat hasil**.
4. Bandingkan tabel. Simpan rute pilihan dan alasan, lalu muat paket `M04-RISET-001`. Kendarai kendaraan ke petak dermaga, parkir, dan turun. Berjalan ke Kak Lestari dan sampaikan kesimpulan dari dua hasil yang dicatat. Jawaban tentang rute tercepat mengikuti waktu pengukuran pemain. Refleksi bebas bersifat opsional.
5. Menu dan tab tersembunyi membekukan kendaraan dan jam. Tombol **Rem** ketika berada di jalan menghentikan kendaraan sambil membiarkan jam terus berjalan. Peta kendaraan menawarkan **Batalkan perjalanan dan pulihkan**. Bukti yang telah disahkan tetap tersimpan.

## Lintasan dan pengukuran

Kedua rute berada di sisi darat W04, mulai dari pangkalan dan berakhir pada petak di dekat Kak Lestari. Jalan A memintas bagian tengah dan memiliki koridor sempit serta batas 2,0 m/s. Jalan B memutar lewat bagian yang lebih lapang, dengan batas hingga 5,4 m/s yang turun saat mendekati dermaga. Rute melingkari meja dan gerbang yang sudah ada. Panjang nominal dihitung dari titik-titik jalan yang juga dipakai untuk menggambar lintasan. Jarak yang tercatat berasal dari gerak yang benar-benar dilakukan.

- Satu unit dunia dihitung sebagai satu meter model. Perjalanan mulai ketika pusat kendaraan melewati gerbang mulai dan berakhir ketika melewati gerbang selesai. Penanda berbentuk wajik menandai gerbang perantara yang harus dilewati berurutan dalam koridor rute yang dipilih. Durasi pendekatan sebelum mulai dan parkir sesudah selesai berada di luar pengukuran.
- Langkah model tetap sebesar 1/120 detik. Saat renderer lambat, satu bingkai aktif dapat memproses hingga 0,5 detik dalam langkah kecil yang sama. Waktu berjalan di antara gerbang, termasuk selama kendaraan diam. Bagian langkah pada kedua gerbang dihitung melalui interpolasi. Jarak adalah jumlah panjang perpindahan yang sah setelah pemeriksaan lintasan dan halangan. Jika gerak tertahan, jarak dan putaran roda tetap.
- Kelajuan rata-rata dihitung dari `jarak dalam meter ÷ waktu dalam detik`. Data tersimpan dalam milimeter dan milidetik. Antarmuka menampilkan hingga dua desimal, dan selisih waktu paling banyak 0,01 detik diperlakukan sebagai hampir sama. Pengukuran kedua rute membandingkan pilihan perjalanan. Jalur dan batas kelajuannya berbeda, sehingga hasil tidak mengisolasi pengaruh satu variabel.
- Rute bantu mengarahkan kendaraan dari penanda ke penanda melalui mesin yang sama. Kendali manual atau rem mengambil alih. Saat memulihkan kendaraan, perjalanan sementara dibatalkan. Pembacaan yang sudah dicatat tidak ikut dibatalkan.

## Model gaya

Model longitudinal memakai massa efektif 220 kg, gaya pendorong maksimum 515 N, hambatan sebesar `42 + 19v` N ketika bergerak, dan rem nominal 850 N. Di lintasan lurus, `F_resultan = F_pendorong − F_hambatan − F_rem` dan `a = F_resultan / massa`. Ketika batas kelajuan tercapai, pengatur mengurangi pendorong hingga menyeimbangkan hambatan. Pengatur dapat menambah pengereman saat masuk zona yang lebih lambat. Tampilan menghitung gaya efektif pada langkah yang sama dengan perubahan kelajuan. Ketika diam, tampilan kembali nol. Kontak dengan batas jalan menghentikan gerak dan ditampilkan sebagai kondisi tertahan.

Belokan menggunakan kontrol arcade. Pandu mengarahkan badan kendaraan ke titik lintasan selanjutnya, dan kemudi manual mengubah arah sambil bergerak. Panah gaya hanya ditampilkan untuk kondisi lurus. Model ini tidak menghitung gaya lateral ban, deformasi, slip, suspensi, dan energi baterai. Angka gaya, panjang lintasan, dan batas kelajuan adalah parameter pembelajaran.

### Sumber

- OpenStax *College Physics 2e* mendefinisikan jarak tempuh sebagai panjang lintasan, perpindahan sebagai perubahan posisi, dan kelajuan rata-rata sebagai total jarak dibagi waktu berlalu. [Displacement](https://github.com/openstax/osbooks-college-physics-bundle/blob/main/modules/m42033/index.cnxml) · [Time, Velocity, and Speed](https://github.com/openstax/osbooks-college-physics-bundle/blob/main/modules/m42096/index.cnxml)
- OpenStax *College Physics 2e* menjelaskan keadaan berkecepatan tetap saat resultan gaya nol serta hubungan percepatan, massa, dan gaya total. [Newton’s First Law](https://github.com/openstax/osbooks-college-physics-bundle/blob/main/modules/m42130/index.cnxml) · [Newton’s Second Law](https://github.com/openstax/osbooks-college-physics-bundle/blob/main/modules/m42073/index.cnxml)

## Paket dan penyimpanan

Hanya ada satu paket kiriman. Sebelum pemuatan paket terlihat di pangkalan, saat perjalanan terlihat di bak, dan setelah penyerahan terlihat di pos penerima. Peti uji memiliki model dan keadaan tersendiri. Kak Lestari menerima paket jika kendaraan benar-benar terparkir, pemain sudah turun dan mendekat, serta kedua uji dan kesimpulan tersedia.

Memuat ulang mengembalikan kendaraan ke pangkalan. Paket yang belum diterima kembali ke tempat pemuatan. Pencatatan M04, receipt XP, dan hadiah **100 Koin Sains** memakai transaksi IndexedDB yang sama. Reset M04 meminta konfirmasi dan mempertahankan hadiah pertama, pembelian, dan misi lain. S10 dan S12 tidak diselesaikan oleh M04. Cadangan v22 menambahkan M04, dan v1–v21 mempertahankan progres M04 yang sudah ada pada profil yang sama. IndexedDB tetap skema 2.

Paket Windows siap main disimpan di [unduhan/JS-Windows.zip](../unduhan/JS-Windows.zip). Ekstrak ke folder pendek, buka `JS`, lalu klik `JALANKAN_JELAJAH_SAINS.bat`. Node.js 24 LTS disarankan.

## Cuplikan dan contoh pengukuran

[Video perjalanan M04 yang direkam dari permainan (WebM)](evidence/cargo/m04-bermain.webm)

| Langkah | Tangkapan layar |
| --- | --- |
| Naik kendaraan | [Pengemudi duduk](evidence/cargo/01-naik.jpg) |
| Latihan rem | [Kendaraan berhenti dan jam mencatat](evidence/cargo/02-rem.jpg) |
| Menempuh dua rute | [Jalur sempit A](evidence/cargo/03-rute-a.jpg) · [Jalur lapang B](evidence/cargo/04-rute-b.jpg) |
| Membandingkan data | [Tabel pengukuran](evidence/cargo/05-bandingkan.jpg) |
| Memuat dan mengirim | [Paket di bak](evidence/cargo/06-muat.jpg) · [Parkir di dermaga](evidence/cargo/07-parkir.jpg) |
| Menyerahkan dan menerima hadiah | [Penyelesaian bersama Kak Lestari](evidence/cargo/08-hadiah.jpg) |

Pada contoh uji dengan pandu, A mencatat **10,81 m, 5,43 s, dan 1,99 m/s**. B mencatat **16,93 m, 5,39 s, dan 3,14 m/s**. B sedikit lebih cepat pada contoh ini. Berhenti di tengah perjalanan dapat mengubah urutannya. Sistem menilai waktu yang dicatat setiap pemain. [Tabel contoh](evidence/cargo/05-bandingkan.jpg)

[HP potret](evidence/cargo/hp-390.jpg) · [HP lanskap](evidence/cargo/hp-844.jpg) · [IFP](evidence/cargo/ifp-1920.jpg)

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| TypeScript dan build produksi | Lulus |
| Vitest | 907 tes lulus, termasuk batas kelajuan, gaya, tabrakan, jeda, langkah tetap, urutan gerbang, bukti, reset, dan impor |
| Peluncur Windows dan integritas ZIP | 16 tes lulus, termasuk ekstraksi ke jalur Unicode dengan spasi dan peluncuran dengan Node tanpa npm |
| M04 dari ZIP final | 4 skenario lulus di Chromium. Alur penuh laptop mencakup pengiriman, reload saat perjalanan, penyerahan, ekspor/impor v22 dan v21, serta hadiah sekali. |
| Regresi dari ZIP final | 6 skenario lulus. Alur lengkap M03, perahu di W04, ROV, instrumen dan EVA W08, menyelam, serta butik diperiksa. |

Pemeriksaan browser memakai Chromium 156 dengan SwiftShader di Linux. Laptop diuji pada 1280×900. HP 390×844 dan 844×390 memakai dua sentuhan untuk analog dan kamera, dengan area kontrol yang terpisah. IFP memakai viewport CSS 1920×1080 dengan skala raster 0,8 dan pilihan pengurangan gerakan. Renderer perangkat lunak kadang melambat pada perjalanan pejalan kaki menuju pangkalan, sehingga pemeriksaan navigasi memberi waktu lebih longgar. Uji awal IFP juga menemukan kehilangan langkah kendaraan saat bingkai lambat. Jam khusus kargo kemudian diuji ulang dengan bingkai panjang dan pandu menyelesaikan latihan di IFP. Pengujian fisik Windows, LAN, HP dan IFP masih terbuka.

```sh
npm run build
npm test -- --maxWorkers=1 --testTimeout=30000
npm run test:launcher
```

Untuk memeriksa misi langsung dari ZIP, ekstrak dan jalankan paket terlebih dahulu pada port 5173, lalu jalankan `CARGO_ORIGIN=http://localhost:5173 npm run test:e2e -- tests/cargo.spec.ts` dari checkout. Uji alur penuh membatasi akses browser ke origin paket. Tambahkan `CAPTURE_CARGO=1` untuk merekam ulang tangkapan layar dan cuplikan dipercepat. Cuplikan memerlukan FFmpeg dengan enkoder VP9.
