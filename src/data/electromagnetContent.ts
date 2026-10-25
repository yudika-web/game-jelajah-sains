export const materialIds = ['steel','copper','aluminium','plastic'] as const;
export type MaterialId = typeof materialIds[number];
export const materials = {
 steel:{name:'Klip baja feromagnetik',color:'#76878b',lifted:true},
 copper:{name:'Potongan tembaga',color:'#bc7850',lifted:false},
 aluminium:{name:'Potongan aluminium',color:'#bac5ca',lifted:false},
 plastic:{name:'Potongan plastik',color:'#b48a69',lifted:false},
} as const;
export const coilModules = [20,40,60] as const;
export type CoilModule = typeof coilModules[number];
export const coilCapacity = (turns:CoilModule) => ({20:2,40:4,60:6})[turns];
export const controlledCurrentA = .2;
export const clipIds = ['K1','K2','K3','K4','K5','K6'] as const;
export type ClipId = typeof clipIds[number];
export const magnetTerminals = {'I+':'I+ · sumber arus','S1':'S1 · masuk sakelar','S2':'S2 · keluar sakelar','C1':'C1 · masuk kumparan','C2':'C2 · keluar kumparan','I-':'I− · kembali sumber'} as const;
export type MagnetTerminal = keyof typeof magnetTerminals;
export const magnetPairs:[MagnetTerminal,MagnetTerminal][]=[['I+','S1'],['S2','C1'],['C2','I-']];
export const magnetNote='Alat virtual dengan inti besi lunak dan sumber arus terkontrol. Bukan panduan merakit alat listrik rumah. Bab M17 masih Dalam pengembangan.';
export const magnetCards={
 magnet:{title:'Tidak Semua Logam Terangkat',text:'Pada kekuatan dan kondisi magnet model ini, klip baja feromagnetik dapat terangkat. Tembaga, aluminium, dan plastik tidak terangkat oleh magnet pada pengujian ini. Hasil itu bukan klaim bahwa ketiganya sama sekali tidak memiliki respons magnetik. Amati benda dan catat hasil yang benar-benar terlihat, bukan hanya nama “logam”.'},
 bima:{title:'Catatan Kak Bima · Percobaan yang Adil',text:'Bandingkan modul 20, 40, dan 60 lilitan. Alat virtual menjaga arus tetap 0,2 A. Gunakan inti, ukuran kumparan, enam klip baja, posisi awal, jarak pengambilan, dan prosedur yang sama. Hasil berasal dari dataset latihan, bukan hukum umum atau hasil pengukuran energi.'},
 current:{title:'Mengapa Arus Dijaga Tetap?',text:'Sumber arus terkontrol virtual menjaga arus 0,2 A saat modul diganti. Jadi, perubahan lilitan tidak tercampur perubahan arus dalam perbandingan ini. Baterai biasa tidak otomatis menjaga arus tetap ketika lilitan diganti. Model ini mengabaikan magnet sisa pada inti besi lunak, panas, dan perubahan energi; kita belum dapat menilai efisiensi energi.'},
} as const;
export type MagnetSource=keyof typeof magnetCards;
