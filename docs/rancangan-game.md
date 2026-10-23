# Jelajah Sains
Rancangan game petualangan IPA untuk SMP

Dokumen desain versi 1.0 • 23 Oktober 2026

Jelajah Sains adalah game petualangan 3D untuk kelas VII–IX. Pemain menjadi penjelajah muda yang membantu warga menyelesaikan persoalan air, pangan, energi, kesehatan, dan lingkungan. Pengetahuan ditemukan melalui buku, catatan lapangan, pengukuran, eksperimen, dan percakapan dengan warga. Pemain menggunakan temuannya untuk mengambil keputusan yang mengubah keadaan dunia.

Keputusan desain utama adalah memakai karakter manusia bergaya balok, kamera orang ketiga, dan dunia semi terbuka yang terbagi menjadi delapan wilayah. Bentuk balok dapat dibuat dari geometri sederhana dan animasi anggota tubuh sehingga lebih mudah dikembangkan daripada karakter manusia realistis. Identitas, model, antarmuka, dan nama dibuat orisinal.

### Ringkasan produk
| Aspek | Rancangan |
|---|---|
| Sasaran | Siswa SMP kelas VII, VIII, IX; guru IPA; kegiatan bersama melalui IFP |
| Genre | Petualangan eksplorasi, simulasi kehidupan ringan, dan pemecahan masalah IPA |
| Dunia | Kota, kebun, hutan, sungai, laut, kawasan energi, geopark, dan antariksa |
| Isi pembelajaran | Pemetaan 20 bab dari lampiran; 20 misi utama dan 24 misi sampingan |
| Aktivitas | Memancing, berenang, menyelam, berkendara, menanam, merawat hewan, memperbaiki alat |
| Platform sasaran | Browser laptop dan HP; IFP sentuh atau laptop terhubung IFP; paket server lokal |
| Pola bermain | Pemain tunggal; mode kelas bersama; pengumpulan hasil lokal sebagai pengembangan berikutnya |
| Lama aktivitas | Misi kelas 10–20 menit; misi sampingan 3–7 menit; petualangan tersimpan antarpertemuan |

Dokumen ini adalah rancangan untuk pengembangan, belum berupa aplikasi yang dapat dimainkan. Angka performa, durasi, ukuran aset, dan keseimbangan permainan merupakan target awal yang harus diuji pada perangkat sekolah.

### Cara menggunakan dokumen
Bagian awal menetapkan pengalaman pemain dan dunia. Bagian tengah memetakan materi, aktivitas, item, serta contoh misi lengkap. Bagian akhir menetapkan asesmen, penggunaan di kelas, struktur teknis, tahap pengembangan, dan kriteria penerimaan.

## Prinsip pembelajaran dan alur bermain
### Pengetahuan harus memengaruhi tindakan
Pemain tidak sekadar berjalan dari satu kuis ke kuis lain. Setiap misi memuat masalah yang terlihat, informasi yang harus dicari, pilihan tindakan, hasil pengamatan, dan penjelasan berbasis bukti. Pertanyaan singkat membantu menafsirkan pengalaman tersebut.

Alur inti berlangsung sebagai berikut: jelajah lokasi, temukan masalah, cari petunjuk, buat dugaan, pilih alat, lakukan tindakan, amati data, lalu jelaskan hasil. Setelah misi selesai, lingkungan berubah dan akses atau alat baru dapat terbuka.

Contoh: tanaman layu tidak langsung pulih karena pemain menjawab soal. Pemain memeriksa kelembapan, membandingkan kebutuhan tanaman, memilih jumlah air, dan mengamati perubahan dalam waktu simulasi. Penjelasan akhir menghubungkan tindakan dengan kebutuhan tumbuhan.

### Tiga cara bermain
| Mode | Kegunaan | Aturan |
|---|---|---|
| Petualangan | Eksplorasi mandiri dan pengembangan rasa ingin tahu | Jalur sesuai kelas; misi sampingan opsional; progres disimpan |
| Misi kelas | Fokus pada tujuan pelajaran | Guru memilih bab dan misi; pemain mulai di lokasi dekat tujuan; perjalanan dipersingkat |
| Kelas bersama IFP | Diskusi dan demonstrasi bergiliran | Satu layar, jeda diskusi, satu pengendali; keputusan dicatat sebagai hasil kelompok |

### Bahasa dan tingkat kesulitan
Instruksi menggunakan kalimat pendek dengan satu tindakan per langkah. Kartu pengetahuan terdiri atas 35–70 kata, gambar atau diagram, satu contoh lokal, dan tombol penjelasan lanjutan. Kata baru dapat disentuh untuk membuka artinya. Narasi berbahasa Indonesia tersedia sebagai audio lokal jika disiapkan; teks tetap selalu tampil.

Tingkat Dibimbing menyediakan sorotan objek, contoh pengukuran, dan angka sederhana. Tingkat Mandiri mengurangi petunjuk dan memberi pilihan alat. Tingkat Tantangan meminta perbandingan solusi dan alasan dengan data. Kesulitan mengubah bantuan dan penalaran, bukan mempercepat tuntutan motorik.

### Batas pengalaman
Tidak ada kewajiban login daring, pembelian, atau hukuman karena tidak bermain setiap hari. Tanaman dan hewan mengikuti waktu simulasi aktif atau tombol Lanjut Hari, sehingga siswa yang perangkatnya terbatas tetap mendapat kesempatan yang sama. Mode kelas tidak mensyaratkan penyelesaian petualangan kelas sebelumnya.

## Dunia permainan dan hubungan wilayah
### Delapan wilayah
| Kode dan wilayah | Lokasi penting | Fokus IPA dan kegiatan |
|---|---|---|
| W01 Kota Sains | Sekolah, perpustakaan, klinik edukasi, pasar, laboratorium, menara air | Metode ilmiah, sel, tubuh, zat, air bersih; pusat misi dan ruang mikro virtual |
| W02 Kebun Kehidupan | Kebun sayur, rumah semai, kolam budidaya, kandang edukasi | Pertumbuhan, faktor lingkungan, pewarisan sifat, bioteknologi |
| W03 Rimba dan Gambut | Pos penjaga, jalur pengamatan, lahan restorasi, pos darurat | Ekologi, klasifikasi, perubahan lingkungan, kebakaran dalam simulasi |
| W04 Sungai dan Danau | Dermaga, pintu air, titik sampling, kolam latihan | Memancing, kualitas air, tekanan, gaya apung, erosi |
| W05 Pesisir dan Laut | Pantai, mangrove, terumbu, stasiun riset bawah laut | Adaptasi, rantai makanan, cahaya, tekanan, konservasi |
| W06 Bengkel dan Energi | Bengkel, pusat daur ulang, turbin, rumah energi | Gaya, usaha, pesawat sederhana, listrik, magnet, energi |
| W07 Geopark | Pos pengamatan, tebing batuan, model lempeng, shelter | Struktur Bumi, gempa, suhu, kalor, pelapukan |
| W08 Antariksa | Observatorium, pusat peluncuran, modul Bulan, stasiun orbit | Tata surya, gerak, cahaya, energi, sistem pendukung kehidupan |

### Hubungan dan skala
Kota terhubung melalui jalan ke Kebun dan Bengkel, melalui jalur penjaga ke Rimba, serta melalui dermaga ke Sungai. Sungai mengarah ke Pesisir. Bengkel menjadi akses transportasi menuju Geopark. Observatorium Kota membuka simulasi ekspedisi Antariksa. Ruang sel dan tubuh berada di laboratorium sebagai model virtual, bukan lokasi fisik yang menyusutkan tubuh pemain.

Setiap wilayah berupa adegan tersendiri. Peralihan memakai gerbang, dermaga, bus, perahu, atau terminal simulasi dengan layar transisi singkat. Hanya satu wilayah utama dimuat pada suatu waktu. Tidak perlu memuat seluruh dunia sekaligus.

Sasaran awal ukuran wilayah adalah sekitar 150–250 meter virtual per sisi. Titik petunjuk dalam satu misi berjarak sekitar 20–45 detik berjalan. Tersedia penanda arah opsional, peta yang dapat diketuk, dan perjalanan cepat ke pos yang pernah dikunjungi. Dalam mode kelas, guru dapat langsung memilih titik awal misi.

### Identitas lingkungan
Gunakan suasana Nusantara, termasuk sungai, mangrove, gambut, dan burung enggang sebagai objek pengamatan. Peta bersifat fiktif; tidak perlu menyalin tata kota nyata. Bangunan dan kendaraan sederhana memberi konteks yang mudah dikenali tanpa menjadikan keindahan visual bergantung pada foto besar.

## Karakter warga dan gaya visual
### Karakter pemain
Gunakan humanoid balok dengan kepala, badan, dua lengan, dan dua kaki. Tangan cukup berupa balok tanpa jari. Variasi dibuat melalui warna kulit, rambut atau penutup kepala, baju, celana, dan aksesori. Seluruh variasi memiliki jangkauan, kecepatan, dan kemampuan sains yang sama.

Animasi awal meliputi diam, berjalan, berlari, melompat, berenang, memegang alat, mengukur, menanam, memancing, mengendarai, dan menyapa. Rotasi sendi sederhana dapat digunakan terlebih dahulu. Satu kerangka dasar dipakai ulang oleh warga untuk menghemat pekerjaan dan aset.

### Warga yang memberi informasi
| Tokoh | Peran | Contoh informasi dan respons |
|---|---|---|
| Bu Nara | Guru dan mentor | Menjelaskan tujuan, membantu membaca data, mengarahkan refleksi |
| Pak Damar | Penjaga hutan | Memandu pengamatan habitat dan koordinasi logistik pos darurat |
| Bu Sari | Petani | Menyediakan benih, catatan kebutuhan tanaman, dan masalah pertumbuhan |
| Kak Bima | Teknisi | Memberi diagram alat, komponen, dan catatan gangguan mesin |
| Kak Lestari | Peneliti perairan | Memandu pengukuran air dan observasi organisme |
| Bu Ratri | Edukator tubuh manusia | Menjelaskan model organ dan hubungan aktivitas dengan kondisi tubuh |
| Pak Arka | Pemandu observatorium | Mengarahkan pengamatan langit dan simulasi antariksa |
| Warga setempat | Sumber konteks masalah | Menyampaikan pengalaman yang perlu dibandingkan dengan hasil pengukuran |

Percakapan menggunakan naskah bercabang yang ditulis dan diperiksa guru. NPC tidak memerlukan AI generatif atau koneksi internet. Pernyataan warga dapat menjadi dugaan, sedangkan data ukur menjadi bukti untuk memeriksanya. Pemain belajar bahwa kesimpulan memerlukan lebih dari satu pendapat.

### Arah seni dan suara
Lingkungan menggunakan model low poly, warna tenang, tepi bangunan sederhana, awan ringan, dan pencahayaan yang mudah dibaca. Warna wilayah membedakan suasana, tetapi label dan ikon tetap memberi arti tanpa bergantung pada warna. Hindari efek kabut, pantulan air, partikel, dan bayangan berlebihan pada perangkat rendah.

Bunyi langkah, air, burung, alat, dan kendaraan memberi umpan balik tindakan. Musik dan efek memiliki pengatur volume terpisah; musik melemah saat narasi. Informasi penting tidak disampaikan lewat audio saja. Kamera memiliki pilihan sensitivitas, pengurangan gerakan, serta tombol pulihkan arah pandang.

## Kontrol HP laptop dan IFP
### Pemetaan kontrol
| Tindakan | Laptop | HP | IFP |
|---|---|---|---|
| Bergerak | W A S D atau tombol panah | Analog kiri | Ketuk tujuan atau analog besar |
| Mengatur kamera | Seret mouse; tombol pulihkan kamera | Seret area kanan | Kamera otomatis; tombol putar kiri kanan |
| Berinteraksi | E | Tombol Aksi sesuai objek | Sentuh objek lalu Aksi |
| Memakai alat | Klik atau F | Tombol Gunakan | Tombol Gunakan berukuran besar |
| Melompat | Spasi | Tombol Lompat | Tombol opsional; rute utama tanpa lompatan presisi |
| Berenang dan menyelam | WASD; naik Spasi; turun C | Analog; tombol Naik dan Turun | Ketuk titik lintasan atau tombol arah |
| Kendaraan | WASD; E untuk turun di lokasi aman | Analog; tombol Rem dan Turun | Rute otomatis bertitik; kontrol manual opsional |
| Tas dan jurnal | I dan J | Ikon Tas dan Jurnal | Panel besar dengan tombol halaman |
| Peta dan jeda | M dan Esc | Ikon Peta dan Jeda | Tombol Peta dan Jeda di tepi layar |

### Kamera dan prioritas sentuhan
Kamera orang ketiga mengikuti pemain dan menghindari tembok. Ketika mengamati objek, kamera berhenti pada sudut yang memperlihatkan alat dan hasil. Kamera tidak mensyaratkan pointer lock. Di HP, analog dan gerakan kamera memakai penanda sentuhan berbeda agar dapat digunakan bersamaan.

IFP menyediakan mode satu sentuhan: ketuk lokasi yang dapat dilalui untuk berjalan otomatis, lalu sentuh objek untuk berinteraksi. Jalur dihitung pada bidang navigasi dan tidak melewati air atau rintangan yang belum diizinkan. Mode ini tetap dapat digunakan jika multitouch panel tidak bekerja baik. Saat pemakaian alat memerlukan posisi stabil, karakter berhenti otomatis.

### Tata layar
Bagian atas menampilkan nama lokasi dan satu tujuan aktif. Peta kecil dapat disembunyikan. Bagian bawah menampilkan alat cepat maksimal empat slot. Tombol aksi berubah menjadi Baca, Bicara, Ambil, Ukur, Isi, atau Tanam sesuai objek terdekat. Menu lain berada di panel jeda agar layar tidak penuh ikon.

Target awal tombol sentuh minimal 48 piksel CSS; tombol utama IFP dapat diperbesar menjadi 64–80 piksel CSS. Ukuran tersebut harus diperiksa secara fisik pada panel sekolah. Panel memakai jarak isi minimal 16 piksel, batas lebar teks, dan area aman layar. Dialog tidak menutupi alat yang sedang dibandingkan.

Tombol Mulai meminta layar penuh dan mengaktifkan audio setelah disentuh. Jika browser menolak layar penuh, tata letak tetap responsif. HP dianjurkan memakai lanskap; tampilan potret tetap dapat digunakan.

## Pengetahuan yang tersebar di dunia
### Jenis sumber pengetahuan
| Sumber | Lokasi dan bentuk | Peran dalam misi |
|---|---|---|
| Buku | Perpustakaan, sekolah, pondok penelitian | Dasar konsep dan ilustrasi alat |
| Catatan lapangan | Pos penjaga, kebun, dermaga | Data sebelumnya dan perubahan kondisi |
| Percakapan | Warga, petani, teknisi, peneliti | Konteks masalah dan dugaan penyebab |
| Alat ukur | Termometer, gelas ukur, penggaris, alat virtual lain | Bukti angka dengan satuan |
| Objek lingkungan | Genangan, tanaman, rangkaian, batuan | Gejala yang diamati langsung |
| Papan informasi | Museum, observatorium, stasiun riset | Diagram, peta, keselamatan, model ilmiah |

Setiap misi utama menggunakan sekurang-kurangnya dua jenis sumber dan satu pengamatan atau pengukuran. Informasi penting selalu dapat ditemukan di wilayah misi atau melalui jurnal sehingga siswa tidak perlu menebak lokasi yang jauh. Misi sampingan dapat memakai satu sumber dan satu bukti sederhana.

### Contoh jaringan petunjuk
Pada misi tanaman, buku menjelaskan kebutuhan air dan cahaya. Catatan Bu Sari menunjukkan jadwal penyiraman. Pengukuran tanah mengungkap perbedaan kelembapan. Pemain membandingkan ketiganya sebelum memilih tindakan. Membaca buku saja belum menyelesaikan misi.

### Jurnal Sains
Jurnal memiliki bagian Penemuan, Data, Dugaan, Percobaan, Kesimpulan, dan Koleksi. Sumber yang dibuka dicatat beserta lokasi dan waktu simulasi. Data alat masuk otomatis agar kegiatan tidak dibebani pengetikan. Pemain memilih bukti yang relevan dan melengkapi alasan singkat, misalnya “Saya memilih ... karena data ...”.

Kartu pertama tampil ringkas, sementara penjelasan lebih panjang dibuka melalui Pelajari Lagi. Catatan yang sudah ditemukan dapat dibaca ulang tanpa perjalanan tambahan. Buku penting tidak hilang setelah dibaca dan dapat diakses ulang dari jurnal.

### Mengolah lampiran materi
Gunakan 20 berkas Markdown sebagai daftar cakupan dan rujukan isi. Teks perlu disunting menjadi kartu baru, bukan dipindahkan satu bab utuh ke layar. Koreksi hasil ekstraksi seperti kata terpotong, tabel hilang, dan angka yang terpisah sebelum dipakai. Bagian Definisi Visual menjadi petunjuk pembuatan diagram, bukan bukti bahwa gambar aslinya sudah tersedia.

Setiap kartu menyimpan kode kelas, bab, konsep, sumber berkas, bagian atau halaman sumber bila tersedia, versi, dan status pemeriksaan guru. Progres membaca, percobaan, dan penguasaan konsep disimpan terpisah. Sistem tidak menganggap membuka kartu sebagai bukti memahami isinya.

## Sistem misi progres dan hadiah
### Bentuk misi
Misi utama menyelesaikan masalah inti bab, memperkenalkan mekanik, dan membuka cerita atau alat. Misi sampingan memperkuat konsep dengan konteks berbeda. Misi penyelidikan meminta pengumpulan dan penafsiran data. Misi perancangan memakai langkah mengenali kebutuhan, merancang, membuat, menguji, dan memperbaiki.

Status misi terdiri atas Belum Tersedia, Tersedia, Diterima, Mengumpulkan Bukti, Melakukan Tindakan, Menyimpulkan, dan Selesai. Kondisi belum sesuai mengembalikan pemain ke langkah yang perlu diperbaiki. Memuat ulang tidak menghapus tahap yang sudah sah.

### Aturan penyelesaian
Misi dinyatakan selesai setelah tindakan yang ditentukan benar terjadi, data wajib tercatat, dan kesimpulan minimal memadai. Membaca seluruh petunjuk atau mengumpulkan koin tidak cukup. Kesimpulan yang belum sesuai menerima petunjuk spesifik dan kesempatan memperbaiki.

Contoh: misi pintu air memerlukan dua data kedalaman, pembandingan tekanan, serta pilihan posisi pemeriksaan. Jika pemain benar menebak posisi tanpa data, sistem meminta pengukuran terlebih dahulu.

### Progres yang tidak menghambat kelas
Tutorial dasar membuka kemampuan berjalan, berinteraksi, dan jurnal. Misi lain memakai prasyarat alat dan konsep lokal, bukan keharusan menamatkan semua bab berurutan. Jalur VII, VIII, dan IX memiliki misi awal masing-masing. Guru dapat membuka misi yang dipilih dengan pengantar singkat dan alat pinjaman.

Tingkatan penjelajah adalah Pemula, Pengamat, Penyelidik, Perancang, dan Penjaga Sains. Tingkatan merupakan perkembangan cerita. Nilai IPA tetap berasal dari bukti dan penalaran, bukan jumlah jam bermain atau banyaknya aktivitas berulang.

### Hadiah
XP diberikan untuk penemuan pertama, percobaan yang terdokumentasi, dan perbaikan penjelasan. Koin Sains dapat ditukar dengan hiasan kebun, variasi pakaian, atau dekorasi markas. Alat esensial diberikan melalui misi atau pinjaman, sehingga siswa tidak terhalang karena koin kurang.

Hadiah misi utama hanya diberikan sekali. Misi yang diulang memberi latihan dan catatan baru tanpa menggandakan sumber daya. Buku dan petunjuk tidak diperjualbelikan. Tidak ada kotak hadiah acak, pembelian uang nyata, atau kompetisi berbasis waktu layar.

### Pemulihan permainan
Jika pemain tersangkut, tersedia Kembali ke Pos. Item penting tidak dapat dibuang permanen. Jika salah memakai bahan, stasiun menyediakan pengulangan percobaan. Membuka jurnal atau dialog menjeda waktu tantangan pada mode pemain tunggal.

## Pemetaan materi kelas VII
Urutan bab mengikuti tujuh berkas kelas VII dalam lampiran. Nama misi merupakan usulan desain. Guru tetap memeriksa kedalaman konsep sesuai tujuan pembelajarannya.

| Bab dan misi | Tindakan dalam dunia | Bukti untuk menyelesaikan |
|---|---|---|
| VII 1 Hakikat Ilmu Sains dan Metode Ilmiah — M01 Detektif Air Kota | Bandingkan sampel air dari dua lokasi; pilih alat, buat dugaan, tentukan variabel pengamatan | Tabel minimal dua sampel, hasil pengukuran, dan kesimpulan yang membedakan dugaan dengan bukti |
| VII 2 Zat dan Perubahannya — M02 Persediaan Es Pasar | Amati mencair dan menguap; pilih penyimpanan; gunakan model partikel untuk menjelaskan | Urutan perubahan wujud dan alasan pilihan wadah; bedakan massa jenis dari massa saja |
| VII 3 Suhu Kalor dan Pemuaian — M03 Rumah Semai Terlalu Panas | Ukur suhu, bandingkan peneduh dan bahan atap, perbaiki model ventilasi | Data sebelum dan sesudah dengan kondisi pembanding; bedakan suhu dengan kalor |
| VII 4 Gerak dan Gaya — M04 Kiriman ke Dermaga | Bandingkan rute, jarak, waktu, dan hambatan jalan memakai kendaraan sederhana | Perhitungan kelajuan rata-rata dengan satuan; jelaskan perubahan gerak akibat gaya |
| VII 5 Klasifikasi Makhluk Hidup — M05 Album Kehidupan Rimba | Foto virtual atau amati organisme, catat ciri, kelompokkan dengan kunci sederhana | Pengelompokan berdasarkan beberapa ciri; alasan yang dapat diperiksa |
| VII 6 Ekologi dan Keanekaragaman Hayati Indonesia — M06 Jaring Kehidupan | Amati hubungan pemakan dan mangsa, temukan gangguan habitat, pilih restorasi | Susunan jaring makanan dan prediksi dampak satu populasi berubah |
| VII 7 Bumi dan Tata Surya — M07 Catatan dari Observatorium | Amati model siang malam, revolusi, fase Bulan; jalankan simulasi posisi benda langit | Model posisi yang benar serta penjelasan bahwa fase Bulan bukan bayangan Bumi |

### Sasaran pengalaman kelas VII
Siswa mampu mengamati, mengukur, mengelompokkan, membaca data sederhana, dan menyampaikan alasan. Kebutuhan perhitungan dimulai dari bilangan bulat, perbandingan sederhana, dan satuan yang ditampilkan jelas.

M01 menjadi tutorial penyelidikan. M02 dan M03 memperkenalkan perubahan keadaan benda. M04 melatih kontrol kendaraan di lintasan aman. M05 dan M06 memperkenalkan Rimba. M07 membuka simulasi Antariksa tanpa menuntut materi kelas IX.

### Contoh penguatan singkat
Sesudah M04, pemain mengirim dua paket lewat rute berbeda. Rute lebih panjang belum tentu memerlukan waktu lebih lama jika kelajuannya berbeda. Data jarak dan waktu menentukan jawaban, bukan tampilan jalan saja.

## Pemetaan materi kelas VIII
| Bab dan misi | Tindakan dalam dunia | Bukti untuk menyelesaikan |
|---|---|---|
| VIII 1 Pengenalan Sel — M08 Kota Kecil Bernama Sel | Gunakan mikroskop virtual; bandingkan preparat tumbuhan dan hewan; jelajah model sel | Identifikasi bagian yang tampak pada preparat dan bagian dalam model; kaitkan struktur dengan fungsi |
| VIII 2 Struktur dan Fungsi Tubuh Makhluk Hidup — M09 Pos Warga Sehat | Susun menu, telusuri perjalanan makanan, bandingkan data napas, dan pelajari model peredaran serta ekskresi | Empat tugas singkat dengan bukti hubungan organ dan fungsi; satu kesimpulan tentang aktivitas tubuh |
| VIII 3 Usaha Energi dan Pesawat Sederhana — M10 Angkat Tandon | Uji bidang miring atau katrol untuk memindah beban; ukur gaya dan jarak | Bandingkan gaya, jarak, dan usaha; hindari klaim bahwa alat menciptakan energi |
| VIII 4 Getaran Gelombang dan Cahaya — M11 Mercusuar dan Pesan Hilang | Atur bandul, uji sumber bunyi, arahkan berkas cahaya ke penerima | Data periode atau frekuensi dan jalur cahaya yang sesuai; pilih penjelasan berdasarkan hasil |
| VIII 5 Unsur Senyawa dan Campuran — M12 Air untuk Laboratorium | Kelompokkan model partikel; pisahkan campuran dengan filtrasi, pengendapan, dan penguapan virtual | Pilih metode sesuai sifat komponen; jelaskan bahwa filtrasi biasa tidak memisahkan garam terlarut |
| VIII 6 Struktur Bumi dan Perkembangannya — M13 Pesan dari Geopark | Susun model lapisan Bumi, amati gerak lempeng, petakan tanda perubahan bentang alam | Penjelasan hubungan model dan gejala; pilihan mitigasi berdasarkan peta situasi |

### Pengaturan bab dengan cakupan luas
M09 dibagi menjadi empat episode, masing-masing sekitar 8–12 menit: makanan dan pencernaan, pernapasan, peredaran darah, serta ekskresi. Guru dapat memilih satu episode pada satu pertemuan. Penyelesaian bab penuh memerlukan seluruh episode; laporan tetap menampilkan episode yang sudah dikerjakan.

Pada episode pernapasan, pemain membaca data simulasi sebelum dan setelah aktivitas. Data tersebut tidak digunakan untuk mendiagnosis siswa. Kegiatan lanjutan dapat meminta siswa menghubungkan hasil game dengan pengamatan sederhana di kelas tanpa paparan asap.

### Jembatan ke rekayasa
M10 dan M12 dapat dilanjutkan dengan proyek model pemurni udara atau penyaring air di bengkel. Pemain membandingkan rancangan, menguji indikator, dan memperbaiki satu variabel. Label membedakan simulasi dari kemampuan prototipe nyata. Air yang tampak jernih tidak otomatis layak diminum, dan penyaring sederhana tidak otomatis menghilangkan gas berbahaya.

## Pemetaan materi kelas IX
| Bab dan misi | Tindakan dalam dunia | Bukti untuk menyelesaikan |
|---|---|---|
| IX 1 Pertumbuhan dan Perkembangan — M14 Kebun Percobaan | Tanam dua kelompok benih dengan satu perbedaan perlakuan dan catat perkembangan | Grafik tinggi terhadap hari simulasi, identifikasi variabel, dan bedakan pertumbuhan dengan perkembangan |
| IX 2 Sistem Koordinasi Reproduksi dan Homeostasis Manusia — M15 Pusat Kendali Tubuh | Susun jalur rangsang, gunakan model edukasi reproduksi, dan kelola respons tubuh dalam simulasi suhu | Tugas terpisah saraf, reproduksi, serta homeostasis; kesimpulan berbasis model tanpa data pribadi siswa |
| IX 3 Tekanan — M16 Stasiun Bawah Air | Bandingkan luas pijakan, baca kedalaman, amati alat hidraulik dan gaya apung | Perhitungan tekanan sederhana dengan satuan serta alasan hubungan kedalaman dan tekanan |
| IX 4 Listrik Magnet dan Sumber Energi Alternatif — M17 Nyalakan Pos Riset | Telusuri rangkaian tegangan rendah virtual, pilih komponen, uji turbin atau panel surya | Rangkaian berfungsi, catatan uji, dan penjelasan perubahan energi serta pengaruh kondisi sumber |
| IX 5 Reaksi Reaksi Kimia dan Dinamikanya — M18 Misteri Bengkel Berkarat | Bandingkan kondisi korosi, amati indikator reaksi, uji laju reaksi dalam model | Tabel kondisi yang dikontrol dan penjelasan terbentuknya zat baru; bedakan pengamatan dari kesimpulan |
| IX 6 Pewarisan Sifat dan Bioteknologi — M19 Benih dan Fermentasi | Prediksi sifat tanaman dengan model pewarisan sederhana; atur fermentasi virtual | Perbandingan prediksi dengan hasil model dan penjelasan peran mikroorganisme |
| IX 7 Isu Isu Lingkungan — M20 Pulihkan Wilayah Jelajah | Audit sampah, air, dan energi; pilih dua intervensi dan pantau indikator | Data awal dan akhir, alasan prioritas, serta keterbatasan solusi yang dipilih |

### Pengaturan episode
M15 dibagi menjadi saraf dan indra, reproduksi manusia, serta homeostasis. Materi reproduksi menggunakan istilah ilmiah, diagram yang sesuai pelajaran, dan pengantar guru. Game tidak meminta siswa memasukkan kondisi tubuh atau pengalaman pribadinya.

M17 dapat dipecah menjadi rangkaian, magnet, dan sumber energi. M19 membedakan model pewarisan satu sifat yang disederhanakan dari keragaman sifat nyata. Hasil organisme virtual tidak dimaknai sebagai kepastian pada makhluk hidup sebenarnya.

### Proyek akhir
M20 menggabungkan data dari wilayah yang telah dipelajari, tetapi guru dapat menyediakan paket data awal untuk mode kelas. Proyek akhir menilai kemampuan memilih tindakan dan menafsirkan dampak, sehingga tidak mewajibkan siswa mengulang semua bab hanya untuk membuka penilaian.

## Memancing berenang dan menyelam
### Memancing sebagai pengamatan ekosistem
Pemain menemui peneliti, memilih lokasi yang diizinkan, memeriksa kondisi air, memasang umpan, lalu menunggu indikator visual. Tombol Tarik digunakan dengan toleransi waktu lebar. Mode akses mudah mengganti tuntutan ketepatan waktu dengan satu tindakan sederhana.

Ikan yang didapat ditampilkan pada kartu pengamatan: bentuk tubuh, habitat, jenis makanan, dan perannya dalam rantai makanan. Ikan dilindungi dilepas setelah pengamatan. Spesies budidaya dapat dipindahkan ke kolam yang sesuai. Pilihan umpan mengubah peluang hasil berdasarkan tabel yang dapat dijelaskan, bukan jaminan satu umpan untuk satu spesies.

Misi dapat meminta tiga pengamatan berbeda, membandingkan dua lokasi, atau menjelaskan perubahan jumlah hasil tangkapan dalam model. Hadiah utama berasal dari catatan dan penjelasan, bukan memburu ikan sebanyak mungkin. Pengamatan tidak menghasilkan estimasi populasi nyata tanpa pembahasan keterbatasan sampling.

### Berenang
Pemain belajar di kolam latihan dangkal dengan batas area jelas. Saat masuk air, animasi dan kontrol berubah otomatis. Rompi tersedia dalam konteks latihan. Arah naik selalu terlihat. Tersedia Kembali ke Tepian tanpa pengurangan nilai IPA.

Tantangan sains meliputi membandingkan benda terapung, membaca kedalaman, dan mengamati adaptasi organisme. Kemampuan berenang tidak diperoleh hanya dengan menjawab soal; tutorial praktik kontrol tetap diberikan. Tidak ada kompetisi menahan napas atau tuntutan meniru penyelaman di dunia nyata.

### Menyelam
Ekspedisi laut memakai perlengkapan atau kendaraan riset virtual. Pemain memeriksa kebutuhan misi, mengambil data, dan kembali ke stasiun. Indikator cadangan udara merupakan batas permainan dengan label simulasi, bukan konversi waktu napas manusia. Dalam mode kelas, batas waktu dapat dimatikan.

Kedalaman memengaruhi angka tekanan pada instrumen dan tampilan cahaya secara sederhana. Makhluk dan bangunan tidak ditempatkan sembarang kedalaman tanpa alasan habitat. Saat cadangan habis, sistem mengembalikan pemain ke pos tanpa animasi cedera dan tanpa menghapus bukti yang sudah diperoleh.

### Batas konten awal
Versi awal menggunakan satu animasi pancing, tiga kelompok ikan, satu kolam latihan, dan satu jalur perairan dangkal. Gerakan bawah laut bebas tiga dimensi serta stasiun riset mendalam menjadi pengembangan setelah kontrol dasar lolos uji.

## Kendaraan kebun dan pemeliharaan hewan
### Kendaraan
Sepeda memperkenalkan gerak dan gaya. Gerobak membawa air atau hasil kebun. Perahu membuka sungai dan pesisir. Kendaraan riset bawah laut serta rover berada pada tahap perluasan. Bentuk kendaraan dibuat sederhana dan memakai pengendalian yang sama: arah, maju, rem, serta keluar di tempat aman.

Kecepatan dibatasi agar mudah dikendalikan. Kamera mengikuti dengan jarak stabil dan pilihan tanpa goyangan. Naik kendaraan mengubah kemampuan angkut dan akses, bukan otomatis memperbesar nilai IPA. Data lintasan menyediakan jarak dan waktu agar pemain dapat membandingkan rute.

### Bercocok tanam
Pemain memilih benih, memeriksa kebutuhan habitat, menyiapkan petak, menanam, menyiram secukupnya, mengamati, lalu memanen atau mengambil data. Benih awal berupa kacang hijau, kangkung, dan jagung. Kartu benih menjelaskan kebutuhan serta waktu pertumbuhan simulasi.

Setiap petak menyimpan jenis tanaman, umur simulasi, tinggi, kondisi air, cahaya, dan perlakuan. Kekurangan atau kelebihan air dapat menghambat pertumbuhan dalam model. Eksperimen mengubah satu variabel, sementara jenis benih, media, dan lama pengamatan dijaga sama. Tombol Lanjut Hari mempercepat pengamatan dan mencatat pergantian waktu.

Pertumbuhan tidak mengikuti jam nyata. Tanaman tidak mati karena siswa tidak membuka game beberapa hari. Kehilangan tanaman akibat pilihan percobaan dapat dipulihkan dengan pengulangan. Benih eksperimen tersedia kembali sehingga kegagalan menjadi sumber data.

### Memelihara hewan
Hewan edukasi awal berupa ikan budidaya, ayam, dan kelinci. Pemain mencocokkan pakan, air, ruang, dan kebersihan habitat. Indikator kesejahteraan menampilkan kebutuhan yang belum terpenuhi; respons hewan mengikuti tabel model yang dijelaskan di jurnal.

Hewan liar diamati di habitat atau fasilitas rehabilitasi. Enggang tidak dijadikan hadiah peliharaan. Aktivitas perawatan tidak menampilkan cedera dan tidak membebani siswa dengan kewajiban hadir setiap hari. Fokusnya adalah kebutuhan makhluk hidup dan hubungan kondisi lingkungan dengan pertumbuhan.

### Keterhubungan kegiatan
Hasil kebun dapat menjadi bahan penyusunan menu pada misi tubuh. Sisa organik masuk ke kompos. Air dari tandon menyiram kebun dan memerlukan keputusan alokasi. Pompa dari bengkel membantu irigasi. Rantai kegiatan ini membuat konsep berpindah konteks tanpa mengharuskan pemain melakukan pekerjaan rutin berulang untuk memperoleh nilai.

## Item alat kapasitas dan perakitan
### Kelompok item
| Kelompok | Contoh | Data dan fungsi penting |
|---|---|---|
| Pengetahuan | Buku, catatan, peta habitat | Disimpan di jurnal; bukan barang konsumsi |
| Wadah | Ember 4 L, jeriken 10 L, tandon gerobak 12 L | Kapasitas maksimum, isi aktual, jenis cairan |
| Pengukuran | Gelas ukur, termometer, penggaris, stopwatch | Rentang, satuan, objek yang dapat diukur |
| Pengamatan | Lup, mikroskop, kamera virtual | Membuka bukti yang sesuai skala |
| Pertanian | Benih, penyiram, kompos, sekop | Kebutuhan petak, jumlah, status pertumbuhan |
| Perairan | Pancing, umpan, rompi, perlengkapan riset | Izin lokasi dan aktivitas yang tersedia |
| Komponen | Kabel, sakelar, roda, katrol, filter | Syarat resep dan kecocokan sambungan |
| Bahan | Pasir, kerikil, media filter, sampel tanah | Kuantitas, asal, penggunaan yang diizinkan |

### Aturan kapasitas
Kapasitas adalah batas wadah; volume isi dapat lebih kecil. Mengisi menghitung nilai terkecil antara sisa kapasitas dan persediaan sumber. Menuang menghitung nilai terkecil antara isi wadah dan kebutuhan penerima. Kelebihan tetap di wadah; tidak menghilang tanpa penjelasan. Sumber dan penerima selalu diperbarui dalam satu transaksi.

Kapasitas tas awal 12 slot dengan empat slot alat cepat. Item serupa dapat ditumpuk menurut aturan bahan. Slot bukan ukuran volume atau massa. Pada misi angkut, batas muatan ditampilkan terpisah dengan satuan kg atau L. Sampel yang sedang dinilai tidak tercampur otomatis dengan sampel lain.

### Perakitan dan perbaikan
Pemain memeriksa gejala, membaca diagram, mencari komponen, merakit pada titik sambungan, lalu menguji. Sistem mengizinkan beberapa rancangan sah jika hasil dan penjelasannya memadai. Meletakkan semua bahan tidak langsung membuat mesin bekerja.

Resep awal mencakup model penyaring air, penyaring partikel udara, rangkaian lampu tegangan rendah virtual, katrol tandon, dan irigasi sederhana. Uji menampilkan hasil yang relevan, misalnya kekeruhan model, aliran, atau nyala lampu. Kelulusan tidak boleh menyatakan air aman diminum hanya karena jernih.

### Satuan dan model fisika
Simpan volume internal dalam mL dan waktu dalam detik; tampilkan L atau menit bila diperlukan. Konversi harus eksplisit. Contoh 4 L air setara 0,004 meter kubik. Jika massa jenis air diasumsikan 1.000 kg per meter kubik, massa air tersebut 4 kg; massa wadah dihitung terpisah atau dinyatakan diabaikan dalam latihan.

## Misi khusus dukungan pos kebakaran hutan
### Cerita dan tujuan
Penjaga hutan melaporkan kebakaran pada wilayah simulasi. Pemain bertugas di area pos aman untuk membantu logistik air dan membaca perubahan kondisi lingkungan. Petugas NPC menangani pemadaman. Tujuan IPA adalah membedakan kapasitas dan volume, merencanakan angkutan, serta menjelaskan hubungan kebakaran dengan perubahan lingkungan.

Kebakaran ditampilkan melalui perubahan langit, peta terdampak, dan aktivitas petugas. Pemain tidak diarahkan memasuki api atau asap. Pada narasi awal, game menjelaskan bahwa volume latihan adalah penyederhanaan logistik pos dan tidak mewakili kebutuhan pemadaman hutan nyata.

### Data skenario latihan
| Komponen | Nilai | Aturan |
|---|---|---|
| Tandon sumber pos | 40 L | Persediaan terbatas; tidak terisi sendiri selama latihan |
| Penampung A | Kebutuhan 8 L | Dapat diisi beberapa kali |
| Penampung B | Kebutuhan 6 L | Kelebihan tidak boleh melampaui kapasitas |
| Penampung C | Kebutuhan 10 L | Dibuka setelah jalur aman ditetapkan petugas |
| Ember | Kapasitas 4 L | Dapat diisi sebagian; satu wadah aktif dibawa |
| Tandon gerobak | Kapasitas 12 L | Perlu perbaikan roda; dapat menuang sebagian |

### Urutan misi
1. Terima tugas dan baca peta pos aman. Periksa tiga penampung dan persediaan sumber.
2. Catat kebutuhan total 24 L. Pilih ember atau perbaiki gerobak dengan komponen yang tersedia.
3. Isi wadah sampai volume yang dipilih. Indikator menampilkan kapasitas, isi, dan sisa sumber.
4. Antar ke penampung. Pilih jumlah tuang; sisa air tetap terbawa. Selesaikan pengisian yang dibutuhkan.
5. Bandingkan jumlah perjalanan, jarak, dan waktu. Tulis alasan pilihan alat angkut.
6. Amati laporan pemulihan lingkungan dan pilih tindakan lanjutan, misalnya restorasi habitat.

### Contoh solusi yang sah
Ember 4 L memerlukan enam perjalanan bermuatan untuk memindahkan 24 L jika setiap muatan dimanfaatkan. Pada perjalanan keempat, pemain dapat menuang 2 L ke B dan 2 L sisanya ke C. Tandon 12 L dapat menyelesaikan dua perjalanan bermuatan: pertama 8 L ke A dan 4 L ke B; kedua 2 L ke B dan 10 L ke C. Sisa sumber menjadi 16 L pada kedua solusi.

Gerobak tidak otomatis menjadi solusi tercepat karena waktu perbaikan dan kondisi jalur dapat berbeda. Misi menerima kedua rencana; penilaian meminta bukti efisiensi. Tidak ada aturan umum menyiram semua jenis kebakaran: kebakaran instalasi listrik memakai blokir area dan penanganan NPC sesuai cerita.

## Kejadian dinamis dan perubahan dunia
Kejadian dipicu skrip misi atau dipilih guru, sehingga tujuan pelajaran tidak tergantung keberuntungan. Kejadian acak hanya untuk suasana dan misi sampingan yang sudah dapat diakses. Setiap kejadian memiliki keadaan awal, pemicu, indikator, pilihan tindakan, dan kondisi pulih.

| Kejadian | Indikator yang terlihat | Pilihan sains dan dampaknya |
|---|---|---|
| Kekeringan kebun | Air terbatas, kelembapan berubah | Ukur kebutuhan dan atur irigasi; persediaan air dan pertumbuhan berubah |
| Banjir sungai | Tinggi air, saluran tersumbat | Bandingkan limpasan pada model, buka aliran aman; tinggi genangan berubah |
| Ikan sulit ditemukan | Data kualitas air dan catatan tangkapan | Uji dugaan kualitas habitat; pilih perbaikan sumber pencemar |
| Pos riset padam | Diagram rangkaian, komponen bermasalah | Periksa sambungan atau sumber energi; uji sebelum mengaktifkan |
| Rumah semai panas | Suhu beberapa lokasi | Bandingkan peneduh, ventilasi, dan bahan; suhu model berubah |
| Jembatan angkut rusak | Batas beban dan lintasan | Pilih alat bantu atau rute; waktu dan kebutuhan gaya berubah |
| Gempa dalam simulasi | Peta zona dan jalur evakuasi | Baca situasi dan menuju tempat aman; jelaskan kaitan dengan model lempeng |
| Cuaca menutup langit | Cahaya turun, pengamatan terganggu | Ubah waktu pengamatan atau bandingkan data panel surya |

### Aturan pemodelan
Lingkungan menyimpan angka atau kategori yang dapat diperiksa, seperti persediaan air, kondisi petak, kualitas habitat, dan energi. Hubungan sebab akibat memakai tabel atau persamaan sederhana yang terdokumentasi. Efek visual membaca keadaan tersebut sehingga perubahan dunia sesuai data.

Tidak semua kejadian terjadi sekaligus. Mode kelas mengaktifkan satu kejadian utama agar fokus. Saat siswa membaca jurnal, waktu misi berhenti. Perubahan yang memerlukan jam atau hari ditampilkan sebagai percepatan simulasi dengan penanda waktu.

### Pemulihan dan penyimpanan
Keadaan kejadian disimpan bersama progres. Menutup game tidak mengulang hadiah atau menciptakan bencana baru. Jika kondisi sulit dipulihkan, tombol Ulangi Percobaan mengembalikan titik awal skenario dengan penjelasan perubahan yang direset. Tidak ada penghancuran permanen hasil belajar siswa.

Sesudah intervensi, warga memberikan laporan yang membandingkan data awal dan akhir. Hasil dapat baik sebagian: misalnya air lebih jernih tetapi masih mengandung komponen terlarut dalam model. Pemain diminta menjelaskan keterbatasannya.

## Contoh misi lengkap penyelidikan air
### M01 Detektif Air Kota
Masalah muncul ketika warga melihat air sungai lebih keruh setelah hujan. Pemain membantu Bu Nara mencari penjelasan sebelum memilih tindakan. Misi awal berlangsung sekitar 15–20 menit dan menjadi tutorial alat, bukti, serta kesimpulan.

Tujuan belajar adalah memilih pengamatan yang relevan, membandingkan dua sampel, mengenali variabel, dan menyimpulkan sesuai bukti. Lokasi terdiri atas sekolah, titik sungai dekat lahan terbuka, serta titik pembanding. Alatnya dua botol sampel berlabel, alat kekeruhan virtual, jurnal, dan peta.

### Urutan pengalaman
1. Warga mengajukan dugaan bahwa semua air keruh pasti berasal dari limbah. Pemain mencatatnya sebagai dugaan, bukan fakta.
2. Catatan hujan dan peta lahan menunjukkan dua kemungkinan sumber. Pemain membaca kartu tentang aliran permukaan dan partikel tersuspensi.
3. Pemain mengambil sampel A dan B pada waktu simulasi yang sama. Botol tidak dapat dipakai ulang tanpa penanganan sampel sebelumnya.
4. Alat menampilkan indeks kekeruhan model, misalnya A 70 dan B 20 pada skala simulasi. Label menyatakan angka tersebut bukan satuan pengukuran laboratorium nyata.
5. Pemain membandingkan lokasi, catatan hujan, serta data. Ia memilih tindakan uji berupa pemasangan model penahan sedimen pada jalur limpasan.
6. Uji berikutnya dengan kondisi hujan simulasi yang sama menghasilkan A 35. Pemain menjelaskan perubahan dan batas kesimpulannya.

### Hasil dan penilaian
Misi selesai jika dua sampel terbaca, dugaan dibedakan dari bukti, uji dicatat, dan kesimpulan menyebut hubungan sedimen dengan kekeruhan dalam model. Kesimpulan tidak boleh menyatakan sampel aman diminum. Data yang tersedia hanya mendukung penjelasan tentang kekeruhan dan kemungkinan sumbernya.

Umpan balik contoh: “Data A lebih tinggi daripada B. Periksa letak lahan terbuka pada peta sebelum memilih sumber yang paling mungkin.” Jika pemain mengulang tanpa mengubah alasan, sistem membuka contoh cara menghubungkan data dan klaim.

### Pengembangan lintas bab
Di kelas VIII, persoalan yang sama dilanjutkan ke pemisahan campuran dan penilaian metode filter. Di kelas IX, konteksnya diperluas ke pengelolaan lingkungan dan kebutuhan informasi tambahan. Data dan pertanyaan berbeda sehingga pengulangan lokasi tidak berarti mengulang tugas yang sama.

## Contoh misi lengkap kebun dan mesin
### M14 Kebun Percobaan
Bu Sari menerima dua laporan bertentangan tentang penyiraman. Pemain diminta membandingkan pertumbuhan tanaman dengan perlakuan air berbeda, bukan memilih jawaban berdasarkan tampilan tanaman saja.

Dua kelompok masing-masing berisi tiga tanaman sejenis. Kedua kelompok memakai benih, media, cahaya, dan waktu pengamatan yang sama. Jumlah air menjadi variabel yang diubah. Tinggi diukur pada hari simulasi 0, 2, 4, dan 6. Pengulangan tiga tanaman memberi contoh bahwa hasil dapat bervariasi.

Pemain menanam, menetapkan perlakuan, maju hari simulasi, mengukur, lalu membandingkan grafik atau rata-rata yang dibantu sistem. Mode Dibimbing menggunakan tabel siap isi; mode Tantangan meminta alasan pemilihan kontrol dan batas generalisasi. Jika lebih dari satu kondisi diubah, NPC meminta memperbaiki rancangan sebelum menarik kesimpulan sebab akibat.

Kelulusan memerlukan rancangan dengan satu variabel perlakuan, data empat waktu, serta kesimpulan yang menyebut hasil kedua kelompok. Pemain menerima benih baru dan akses rumah semai, tanpa bonus karena bermain pada hari nyata berturut-turut.

### M17 Nyalakan Pos Riset
Pos pengamatan membutuhkan lampu dan alat ukur. Pemain memeriksa gejala pada rangkaian tegangan rendah virtual, membaca diagram, lalu mengisolasi komponen yang akan diperiksa. Game tidak memberi tugas memperbaiki instalasi listrik rumah nyata.

Pemain mengecek baterai, sakelar, kabel, dan lampu satu per satu. Setelah rangkaian berfungsi, ia membandingkan sumber energi dengan data cuaca simulasi. Panel surya menunjukkan keluaran berbeda pada kondisi terang dan mendung; baterai menyimpan energi terbatas. Turbin mengikuti kondisi angin atau aliran sesuai lokasi.

Kelulusan memerlukan rangkaian tertutup yang tepat, hasil uji sebelum dan sesudah, serta alasan memilih sumber atau penyimpanan energi. Memasang komponen secara acak tetap dapat dipulihkan, tetapi tidak langsung memberikan penguasaan konsep. Misi mencatat perubahan komponen dan hasilnya.

### Perbaikan mesin sebagai pola umum
Semua alat mengikuti siklus gejala, dugaan, pemeriksaan, perbaikan, pengujian, dan penjelasan. Pompa air yang tidak mengalir dapat memiliki sambungan lepas atau saluran tersumbat dalam skenario berbeda. Petunjuk membatasi ruang dugaan agar siswa belajar menelusuri penyebab, bukan sekadar mencoba semua item.

## Misi sampingan wilayah darat
Setiap misi berdurasi awal 3–7 menit. Pemain boleh melewatinya. Hadiah berupa catatan koleksi, dekorasi, atau XP pertama, sedangkan penguatan konsep dicatat terpisah dari nilai utama.

| Kode dan lokasi | Tugas | Konsep dan bukti |
|---|---|---|
| S01 Kota | Temukan alat yang tepat untuk mengukur tiga benda | Besaran dan satuan; pilihan alat beserta hasil |
| S02 Kota | Bantu pedagang memilih wadah es | Perpindahan kalor; perbandingan hasil dua bahan |
| S03 Kota | Telusuri perjalanan makanan pada model | Pencernaan; urutan organ dan fungsi |
| S04 Kebun | Pilih titik menanam yang sesuai kebutuhan benih | Faktor abiotik; data cahaya dan air |
| S05 Kebun | Periksa habitat ayam dan kelinci | Kebutuhan makhluk hidup; pencocokan pakan dan ruang |
| S06 Kebun | Kelola kompos dari sisa organik | Penguraian; pisahkan bahan sesuai kategori dan jelaskan |
| S07 Rimba | Catat tiga ciri organisme tanpa menangkapnya | Klasifikasi; ciri yang dapat diamati |
| S08 Rimba | Susun hubungan makanan enggang dan tumbuhan | Interaksi dan penyebaran biji; satu rantai sebab akibat |
| S09 Rimba | Tandai lokasi restorasi habitat | Ekologi; alasan pemilihan berdasarkan kondisi lahan |
| S10 Bengkel | Perbaiki gerobak dengan roda yang sesuai | Gaya gesek; hasil uji sebelum dan sesudah |
| S11 Bengkel | Pisahkan potongan logam dari campuran | Magnet dan pemisahan; jenis bahan yang tertarik |
| S12 Bengkel | Pilih jalur angkut beban dengan bidang miring | Pesawat sederhana; bandingkan gaya dan panjang lintasan |

### Perbedaan dari tugas utama
Misi sampingan hanya memperkuat satu atau dua konsep. Tidak semua memerlukan formulir kesimpulan panjang. Contoh S11 cukup meminta memilih bahan yang tertarik dan satu alasan. Misi utama M17 tetap memerlukan penyelidikan rangkaian dan keputusan sumber energi.

### Variasi yang terarah
Setelah penyelesaian pertama, lokasi benda, jumlah sederhana, atau jenis bahan dapat berubah dengan data awal yang tersimpan. Konsep serta kriteria penilaian tetap sama. Variasi tidak boleh menghasilkan kombinasi yang tidak dapat diselesaikan.

Guru dapat menonaktifkan misi sampingan pada pelajaran singkat. Pada petualangan mandiri, daftar misi menampilkan perkiraan waktu dan konsep agar pemain dapat memilih sesuai minatnya.

## Misi sampingan perairan Bumi dan antariksa
| Kode dan lokasi | Tugas | Konsep dan bukti |
|---|---|---|
| S13 Sungai | Catat ikan pada dua titik yang diizinkan | Habitat dan sampling; perbandingan catatan pengamatan |
| S14 Sungai | Uji tiga benda pada kolam model | Massa jenis rata-rata dan gaya apung; prediksi serta hasil |
| S15 Sungai | Cari penyebab aliran irigasi berkurang | Aliran dan hambatan; perbandingan kondisi saluran |
| S16 Pesisir | Susun peran organisme pada jaring makanan | Ekosistem laut; hubungan pemakan dan mangsa |
| S17 Pesisir | Bandingkan tekanan pada dua kedalaman | Tekanan hidrostatis; dua hasil dengan satuan |
| S18 Pesisir | Uji cahaya yang diterima pada model air berbeda | Cahaya dan medium; pola hasil pengamatan |
| S19 Geopark | Kelompokkan sampel berdasarkan ciri teramati | Pengamatan dan klasifikasi batuan sederhana; catatan ciri |
| S20 Geopark | Periksa model sambungan rel saat suhu berubah | Pemuaian; alasan adanya celah sambungan |
| S21 Geopark | Pilih jalur menuju titik kumpul dalam simulasi | Membaca peta bahaya; alasan pilihan rute |
| S22 Antariksa | Atur model agar menunjukkan siang dan malam | Rotasi Bumi; posisi dan penjelasan |
| S23 Antariksa | Cocokkan fase Bulan dengan posisinya | Tata surya dan cahaya; arah pencahayaan yang sesuai |
| S24 Antariksa | Atur energi stasiun antara baterai dan panel | Perubahan dan penyimpanan energi; neraca sederhana |

### Eksplorasi setelah misi
Pemain dapat menyelesaikan album habitat, melengkapi jurnal penemuan, menghias markas, atau mengulang eksperimen. Koleksi pengetahuan bersifat permanen dan dapat dibaca ulang. Hiasan tidak memberi keunggulan akademik.

### Penyelidikan lintas wilayah
Sebagai aktivitas tambahan, guru dapat meminta siswa membandingkan air Sungai dengan Pesisir, atau suplai energi Bengkel dengan Antariksa. Tugas ini menggunakan data yang tersedia dan menyatakan perbedaan kondisi. Game tidak menyimpulkan satu faktor menjadi penyebab tunggal jika banyak faktor ikut berubah.

### Menjaga konteks ilmiah
Ruang Antariksa menampilkan label model tidak berskala untuk jarak dan ukuran benda langit. Kecepatan perjalanan dipersingkat sebagai konvensi game. Gravitasi, ketiadaan medium bunyi di ruang hampa, dan kebutuhan pendukung kehidupan dijelaskan melalui simulasi yang konsisten. Efek suara antarmuka tetap boleh ada, tetapi tidak diperlakukan sebagai bunyi yang merambat melalui ruang hampa.

## Asesmen dan laporan guru
### Bukti yang dinilai
Penilaian membedakan aktivitas bermain, bukti belajar, dan penguasaan konsep. Lama bermain, jumlah ikan, koin, serta dekorasi tidak menjadi nilai akademik. Membaca kartu dicatat sebagai akses materi, sedangkan penalaran dinilai dari penggunaan data dan kesimpulan.

| Komponen | Bobot usulan | Contoh bukti |
|---|---|---|
| Pemahaman konsep | 30 persen | Penjelasan kapasitas, gaya, organ, atau perubahan energi |
| Pengamatan dan data | 25 persen | Memilih alat, mencatat angka dan satuan, membandingkan kondisi |
| Pemecahan masalah | 25 persen | Memilih tindakan, menguji, dan memperbaiki rancangan |
| Penjelasan dan refleksi | 20 persen | Menghubungkan klaim dengan bukti serta menyebut keterbatasan |

Setiap komponen menggunakan tingkat 0 belum ada bukti, 1 perlu banyak bantuan, 2 cukup dengan sebagian bantuan, dan 3 mandiri serta tepat. Nilai sementara dihitung dengan menjumlahkan bobot dikalikan tingkat dibagi tiga. Bobot ini adalah usulan yang dapat disesuaikan guru.

Jawaban pilihan dan tindakan terstruktur dapat dinilai otomatis. Alasan terbuka memerlukan pemeriksaan guru atau rubrik terstruktur yang batasnya jelas. Selama pemeriksaan belum selesai, laporan memberi label Nilai Sementara. Game tidak mengklaim menilai mutu penalaran bebas secara sempurna dari kata kunci.

### Evaluasi akhir
Sesudah misi utama, evaluasi singkat menggabungkan pilihan ganda kontekstual, pengurutan, menjodohkan, pembacaan data, dan alasan singkat. Pada latihan, umpan balik dapat langsung tampil. Pada evaluasi, jawaban dikunci setelah tombol Kirim Jawaban dan nilai ditampilkan sesuai status pemeriksaan.

Percobaan pertama dan hasil perbaikan disimpan terpisah. Guru dapat melihat perkembangan tanpa menghukum siswa karena memakai bantuan aksesibilitas. Kategori perlu penguatan ditautkan ke konsep, bukan label kemampuan umum siswa.

### Laporan
Kolom minimal adalah identitas pemain atau kode, kelas, sesi, kode misi, bukti yang terkumpul, percobaan pertama, hasil akhir, bantuan konsep, bagian perlu penguatan, refleksi, dan status simpan atau kirim. Guru dapat memfilter per bab dan mengekspor CSV pada tahap dasbor.

Hasil disimpan lokal terlebih dahulu. Pengumpulan jaringan menjadi fitur terpisah dengan status Belum Dikirim, Mengirim, Terkonfirmasi, Gagal, atau Belum Dapat Dipastikan. Nilai tidak tertahan ketika jaringan bermasalah. Integrasi Canva hanya ditambahkan bila lingkungan penerapannya mendukung; rancangan browser mandiri tidak mengasumsikan SDK Canva tersedia.

## Penggunaan dalam pembelajaran
### Contoh satu aktivitas 40 menit
| Waktu | Kegiatan | Keluaran |
|---|---|---|
| 0–5 menit | Guru memperlihatkan masalah dan dugaan awal melalui IFP | Pertanyaan penyelidikan |
| 5–8 menit | Siswa mencoba kontrol dan membaca tujuan | Siap menggunakan alat |
| 8–23 menit | Kelompok menyelidiki satu misi yang dipilih | Data dan satu keputusan |
| 23–30 menit | Kelompok membandingkan hasil dan menyimpulkan | Klaim beserta bukti |
| 30–37 menit | Dua perwakilan kelompok mempresentasikan | Penjelasan dan tanggapan |
| 37–40 menit | Refleksi dan simpan hasil | Satu hal dipahami dan satu pertanyaan |

### Pertemuan 2 JP dan 3 JP
Untuk 2 JP SMP, rancangan awal memakai alokasi 80 menit: pengantar 10, eksplorasi dan misi 35, diskusi 15, presentasi 15, serta refleksi 5 menit. Untuk 3 JP atau 120 menit, alokasi dapat menjadi pengantar 10, permainan 35, merancang solusi 25, uji dan perbaikan 20, presentasi 20, serta refleksi 10 menit. Guru menyesuaikan dengan jadwal sekolah.

Dalam dua pertemuan, M09 pernapasan dapat mengantar pengamatan data tubuh pada pertemuan pertama. Pada pertemuan kedua, misi lingkungan atau bengkel mengantar rancangan penyaring partikel udara. Percobaan nyata tetap memakai prosedur dan tujuan yang ditentukan guru, bukan menyalin semua efek game.

### Kerja kelompok dan IFP
Kelompok empat siswa membagi peran menjadi pengendali, pembaca petunjuk, pencatat data, dan penyampai alasan. Peran bertukar di tengah kegiatan. Pada IFP tunggal, siswa bergiliran mengendalikan sementara kelas memilih dugaan atau tindakan. Guru menjeda pada titik keputusan.

Setiap kelompok memiliki kode sesi agar hasil tidak saling menimpa. Untuk perangkat terbatas, sediakan kartu kerja singkat berupa masalah, tabel data, pilihan tindakan, dan kesimpulan. Kelompok yang belum memegang perangkat dapat membaca data yang diproyeksikan.

### Pengaturan guru
Panel guru memilih kelas, bab, mode, tingkat bantuan, batas waktu, akses wilayah, misi sampingan, dan titik mulai. Panel dapat mereset percobaan tertentu tanpa menghapus jurnal seluruh pemain. Hapus semua data memerlukan pilihan terpisah dan konfirmasi dalam aplikasi. Pengaturan guru dilindungi pada sisi server bila dipakai melalui jaringan kelas.

## Arsitektur teknis dan akses offline
### Pilihan implementasi
Rancangan awal menggunakan aplikasi web 3D berbasis JavaScript atau TypeScript dengan Three.js, aset lokal, dan data materi terpisah. Ini merupakan pilihan desain agar satu basis kode melayani HP, laptop, dan IFP. Bukan persyaratan menggunakan platform Roblox. Versi pustaka dipatok saat mulai implementasi dan diuji bersama asetnya.

Renderer WebGLRenderer pada dokumentasi Three.js menggunakan WebGL 2. Lakukan pemeriksaan kemampuan saat mulai; dukungan harus diuji pada perangkat sasaran. Bila tidak tersedia, tampilkan penjelasan dan jalur tampilan materi 2D. Tampilan tersebut bukan klaim bahwa petualangan 3D tetap berfungsi pada perangkat tanpa kemampuan yang diperlukan.

### Pembagian sistem
| Sistem | Tanggung jawab |
|---|---|
| Input dan kamera | Keyboard, pointer, analog, kontrol IFP, kamera otomatis |
| Dunia dan gerak | Wilayah, navigasi, tabrakan, air, kendaraan |
| Interaksi dan item | Objek sasaran, tas, alat, resep, transaksi volume |
| Misi dan pengetahuan | Status misi, petunjuk, dialog, jurnal, validasi bukti |
| Simulasi | Tanaman, hewan, cuaca, energi, kejadian dinamis |
| Asesmen | Penilaian terstruktur, rubrik, refleksi, laporan |
| Penyimpanan dan sinkronisasi | Simpan lokal, ekspor impor, antrean pengiriman |

### Dua jalur penggunaan
Paket mandiri berjalan melalui server lokal laptop yang membawa pustaka, gambar, font, audio, dan materi. Tidak ada aset wajib dari CDN. Pengemasan server ke EXE dapat menjadi tahap distribusi Windows; EXE tersebut menjalankan server dan membuka browser, bukan otomatis mengubah seluruh renderer menjadi game native.

Untuk jaringan sekolah, laptop guru terhubung ke router atau hotspot dan menampilkan IPv4 lokal, port, serta QR alamat siswa. HP mengakses server melalui jaringan yang sama. Koneksi tersebut tidak memerlukan internet, tetapi tetap memerlukan jaringan lokal dan aturan firewall yang sesuai. Dukungan banyak siswa harus diuji berdasarkan laptop dan jaringan yang digunakan.

Mode jaringan tidak otomatis berarti multiplayer dalam dunia yang sama. Pemain tetap memiliki dunia sendiri; server menyajikan aset dan dapat mengumpulkan hasil. Pertemuan avatar secara langsung memerlukan sinkronisasi tambahan dan ditempatkan pada tahap pengembangan lanjutan.

PWA dapat menjadi opsi kemudian. Jangan menjadikan service worker syarat akses melalui HTTP LAN karena fitur tersebut memiliki persyaratan konteks aman. Browser, layar penuh, audio, dan penyimpanan tetap memiliki batas masing-masing yang perlu ditangani aplikasi.

## Struktur konten data dan kontrak penyimpanan
### Data materi dan misi
| Rekaman | Bidang minimal |
|---|---|
| Kartu pengetahuan | id, kelas, bab, konsep, teks singkat, media, sourceRef, versi, status telaah |
| Misi | id, learningGoals, prasyarat, langkah, sumber bukti, validasi tindakan, rubrik, hadiah |
| Item | id, kategori, jumlah, unit, kapasitas, isi, massa, aturan pakai |
| Objek dunia | id, wilayah, posisi, tipe interaksi, contentId, state |
| Progres | saveVersion, playerId, sessionId, misi, jurnal, tas, keadaan dunia, waktu simulasi |
| Upaya penilaian | attemptId, missionId, itemId, respons, bukti, skor sementara, status telaah |

Kode misi dan objek harus stabil saat konten diperbarui. Tampilan membaca data, sedangkan validasi misi memeriksa peristiwa yang benar. Membuka panel buku menghasilkan peristiwa baca; mengukur menghasilkan data; menuang menghasilkan perubahan volume. Ketiganya tidak saling menggantikan.

### Penyimpanan pemain
Gunakan IndexedDB sebagai penyimpanan progres utama di browser, dengan autosave setelah langkah misi, perpindahan wilayah, perubahan item, dan jeda. Sediakan ekspor impor berkas cadangan. Penyimpanan lokal dapat hilang karena penghapusan data browser; antarmuka perlu menampilkan waktu simpan terakhir dan tombol cadangkan.

Alamat server yang berubah dapat membuat browser memakai origin penyimpanan berbeda. Pada mode LAN, gunakan identitas sesi serta cadangan server jika diaktifkan. Perpindahan alamat tidak boleh diam-diam dianggap sebagai hilangnya progres. Jangan menyimpan PIN guru atau data sensitif pada berkas ekspor siswa.

### Kontrak pengiriman hasil
Payload membawa playerId, sessionId, attemptId, missionId, schemaVersion, bukti, respons, dan waktu. Server memvalidasi isi, menyimpan secara transaksional, lalu mengirim respons JSON dengan ok bernilai true dan receiptId jika benar tersimpan. Kegagalan memakai ok bernilai false, kode galat, dan pesan yang dapat dipahami.

Tetapkan kunci unik sessionId bersama attemptId pada penyimpanan server agar kiriman ulang tidak membuat baris ganda. Jika koneksi putus setelah server mungkin menyimpan, klien memakai status Belum Dapat Dipastikan lalu memeriksa receipt atau mengulang dengan ID sama. HTTP 200 saja tidak menjadi bukti penyimpanan sah.

Batas kepercayaan perlu jelas: nilai dari browser dapat diubah oleh pengguna. Untuk laporan resmi, server memvalidasi tindakan atau jawaban sejauh yang dirancang dan guru menelaah hasil; log browser bukan bukti antikecurangan penuh. Server LAN menyimpan basis data pada direktori data pengguna yang dapat ditulis, terpisah dari aset aplikasi.

## Tahap pengembangan dan kebutuhan aset
### Prioritas pelaksanaan
| Tahap | Cakupan | Gerbang selesai |
|---|---|---|
| 1 Irisan awal | Kota kecil, satu avatar, NPC, buku, tas, jurnal, M01, analog dan WASD | Satu misi dapat dimainkan, dipahami, disimpan, dan dilanjutkan pada tiga jenis perangkat |
| 2 Prototipe pembuktian | Kebun dan pos Rimba ringkas; M14 serta logistik air; gerobak, pertumbuhan, perakitan | Tiga pola misi berbeda berfungsi dan tidak dapat diselesaikan hanya dengan membuka kuis |
| 3 Versi kelas | Lima wilayah awal, alat dasar, mode guru, laporan lokal, paket LAN | Satu rangkaian pelajaran diuji di kelas dan akses IFP tervalidasi |
| 4 Perluasan dunia | Laut, Geopark, Antariksa; melengkapi total 20 misi utama dan 24 sampingan | Setiap bab memiliki alur, bukti, umpan balik, dan telaah isi |
| 5 Penyempurnaan | Variasi konten, dasbor, optimasi, aksesibilitas, pengayaan aset | Uji perangkat dan pemulihan data memenuhi kriteria penerimaan |

Lima wilayah awal adalah Kota, Kebun, Rimba, Sungai, dan Bengkel. Laut, Geopark, serta Antariksa menyusul setelah fondasi stabil. Tahap bukan janji durasi kalender; estimasi dibuat setelah irisan awal menunjukkan biaya kerja dan kemampuan perangkat.

### Cakupan irisan awal
Satu blok Kota memiliki sekolah, sungai pendek, rumah warga, dua titik sampel, dan tempat uji. Tersedia satu NPC mentor dan satu warga. Pemain mengumpulkan dua bukti, mencoba satu tindakan, menyimpulkan, lalu melanjutkan progres setelah game dibuka ulang. Tidak perlu membuat seluruh kota untuk membuktikan pengalaman inti.

### Kebutuhan aset awal
Sediakan satu model tubuh balok dengan sekitar enam variasi penampilan, delapan tampilan NPC yang memakai ulang tubuh dasar, paket bangunan modular, pepohonan dan tanaman, serta sekitar 25 alat atau item awal. Aset berkembang sesuai misi, bukan dikumpulkan terlebih dahulu tanpa kebutuhan.

Kendaraan awal adalah gerobak dan sepeda; perahu menyusul pada wilayah Sungai. Hewan awal terdiri atas tiga kelompok ikan, ayam, kelinci, dan beberapa satwa pengamatan. Diagram ilmiah dan instrumen harus tetap terbaca ketika model 3D disederhanakan.

### Struktur paket kerja
Pisahkan modul mesin, data dunia, data misi, kartu pengetahuan, aset, dan dokumentasi. Pertahankan satu sumber kebenaran untuk satuan dan penilaian. Seluruh dunia tidak dipaksakan menjadi satu HTML besar; format satu berkas hanya dipakai bila alat penerapan memang menuntutnya dan sudah terbukti mampu menjalankan irisan awal.

## Pengujian penerimaan dan batas ilmiah
### Target performa awal
Sasaran pengembangan adalah sekitar 30 fps stabil pada HP sekolah yang dipilih dan 45–60 fps pada laptop atau IFP yang memadai. Ini target uji, bukan jaminan. Profil rendah mengurangi resolusi render, bayangan, jumlah NPC, partikel, serta jarak tampak. Adegan hanya memperbarui simulasi aktif yang relevan.

Anggaran awal adegan rendah sekitar 50.000–100.000 segitiga tampak dan kurang dari sekitar 100 draw call, lalu disesuaikan hasil profil. Paket aset awal ditargetkan di bawah sekitar 20 MB terkompresi; wilayah lain dimuat terpisah. Tidak ada batas 25 MB universal yang diasumsikan berlaku untuk semua jalur distribusi.

### Kriteria yang wajib lulus
1. HP dapat menggerakkan analog dan kamera bersamaan tanpa menggulir halaman; melepas sentuhan atau menerima pointercancel menghentikan gerak.
2. Laptop dapat berjalan, berinteraksi, membuka jurnal, dan mengembalikan kamera memakai keyboard serta mouse tanpa pointer lock wajib.
3. IFP dapat menuntaskan misi dengan satu sentuhan tanpa keyboard fisik atau lompatan presisi; tombol dapat dijangkau dan teks terbaca dari posisi kelas.
4. Isi ember 3 L tidak dapat menuangkan 4 L. Wadah tidak melebihi kapasitas, sumber tidak negatif, dan total volume tetap sesuai transaksi.
5. Menebak kesimpulan tanpa data wajib tidak menyelesaikan misi. Salah tindakan memberi jalan memperbaiki percobaan.
6. Memuat ulang melanjutkan misi, jurnal, dan item dengan benar. Hadiah tidak berulang; item penting selalu dapat dipulihkan.
7. Tanaman tidak dihukum karena jeda hari nyata. Membaca materi menjeda tantangan dan tidak menghitung keterlambatan sebagai kegagalan konsep.
8. Semua aset wajib bekerja tanpa internet melalui paket lokal. Koneksi LAN diuji dari perangkat siswa terpisah, bukan hanya localhost guru.
9. Kiriman ganda memakai ID yang sama tidak membuat data ganda. Putus koneksi menampilkan status jujur dan nilai lokal tetap dapat dilihat.
10. Kegagalan WebGL, audio, layar penuh, atau penyimpanan ditangani dengan pesan serta jalur pemulihan yang sesuai.

### Pemeriksaan konsep sebelum rilis
Telaah bahwa fase Bulan tidak tertukar dengan gerhana, kalor tidak disamakan dengan suhu, pesawat sederhana tidak menciptakan energi, dan tekanan hidrostatis bergantung pada kedalaman serta massa jenis pada kondisi yang ditetapkan. Air jernih tidak otomatis aman diminum. Model pewarisan dan pertumbuhan diberi label penyederhanaan. Skenario kebakaran tetap merupakan tugas logistik aman dengan petugas NPC.

## Sumber pemeriksaan dan serah terima
### Bahan yang digunakan
IPA_Materi_Per_Bab_MD.zip memuat 20 bab: tujuh bab kelas VII, enam bab kelas VIII, dan tujuh bab kelas IX. Pemetaan bab dalam dokumen ini mengikuti nama serta cakupan berkas tersebut. Isi akhir kartu, data percobaan, dan soal masih memerlukan penyuntingan serta telaah guru sebelum rilis.

WhatsApp Unknown 2026-10-23 at 20.02.26.zip memuat delapan gambar referensi. Gambar membantu menetapkan arah pengalaman berupa avatar balok, NPC, peta dunia, perairan, dan kontrol sentuh. Gambar adalah referensi, bukan aset yang otomatis memiliki izin untuk disalin ke game.

Prompt_EDU_V5_20_12_Canva_Sheet_Bawaan_dan_Status_Kirim.html memberi konteks rancangan prompt pembelajaran, akses offline, serta pentingnya kontrak API dan status pengiriman yang jujur. Dokumen ini tidak mengubah HTML tersebut dan tidak mengasumsikan semua kemampuan di dalamnya otomatis tersedia di game mandiri.

### Dokumentasi teknis resmi
1. Three.js WebGLRenderer — https://threejs.org/docs/pages/WebGLRenderer.html — dasar pemeriksaan dukungan WebGL 2.
2. MDN requestFullscreen — https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen — layar penuh memerlukan interaksi pengguna dan penanganan kegagalan.
3. W3C Pointer Events — https://www.w3.org/TR/pointerevents/latest/ — dasar penyatuan input mouse, pena, dan sentuhan.
4. MDN Using Service Workers — https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers — syarat konteks aman untuk opsi offline berbasis service worker.

Dokumentasi teknis diperiksa pada 23 Oktober 2026. Rancangan performa, keseimbangan, jumlah aset, data simulasi, bobot nilai, dan durasi misi adalah keputusan desain yang perlu dibuktikan dengan prototipe, bukan angka hasil pengujian.

### Hasil yang disiapkan sebelum pengembangan penuh
Pengembang menyiapkan irisan awal yang dapat dimainkan, daftar misi dan objek berkode stabil, kartu materi yang telah ditelaah, rubrik penilaian, paket aset berlisensi, serta catatan uji perangkat. Setiap aset memiliki sumber dan izin penggunaan. Lisensi buku dan gambar perlu diperiksa sesuai penggunaan; teks ekstraksi lampiran tidak menjadikan ilustrasi pihak ketiga bebas digunakan.

Pemeriksaan kelas menilai apakah siswa memahami tujuan, dapat bergerak tanpa bantuan terus-menerus, menghubungkan data dengan keputusan, serta menyelesaikan aktivitas dalam waktu yang tersedia. Keberhasilan rancangan dibuktikan saat siswa dapat menjelaskan alasan tindakannya dengan konsep IPA setelah bermain.
