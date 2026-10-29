# Aset W08 — tahap visual 04

Diperiksa 29 Oktober 2026 (Asia/Bangkok).

- **Garis pantai daratan**: Natural Earth, dataset `ne_110m_land` 1:110m. [GeoJSON yang berhasil diunduh](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson). Salinan sumber: `scripts/data/ne_110m_land.geojson`.
- **Lisensi**: [LICENSE.md yang berhasil dibaca](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/LICENSE.md), berjudul “Everything here is public domain.” Salinan lengkap: [natural-earth-license.md](natural-earth-license.md). Data boleh dimodifikasi/digunakan/didistribusikan. Kredit: Made with Natural Earth; Tom Patterson, Nathaniel Vaughn Kelso dan kontributor.
- **earth.png**: rasterisasi lokal dari koordinat daratan di atas, palet stylized buatan proyek. Warna bukan pengukuran elevasi, vegetasi, suhu atau musim. Tidak menampilkan batas negara. Resolusi 1024×512; pulau kecil mungkin tidak terwakili pada resolusi 1:110m.
- **clouds.png**: ilustrasi awan prosedural orisinal, bukan data cuaca. Digabung dalam shader permukaan Bumi, bukan lapisan bola transparan tambahan.
- **moon.png**: maria dan kawah ilustratif prosedural orisinal. Bukan foto, peta kawah bernama, atau pengukuran topografi Bulan.
- Matahari, halo, atmosfer, bintang, label dan geometri stasiun dibuat lokal oleh kode proyek. Tidak memakai gambar NASA atau aset dari CDN.

Generator: `python3 scripts/generate-space-surfaces.py` (Pillow hanya diperlukan pengembang untuk membangun ulang PNG, bukan dependensi game/pemain). Hasilnya disimpan pada `public/assets/space/` dan disalin Vite ke build. Tidak ada permintaan internet saat bermain. [Status akses dan hash sumber](../evidence/visual-stage-04/source-access.json).
