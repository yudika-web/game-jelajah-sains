export const solidConfig={forceN:400,pressureLimitPa:6000,pathWidthCm:30,modelScale:3,loadId:'forest-observation-load',animationSeconds:2.2} as const;
export const solidModules=['A','B','C'] as const;
export type SolidModule=typeof solidModules[number];
/** Width crosses the path; length always lies parallel to it. */
export const supportSizes:Record<SolidModule,{widthCm:number;lengthCm:number}>={A:{widthCm:20,lengthCm:20},B:{widthCm:20,lengthCm:40},C:{widthCm:40,lengthCm:40}};
export const solidNote='Maket tekanan rata-rata: gaya vertikal alat 400 N, kontak penuh dan merata, penopang kaku mendatar; berat penopang diabaikan. Batas 6 kPa hanya parameter media latihan. Tanah nyata beragam; ini bukan penentuan keamanan bangunan. M16 masih Dalam pengembangan.';
export const solidCards={
 force:{title:'Gaya dan Tekanan Berbeda',text:'Gaya tekan adalah dorongan total pada bidang. Tekanan rata-rata adalah gaya dibagi luas kontak. Dalam latihan, alat virtual memberi gaya tetap 400 N; angka ini bukan berat karakter atau barang tas. Jika gaya sama tersebar pada bidang lebih luas, tekanan rata-ratanya lebih kecil. Kita menganggap kontak penuh, mendatar, dan merata; tekanan puncak tanah nyata tidak dihitung.'},
 area:{title:'Mengapa Luas Kontak Penting?',text:'Ukur lebar dan panjang penopang. Luas persegi panjang adalah lebar dikali panjang. Misalnya 20 cm kali 20 cm menghasilkan 400 cm², bukan 40 cm². Untuk menghitung tekanan dalam pascal, ubah luas ke meter persegi: 1 cm² sama dengan 0,0001 m². Bandingkan penopang dengan gaya dan kondisi awal media yang sama.'},
 needs:{title:'Rancangan Harus Memenuhi Semua Batas',text:'Pos memerlukan penopang dengan tekanan paling tinggi 6 kPa yang muat pada jalur maket selebar 30 cm. Panjang penopang sejajar jalur; lebarnya melintang. Kedua batas berlaku bersamaan. Penopang terbesar belum tentu sesuai. Batas tekanan ini khusus media latihan, bukan kemampuan dukung semua tanah gambut. Setelah tiap uji, angkat beban dan siapkan ulang media.'},
};
export type SolidSource=keyof typeof solidCards;
export const correctSolidAnswers={area:'lower',force:'fixed',choice:'B-both',contact:'full-uniform',real:'model-only'} as const;
export type SolidAnswers=Record<keyof typeof correctSolidAnswers,string>;
