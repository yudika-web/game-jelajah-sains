export const irrigationPoints=['P1','P2','P3'] as const;
export type IrrigationPoint=typeof irrigationPoints[number];
export type FlowCondition='blocked'|'clear';
export const irrigationModel={supplyMlPerMinute:20000,blockedBranchMlPerMinute:4000,clearBranchMlPerMinute:12000,durationSeconds:30,containerCapacityMl:12000} as const;
export function flowBalance(condition:FlowCondition){const branch=condition==='clear'?irrigationModel.clearBranchMlPerMinute:irrigationModel.blockedBranchMlPerMinute,incoming=irrigationModel.supplyMlPerMinute;return{incoming,irrigation:branch,main:incoming-branch};}
export function sampleVolume(point:IrrigationPoint,condition:FlowCondition,seconds=30){const q=point==='P1'?irrigationModel.supplyMlPerMinute:flowBalance(condition).irrigation;return q*seconds/60;}
export const irrigationCards={
 flow:{title:'Debit: Banyak Air dalam Waktu Tertentu',text:'Debit menyatakan volume air yang melewati suatu titik dalam waktu tertentu. Contohnya, pasokan model 20 L per menit menghasilkan 10 L selama 30 detik simulasi. Alat penampung ukur virtual berkapasitas 12 L. Kapasitas alat berbeda dari volume hasil pengukuran. Angka hanya berlaku untuk saluran latihan, bukan debit seluruh sungai.'},
 duration:{title:'Mengapa Durasi Harus Sama?',text:'Bandingkan volume dengan durasi yang sama. Contohnya, 2 L dan 6 L yang terkumpul selama 30 detik menunjukkan aliran berbeda. Jika durasinya berbeda, volume saja belum cukup untuk membandingkan debit. Setiap pengukuran memakai alat sampling virtual tersendiri. Animasi dipercepat; detik simulasi berbeda dari waktu nyata pemain.'},
 barrier:{title:'Hambatan dan Pembagian Aliran',text:'Pada percabangan, air terbagi antara saluran irigasi dan jalur utama. Hambatan dapat membatasi aliran ke cabang. Contohnya, dalam model ini pasokan tetap, tetapi bagian yang masuk cabang dapat berubah setelah hambatan dibersihkan. Air lainnya diteruskan ke jalur utama. Saringan ini bukan alat untuk membuktikan air aman diminum.'},
 notes:{title:'Catatan Pengelola Irigasi',text:'Pasokan model diatur tetap 20 L per menit. Pengelola melaporkan air ke kebun berkurang. Ada tiga dugaan: pasokan berkurang, hambatan saluran, atau kehilangan air sepanjang jalur. Catat kondisi awal sebelum memilih tindakan. Gunakan durasi sampling sama pada tiga titik, lalu ukur lagi setelah tindakan. Laporan ini informasi pengelola, bukan hasil pengukuranmu.'},
};
export type IrrigationSource=keyof typeof irrigationCards;
export const irrigationNote='Model saluran latihan terpisah dari air Rimba/Kebun. Angka hanya berlaku untuk saluran latihan, bukan debit seluruh sungai. Hasil tidak membuktikan air aman diminum.';
