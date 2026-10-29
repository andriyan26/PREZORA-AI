import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Mic, Award, Clock, ArrowRight, RotateCcw, 
  Search, Filter, ChevronRight, Calendar, Sparkles, CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PracticeSession } from '../types';
import { AnimatedCounter, ProgressiveItem } from '../components/common/ProgressiveReveal';

export const HistoryPage: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sessions = [], isLoading } = useQuery<PracticeSession[]>({
    queryKey: ['practice-history', filterType],
    queryFn: async () => {
      const res = await api.get('/practice/sessions', {
        params: { type: filterType !== 'all' ? filterType : undefined }
      });
      return res.data.data;
    }
  });

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pt-1 sm:pt-3 animate-fade-in duration-300">
      
      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <History className="w-3.5 h-3.5" />
          <span>Practice Session Logs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Riwayat Latihan & Evaluasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tinjau kembali seluruh sesi presentasi Anda, buka laporan evaluasi 7 dimensi, dan lakukan latihan ulang.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card-luxury specular-border flex flex-col sm:flex-row gap-3 border border-slate-200/90 dark:border-white/[0.09] shadow-xl animate-stagger-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul atau topik latihan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium placeholder:text-slate-400"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-48 font-semibold cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option value="kuliah">Presentasi Kuliah</option>
          <option value="seminar">Seminar / Sidang Skripsi</option>
          <option value="project">Presentasi Proyek</option>
          <option value="kerja">Presentasi Kerja</option>
          <option value="pitching">Business Pitching</option>
          <option value="public_speaking">Public Speaking</option>
        </select>
      </div>

      {/* History List */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat riwayat latihan...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ditemukan sesi latihan. Mulai latihan pertama Anda di menu Presentation Coach!
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session, index) => {
              const evalScore = session.evaluations?.[0]?.overallScore;
              return (
                <ProgressiveItem
                  key={session.id}
                  index={index}
                  baseDelayMs={100}
                  stepMs={90}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group shadow-sm hover:shadow-glow-sm"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/15 border border-brand-500/20 text-[10px] font-black uppercase text-brand-400">
                        {session.practiceType}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {session.audienceType?.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors truncate">
                      {session.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>📅 {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>⏱️ {Math.round((session.actualDurationSeconds || session.targetDurationSeconds) / 60)} menit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    {evalScore !== undefined ? (
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-black text-sm flex-shrink-0 shadow-sm">
                        Skor <AnimatedCounter value={evalScore} durationMs={950} />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum Selesai</span>
                    )}

                    <Link
                      to={`/practice/${session.id}/evaluation`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-sm transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>Lihat Hasil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </ProgressiveItem>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
