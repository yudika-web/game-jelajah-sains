export const marketModules=['A','B','C'] as const;
export type MarketModule=typeof marketModules[number];
export const marketConfig={meltMassG:100,tareG:40,initialIceG:1000,virtualMinutes:20,minimumIceG:750,animationSeconds:3,packageId:'M02-ICE-001',minimumCarryMm:2000} as const;
/** Reference approximations, not one exact density at every temperature. */
export const densitySamples={A:{material:'Es',massG:92,volumeCm3:100},B:{material:'Air cair',massG:100,volumeCm3:100},C:{material:'Es',massG:184,volumeCm3:200}} as const;
/** Deliberately controlled teaching dataset, not product test results. */
export const containerModels={A:{name:'Dinding logam',iceG:200,color:'#8a9fa8'},B:{name:'Dinding plastik',iceG:600,color:'#6ea8ab'},C:{name:'Dinding berinsulasi',iceG:800,color:'#c69d53'}} as const;
export const marketCards={
 matter:{title:'Air Tetap Air',text:'Es mencair menjadi air cair. Molekulnya tetap molekul air. Dalam wadah tertutup tanpa kebocoran dan tanpa penguapan, seluruh isi tetap berada di wadah. Neraca yang sudah ditara menunjukkan massa isi, bukan massa wadah. Titik partikel pada alat adalah model pembesaran, bukan ukuran molekul sebenarnya.'},
 evaporation:{title:'Air Berpindah ke Udara',text:'Air dapat menguap tanpa mendidih. Sebagian air cair pada wadah terbuka berpindah ke udara sebagai gas. Air tidak musnah, tetapi massa air cair yang masih di wadah berkurang. Uap air sebenarnya tidak terlihat. Kabut putih berupa tetes air kecil, bukan gas air yang terlihat.'},
 density:{title:'Massa dan Massa Jenis',text:'Massa jenis membandingkan massa dengan volume sampel: massa dibagi volume. Sampel es besar dapat bermassa lebih besar daripada air cair, tetapi massa per volume tetap lebih kecil. Volume es di alat adalah volume es padat, bukan kapasitas wadah atau tumpukan es bercelah. Angka es dan air cair adalah pendekatan pada kondisi acuan berbeda, bukan nilai tepat pada semua suhu.'},
 needs:{title:'Pesanan dan Uji yang Adil',text:'Pelanggan memerlukan sedikitnya 750 g es padat setelah 20 menit virtual. Bandingkan sistem dinding wadah dengan massa awal, bentuk es, lingkungan, ruang dalam dan tutup yang sama. Insulasi memperlambat masuknya kalor; tidak menghasilkan dingin. Sampel latihan terpisah dari satu paket kiriman. Lama berjalan nyata tidak mengurangi es.'},
} as const;
export type MarketSource=keyof typeof marketCards;
export const marketNote='Model latihan: alat dan sampel visual diperbesar; ukuran layar bukan pengukuran volume. Titik partikel juga diperbesar. Hasil wadah adalah dataset 20 menit virtual, bukan pengukuran produk nyata. Wadah tertutup menahan seluruh air; penguapan dan kebocoran diabaikan pada uji mencair dan penyimpanan.';
export const predictionOptions={melt:{same:'Massa isi tetap 100 g; wujud berubah',less:'Massa berkurang karena es hilang'},evap:{air:'Sebagian air berpindah ke udara',gone:'Air musnah'},container:{more:'Lebih banyak es tersisa daripada A',same:'Sama seperti A',less:'Lebih sedikit es tersisa daripada A'}};
export const marketAnswers={matter:'same-water',open:'gas-to-air',density:'C-less-B',same:'A-equals-C',insulation:'slows-heat',limits:'dataset-only'} as const;
export type MarketAnswers=Record<keyof typeof marketAnswers,string>;
export const marketQuestions={
 matter:{label:'Saat es mencair dalam alat tertutup',options:{vanishes:'Air hilang', 'same-water':'Molekul tetap air; massa isi tetap'}},
 open:{label:'Pada alat penguapan terbuka',options:{constant:'Massa air cair di wadah selalu tetap','gas-to-air':'Sebagian air berpindah ke udara sebagai gas'}},
 density:{label:'C dibanding B',options:{'C-more-B':'Massa lebih besar berarti lebih rapat','C-less-B':'Massa C lebih besar, massa jenisnya lebih kecil'}},
 same:{label:'Massa jenis A dan C',options:{different:'Berbeda karena massanya berbeda','A-equals-C':'Sama pada kondisi model'}},
 insulation:{label:'Dinding berinsulasi',options:{creates:'Menciptakan dingin selamanya','slows-heat':'Memperlambat masuknya kalor'}},
 limits:{label:'Hasil tiga wadah',options:{all:'Berlaku pasti untuk semua produk','dataset-only':'Dataset latihan pada kondisi yang dikendalikan'}},
} as const;
