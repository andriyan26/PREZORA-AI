import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, User, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, 
  ShieldCheck, CheckCircle2, Award, Mic, Volume2, Square, Activity, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AuthParticleBackground } from '../components/common/AuthParticleBackground';

const ROTATING_BENEFITS = [
  'Simulasi Ujian Sidang Skripsi dengan Dosen AI',
  'Latihan Pitching Bisnis Bersama Investor AI',
  'Kuasai Wawancara Kerja & Public Speaking Terukur',
  'Koreksi Artikulasi Vokal & Ritme Bicara Otomatis',
];

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [benefitIndex, setBenefitIndex] = useState(0);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    const timer = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % ROTATING_BENEFITS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const triggerSuccessFireworks = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  const handlePlayVoicePreview = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    speak(
      'Halo! Selamat bergabung di PREZORA AI. Siapkan dirimu menjadi pembicara yang percaya diri dan memukau bersama kami.',
      { persona: 'mentor_ramah' }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        password,
        confirmPassword,
      });
      const { user, accessToken, refreshToken } = res.data.data;
      setIsSuccess(true);
      triggerSuccessFireworks();
      setTimeout(() => {
        login(user, accessToken, refreshToken);
        navigate('/dashboard');
      }, 750);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060914] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* 1. Dynamic Interactive Particle & Constellation Background Canvas */}
      <AuthParticleBackground />

      {/* 2. Ambient Glowing Aurora Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-40 z-0" />
      <div className="absolute -top-40 -left-40 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-brand-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse-subtle z-0" />
      <div className="absolute -bottom-40 -right-40 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-accent-blue/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[450px] bg-indigo-500/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 3. Main Luxury Glass Card with Animated Glowing Gradient Border */}
      <div className="w-full max-w-5xl rounded-3xl sm:rounded-[2.5rem] animated-beam-card backdrop-blur-3xl overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 shadow-[0_30px_90px_rgba(0,0,0,0.75)] animate-fade-in-up">
        
        {/* Left Column: Brand & Animated Live Visualizer Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0b1126]/95 via-[#080d1e]/95 to-[#040713]/98 p-8 sm:p-10 flex-col justify-between relative overflow-hidden border-r border-white/[0.08] text-white">
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-accent-blue flex items-center justify-center text-white shadow-glow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Sparkles className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-brand-200 to-accent-blue bg-clip-text text-transparent">
                  PREZORA AI
                </span>
                <span className="block text-[10px] text-brand-300 font-bold uppercase tracking-widest mt-0.5">
                  Studio Presentasi & Suara AI
                </span>
              </div>
            </Link>

            {/* Rotating Dynamic Subtitle */}
            <div className="mt-4 h-6 overflow-hidden">
              <p
                key={benefitIndex}
                className="text-xs text-slate-300 font-medium animate-fade-in-down flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{ROTATING_BENEFITS[benefitIndex]}</span>
              </p>
            </div>
          </div>

          {/* Center Stage: Animated Voice Orb & Soundwave */}
          <div className="relative z-10 my-6 space-y-4">
            <div className="relative rounded-3xl p-5 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] shadow-2xl backdrop-blur-xl overflow-hidden group">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                    Live Azure Vocal Studio
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>96kbps HD</span>
                </div>
              </div>

              {/* 22 Animated Equalizer Bars */}
              <div className="h-12 bg-slate-950/70 rounded-2xl p-3 flex items-center justify-between gap-1 border border-white/[0.06]">
                {[35, 60, 85, 45, 95, 70, 90, 40, 100, 65, 80, 50, 90, 60, 80, 45, 90, 65, 75, 50, 80, 45].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-brand-500 via-indigo-400 to-emerald-400 transition-all duration-200"
                    style={{
                      height: isSpeaking ? `${Math.min(100, h * 1.15)}%` : `${h}%`,
                      animation: `neonWaveBar ${0.9 + (i % 7) * 0.12}s ease-in-out infinite ${(i * 0.06).toFixed(2)}s`
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handlePlayVoicePreview}
                className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500/25 via-indigo-500/20 to-emerald-500/25 hover:from-brand-500/35 hover:to-emerald-500/35 border border-white/[0.15] text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-rose-400 animate-pulse" />
                    <span className="text-rose-300 font-extrabold">Hentikan Suara Sample</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Dengarkan Suara AI Natural</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06] animate-float-slow">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Simulasi audiens interaktif (Dosen Penguji, Investor, Klien)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06] animate-float-reverse">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Evaluasi 7 dimensi vokal terukur dengan perbaikan kalimat</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Gratis selamanya untuk fitur esensial latihan bicara.</span>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile Top Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-blue flex items-center justify-center text-white shadow-glow-sm">
                <Sparkles className="w-5 h-5 animate-pulse-subtle" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-brand-200 to-accent-blue bg-clip-text text-transparent">
                  PREZORA AI
                </span>
                <span className="block text-[10px] text-brand-300 font-bold uppercase tracking-wider">
                  Studio Presentasi & Suara AI
                </span>
              </div>
            </Link>

            {/* Mobile Soundwave */}
            <div className="mt-3.5 mx-auto max-w-[280px] p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-1 h-8">
              {[35, 65, 90, 45, 100, 70, 85, 40, 95, 60, 75, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-brand-400 to-emerald-400"
                  style={{
                    height: `${h}%`,
                    animation: `neonWaveBar 1.1s ease-in-out infinite ${(i * 0.08).toFixed(2)}s`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500/20 to-indigo-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold mb-2.5 shadow-glow-sm animate-pulse-subtle">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Pendaftaran Akun Baru</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Buat Akun Anda
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Daftar sekarang untuk mulai berlatih presentasi bersama AI.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Alex Pratama"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/[0.12] focus:border-brand-400 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition shadow-inner placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/[0.12] focus:border-brand-400 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition shadow-inner placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password (min. 8 karakter)
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/[0.12] focus:border-brand-400 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition shadow-inner placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/[0.12] focus:border-brand-400 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition shadow-inner placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-500 via-indigo-600 to-accent-blue hover:from-brand-400 hover:to-accent-blue text-white font-black text-sm shadow-lg shadow-brand-500/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {isSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                    <span>Akun Dibuat! Mengalihkan...</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </div>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-slate-400">
                Sudah memiliki akun?{' '}
                <Link to="/login" className="font-extrabold text-brand-300 hover:text-brand-200 hover:underline">
                  Masuk di Sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
