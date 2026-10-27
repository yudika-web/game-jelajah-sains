export const earthLayers=['crust','mantle','outer','inner'] as const;
export type EarthLayer=typeof earthLayers[number];
export const layerInfo={
 crust:{name:'Kerak',state:'Batuan padat di bagian terluar.',color:'#9c7655'},
 mantle:{name:'Mantel',state:'Terutama batuan padat; dapat berubah bentuk dan mengalir sangat lambat dalam waktu geologi.',color:'#c88e58'},
 outer:{name:'Inti luar',state:'Cair.',color:'#e6b657'},
 inner:{name:'Inti dalam',state:'Padat.',color:'#f3db94'},
};
export const plateIds=['divergent','convergent','transform'] as const;
export type PlateId=typeof plateIds[number];
export const plateModels={
 divergent:{name:'Divergen',place:'geoDivergent',motion:'away',phenomenon:'new-crust',description:'Dua lempeng samudra menjauh. Pada model, kerak samudra baru terbentuk di antaranya.',color:'#3b9095'},
 convergent:{name:'Konvergen',place:'geoConvergent',motion:'toward',phenomenon:'trench',description:'Lempeng samudra menunjam di bawah lempeng benua. Terlihat palung dan zona subduksi. Gempa dapat terjadi di zona ini; aktivitas gunung api pada contoh ini berada di atas lempeng yang menunjam. Ini satu contoh; tumbukan dua benua dapat berbeda.',color:'#ae8250'},
 transform:{name:'Transform',place:'geoTransform',motion:'parallel',phenomenon:'offset',description:'Dua lempeng bergeser sejajar batas. Penanda pada kedua sisi bergeser. Gunung api tidak otomatis terbentuk di sini.',color:'#857c9d'},
} as const;
export const motionChoices={away:'Saling menjauh',toward:'Saling mendekat',parallel:'Bergeser sejajar batas'};
export const phenomenonChoices={'new-crust':'Kerak samudra baru','trench':'Palung dan zona subduksi','offset':'Penanda bergeser sejajar'};
export const geoCards={
 layers:{title:'Lapisan Bumi dan Litosfer',text:'Bumi memiliki kerak, mantel, inti luar, dan inti dalam. Mantel terutama batuan padat yang berubah bentuk sangat lambat pada waktu geologi. Inti luar cair, sedangkan inti dalam padat. Lempeng litosfer meliputi kerak dan mantel paling atas yang kaku. Jadi, lempeng bukan rakit yang mengapung di lautan magma.'},
 plates:{title:'Gerak Lempeng yang Berbeda',text:'Batas divergen saling menjauh, konvergen saling mendekat, dan transform bergeser sejajar batas. Pada meja ini kita membandingkan arah geraknya. Contoh konvergen memakai samudra yang menunjam di bawah benua; tumbukan dua benua dapat berbeda. Animasi dipercepat, bukan kecepatan lempeng di alam. Model ini tidak meramalkan gempa berikutnya.'},
 landscape:{title:'Dari Maket ke Bentang Alam',text:'Pada model divergen terbentuk kerak samudra baru. Contoh subduksi memperlihatkan palung, gempa pada zona subduksi, serta aktivitas gunung api di atas lempeng yang menunjam. Transform mempergeser penanda sejajar batas, tanpa gunung api otomatis. Ini pengamatan maket, bukan batuan nyata yang bergerak di depan kita. Warna sampel dekoratif saja belum cukup untuk mengelompokkan batuan.'},
 situation:{title:'Peta Situasi Setelah Guncangan Berhenti',text:'Latihan ini dimulai setelah guncangan simulasi berhenti dan pemandu memberi arahan. Baca legenda serta penanda kondisi. Jalur A dekat bangunan model rusak, C di bawah tebing dengan potensi jatuhan batu, sedangkan B terbuka pada peta latihan. Hindari penghalang bertanda dan ikuti arahan petugas. Peta latihan bukan sertifikasi keamanan lokasi nyata.'},
};
export type GeoSource=keyof typeof geoCards;
export const geoNote='Model disederhanakan; ukuran lapisan tidak berskala. Animasi lempeng dipercepat. Latihan tidak meramal waktu, magnitudo, atau lokasi gempa. Tidak semua gempa menyebabkan tsunami.';
export const geoAnswers={lithosphere:'crust-upper-mantle',mantle:'solid-slow',motion:'three-different',route:'conditions',limits:'simplified'};
export type GeoAnswers=Record<keyof typeof geoAnswers,string>;
