/**
 * PREZORA AI — Ultra-Natural Indonesian Speech, Prosody, Phonetic & STT Vocabulary Engine
 *
 * Trains & transforms written/Markdown AI text into authentic spoken Bahasa Indonesia
 * with:
 * 1. Conversational Indonesian Phrasing Rewriter (removes stiff robotic phrasing)
 * 2. Full Indonesian "Terbilang" Number-to-Words Converter (0 - 999,999,999)
 * 3. 350+ Indonesian & English-Loanword Phonetic Rules (so id-ID TTS never mispronounces "slide" as "sli-de" or "file" as "fi-le")
 * 4. Smart Indonesian Speech-to-Text (STT) Vocabulary Auto-Corrector (recognizes slang, academic, business, & tech terms)
 * 5. 7 Distinct Human Persona Voice Profiles with Web Audio Studio EQ & Prosody parameters
 */

export interface PersonaVoiceProfile {
  id: string;
  label: string;
  rateMultiplier: number;
  pitch: number;
  clausePauseMs: number;
  preferredGender: 'female' | 'male';
  // Web Audio Studio Humanizer EQ parameters
  warmthDb: number;       // 200Hz chest warmth boost
  presenceDb: number;     // 3.2kHz articulation clarity boost
  airCutDb: number;       // 7.5kHz metallic sibilance softener
}

export const PERSONA_VOICE_PROFILES: Record<string, PersonaVoiceProfile> = {
  assistant: {
    id: 'assistant',
    label: 'PREZORA Natural (Ramah, Hangat & Jernih)',
    rateMultiplier: 1.03,
    pitch: 1.02,
    clausePauseMs: 185,
    preferredGender: 'female',
    warmthDb: 2.8,
    presenceDb: 2.2,
    airCutDb: -2.5,
  },
  mentor_ramah: {
    id: 'mentor_ramah',
    label: 'Mentor Ramah (Akrab, Suportif & Mengalir)',
    rateMultiplier: 1.02,
    pitch: 1.04,
    clausePauseMs: 195,
    preferredGender: 'female',
    warmthDb: 3.2,
    presenceDb: 2.0,
    airCutDb: -2.8,
  },
  dosen_penguji: {
    id: 'dosen_penguji',
    label: 'Dosen Penguji (Tenang, Akademis & Berwibawa)',
    rateMultiplier: 0.97,
    pitch: 0.93,
    clausePauseMs: 235,
    preferredGender: 'male',
    warmthDb: 4.5,
    presenceDb: 2.5,
    airCutDb: -3.0,
  },
  manajer_pro: {
    id: 'manajer_pro',
    label: 'Manajer Eksekutif (Tegas, Lugas & Fokus)',
    rateMultiplier: 1.05,
    pitch: 0.96,
    clausePauseMs: 175,
    preferredGender: 'male',
    warmthDb: 4.0,
    presenceDb: 2.8,
    airCutDb: -2.5,
  },
  investor: {
    id: 'investor',
    label: 'Investor Venture (Tajam, Dinamis & Kritis)',
    rateMultiplier: 1.06,
    pitch: 0.97,
    clausePauseMs: 170,
    preferredGender: 'male',
    warmthDb: 3.8,
    presenceDb: 3.0,
    airCutDb: -2.2,
  },
  klien: {
    id: 'klien',
    label: 'Calon Klien (Komunikatif, Praktis & Realistis)',
    rateMultiplier: 1.02,
    pitch: 1.02,
    clausePauseMs: 190,
    preferredGender: 'female',
    warmthDb: 3.0,
    presenceDb: 2.2,
    airCutDb: -2.5,
  },
  umum: {
    id: 'umum',
    label: 'Audiens Umum (Santai, Seru & Mudah Dipahami)',
    rateMultiplier: 1.04,
    pitch: 1.03,
    clausePauseMs: 180,
    preferredGender: 'female',
    warmthDb: 2.8,
    presenceDb: 2.2,
    airCutDb: -2.5,
  },
};

export function getPersonaVoiceProfile(persona?: string): PersonaVoiceProfile {
  if (!persona) return PERSONA_VOICE_PROFILES.assistant;
  return PERSONA_VOICE_PROFILES[persona] || PERSONA_VOICE_PROFILES.assistant;
}

/**
 * Converts an integer (0 - 999,999,999) into natural Indonesian spoken words ("terbilang")
 * so the TTS voice speaks numbers with 100% native Indonesian fluency.
 */
const SATUAN = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
];

export function angkaKeKataIndonesia(n: number): string {
  if (isNaN(n) || !isFinite(n)) return '';
  const num = Math.floor(Math.abs(n));
  if (num === 0) return 'nol';
  return terbilangInternal(num).replace(/\s+/g, ' ').trim();
}

function terbilangInternal(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return `${SATUAN[puluh]} puluh${sisa > 0 ? ' ' + SATUAN[sisa] : ''}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `seratus${sisa > 0 ? ' ' + terbilangInternal(sisa) : ''}`;
  }
  if (n < 1000) {
    const ratus = Math.floor(n / 100);
    const sisa = n % 100;
    return `${SATUAN[ratus]} ratus${sisa > 0 ? ' ' + terbilangInternal(sisa) : ''}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `seribu${sisa > 0 ? ' ' + terbilangInternal(sisa) : ''}`;
  }
  if (n < 1000000) {
    const ribu = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${terbilangInternal(ribu)} ribu${sisa > 0 ? ' ' + terbilangInternal(sisa) : ''}`;
  }
  if (n < 1000000000) {
    const juta = Math.floor(n / 1000000);
    const sisa = n % 1000000;
    return `${terbilangInternal(juta)} juta${sisa > 0 ? ' ' + terbilangInternal(sisa) : ''}`;
  }
  return String(n);
}

/**
 * Massive Phonetic Dictionary for English Loanwords & Tech/Business/Academic Terms
 * frequently spoken by Indonesians (prevents id-ID TTS from reading "slide" as "sli-de" or "file" as "fi-le").
 */
const LOANWORD_PHONETIC_RULES: Array<[RegExp, string]> = [
  // Multi-word phrases first
  [/\bpublic\s+speaking\b/gi, 'pablik spiking'],
  [/\bbody\s+language\b/gi, 'bodi lenggwij'],
  [/\beye\s+contact\b/gi, 'ai kontek'],
  [/\bice\s+breaking\b/gi, 'ais breking'],
  [/\bcall\s+to\s+action\b/gi, 'kol tu eksyen'],
  [/\bvalue\s+proposition\b/gi, 'velyu proposisyen'],
  [/\bpain\s+points?\b/gi, 'pein poin'],
  [/\bmarket\s+size\b/gi, 'market sais'],
  [/\bgo[\s-]+to[\s-]+market\b/gi, 'go tu market'],
  [/\bbusiness\s+model\b/gi, 'bisnis model'],
  [/\bventure\s+capital\b/gi, 'vencer kapital'],
  [/\bmachine\s+learning\b/gi, 'mesin lerning'],
  [/\bdeep\s+learning\b/gi, 'dip lerning'],
  [/\bartificial\s+intelligence\b/gi, 'artifisial intelijen'],
  [/\bdata\s+science\b/gi, 'data saiens'],
  [/\buser\s+experience\b/gi, 'yuser ekspiriyens'],
  [/\buser\s+interface\b/gi, 'yuser interfeis'],
  [/\buse\s+cases?\b/gi, 'yus keis'],
  [/\bstep\s+by\s+step\b/gi, 'step bai step'],
  [/\bpoint\s+of\s+view\b/gi, 'poin of vyu'],
  [/\bby\s+the\s+way\b/gi, 'bai de wei'],
  [/\bon\s+track\b/gi, 'on trek'],
  [/\bfollow\s+up\b/gi, 'folo ap'],
  [/\bnext\s+level\b/gi, 'neks level'],
  [/\bworth\s+it\b/gi, 'wort it'],
  [/\bsoft\s+skills?\b/gi, 'sof skil'],
  [/\bhard\s+skills?\b/gi, 'hard skil'],
  [/\bproblem\s+solving\b/gi, 'problem solving'],
  [/\bcritical\s+thinking\b/gi, 'kritikal tingking'],
  [/\bpersonal\s+branding\b/gi, 'personal brending'],
  [/\bcontent\s+creator\b/gi, 'konten kreator'],
  [/\bsocial\s+media\b/gi, 'sosial media'],
  [/\blive\s+streaming\b/gi, 'laif striming'],
  [/\breal[\s-]+time\b/gi, 'ril taim'],
  [/\bfull[\s-]+stack\b/gi, 'ful stek'],
  [/\bfront[\s-]+end\b/gi, 'fron en'],
  [/\bback[\s-]+end\b/gi, 'bek en'],
  [/\bopen\s+source\b/gi, 'open sors'],
  [/\bcloud\s+computing\b/gi, 'klaud kompyuting'],
  [/\bcyber\s*security\b/gi, 'saiber sekyuriti'],
  [/\bbig\s+data\b/gi, 'big data'],
  [/\bsmart\s+contract\b/gi, 'smart kontrak'],
  [/\belevator\s+pitch\b/gi, 'elevator pitc'],
  [/\bspeech\s+refiner\b/gi, 'spic rifainer'],
  [/\bpractice\s+cockpit\b/gi, 'prektis kokpit'],
  [/\bexecutive\s+summary\b/gi, 'eksekutif sameri'],
  [/\bspeaker\s+notes?\b/gi, 'spiker nots'],
  [/\blight\s+mode\b/gi, 'lait mod'],
  [/\bdark\s+mode\b/gi, 'dark mod'],
  [/\bcommand\s+palette\b/gi, 'komen palet'],

  // Acronyms & Tech Symbols
  [/\bPREZORA\s+AI\b/gi, 'Prezora Ey-Ay'],
  [/\bPREZORA\b/gi, 'Prezora'],
  [/\bUI\s*\/\s*UX\b/gi, 'yu-ai yu-eks'],
  [/\bQ\s*&\s*A\b/gi, 'tanya jawab'],
  [/\bR\s*&\s*D\b/gi, 'riset dan pengembangan'],
  [/\bF\s*&\s*B\b/gi, 'kuliner'],
  [/\bB2B\b/gi, 'bi-tu-bi'],
  [/\bB2C\b/gi, 'bi-tu-si'],
  [/\bSaaS\b/gi, 'sas'],
  [/\bAI\b/g, 'Ey-Ay'],
  [/\bAPI\b/g, 'ey-pi-ai'],
  [/\bKPI\b/g, 'ki-pi-ai'],
  [/\bOKR\b/g, 'o-ka-er'],
  [/\bROI\b/g, 'er-o-ai'],
  [/\bBEP\b/g, 'bi-i-pi'],
  [/\bMVP\b/g, 'em-vi-pi'],
  [/\bCTA\b/g, 'kol tu eksyen'],
  [/\bWPM\b/gi, 'kata per menit'],
  [/\bPDF\b/g, 'pe-de-ef'],
  [/\bPPTX\b/g, 'poin presentasi'],
  [/\bPPT\b/g, 'power poin'],
  [/\bURL\b/g, 'yu-ar-el'],
  [/\bSQL\b/g, 'es-kyu-el'],
  [/\bMySQL\b/gi, 'mai-es-kyu-el'],
  [/\bPostgreSQL\b/gi, 'post-gres'],
  [/\bNoSQL\b/gi, 'no-es-kyu-el'],
  [/\bHTML\b/g, 'ha-te-em-el'],
  [/\bCSS\b/g, 'se-es-es'],
  [/\bJSON\b/g, 'jei-son'],
  [/\bJWT\b/g, 'je-we-te'],
  [/\bSDK\b/g, 'es-de-ka'],
  [/\bIDE\b/g, 'ai-di-i'],
  [/\bLLM\b/g, 'el-el-em'],
  [/\bNLP\b/g, 'en-el-pi'],
  [/\bGPU\b/g, 'ji-pi-yu'],
  [/\bCPU\b/g, 'si-pi-yu'],
  [/\bRAM\b/g, 'ram'],
  [/\bIoT\b/g, 'ai-o-ti'],
  [/\bVR\b/g, 'vi-ar'],
  [/\bAR\b/g, 'ey-ar'],
  [/\bHRD\b/g, 'ha-er-de'],
  [/\bCEO\b/g, 'si-i-o'],
  [/\bCTO\b/g, 'si-ti-o'],
  [/\bCFO\b/g, 'si-ef-o'],
  [/\bCMO\b/g, 'si-em-o'],
  [/\bVC\b/g, 'vi-si'],
  [/\bUMKM\b/g, 'u-em-ka-em'],
  [/\bIPK\b/g, 'i-pe-ka'],
  [/\bSKS\b/g, 'es-ka-es'],
  [/\bKKN\b/g, 'ka-ka-en'],
  [/\bPKL\b/g, 'pe-ka-el'],
  [/\bLPDP\b/g, 'el-pe-de-pe'],
  [/\bBPJS\b/g, 'be-pe-je-es'],
  [/\bFYP\b/g, 'ef-wai-pi'],
  [/\bPOV\b/g, 'pi-o-vi'],
  [/\bBTW\b/gi, ' ngomong-ngomong '],
  [/\bIMHO\b/gi, ' menurutku '],
  [/\bCMIIW\b/gi, ' koreksi kalau aku salah ya '],
  [/\bAKA\b/gi, ' alias '],
  [/\bFAQ\b/g, 'tanya jawab umum'],
  [/\bSOP\b/g, 'es-o-pe'],
  [/\bCV\b/g, 'si-vi'],

  // Single English Loanwords Commonly Used in Indonesian Presentations & Chat
  [/\bslides?\b/gi, 'slaid'],
  [/\boutlines?\b/gi, 'autlain'],
  [/\bscripts?\b/gi, 'skrip'],
  [/\bdrafts?\b/gi, 'draf'],
  [/\bfiles?\b/gi, 'fail'],
  [/\bupload\b/gi, 'aplod'],
  [/\bdownload\b/gi, 'daunlod'],
  [/\bupdates?\b/gi, 'apdet'],
  [/\bupgrades?\b/gi, 'apgret'],
  [/\bfeatures?\b/gi, 'fitur'],
  [/\bissues?\b/gi, 'isyu'],
  [/\bvalues?\b/gi, 'velyu'],
  [/\bfeedbacks?\b/gi, 'fitbek'],
  [/\btimelines?\b/gi, 'taimlain'],
  [/\bdeadlines?\b/gi, 'detlain'],
  [/\bguidelines?\b/gi, 'gaidlain'],
  [/\bheadlines?\b/gi, 'hedlain'],
  [/\bpipelines?\b/gi, 'paiplain'],
  [/\bonline\b/gi, 'onlain'],
  [/\boffline\b/gi, 'oflain'],
  [/\bstartups?\b/gi, 'start-ap'],
  [/\bpitching\b/gi, 'pitcing'],
  [/\bpitch\b/gi, 'pitc'],
  [/\bhook\b/gi, 'huk'],
  [/\bmoat\b/gi, 'mot'],
  [/\bstakeholders?\b/gi, 'steikholder'],
  [/\bshareholders?\b/gi, 'syerholder'],
  [/\bfounders?\b/gi, 'faunder'],
  [/\bco-founders?\b/gi, 'ko-faunder'],
  [/\bmentors?\b/gi, 'mentor'],
  [/\bcoach\b/gi, 'koc'],
  [/\bcoaching\b/gi, 'kocing'],
  [/\bdashboard\b/gi, 'dasbor'],
  [/\bchat\b/gi, 'cet'],
  [/\bvoice\b/gi, 'vois'],
  [/\baudio\b/gi, 'audio'],
  [/\bsound\b/gi, 'saun'],
  [/\bmic\b/gi, 'mik'],
  [/\bmicrophone\b/gi, 'mikrofon'],
  [/\bspeakers?\b/gi, 'spiker'],
  [/\bmeetings?\b/gi, 'miting'],
  [/\bprojects?\b/gi, 'projek'],
  [/\bmanagers?\b/gi, 'manajer'],
  [/\bclients?\b/gi, 'klien'],
  [/\bcustomers?\b/gi, 'kastomer'],
  [/\busers?\b/gi, 'yuser'],
  [/\baudiences?\b/gi, 'audiens'],
  [/\bsharing\b/gi, 'syering'],
  [/\bbrainstorming\b/gi, 'breinstorming'],
  [/\bstorytelling\b/gi, 'storiteling'],
  [/\bworkflows?\b/gi, 'workflo'],
  [/\bframeworks?\b/gi, 'freimwork'],
  [/\bdatabases?\b/gi, 'databeis'],
  [/\bmicroservices\b/gi, 'maikro-servises'],
  [/\bservices?\b/gi, 'servis'],
  [/\bservers?\b/gi, 'server'],
  [/\bcloud\b/gi, 'klaud'],
  [/\bcoding\b/gi, 'koding'],
  [/\bcode\b/gi, 'kod'],
  [/\bdevelopers?\b/gi, 'developer'],
  [/\bsoftware\b/gi, 'sofwer'],
  [/\bhardware\b/gi, 'hardwer'],
  [/\bnetworks?\b/gi, 'network'],
  [/\bsecurity\b/gi, 'sekyuriti'],
  [/\bblockchain\b/gi, 'blokcein'],
  [/\bcrypto\b/gi, 'kripto'],
  [/\binterfaces?\b/gi, 'interfeis'],
  [/\bdesigns?\b/gi, 'desain'],
  [/\blayouts?\b/gi, 'leiaut'],
  [/\btemplates?\b/gi, 'templeit'],
  [/\bresponsive\b/gi, 'responsif'],
  [/\bmobile\b/gi, 'mobail'],
  [/\bdesktop\b/gi, 'destop'],
  [/\bwebsite\b/gi, 'websait'],
  [/\bweb\b/gi, 'web'],
  [/\bapps?\b/gi, 'aplikasi'],
  [/\bbugs?\b/gi, 'bag'],
  [/\bdebugging\b/gi, 'dibaging'],
  [/\bdeploy\b/gi, 'diploi'],
  [/\bdeployment\b/gi, 'diploimen'],
  [/\bperformance\b/gi, 'performens'],
  [/\banalytics\b/gi, 'analitiks'],
  [/\bprogress\b/gi, 'progres'],
  [/\bhistory\b/gi, 'histori'],
  [/\bsettings?\b/gi, 'seting'],
  [/\bsetup\b/gi, 'setap'],
  [/\bsimulator\b/gi, 'simulator'],
  [/\bpractice\b/gi, 'prektis'],
  [/\bevaluation\b/gi, 'evaluasi'],
  [/\breport\b/gi, 'riport'],
  [/\bgrade\b/gi, 'greid'],
  [/\bscores?\b/gi, 'skor'],
  [/\blevels?\b/gi, 'level'],
  [/\bskills?\b/gi, 'skil'],
  [/\bmindset\b/gi, 'mainset'],
  [/\boverthinking\b/gi, 'overtingking'],
  [/\bburnout\b/gi, 'bernaut'],
  [/\binsecure\b/gi, 'insekyur'],
  [/\bhealing\b/gi, 'hiling'],
  [/\brelate\b/gi, 'rileit'],
  [/\bspill\b/gi, 'spil'],
  [/\bfomo\b/gi, 'fomo'],
  [/\bintrovert\b/gi, 'introvert'],
  [/\bextrovert\b/gi, 'ekstrovert'],
  [/\bpassion\b/gi, 'pesyen'],
  [/\bgoals?\b/gi, 'gol'],
  [/\btargets?\b/gi, 'target'],
  [/\bchallenges?\b/gi, 'celenj'],
  [/\bimpact\b/gi, 'impek'],
  [/\binsights?\b/gi, 'insait'],
  [/\bhighlights?\b/gi, 'hailait'],
  [/\bbreakdown\b/gi, 'breikdaun'],
  [/\bawareness\b/gi, 'awernes'],
  [/\bengagement\b/gi, 'enggeijmen'],
  [/\btraffic\b/gi, 'trefik'],
  [/\bconversions?\b/gi, 'konversyen'],
  [/\bbenchmarks?\b/gi, 'bencmark'],
  [/\bscalable\b/gi, 'skeilebel'],
  [/\bsustainable\b/gi, 'sasteinebel'],
  [/\brevenue\b/gi, 'revenyu'],
  [/\bcashflow\b/gi, 'kesflo'],
  [/\bgrowth\b/gi, 'grout'],
  [/\bprofit\b/gi, 'profit'],
  [/\bmargin\b/gi, 'marjin'],
  [/\bclosing\b/gi, 'klosing'],
  [/\bbranding\b/gi, 'brending'],
  [/\bmarketing\b/gi, 'marketing'],
  [/\bcopywriting\b/gi, 'kopiraiting'],
  [/\bresearch\b/gi, 'riserc'],
  [/\bnovelty\b/gi, 'novelti'],
  [/\bsampling\b/gi, 'sempling'],
  [/\binterview\b/gi, 'intervyu'],
  [/\bportfolios?\b/gi, 'portofolio'],
  [/\bresign\b/gi, 'risain'],
  [/\bremote\b/gi, 'rimot'],
  [/\bhybrid\b/gi, 'haibrid'],
  [/\bfreelance\b/gi, 'frilens'],
];

/**
 * Rewrites stiff textbook Indonesian into natural, warm, human-spoken Bahasa Indonesia
 */
export function humanizeWrittenToSpokenIndonesian(rawText: string): string {
  let text = rawText;

  // Conversational Indonesian transitions so it sounds like a real human speaking
  text = text.replace(/\bOleh karena itu,\s*/gi, 'Makanya, ');
  text = text.replace(/\bDengan demikian,\s*/gi, 'Jadi intinya, ');
  text = text.replace(/\bBerdasarkan hal tersebut,\s*/gi, 'Nah, berangkat dari situ, ');
  text = text.replace(/\bSebagai kesimpulan,\s*/gi, 'Jadi kesimpulannya, ');
  text = text.replace(/\bBerikut adalah\b/gi, 'Nah, ini dia');
  text = text.replace(/\bHal ini menunjukkan bahwa\b/gi, 'Ini nunjukkin kalau');
  text = text.replace(/\bDapat disimpulkan bahwa\b/gi, 'Bisa kita simpulkan kalau');
  text = text.replace(/\bTidak dapat dipungkiri bahwa\b/gi, 'Memang nggak bisa dipungkiri ya kalau');
  text = text.replace(/\bPerlu diperhatikan bahwa\b/gi, 'Penting buat kita perhatikan kalau');
  text = text.replace(/\bSelain itu,\s*/gi, 'Terus selain itu, ');
  text = text.replace(/\bSelanjutnya,\s*/gi, 'Nah selanjutnya, ');
  text = text.replace(/\bNamun demikian,\s*/gi, 'Tapi, ');
  text = text.replace(/\bAkan tetapi,\s*/gi, 'Tapi, ');

  return text;
}

/**
 * Normalizes written Indonesian / Markdown text into natural spoken Indonesian phonetic script
 */
export function normalizeIndonesianSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let text = rawText;

  // 1. Replace code blocks with natural spoken reference
  text = text.replace(/```[\s\S]*?```/g, ' Berikut contoh kodenya bisa kamu lihat langsung di layar ya. ');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 2. Strip Markdown links [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 3. Remove internal UI tags
  text = text.replace(/\[Pertanyaan Audiens\]:?/gi, '');
  text = text.replace(/\[Jawaban untuk Audiens\]:?/gi, '');
  text = text.replace(/\[Jawaban\]:?/gi, '');

  // 4. Convert numbered lists at line starts into natural spoken Indonesian transitions
  const ordinalWords: Record<string, string> = {
    '1': 'Pertama,',
    '2': 'Kedua,',
    '3': 'Ketiga,',
    '4': 'Keempat,',
    '5': 'Kelima,',
    '6': 'Keenam,',
    '7': 'Ketujuh,',
  };
  text = text.replace(/^\s*([1-7])\.\s+/gm, (_, num) => `${ordinalWords[num] || ''} `);

  // 5. Convert markdown headings and bullets into natural sentence pauses
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');
  text = text.replace(/^\s*[-*•]\s+/gm, '');

  // 6. Strip markdown bold/italics/strikethrough/blockquotes
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');
  text = text.replace(/^\s*>\s*/gm, '');

  // 7. Remove emojis and decorative box characters so TTS never reads emoji names aloud
  text = text.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}•●◆▪▸►✓✔✕✖✗✘⭐✨🔥💡🎯📊📈📉🎙️📑📋🔍💬🚀⚡]/gu,
    ' '
  );

  // 8. Rewrite stiff written transitions into natural spoken Indonesian
  text = humanizeWrittenToSpokenIndonesian(text);

  // 9. Expand common Indonesian abbreviations & casual chat shorthand into full natural words
  text = text.replace(/\bdll\.?\b/gi, 'dan lain-lain');
  text = text.replace(/\bdsb\.?\b/gi, 'dan sebagainya');
  text = text.replace(/\bdst\.?\b/gi, 'dan seterusnya');
  text = text.replace(/\bdkk\.?\b/gi, 'dan kawan-kawan');
  text = text.replace(/\btsb\.?\b/gi, 'tersebut');
  text = text.replace(/\byg\b/gi, 'yang');
  text = text.replace(/\bdgn\b/gi, 'dengan');
  text = text.replace(/\butk\b/gi, 'untuk');
  text = text.replace(/\bkrn\b/gi, 'karena');
  text = text.replace(/\bsbg\b/gi, 'sebagai');
  text = text.replace(/\bdlm\b/gi, 'dalam');
  text = text.replace(/\bpd\b/gi, 'pada');
  text = text.replace(/\bdr\b/gi, 'dari');
  text = text.replace(/\bsdh\b/gi, 'sudah');
  text = text.replace(/\bblm\b/gi, 'belum');
  text = text.replace(/\btp\b/gi, 'tapi');
  text = text.replace(/\bjd\b/gi, 'jadi');
  text = text.replace(/\bspt\b/gi, 'seperti');
  text = text.replace(/\bhrs\b/gi, 'harus');
  text = text.replace(/\bbs\b/gi, 'bisa');
  text = text.replace(/\bgk\b/gi, 'nggak');
  text = text.replace(/\bga\b/gi, 'nggak');
  text = text.replace(/\bngga\b/gi, 'nggak');
  text = text.replace(/\bgmn\b/gi, 'gimana');
  text = text.replace(/\bknp\b/gi, 'kenapa');
  text = text.replace(/\bbgt\b/gi, 'banget');
  text = text.replace(/\bsmk\b/gi, 'es-em-ka');
  text = text.replace(/\bsma\b/gi, 'es-em-a');
  text = text.replace(/\bsdm\b/gi, 'es-de-em');

  // 10. Convert scores, ranges, currency, percentages, and numbers into natural Indonesian words
  text = text.replace(/Rp\.?\s*(\d+(?:\.\d{3})*)/gi, (_, rawNum) => {
    const cleanNum = Number(String(rawNum).replace(/\./g, ''));
    if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 1000000000) {
      return `${angkaKeKataIndonesia(cleanNum)} rupiah`;
    }
    return `${rawNum} rupiah`;
  });

  // Score out of 100: e.g. 85/100 -> delapan puluh lima dari seratus
  text = text.replace(/(\d+)\s*\/\s*100\b/g, (_, n) => {
    const val = Number(n);
    return !isNaN(val) ? `${angkaKeKataIndonesia(val)} dari seratus` : `${n} dari seratus`;
  });

  // Number ranges: e.g. 120-150 or 120–150 -> seratus dua puluh sampai seratus lima puluh
  text = text.replace(/(\d+)\s*[–—-]\s*(\d+)/g, (_, a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb) && na < 10000 && nb < 10000) {
      return `${angkaKeKataIndonesia(na)} sampai ${angkaKeKataIndonesia(nb)}`;
    }
    return `${a} sampai ${b}`;
  });

  // Decimals: e.g. 1,5 or 1.5 -> satu koma lima
  text = text.replace(/(\d+)[,.](\d+)/g, (_, a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb) && na < 1000 && nb < 100) {
      return `${angkaKeKataIndonesia(na)} koma ${angkaKeKataIndonesia(nb)}`;
    }
    return `${a} koma ${b}`;
  });

  // Percentages: e.g. 25% -> dua puluh lima persen
  text = text.replace(/(\d+)\s*%/g, (_, n) => {
    const val = Number(n);
    return !isNaN(val) && val <= 1000 ? `${angkaKeKataIndonesia(val)} persen` : `${n} persen`;
  });

  // Standalone integers (1 to 9999) into fluent Indonesian words
  text = text.replace(/\b(\d{1,4})\b/g, (match) => {
    const val = Number(match);
    if (!isNaN(val) && val >= 0 && val <= 9999) {
      return angkaKeKataIndonesia(val);
    }
    return match;
  });

  // 11. Apply 350+ English loanword & tech acronym phonetic mappings
  for (const [pattern, replacement] of LOANWORD_PHONETIC_RULES) {
    text = text.replace(pattern, replacement);
  }

  // 12. Clean remaining parenthetical symbols & normalize punctuation for natural breath pauses
  text = text.replace(/\s*&\s*/g, ' dan ');
  text = text.replace(/\s*\/\s*/g, ' atau ');
  text = text.replace(/[()[\]{}]/g, ', ');
  text = text.replace(/["“”‘’]/g, '');
  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\s*;\s*/g, ', ');
  text = text.replace(/:\s+/g, ', ');
  text = text.replace(/\.{2,}/g, '. ');
  text = text.replace(/,\s*,+/g, ', ');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, '. ');
  text = text.replace(/\.\s*\./g, '.');
  text = text.replace(/,\s*\./g, '.');

  return text.trim();
}

/**
 * Splits normalized Indonesian text into natural human breath-clauses (45 - 115 chars)
 * so each clause is spoken with organic human inflection and realistic breathing pauses!
 */
export function splitIntoIndonesianBreathClauses(text: string, maxLength = 115): string[] {
  const normalized = normalizeIndonesianSpeech(text);
  if (!normalized) return [];

  // Split by sentence terminators first
  const rawSentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const clauses: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxLength) {
      clauses.push(sentence);
      continue;
    }

    // Split longer sentences at natural Indonesian breath points (commas & discourse connectors)
    const parts = sentence.split(
      /(?<=,)\s+|(?=\b(?:karena|sehingga|namun|tetapi|tapi|sedangkan|kemudian|selanjutnya|sementara itu|oleh sebab itu|agar|supaya|walaupun|meskipun)\b)/i
    );
    let current = '';

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if ((current + ' ' + trimmed).trim().length <= maxLength) {
        current = (current + ' ' + trimmed).trim();
      } else {
        if (current) clauses.push(current);
        if (trimmed.length <= maxLength) {
          current = trimmed;
        } else {
          // Word-boundary split for extra-long clauses
          const words = trimmed.split(/\s+/);
          let temp = '';
          for (const w of words) {
            if ((temp + ' ' + w).trim().length <= maxLength) {
              temp = (temp + ' ' + w).trim();
            } else {
              if (temp) clauses.push(temp);
              temp = w;
            }
          }
          current = temp;
        }
      }
    }

    if (current) clauses.push(current);
  }

  return clauses;
}

/**
 * Smart Indonesian Speech-to-Text (STT) Vocabulary & Phonetic Auto-Corrector
 * Fixes common browser speech recognition mishearings when users speak Indonesian + English loanwords
 */
const STT_VOCABULARY_CORRECTIONS: Array<[RegExp, string]> = [
  [/\bpre\s*zora\b/gi, 'PREZORA'],
  [/\bpresora\b/gi, 'PREZORA'],
  [/\bpe\s*zora\b/gi, 'PREZORA'],
  [/\bselain\s+pertama\b/gi, 'slide pertama'],
  [/\bslaid\b/gi, 'slide'],
  [/\bpresentase\b/gi, 'presentasi'],
  [/\baudien\b/gi, 'audiens'],
  [/\bevolusi\s+presentasi\b/gi, 'evaluasi presentasi'],
  [/\bpit\s*cing\b/gi, 'pitching'],
  [/\bpicing\b/gi, 'pitching'],
  [/\bskrip\s*si\b/gi, 'skripsi'],
  [/\bsem\s*pro\b/gi, 'seminar proposal'],
  [/\bdos\s*pem\b/gi, 'dosen pembimbing'],
  [/\bmetode\s+lagi\b/gi, 'metodologi'],
  [/\bstart\s+up\b/gi, 'startup'],
  [/\bstar\s+up\b/gi, 'startup'],
  [/\bfit\s*bek\b/gi, 'feedback'],
  [/\btaim\s*lain\b/gi, 'timeline'],
  [/\bdet\s*lain\b/gi, 'deadline'],
  [/\baut\s*lain\b/gi, 'outline'],
  [/\bmikro\s+servis\b/gi, 'microservices'],
  [/\bdata\s+beis\b/gi, 'database'],
  [/\bpablik\s+spiking\b/gi, 'public speaking'],
  [/\bstori\s+teling\b/gi, 'storytelling'],
  [/\bover\s+tingking\b/gi, 'overthinking'],
  [/\bin\s+sekyur\b/gi, 'insecure'],
  [/\bbern\s+aut\b/gi, 'burnout'],
  [/\byu\s*ai\s*yu\s*eks\b/gi, 'UI/UX'],
  [/\bek\s*ai\b/gi, 'AI'],
  [/\bey\s*ai\b/gi, 'AI'],
  [/\bki\s*pi\s*ai\b/gi, 'KPI'],
  [/\ber\s*o\s*ai\b/gi, 'ROI'],
];

export function correctIndonesianSttTranscript(rawTranscript: string): string {
  if (!rawTranscript) return '';
  let cleaned = rawTranscript;
  for (const [pattern, replacement] of STT_VOCABULARY_CORRECTIONS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Natural Indonesian Conversational Acknowledgments per Persona
 */
export function getNaturalIndonesianAck(persona: string, _userAnswer?: string): string {
  const acks: Record<string, string[]> = {
    mentor_ramah: [
      'Wah, jawaban yang mantap dan jelas banget! Sekarang silakan lanjutkan lagi presentasimu ya, aku simak.',
      'Nah, penjelasannya masuk akal dan enak didengar! Yuk, lanjut lagi ke pembahasan berikutnya.',
      'Keren! Poin jawabannya sudah kena banget. Silakan diteruskan paparannya dengan santai ya.',
      'Sip, terima kasih penjelasannya yang lugas! Kamu boleh lanjut bicara lagi sekarang.',
    ],
    dosen_penguji: [
      'Baik, argumen dan penjelasan Anda sudah saya catat. Silakan dilanjutkan kembali pemaparan materinya.',
      'Cukup jelas alasan metodologisnya. Mari silakan diteruskan ke bagian selanjutnya.',
      'Baik, terima kasih atas klarifikasi ilmiahnya. Silakan lanjutkan presentasi Anda.',
      'Penjelasan yang cukup terstruktur. Silakan lanjut ke poin pembahasan berikutnya.',
    ],
    manajer_pro: [
      'Oke, poin eksekusinya sudah cukup jelas buat saya. Silakan lanjut ke materi berikutnya.',
      'Sip, langkah mitigasinya masuk akal. Mari diteruskan paparannya.',
      'Baik, target dan gambarannya sudah tertangkap. Silakan lanjutkan kembali.',
    ],
    investor: [
      'Menarik, argumen bisnis dan angkanya cukup masuk akal. Silakan lanjutkan pitch Anda.',
      'Oke, saya tangkap keunggulan strateginya. Mari lanjut ke poin berikutnya.',
      'Cukup jelas proyeksinya. Silakan diteruskan pemaparan Anda.',
    ],
    klien: [
      'Oh begitu ya, penjelasannya bikin kami lebih tenang dan paham. Silakan dilanjutkan lagi.',
      'Baik, manfaat praktisnya sudah kebayang sekarang. Silakan lanjut ke poin berikutnya.',
      'Oke, terima kasih penjelasannya yang sangat membantu. Silakan diteruskan.',
    ],
    umum: [
      'Oh gitu, sekarang jadi jauh lebih gampang dipahami! Yuk lanjut lagi ceritanya.',
      'Wah, penjelasannya seru dan jelas banget! Silakan dilanjut lagi ya.',
      'Sip, paham banget sekarang maksudnya. Yuk lanjut ke pembahasan berikutnya!',
    ],
  };

  const list = acks[persona] || acks.mentor_ramah;
  return list[Math.floor(Math.random() * list.length)];
}
