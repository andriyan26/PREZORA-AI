import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, MessageSquare, Mic, FolderGit2, 
  Award, Clock, Lightbulb, 
  Flame, ChevronRight, Volume2, Square, Radio
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { AnalyticsOverview } from '../types';
import { RealtimeClock } from '../components/common/RealtimeClock';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AnimatedCounter, ProgressiveItem } from '../components/common/ProgressiveReveal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data.data;
    }
  });

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Kawan';

  const handlePlayWelcomeVoice = () => {
    if (isSpeaking) {
      cancel();
      return;
    }
    const avgText = overview?.averageScore
      ? `Rata-rata skor presentasimu saat ini adalah ${overview.averageScore} dari 100.`
      : `Yuk mulai sesi latihan pertamamu hari ini.`;
    const recText = overview?.recommendation || 'Kita bisa mulai diskusi topik apa saja atau langsung latihan bicara di ruang simulasi.';
    speak(
      `Halo ${firstName}! Selamat datang kembali di Prezora Ey-Ay. Senang banget bisa menemani latihan komunikasimu hari ini. ${avgText} ${recText}`,
      { persona: 'mentor_ramah' }
    );
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      
      {/* High-End Luxury Hero Banner with Studio Cockpit */}
      <div className="relative rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 bg-gradient-to-br from-[#121B36] via-[#0E162D] to-[#080E1E] text-white shadow-2xl overflow-hidden border border-white/[0.1] specular-border animate-stagger-1">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-56 sm:w-64 h-56 sm:h-64 bg-accent-blue/15 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Text & CTA Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 backdrop-blur-md text-brand-300 text-[11px] sm:text-xs font-bold border border-brand-400/20 shadow-glow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-pulse-subtle" />
                <span>PREZORA Natural Voice Engine</span>
              </div>
              <div className="hidden sm:block">
                <RealtimeClock showDate={true} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 leading-tight text-white">
              Halo, {firstName}! Selamat Datang di{' '}
              <span className="bg-gradient-to-r from-white via-brand-200 to-indigo-300 bg-clip-text text-transparent">
                PREZORA AI
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6 max-w-xl font-normal">
              Kuasai seni public speaking dan presentasi profesional secara terukur. Diskusikan ide bersama asisten AI bersuara Indonesia natural atau simulasikan sidang & presentasi dengan evaluasi 7 dimensi.
            </p>

            <div className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2.5 sm:gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-md transition-all hover:scale-[1.02] active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mulai Diskusi AI</span>
              </Link>
              <Link
                to="/practice/setup"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/[0.15] transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <Mic className="w-4 h-4 text-brand-300" />
                <span>Simulasi Presentasi</span>
              </Link>
              <button
                type="button"
                onClick={handlePlayWelcomeVoice}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md border transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-glow-emerald'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] border-white/[0.12] text-brand-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Hentikan Sapaan</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Sapaan Suara AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Luxury Studio Cockpit Card */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-5 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/[0.12] shadow-2xl space-y-3.5 sm:space-y-4 specular-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-sm" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Live Studio Cockpit • Natural ID
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Suara Natural Siap
                </span>
              </div>

              {/* Dynamic Soundwave Spectrum Animation */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between gap-1.5 h-12 sm:h-14">
                {[40, 65, 85, 30, 95, 55, 75, 45, 90, 60, 80, 50, 70, 90, 40].map((height, i) => (
                  <div 
                    key={i}
                    className={`flex-1 bg-gradient-to-t from-brand-600 via-indigo-400 to-accent-blue rounded-full transition-all duration-300 ${
                      isSpeaking ? 'animate-wave' : 'animate-pulse'
                    }`}
                    style={{ 
                      height: `${height}%`, 
                      animationDelay: `${i * 110}ms`,
                      opacity: 0.7 + (height / 300)
                    }}
                  />
                ))}
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Intonasi Ideal</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">130 - 150 WPM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Evaluasi AI</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">7 Dimensi Lisan</div>
                </div>
              </div>

              <Link
                to="/practice/qa"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-bold text-slate-200 transition active:scale-95 border border-white/[0.08]"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">Latihan Kilat Audience Q&A Drill</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bento-Style Elevated Stats Grid with Progressive Slow Reveal & Animated Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Chat */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel-hover relative overflow-hidden group animate-stagger-2 border-t-brand-500/30">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Percakapan</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-sm flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isLoading ? (
              <div className="w-14 h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            ) : (
              <AnimatedCounter value={overview?.conversationsCount ?? 0} delayMs={180} />
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">●</span>
            <span className="truncate">Diskusi AI tersimpan</span>
          </div>
        </div>

        {/* Card 2: Practice Sessions */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel-hover relative overflow-hidden group animate-stagger-3 border-t-accent-blue/30">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Sesi Latihan</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-accent-blue/15 text-accent-blue flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-sm flex-shrink-0">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isLoading ? (
              <div className="w-14 h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            ) : (
              <AnimatedCounter value={overview?.totalSessions ?? 0} delayMs={320} />
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-accent-blue font-bold">✓</span>
            <span className="truncate">{overview?.completedSessionsCount ?? 0} selesai dievaluasi</span>
          </div>
        </div>

        {/* Card 3: Average Score */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel-hover relative overflow-hidden group animate-stagger-4 border-t-emerald-500/30">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Rata-rata Skor</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-sm flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-baseline">
            {isLoading ? (
              <div className="w-14 h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            ) : overview?.averageScore !== null && overview?.averageScore !== undefined ? (
              <>
                <AnimatedCounter value={overview.averageScore} delayMs={460} />
                <span className="text-xs font-bold text-slate-400 ml-1">/100</span>
              </>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {overview?.averageScore ? 'Performa bicara teruji' : 'Belum ada sesi evaluasi'}
          </div>
        </div>

        {/* Card 4: Duration */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel-hover relative overflow-hidden group animate-stagger-5 border-t-accent-purple/30">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Durasi Latihan</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-accent-purple/15 text-accent-purple flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-sm flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline">
            {isLoading ? (
              <div className="w-14 h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            ) : (
              <>
                <AnimatedCounter value={overview?.totalPracticeMinutes ?? 0} delayMs={600} />
                <span className="text-xs font-bold text-slate-400 ml-1">menit</span>
              </>
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Total waktu bicara aktif
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner (Progressive Reveal) */}
      {overview?.recommendation && (
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/25 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 shadow-sm relative overflow-hidden animate-stagger-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5 shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Rekomendasi Latihan Personal dari AI Coach
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 font-semibold leading-relaxed">
                {overview.recommendation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => speak(overview.recommendation, { persona: 'mentor_ramah' })}
              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 transition active:scale-95"
              title="Dengarkan Rekomendasi"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <Link
              to="/practice/setup"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black transition shadow-md"
            >
              <span>Latih Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Bento Grid */}
      <div className="animate-stagger-5">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Modul Utama PREZORA
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-400">Pilih fitur untuk memulai</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/chat"
            className="p-4 sm:p-5 rounded-3xl glass-panel-hover flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.08]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 shadow-glow-sm transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                AI Assistant
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Diskusi & suara natural
              </div>
            </div>
          </Link>

          <Link
            to="/practice/setup"
            className="p-4 sm:p-5 rounded-3xl glass-panel-hover flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.08]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-accent-blue to-cyan-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 shadow-glow-sm transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Presentation Coach
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Simulasi sidang & pitch
              </div>
            </div>
          </Link>

          <Link
            to="/practice/qa"
            className="p-4 sm:p-5 rounded-3xl glass-panel-hover flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.08]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 shadow-glow-sm transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Q&A Simulator
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Uji tanya-jawab kritis
              </div>
            </div>
          </Link>

          <Link
            to="/documents"
            className="p-4 sm:p-5 rounded-3xl glass-panel-hover flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.08]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 shadow-glow-sm transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Upload Dokumen
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Analisis PDF & PPTX
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Activity Feeds with Progressive Item-by-Item Reveal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 animate-stagger-6">
        {/* Practice Sessions */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-4 border border-slate-200/90 dark:border-white/[0.09]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-brand-500" />
              <span>Sesi Latihan Terbaru</span>
            </h3>
            <Link to="/history" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Semua Riwayat
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : overview?.recentSessions && overview.recentSessions.length > 0 ? (
            <div className="space-y-2.5">
              {overview.recentSessions.map((session, idx) => (
                <ProgressiveItem key={session.id} index={idx} baseDelayMs={150} stepDelayMs={160}>
                  <Link
                    to={`/practice/${session.id}/evaluation`}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-darkSurface/60 hover:bg-slate-100 dark:hover:bg-[#14203D] border border-slate-200/70 dark:border-white/5 flex items-center justify-between transition-all duration-200 group"
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-400 transition-colors">
                        {session.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    {session.evaluations[0]?.overallScore !== undefined ? (
                      <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex-shrink-0 border border-emerald-500/20">
                        Skor {session.evaluations[0].overallScore}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Draft</span>
                    )}
                  </Link>
                </ProgressiveItem>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada sesi latihan. Klik tombol "Simulasi Presentasi" di atas.
            </div>
          )}
        </div>

        {/* AI Conversations */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-4 border border-slate-200/90 dark:border-white/[0.09]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <span>Percakapan AI Terbaru</span>
            </h3>
            <Link to="/chat" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Buka Chat
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : overview?.recentConversations && overview.recentConversations.length > 0 ? (
            <div className="space-y-2.5">
              {overview.recentConversations.map((conv, idx) => (
                <ProgressiveItem key={conv.id} index={idx} baseDelayMs={220} stepDelayMs={160}>
                  <Link
                    to={`/chat/${conv.id}`}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-darkSurface/60 hover:bg-slate-100 dark:hover:bg-[#14203D] border border-slate-200/70 dark:border-white/5 flex items-center justify-between transition-all duration-200 group"
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-400 transition-colors">
                        {conv.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(conv.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </ProgressiveItem>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada percakapan. Mulai percakapan baru dengan asisten AI!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
