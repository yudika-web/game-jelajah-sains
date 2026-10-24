export const fishingSites = ['A', 'B'] as const;
export type FishingSite = typeof fishingSites[number];
export const fishGroups = ['flat', 'long', 'whiskered'] as const;
export type FishGroup = typeof fishGroups[number];
export const fishLabels: Record<FishGroup, string> = { flat: 'Tubuh pipih', long: 'Tubuh memanjang', whiskered: 'Ikan berkumis' };
export const featureLabels = { flat: 'Badan lebar dan pipih', long: 'Badan panjang dan ramping', whiskered: 'Memiliki sungut di sekitar mulut' };
/** Deliberately fixed teaching model, never a population estimate or a random catch. */
export const fishingDataset: Record<FishingSite, readonly FishGroup[]> = { A: ['flat', 'flat', 'long'], B: ['whiskered', 'long', 'whiskered'] };
export const samplingModel = { tool: 'same-rod', bait: 'standard', trials: 'three', duration: 'same-duration', session: 'same-session', factor: 'location' } as const;
export const riverCards = {
  observation: { title: 'Apa yang Bisa Diamati?', text: 'Amati bentuk tubuh dan bagian yang terlihat pada ikan model. Contohnya, sungut tampak sebagai garis di sekitar mulut. Catat ciri yang benar-benar terlihat, lalu kelompokkan dengan aturan yang sama. Kelompok pipih, memanjang, dan berkumis adalah kategori latihan, bukan klasifikasi taksonomi lengkap. Informasi makanan dari buku bukan hasil pengukuranmu.' },
  procedure: { title: 'Membandingkan Dua Tempat', text: 'Bandingkan lokasi dengan prosedur yang sama: satu alat pancing, umpan standar, tiga percobaan per titik, durasi model yang sama, dan satu sesi virtual. Contohnya, mengganti umpan hanya di B membuat perbedaan hasil sulit dijelaskan. Durasi dan sesi adalah kondisi model pembelajaran, bukan jam perangkat. Lokasi menjadi faktor yang dibandingkan.' },
  limits: { title: 'Sampel Bukan Seluruh Populasi', text: 'Tiga pengamatan hanya memberikan catatan sampel kecil. Contohnya, dua ikan pipih di A tidak berarti seluruh sungai didominasi ikan pipih. Ikan yang tidak tercatat mungkin tetap ada. Model ini memakai urutan latihan yang ditetapkan, bukan sampling alam. Perbedaan sampel belum membuktikan jumlah populasi, kebersihan lokasi, atau penyebab perbedaannya.' },
};
export type RiverSource = keyof typeof riverCards;
export const riverModelNote = 'Urutan ikan ditetapkan untuk model latihan, bukan hasil sampling alam. Kelompok ini kategori ciri sederhana. Sampel kecil tidak menentukan populasi, kebersihan, atau penyebab perbedaan.';
/** Same silhouettes as the local 3D models, with visible shape and whiskers. */
export function fishIllustration(group: FishGroup) {
  const flat = group === 'flat', whiskered = group === 'whiskered', color = flat ? '#d5a447' : whiskered ? '#687b92' : '#64a093';
  return `<svg class="fish-illustration" viewBox="0 0 260 120" role="img" aria-label="Model ikan: amati bentuk badan dan bagian di sekitar mulut"><path d="M68 60 24 28v64Z" fill="${color}"/><ellipse cx="135" cy="60" rx="${flat?66:85}" ry="${flat?43:whiskered?25:18}" fill="${color}"/><path d="m110 ${flat?20:43} 22-17 22 17" fill="#47716b"/><circle cx="${flat?176:200}" cy="52" r="5" fill="#173e38"/>${whiskered?'<path d="m213 62 32-15m-32 19 33 12m-39-9 15 23" fill="none" stroke="#334c60" stroke-width="3"/>':''}</svg>`;
}
