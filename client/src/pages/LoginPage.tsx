import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, 
  Zap, Mic, ShieldCheck, Award, ChevronRight, Volume2, Square, CheckCircle2,
  Headphones, Flame, Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AuthParticleBackground } from '../components/common/AuthParticleBackground';

const ROTATING_TAGLINES = [
  'Kuasai Sidang Skripsi & Seminar Akademik',
  'Menangkan Hati Investor di Pitching Bisnis',
  'Taklukkan Wawancara Kerja & Presentasi Proyek',
  'Bicara Mengalir & Percaya Diri di Depan Umum',
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Rotate tagline smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const triggerSuccessFireworks = () => {
    confetti({
      particleCount: 80,
      spread: 70,
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
      'Halo! Selamat datang di PREZORA AI. Bersiaplah melatih kemampuan presentasi dan komunikasi profesionalmu dengan suara natural manusia.',
      { persona: 'mentor_ramah' }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      setIsSuccess(true);
      triggerSuccessFireworks();
      setTimeout(() => {
        login(user, accessToken, refreshToken);
        navigate('/dashboard');
      }, 750);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@prezora.ai');
    setPassword('password123');
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: 'demo@prezora.ai',
        password: 'password123',
      });
      const { user, accessToken, refreshToken } = res.data.data;
      setIsSuccess(true);
      triggerSuccessFireworks();
      setTimeout(() => {
        login(user, accessToken, refreshToken);
        navigate('/dashboard');
      }, 750);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal masuk akun demo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060914] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* 1. Dynamic Interactive Particle & Constellation Background Canvas */}
      <AuthParticleBackground />

      {/* 2. Floating Cyber Grids & Ambient Glowing Aurora Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-40 z-0" />
      <div className="absolute -top-40 -left-40 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-brand-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse-subtle z-0" />
      <div className="absolute -bottom-40 -right-40 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-accent-blue/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[450px] bg-indigo-500/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 3. Main Luxury Glass Card with Animated Glowing Gradient Border */}
      <div className="w-full max-w-5xl rounded-3xl sm:rounded-[2.5rem] animated-beam-card backdrop-blur-3xl overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 shadow-[0_30px_90px_rgba(0,0,0,0.75)] animate-fade-in-up">
        
        {/* Left Column: Visual AI Voice Studio & Dynamic Interactive Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0b1126]/95 via-[#080d1e]/95 to-[#040713]/98 p-8 sm:p-10 flex-col justify-between relative overflow-hidden border-r border-white/[0.08] text-white">
          
          {/* Top Logo & Rotating Tagline */}
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
                  AI Speech & Presentation Studio
                </span>
              </div>
            </Link>

            {/* Rotating Dynamic Subtitle */}
            <div className="mt-4 h-6 overflow-hidden">
              <p
                key={taglineIndex}
                className="text-xs text-slate-300 font-medium animate-fade-in-down flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{ROTATING_TAGLINES[taglineIndex]}</span>
              </p>
            </div>
          </div>

          {/* Center Stage: Futuristic Animated AI Vocal Orb & Spectrum Canvas */}
          <div className="relative z-10 my-6 space-y-4">
            
            {/* 3D Glowing Vocal Orb Visualizer */}
            <div className="relative rounded-3xl p-5 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] shadow-2xl backdrop-blur-xl overflow-hidden group">
              {/* Orb Glow Backdrop */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/25 rounded-full blur-2xl pointer-events-none animate-pulse-neon" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                    Live Azure Neural Studio
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>96kbps HD</span>
                </div>
              </div>

              {/* 22 Animated Equalizer Frequencies with Dynamic Delays */}
              <div className="h-12 bg-slate-950/70 rounded-2xl p-3 flex items-center justify-between gap-1 border border-white/[0.06]">
                {[40, 75, 95, 55, 100, 65, 85, 45, 90, 70, 80, 50, 95, 60, 85, 40, 90, 65, 75, 50, 80, 45].map((h, i) => (
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

              {/* Interactive Audio Preview Trigger */}
              <button
                type="button"
                onClick={handlePlayVoicePreview}
                className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500/25 via-indigo-500/20 to-emerald-500/25 hover:from-brand-500/35 hover:to-emerald-500/35 border border-white/[0.15] text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md group-hover:border-brand-400/50"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-rose-400 animate-pulse" />
                    <span className="text-rose-300 font-extrabold">Hentikan Suara Sample</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Dengarkan Suara AI Natural</span>
                  </>
                )}
              </button>
            </div>

            {/* Floating Glass Pills with Gentle Up-Down Float Animation */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Floating Pill 1 */}
              <div className="p-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] animate-float-slow hover:border-brand-400/40 transition-colors">
                <div className="flex items-center gap-2 text-brand-300 mb-1">
                  <Mic className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-[11px] font-bold">6 Persona Sidang</span>
                </div>
                <p className="text-[10px] text-slate-300/80 leading-snug">
                  Dosen, Investor & Manajer Proyek
                </p>
              </div>

              {/* Floating Pill 2 */}
              <div className="p-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] animate-float-reverse hover:border-emerald-400/40 transition-colors">
                <div className="flex items-center gap-2 text-emerald-300 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold">7 Dimensi Vokal</span>
                </div>
                <p className="text-[10px] text-slate-300/80 leading-snug">
                  WPM, artikulasi & ritme kata
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Pledge */}
          <div className="relative z-10 flex items-center gap-2.5 text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Kerahasiaan dokumen & audio latihan terenkripsi 100%.</span>
          </div>
        </div>

        {/* Right Column: High-End Authentication Form (Desktop & Mobile) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative">
          
          {/* Mobile Top Brand Header with Live Wave */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue flex items-center justify-center text-white shadow-glow-sm">
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

            {/* Mobile Soundwave Animated Snippet */}
            <div className="mt-3.5 mx-auto max-w-[280px] p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-1 h-8">
              {[40, 70, 95, 50, 85, 60, 90, 45, 100, 55, 75, 40].map((h, i) => (
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
            {/* Header Title with Animated Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500/20 to-indigo-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold mb-2.5 shadow-glow-sm animate-pulse-subtle">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Portal Akses Eksklusif</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Masuk ke Akun
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Lanjutkan sesi latihan presentasi dan konsultasi AI Anda.
              </p>
            </div>

            {/* VIP 1-Click Demo Login Box (With Amber Shimmer & Hover Lift) */}
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-brand-500/10 to-indigo-500/15 border border-amber-400/35 shadow-glow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>Akses Cepat Penguji / Reviewer</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">1-Klik</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    demo@prezora.ai • password123
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 relative z-10"
              >
                <span>Masuk Otomatis</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                atau masuk manual
              </span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Error Message with Shake Animation */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Akun
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-300 hover:text-brand-200 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
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

              {/* Submit Button with Animated Hover Beam & Success Fireworks */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-500 via-indigo-600 to-accent-blue hover:from-brand-400 hover:to-accent-blue text-white font-black text-sm shadow-lg shadow-brand-500/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden group"
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {isSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                    <span>Autentikasi Berhasil! Mengalihkan...</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </div>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Redirect */}
            <div className="mt-7 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-slate-400">
                Belum memiliki akun?{' '}
                <Link to="/register" className="font-extrabold text-brand-300 hover:text-brand-200 hover:underline">
                  Daftar Sekarang Gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
