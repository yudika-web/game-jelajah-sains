export const buoyancyObjects={A:{massG:100,volumeCm3:200,color:'#d7ab4e'},B:{massG:100,volumeCm3:50,color:'#738eaa'},C:{massG:200,volumeCm3:400,color:'#75a075'}} as const;
export type BuoyancyObject=keyof typeof buoyancyObjects;
export type FloatResult='float'|'sink';
export const waterDensity=1;
export const objectDensity=(id:BuoyancyObject)=>buoyancyObjects[id].massG/buoyancyObjects[id].volumeCm3;
export const objectResult=(id:BuoyancyObject):FloatResult=>objectDensity(id)<waterDensity?'float':'sink';
export const densityCard={title:'Massa Jenis dan Gaya Apung',text:'Bandingkan massa dan volume bersama-sama. Massa jenis rata-rata adalah massa dibagi volume. Dalam model ini massa jenis air 1 g/cm³. Benda dengan massa jenis rata-rata lebih kecil terapung; yang lebih besar tenggelam. Contohnya, dua benda dengan massa berbeda dapat berperilaku sama jika perbandingan massa dan volumenya sama. Ini model sederhana, bukan panduan keselamatan berenang.'};
