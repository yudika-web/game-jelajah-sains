export type PlaceId = 'nara' | 'warga' | 'book' | 'rain' | 'sampleA' | 'sampleB' | 'barrier';
export interface Place {
  id: PlaceId;
  name: string;
  short: string;
  action: string;
  x: number;
  z: number;
  color: string;
}

export const places: Place[] = [
  { id: 'nara', name: 'Bu Nara · mentor sains', short: 'Bu Nara', action: 'Bicara', x: -4, z: 3, color: '#8d67c8' },
  { id: 'warga', name: 'Pak Wira · warga kota', short: 'Pak Wira', action: 'Bicara', x: 3, z: 6, color: '#e9a251' },
  { id: 'book', name: 'Buku aliran permukaan', short: 'Buku Sains', action: 'Baca', x: -8, z: -3, color: '#527ebe' },
  { id: 'rain', name: 'Catatan hujan & peta lahan', short: 'Catatan hujan', action: 'Baca', x: 4, z: -4, color: '#b47a49' },
  { id: 'sampleA', name: 'Sampel A · dekat lahan terbuka', short: 'Sampel A', action: 'Ambil & ukur', x: 10, z: -1, color: '#c28643' },
  { id: 'sampleB', name: 'Sampel B · titik pembanding', short: 'Sampel B', action: 'Ambil & ukur', x: 10, z: 10, color: '#479ab0' },
  { id: 'barrier', name: 'Jalur limpasan · tempat uji', short: 'Tempat uji', action: 'Uji sedimen', x: 7, z: -10, color: '#64885a' },
];

export const cards = {
  book: {
    title: 'Ke mana air hujan mengalir?',
    text: 'Air hujan yang mengalir di atas permukaan tanah disebut aliran permukaan. Aliran ini dapat membawa partikel tanah ke sungai. Partikel yang tersuspensi membuat air tampak keruh. Kekeruhan saja tidak mengungkap semua zat di dalam air.',
    source: 'Kelas VII · Metode ilmiah · rancangan M01 · draf untuk telaah guru',
  },
  rain: {
    title: 'Catatan lapangan · setelah hujan',
    text: 'Hujan simulasi pukul 09.00. Lahan terbuka berada di dekat titik A; titik B berada di bagian pembanding dengan tepian bervegetasi. Ambil kedua sampel pada sesi pengamatan yang sama. Pada uji berikutnya, pertahankan kondisi hujan agar perbandingan adil.',
    source: 'Kota Sains · peta lahan & catatan hujan simulasi',
  },
};

export const conclusions = [
  { id: 'sediment', text: 'Sedimen dari limpasan berkontribusi pada kekeruhan dalam model. Data ini belum membuktikan air aman diminum.' },
  { id: 'drink', text: 'Air A sekarang lebih jernih, jadi sudah pasti aman diminum.' },
  { id: 'waste', text: 'Semua air keruh pasti disebabkan limbah pabrik.' },
] as const;
