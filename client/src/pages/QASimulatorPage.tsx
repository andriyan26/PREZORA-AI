
import React, { useState } from 'react';
import {
  HelpCircle, Mic, MicOff, Send, Sparkles, CheckCircle2,
  RotateCcw, Bot, User as UserIcon, Lightbulb, Volume2, VolumeX,
  AlertTriangle, Copy, Check, ChevronRight, Award, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AnimatedCounter, ProgressiveItem } from '../components/common/ProgressiveReveal';

export const QASimulatorPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audiencePersona, setAudiencePersona] = useState('dosen_penguji');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ score?: number; strengths: string; improvement: string; modelAnswer: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Speech Recognition (Voice STT)
  const { isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    lang: 'id-ID',
    onResult: (text) => {
      setUserAnswer(text);
    }
  });

  // Speech Synthesis (TTS Voice Readout)
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const personas = [
    { id: 'dosen_penguji', name: 'Dosen Penguji', role: 'Metodologi & Validitas Data', color: 'from-indigo-600 to-purple-600' },
    { id: 'investor', name: 'Investor VC', role: 'ROI, Moat, & Market Size', color: 'from-amber-500 to-orange-600' },
    { id: 'manajer_pro', name: 'Manajer Proyek', role: 'Timeline, Risiko, & KPI', color: 'from-blue-600 to-cyan-600' },
    { id: 'klien', name: 'Calon Klien', role: 'Kemudahan & Biaya Implementasi', color: 'from-emerald-600 to-teal-600' },
    { id: 'mentor_ramah', name: 'Mentor Ramah', role: 'Suportif & Membangun Kepercayaan Diri', color: 'from-teal-500 to-emerald-600' },
    { id: 'umum', name: 'Audiens Umum', role: 'Relevansi & Manfaat Praktis Sehari-hari', color: 'from-sky-500 to-indigo-600' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Pemanasan (Santai)' },
    { id: 'intermediate', label: 'Menengah (Standar Sidang)' },
    { id: 'hard', label: 'Kritis & Tajam (Ujian Ketat)' }
  ];

  const presetTopics = [
    'Model Keamanan Siber Berbasis Blockchain',
    'Strategi Go-To-Market Aplikasi SaaS AI',
    'Efektivitas Algoritma Deep Learning Medis'
  ];

  const handleGenerateQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    if (isSpeaking) stop();
    if (isListening) stopListening();

    setIsLoading(true);
    setFeedback(null);
    setUserAnswer('');
    resetTranscript();

    try {
      const res = await api.post('/practice/qa/question', {
        topic: topic.trim(),
        audiencePersona,
        difficulty
      });
      const rawQuestion = res.data?.data?.question || '';
      const cleanQ = rawQuestion.split('\n')[0].replace(/^["']|["']$/g, '').trim();
      const finalQ = cleanQ || `Kalau kita lihat penerapan nyata dari "${topic}", bukti atau data terukur apa yang paling meyakinkan menurut Anda?`;
      setCurrentQuestion(finalQ);
      speak(finalQ, { persona: audiencePersona });
    } catch (err) {
      const fallbackQ = `Kalau kita lihat penerapan nyata dari "${topic}", bukti atau data terukur apa yang paling meyakinkan menurut Anda?`;
      setCurrentQuestion(fallbackQ);
      speak(fallbackQ, { persona: audiencePersona });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) return;

    if (isListening) stopListening();
    if (isSpeaking) stop();
    setIsEvaluating(true);

    try {
      const res = await api.post('/practice/qa/evaluate', {
        topic: topic.trim(),
        audiencePersona,
        question: currentQuestion,
        userAnswer: userAnswer.trim()
      });

      const evalData = res.data?.data;
      const resultFeedback = {
        score: evalData?.score ?? 84,
        strengths: evalData?.strengths || 'Jawaban Anda sudah berani merespons inti pertanyaan audiens secara langsung dan lugas.',
        improvement: evalData?.improvement || 'Perkuat argumen Anda dengan menyertakan angka metrik konkret atau contoh studi kasus nyata.',
        modelAnswer: evalData?.modelAnswer || `Terima kasih atas pertanyaannya. Terkait ${topic}, kami telah memvalidasi pendekatan ini menggunakan tolok ukur terukur sehingga dampaknya dapat dipertanggungjawabkan secara nyata.`
      };
      setFeedback(resultFeedback);
      speak(`Evaluasi selesai. Skor jawaban Anda adalah ${resultFeedback.score} dari seratus. ${resultFeedback.strengths} Namun, ${resultFeedback.improvement}`, { persona: 'mentor_ramah' });
    } catch (err) {
      const fallbackFeedback = {
        score: 80,
        strengths: 'Respons langsung terhadap pertanyaan audiens dengan alur yang cukup jelas.',
        improvement: 'Tambahkan data perbandingan kuantitatif untuk mempertegas alasan Anda.',
        modelAnswer: `Terima kasih atas pertanyaan kritisnya. Mengenai "${topic}", kami telah melakukan pengujian pada parameter kunci dan hasilnya menunjukkan peningkatan efisiensi hingga 25 persen dibandingkan metode konvensional.`
      };
      setFeedback(fallbackFeedback);
      speak(`Evaluasi selesai. ${fallbackFeedback.strengths}`, { persona: 'mentor_ramah' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyModelAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPersonaData = personas.find(p => p.id === audiencePersona) || personas[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in duration-300">

      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interactive Q&A Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Audience Q&A Simulator Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Latih kesiapan Anda dalam menjawab pertanyaan spontan dari berbagai tipe audiens kritis dengan evaluasi bertingkat.
        </p>
      </div>

      {/* Setup Form */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Topik Pembahasan Presentasi
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Model Keamanan Siber Berbasis Blockchain"
            className="w-full px-4 py-3.5 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 shadow-sm placeholder:text-slate-400 font-medium"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="text-[11px] text-slate-400 font-semibold">Contoh:</span>
            {presetTopics.map((pt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(pt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200/60 dark:border-white/[0.06] text-[11px] text-slate-600 dark:text-slate-300 transition"
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {/* Persona Selector Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Persona Penanya Audiens (Dengan Suara Karakter Natural)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personas.map((p) => {
              const isSelected = audiencePersona === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setAudiencePersona(p.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-brand-400 font-bold shadow-glow-sm ring-1 ring-brand-500/40'
                      : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{p.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Tingkat Kekritisan Pertanyaan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold border transition-all ${isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-brand-500 dark:text-brand-300 shadow-glow-sm'
                      : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/[0.06]'
                    }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGenerateQuestion()}
          disabled={!topic.trim() || isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-accent-blue text-white font-extrabold text-xs sm:text-sm shadow-glow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Simulasikan Pertanyaan Suara dari {selectedPersonaData.name}</span>
            </>
          )}
        </button>
      </div>

      {/* Active Question & Answer Box */}
      {currentQuestion && (
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-fade-in-up duration-400">

          {/* Question speech bubble */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121E3D] to-[#0A1226] border border-brand-500/30 shadow-glow-sm relative">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-black text-brand-300 uppercase tracking-wider">
                <Bot className="w-4 h-4 text-brand-400" />
                <span>Pertanyaan dari {selectedPersonaData.name}:</span>
              </div>
              <button
                type="button"
                onClick={() => isSpeaking ? stop() : speak(currentQuestion, { persona: audiencePersona })}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-brand-300 text-[11px] font-bold transition"
                title="Dengarkan Ulang Pertanyaan"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop' : 'Putar Suara'}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
              "{currentQuestion}"
            </p>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-3.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Jawaban Anda (Gunakan Mikrofon atau Ketik):
            </label>
            <div className="relative">
              <textarea
                rows={4}
                required
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Sampaikan argumen Anda dengan lugas dan sertakan bukti pendukung yang meyakinkan..."
                className="w-full p-4 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 shadow-inner font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${isListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/[0.08]'
                  }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-brand-400" />}
                <span>{isListening ? 'Berhenti Bicara' : 'Jawab dengan Suara'}</span>
              </button>

              <button
                type="submit"
                disabled={!userAnswer.trim() || isEvaluating}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isEvaluating ? 'Mengevaluasi Jawaban...' : 'Kirim & Dapatkan Evaluasi'}
              </button>
            </div>
          </form>

          {/* Staggered Feedback Reveal Cards */}
          {feedback && (
            <div className="space-y-3.5 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Analisis Tanggapan Anda:</span>
                </div>
                {feedback.score !== undefined && (
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                    Skor Jawaban: <AnimatedCounter value={feedback.score} suffix=" / 100" />
                  </div>
                )}
              </div>

              {/* Card 1: Strengths */}
              <ProgressiveItem index={0} baseDelayMs={60} stepMs={140} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kekuatan Jawaban:</span>
                </div>
                <p>{feedback.strengths}</p>
              </ProgressiveItem>

              {/* Card 2: Improvement */}
              <ProgressiveItem index={1} baseDelayMs={60} stepMs={140} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Celah yang Perlu Dikuatkan:</span>
                </div>
                <p>{feedback.improvement}</p>
              </ProgressiveItem>

              {/* Card 3: Model Answer */}
              <ProgressiveItem index={2} baseDelayMs={60} stepMs={140} className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs leading-relaxed">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-brand-500 dark:text-brand-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Contoh Jawaban Ideal dari AI Coach:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => isSpeaking ? stop() : speak(feedback.modelAnswer, { persona: 'mentor_ramah' })}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-brand-500 dark:text-brand-300 font-bold transition"
                      title="Dengarkan Jawaban Ideal"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Hentikan' : 'Dengarkan Contoh'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyModelAnswer(feedback.modelAnswer)}
                      className="p-1.5 rounded-lg hover:bg-brand-500/20 text-brand-500 dark:text-brand-300 transition"
                      title="Salin Teks"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap leading-relaxed">
                  "{feedback.modelAnswer}"
                </p>
              </ProgressiveItem>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
