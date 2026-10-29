import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, User, Sun, Moon, Volume2, VolumeX,
  Lock, Trash2, CheckCircle2, AlertCircle, LogOut, Sparkles, Mic
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { PERSONA_VOICE_PROFILES } from '../utils/indonesianSpeechNormalizer';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking, setRate, persona: activePersona, setPersona } = useSpeechSynthesis();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [preferredLang, setPreferredLang] = useState(user?.preferredLanguage || 'id');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('prezora_voice_speed');
    return saved ? parseFloat(saved) : (user?.preferences?.voiceSpeed || 1.0);
  });
  const [selectedTestPersona, setSelectedTestPersona] = useState<string>(activePersona || 'assistant');
  const [responseStyle, setResponseStyle] = useState(user?.preferences?.responseStyle || 'informative');
  const [responseLength, setResponseLength] = useState(user?.preferences?.responseLength || 'balanced');

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const personaSamples: Record<string, string> = {
    assistant: 'Halo! Saya Prezora AI, asisten dan rekan latihan bicara Anda. Saya siap membantu menyusun materi presentasi, mengulas KPI serta strategi UI/UX, dengan intonasi bahasa Indonesia yang hangat dan natural.',
    mentor_ramah: 'Wah, senang sekali bisa menemani latihan kamu hari ini! Santai saja ya, tarik napas dulu, kita latih alur presentasi kamu pelan-pelan sampai benar-benar matang dan percaya diri.',
    dosen_penguji: 'Selamat pagi. Paparan yang cukup menarik, namun coba Anda jelaskan secara objektif, apa kebaruan metodologi ini dan bagaimana validitas datanya diuji secara empiris?',
    manajer_pro: 'Oke rekan-rekan, dari sisi eksekusi proyek, bagaimana kita memastikan timeline implementasi ini tetap realistis tanpa mengganggu target KPI kuartal ini?',
    investor: 'Menarik sekali pitch Anda. Sekarang bicara soal angka: berapa proyeksi ROI dalam 12 bulan ke depan, dan apa keunggulan kompetitif Anda dibanding kompetitor yang sudah ada?',
    klien: 'Kalau solusi ini kami terapkan di tim operasional kami bulan depan, kira-kira proses adaptasinya rumit tidak ya, dan seberapa cepat manfaatnya bisa langsung terasa?',
    umum: 'Penjelasannya seru banget! Tapi kalau untuk pengguna awam sehari-hari, kira-kira manfaat paling praktis yang langsung terasa itu apa ya?'
  };

  const handleVoiceSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setRate(newSpeed);
  };

  const handleTestVoice = (personaKey: string) => {
    setSelectedTestPersona(personaKey);
    setPersona(personaKey);
    if (isSpeaking) {
      stop();
      return;
    }
    const sampleText = personaSamples[personaKey] || personaSamples.assistant;
    speak(sampleText, { persona: personaKey, rate: voiceSpeed });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setRate(voiceSpeed);
    setPersona(selectedTestPersona);
    try {
      const res = await api.patch('/users/me', {
        fullName,
        theme,
        preferredLanguage: preferredLang
      });
      await api.patch('/users/me/preferences', {
        responseStyle,
        responseLength,
        voiceSpeed
      });
      updateUser(res.data.data);
      setProfileSuccess('Pengaturan profil, karakter AI, dan kalibrasi suara natural berhasil disimpan!');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      console.error(err);
      setProfileSuccess('Kalibrasi suara lokal berhasil diterapkan!');
      setTimeout(() => setProfileSuccess(null), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh percakapan, dokumen, dan riwayat latihan akan dihapus.')) return;
    try {
      await api.delete('/users/me');
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in duration-300">
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-xs font-bold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Pengaturan Akun & Studio Suara Natural</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Pengaturan Akun & Kalibrasi Suara AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola profil, tema antarmuka, uji karakter suara natural bahasa Indonesia, dan privasi akun Anda.
        </p>
      </div>

      {profileSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* Studio Kalibrasi & Uji Suara AI Natural Indonesia */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>Studio Kalibrasi Suara AI Bahasa Indonesia Natural</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dilengkapi normalisasi fonetik Indonesia, jeda napas alami, dan profil intonasi 7 karakter penutur.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleTestVoice(selectedTestPersona)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition active:scale-95 ${
              isSpeaking
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-sm'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Hentikan Tes Suara' : 'Tes Suara Karakter Ini'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.entries(PERSONA_VOICE_PROFILES).map(([key, profile]) => {
            const isSelected = selectedTestPersona === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTestVoice(key)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-300 shadow-glow-sm ring-1 ring-brand-500/30'
                    : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {profile.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tempo {profile.rateMultiplier}x • Intonasi {profile.pitch}
                  </div>
                </div>
                <Volume2 className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-brand-500' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kecepatan Bicara AI Global: <span className="text-brand-500 font-black">{voiceSpeed.toFixed(2)}x</span>
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">
              {voiceSpeed < 0.95 ? 'Tenang & Artikulasi Jelas' : voiceSpeed > 1.1 ? 'Cepat & Dinamis' : 'Natural Orang Indonesia (Ideal)'}
            </span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.35"
            step="0.05"
            value={voiceSpeed}
            onChange={(e) => handleVoiceSpeedChange(parseFloat(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
            Contoh kalimat uji: "{personaSamples[selectedTestPersona] || personaSamples.assistant}"
          </p>
        </div>
      </div>

      {/* Profile & Appearance Form */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-[2rem] glass-card-luxury space-y-6 animate-stagger-3">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Profil & Tampilan Antarmuka
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-darkSurface border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Alamat Email (Akun)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-darkSurface/50 border border-slate-200/60 dark:border-white/5 text-slate-400 text-xs sm:text-sm cursor-not-allowed font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Mode Tema Tampilan
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                  theme === 'light'
                    ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-sm ring-2 ring-brand-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                  theme === 'dark'
                    ? 'bg-brand-950/70 border-brand-500 text-brand-400 shadow-sm ring-2 ring-brand-500/20'
                    : 'bg-darkSurface border-white/5 text-slate-400 hover:bg-darkCard'
                }`}
              >
                <Moon className="w-4 h-4 text-brand-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-sm transition active:scale-95"
          >
            Simpan Perubahan Profil & Suara
          </button>
        </div>
      </form>

      {/* AI Assistant Preferences */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-card-luxury space-y-5 animate-stagger-4">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Preferensi Karakter AI
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Gaya Penjelasan AI
            </label>
            <select
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-darkSurface border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer"
            >
              <option value="informative">Informatif & Lengkap (Default)</option>
              <option value="concise">Ringkas & To the Point</option>
              <option value="academic">Akademis & Kritis</option>
              <option value="conversational">Santai & Bersahabat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Panjang Respons
            </label>
            <select
              value={responseLength}
              onChange={(e) => setResponseLength(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-darkSurface border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer"
            >
              <option value="balanced">Seimbang (Standar)</option>
              <option value="short">Pendek & Inti Poin</option>
              <option value="detailed">Mendalam & Komprehensif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-panel border border-rose-500/20 space-y-4">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-500">
          Zona Keamanan & Privasi
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Hapus Akun & Seluruh Riwayat Latihan
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tindakan ini permanen. Semua data obrolan, transkrip rekaman, dan skor latihan akan dihapus dari server.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-extrabold text-xs transition active:scale-95 border border-rose-500/20 self-start sm:self-auto flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
