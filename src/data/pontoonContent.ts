export const pontoonConfig={densityKgM3:1000,gravity:10,objectMassKg:2,objectVolumeL:1,springWaterY:.9,springStartY:1.13,emptyMassKg:5,cargoMassKg:15,maxFraction:.75,gateWidthM:1.2,animationSeconds:2,speed:2,waterY:-.175,cargoId:'research-pontoon-equipment',objectId:'spring-test-block'} as const;
export const pontoonModules=['A','B','C'] as const;
export type PontoonModule=typeof pontoonModules[number];
export const pontoonSizes={A:{volumeL:20,widthM:.8},B:{volumeL:30,widthM:1},C:{volumeL:40,widthM:1.4}} as const;
export const immersionConditions=['air','half','full'] as const;
export type Immersion=typeof immersionConditions[number];
export const immersionNames={air:'Di udara',half:'Terendam sebagian',full:'Terendam penuh'} as const;
export const pontoonCards={
 up:{title:'Air Memberikan Gaya ke Atas',text:'Air memberi gaya ke atas pada benda yang memindahkan air. Dalam model air tawar ini, setiap 1 L air yang dipindahkan memberikan gaya apung 10 N. Contohnya, benda yang terendam 0,5 L menerima gaya apung 5 N. Massa jenis air dan gravitasi dibuat tetap; gelombang, kebocoran dan gerak miring diabaikan.'},
 scale:{title:'Berat dan Bacaan Neraca',text:'Berat benda uji tetap 20 N. Ketika benda masih tergantung dengan tali tegang, neraca membaca berat dikurangi gaya apung air. Contohnya, gaya apung 5 N membuat bacaan menjadi 15 N. Berat bendanya tidak berkurang. Jangan menyamakan bacaan neraca dengan berat benda atau gaya apung maksimum suatu wadah.'},
 reserve:{title:'Volume Terendam dan Cadangan Apung',text:'Ponton terapung seimbang memindahkan air sesuai massa totalnya. Pada muatan sama, gaya apung aktual sama dengan berat total, meskipun ukuran ponton berbeda. Contohnya, massa 20 kg memerlukan 20 L air dipindahkan. Sisa volume efektif memberi cadangan apung. Batas keterendaman 75% dan gerbang 1,2 m hanya aturan latihan, bukan standar keselamatan kapal nyata.'},
} as const;
export type PontoonSource=keyof typeof pontoonCards;
export const pontoonNote='Model air tawar: ρ = 1.000 kg/m³, g = 10 m/s². Mengabaikan gelombang, kebocoran, kemiringan dan efek dinamis. Volume efektif adalah volume luar kedap air, bukan ruang barang. Avatar tetap di darat; tidak termasuk massa muatan. Model ini tidak menentukan keselamatan kapal nyata.';
export const correctPontoonAnswers={displaced:'volume',scale:'upward',balance:'weight',maximum:'capacity',design:'B-both',real:'model-only'} as const;
export type PontoonAnswers=Record<keyof typeof correctPontoonAnswers,string>;
