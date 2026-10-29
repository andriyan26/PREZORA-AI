import React from 'react';
import { 
  BarChart3, TrendingUp, Award, Clock, Sparkles, 
  Target, CheckCircle2, AlertCircle, ChevronUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ProgressData, AnalyticsOverview } from '../types';
import { AnimatedCounter, AnimatedProgressBar, ProgressiveItem } from '../components/common/ProgressiveReveal';

export const AnalyticsPage: React.FC = () => {
  const { data: progress, isLoading: progressLoading } = useQuery<ProgressData>({
    queryKey: ['analytics-progress'],
    queryFn: async () => {
      const res = await api.get('/analytics/progress');
      return res.data.data;
    }
  });

  const { data: overview } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data.data;
    }
  });

  const timeline = progress?.scoreTimeline || [];
  const criteria = progress?.criteriaAverages || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pt-1 sm:pt-3 animate-fade-in duration-300">
      
      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Performance Insights & Growth Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Progress & Analytics Bicara
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau evolusi kemampuan komunikasi, tren skor, dan rata-rata performa 7 dimensi presentasi Anda.
        </p>
      </div>

      {/* Top Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger-2">
        <div className="p-6 rounded-3xl glass-card-luxury specular-border border border-slate-200/90 dark:border-white/[0.09] shadow-xl group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rata-rata Skor</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {overview?.averageScore ? <AnimatedCounter value={overview.averageScore} suffix="/100" durationMs={1100} /> : '—'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-400 font-bold">●</span>
            <span>Dari <AnimatedCounter value={overview?.completedSessionsCount ?? 0} /> sesi evaluasi selesai</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card-luxury specular-border border border-slate-200/90 dark:border-white/[0.09] shadow-xl group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Durasi Latihan</span>
            <div className="w-9 h-9 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
            <AnimatedCounter value={overview?.totalPracticeMinutes ?? 0} durationMs={1100} /> <span className="text-sm font-bold text-slate-400">Menit</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-brand-400 font-bold">●</span>
            <span>Waktu bicara aktif di hadapan AI</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card-luxury specular-border border border-slate-200/90 dark:border-white/[0.09] shadow-xl group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Konsistensi Latihan</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            <AnimatedCounter value={overview?.totalSessions ?? 0} durationMs={1100} /> <span className="text-sm font-bold text-slate-400">Sesi</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-purple-400 font-bold">●</span>
            <span>Total sesi simulasi terdaftar</span>
          </div>
        </div>
      </div>

      {/* Score History Progression Timeline */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          Tren Perkembangan Skor Latihan
        </h2>

        {timeline.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada cukup data sesi latihan selesai untuk menampilkan tren skor.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end gap-3 h-52 pt-8 pb-3 border-b border-slate-200/80 dark:border-white/[0.08] overflow-x-auto">
              {timeline.map((point, idx) => {
                const heightPercent = Math.max(18, point.score);
                return (
                  <div key={idx} className="flex-1 min-w-[54px] flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-black text-brand-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      {point.score}
                    </span>
                    <div 
                      className="w-full max-w-[32px] bg-gradient-to-t from-brand-600 via-indigo-500 to-accent-blue rounded-t-xl transition-all duration-500 group-hover:brightness-125 shadow-glow-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[50px]">
                      Sesi {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
              Grafik skor per sesi latihan dari waktu ke waktu.
            </p>
          </div>
        )}
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-400" />
          Rata-rata Skor per Dimensi Penilaian
        </h2>

        {criteria.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Data penilaian per dimensi akan muncul setelah Anda menyelesaikan sesi latihan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {criteria.map((item, idx) => (
              <ProgressiveItem 
                key={idx} 
                index={idx}
                baseDelayMs={180}
                stepMs={110}
                className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] hover:border-brand-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                    <AnimatedCounter value={item.score} suffix=" / 100" durationMs={1000} />
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                  <AnimatedProgressBar
                    percentage={item.score}
                    delayMs={240 + idx * 120}
                    className="bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-blue"
                  />
                </div>
              </ProgressiveItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
