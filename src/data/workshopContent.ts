export const workshopNote = 'Model listrik DC virtual 3 V untuk pembelajaran. Bukan petunjuk memperbaiki instalasi listrik rumah.';
export const workshopCards = {
 loop: { title: 'Jalur Pergi dan Jalur Kembali', text: 'Lampu membutuhkan lintasan tertutup dari sumber, melewati sakelar dan lampu, lalu kembali ke sumber. Kabel pergi saja belum cukup. Pada model 3 V ini, satu kabel putus membuat lampu mati walaupun sumber dan lampu masih berfungsi. Periksa bagian lintasan sebelum memilih komponen pengganti.' },
 switch: { title: 'Apa Fungsi Sakelar?', text: 'Sakelar membuka atau menutup lintasan. Sakelar terbuka membuat lampu mati. Sakelar tertutup hanya dapat menyalakan lampu jika jalur lain lengkap dan komponen sesuai. Contohnya, menutup sakelar tidak mengatasi kabel putus. Setelah perbaikan, buka dan tutup sakelar untuk mengamati perubahan pada lampu model.' },
 inspect: { title: 'Periksa Sebelum Mengganti', text: 'Lampu mati adalah gejala, belum membuktikan baterai habis. Catat uji awal. Buka sakelar dan lepaskan sumber sebelum memeriksa kontinuitas kabel. Uji lampu memakai alat uji komponen virtual terpisah. Pada model ini alat menguji kecocokan lampu 3 V, tanpa menyambungkan kembali sumber rangkaian utama.' },
 notes: { title: 'Catatan gangguan pos', text: 'Lampu pos tidak menyala saat sakelar ditutup. Sumber model berlabel 3 V dan lampu berlabel 3 V. Belum ada komponen diganti. Periksa sumber, sakelar, kabel, dan lampu. Catat lokasi gangguan dari hasil pemeriksaan; jangan menganggap semua lampu mati disebabkan sumber habis.' },
} as const;
export type WorkshopSource = keyof typeof workshopCards;
export const terminals = { 'B+':'B+ · sumber positif', 'B-':'B− · sumber kembali', S1:'S1 · masuk sakelar', S2:'S2 · keluar sakelar', L1:'L1 · masuk lampu', L2:'L2 · kembali lampu' } as const;
export type Terminal = keyof typeof terminals;
export const repairPair = ['S2', 'L1'] as const;
export const hypothesisLabels = { battery:'Sumber mungkin habis', wire:'Lintasan kabel mungkin terputus', lamp:'Lampu mungkin rusak', switch:'Sakelar mungkin terbuka' } as const;
export type CircuitHypothesis = keyof typeof hypothesisLabels;
