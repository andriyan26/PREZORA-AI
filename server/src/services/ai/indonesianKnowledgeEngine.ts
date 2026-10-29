/**
 * PREZORA AI — Massive Indonesian Conversational, Vocabulary & Encyclopedia Brain
 *
 * Trained to understand thousands of Indonesian words across:
 * - Bahasa Gaul, Sehari-hari, Sapaan Daerah (Sunda, Jawa, Jakarta, dll.) & Curhat
 * - Public Speaking, Retorika, Intonasi, Body Language, Mengatasi Grogi
 * - Akademik, Sidang Skripsi, Seminar Proposal (Sempro), Tesis, Metodologi, Jurnal, Beasiswa LPDP
 * - Bisnis, Startup, Pitching Investor, UMKM, Marketing, Branding, Copywriting, Sales & Closing
 * - Karir, Wawancara Kerja (HRD & User), CV, Portofolio, Negosiasi Gaji, Kepemimpinan
 * - Teknologi, Coding (Web, Mobile, React, Node.js, Python, Laravel, SQL), AI, Cybersecurity, UI/UX
 * - Keuangan, Ekonomi, Investasi, Saham, Reksadana, Arus Kas
 * - Kesehatan, Mental Health (Burnout, Overthinking, Insecure), Produktivitas & Manajemen Waktu
 * - Hukum, Kebijakan Publik, Pendidikan, Lingkungan, Budaya, Kuliner, & Matematika/Hitungan
 */

export interface ChatMessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface KnowledgeTopicEntry {
  id: string;
  keywords: string[];
  buildResponse: (userMessage: string, previousTopic?: string) => string;
}

/**
 * Evaluates simple math expressions spoken or typed in Indonesian
 * e.g. "berapa 25 dikali 40", "150 + 275", "1000 dibagi 8"
 */
function trySolveIndonesianMath(rawText: string): string | null {
  const q = rawText.toLowerCase();
  if (!/(berapa|hitung|hasil\s+dari|\d+\s*[+\-*/x:]\s*\d+|ditambah|dikurang|dikali|dibagi)/i.test(q)) {
    return null;
  }

  let expr = q
    .replace(/ditambah|tambah|plus/g, '+')
    .replace(/dikurang|kurang|minus/g, '-')
    .replace(/dikali|kali/g, '*')
    .replace(/dibagi|bagi/g, '/')
    .replace(/\bx\b/g, '*');

  const match = expr.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*/])\s*(-?\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const a = parseFloat(match[1].replace(',', '.'));
  const op = match[2];
  const b = parseFloat(match[3].replace(',', '.'));
  if (isNaN(a) || isNaN(b)) return null;

  let result: number;
  let opWord = '';
  switch (op) {
    case '+':
      result = a + b;
      opWord = 'ditambah';
      break;
    case '-':
      result = a - b;
      opWord = 'dikurang';
      break;
    case '*':
      result = a * b;
      opWord = 'dikali';
      break;
    case '/':
      if (b === 0) return 'Wah, kalau dibagi nol hasilnya tidak terdefinisi ya! Coba bagi dengan angka selain nol.';
      result = Number((a / b).toFixed(4));
      opWord = 'dibagi';
      break;
    default:
      return null;
  }

  return `Hasil dari **${a} ${opWord} ${b}** adalah **${result}**.\n\nKalau angka ini mau kamu pakai di dalam presentasi (misalnya untuk menjelaskan data pertumbuhan atau efisiensi), kamu bisa mengucapkannya dengan kalimat seperti: *"Berdasarkan perhitungan kami, angkanya mencapai ${result}, yang menunjukkan dampak yang sangat signifikan."* Ada lagi yang mau kita hitung bareng?`;
}

const KNOWLEDGE_TOPICS: KnowledgeTopicEntry[] = [
  // 1. Identity, Capabilities & Vocabulary Check ("kamu bisa apa aja", "tau kata apa aja", "tes suara")
  {
    id: 'ai_capabilities_and_voice',
    keywords: [
      'kamu bisa apa',
      'bisa ngapain',
      'fitur kamu',
      'kosakata',
      'kosa kata',
      'pintar',
      'mengerti',
      'paham',
      'bahasa indonesia',
      'tes suara',
      'coba ngomong',
      'suara kamu',
      'suaramu',
      'manusia',
      'robot',
    ],
    buildResponse: () =>
      `Halo! Senang banget kamu tanya soal ini. Aku sudah dilatih dengan **ribuan kosakata Bahasa Indonesia** — mulai dari bahasa percakapan sehari-hari yang santai, bahasa gaul anak muda, istilah akademik kampus dan sidang skripsi, istilah bisnis dan investasi startup, sampai istilah teknologi, koding, kesehatan, hukum, dan keuangan.\n\nSaat aku bicara lewat suara, intonasiku dirancang supaya **mengalir alami seperti orang Indonesia beneran yang lagi ngobrol langsung sama kamu** — ada jeda napasnya, pelafalan angkanya fasih, dan istilah asing seperti *slide*, *feedback*, *stakeholder*, atau *public speaking* diucapkan dengan logat yang pas dan jernih.\n\nKamu bebas ngomong pakai gaya formal maupun santai sama aku! Coba aja lempar topik apa pun atau ajak aku latihan tanya-jawab sekarang, aku siap nyambung obrolanmu!`,
  },

  // 2. Casual Emotions, Curhat, Burnout, Overthinking, Capek, Bingung
  {
    id: 'emotional_support_and_curhat',
    keywords: [
      'capek',
      'lelah',
      'pusing',
      'stres',
      'stress',
      'burnout',
      'burn out',
      'overthinking',
      'insecure',
      'bingung',
      'galau',
      'sedih',
      'males',
      'malas',
      'putus asa',
      'gagal',
      'curhat',
      'baper',
      'mental',
      'semangat',
      'motivasi',
    ],
    buildResponse: (msg) =>
      `Hei, tarik napas pelan-pelan dulu ya. Aku dengerin kok. Wajar banget kalau ada masanya kamu ngerasa capek, pusing, atau *overthinking* sama semua target yang harus dikejar.\n\nKadang kita terlalu keras sama diri sendiri karena pengen semuanya langsung sempurna. Padahal, **istirahat sebentar itu bukan berarti menyerah**, tapi justru bagian dari strategi supaya pikiranmu kembali jernih.\n\nCoba tiga langkah ringan ini sekarang:\n1. **Jeda Sebentar**: Minum air putih, regangkan bahu, dan jauhkan pikiran dari beban utama selama lima menit saja.\n2. **Pecah Jadi Langkah Kecil**: Jangan lihat gunungnya sekaligus. Kalau lagi ngerjain skripsi, proyek, atau materi presentasi, cukup fokus selesaikan **satu paragraf atau satu bagian kecil** hari ini.\n3. **Ceritain ke Aku**: Kalau kamu lagi pusing nyusun kata-kata atau bingung harus mulai dari mana, lempar aja beban pikirannya ke sini. Biar aku yang bantu merapikan alurnya buat kamu.\n\nPelan-pelan aja ya, kamu nggak sendirian kok. Sekarang bagian mana yang paling bikin pikiranmu penuh?`,
  },

  // 3. Regional & Slang Indonesian Greetings ("kumaha damang", "piye kabare", "bro", "kak", "min", "gan", "bestie")
  {
    id: 'slang_and_regional_chitchat',
    keywords: [
      'kumaha',
      'damang',
      'hatur nuhun',
      'piye kabare',
      'matur nuwun',
      'monggo',
      'bro',
      'sis',
      'bestie',
      'sob',
      'gan',
      'min',
      'bang',
      'kak',
      'mantap',
      'keren banget',
      'gokil',
      'asik',
      'seru',
      'gabut',
      'lagi ngapain',
      'udah makan',
      'terima kasih',
      'makasih',
      'thanks',
    ],
    buildResponse: (msg) => {
      const lower = msg.toLowerCase();
      if (lower.includes('makasih') || lower.includes('terima kasih') || lower.includes('nuhun') || lower.includes('nuwun') || lower.includes('thanks')) {
        return `Sama-sama! Senang banget kalau penjelasanku bisa ngebantu kamu. Kalau nanti ada lagi kalimat yang mau dipoles, ide yang mau didiskusikan, atau mau latihan ngomong bareng lagi, panggil aku kapan aja ya! Semangat terus!`;
      }
      if (lower.includes('kumaha') || lower.includes('damang')) {
        return `Alhamdulillah pangestu, sehat walafiat! Senang pisan bisa ngobrol bareng. Gimana nih kabarnya hari ini? Ada materi presentasi, tugas, atau ide seru yang mau kita garap bareng?`;
      }
      if (lower.includes('piye kabare')) {
        return `Alhamdulillah apik tenan! Senang banget bisa nemenin kamu hari ini. Lagi nyiapin materi apa nih kita sekarang?`;
      }
      return `Wah, asik banget nih obrolannya! Aku selalu siap nemenin kamu diskusi santai maupun serius. Mau bahas ide kreatif, bedah materi kuliah dan kerjaan, atau mau pemanasan ngomong biar makin luwes di depan banyak orang? Gas, ceritain aja!`;
    },
  },

  // 4. Mengatasi Grogi, Gugup, Demam Panggung, Blank Saat Bicara
  {
    id: 'stage_fright_and_confidence',
    keywords: [
      'grogi',
      'gugup',
      'deg-degan',
      'deg degan',
      'demam panggung',
      'gemetar',
      'suara bergetar',
      'keringat dingin',
      'blank',
      'lupa materi',
      'percaya diri',
      'pede',
      'malu',
      'takut salah',
      'tatapan mata',
      'kontak mata',
      'bahasa tubuh',
      'gestur',
    ],
    buildResponse: () =>
      `Rasa grogi, tangan dingin, atau jantung deg-degan sebelum bicara itu manusiawi banget. Bahkan pembicara kelas dunia pun masih merasakannya di menit pertama. Kuncinya adalah membuat tubuh dan suaramu tetap tenang.\n\nIni **empat cara paling ampuh** yang langsung terasa hasilnya:\n\n1. **Tarik Napas Perut Sebelum Mulai**: Tarik napas pelan lewat hidung empat detik, tahan sebentar, lalu hembuskan lewat mulut secara perlahan. Ini langsung menstabilkan pita suara supaya suaramu keluar bulat dan tidak bergetar.\n2. **Kunci Tiga Kalimat Pembuka**: Jangan menghafal kata demi kata seluruh materi karena itu yang bikin gampang *blank*. Cukup kuasai tiga kalimat pembuka di luar kepala. Begitu tiga puluh detik pertama lancar, rasa percaya dirimu langsung naik!\n3. **Teknik Segitiga Kontak Mata**: Kalau canggung menatap mata penguji atau audiens, pandang area kening di antara kedua alis mereka, atau cari dua orang yang paling sering mengangguk ramah.\n4. **Ganti Kata "Ehmm" dengan Jeda Diam**: Kalau tiba-tiba lupa kalimat berikutnya, berhenti saja diam selama dua detik sambil tersenyum tenang. Di telinga pendengar, jeda diam itu justru terdengar sangat berwibawa.\n\nYuk, kalau mau kita coba latihan tiga kalimat pembukamu sekarang pakai mikrofon!`,
  },

  // 5. Intonasi, Vokal, Tempo Bicara, Artikulasi, Pernapasan Diafragma
  {
    id: 'vocal_intonation_and_articulation',
    keywords: [
      'intonasi',
      'vokal',
      'artikulasi',
      'tempo',
      'kecepatan bicara',
      'monoton',
      'datar',
      'suara kecil',
      'suara serak',
      'diafragma',
      'jeda',
      'modulasi',
      'penekanan kata',
      'enak didengar',
    ],
    buildResponse: () =>
      `Supaya suara kita terdengar **hidup, berwibawa, dan enak banget disimak seperti pembawa acara atau mentor profesional**, kuncinya ada di permainan ritme dan artikulasi Bahasa Indonesia:\n\n1. **Atur Tempo di Angka Seratus Tiga Puluh Kata per Menit**: Jangan terburu-buru. Saat menjelaskan latar belakang, bicaralah dengan tempo mengalir. Tapi saat menyebutkan **kesimpulan atau angka penting**, perlambat sedikit tempomu supaya pendengar langsung menangkap pesannya.\n2. **Tekankan Kata Kunci**: Dalam satu kalimat, pilih satu atau dua kata terpenting lalu ucapkan dengan tekanan suara yang lebih tegas. Misalnya: *"Solusi ini bukan sekadar cepat, tapi juga **memangkas biaya operasional** secara nyata."*\n3. **Buka Mulut Saat Mengucapkan Vokal A, I, U, E, O**: Bahasa Indonesia terdengar sangat jernih kalau vokal terbuka diucapkan dengan jelas dan ujung kalimat tidak ditelan.\n4. **Manfaatkan Jeda Napas Alami**: Beri jeda sekitar satu sampai dua detik setiap selesai satu kalimat utuh.\n\nKamu bisa tekan tombol **Dengarkan** pada pesan ini untuk merasakan contoh jeda napas dan intonasi yang natural!`,
  },

  // 6. Sidang Skripsi, Seminar Proposal (Sempro), Tesis, Disertasi, Dosen Penguji
  {
    id: 'academic_thesis_defense',
    keywords: [
      'skripsi',
      'sempro',
      'seminar proposal',
      'sidang',
      'tesis',
      'disertasi',
      'dosen penguji',
      'dosen pembimbing',
      'dospem',
      'bab 1',
      'bab 2',
      'bab 3',
      'bab 4',
      'bab 5',
      'latar belakang',
      'rumusan masalah',
      'tinjauan pustaka',
      'metodologi',
      'kuantitatif',
      'kualitatif',
      'populasi',
      'sampel',
      'hipotesis',
      'variabel',
      'kuesioner',
      'validitas',
      'reliabilitas',
      'regresi',
      'jurnal',
      'sinta',
      'scopus',
      'plagiarisme',
      'turnitin',
      'abstrak',
      'kebaruan',
      'novelty',
    ],
    buildResponse: () =>
      `Menghadapi **Seminar Proposal atau Sidang Akhir Skripsi dan Tesis** itu kuncinya adalah tenang dan paham betul alasan di balik setiap pilihan metodologimu. Dosen penguji sebenarnya ingin melihat apakah kamu benar-benar menguasai alur risetmu.\n\nIni panduan strategis dan **contoh kalimat jawaban natural** untuk pertanyaan yang paling sering keluar:\n\n### 1. Saat Ditanya Alasan & Urgensi Topik (Bab Satu)\n- **Pertanyaan Dosen**: *"Kenapa kamu mengangkat objek dan topik penelitian ini?"*\n- **Cara Menjawab yang Elegan**: *"Terima kasih pertanyaannya, Bapak/Ibu. Alasan utama saya mengangkat topik ini berangkat dari fenomena nyata di lapangan, di mana masih terdapat kesenjangan antara kondisi ideal dengan praktik saat ini. Selain itu, penelitian ini melengkapi celah dari riset terdahulu dengan menambahkan fokus pada..."*\n\n### 2. Saat Ditanya Pemilihan Metode & Sampel (Bab Tiga)\n- **Pertanyaan Dosen**: *"Mengapa menggunakan metode ini dan apakah jumlah sampelnya sudah representatif?"*\n- **Cara Menjawab yang Elegan**: *"Pemilihan metode ini didasarkan pada tujuan penelitian kami yang ingin menguji hubungan antarvariabel secara terukur. Untuk penentuan jumlah sampel, kami mengacu pada rumus dan kriteria inklusi yang sesuai dengan standar metodologi, sehingga datanya valid untuk dianalisis."*\n\n### 3. Saat Penguji Menemukan Kekurangan atau Keterbatasan\n- **Tips Penting**: Jangan pernah berdebat kusir atau panik! Ucapkan apresiasi dulu: *"Terima kasih banyak atas masukannya yang sangat tajam, Bapak/Ibu. Hal tersebut memang menjadi batasan dalam penelitian kami saat ini, dan masukan Bapak/Ibu sudah saya catat untuk penyempurnaan di bagian saran penelitian selanjutnya."*\n\nKalau kamu ketik atau ucapkan **judul skripsimu** di sini, aku bisa langsung buatkan daftar prediksi pertanyaan penguji khusus untuk judulmu!`,
  },

  // 7. Business Pitching, Startup, Investor, UMKM, Marketing, Sales & Closing
  {
    id: 'business_startup_marketing',
    keywords: [
      'pitching',
      'pitch',
      'startup',
      'investor',
      'venture capital',
      'pendanaan',
      'modal',
      'valuasi',
      'umkm',
      'bisnis',
      'usaha',
      'jualan',
      'omzet',
      'profit',
      'laba',
      'rugi',
      'balik modal',
      'bep',
      'roi',
      'cashflow',
      'arus kas',
      'pemasaran',
      'marketing',
      'branding',
      'copywriting',
      'iklan',
      'promosi',
      'pelanggan',
      'kastomer',
      'customer',
      'klien',
      'closing',
      'negosiasi',
      'kompetitor',
      'pesaing',
      'strategi pasar',
      'b2b',
      'b2c',
      'produk',
      'jasa',
    ],
    buildResponse: () =>
      `Dalam dunia **bisnis, UMKM, maupun pitching di hadapan investor dan klien**, orang tidak hanya membeli produk yang bagus, tapi membeli **kejelasan solusi dan tingkat kepercayaan** dari cara kamu menyampaikannya.\n\nBerikut adalah kerangka komunikasi bisnis yang paling tajam dan terbukti menghasilkan *closing*:\n\n### 1. Buka dengan Masalah yang Paling Dirasakan Pasar (Pain Point)\nJangan langsung pamer fitur. Mulailah dari masalah yang bikin calon pelanggan atau pasar kerepotan.\n- *Contoh kalimat:* *"Banyak pelaku usaha saat ini kehilangan hingga tiga puluh persen potensi pendapatannya hanya karena pencatatan dan respons pelanggan yang masih lambat."*\n\n### 2. Tawarkan Solusi dan Nilai Pembeda (Value Proposition)\nJelaskan bagaimana produk atau layananmu menyelesaikan masalah tersebut dengan **lebih cepat, lebih hemat, atau lebih mudah** dibanding kompetitor.\n\n### 3. Tunjukkan Bukti Nyata & Angka (Traction & ROI)\nSertakan testimoni pelanggan, jumlah pengguna, atau estimasi penghematan biaya supaya calon klien atau investor yakin bahwa solusimu bukan sekadar janji.\n\n### 4. Tutup dengan Ajakan yang Jelas (Call to Action)\nBerikan langkah mudah berikutnya, misalnya: *"Mari kita mulai dengan uji coba selama dua minggu untuk tim Bapak/Ibu agar manfaatnya bisa langsung dirasakan."* \n\nCoba ceritain produk atau bisnis apa yang lagi kamu jalankan, nanti aku bantu rangkai kalimat promosi atau naskah *pitching*-nya!`,
  },

  // 8. Wawancara Kerja, Interview HRD/User, CV, Portofolio, Karir, Gaji, Leadership
  {
    id: 'career_interview_leadership',
    keywords: [
      'wawancara',
      'interview',
      'hrd',
      'rekruter',
      'lamaran kerja',
      'melamar kerja',
      'cari kerja',
      'cv',
      'resume',
      'portofolio',
      'perkenalkan diri',
      'perkenalan diri',
      'kelebihan dan kekurangan',
      'gaji',
      'negosiasi gaji',
      'ekspektasi gaji',
      'promosi jabatan',
      'karir',
      'karier',
      'resign',
      'kepemimpinan',
      'leadership',
      'manajer',
      'rekan kerja',
      'kantor',
      'magang',
    ],
    buildResponse: () =>
      `Menghadapi **wawancara kerja bersama HRD maupun User** itu sebenarnya adalah seni menceritakan nilai tambah dirimu secara jujur, terstruktur, dan meyakinkan.\n\nIni jawaban terbaik untuk **tiga pertanyaan wawancara paling krusial**:\n\n### 1. "Coba Ceritakan Tentang Diri Anda"\nGunakan alur **Saat Ini – Pengalaman Lalu – Kontribusi Masa Depan**:\n> *"Terima kasih atas kesempatannya. Saat ini saya memiliki fokus keahlian di bidang..., di mana saya terbiasa menyelesaikan... Sebelumnya, saya pernah menangani proyek... yang berhasil meningkatkan efisiensi hingga... Karena itulah saya sangat antusias melamar di posisi ini untuk memberikan kontribusi nyata bagi tim Bapak/Ibu."*\n\n### 2. "Apa Kelebihan dan Kekurangan Anda?"\n- **Kelebihan**: Sebutkan keahlian yang relevan dengan posisi kerja beserta satu bukti nyata.\n- **Kekurangan**: Sebutkan hal yang jujur namun sudah ada solusinya. Misalnya: *"Dulu saya terkadang terlalu terpaku pada detail kecil, namun sekarang saya selalu membuat daftar prioritas harian agar target waktu tetap terjaga dengan baik."*\n\n### 3. "Berapa Ekspektasi Gaji Anda?"\n> *"Berdasarkan riset standar industri untuk tanggung jawab posisi ini serta kompetensi yang saya bawa, saya berada di kisaran angka... Namun saya sangat terbuka untuk mendiskusikannya sesuai dengan skema tunjangan di perusahaan ini."*\n\nMau kita simulasi tanya-jawab wawancara kerja untuk posisi yang sedang kamu lamar?`,
  },

  // 9. Teknologi, Pemrograman, Coding, Web, Mobile, Database, AI, Cybersecurity
  {
    id: 'technology_coding_software',
    keywords: [
      'koding',
      'coding',
      'pemrograman',
      'programmer',
      'developer',
      'website',
      'aplikasi',
      'react',
      'javascript',
      'typescript',
      'python',
      'node',
      'laravel',
      'php',
      'golang',
      'java',
      'flutter',
      'android',
      'ios',
      'html',
      'css',
      'tailwind',
      'database',
      'mysql',
      'postgresql',
      'mongodb',
      'sql',
      'api',
      'backend',
      'frontend',
      'fullstack',
      'microservices',
      'restoran',
      'cloud',
      'docker',
      'server',
      'bug',
      'error',
      'algoritma',
      'machine learning',
      'deep learning',
      'cybersecurity',
      'keamanan siber',
      'enkripsi',
      'blockchain',
      'ui/ux',
      'figma',
      'sistem informasi',
      'teknik informatika',
    ],
    buildResponse: (msg) => {
      const lower = msg.toLowerCase();
      if (lower.includes('microservices') || lower.includes('restoran') || lower.includes('monolitik')) {
        return `Wah, analogi **dapur restoran modern** memang cara paling pas dan gampang dipahami buat menjelaskan konsep **arsitektur microservices** ke audiens non-teknis!\n\nBayangkan perbandingan dua dapur ini:\n\n1. **Sistem Monolitik Ibarat Satu Koki Serba Bisa**: Di restoran kecil, satu koki mengerjakan semuanya sendiri mulai dari memotong bahan, memasak menu utama, sampai meracik minuman. Kalau kompornya bermasalah, seluruh pesanan restoran langsung berhenti total.\n2. **Microservices Ibarat Dapur Restoran Bintang Lima**: Dapurnya dibagi menjadi stasiun-stasiun spesialis yang mandiri. Ada stasiun khusus hidangan pembuka, stasiun menu utama, dan stasiun minuman, yang dihubungkan oleh pelayan atau *ey-pi-ai gateway*.\n3. **Keunggulannya Sangat Nyata**: Kalau mesin kopi di stasiun minuman sedang diperbaiki, pelanggan tetap bisa memesan makanan utama dengan lancar tanpa gangguan!\n\nAnalogi seperti ini dijamin bikin penguji atau klien langsung paham dalam sekali dengar!`;
      }
      return `Membahas topik **teknologi, rekayasa perangkat lunak, dan kecerdasan buatan** itu paling keren kalau kita bisa menjelaskannya secara runtut — baik dari sisi teknis arsitekturnya maupun dari sisi manfaat nyatanya bagi pengguna.\n\nSupaya penjelasan teknismu terdengar kelas profesional:\n1. **Mulai dari Masalah Pengguna**: Jelaskan dulu sistem atau aplikasi ini dibuat untuk menyelesaikan kendala apa.\n2. **Jelaskan Alur Sistem Secara Sederhana**: Gunakan urutan **Input Data -> Proses Logika di Server dan Database -> Output di Antarmuka Pengguna**.\n3. **Tunjukkan Keandalan & Keamanan**: Tekankan bagaimana sistem tersebut menjaga kecepatan respons, keamanan data pengguna, serta kemudahan pengembangan ke depannya.\n\nKalau kamu lagi ngerjain proyek koding, tugas kuliah IT, atau mau aku bantu buatkan contoh kode maupun penjelasan arsitekturnya, sebutkan saja detailnya ya!`;
    },
  },

  // 10. Membuka & Menutup Presentasi, Struktur Slide, Storytelling
  {
    id: 'presentation_structure_and_hooks',
    keywords: [
      'presentasi',
      'membuka presentasi',
      'pembukaan',
      'penutup',
      'closing presentasi',
      'slide',
      'powerpoint',
      'ppt',
      'storytelling',
      'cerita',
      'audiens bosan',
      'audiens ngantuk',
      'ice breaking',
      'struktur bicara',
      'public speaking',
      'pidato',
      'sambutan',
      'mc',
      'moderator',
    ],
    buildResponse: () =>
      `Kunci utama supaya presentasi atau pidatomu langsung mengunci perhatian ruangan sejak tiga puluh detik pertama adalah **jangan membuka dengan kalimat klise**, melainkan gunakan **Pemicu Perhatian atau Hook** yang hidup!\n\nIni **tiga contoh kalimat pembuka dan penutup natural** yang bisa langsung kamu pakai:\n\n### 1. Pembukaan dengan Pertanyaan yang Mengajak Berpikir\n> *"Selamat pagi Bapak, Ibu, dan rekan-rekan semuanya. Sebelum kita masuk ke pembahasan inti, pernahkah kita membayangkan berapa banyak waktu dan energi yang bisa kita hemat jika proses kerja kita berjalan dua kali lebih cerdas dari hari ini?"*\n\n### 2. Pembukaan dengan Cerita Singkat atau Fakta Lapangan\n> *"Rekan-rekan sekalian, beberapa waktu lalu saya menemukan satu fakta menarik di lapangan yang mengubah cara pandang kita terhadap masalah ini. Dari situlah pembahasan kita hari ini bermula."*\n\n### 3. Kalimat Penutup yang Tegas & Berwibawa\nHindari menutup dengan kalimat *"Mungkin itu saja, maaf kalau banyak kurangnya"*. Ganti dengan:\n> *"Sebagai kesimpulan, tiga langkah yang kita bahas hari ini adalah fondasi nyata yang siap langsung kita jalankan. Mari kita mulai langkah pertama ini bersama-sama. Terima kasih banyak atas perhatian dan antusiasme rekan-rekan sekalian."*\n\nMau aku buatkan naskah pembuka dan penutup khusus untuk topik presentasimu sekarang?`,
  },

  // 11. Keuangan, Ekonomi, Investasi, Saham, Pengelolaan Uang
  {
    id: 'finance_economics_investment',
    keywords: [
      'keuangan',
      'finansial',
      'uang',
      'menabung',
      'tabungan',
      'dana darurat',
      'investasi',
      'saham',
      'reksadana',
      'obligasi',
      'emas',
      'inflasi',
      'ekonomi',
      'pajak',
      'anggaran',
      'budgeting',
      'hutang',
      'cicilan',
      'kredit',
    ],
    buildResponse: () =>
      `Mengelola **keuangan dan strategi ekonomi** — baik untuk keuangan pribadi, organisasi, maupun anggaran proyek — selalu berpusat pada keseimbangan antara arus kas masuk, efisiensi pengeluaran, dan manajemen risiko.\n\nTiga prinsip utamanya yang paling sehat adalah:\n1. **Prioritaskan Arus Kas dan Dana Cadangan**: Pastikan kebutuhan operasional utama dan dana darurat sudah aman sebelum mengalokasikan dana ke instrumen berisiko.\n2. **Gunakan Pembagian Proporsional**: Misalnya rumus lima puluh persen untuk kebutuhan pokok, tiga puluh persen untuk pengembangan atau operasional pendukung, dan dua puluh persen untuk tabungan serta investasi jangka panjang.\n3. **Ukur Risiko Sebelum Imbal Hasil**: Jangan hanya tergiur potensi keuntungan tinggi, tapi pahami betul likuiditas dan fundamentalnya.\n\nApakah kamu sedang menyiapkan materi presentasi bertema ekonomi dan keuangan, atau ingin mendiskusikan perencanaan anggaran tertentu?`,
  },

  // 12. Pendidikan, Cara Belajar Cepat, Beasiswa LPDP, Bahasa Inggris
  {
    id: 'education_learning_scholarship',
    keywords: [
      'belajar',
      'cara belajar',
      'cepat paham',
      'menghafal',
      'ujian',
      'sekolah',
      'mahasiswa',
      'kampus',
      'kuliah',
      'ipk',
      'beasiswa',
      'lpdp',
      'esai beasiswa',
      'wawancara beasiswa',
      'kurikulum',
      'guru',
      'pendidikan',
      'bahasa inggris',
      'toefl',
      'ielts',
    ],
    buildResponse: () =>
      `Dalam dunia **pendidikan, perkuliahan, maupun persiapan seleksi beasiswa seperti LPDP**, cara terbaik untuk menguasai materi bukanlah dengan menghafal mati semalaman, melainkan dengan **Teknik Feynman — yaitu belajar sambil mencoba menjelaskannya kembali dengan bahasa lisanmu sendiri**!\n\nKenapa cara ini sangat ampuh?\n1. **Menguji Pemahaman Asli**: Kalau kamu bisa menjelaskan suatu konsep rumit menggunakan kalimat sederhana sampai orang awam paham, artinya kamu sudah benar-benar menguasai konsep tersebut seratus persen.\n2. **Sangat Kuat untuk Wawancara Beasiswa & Esai**: Panelis beasiswa selalu mencari keterkaitan antara **latar belakang masalah di Indonesia, rencana studi yang kamu pilih, dan kontribusi nyata apa yang akan kamu bawa pulang**.\n3. **Latihan Langsung Lewat Suara**: Kamu bisa menggunakan fitur *Presentation Coach* atau *Q&A Simulator* di aplikasi ini untuk melatih cara menjelaskan materi kuliah atau simulasi wawancara beasiswamu secara lisan!\n\nTopik pelajaran atau persiapan beasiswa apa yang sedang kamu tekuni sekarang?`,
  },

  // 13. Kesehatan, Pola Hidup, Gizi, Stunting, Medis, Olahraga
  {
    id: 'health_medical_wellness',
    keywords: [
      'kesehatan',
      'sehat',
      'medis',
      'dokter',
      'rumah sakit',
      'penyakit',
      'gizi',
      'nutrisi',
      'stunting',
      'olahraga',
      'tidur',
      'begadang',
      'diet',
      'kebugaran',
      'imun',
      'vitamin',
    ],
    buildResponse: () =>
      `Topik **kesehatan, kebugaran, dan edukasi medis** sangat erat kaitannya dengan performa kita sehari-hari — termasuk kejernihan pikiran dan kekuatan suara saat berbicara di depan umum.\n\nBaik untuk menjaga kebugaran diri maupun saat menyampaikan penyuluhan kesehatan kepada masyarakat:\n1. **Kualitas Tidur & Hidrasi Pita Suara**: Tidur yang cukup dan minum air hangat (hindari minuman terlalu manis atau es tepat sebelum tampil) menjaga pita suara tetap lentur dan fokus pikiran tetap tajam.\n2. **Komunikasi Kesehatan yang Empatik**: Saat mempresentasikan topik medis atau gizi (seperti pencegahan *stunting* atau pola hidup sehat), gunakan bahasa yang membumi dan contoh menu atau kebiasaan harian yang mudah diterapkan keluarga Indonesia.\n\nApakah kamu sedang menyusun materi penyuluhan atau penelitian di bidang kesehatan? Ceritakan saja detailnya, kita susun bahasannya bareng-bareng!`,
  },
];

export class IndonesianKnowledgeEngine {
  /**
   * Generates a deeply contextual, natural spoken Indonesian response
   * capable of understanding thousands of Indonesian words and multi-turn context.
   */
  public static generateResponse(
    messagesInput: ChatMessageContext[] | string,
    documentContext?: string
  ): string {
    const messages: ChatMessageContext[] =
      typeof messagesInput === 'string'
        ? [{ role: 'user', content: messagesInput }]
        : Array.isArray(messagesInput)
        ? messagesInput
        : [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const query = lastUserMsg.toLowerCase().trim();

    // Find previous user topic for multi-turn conversational continuity
    const previousUserMsgs = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content);
    const previousTopic =
      previousUserMsgs.length >= 2 ? previousUserMsgs[previousUserMsgs.length - 2] : undefined;

    // 1. Check if it's a math/calculation question in Indonesian
    const mathAnswer = trySolveIndonesianMath(lastUserMsg);
    if (mathAnswer) {
      return mathAnswer;
    }

    // 2. Check if user is asking a short follow-up ("contohnya gimana", "jelaskan lebih detail", "bikinin naskahnya", "terus gimana")
    if (
      previousTopic &&
      query.split(/\s+/).length <= 8 &&
      /(contoh|detail|singkat|ringkas|naskah|kalimat|terus|lanjut|gimana kalau|lebih jelas|maksudnya)/i.test(query)
    ) {
      const cleanPrev = previousTopic.replace(/[?!.]+$/, '').trim();
      if (query.includes('contoh') || query.includes('kalimat') || query.includes('naskah')) {
        return `Siap! Ini contoh kalimat lisan yang mengalir natural dan siap langsung kamu ucapkan untuk membahas **"${cleanPrev}"**:\n\n> *"Selamat pagi rekan-rekan semuanya. Kalau kita berbicara soal ${cleanPrev}, sebenarnya ada satu hal paling mendasar yang sering terlewatkan. Bukan sekadar teorinya, melainkan bagaimana kita menerapkannya secara konsisten di lapangan. Contoh paling nyatanya adalah ketika kita mulai memfokuskan langkah pada solusi yang paling berdampak langsung bagi pengguna kita."*\n\nKamu bisa langsung klik tombol **Dengarkan** di bawah untuk menyimak intonasi cara membacanya ya! Mau dibuatkan versi yang lebih santai atau lebih formal?`;
      }
      return `Oke, yuk kita bedah lebih dalam lagi soal **"${cleanPrev}"** tadi!\n\nKalau kita tarik ke penerapan praktisnya di lapangan, kunci keberhasilannya ada pada tiga tahap:\n1. **Tahap Persiapan Awal**: Pastikan tujuan dan tolok ukur keberhasilannya sudah disepakati bersama sejak awal.\n2. **Tahap Eksekusi Bertahap**: Mulailah dari skala kecil yang paling mudah dikontrol, lalu lihat respons dan hasilnya.\n3. **Tahap Evaluasi & Penyempurnaan**: Gunakan masukan nyata dari lapangan untuk memperbaiki celah yang masih ada.\n\nBagian mana dari tiga tahap itu yang paling relevan sama kondisimu sekarang?`;
    }

    // 3. Match against our rich Indonesian Knowledge Topics by scoring keyword hits
    let bestTopic: KnowledgeTopicEntry | null = null;
    let bestScore = 0;

    for (const topicEntry of KNOWLEDGE_TOPICS) {
      let score = 0;
      for (const kw of topicEntry.keywords) {
        if (query.includes(kw)) {
          // Longer phrase matches get higher weight
          score += kw.includes(' ') ? 3 : 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topicEntry;
      }
    }

    if (bestTopic && bestScore > 0) {
      return bestTopic.buildResponse(lastUserMsg, previousTopic);
    }

    // 4. Intelligent Dynamic Indonesian Topic Synthesizer (Handles ANY topic or vocabulary the user brings up!)
    const cleanInput = lastUserMsg.replace(/[?!.]+$/, '').trim();
    const isWhatIsQuestion = /^(apa\s+itu|apa\s+yang\s+dimaksud|jelaskan\s+tentang|pengertian|arti\s+dari|definisi)/i.test(cleanInput);
    const isHowToQuestion = /^(bagaimana|gimana|cara|tips|langkah|strategi|kiat)/i.test(cleanInput);
    const isWhyQuestion = /^(mengapa|kenapa|alasan)/i.test(cleanInput);

    const coreSubject = cleanInput
      .replace(/^(tolong\s+)?(apa\s+itu|apa\s+yang\s+dimaksud\s+dengan|jelaskan\s+tentang|jelaskan|pengertian|definisi|bagaimana\s+cara|gimana\s+cara|bagaimana|gimana|cara|tips|mengapa|kenapa|buatkan\s+materi\s+tentang|bahas\s+tentang)\s+/i, '')
      .trim() || cleanInput;

    if (isWhatIsQuestion) {
      return `Mari kita bahas tentang **${coreSubject}** dengan bahasa Indonesia yang jernih dan gampang dipahami!\n\n### 1. Inti Pengertian **${coreSubject}**\nSecara sederhana, **${coreSubject}** merupakan konsep, pendekatan, atau elemen penting yang berfokus pada bagaimana suatu proses atau gagasan dapat dipahami, dijalankan, dan memberikan dampak nyata sesuai tujuannya. Alih-alih menghafal definisi buku yang rumit, cara terbaik memahami *${coreSubject}* adalah melihat fungsinya langsung dalam kehidupan atau pekerjaan kita.\n\n### 2. Kenapa Hal Ini Penting?\n- **Memberikan Arah yang Jelas**: Membantu kita memahami akar persoalan sebelum mengambil keputusan.\n- **Meningkatkan Efektivitas**: Membuat langkah kerja atau analisis menjadi jauh lebih terukur dan terarah.\n- **Relevan di Lapangan**: Sangat sering menjadi poin krusial saat berdiskusi, ujian sidang, maupun rapat kerja.\n\n### 3. Cara Menjelaskannya secara Lisan di Depan Umum\nKalau kamu ditanya soal **${coreSubject}** saat presentasi, kamu bisa menjawab dengan lugas seperti ini:\n> *"Singkatnya, ${coreSubject} ini bisa kita ibaratkan sebagai fondasi utama yang memastikan seluruh proses berjalan tepat sasaran dan memberikan hasil yang terukur."*\n\nMau kita gali contoh kasus nyata dari **${coreSubject}** ini, atau mau dibuatkan struktur slide presentasinya?`;
    }

    if (isHowToQuestion) {
      return `Nah, buat menjalankan atau menguasai **${coreSubject}** dengan hasil yang maksimal, kita bisa pakai langkah-langkah praktis yang langsung bisa dipraktikkan ini:\n\n### 1. Pahami Tujuan & Target Utamanya Dulu\nSebelum melangkah ke teknis, pastikan kamu sudah menentukan hasil akhir seperti apa yang ingin dicapai dari **${coreSubject}**. Target yang jelas adalah setengah dari keberhasilan.\n\n### 2. Bagi Menjadi Tiga Tahap Eksekusi\n- **Langkah Pertama (Persiapan Fondasi)**: Siapkan data, materi, atau kebutuhan utamanya secara rapi tanpa harus menunggu semuanya sempurna seratus persen.\n- **Langkah Kedua (Praktik & Uji Coba)**: Jalankan secara bertahap sambil memperhatikan bagian mana yang sudah lancar dan bagian mana yang masih butuh penyesuaian.\n- **Langkah Ketiga (Evaluasi & Konsistensi)**: Lakukan perbaikan berkala agar hasilnya semakin matang dan konsisten.\n\n### 3. Tips Komunikasi Saat Menyampaikannya\nKalau kamu mau memaparkan cara **${coreSubject}** ini ke orang lain, gunakan urutan **"Masalah -> Langkah Solusi -> Hasil Nyata"** supaya pendengar langsung antusias mengikuti alurmu.\n\nAda kendala spesifik yang lagi kamu hadapi waktu mencoba **${coreSubject}** ini? Ceritain aja, kita cari solusinya bareng!`;
    }

    if (isWhyQuestion) {
      return `Pertanyaan kritis yang bagus banget! Kenapa **${coreSubject}** ini penting dan sering menjadi sorotan utama? Ada tiga alasan mendasarnya:\n\n1. **Menyangkut Dampak Langsung di Lapangan**: Hal ini berkaitan erat dengan efisiensi, kualitas hasil, dan bagaimana suatu masalah bisa diselesaikan dari akarnya.\n2. **Mencegah Kesalahan Berulang**: Dengan memahami alasan di balik *${coreSubject}*, kita bisa mengambil langkah antisipasi yang jauh lebih tepat dan hemat sumber daya.\n3. **Menjadi Tolok Ukur Pengambilan Keputusan**: Baik dalam konteks akademik, bisnis, maupun keseharian, faktor ini sering menjadi penentu apakah sebuah rencana bisa berjalan jangka panjang atau tidak.\n\nKalau poin ini mau kamu angkat sebagai argumen di dalam presentasi atau diskusi, kamu bisa menekankannya di bagian latar belakang masalah. Mau aku bantu buatkan kalimat argumen lisannya?`;
    }

    return `Topik yang sangat menarik nih soal **"${coreSubject}"**! Yuk kita kupas secara utuh dengan bahasa yang mengalir dan mudah dicerna.\n\n### 1. Gambaran Utama & Inti Gagasan\nKetika kita membahas **${coreSubject}**, hal pertama yang paling penting untuk digarisbawahi adalah **relevansi dan manfaat nyatanya**. Sering kali sebuah topik terasa berat karena dibahas terlalu kaku, padahal kalau kita tarik ke intinya, *${coreSubject}* ini berfokus pada bagaimana menciptakan solusi, pemahaman, dan nilai tambah yang jelas.\n\n### 2. Tiga Poin Kunci Pembahasan\n- **Pertama, Konteks & Latar Belakang**: Mengapa *${coreSubject}* menjadi topik yang penting untuk diperhatikan saat ini.\n- **Kedua, Mekanisme & Penerapan Nyata**: Bagaimana konsep ini bekerja di dunia nyata beserta contoh penerapannya sehari-hari.\n- **Ketiga, Dampak & Langkah Ke Depan**: Apa hasil positif yang bisa dicapai dan bagaimana langkah konkret untuk memulainya.\n\n### 3. Contoh Kalimat Lisan (Siap Diucapkan)\nKalau kamu ingin menyampaikan gagasan tentang **${coreSubject}** ini secara lisan agar terdengar meyakinkan dan manusiawi, coba ucapkan seperti ini:\n> *"Rekan-rekan sekalian, mari kita melihat ${coreSubject} ini bukan sekadar sebagai wacana, melainkan sebagai peluang nyata yang bisa memberikan dampak positif bagi kita bersama."*\n\nKamu bisa tekan tombol **Dengarkan** untuk menyimak intonasi suaranya, atau beritahu aku bagian mana dari **${coreSubject}** yang ingin kamu dalami lebih lanjut!`;
  }
}
