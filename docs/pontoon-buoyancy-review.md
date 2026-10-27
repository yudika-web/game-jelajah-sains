# W04 / M16-E4 — Ponton Pengangkut Peralatan

27 Oktober 2026. Dikembangkan dari main `16c8d24` tanpa mengembalikan branch ke versi lama. AGENTS.md tidak ditemukan. S14 tetap episode massa jenis tersendiri. M16 kini terdiri atas E1 tekanan air, E2 hidraulik, E3 tekanan padat dan E4 gaya apung. **Bab Tuntas hanya ketika completed keempat episode saat ini true**. Reset satu episode mengubah status bab, tanpa menarik atau menggandakan XP. M17 tetap mengikuti tiga episodenya sendiri; S17 tidak diselesaikan otomatis.

## Cara bermain

1. Masuk Sungai dari gerbang Kota. Pilih **M16-E4**, temui Kak Lestari dan terima episode. Misi lama bukan prasyarat.
2. Baca dua kartu pada **Buku gaya apung**, lalu kartu **Catatan ponton** di sisi selatan pos riset.
3. Dekati **Neraca pegas**. Periksa benda 2 kg/1 L dan alat. Pilih kondisi, simpan prediksi, **Jalankan pengamatan → Amati → Catat → Kembalikan alat**. Catat udara, sebagian dan penuh dalam urutan bebas.
4. Pada **Modul ponton**, periksa massa kosong 5 kg, muatan 15 kg dan dua batas pengiriman. Bandingkan modul dengan massa, muatan, air dan kondisi tetap. Rencana keliru dapat diperbaiki.
5. Di **Ponton awal**, pilih modul kosong yang diparkir, pasang perlengkapan, simpan prediksi dan **Jalankan pengapungan → Amati → Catat → Bongkar dan parkir**. Ulangi A/B/C. Pemilihan modul terkunci selama bermuatan atau percobaan belum dipulihkan.
6. Pasang muatan pada rancangan pilihan dan pilih **Ke Dermaga Penerima**. Penarik virtual bergerak melalui jalur tetap; avatar tetap di darat. A ditolak karena tidak memenuhi cadangan; C bergerak lalu tertahan sebelum gerbang. B dapat tiba. **Tiba belum mengesahkan pengiriman: tekan Bongkar Muatan di penerima**.
7. Berhenti/Lanjutkan, Kembali ke Dermaga Awal dan Pulihkan Ponton tersedia. Perlengkapan yang sudah diterima tetap di penerima ketika alat dipulihkan.
8. Sampaikan kesimpulan kepada Kak Lestari. Jawaban awal yang keliru dan perbaikannya tersimpan. Refleksi opsional disimpan tanpa penilaian kata kunci. **50 XP sekali** untuk episode, tanpa hadiah bab tambahan. Kembali ke Kota melalui gerbang lama bila selesai.

## Rumus dan satuan

Air tawar model bermassa jenis **1.000 kg/m³**, gravitasi **10 m/s²**. Konversi eksplisit **1 L = 0,001 m³**.

- Berat `W = m × g`.
- Gaya apung aktual `FA = ρ × g × volume terendam`.
- Saat terapung diam tanpa dukungan lain `FA = W`.
- Volume terendam yang diperlukan `V = massa total / ρ`.
- Neraca pada benda tergantung dengan tali tegang membaca `W − FA`.
- Gaya apung maksimum memakai seluruh volume efektif kedap air.

Semua nilai dihitung dalam `pontoonModel.ts` dari parameter yang sama untuk visual, tabel, validator dan aturan misi. Tidak ada dataset hasil kedua pada UI.

| Kondisi benda 2 kg / 1 L | Terendam | Berat tetap | Gaya apung | Bacaan neraca |
| --- | ---: | ---: | ---: | ---: |
| Udara | 0 L | 20 N | 0 N | 20 N |
| Sebagian | 0,5 L | 20 N | 5 N | 15 N |
| Penuh | 1 L | 20 N | 10 N | 10 N |

Gaya apung udara diabaikan. Berat benda tidak berkurang; gaya air ke atas mengurangi tegangan tali. Benda tidak menyentuh dasar atau dinding. Kubus uji berukuran 10 cm pada setiap sisi: volume geometri 0,001 m³. Setengah volume tampak berada di bawah permukaan pada pengamatan sebagian. Selama penurunan, bacaan dihitung dari posisi kubus dan permukaan yang sama: bacaan belum berubah ketika kubus masih di udara. Penarik menyokong sisa berat sampai ponton mencapai keseimbangan. Kamera detail dan diagram memperjelas benda tanpa mengganti skala dunia.

| Ponton | Volume maksimum | Lebar | Terendam diperlukan | Keterendaman | Apung aktual | Apung maksimum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A | 20 L | 0,8 m | 20 L | 100% | 200 N | 200 N |
| B | 30 L | 1,0 m | 20 L | 66,67% | 200 N | 300 N |
| C | 40 L | 1,4 m | 20 L | 50% | 200 N | 400 N |

Massa kosong lengkap **5 kg pada setiap modul** merupakan asumsi latihan. Perlengkapan **15 kg** sehingga berat total **200 N**. Avatar tetap di darat dan tidak menjadi penumpang. Volume efektif adalah volume luar kedap air, bukan ruang barang. Dua pelampung balok memiliki jumlah volume luar sesuai parameter; lebar keseluruhan termasuk penghubung. Garis air mengikuti fraksi volume yang dipindahkan. Sebelum pengapungan, alat penarik menyangga model; keadaan tersebut belum menjadi pengamatan keseimbangan.

A berada pada kondisi batas tanpa cadangan; **tidak dinyatakan pasti tenggelam**. B/C memiliki kapasitas maksimum lebih besar, tetapi gaya apung aktual tetap 200 N pada beban sama dan seimbang.

## Tantangan, kontrol dan pemulihan

Dua aturan latihan berlaku bersama: keterendaman maksimal **75%**, gerbang **1,2 m**. A gagal cadangan; B memenuhi keduanya; C gagal lebar. Angka bukan standar keselamatan kapal nyata. Perhitungan mengabaikan gelombang, kebocoran, kemiringan, variasi massa jenis dan efek dinamis.

Jalur x=7, z=24 sampai 34 terpisah dari jalur perahu lama, memancing, kolam dan irigasi. Gerbang di z=29 memeriksa **seluruh lebar lambung**. Panjang 1,2 m diperhitungkan saat menghentikan C sebelum tiang. Perpindahan dibatasi jarak tersisa pada setiap langkah sehingga tidak melewati tujuan; callback kedatangan sekali. Avatar tidak mendapat izin berjalan atau berenang pada air baru.

Laptop memakai kontrol eksplorasi lama. Panel native dapat dipakai melalui Tab, Enter dan panah daftar. HP/IFP memakai tombol tujuan tetap dan pilihan modul; tidak ada drag atau reaksi cepat. Panel menghentikan avatar. Kamera yang sama mengikuti neraca/ponton sementara; jarak pilihan pengguna dipertahankan.

Kehilangan fokus, tab tersembunyi dan pause menghentikan waktu percobaan/perjalanan. Penutupan panel, perpindahan wilayah, menu lain dan reload membatalkan hasil belum disahkan serta memarkir ponton. Muatan belum diterima kembali ke awal; muatan yang sah diterima tetap di penerima. **Pulihkan Ponton** tidak menghapus catatan atau XP. Kontrol darat memerlukan input baru setelah panel ditutup.

## Arsitektur dan penyimpanan

- `pontoonContent.ts` / `pontoonRegion.ts`: parameter, kartu, stasiun dan jalur.
- `pontoonModel.ts`: satuan, berat, neraca, volume terendam, apung aktual/maksimum dan batas.
- `pontoonMission.ts`: prediksi, urutan bukti, transaksi muatan, kesimpulan, hadiah dan validasi replay.
- `pontoonSession.ts`: waktu presentasi dari loop World yang sama.
- `pontoonDelivery.ts`: lintasan air tetap, envelope lambung, berhenti/kembali dan kedatangan.
- `pontoonWorld.ts`: satu benda uji, tiga modul pakai ulang, satu perlengkapan, garis air, gerbang dan penarik.
- `pontoonUI.ts`: kontrol, diagram penampang, tabel dan jurnal.
- `m16Chapter.ts`: status dari empat completed, tanpa memakai receipt hadiah.

Perlengkapan ber-ID `research-pontoon-equipment` memiliki satu lokasi: rak, ponton atau penerima. Benda neraca `spring-test-block` berbeda dan tetap satu objek. Tidak ada item baru dalam inventaris. Mesh/material digunakan ulang; sumber daya stasiun dimiliki regionRoot W04 dan dilepas ketika wilayah diganti. Tidak ada renderer, loop atau listener input baru.

Catat memerlukan fase **running → preview → observed → recorded**. Mengunjungi stasiun atau membuka jurnal tidak menghasilkan data. Revisi menolak event stale; fase dan ID menolak klik ganda. Pengiriman memerlukan tiga hasil ponton, batas cadangan, perjalanan sah dan pembongkaran. Data model dan urutan riwayat dihitung ulang sebelum impor.

IndexedDB tetap skema **1**, store `saves`, dengan key **M16-E4**. Cadangan **v14** memuat empat belas misi/episode, menerima seluruh **v1–v13**. Cadangan lama mempertahankan M16-E4 yang tidak tercakup. Validasi selesai sebelum progres aktif diganti. Reset hanya episode ini, memerlukan konfirmasi, dan mempertahankan receipt 50 XP pertama. S14, W03-LOG01, sumber air, kendaraan, M17 dan bukti lama tidak diubah oleh tindakan episode.

## Hasil pemeriksaan

- Unit model dan integrasi: **551 pemeriksaan**, termasuk 57 baru untuk ponton, lulus pada `npm test` akhir tanpa mengubah timeout pengujian. Pemeriksaan dilakukan ketika perekaman browser sudah ditutup.
- Peluncur: **14 pemeriksaan Node/Linux lulus**; kode BAT/server produksi tidak diubah.
- TypeScript, Vite dan **jalur `prepare:local` berhasil**, sehingga dist lokal memuat episode baru.
- Lima skenario khusus M16-E4 awal lulus: alur lengkap IFP, laptop/fokus/reload, HP potret, HP lanskap dan IFP besar. Perhitungan pembacaan selama animasi kemudian diselaraskan dengan volume yang benar-benar terendam dan dicakup unit serta regresi akhir.
- Regresi seluruh game mencakup **74 skenario**: 70 lulus pada rangkaian utama (40,7 menit), lalu empat pemeriksaan lama yang diperbaiki lulus saat diulang (5,3 menit). Tiga kegagalan awal adalah ekspektasi versi ekspor; satu adalah kondisi balapan pada helper sandar. **Sembilan pemeriksaan ponton/produksi pada kode akhir lulus lagi** (3,3 menit), mencakup laptop, HP potret/lanskap dan IFP, serta seluruh halaman galeri tanpa internet. Total 74 skenario berbeda telah lulus; pengulangan tidak dihitung sebagai skenario tambahan.

Sesudah regresi utama, perubahan akhir hanya merapikan istilah jurnal/pesan kemajuan ke Bahasa Indonesia serta menyelaraskan permukaan visual air 1 cm ke acuan fisika. Aturan misi dan dataset tidak berubah. Unit tambahan mengukur tinggi permukaan geometri terhadap model.

Regresi awal menemukan ekspektasi ekspor lama masih v13 serta kondisi balapan pada helper perjalanan perahu: status `moving=false` dari frame sebelum keberangkatan dapat terbaca sebagai kedatangan. Ekspektasi diperbarui ke v14. Helper kini menunggu **koordinat dermaga tujuan**, baru memeriksa Sandar dan Turun. Pemeriksaan yang terpengaruh dijalankan ulang; tidak ada pengurangan bukti atau pelonggaran syarat misi.

Perekaman produksi memblokir permintaan jaringan luar: **errors=[] dan external=[]**. Tiga putaran Kota–Sungai mempertahankan satu regionRoot, **95 → 95 → 95 geometri**, **30 → 30 → 30 tekstur**, dan satu perlengkapan yang tetap berada di penerima. Ini pemeriksaan jumlah objek, bukan seluruh pemakaian memori atau benchmark FPS.

## Bukti visual

- [Neraca pegas](evidence/pontoon/01-spring.png); [udara](evidence/pontoon/02-spring-air.png), [sebagian](evidence/pontoon/02-spring-half.png), [penuh](evidence/pontoon/02-spring-full.png).
- [Rak modul dan kebutuhan](evidence/pontoon/03-modules.png).
- Pengapungan produksi: [A](evidence/pontoon/12-production-float-A.png), [B](evidence/pontoon/12-production-float-B.png), [C](evidence/pontoon/12-production-float-C.png).
- Pengiriman: [A tanpa cadangan](evidence/pontoon/13-production-delivery-A.png), [C tertahan gerbang](evidence/pontoon/13-production-delivery-C.png), [B tiba](evidence/pontoon/13-production-delivery-B.png), [perlengkapan dibongkar](evidence/pontoon/14-production-unloaded.png).
- [Tabel/jurnal produksi](evidence/pontoon/15-production-journal.png), [episode dan bab tuntas](evidence/pontoon/18-production-completed.png), serta [kesimpulan dan refleksi](evidence/pontoon/19-production-conclusion.png).
- Simulasi browser: [HP potret](evidence/pontoon/16-production-touch-390.png), [HP lanskap](evidence/pontoon/16-production-touch-844.png), [IFP](evidence/pontoon/16-production-touch-1920.png). Tabel: [potret](evidence/pontoon/17-production-table-390.png), [lanskap](evidence/pontoon/17-production-table-844.png), [IFP](evidence/pontoon/17-production-table-1920.png).
- [Cuplikan pengapungan dan pengiriman](evidence/pontoon/motion/pontoon-float-and-delivery.webm) dan [metadata](evidence/pontoon/motion/recording.json). Rekaman kontinu sekitar 25 detik dari UI build produksi, dimulai pada checkpoint neraca/rencana yang telah diselesaikan melalui UI; pengujian dan pengiriman ponton pada rekaman dijalankan nyata, bukan pergantian slide.
- [Ringkasan verifikasi dan hash kode/build](evidence/pontoon/verification.json).
- [Pemeriksaan sumber daya](evidence/pontoon/resource-cycles.json). Reproduksi media dengan `node scripts/capture-pontoon-evidence.mjs` sesudah build tersedia.

## Keterbatasan

Model ideal ini tidak menentukan kelayakan kapal nyata. Jalur penarik memakai tujuan tetap, tanpa kemudi bebas, arus atau kestabilan miring. Pengujian Chromium/SwiftShader bukan benchmark GPU atau HP sekolah. Peringatan ukuran chunk Three.js bersama tetap perlu dipertimbangkan untuk optimalisasi mendatang. Node.js masih diperlukan oleh peluncur; paket ini bukan EXE mandiri.
