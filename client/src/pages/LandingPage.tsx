import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, MessageSquare, Mic, ArrowRight, CheckCircle2, 
  BarChart3, Brain, FileText, Users, Award, ShieldCheck, Sun, Moon, 
  Zap, Play, Check 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-slate-800 dark:text-slate-100 selection:bg-brand-500 selection:text-white transition-colors relative overflow-hidden">
      
      {/* Background ambient mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-500/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-blue/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 h-20 border-b border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-darkBg/70 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-blue flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-indigo-400 to-accent-blue bg-clip-text text-transparent">
              PREZORA AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
              V1.0 LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkCard transition active:scale-95"
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-sm transition active:scale-95"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkCard transition"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-sm transition active:scale-95"
              >
                <span>Daftar Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-600 dark:text-brand-300 text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Your Ideas. Your Voice. Your Confidence.</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 max-w-4xl mx-auto">
          Speak Better. Think Smarter.{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-400 to-accent-blue bg-clip-text text-transparent">
            Present with Confidence.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Asisten AI cerdas untuk diskusi multi-topik sekaligus pelatih presentasi interaktif dengan simulasi audiens cerdas dan evaluasi performa 7 dimensi terstruktur.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
          <Link
            to={isAuthenticated ? "/chat" : "/login"}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-glow-md transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Mulai Bertanya (Start Talking)</span>
          </Link>
          <Link
            to={isAuthenticated ? "/practice" : "/login"}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl glass-panel hover:bg-slate-100 dark:hover:bg-darkCard text-slate-900 dark:text-white font-extrabold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Mic className="w-5 h-5 text-brand-500" />
            <span>Coba Presentation Coach</span>
          </Link>
        </div>

        {/* 3D-Feel Luxury Cockpit Preview */}
        <div className="rounded-[2.5rem] p-3 sm:p-5 glass-card-luxury max-w-5xl mx-auto shadow-2xl relative">
          <div className="rounded-[2rem] overflow-hidden bg-white dark:bg-darkSurface border border-slate-200/90 dark:border-white/10 text-left shadow-inner">
            
            {/* Window bar */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-darkBg/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  PREZORA AI — Live Presentation Cockpit
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Coach Simulator Active
              </div>
            </div>

            {/* Mock content grid */}
            <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-darkCard/60 border border-slate-200/80 dark:border-white/5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Simulasi Persona</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-500" />
                  Dosen Penguji Kritis
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  "Bisa Anda jelaskan landasan teori utama dan kebaruan (novelty) metodologi Anda?"
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-darkCard/60 border border-slate-200/80 dark:border-white/5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Transkrip Realtime</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  "Selamat pagi dewan penguji. Pada penelitian ini saya memaparkan model cerdas..."
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-500 font-bold">
                  <span className="waveform-bar text-brand-500" />
                  <span className="waveform-bar text-brand-500" />
                  <span className="waveform-bar text-brand-500" />
                  <span className="ml-2 font-mono">132 WPM (Ideal Tempo)</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-brand-950/50 dark:to-darkCard border border-brand-200 dark:border-brand-800/40">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">Skor Evaluasi AI</div>
                <div className="text-4xl font-black text-brand-600 dark:text-brand-400">86 <span className="text-sm font-bold text-slate-400">/ 100</span></div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                  Struktur sangat rapi. Pertegas frasa transisi saat masuk ke slide kesimpulan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-200/60 dark:border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Fitur Kelas Profesional Tanpa Kompromi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Platform komprehensif untuk mengasah kemampuan komunikasi, berpikir kritis, dan berbicara di depan umum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              General AI Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Tanyakan apa saja seputar teknologi, bisnis, penulisan esai, hingga brainstorming solusi dengan format Markdown rapi dan streaming responsif.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Interactive Presentation Coach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Latihan presentasi langsung dengan timer, mikrofon suara, dan audiens simulasi yang mengajukan pertanyaan kritis sesuai persona.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              AI Evaluation Engine (0–100)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Laporan evaluasi objektif 7 dimensi berbicara, poin kekuatan, serta rekomendasi perbaikan sebelum & sesudah (before & after).
            </p>
          </div>

          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Upload PDF & PPTX
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Unggah materi dokumen Anda untuk dijadikan referensi obrolan, pembuatan outline slide, atau bahan evaluasi latihan secara akurat.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Audience Q&A Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Latih kesiapan mental Anda dalam menjawab pertanyaan tak terduga dari dosen penguji, manajer, atau calon investor.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] glass-panel-hover space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Progress & Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Pantau perkembangan skor latihan Anda dari waktu ke waktu, durasi latihan, dan kriteria yang paling meningkat secara terukur di MySQL.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/5 py-10 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">PREZORA AI</span>
          <span>— Your Ideas. Your Voice. Your Confidence.</span>
        </div>
        <div>
          © 2026 PREZORA AI. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
};
