import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Play, Square, Send, Users, 
  HelpCircle, Radio, Volume2, VolumeX, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PracticeSession } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getNaturalIndonesianAck } from '../utils/indonesianSpeechNormalizer';

export const PracticeRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [inputText, setInputText] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<{ id: string; text: string } | null>(null);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [isRequestingQuestion, setIsRequestingQuestion] = useState(false);

  const greetedSessionRef = useRef<string | null>(null);
  const activeQuestionRef = useRef<{ id: string; text: string } | null>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  // Fetch session details
  const { data: session, refetch } = useQuery<PracticeSession>({
    queryKey: ['practice-session', id],
    queryFn: async () => {
      const res = await api.get(`/practice/sessions/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  // Speech Recognition (Live Voice STT with Anti-Bentrok Echo Guard)
  const { 
    isListening, 
    interimTranscript,
    error: micError,
    startListening, 
    stopListening, 
  } = useSpeechRecognition({
    lang: 'id-ID',
    continuous: true,
    interimResults: true,
    onResult: (finalSentence) => {
      if (!finalSentence || !finalSentence.trim()) return;
      // If an audience question is currently open, also populate answer input for easy submission
      if (activeQuestionRef.current) {
        setUserAnswerInput((prev) => (prev ? `${prev} ${finalSentence.trim()}` : finalSentence.trim()));
      } else {
        handleSaveTranscript(finalSentence.trim());
      }
    }
  });

  // Speech Synthesis for Natural Indonesian Persona Voice
  const { 
    speak, 
    cancel,
    isSpeaking, 
    isMuted, 
    toggleMute, 
  } = useSpeechSynthesis();

  // Natural Indonesian Persona Configuration ("Seperti Orang Indonesia Beneran Lagi Ngomong")
  const personaMap: Record<string, { name: string; title: string; intro: string; avatarColor: string }> = {
    manajer_pro: {
      name: 'Manajer Eksekutif',
      title: 'Eksekusi & KPI Bisnis',
      intro: 'Halo, selamat bergabung di ruang rapat. Kita langsung saja ya, silakan paparkan rencana proyekmu. Saya ingin melihat bagaimana eksekusinya di lapangan, target waktunya, serta antisipasi kalau ada kendala. Silakan dimulai.',
      avatarColor: 'from-blue-600 via-indigo-600 to-cyan-500'
    },
    dosen_penguji: {
      name: 'Dosen Penguji',
      title: 'Akademis & Metodologi',
      intro: 'Selamat pagi. Silakan dimulai pemaparan materinya dengan tenang ya. Nanti saya akan menyimak alur latar belakang masalah, metodologi yang Anda gunakan, sampai ke kesimpulannya. Waktu dan tempat dipersilakan.',
      avatarColor: 'from-indigo-600 via-purple-600 to-brand-500'
    },
    investor: {
      name: 'Investor Venture',
      title: 'ROI & Skalabilitas Pasar',
      intro: 'Halo! Senang bisa bertemu hari ini. Saya penasaran sekali dengan inovasi yang kamu bawa. Coba ceritakan masalah utama yang kamu selesaikan, kenapa solusimu unggul dari kompetitor, dan bagaimana potensi bisnisnya ke depan. Silakan!',
      avatarColor: 'from-amber-500 via-orange-600 to-yellow-500'
    },
    klien: {
      name: 'Calon Klien',
      title: 'Nilai Solusi & Efisiensi',
      intro: 'Halo, terima kasih sudah meluangkan waktu untuk presentasi ke tim kami. Jujur kami ingin tahu bagaimana solusi ini bisa benar-benar membantu operasional kami sehari-hari dengan mudah dan efisien. Silakan dijelaskan ya.',
      avatarColor: 'from-emerald-600 via-teal-600 to-cyan-600'
    },
    mentor_ramah: {
      name: 'Mentor Ramah',
      title: 'Suportif & Konstruktif',
      intro: 'Halo! Santai saja ya, anggap kita sedang mengobrol santai sebelum kamu tampil sungguhan. Tarik napas dulu, lalu silakan mulai presentasimu kapan pun kamu siap. Aku mendengarkan dari sini ya!',
      avatarColor: 'from-teal-500 via-emerald-500 to-sky-500'
    },
    umum: {
      name: 'Audiens Umum',
      title: 'Komunikasi Luas & Akrab',
      intro: 'Halo semuanya! Wah, topiknya menarik sekali nih. Yuk silakan dimulai presentasinya, pakai bahasa yang santai dan gampang dipahami saja ya, kami siap menyimak!',
      avatarColor: 'from-purple-600 via-brand-600 to-pink-500'
    }
  };

  const personaKey = session?.audienceType || 'manajer_pro';
  const currentPersona = personaMap[personaKey] || personaMap.manajer_pro;

  // Auto-sync started state if session is already in_progress
  useEffect(() => {
    if (session && session.status === 'in_progress' && !hasStarted) {
      setHasStarted(true);
    }
  }, [session, hasStarted]);

  // Single-trigger guard for initial persona greeting so it NEVER collides or plays twice
  useEffect(() => {
    if (hasStarted && session && id && greetedSessionRef.current !== id) {
      greetedSessionRef.current = id;
      if (!session.transcripts || session.transcripts.length === 0) {
        api.post(`/practice/sessions/${id}/transcripts`, {
          speaker: 'assistant',
          content: currentPersona.intro
        }).then(() => {
          refetch();
          speak(currentPersona.intro, { persona: personaKey });
        }).catch(() => {});
      }
    }
  }, [hasStarted, session, id, currentPersona.intro, personaKey, refetch, speak]);

  // Timer counter
  useEffect(() => {
    let timer: any;
    if (hasStarted) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted]);

  // If already completed, jump to evaluation
  useEffect(() => {
    if (session && session.status === 'completed') {
      navigate(`/practice/${id}/evaluation`, { replace: true });
    }
  }, [session, id, navigate]);

  // Scroll transcripts to bottom
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.transcripts, activeQuestion, interimTranscript]);

  const handleStartSession = async () => {
    if (!id) return;
    greetedSessionRef.current = id;
    try {
      await api.post(`/practice/sessions/${id}/start`);
      setHasStarted(true);
      if (!session?.transcripts || session.transcripts.length === 0) {
        await api.post(`/practice/sessions/${id}/transcripts`, {
          speaker: 'assistant',
          content: currentPersona.intro
        });
      }
      await refetch();
      startListening();
      speak(currentPersona.intro, { persona: personaKey });
    } catch (e) {
      console.error(e);
      setHasStarted(true);
      startListening();
      speak(currentPersona.intro, { persona: personaKey });
    }
  };

  const handleSaveTranscript = async (contentToSend: string) => {
    if (!contentToSend.trim() || !id) return;
    try {
      await api.post(`/practice/sessions/${id}/transcripts`, {
        speaker: 'user',
        content: contentToSend.trim()
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSaveTranscript(inputText);
    setInputText('');
  };

  const handleTriggerAudienceQuestion = async () => {
    if (!id || isRequestingQuestion) return;
    setIsRequestingQuestion(true);
    try {
      const res = await api.post(`/practice/sessions/${id}/audience-question`);
      const q = res.data.data;
      setActiveQuestion({ id: q.id, text: q.question });
      refetch();
      speak(q.question, { persona: personaKey });
    } catch (e) {
      console.error(e);
      const fallback = `Menarik sekali pembahasan Anda. Bagaimana Anda memastikan rencana "${session?.topic || 'presentasi ini'}" dapat berjalan efektif di lapangan sesuai target?`;
      setActiveQuestion({ id: 'fallback-' + Date.now(), text: fallback });
      speak(fallback, { persona: personaKey });
    } finally {
      setIsRequestingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !userAnswerInput.trim()) return;

    const answerText = userAnswerInput.trim();
    const qId = activeQuestion.id;

    try {
      if (qId.startsWith('fallback-')) {
        await api.post(`/practice/sessions/${id}/transcripts`, {
          speaker: 'user',
          content: `[Jawaban untuk Audiens]: ${answerText}`
        });
      } else {
        await api.patch(`/practice/sessions/${id}/questions/${qId}`, {
          answer: answerText
        });
      }

      setActiveQuestion(null);
      setUserAnswerInput('');
      refetch();

      // Natural Indonesian conversational acknowledgment from persona
      const ackMsg = getNaturalIndonesianAck(personaKey, answerText);
      setTimeout(() => {
        api.post(`/practice/sessions/${id}/transcripts`, {
          speaker: 'assistant',
          content: ackMsg
        }).then(() => {
          refetch();
          speak(ackMsg, { persona: personaKey });
        });
      }, 450);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinishPractice = async () => {
    if (!id || isFinishing) return;
    setIsFinishing(true);
    cancel();
    stopListening();

    try {
      await api.post(`/practice/sessions/${id}/finish`, {
        actualDurationSeconds: elapsedSeconds
      });

      await api.post(`/practice/sessions/${id}/evaluate`);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      navigate(`/practice/${id}/evaluation`);
    } catch (e) {
      console.error(e);
      navigate(`/practice/${id}/evaluation`);
    } finally {
      setIsFinishing(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const targetSec = session?.targetDurationSeconds || 300;
  const remainingSec = Math.max(0, targetSec - elapsedSeconds);
  const transcripts = session?.transcripts || [];

  return (
    <div className="space-y-4 sm:space-y-6 animate-stagger-1">
      
      {/* Top Cockpit Header (100% Responsive on HP & Desktop) */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card-luxury specular-border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border border-slate-200/90 dark:border-white/[0.09] shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue text-white flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                Cockpit Latihan • {session?.practiceType?.toUpperCase() || 'PUBLIC_SPEAKING'}
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              {session?.title || 'Sesi Latihan Presentasi'}
            </h1>
          </div>
        </div>

        {/* Status, Timers & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Mute/Audio toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border transition ${
                isMuted 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-brand-500/10 border-brand-500/20 text-brand-500 dark:text-brand-300 hover:bg-brand-500/20'
              }`}
              title={isMuted ? 'Nyalakan Suara Lawan Bicara' : 'Bisukan Suara Lawan Bicara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Timers */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#070D1D] px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-xs font-bold">
              <div className="text-slate-500 dark:text-slate-400">
                <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-extrabold">Berjalan</span>
                <span className="text-brand-600 dark:text-brand-300 font-mono text-xs">{formatTimer(elapsedSeconds)}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="text-slate-500 dark:text-slate-400">
                <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-extrabold">Sisa Waktu</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-200">{formatTimer(remainingSec)}</span>
              </div>
            </div>
          </div>

          {/* Finish Button */}
          {hasStarted && (
            <button
              onClick={handleFinishPractice}
              disabled={isFinishing}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs shadow-glow-emerald transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFinishing ? 'Menganalisis...' : 'Selesai & Evaluasi'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-3xl sm:rounded-[2.5rem] glass-card-luxury specular-border overflow-hidden border border-slate-200/90 dark:border-white/[0.09] shadow-2xl min-h-[540px] sm:min-h-[600px] animate-stagger-2">
        
        {/* Left Column: Simulated Audience Persona Card & Mic Status */}
        <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#090F22]/70 flex flex-col justify-between gap-4">
          <div className="space-y-3.5 sm:space-y-4">
            
            {/* Persona Identity Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D152A] border border-slate-200/80 dark:border-white/[0.09] shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${currentPersona.avatarColor} text-white flex items-center justify-center font-black text-lg shadow-glow-sm relative flex-shrink-0`}>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {currentPersona.name}
                  </h3>
                  <div className="text-[10px] text-brand-500 dark:text-brand-400 font-bold uppercase tracking-wider truncate">
                    {currentPersona.title}
                  </div>
                  <span className="inline-block mt-0.5 text-[9px] font-black px-2 py-0.2 rounded-md bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/25">
                    Suara Natural Indonesia • {session?.interactionMode?.toUpperCase() || 'INTERACTIVE'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Audiens simulasi menyimak artikulasi kalimat, tempo bicara, dan kejelasan alur logikamu secara langsung tanpa bentrok mikrofon.
              </div>

              {/* Persona Talking Indicator */}
              {isSpeaking && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-300 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>{currentPersona.name} Sedang Berbicara...</span>
                  </div>
                  <button
                    type="button"
                    onClick={cancel}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-rose-500/30 text-[10px] font-black transition"
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>

            {/* Simulasikan Pertanyaan Audiens Button */}
            {hasStarted && session?.interactionMode !== 'practice' && (
              <button
                type="button"
                onClick={handleTriggerAudienceQuestion}
                disabled={isRequestingQuestion}
                className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs transition flex items-center justify-center gap-2 active:scale-95 shadow-glow-sm"
              >
                <HelpCircle className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <span>{isRequestingQuestion ? 'Menyiapkan Pertanyaan Lisan...' : 'Simulasikan Pertanyaan Audiens'}</span>
              </button>
            )}

            {/* Replay Counterpart Audio Button */}
            {hasStarted && (
              <button
                type="button"
                onClick={() => speak(currentPersona.intro, { persona: personaKey })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Volume2 className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                <span>Putar Sapaan {currentPersona.name}</span>
              </button>
            )}
          </div>

          {/* Microphone Status Box */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0E162D] border border-slate-200/80 dark:border-white/[0.09] text-center shadow-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Mikrofon Anda
            </div>
            {isListening ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 py-1">
                  <span className="waveform-bar text-emerald-400" />
                  <span className="waveform-bar text-emerald-400" />
                  <span className="waveform-bar text-emerald-400" />
                  <span className="waveform-bar text-emerald-400" />
                  <span className="waveform-bar text-emerald-400" />
                </div>
                <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isSpeaking ? 'Menyimak Lawan Bicara (Echo Guard)' : 'Mikrofon Aktif — Silakan Berbicara'}</span>
                </span>
                <span className="text-[10px] text-slate-400">Suara Anda otomatis dicatat & dianalisis</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">
                  Mikrofon sedang tidak aktif.
                </div>
                <button
                  onClick={startListening}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-500 dark:text-brand-400 text-xs font-extrabold transition inline-flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Aktifkan Mikrofon Sekarang</span>
                </button>
              </div>
            )}

            {micError && (
              <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-500 dark:text-amber-400 font-medium text-left">
                ⚠️ {micError}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Transcripts Stream & Active Question Card */}
        <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0B1122] min-h-[380px]">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
            {!hasStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-4 sm:p-6 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 to-accent-blue text-white flex items-center justify-center mb-5 shadow-glow-md">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  Siap Memulai Simulasi Presentasi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-normal">
                  Bicaralah dengan lepas dan percaya diri. {currentPersona.name} akan menyapamu dengan suara Indonesia natural dan menyimak presentasimu secara real-time.
                </p>
                <button
                  onClick={handleStartSession}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm shadow-glow-md transition flex items-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Presentasi Sekarang</span>
                </button>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-700 dark:text-brand-300 font-medium animate-fade-in flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span>🎙️ <strong>Sesi Latihan Aktif:</strong> Bicaralah dengan intonasi natural. Ucapanmu otomatis dicatat untuk evaluasi 7 dimensi.</span>
                  </div>
                </div>

                {/* Transcripts Feed */}
                {transcripts.map((t, idx) => {
                  const isUser = t.speaker === 'user';
                  return (
                    <div
                      key={t.id || idx}
                      className={`flex gap-2.5 sm:gap-3 max-w-2xl animate-fade-in-up ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      style={{ animationDelay: `${Math.min(idx * 0.06, 0.3)}s` }}
                    >
                      <div
                        className={`w-8 h-8 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${
                          isUser ? 'bg-gradient-to-tr from-brand-600 to-indigo-600' : 'bg-gradient-to-tr from-darkCard to-indigo-950 border border-white/10'
                        }`}
                      >
                        {isUser ? 'P' : 'A'}
                      </div>
                      <div
                        className={`rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                            : 'glass-panel text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-white/[0.09]'
                        }`}
                      >
                        <div className="break-words">{t.content}</div>

                        {/* Re-listen button for audience speeches */}
                        {!isUser && (
                          <button
                            onClick={() => speak(t.content, { persona: personaKey })}
                            className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition"
                            title="Dengarkan Suara Lawan Bicara"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Dengarkan Suara {currentPersona.name}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Live Interim Transcript Bubble (Instant Visual Speech Feedback) */}
                {isListening && interimTranscript && (
                  <div className="flex gap-3 max-w-2xl ml-auto flex-row-reverse animate-pulse">
                    <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-emerald-500/30">
                      <Mic className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="rounded-3xl p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs sm:text-sm italic">
                      "{interimTranscript}..."
                    </div>
                  </div>
                )}

                {/* Active Question Modal/Card (Responsive on Mobile HP & Desktop) */}
                {activeQuestion && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/95 via-orange-600/95 to-amber-600 text-white shadow-2xl animate-fade-in-scale border border-amber-300/30">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Pertanyaan {currentPersona.name}:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speak(activeQuestion.text, { persona: personaKey })}
                        className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-[11px] font-black transition flex items-center gap-1 flex-shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Putar Suara</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-base font-extrabold leading-relaxed mb-4">
                      "{activeQuestion.text}"
                    </p>

                    <form onSubmit={handleSubmitAnswer} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        value={userAnswerInput}
                        onChange={(e) => setUserAnswerInput(e.target.value)}
                        placeholder="Bicara langsung di mikrofon atau ketik jawaban Anda..."
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm focus:outline-none shadow-inner font-medium placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-black text-white font-black text-xs transition active:scale-95 shadow-md flex-shrink-0"
                      >
                        Kirim Jawaban
                      </button>
                    </form>
                  </div>
                )}

                <div ref={transcriptsEndRef} />
              </>
            )}
          </div>

          {/* Bottom Audio & Input Bar */}
          {hasStarted && (
            <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#080E1E]/90">
              <form onSubmit={handleManualSendText} className="flex items-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 sm:p-3.5 rounded-2xl flex-shrink-0 transition active:scale-95 ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-500 hover:to-indigo-500 shadow-glow-sm'
                  }`}
                  title={isListening ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik kalimat presentasi manual jika tidak memakai mikrofon..."
                  className="flex-1 min-w-0 py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 shadow-inner font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 text-white transition active:scale-95 shadow-glow-sm flex-shrink-0"
                  title="Kirim Transkrip"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
