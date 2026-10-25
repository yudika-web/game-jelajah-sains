export const pressureConfig={densityKgM3:1025,gravityMS2:10,surfaceY:-.175,sensorOffsetY:.12,cameraYawOffset:-.9,horizontalSpeed:2.5,verticalSpeed:1.5,radius:.9,halfHeight:.45,maxDepth:9.5,stationRange:1.4,readingTolerance:.04} as const;
export const pressurePoints={A2:{x:7,z:-5,depth:2,location:'A'},A4:{x:7,z:-5,depth:4,location:'A'},A8:{x:7,z:-5,depth:8,location:'A'},B4:{x:13,z:-7,depth:4,location:'B'}} as const;
export type PressurePoint=keyof typeof pressurePoints;
export const pressurePointIds=Object.keys(pressurePoints) as PressurePoint[];
export const rovDock={x:5,z:4,depth:0} as const;
export const pressureCards={
 water:{title:'Tekanan Air Akibat Kedalaman',text:'Sensor membaca tekanan air di luar robot. Semakin dalam sensor, semakin besar tekanan tambahan akibat kolom air di atasnya. Model memakai massa jenis air laut tetap 1.025 kg/m³ dan gravitasi 10 m/s². Tekanan ini relatif terhadap permukaan. Angka 0 kPa tambahan di permukaan tidak berarti tekanan total di sana nol.'},
 plan:{title:'Catatan Rencana Pengukuran',text:'Bandingkan kedalaman 2, 4, dan 8 meter di lokasi A. Setelah itu, bandingkan A4 dengan B4 yang sama-sama berkedalaman 4 meter. Pertahankan massa jenis dan kondisi air tenang. Jarak mendatar dari pantai bukan penentu tunggal tekanan. Stabilkan robot, baca indikator, lalu catat. Semua titik menggunakan sensor dan asumsi model yang sama.'},
} as const;
export type PressureSource=keyof typeof pressureCards;
export const pressureNote='Model tekanan tambahan relatif terhadap permukaan, bukan tekanan absolut, kabin, atau tubuh manusia. Massa jenis tetap dan air tenang adalah asumsi latihan. M16 baru episode E1; S17 tidak otomatis selesai.';
export const correctPressureAnswers={depth:'increases',double:'twice',same:'equal-depth',horizontal:'not-alone',assumption:'fixed-still'} as const;
export type PressureAnswers=Record<keyof typeof correctPressureAnswers,string>;
