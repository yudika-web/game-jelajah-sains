export const organismIds=['phyto','zoo','grazer','hunter','predator'] as const;
export type OrganismId=typeof organismIds[number];
export const organisms:Record<OrganismId,{name:string;short:string;role:'producer'|'consumer';feature:string;food:string;place:'planktonScope'|'underwaterWindow'|'coastFishPoint';color:string}>={
 phyto:{name:'Fitoplankton',short:'Fitoplankton',role:'producer',feature:'Bintik hijau pada pembesaran',food:'Memanfaatkan cahaya untuk menghasilkan bahan organik; bukan memakan Matahari.',place:'planktonScope',color:'#65ad64'},
 zoo:{name:'Zooplankton',short:'Zooplankton',role:'consumer',feature:'Bentuk kecil bening dengan antena pada pembesaran',food:'Memakan fitoplankton dalam model.',place:'planktonScope',color:'#ddb575'},
 grazer:{name:'Ikan pemakan fitoplankton',short:'Ikan F',role:'consumer',feature:'Ikan pipih berwarna kuning',food:'Memakan fitoplankton dalam model.',place:'underwaterWindow',color:'#e6b14b'},
 hunter:{name:'Ikan pemakan zooplankton',short:'Ikan Z',role:'consumer',feature:'Ikan kecil memanjang berwarna biru',food:'Memakan zooplankton dalam model.',place:'underwaterWindow',color:'#4d99c0'},
 predator:{name:'Ikan predator',short:'Predator',role:'consumer',feature:'Ikan lebih besar dengan ekor bercabang',food:'Memakan ikan F dan ikan Z dalam model.',place:'coastFishPoint',color:'#c77c77'},
};
export const foodLinks=[['phyto','zoo'],['phyto','grazer'],['zoo','hunter'],['grazer','predator'],['hunter','predator']] as const;
export const validFoodLink=(from:OrganismId,to:OrganismId)=>foodLinks.some(([a,b])=>a===from&&b===to);
export const coastalCards={
 energy:{title:'Energi dalam Ekosistem',text:'Produsen seperti fitoplankton memanfaatkan energi cahaya untuk menghasilkan bahan organik. Konsumen memperoleh energi melalui makanan. Contohnya, energi berpindah dari fitoplankton ke zooplankton ketika dimakan. Panah menunjuk dari makanan menuju pemakannya. Energi diteruskan dan sebagian tersebar sebagai panas, bukan berputar kembali seperti daur materi. Matahari bukan organisme atau makanan yang langsung dimakan ikan.'},
 food:{title:'Siapa Memakan Siapa?',text:'Catatan peneliti memberi informasi makanan dalam model: zooplankton dan ikan F memakan fitoplankton; ikan Z memakan zooplankton. Predator memakan ikan F maupun ikan Z. Dua rantai ini terhubung menjadi jaring makanan. Bentuk tubuh saja tidak membuktikan makanan ikan. Kelompok ini menyederhanakan latihan, bukan aturan bahwa semua ikan nyata hanya memiliki makanan tersebut.'},
 limits:{title:'Sampel Pengamatan dan Batas Model',text:'Lima kelompok yang kita catat belum mencakup seluruh perairan pesisir. Pengurai dan banyak hubungan lain belum dimasukkan. Mangrove di sekitar pos memberi pengantar habitat, sedangkan jaring ini memodelkan perairan pesisir. Jika ikan Z berkurang, satu jalur makanan predator melemah, tetapi ikan F masih tersedia. Kita belum dapat memastikan besarnya perubahan populasi predator dari skenario ini.'},
} as const;
export type CoastalSource=keyof typeof coastalCards;
export const coastalNote='Model pembelajaran lima kelompok; informasi makanan berasal dari buku dan catatan peneliti. Skenario gangguan bukan pengukuran populasi. Laut tidak dibuka untuk berenang bebas atau menyelam.';
export const correctCoastalAnswers={food:'one-less',alternative:'still-available',population:'not-enough',energy:'food-to-eater',limit:'partial-model'} as const;
export type CoastalAnswers=Record<keyof typeof correctCoastalAnswers,string>;
