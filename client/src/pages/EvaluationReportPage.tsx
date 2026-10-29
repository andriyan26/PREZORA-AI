import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, 
  BarChart3, Sparkles, TrendingUp, HelpCircle, FileText, Check, Volume2, VolumeX
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { PracticeEvaluation, PracticeSession } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AnimatedCounter, AnimatedProgressBar, ProgressiveItem } from '../components/common/ProgressiveReveal';

export const EvaluationReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Fetch session details
  const { data: session } = useQuery<PracticeSession>({
    queryKey: ['practice-session', id],
    queryFn: async () => {
      const res = await api.get(`/practice/sessions/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  // Fetch evaluation
  const { data: evaluation, isLoading } = useQuery<PracticeEvaluation>({
    queryKey: ['practice-evaluation', id],
    queryFn: async () => {
      const res = await api.get(`/practice/sessions/${id}/evaluation`);
      return res.data.data;
    },
    enabled: !!id
  });

  // Retry session mutation
  const retryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/practice/sessions/${id}/retry`);
      return res.data.data;
    },
    onSuccess: (newSession) => {
      navigate(`/practice/${newSession.id}`);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/15 text-brand-400 flex items-center justify-center animate-spin mb-4 shadow-glow-md">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">
          Sedang Mengolah Evaluasi AI 7 Dimensi...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Menganalisis transkrip ucapan, artikulasi, dan tempo bicara Anda.
        </p>
      </div>
    );
  }

  const score = evaluation?.overallScore ?? 75;
  const getGrade = (sc: number) => {
    if (sc >= 88) return { letter: 'A+', text: 'Sangat Memukau (Executive Level)', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-glow-emerald' };
    if (sc >= 80) return { letter: 'A', text: 'Percaya Diri & Terstruktur', color: 'text-brand-400 border-brand-500/50 bg-brand-500/10 shadow-glow-md' };
    if (sc >= 70) return { letter: 'B', text: 'Cukup Baik & Potensial', color: 'text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-glow-amber' };
    return { letter: 'C', text: 'Perlu Latihan Tambahan', color: 'text-rose-400 border-rose-500/50 bg-rose-500/10' };
  };

  const grade = getGrade(score);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-1 sm:pt-3 animate-fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-stagger-1">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2 shadow-glow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Laporan Hasil Evaluasi Terverifikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Laporan Evaluasi Presentasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Topik: "{session?.topic}" • Persona: {session?.audienceType?.replace('_', ' ')}
          </p>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => retryMutation.mutate()}
          disabled={retryMutation.isPending}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-sm transition flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Latihan Ulang Sesi Ini</span>
        </button>
      </div>

      {/* Hero Score Showcase Card */}
      <div className="p-6 sm:p-10 rounded-[2.5rem] glass-card-luxury specular-border relative overflow-hidden border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-2">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          
          {/* Circular Score Gauge */}
          <div className={`w-36 h-36 rounded-3xl border-4 flex flex-col items-center justify-center flex-shrink-0 shadow-inner ${grade.color}`}>
            <span className="text-5xl font-black tracking-tight">
              <AnimatedCounter value={score} durationMs={1150} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider mt-1 opacity-80">Skor / 100</span>
            <span className="text-xs font-black mt-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#080E1E] shadow-sm">
              Grade {grade.letter}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="text-[11px] font-black uppercase tracking-wider text-brand-400 mb-1">
              {grade.text}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-snug">
              Ringkasan Performa Berbicara Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
              {evaluation?.summary}
            </p>
            <button
              type="button"
              onClick={() =>
                isSpeaking
                  ? stop()
                  : speak(
                      `Hasil evaluasi latihan presentasi Anda sudah siap. Skor keseluruhan Anda adalah ${score} dari seratus, dengan predikat ${grade.letter}. ${evaluation?.summary || ''}`,
                      { persona: 'mentor_ramah' }
                    )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-500 dark:text-brand-300 text-xs font-extrabold transition active:scale-95"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Hentikan Pembacaan Suara AI' : 'Dengarkan Ringkasan Evaluasi AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Dimensi Penilaian Breakdown */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" />
            Detail Penilaian 7 Dimensi Berbicara
          </h3>
          <span className="text-xs text-brand-400 font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
            Skala 0–100
          </span>
        </div>

        <div className="space-y-3.5">
          {evaluation?.criteria?.map((item, idx) => (
            <ProgressiveItem 
              key={idx} 
              index={idx}
              baseDelayMs={180}
              stepMs={115}
              className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speak(`Dimensi ${item.name}, skor ${item.score} dari seratus. Saran AI: ${item.suggestion}`, { persona: 'mentor_ramah' })}
                    className="p-1 rounded-lg hover:bg-brand-500/15 text-brand-400 transition"
                    title="Dengarkan Saran Dimensi Ini"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-black text-xs sm:text-sm text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                    <AnimatedCounter value={item.score} suffix=" / 100" durationMs={1000} />
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                <AnimatedProgressBar 
                  percentage={item.score} 
                  delayMs={240 + idx * 120}
                  className="bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-200">Bukti Transkrip: </strong>
                  {item.evidence}
                </div>
                <div className="text-brand-600 dark:text-brand-300 font-medium">
                  <strong className="text-slate-700 dark:text-slate-200">Saran AI: </strong>
                  {item.suggestion}
                </div>
              </div>
            </ProgressiveItem>
          ))}
        </div>
      </div>

      {/* Strengths & Next Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger-4">
        {/* Strengths */}
        <div className="p-6 rounded-[2rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09]">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Kekuatan Utama Anda
          </h3>
          <ul className="space-y-3">
            {evaluation?.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Practice */}
        <div className="p-6 rounded-[2rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09]">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Langkah Latihan Selanjutnya
          </h3>
          <ul className="space-y-3">
            {evaluation?.nextPractice?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  →
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Before & After Refinements */}
      {evaluation?.improvements && evaluation.improvements.length > 0 && (
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-5">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Penyempurnaan Kalimat (Before vs After)
          </h3>

          <div className="space-y-4">
            {evaluation.improvements.map((imp, idx) => (
              <ProgressiveItem key={idx} index={idx} baseDelayMs={200} stepMs={130} className="p-5 rounded-3xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  Poin Masalah: <span className="text-amber-400">{imp.issue}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-900/40">
                    <div className="font-black text-rose-500 dark:text-rose-400 text-[10px] uppercase tracking-wider mb-1">
                      Kalimat Asli (Transkrip):
                    </div>
                    <div className="italic text-slate-700 dark:text-slate-300">
                      "{imp.original}"
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/40 relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-black text-emerald-500 dark:text-emerald-400 text-[10px] uppercase tracking-wider">
                        Versi Disarankan (AI Coach):
                      </div>
                      <button
                        type="button"
                        onClick={() => isSpeaking ? stop() : speak(imp.suggested, { persona: 'mentor_ramah' })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition"
                        title="Dengarkan Contoh Pengucapan Natural"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Dengarkan</span>
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-300">
                      "{imp.suggested}"
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Alasan Perbaikan: </strong>
                  {imp.reason}
                </div>
              </ProgressiveItem>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-white/5 animate-stagger-6">
        <Link
          to="/history"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          ← Kembali ke Riwayat
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-sm transition active:scale-95"
        >
          Buka Dashboard
        </Link>
      </div>
    </div>
  );
};
