/** SI conversion is explicit in hydraulicModel; centimetres are display units only. */
export const hydraulicConfig = {inputAreaCm2:5, loadN:100, targetCm:5, challengeForceN:50, challengeStrokeCm:12, crateId:'research-supply-crate', animationSeconds:2.2} as const;
export const hydraulicModules = ['A','B','C'] as const;
export type HydraulicModule = typeof hydraulicModules[number];
export const outputAreas:Record<HydraulicModule,number> = {A:5,B:10,C:20};
export const hydraulicNote='Model hidraulik ideal virtual: cairan tidak termampatkan, tanpa kebocoran, gesekan atau massa piston. Gerak kuasistatik; perbedaan tekanan hidrostatis diabaikan. Tambahan tekanan Δp bukan tekanan absolut. Alat tidak menciptakan energi.';
export const hydraulicCards={
 pressure:{title:'Tekanan yang Diteruskan',text:'Tambahan tekanan pada cairan tertutup diteruskan ke piston lain. Gaya bergantung pada tekanan dan luas piston. Pada model ini, luas masukan tetap 5 cm². Luas keluaran dapat diganti saat beban tersangga. Luas bukan diameter: luas lingkaran empat kali berarti diameter dua kali. Δp adalah tambahan tekanan, bukan tekanan absolut awal nol.'},
 tradeoff:{title:'Gaya Lebih Kecil, Gerak Lebih Panjang',text:'Piston keluaran yang lebih luas memerlukan gaya masukan lebih kecil untuk beban sama. Namun, piston masukan perlu bergerak lebih jauh. Volume yang didorong tetap sama: luas dikali gerak. Sebagai contoh, pengurangan gaya diimbangi jarak yang lebih panjang. Dalam model ideal, usaha masukan sama dengan usaha keluaran; alat tidak menciptakan energi.'},
 needs:{title:'Alat Harus Sesuai Kebutuhan',text:'Peti pos memiliki berat 100 N dan harus naik 5 cm. Uji tiga modul dengan beban, luas masukan dan target yang sama. Tantangan memakai penggerak maksimal 50 N dengan gerak maksimal 12 cm. Kedua batas berlaku bersama. Pilih berdasarkan data gaya dan gerak, bukan hanya piston terbesar. Alat nyata juga dapat mengalami gesekan serta kerugian.'},
};
export type HydraulicSource=keyof typeof hydraulicCards;
export const correctHydraulicAnswers={force:'smaller',stroke:'longer',energy:'conserved',limits:'both',real:'losses'} as const;
export type HydraulicAnswers=Record<keyof typeof correctHydraulicAnswers,string>;
