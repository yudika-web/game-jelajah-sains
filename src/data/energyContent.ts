export const energySources=['solar','wind'] as const;
export type EnergySource=typeof energySources[number];
export const sourceLabels={solar:'Panel surya',wind:'Turbin angin'};
export const sourceConditions={solar:['bright','cloudy','night'],wind:['enough','weak','calm']} as const;
export type SourceCondition='bright'|'cloudy'|'night'|'enough'|'weak'|'calm';
export const conditionLabels={bright:'Terang',cloudy:'Mendung',night:'Malam tanpa pencahayaan lain',enough:'Angin cukup',weak:'Angin lemah',calm:'Angin tenang'};
export const sourceWatts={bright:6,cloudy:2,night:0,enough:5,weak:1,calm:0} as const;
export const scenarios=[{solar:'bright',wind:'calm'},{solar:'cloudy',wind:'calm'},{solar:'night',wind:'enough'}] as const;
export const energyConfig={loadW:4,capacityMWh:8000,initialMWh:2000,intervalMinutes:60} as const;
export type EnergyComponent='solar'|'wind'|'battery'|'load';
export const energyPorts={PV:'PV · panel (+/−)',WT:'WT · turbin (+/−)',BAT:'BAT · penyimpan (+/−)',BUS:'BUS · DC teratur (+/−)',POS:'POS · layanan 4 W (+/−)'} as const;
export type EnergyPort=keyof typeof energyPorts;
export const energyPairs:{a:EnergyPort;b:EnergyPort;component:EnergyComponent}[]=[{a:'PV',b:'BUS',component:'solar'},{a:'WT',b:'BUS',component:'wind'},{a:'BAT',b:'BUS',component:'battery'},{a:'BUS',b:'POS',component:'load'}];
export const energyCards={
 power:{title:'Daya dan Energi',text:'Daya menunjukkan laju pemakaian atau penyediaan energi. Pada model ini, layanan 4 W selama 1 jam memerlukan 4 Wh. W dan Wh berbeda. Satu jam simulasi dipercepat di layar; energi tidak berkurang karena kamu lama membaca. Semua angka adalah parameter latihan, bukan spesifikasi alat nyata.'},
 solar:{title:'Cahaya Menjadi Listrik',text:'Panel surya mengubah energi cahaya menjadi energi listrik. Pilih terang, mendung, atau malam pada alat simulasi. Kondisi tidak mengikuti jam perangkatmu. Pada malam tanpa pencahayaan lain, panel model tidak menyediakan daya. Panel tetap pada penyangga; bukan gerak atau putaran panel yang menghasilkan listrik.'},
 wind:{title:'Angin Menggerakkan Turbin',text:'Angin menggerakkan baling-baling, lalu generator model menyediakan energi listrik. Angin cukup, lemah, dan tenang memberi hasil berbeda. Misalnya, turbin dapat berhenti saat angin tenang. Sumber terbarukan tetap memiliki keterbatasan kondisi. Amati daya pada alat uji sebelum memilih sumber untuk kebutuhan pos.'},
 battery:{title:'Baterai Menyimpan Energi',text:'Baterai tidak menciptakan energi. Energi awal 2 Wh berasal dari pengisian sebelum latihan. Kapasitas penyimpan model adalah 8 Wh, bukan daya 8 W. Sumber melayani beban dahulu; kelebihan dapat disimpan. Saat sumber kurang, baterai dapat memasok kekurangan selama energi tersimpan masih cukup.'},
 needs:{title:'Catatan Kebutuhan Pos',text:'Lampu dan instrumen baru membutuhkan total 4 W pada setiap interval satu jam simulasi. Keduanya harus tetap dilayani; mematikan beban bukan keberhasilan. Gunakan bus DC teratur model yang cocok, bukan menghubungkan tegangan sembarang. Model mengabaikan rugi konversi, rugi penyimpanan, dan pengosongan sendiri; batas daya baterai dianggap mencukupi.'},
} as const;
export type EnergyCard=keyof typeof energyCards;
export const energyNote='Model pembelajaran virtual: bus DC teratur, interval 1 jam simulasi dipercepat. Angka bukan spesifikasi alat nyata atau panduan instalasi rumah. Pengujian sumber tidak mengisi baterai latihan.';
export const wh=(mWh:number)=>`${Number((mWh/1000).toFixed(3)).toLocaleString('id-ID')} Wh`;
