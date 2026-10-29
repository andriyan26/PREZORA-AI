import https from 'https';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// In-memory LRU-like cache for synthesized Indonesian audio chunks
const audioChunkCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 450;

interface EdgeVoiceConfig {
  voice: 'id-ID-GadisNeural' | 'id-ID-ArdiNeural';
  rate: string;
  pitch: string;
  volume: string;
}

const PERSONA_EDGE_CONFIG: Record<string, EdgeVoiceConfig> = {
  assistant: { voice: 'id-ID-GadisNeural', rate: '+1%', pitch: '+0Hz', volume: '+0%' },
  mentor_ramah: { voice: 'id-ID-GadisNeural', rate: '+1%', pitch: '+1Hz', volume: '+0%' },
  dosen_penguji: { voice: 'id-ID-ArdiNeural', rate: '-2%', pitch: '-2Hz', volume: '+0%' },
  investor: { voice: 'id-ID-ArdiNeural', rate: '+2%', pitch: '-1Hz', volume: '+0%' },
  manajer_pro: { voice: 'id-ID-ArdiNeural', rate: '+1%', pitch: '+0Hz', volume: '+0%' },
  klien: { voice: 'id-ID-GadisNeural', rate: '+0%', pitch: '+0Hz', volume: '+0%' },
  umum: { voice: 'id-ID-GadisNeural', rate: '+2%', pitch: '+1Hz', volume: '+0%' },
  default: { voice: 'id-ID-GadisNeural', rate: '+1%', pitch: '+0Hz', volume: '+0%' },
};

let femaleEdgeTts: MsEdgeTTS | null = null;
let maleEdgeTts: MsEdgeTTS | null = null;

async function getOrCreateEdgeTts(voice: 'id-ID-GadisNeural' | 'id-ID-ArdiNeural'): Promise<MsEdgeTTS> {
  if (voice === 'id-ID-GadisNeural') {
    if (!femaleEdgeTts) {
      femaleEdgeTts = new MsEdgeTTS();
      await femaleEdgeTts.setMetadata('id-ID-GadisNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    }
    return femaleEdgeTts;
  } else {
    if (!maleEdgeTts) {
      maleEdgeTts = new MsEdgeTTS();
      await maleEdgeTts.setMetadata('id-ID-ArdiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    }
    return maleEdgeTts;
  }
}

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

function angkaKeKataIndonesia(n: number): string {
  if (isNaN(n) || !isFinite(n)) return '';
  const num = Math.floor(Math.abs(n));
  if (num === 0) return 'nol';
  return terbilangInternal(num).replace(/\s+/g, ' ').trim();
}

const LOANWORD_PHONETIC_RULES: Array<[RegExp, string]> = [
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
  [/\bFAQ\b/g, 'tanya jawab umum'],
  [/\bSOP\b/g, 'es-o-pe'],
  [/\bCV\b/g, 'si-vi'],

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

export class TTSService {
  /**
   * Deep Indonesian Phonetic & Conversational Normalizer
   * Makes any AI text sound like a real native Indonesian human speaking naturally
   */
  public static normalizeForIndonesianSpeech(rawText: string, _persona?: string): string {
    if (!rawText || !rawText.trim()) return '';

    let text = rawText;

    // 1. Remove code blocks & inline code backticks
    text = text.replace(/```[\s\S]*?```/g, ' Berikut contoh kodenya bisa kamu lihat di layar ya. ');
    text = text.replace(/`([^`]+)`/g, '$1');

    // 2. Strip markdown links [label](url) -> label
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 3. Remove bracket tags like [Pertanyaan Audiens]: or [Jawaban]:
    text = text.replace(/\[Pertanyaan Audiens\]:?/gi, '');
    text = text.replace(/\[Jawaban untuk Audiens\]:?/gi, '');
    text = text.replace(/\[Jawaban\]:?/gi, '');

    // 4. Convert numbered list items at start of lines into natural Indonesian transitions
    const ordinalMap: Record<string, string> = {
      '1': 'Pertama,',
      '2': 'Kedua,',
      '3': 'Ketiga,',
      '4': 'Keempat,',
      '5': 'Kelima,',
      '6': 'Keenam,',
      '7': 'Ketujuh,',
    };
    text = text.replace(/^\s*([1-7])\.\s+/gm, (_, d) => `${ordinalMap[d] || ''} `);

    // 5. Convert markdown headings and bullets into natural pauses
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');
    text = text.replace(/^\s*[-*•]\s+/gm, '');

    // 6. Strip bold/italic/strikethrough/blockquote markers
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');
    text = text.replace(/~~([^~]+)~~/g, '$1');
    text = text.replace(/^\s*>\s*/gm, '');

    // 7. Remove emojis and decorative symbols
    text = text.replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}•●◆▪▸►✓✔✕✖✗✘⭐✨🔥💡🎯📊📈📉🎙️📑📋🔍💬🚀⚡]/gu,
      ' '
    );

    // 8. Rewrite stiff written transitions into natural spoken Indonesian
    text = text.replace(/\bOleh karena itu,\s*/gi, 'Makanya, ');
    text = text.replace(/\bDengan demikian,\s*/gi, 'Jadi intinya, ');
    text = text.replace(/\bBerdasarkan hal tersebut,\s*/gi, 'Nah, berangkat dari situ, ');
    text = text.replace(/\bSebagai kesimpulan,\s*/gi, 'Jadi kesimpulannya, ');
    text = text.replace(/\bBerikut adalah\b/gi, 'Nah, ini dia');
    text = text.replace(/\bSelain itu,\s*/gi, 'Terus selain itu, ');
    text = text.replace(/\bSelanjutnya,\s*/gi, 'Nah selanjutnya, ');
    text = text.replace(/\bNamun demikian,\s*/gi, 'Tapi, ');
    text = text.replace(/\bAkan tetapi,\s*/gi, 'Tapi, ');

    // 9. Expand common Indonesian abbreviations
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

    // 10. Convert numbers, currency, scores, ranges, and percentages into natural Indonesian words
    text = text.replace(/Rp\.?\s*(\d+(?:\.\d{3})*)/gi, (_, rawNum) => {
      const cleanNum = Number(String(rawNum).replace(/\./g, ''));
      if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 1000000000) {
        return `${angkaKeKataIndonesia(cleanNum)} rupiah`;
      }
      return `${rawNum} rupiah`;
    });

    text = text.replace(/(\d+)\s*\/\s*100\b/g, (_, n) => {
      const val = Number(n);
      return !isNaN(val) ? `${angkaKeKataIndonesia(val)} dari seratus` : `${n} dari seratus`;
    });

    text = text.replace(/(\d+)\s*[–—-]\s*(\d+)/g, (_, a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb) && na < 10000 && nb < 10000) {
        return `${angkaKeKataIndonesia(na)} sampai ${angkaKeKataIndonesia(nb)}`;
      }
      return `${a} sampai ${b}`;
    });

    text = text.replace(/(\d+)[,.](\d+)/g, (_, a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb) && na < 1000 && nb < 100) {
        return `${angkaKeKataIndonesia(na)} koma ${angkaKeKataIndonesia(nb)}`;
      }
      return `${a} koma ${b}`;
    });

    text = text.replace(/(\d+)\s*%/g, (_, n) => {
      const val = Number(n);
      return !isNaN(val) && val <= 1000 ? `${angkaKeKataIndonesia(val)} persen` : `${n} persen`;
    });

    text = text.replace(/\b(\d{1,4})\b/g, (match) => {
      const val = Number(match);
      if (!isNaN(val) && val >= 0 && val <= 9999) {
        return angkaKeKataIndonesia(val);
      }
      return match;
    });

    // 11. Apply 350+ English loanword phonetic rules
    for (const [pattern, replacement] of LOANWORD_PHONETIC_RULES) {
      text = text.replace(pattern, replacement);
    }

    // 12. Clean punctuation for natural breath pauses
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
   * Splits normalized Indonesian text into natural breath-clauses (<= 145 chars)
   */
  public static splitIntoBreathChunks(text: string, maxLen = 145): string[] {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];

    for (const sentence of sentences) {
      if (sentence.length <= maxLen) {
        chunks.push(sentence);
        continue;
      }

      const subClauses = sentence.split(
        /(?<=,)\s+|(?=\b(?:karena|sehingga|namun|tetapi|tapi|sedangkan|kemudian|selanjutnya)\b)/i
      );
      let current = '';

      for (const clause of subClauses) {
        if ((current + ' ' + clause).trim().length <= maxLen) {
          current = (current + ' ' + clause).trim();
        } else {
          if (current) chunks.push(current);
          if (clause.length <= maxLen) {
            current = clause.trim();
          } else {
            const words = clause.split(/\s+/);
            let wordChunk = '';
            for (const word of words) {
              if ((wordChunk + ' ' + word).trim().length <= maxLen) {
                wordChunk = (wordChunk + ' ' + word).trim();
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = word;
              }
            }
            current = wordChunk;
          }
        }
      }

      if (current) chunks.push(current);
    }

    return chunks;
  }

  /**
   * Upstream fallback chunk in case of network issue
   */
  private static fetchFallbackGoogleChunk(chunkText: string, lang = 'id'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const encoded = encodeURIComponent(chunkText);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&total=1&idx=0&textlen=${chunkText.length}&client=tw-ob&ttsspeed=1`;

      const req = https.get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
            Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
          },
          timeout: 8000,
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`TTS upstream returned HTTP ${res.statusCode}`));
          }

          const data: Buffer[] = [];
          res.on('data', (d: Buffer) => data.push(d));
          res.on('end', () => {
            const buffer = Buffer.concat(data);
            resolve(buffer);
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('TTS upstream request timed out'));
      });
    });
  }

  /**
   * Synthesizes a single breath clause using Microsoft Azure Neural Voice (96kbps 24kHz Studio HD)
   * Real human Indonesian vocal resonance with prosody inflection per persona!
   */
  private static async synthesizeSingleClause(chunkText: string, personaKey = 'default'): Promise<Buffer> {
    const cacheKey = `${personaKey}:${chunkText}`;
    const cached = audioChunkCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const config = PERSONA_EDGE_CONFIG[personaKey] || PERSONA_EDGE_CONFIG.default;

    // XML-safe escaping for SSML prosody
    const safeText = chunkText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    try {
      const tts = await getOrCreateEdgeTts(config.voice);

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Edge TTS timed out'));
        }, 8000);

        try {
          const { audioStream } = tts.toStream(safeText, {
            rate: config.rate,
            pitch: config.pitch,
            volume: config.volume,
          });

          const chunks: Buffer[] = [];
          audioStream.on('data', (d: Buffer) => chunks.push(d));
          audioStream.on('end', () => {
            clearTimeout(timeout);
            resolve(Buffer.concat(chunks));
          });
          audioStream.on('error', (err: any) => {
            clearTimeout(timeout);
            reject(err);
          });
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });

      if (buffer.length > 128) {
        if (audioChunkCache.size >= MAX_CACHE_ENTRIES) {
          const firstKey = audioChunkCache.keys().next().value;
          if (firstKey) audioChunkCache.delete(firstKey);
        }
        audioChunkCache.set(cacheKey, buffer);
        return buffer;
      }
    } catch (edgeErr: any) {
      console.warn('[Edge TTS Fallback to Upstream]:', edgeErr?.message);
    }

    const fallbackBuf = await this.fetchFallbackGoogleChunk(chunkText);
    if (fallbackBuf.length > 64) {
      audioChunkCache.set(cacheKey, fallbackBuf);
    }
    return fallbackBuf;
  }

  /**
   * Synthesizes full Indonesian text into a studio-grade 96kbps Neural MP3 buffer
   */
  public static async synthesizeIndonesianMp3(rawText: string, persona = 'default', lang = 'id'): Promise<Buffer> {
    const cleanText = this.normalizeForIndonesianSpeech(rawText, persona);
    if (!cleanText) {
      throw new Error('Empty text after normalization');
    }

    const chunks = this.splitIntoBreathChunks(cleanText, 145).slice(0, 14);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const buf = await this.synthesizeSingleClause(chunk, persona);
      buffers.push(buf);
    }

    if (buffers.length === 0) {
      throw new Error('No audio buffers generated');
    }

    return Buffer.concat(buffers);
  }
}
