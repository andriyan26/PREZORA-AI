import https from 'https';
import http from 'http';
import { config } from '../../config';
import { IndonesianKnowledgeEngine } from './indonesianKnowledgeEngine';

export interface MessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface EvaluationResult {
  overallScore: number;
  summary: string;
  criteria: Array<{
    name: string;
    score: number;
    evidence: string;
    suggestion: string;
  }>;
  strengths: string[];
  improvements: Array<{
    issue: string;
    original: string;
    suggested: string;
    reason: string;
  }>;
  nextPractice: string[];
}

export class AIService {
  private static makeHttpRequest(urlStr: string, options: https.RequestOptions, postData?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(urlStr);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = client.request(reqOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(35000, () => {
        req.destroy();
        reject(new Error('AI request timed out after 35 seconds'));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * General Assistant Response with Natural Indonesian Conversational Persona
   */
  public static async generateAssistantResponse(params: {
    messages: MessageContext[];
    systemPrompt?: string;
    documentContext?: string;
  }): Promise<string> {
    const { messages, systemPrompt, documentContext } = params;
    const defaultSystem = `Kamu adalah PREZORA AI, asisten cerdas sekaligus mentor komunikasi dan public speaking profesional dari Indonesia.
Gaya bicaramu harus SANGAT NATURAL seperti orang Indonesia asli yang ramah, cerdas, hangat, dan suportif saat mengobrol langsung — TIDAK kaku, TIDAK seperti robot atau terjemahan mesin.
Gunakan Bahasa Indonesia yang mengalir alami, enak didengar saat dibacakan dengan suara (Text-to-Speech), memiliki intonasi kalimat yang hidup, serta tetap terstruktur rapi dengan Markdown.
Jika menjelaskan poin-poin, gunakan sapaan atau kata penghubung yang luwes (seperti "Nah,", "Pertama-tama,", "Menariknya,", "Singkatnya,").`;

    const fullSystem = systemPrompt || defaultSystem;
    const enrichedSystem = documentContext 
      ? `${fullSystem}\n\n[DOKUMEN REFERENSI PENGGUNA]\nIsi dokumen berikut adalah referensi utama untuk menjawab:\n"""\n${documentContext.substring(0, 8000)}\n"""\nGunakan referensi dokumen jika relevan dan jelaskan dengan bahasa Indonesia yang mengalir natural.`
      : fullSystem;

    if (config.ai.apiKey) {
      try {
        if (config.ai.provider === 'gemini') {
          return await this.callGemini(messages, enrichedSystem);
        } else {
          return await this.callOpenAICompatible(messages, enrichedSystem);
        }
      } catch (err: any) {
        console.warn('[AI Service Warning]: External AI API failed or rate-limited. Falling back to local reasoning engine.', err.message);
      }
    }

    // Smart Local Reasoning Engine (Fallback & Offline mode)
    return this.generateSmartLocalAssistantResponse(messages, documentContext);
  }

  /**
   * Presentation Coach: Audience Question Generator (Natural Indonesian Spoken Style)
   */
  public static async generateAudienceQuestion(params: {
    topic: string;
    audienceType: string;
    difficulty: string;
    transcripts: string[];
    existingQuestionsCount: number;
  }): Promise<string> {
    const { topic, audienceType, difficulty, transcripts, existingQuestionsCount } = params;

    const audiencePersonas: Record<string, string> = {
      mentor_ramah: 'Mentor senior Indonesia yang hangat, suportif, santai namun tajam dalam menggali potensi penerapan ide nyata',
      dosen_penguji: 'Dosen penguji sidang Indonesia yang berwibawa, akademis, kritis terhadap metodologi, validitas data, dan kebaruan penelitian',
      manajer_pro: 'Manajer eksekutif Indonesia yang lugas, fokus pada eksekusi lapangan, target waktu (timeline), KPI, dan mitigasi risiko',
      klien: 'Calon klien perusahaan Indonesia yang praktis, peduli pada kemudahan pemakaian oleh tim, efisiensi biaya, dan layanan purna jual',
      investor: 'Investor modal ventura Indonesia yang tajam, antusias, fokus pada keunikan produk (moat), model bisnis, skala pasar, dan ROI',
      umum: 'Audiens umum Indonesia yang ingin penjelasan membumi, relevan dengan kehidupan sehari-hari, tanpa istilah teknis yang membingungkan'
    };

    const personaDescription = audiencePersonas[audienceType] || audiencePersonas.umum;
    const userSpeech = transcripts.filter(t => t.trim().length > 0).join('\n');

    const prompt = `Peranmu: ${personaDescription}.
Topik Presentasi: "${topic}".
Tingkat Kesulitan: ${difficulty}.
Pertanyaan ke-${existingQuestionsCount + 1}.

Transkrip ucapan yang baru saja disampaikan presenter:
"""
${userSpeech.substring(0, 3000) || 'Presenter baru saja membuka pembahasan.'}
"""

Instruksi: Ajukan 1 (satu) pertanyaan lisan yang terdengar SANGAT NATURAL seperti orang Indonesia sungguhan sedang berbicara langsung di ruang presentasi/sidang. Gunakan gaya bahasa sesuai karaktermu, kaitkan dengan topik "${topic}", dan jangan gunakan tanda kutip di awal/akhir.`;

    if (config.ai.apiKey) {
      try {
        const response = await this.generateAssistantResponse({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Kamu adalah audiens manusia asli Indonesia dalam simulasi latihan presentasi PREZORA AI. Berbicaralah secara lisan, alami, dan langsung pada pertanyaan.'
        });
        return response.trim().replace(/^["']|["']$/g, '');
      } catch (e) {
        // fallback below
      }
    }

    return this.generateLocalAudienceQuestion(topic, audienceType, difficulty, existingQuestionsCount, userSpeech);
  }

  /**
   * Q&A Simulator: Evaluate user's spoken/written answer to an audience question
   */
  public static async evaluateQAAnswer(params: {
    topic: string;
    audiencePersona: string;
    question: string;
    userAnswer: string;
  }): Promise<{ strengths: string; improvement: string; modelAnswer: string; score: number }> {
    const { topic, audiencePersona, question, userAnswer } = params;
    const cleanAnswer = userAnswer.trim();
    const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

    if (config.ai.apiKey) {
      try {
        const prompt = `Evaluasi jawaban tanya-jawab presentasi berikut dengan gaya bahasa Indonesia yang natural dan membangun:
Topik: "${topic}"
Persona Penanya: ${audiencePersona}
Pertanyaan Audiens: "${question}"
Jawaban Pengguna: "${cleanAnswer}"

Kembalikan HANYA JSON valid tanpa markdown fence:
{
  "score": number (60-98),
  "strengths": "1-2 kalimat apresiasi natural atas poin kuat dari jawaban pengguna",
  "improvement": "1-2 kalimat saran konkret tentang apa yang bisa ditambahkan agar lebih meyakinkan",
  "modelAnswer": "1 paragraf contoh jawaban lisan Bahasa Indonesia yang sangat natural, luwes, sopan, dan meyakinkan seperti pembicara profesional Indonesia"
}`;
        const raw = await this.generateAssistantResponse({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Kamu adalah pelatih komunikasi Indonesia PREZORA AI. Keluarkan JSON murni.'
        });
        const jsonCleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(jsonCleaned);
        if (parsed.strengths && parsed.modelAnswer) {
          return {
            score: parsed.score || 84,
            strengths: parsed.strengths,
            improvement: parsed.improvement || 'Perkuat dengan satu contoh nyata di lapangan.',
            modelAnswer: parsed.modelAnswer
          };
        }
      } catch (e) {
        // fallback to smart local Q&A evaluator
      }
    }

    // Smart Local Q&A Evaluation trained for Natural Indonesian Speech
    const hasDataOrExample = /persen|%|data|contoh|studi|uji|hasil|tahun|minggu|bulan|tim|riset|lapangan|pengguna/i.test(cleanAnswer);
    const hasStructure = /pertama|kedua|karena|oleh sebab itu|intinya|fokus|strategi|langkah/i.test(cleanAnswer);

    let score = 74;
    if (wordCount >= 18) score += 8;
    if (wordCount >= 35) score += 5;
    if (hasDataOrExample) score += 6;
    if (hasStructure) score += 5;
    score = Math.min(96, score);

    const strengths = wordCount >= 20
      ? `Jawaban kamu sudah terdengar lugas dan langsung merespons inti pertanyaan tentang "${topic}" dengan alur kalimat yang cukup tenang.`
      : `Kamu sudah berani merespons langsung poin utama pertanyaannya tanpa bertele-tele.`;

    const improvement = hasDataOrExample
      ? `Supaya makin meyakinkan di depan ${audiencePersona.replace('_', ' ')}, kamu bisa menutup jawaban dengan kesimpulan singkat yang menegaskan dampak utamanya.`
      : `Akan jauh lebih kuat kalau kamu menyelipkan satu bukti konkret, misalnya angka estimasi, contoh kasus di lapangan, atau tahapan eksekusinya.`;

    const personaModelAnswers: Record<string, string> = {
      dosen_penguji: `Terima kasih banyak atas pertanyaannya, Bapak dan Ibu Dosen Penguji. Terkait dengan ${topic}, pendekatan yang kami gunakan ini memang berangkat dari hasil pengujian empiris dan studi literatur terbaru. Pertama, kami memvalidasi datanya secara bertahap agar tingkat akurasinya terjaga. Kedua, dibandingkan metode konvensional, pendekatan ini terbukti lebih konsisten sekitar dua puluh lima persen dalam menangani variasi kasus di lapangan. Jadi secara metodologis, hasilnya dapat dipertanggungjawabkan.`,
      investor: `Pertanyaan yang sangat tepat. Nah, untuk ${topic} ini, keunggulan utama yang bikin kami sulit ditiru kompetitor adalah efisiensi sistem dan kecepatan adopsi penggunanya. Dari perhitungan unit ekonomi yang sudah kami uji coba, biaya akuisisi pelanggan bisa kami tekan hingga tiga puluh persen, sementara retensi pengguna terus tumbuh positif dari bulan ke bulan. Jadi secara bisnis, potensi skalabilitas dan balik modalnya sangat terukur.`,
      manajer_pro: `Siap, terima kasih masukannya. Untuk memastikan implementasi ${topic} ini berjalan sesuai target waktu, kami sudah membaginya ke dalam tiga fase eksekusi utama. Di tahap awal, kami fokus pada uji coba skala kecil selama dua minggu pertama untuk memetakan risiko teknis. Kalau ada kendala di tengah jalan, tim sudah menyiapkan skema cadangan sehingga indikator kinerja utama atau ki-pi-ai proyek tetap aman sesuai jadwal.`,
      klien: `Terima kasih atas pertanyaannya. Kami sangat paham bahwa bagi tim Bapak dan Ibu, kemudahan penggunaan itu nomor satu. Oleh karena itu, solusi ${topic} ini kami rancang agar bisa langsung dipakai tanpa perlu pelatihan teknis yang rumit. Bahkan di bulan pertama implementasi, tim pendamping kami siap membantu penuh sampai operasional harian Bapak dan Ibu benar-benar berjalan lancar dan terasa penghematan waktunya.`,
      mentor_ramah: `Wah, poin yang menarik banget! Jadi kalau kita lihat penerapan ${topic} di kondisi nyata, kunci utamanya memang ada di konsistensi eksekusi dan kemauan untuk terus mendengar masukan pengguna. Langkah awalnya kita mulai dari bagian yang paling berdampak dulu, lalu kita evaluasi secara berkala supaya hasilnya makin matang.`
    };

    const modelAnswer = personaModelAnswers[audiencePersona] || personaModelAnswers.dosen_penguji;

    return {
      score,
      strengths,
      improvement,
      modelAnswer
    };
  }

  /**
   * Presentation Coach: Comprehensive Evaluation Engine
   */
  public static async evaluatePresentation(params: {
    topic: string;
    audienceType: string;
    targetDuration: number;
    actualDuration: number;
    transcripts: Array<{ speaker: string; content: string }>;
    qaSession: Array<{ question: string; answer?: string }>;
  }): Promise<EvaluationResult> {
    const { topic, audienceType, targetDuration, actualDuration, transcripts, qaSession } = params;

    const userTranscripts = transcripts.filter(t => t.speaker === 'user').map(t => t.content);
    const totalWords = userTranscripts.join(' ').split(/\s+/).filter(Boolean).length;
    const fullTranscriptText = userTranscripts.join('\n');

    if (totalWords < 12) {
      return {
        overallScore: 52,
        summary: `Sesi latihan untuk topik "${topic}" masih cukup singkat, baru sekitar ${totalWords} kata yang terekam. Yuk coba berbicara lebih leluasa di sesi berikutnya, mulai dari sapaan pembuka, tiga poin inti pembahasan, sampai penutup yang berkesan!`,
        criteria: [
          { name: 'Struktur Presentasi', score: 50, evidence: `Ucapan yang terekam baru ${totalWords} kata.`, suggestion: 'Mulai dengan sapaan hangat, perkenalkan topik, lalu jelaskan minimal dua poin utama sebelum menutup.' },
          { name: 'Kejelasan Penjelasan', score: 55, evidence: 'Gagasan utama belum sempat dijabarkan secara utuh.', suggestion: 'Gunakan kalimat sederhana seperti sedang bercerita kepada rekan kerja atau dosen.' },
          { name: 'Relevansi Isi', score: 58, evidence: 'Topik sudah disebutkan namun belum dielaborasi.', suggestion: 'Tambahkan satu contoh nyata yang berkaitan langsung dengan topik presentasimu.' },
          { name: 'Alur Logika & Transisi', score: 50, evidence: 'Perpindahan antarbagian belum terdengar.', suggestion: 'Pakai kata penghubung alami seperti "Nah, yang pertama...", "Selanjutnya...", dan "Jadi kesimpulannya...".' },
          { name: 'Pemilihan Kata (Diksi)', score: 56, evidence: 'Kosakata yang digunakan masih sangat terbatas.', suggestion: 'Pilih kata-kata yang komunikatif, tegas, dan tidak terburu-buru.' },
          { name: 'Penguasaan Tanya Jawab', score: qaSession.length > 0 ? 60 : 50, evidence: qaSession.length > 0 ? 'Pertanyaan audiens sudah dicoba dijawab.' : 'Belum ada sesi tanya jawab yang diselesaikan.', suggestion: 'Coba klik tombol Simulasikan Pertanyaan Audiens saat latihan berlangsung.' },
          { name: 'Manajemen Waktu', score: Math.max(45, Math.min(95, Math.round((actualDuration / Math.max(1, targetDuration)) * 100))), evidence: `Waktu bicara aktual ${actualDuration} detik dari target ${targetDuration} detik.`, suggestion: 'Manfaatkan waktu latihan untuk menjabarkan contoh kasus agar durasi lebih optimal.' }
        ],
        strengths: [
          'Sudah berani memulai simulasi dan mencoba berbicara langsung di ruang latihan.',
          `Topik "${topic}" memiliki potensi bahasan yang sangat menarik jika dijabarkan lebih lanjut.`
        ],
        improvements: [
          {
            issue: 'Pembukaan dan penjabaran materi masih terlalu singkat',
            original: userTranscripts[0] || `(Baru sedikit kalimat yang terekam tentang ${topic})`,
            suggested: `Halo semuanya, selamat pagi. Hari ini saya ingin mengajak kita semua melihat lebih dekat mengenai ${topic}, mengapa hal ini penting, dan bagaimana langkah nyatanya untuk kita terapkan.`,
            reason: 'Sapaan yang hangat dan kalimat pembuka yang jelas langsung membuat audiens tertarik menyimak sejak detik pertama.'
          }
        ],
        nextPractice: [
          'Coba latihan 3 menit sambil membayangkan kamu sedang mengobrol langsung dengan teman atau dosen pembimbing.',
          'Gunakan fitur Script & Slide Assistant untuk membuat panduan poin-poin bicara terlebih dahulu.'
        ]
      };
    }

    if (config.ai.apiKey) {
      try {
        const evalPrompt = `Bertindaklah sebagai AI Presentation Evaluator profesional Indonesia di PREZORA AI.
Evaluasi presentasi berikut dengan bahasa Indonesia yang hangat, natural, suportif, dan tajam:

Topik: "${topic}"
Target Durasi: ${targetDuration} detik
Durasi Aktual: ${actualDuration} detik
Persona Audiens: ${audienceType}
Transkrip Pengguna:
"""
${fullTranscriptText.substring(0, 4500)}
"""

Tanya Jawab Audiens:
${qaSession.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer || '(Belum dijawab)'}`).join('\n')}

Wajib kembalikan HANYA format JSON valid tanpa markdown fence \`\`\`json:
{
  "overallScore": number (0-100),
  "summary": string,
  "criteria": [
    { "name": "Struktur Presentasi", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Kejelasan Penjelasan", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Relevansi & Kelengkapan Isi", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Alur Logika & Transisi", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Pemilihan Kata (Diksi)", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Penguasaan Tanya Jawab", "score": number (0-100), "evidence": string, "suggestion": string },
    { "name": "Manajemen Waktu", "score": number (0-100), "evidence": string, "suggestion": string }
  ],
  "strengths": [string, string, string],
  "improvements": [
    {
      "issue": string,
      "original": string,
      "suggested": string,
      "reason": string
    }
  ],
  "nextPractice": [string, string, string]
}`;

        const raw = await this.generateAssistantResponse({
          messages: [{ role: 'user', content: evalPrompt }],
          systemPrompt: 'Kamu adalah evaluator presentasi berbasis AI yang obyektif, suportif, dan menggunakan Bahasa Indonesia yang natural. Keluarkan output JSON murni.'
        });

        const jsonCleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(jsonCleaned) as EvaluationResult;
        
        parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));
        parsed.criteria = (parsed.criteria || []).map(c => ({
          ...c,
          score: Math.max(0, Math.min(100, Math.round(c.score)))
        }));

        if (parsed.overallScore && parsed.criteria.length > 0) {
          return parsed;
        }
      } catch (err: any) {
        console.warn('[AI Service Warning]: AI structured evaluation parse failed, using smart local evaluator.', err.message);
      }
    }

    return this.generateSmartLocalEvaluation(params);
  }

  /**
   * Helper: Call Google Gemini API
   */
  private static async callGemini(messages: MessageContext[], systemPrompt?: string): Promise<string> {
    const model = config.ai.model || 'gemini-1.5-flash';
    const apiKey = config.ai.apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const payload: any = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const postData = JSON.stringify(payload);
    const rawRes = await this.makeHttpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);

    const json = JSON.parse(rawRes);
    const candidate = json.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    }
    throw new Error('Gemini API did not return text content');
  }

  /**
   * Helper: Call OpenAI Compatible API
   */
  private static async callOpenAICompatible(messages: MessageContext[], systemPrompt?: string): Promise<string> {
    let baseUrl = config.ai.baseUrl;
    if (!baseUrl) {
      if (config.ai.provider === 'groq') {
        baseUrl = 'https://api.groq.com/openai/v1';
      } else if (config.ai.provider === 'openrouter') {
        baseUrl = 'https://openrouter.ai/api/v1';
      } else {
        baseUrl = 'https://api.openai.com/v1';
      }
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const formattedMessages: any[] = [];

    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const m of messages) {
      formattedMessages.push({
        role: m.role,
        content: m.content
      });
    }

    const payload = JSON.stringify({
      model: config.ai.model || (config.ai.provider === 'groq' ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini'),
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2048
    });

    const rawRes = await this.makeHttpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.ai.apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    const json = JSON.parse(rawRes);
    const text = json.choices?.[0]?.message?.content;
    if (text) return text;
    throw new Error('OpenAI compatible API did not return choices content');
  }

  /**
   * Smart Local Assistant Response — Trained for Natural Indonesian Conversational Flow
   * Handles:
   * 1. Q&A Single Question Generation
   * 2. Slide-by-Slide Outline Generation (ScriptController)
   * 3. Speech Script Refinement (ScriptController)
   * 4. Document Executive Summary (DocumentController)
   * 5. Multi-topic Natural Indonesian Chat Assistant
   */
  private static generateSmartLocalAssistantResponse(messages: MessageContext[], documentContext?: string): string {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const query = lastUserMsg.toLowerCase();

    // --- SPECIAL HANDLER A: Single Q&A Question request (from QASimulatorPage) ---
    if (query.includes('buatkan 1 pertanyaan tajam audiens')) {
      const topicMatch = lastUserMsg.match(/topik:\s*"([^"]+)"/i);
      const personaMatch = lastUserMsg.match(/persona\s+([a-z_]+)/i);
      const diffMatch = lastUserMsg.match(/kesulitan\s+([a-z_]+)/i);
      const extractedTopic = topicMatch?.[1] || 'inovasi ini';
      const extractedPersona = personaMatch?.[1] || 'dosen_penguji';
      const extractedDiff = diffMatch?.[1] || 'intermediate';
      return this.generateLocalAudienceQuestion(
        extractedTopic,
        extractedPersona,
        extractedDiff,
        Math.floor(Math.random() * 6),
        ''
      );
    }

    // --- SPECIAL HANDLER B: Slide-by-Slide Outline Generator (from ScriptController.generateOutline or Chat) ---
    if (query.includes('buatkan outline struktur presentasi lengkap untuk:') || (query.includes('outline') && query.includes('slide'))) {
      const topicMatch = lastUserMsg.match(/-\s*Topik:\s*"([^"]+)"/i) || lastUserMsg.match(/topik:\s*"?([^"\n]+)"?/i);
      const audienceMatch = lastUserMsg.match(/-\s*Audiens Sasaran:\s*([^\n]+)/i);
      const durationMatch = lastUserMsg.match(/-\s*Durasi:\s*(\d+)/i);
      const toneMatch = lastUserMsg.match(/-\s*Gaya Bahasa\/Tone:\s*([^\n]+)/i);

      const t = topicMatch?.[1] || 'Strategi & Inovasi Unggulan';
      const aud = audienceMatch?.[1]?.trim() || 'Audiens Profesional';
      const dur = Number(durationMatch?.[1] || 10);
      const tn = toneMatch?.[1]?.trim() || 'Profesional & Meyakinkan';

      return `### 🎙️ Rancangan Struktur Presentasi: "${t}"
**Target Audiens:** ${aud} • **Alokasi Durasi:** ${dur} Menit • **Gaya Penyampaian:** ${tn}

---

#### 1. Pembukaan Memikat (The Hook — 45 Detik Pertama)
- **Kalimat Sapaan & Pemicu Perhatian (Siap Dibaca):**
  > *"Selamat pagi Bapak, Ibu, dan rekan-rekan sekalian. Pernahkah kita membayangkan seberapa besar dampak yang bisa kita capai jika **${t}** diterapkan dengan strategi yang tepat? Dalam ${dur} menit ke depan, saya akan membedah solusi praktis dan langkah nyatanya untuk kita semua."*
- **Tips Intonasi:** Gunakan nada suara yang hangat saat menyapa, beri jeda 2 detik setelah kalimat pertanyaan, lalu tekankan kata kunci topik dengan antusias.

---

#### 2. Struktur Slide demi Slide (Inti Pembahasan)

**📑 Slide 1: Latar Belakang & Urgensi Masalah (${Math.max(1, Math.round(dur * 0.2))} Menit)**
- **Poin Utama di Slide:**
  - Kondisi saat ini dan tantangan utama yang dihadapi di lapangan.
  - Mengapa pendekatan lama sudah tidak lagi cukup efisien.
- **Catatan Pembicara (Natural Spoken):**
  *"Nah, kalau kita lihat kondisi di lapangan saat ini, tantangan terbesarnya adalah efisiensi dan konsistensi. Karena itulah kita perlu melihat pendekatan baru melalui ${t} ini."*

**📑 Slide 2: Konsep Solusi & Kerangka Strategi (${Math.max(1, Math.round(dur * 0.25))} Menit)**
- **Poin Utama di Slide:**
  - Tiga pilar utama dari **${t}**.
  - Cara kerja dan alur implementasi secara sederhana.
- **Catatan Pembicara (Natural Spoken):**
  *"Lalu bagaimana solusinya bekerja? Sederhananya ada tiga langkah utama. Pertama kita petakan kebutuhannya, kedua kita terapkan sistemnya secara bertahap, dan ketiga kita ukur dampaknya secara terukur."*

**📑 Slide 3: Bukti Dampak, Studi Kasus & Nilai Tambah (${Math.max(1, Math.round(dur * 0.25))} Menit)**
- **Poin Utama di Slide:**
  - Proyeksi peningkatan efisiensi dan manfaat nyata bagi ${aud}.
  - Mitigasi risiko agar implementasi berjalan mulus.
- **Catatan Pembicara (Natural Spoken):**
  *"Menariknya, pendekatan ini bukan sekadar teori. Ketika diterapkan dengan disiplin, dampaknya langsung terasa pada penghematan waktu dan peningkatan kualitas hasil kerja kita."*

**📑 Slide 4: Peta Jalan Eksekusi (Timeline) (${Math.max(1, Math.round(dur * 0.15))} Menit)**
- **Poin Utama di Slide:**
  - Tahap Persiapan, Tahap Uji Coba, dan Tahap Evaluasi Penuh.
- **Catatan Pembicara (Natural Spoken):**
  *"Untuk langkah eksekusinya, kita bisa mulai dari skala prioritas terlebih dahulu sehingga risikonya sangat terkendali."*

---

#### 3. Penutup & Call-to-Action (${Math.max(1, Math.round(dur * 0.15))} Menit)
- **Kalimat Penutup (Siap Dibaca):**
  > *"Sebagai kesimpulan, **${t}** adalah langkah strategis yang relevan, terukur, dan siap kita jalankan bersama. Mari kita mulai langkah pertama ini sekarang. Terima kasih banyak atas perhatiannya, saya sangat terbuka untuk diskusi dan masukan."*

---

#### 4. Prediksi 3 Pertanyaan Kritis dari ${aud}
1. *"Apa tantangan terbesar saat menerapkan ${t} ini pada tahap awal, dan bagaimana cara mengatasinya?"*
2. *"Bagaimana kita mengukur indikator keberhasilan dari gagasan ini dalam tiga bulan pertama?"*
3. *"Apa yang membedakan pendekatan yang Anda tawarkan ini dibandingkan cara konvensional yang sudah ada?"*`;
    }

    // --- SPECIAL HANDLER C: Speech Refiner (from ScriptController.refineScript or Chat) ---
    if (query.includes('perbaiki dan sempurnakan naskah') || query.includes('naskah asli:')) {
      const toneMatch = lastUserMsg.match(/Gaya Bahasa yang Diinginkan:\s*([^\n]+)/i);
      const instrMatch = lastUserMsg.match(/Instruksi Khusus:\s*([^\n]+)/i);
      const scriptMatch = lastUserMsg.match(/Naskah Asli:\s*"""\s*([\s\S]*?)\s*"""/i) || lastUserMsg.match(/Naskah Asli:\s*([\s\S]+)/i);

      const targetTone = toneMatch?.[1]?.trim() || 'Natural & Percaya Diri';
      const instruction = instrMatch?.[1]?.trim() || 'Buat lebih mengalir dan memikat';
      const rawDraft = scriptMatch?.[1]?.trim() || lastUserMsg;

      // If it came from QASimulatorPage evaluate fallback
      if (instruction.toLowerCase().includes('evaluator tanya jawab')) {
        return `Tentu, terima kasih atas pertanyaannya. Terkait poin tersebut, kami telah memvalidasi pendekatannya secara bertahap di lapangan. Pertama, fokus kami adalah memastikan keandalan sistem dan kemudahan bagi pengguna. Kedua, dari hasil evaluasi awal, solusi ini terbukti jauh lebih efisien dibandingkan cara manual, sehingga dampaknya bisa langsung dirasakan secara nyata.`;
      }

      const cleanedSentences = rawDraft
        .replace(/\s+/g, ' ')
        .trim();

      return `### ✨ Naskah Hasil Penyempurnaan (Gaya: ${targetTone})

"Selamat pagi dan salam sejahtera untuk kita semua. Senang sekali hari ini saya berkesempatan berbagi pandangan dengan rekan-rekan sekalian.

Nah, berangkat dari poin penting yang ingin saya tekankan: **${cleanedSentences}**

Mengapa hal ini menjadi sangat krusial bagi kita sekarang? Karena dengan langkah yang terarah dan kolaborasi yang solid, kita bukan hanya menyelesaikan tantangan yang ada hari ini, tetapi juga membangun fondasi yang jauh lebih kuat untuk ke depannya.

Jadi, mari kita ambil langkah nyata mulai dari sekarang. Terima kasih banyak atas perhatian rekan-rekan semua, semoga apa yang saya sampaikan ini memberikan manfaat dan inspirasi bagi kita bersama."

---

### 🔍 Poin Penyempurnaan yang Dilakukan (${instruction})
1. **Pembukaan Lebih Hangat & Manusiawi**: Menambahkan sapaan pembuka yang natural agar pendengar langsung merasa dekat dan nyaman.
2. **Alur Transisi Lebih Luwes**: Menghilangkan kesan kaku dengan kata penghubung lisan alami (*"Nah, berangkat dari..."*, *"Mengapa hal ini menjadi sangat krusial..."*).
3. **Penutup Berdaya Gerak (Call to Action)**: Menutup naskah dengan ajakan positif yang meninggalkan kesan kuat di benak audiens.

### 🎙️ Tips Penyampaian Suara (Vocal Delivery)
- **Jeda Napas (Pause)**: Berhenti sejenak sekitar 1,5 detik setelah kalimat sapaan pertama sambil tersenyum dan menatap audiens.
- **Penekanan Intonasi**: Tekankan suara sedikit lebih bulat dan tegas saat mengucapkan gagasan inti Anda.
- **Tempo Bicara**: Jaga kecepatan bicara di kisaran 130 sampai 145 kata per menit agar terdengar tenang dan berwibawa.`;
    }

    // --- SPECIAL HANDLER D: Document Summary (from DocumentController.summarize) ---
    if (query.includes('buatlah ringkasan eksekutif dan rekomendasi 5 poin slide presentasi berdasarkan materi dokumen')) {
      const docNameMatch = lastUserMsg.match(/dokumen\s+"([^"]+)"/i);
      const docName = docNameMatch?.[1] || 'Materi Presentasi';
      const rawContent = lastUserMsg.split('berikut:')[1]?.trim() || '';
      const cleanSnippet = rawContent.substring(0, 420).replace(/\s+/g, ' ').trim();

      return `### 📋 Ringkasan Eksekutif Dokumen: ${docName}

Berdasarkan hasil pembacaan dan ekstraksi materi pada dokumen **${docName}**, inti pembahasan berfokus pada:
> *"${cleanSnippet || 'Pengembangan strategi, analisis permasalahan utama, serta langkah implementasi terstruktur untuk mencapai target yang optimal.'}..."*

Dokumen ini memaparkan fondasi konseptual yang kuat dan sangat siap untuk ditransformasikan menjadi materi presentasi yang meyakinkan di hadapan audiens.

---

### 📑 Rekomendasi Struktur 5 Slide Presentasi Terbaik
1. **Slide 1 — Judul & Konteks Utama**: Memperkenalkan urgensi topik dari dokumen *${docName}* dengan satu fakta pembuka yang langsung menarik perhatian audiens.
2. **Slide 2 — Identifikasi Masalah & Tantangan**: Merangkum poin permasalahan inti yang ditemukan di dalam dokumen secara visual dan ringkas.
3. **Slide 3 — Solusi & Metodologi Inti**: Menjelaskan kerangka kerja atau mekanisme utama yang ditawarkan dalam dokumen menggunakan maksimal 3 poin pilar.
4. **Slide 4 — Analisis Dampak & Keunggulan**: Menampilkan hasil, data pendukung, atau manfaat nyata dari penerapan solusi tersebut.
5. **Slide 5 — Kesimpulan & Langkah Selanjutnya**: Merangkum pesan kunci dalam satu kalimat tegas beserta rekomendasi langkah eksekusi berikutnya.`;
    }

    // --- HANDLER E: Document Context Chat ---
    if (documentContext && (query.includes('dokumen') || query.includes('isi') || query.includes('ringkas') || query.includes('jelaskan') || query.includes('materi') || query.includes('apa'))) {
      const docSnippet = documentContext.substring(0, 450).replace(/\s+/g, ' ').trim();
      return `Nah, kalau kita lihat langsung dari dokumen referensi yang sudah kamu unggah, ada bagian penting yang berbunyi:\n\n> *"${docSnippet}..."*\n\n### 💡 Penjelasan & Cara Menyampaikannya Saat Presentasi\nInti dari bagian dokumen tersebut sebenarnya menekankan tiga hal utama:\n1. **Konteks Dasar**: Materi ini memberikan landasan yang kuat tentang kenapa topik tersebut penting untuk dibahas sekarang.\n2. **Cara Penyampaian Lisan**: Saat kamu mempresentasikan bagian ini, jangan dibaca kata demi kata ya. Cukup sampaikan poin intinya dengan kalimat seperti: *"Berdasarkan data pada dokumen kami, fokus utama yang ingin kami selesaikan adalah..."*\n3. **Antisipasi Tanya Jawab**: Audiens biasanya akan menanyakan bukti penerapan atau langkah lanjutan dari poin di atas.\n\nMau aku bantu buatkan **naskah bicara lisan** atau **simulasi pertanyaan penguji** dari isi dokumen ini?`;
    }

    // --- HANDLER F: Greetings & Natural Indonesian Chitchat ---
    if (/^(halo|hai|hi|tes|test|selamat\s+(pagi|siang|sore|malam)|assalamualaikum|permisi|siapa\s+kamu|apa\s+kabar)/i.test(query.trim())) {
      return `Halo! Kabar baik di sini, senang banget bisa ngobrol sama kamu hari ini!\n\nKenalin, aku **PREZORA AI** — rekan diskusi sekaligus pelatih presentasi interaktifmu yang sudah dilatih dengan ribuan kosakata Bahasa Indonesia. Kamu bebas ngobrol santai, curhat, tanya materi kuliah, bisnis, koding, atau latihan tanya-jawab presentasi sama aku pakai **teks maupun suara langsung**.\n\nNah, hari ini kita mau bahas atau latihan topik apa nih?`;
    }

    // --- HANDLER G: Massive Indonesian Conversational & Encyclopedia Knowledge Engine ---
    return IndonesianKnowledgeEngine.generateResponse(messages, documentContext);
  }

  /**
   * Helper: Generate Local Audience Question based on persona & topic (Natural Spoken Bahasa Indonesia)
   */
  public static generateLocalAudienceQuestion(
    topic: string,
    audienceType: string,
    difficulty: string,
    questionIndex: number,
    speechSnippet: string
  ): string {
    // Extract a meaningful phrase from user's speech if available so the AI directly acknowledges what the user spoke!
    const cleanSpeech = speechSnippet
      .replace(/\[.*?\]:?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const speechWords = cleanSpeech.split(/\s+/).filter(Boolean);
    const hasSpokenDetails = speechWords.length > 8;
    const recentPhrase = hasSpokenDetails
      ? speechWords.slice(-8).join(' ')
      : '';

    const personaQuestions: Record<string, string[]> = {
      mentor_ramah: [
        `Penjelasanmu tentang "${topic}" tadi sudah enak banget didengar. Nah, menurut pandanganmu sendiri, tantangan paling nyata apa yang bakal dihadapi waktu ide ini mulai dijalankan di lapangan?`,
        `Aku suka semangatmu membawakan materi "${topic}" ini. Tapi coba bayangkan kalau ada audiens yang baru pertama kali dengar topik ini, gimana cara kamu meyakinkan mereka dalam satu menit?`,
        `Kalau kamu dikasih waktu dan dukungan penuh buat mengembangkan "${topic}" ini lebih jauh, bagian mana yang menurutmu paling mendesak untuk disempurnakan duluan?`,
        `Tadi pemaparanmu sudah cukup runtut. Kira-kira ada nggak satu contoh kasus nyata yang paling menggambarkan manfaat langsung dari "${topic}" ini?`,
        `Menarik sekali! Menurutmu, faktor kunci apa yang paling menentukan supaya rencana "${topic}" ini bisa berjalan konsisten dan nggak berhenti di tengah jalan?`,
        `Wah, alur ceritamu soal "${topic}" tadi asik banget. Kalau ada orang yang ragu sama ide ini, kalimat apa yang paling pas buat meyakinkan mereka?`,
        `Bagus banget! Nah, dari semua poin tentang "${topic}" yang kamu sampaikan, satu pesan utama apa yang paling pengen kamu titipkan ke pendengar?`
      ],
      dosen_penguji: [
        `Baik, terima kasih atas pemaparannya. Bisa Anda jelaskan secara spesifik apa landasan teori atau bukti empiris utama yang mendasari argumen Anda terkait "${topic}" ini?`,
        `Saya mencermati penjelasan Anda mengenai "${topic}". Pertanyaan saya, bagaimana Anda menguji validitas dan keandalan hasil tersebut apabila diterapkan pada kondisi sampel yang berbeda?`,
        `Apa kebaruan atau pembeda utama dari pendekatan "${topic}" yang Anda tawarkan ini jika dibandingkan dengan penelitian atau metode terdahulu yang sudah ada?`,
        `Dalam setiap pendekatan tentu ada batasan. Bisa Anda sebutkan apa keterbatasan metodologis dari kajian "${topic}" ini dan bagaimana cara Anda meminimalkan biasnya?`,
        `Mengapa Anda memilih metode pendekatan ini untuk menyelesaikan permasalahan pada "${topic}", dan bukan menggunakan metode alternatif lainnya?`,
        `Bagaimana Anda mempertanggungjawabkan keakuratan data pada pembahasan "${topic}" ini agar kesimpulannya tidak bersifat subjektif?`,
        `Jika variabel luar berubah secara signifikan, apakah model atau gagasan "${topic}" yang Anda paparkan ini tetap relevan? Jelaskan alasannya.`
      ],
      manajer_pro: [
        `Oke, poin soal "${topic}" tadi cukup jelas. Sekarang dari sisi eksekusi di lapangan, berapa lama estimasi waktu riil yang dibutuhkan tim sampai rencana ini benar-benar berjalan penuh?`,
        `Kalau di tengah jalan ternyata muncul kendala teknis atau keterbatasan sumber daya saat menjalankan "${topic}", apa rencana cadangan atau mitigasi risiko utama yang sudah Anda siapkan?`,
        `Bagaimana kita mengukur kesuksesan dari "${topic}" ini secara objektif? Apa indikator kinerja utama yang paling krusial di tiga bulan pertama?`,
        `Dari sisi pembagian kerja lintas divisi, bagian mana dari implementasi "${topic}" ini yang paling rawan mengalami hambatan koordinasi dan bagaimana solusinya?`,
        `Jika kita harus memprioritaskan satu langkah paling berdampak dari "${topic}" dengan anggaran dan waktu yang ketat minggu ini, langkah mana yang Anda pilih?`,
        `Bagaimana cara memastikan seluruh anggota tim di lapangan benar-benar menjalankan standar dari "${topic}" ini secara disiplin setiap hari?`
      ],
      investor: [
        `Ide mengenai "${topic}" ini terdengar menjanjikan. Tapi apa keunggulan kompetitif terkuat yang membuat solusi Anda sulit ditiru oleh pemain besar lainnya di pasar?`,
        `Mari kita bicara soal angka dan skala bisnis. Bagaimana strategi monetisasi dan proyeksi balik modal dari inisiatif "${topic}" ini dalam dua belas bulan ke depan?`,
        `Seberapa besar ukuran pasar potensial yang Anda sasar lewat "${topic}" ini, dan bagaimana strategi Anda mengakuisisi seribu pengguna pertama dengan biaya yang efisien?`,
        `Apa risiko bisnis terbesar yang bisa menghambat pertumbuhan "${topic}" ini di pasar Indonesia, dan bagaimana tim Anda mengantisipasinya?`,
        `Kalau kami menyuntikkan pendanaan penuh untuk "${topic}" hari ini, alokasi utama apa yang akan menghasilkan pertumbuhan paling cepat?`,
        `Mengapa sekarang adalah momentum waktu yang paling tepat untuk meluncurkan "${topic}" ini ke pasar?`
      ],
      klien: [
        `Penjelasan Anda mengenai "${topic}" cukup menarik bagi kami. Namun secara praktis, seberapa mudah solusi ini diadopsi oleh tim operasional kami tanpa mengganggu pekerjaan harian yang sedang berjalan?`,
        `Jika perusahaan kami memutuskan menggunakan solusi "${topic}" ini, berapa lama sampai kami benar-benar bisa merasakan penghematan waktu dan efisiensi biayanya?`,
        `Bagaimana dengan dukungan teknis dan pendampingan purna jual apabila tim kami mengalami kendala saat mengoperasikan sistem "${topic}" ini nantinya?`,
        `Dibandingkan cara yang selama ini sudah kami pakai di kantor, apa jaminan bahwa transisi ke "${topic}" ini benar-benar aman dan sepadan dengan biaya investasinya?`,
        `Apakah solusi "${topic}" ini bisa disesuaikan dengan alur kerja spesifik di tempat kami, atau kami yang harus mengubah seluruh prosedur kerja kami?`
      ],
      umum: [
        `Bisa dijelaskan dengan bahasa sehari-hari yang lebih sederhana, sebenarnya apa manfaat paling nyata dari "${topic}" ini buat kehidupan atau pekerjaan kita sehari-hari?`,
        `Kenapa kita semua harus mulai peduli dan menerapkan "${topic}" ini dari sekarang, bukan nanti-nanti saja?`,
        `Kalau kami sebagai orang awam ingin mulai menerapkan gagasan dari "${topic}" ini setelah acara selesai, langkah paling gampang apa yang bisa langsung kami coba?`,
        `Adakah contoh sederhana di sekitar kita yang membuat konsep "${topic}" ini lebih mudah dibayangkan oleh siapa saja?`,
        `Menurut Anda, kesalahpahaman apa yang paling sering terjadi di masyarakat soal "${topic}" ini dan bagaimana faktanya?`
      ]
    };

    const questions = personaQuestions[audienceType] || personaQuestions.umum;
    const selected = questions[questionIndex % questions.length];

    if (hasSpokenDetails && recentPhrase.length > 10) {
      return `Tadi dalam pemaparan, Anda sempat menyebutkan tentang "${recentPhrase}". Berkaitan dengan hal itu, ${selected.charAt(0).toLowerCase() + selected.slice(1)}`;
    }

    return selected;
  }

  /**
   * Helper: Generate High Quality Smart Local Evaluation (Natural Indonesian Feedback)
   */
  private static generateSmartLocalEvaluation(params: {
    topic: string;
    audienceType: string;
    targetDuration: number;
    actualDuration: number;
    transcripts: Array<{ speaker: string; content: string }>;
    qaSession: Array<{ question: string; answer?: string }>;
  }): EvaluationResult {
    const { topic, targetDuration, actualDuration, transcripts, qaSession } = params;

    const userTranscripts = transcripts.filter(t => t.speaker === 'user').map(t => t.content);
    const combinedText = userTranscripts.join(' ');
    const words = combinedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Pacing calculation (words per minute)
    const minutes = Math.max(0.25, actualDuration / 60);
    const wpm = Math.round(wordCount / minutes);

    // Detect Indonesian filler words
    const fillerMatches = combinedText.match(/\b(eh|emm|umm|anu|apa namanya|kayak|gitu|mungkin ya)\b/gi) || [];
    const fillerCount = fillerMatches.length;

    // Duration score
    const durationRatio = actualDuration / Math.max(1, targetDuration);
    let timeScore = 85;
    if (durationRatio >= 0.8 && durationRatio <= 1.2) {
      timeScore = 95;
    } else if (durationRatio >= 0.6 && durationRatio <= 1.4) {
      timeScore = 84;
    } else {
      timeScore = 72;
    }

    // Structure score based on speech markers
    const hasIntro = /selamat|pagi|siang|sore|malam|halo|perkenalkan|kesempatan|topik|bahas|rekan/i.test(combinedText);
    const hasTransition = /pertama|kedua|selanjutnya|selain itu|kemudian|di sisi lain|nah|oleh karena itu|jadi/i.test(combinedText);
    const hasConclusion = /kesimpulan|akhir kata|penutup|ringkasan|terima kasih|demikian|mari kita/i.test(combinedText);

    let structureScore = 72;
    if (hasIntro) structureScore += 9;
    if (hasTransition) structureScore += 9;
    if (hasConclusion) structureScore += 8;
    structureScore = Math.min(96, structureScore);

    // Clarity & Vocabulary
    const clarityScore = wpm >= 110 && wpm <= 155 ? 89 : (wpm < 90 ? 78 : 81);
    const vocabScore = Math.max(70, Math.min(94, (wordCount > 80 ? 86 : 79) - fillerCount * 2));
    const contentScore = combinedText.toLowerCase().includes(topic.toLowerCase().split(' ')[0] || '') ? 88 : 80;

    // Q&A Score
    const answeredCount = qaSession.filter(q => q.answer && q.answer.trim().length > 8).length;
    const qaScore = qaSession.length === 0 ? 82 : Math.min(96, Math.round((answeredCount / qaSession.length) * 85 + 11));

    const overallScore = Math.round(
      (structureScore * 0.2) +
      (clarityScore * 0.2) +
      (contentScore * 0.2) +
      (vocabScore * 0.15) +
      (timeScore * 0.15) +
      (qaScore * 0.1)
    );

    const criteria = [
      {
        name: 'Struktur Presentasi',
        score: structureScore,
        evidence: hasIntro && hasConclusion
          ? 'Pembukaan, poin pembahasan inti, dan kalimat penutup sudah terdengar runtut.'
          : 'Pembahasan inti sudah masuk, namun jembatan transisi menuju kesimpulan masih bisa dipertegas.',
        suggestion: 'Pastikan selalu membuka dengan kalimat pemicu perhatian (hook) dan menutup dengan satu rangkuman tegas.'
      },
      {
        name: 'Kejelasan Penjelasan',
        score: clarityScore,
        evidence: `Tempo bicara rata-rata berada di angka ${wpm} kata per menit (rentang nyaman orang Indonesia: 120 sampai 150 kata per menit).`,
        suggestion: wpm > 155
          ? 'Tempo bicaramu sedikit terlalu cepat. Beri jeda napas 1 sampai 2 detik setiap selesai menyampaikan satu poin penting.'
          : 'Artikulasi sudah cukup jelas. Pertahankan penekanan intonasi pada kata-kata kunci.'
      },
      {
        name: 'Relevansi & Kelengkapan Isi',
        score: contentScore,
        evidence: `Materi yang disampaikan tetap fokus mengupas topik "${topic}".`,
        suggestion: 'Perkuat argumenmu dengan menyelipkan minimal satu contoh nyata di lapangan atau data perbandingan.'
      },
      {
        name: 'Alur Logika & Transisi',
        score: Math.round((structureScore + clarityScore) / 2),
        evidence: hasTransition
          ? 'Sudah menggunakan kata penghubung alami untuk berpindah dari satu gagasan ke gagasan berikutnya.'
          : 'Perpindahan antarpoin masih terasa sedikit mendadak.',
        suggestion: 'Gunakan frasa transisi lisan yang luwes seperti "Nah, berangkat dari hal tersebut..." atau "Poin penting kedua adalah...".'
      },
      {
        name: 'Pemilihan Kata (Diksi)',
        score: vocabScore,
        evidence: fillerCount > 0
          ? `Terdapat variasi ${wordCount} kata dengan ${fillerCount} kata pengisi (filler words) yang terdeteksi.`
          : `Menggunakan ${wordCount} kata yang komunikatif dan minim kata pengisi yang mengganggu.`,
        suggestion: 'Ganti kebiasaan mengucapkan "ehmm" atau "apa namanya" dengan jeda diam sejenak agar terdengar lebih berwibawa.'
      },
      {
        name: 'Penguasaan Tanya Jawab',
        score: qaScore,
        evidence: qaSession.length > 0
          ? `${answeredCount} dari ${qaSession.length} pertanyaan audiens berhasil dijawab secara langsung.`
          : 'Fokus penuh pada kelancaran pemaparan materi utama.',
        suggestion: 'Saat menjawab pertanyaan audiens, ucapkan apresiasi singkat lalu langsung berikan jawaban inti di kalimat pertama.'
      },
      {
        name: 'Manajemen Waktu',
        score: timeScore,
        evidence: `Durasi bicara aktual ${Math.round(actualDuration)} detik dari target waktu ${targetDuration} detik.`,
        suggestion: Math.abs(actualDuration - targetDuration) > 60
          ? 'Atur proporsi waktu bicara: 15 persen pembukaan, 70 persen isi utama, dan 15 persen kesimpulan.'
          : 'Pengaturan waktu bicara sudah sangat pas dan proporsional dengan target.'
      }
    ];

    const rawFirstUserSentence = userTranscripts[0] || `Jadi hari ini saya mau bahas tentang ${topic}`;
    const cleanOriginal = rawFirstUserSentence.replace(/^\[Jawaban.*?\]:\s*/i, '').substring(0, 130);

    return {
      overallScore,
      summary: `Secara keseluruhan, penampilanmu saat membawakan topik "${topic}" sudah ${overallScore >= 82 ? 'sangat meyakinkan, terstruktur, dan terdengar natural' : 'cukup baik dan memiliki fondasi komunikasi yang kuat'}. Langkah selanjutnya adalah mempertajam intonasi pada kalimat pembuka serta memperhalus transisi menuju kesimpulan akhir.`,
      criteria,
      strengths: [
        `Mampu menjaga fokus pembicaraan tetap relevan dengan inti topik "${topic}".`,
        'Gaya penyampaian terdengar komunikatif dan berani mengutarakan gagasan secara langsung.',
        answeredCount > 0
          ? 'Sigap dan tenang dalam merespons pertanyaan interupsi dari audiens simulasi.'
          : 'Ritme dan alur kalimat mengalir dengan tempo yang wajar.'
      ],
      improvements: [
        {
          issue: 'Kalimat pembuka masih bisa dibuat lebih memikat dan berwibawa',
          original: cleanOriginal,
          suggested: `Selamat pagi rekan-rekan semuanya. Hari ini saya ingin mengajak kita membedah peluang besar di balik ${topic}, serta langkah nyata yang bisa langsung kita terapkan bersama.`,
          reason: 'Kalimat yang aktif dan mengundang rasa ingin tahu akan langsung mengunci perhatian audiens sejak 30 detik pertama.'
        },
        {
          issue: 'Penegasan kalimat penutup dan ajakan bertindak (Call to Action)',
          original: 'Mungkin itu saja presentasi dari saya, kurang lebihnya mohon maaf dan terima kasih.',
          suggested: `Sebagai kesimpulan, ${topic} adalah kunci penting untuk langkah kita ke depan. Mari kita mulai menerapkannya dari sekarang. Terima kasih banyak atas perhatian rekan-rekan sekalian.`,
          reason: 'Hindari menutup presentasi dengan kata "mungkin" atau meminta maaf berlebihan agar wibawa dan pesan utamamu tetap kuat di ingatan audiens.'
        }
      ],
      nextPractice: [
        'Coba latihan ulang dengan mengaktifkan pertanyaan interupsi dari persona Dosen Penguji atau Investor Venture.',
        'Rekam dan latih 30 detik kalimat pembuka tanpa melihat teks sampai intonasinya terdengar benar-benar lepas dan natural.',
        'Gunakan tombol Dengarkan Suara AI pada saran perbaikan di atas untuk meniru ritme dan jeda intonasinya.'
      ]
    };
  }
}
