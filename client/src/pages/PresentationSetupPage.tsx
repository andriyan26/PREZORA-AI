import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Clock, Users, Target, Sparkles, 
  ArrowRight, CheckCircle2, ShieldCheck, Flame, Award, BookOpen, Briefcase, GraduationCap, Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export const PresentationSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { speak, stop } = useSpeechSynthesis();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [practiceType, setPracticeType] = useState('seminar');
  const [audienceType, setAudienceType] = useState('dosen_penguji');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(5);
  const [interactionMode, setInteractionMode] = useState<'practice' | 'interactive' | 'qa'>('interactive');
  const [isLoading, setIsLoading] = useState(false);

  const practiceTypes = [
    { id: 'kuliah', label: 'Presentasi Kuliah', desc: 'Tugas kelas & studi kasus' },
    { id: 'seminar', label: 'Sidang Skripsi / Seminar', desc: 'Sidang akademik & tesis' },
    { id: 'project', label: 'Presentasi Proyek', desc: 'Demo sistem & sprint update' },
    { id: 'kerja', label: 'Rapat Kerja / Bisnis', desc: 'Laporan strategi tim' },
    { id: 'pitching', label: 'Business Pitching', desc: 'Kompetisi & investor pitch' },
    { id: 'public_speaking', label: 'Public Speaking', desc: 'Keynote & sambutan acara' },
    { id: 'custom', label: 'Presentasi Bebas', desc: 'Topik sesuai pilihan Anda' }
  ];

  const audiencePersonas = [
    {
      id: 'dosen_penguji',
      name: 'Dosen Penguji',
      badge: 'Akademis & Kritis',
      badgeColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
      desc: 'Fokus pada metodologi, validitas data, dan kebaruan penelitian (novelty).',
      sampleVoice: 'Selamat pagi. Silakan mulai paparan Anda, saya akan mencermati metodologi dan validitas data yang Anda gunakan.'
    },
    {
      id: 'investor',
      name: 'Investor Venture',
      badge: 'ROI & Skalabilitas',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
      desc: 'Menilai keunggulan kompetitif (moat), potensi pasar, dan model bisnis.',
      sampleVoice: 'Halo, waktu kita singkat. Tunjukkan kepada saya potensi pasar, proyeksi ROI, dan keunggulan kompetitif solusi Anda.'
    },
    {
      id: 'manajer_pro',
      name: 'Manajer Profesional',
      badge: 'Eksekusi & KPI',
      badgeColor: 'text-accent-blue bg-accent-blue/15 border-accent-blue/20',
      desc: 'Berfokus pada timeline proyek, efisiensi sumber daya, dan mitigasi risiko.',
      sampleVoice: 'Oke rekan-rekan, mari kita mulai. Pastikan paparan hari ini fokus pada timeline eksekusi, risiko, dan capaian KPI kita.'
    },
    {
      id: 'klien',
      name: 'Calon Klien',
      badge: 'Manfaat & Biaya',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
      desc: 'Menilai kemudahan adopsi solusi dan dampak langsung bagi operasional.',
      sampleVoice: 'Halo! Kami ingin tahu apakah solusi yang Anda tawarkan ini mudah diterapkan di tim kami dan seberapa hemat biayanya.'
    },
    {
      id: 'mentor_ramah',
      name: 'Mentor Ramah',
      badge: 'Supportif & Konstruktif',
      badgeColor: 'text-teal-400 bg-teal-500/15 border-teal-500/20',
      desc: 'Memberikan saran perbaikan positif dan membimbing dengan sabar.',
      sampleVoice: 'Halo! Santai saja ya, anggap ini sesi latihan bersama teman sendiri. Silakan mulai kapan pun kamu siap!'
    },
    {
      id: 'umum',
      name: 'Audiens Umum',
      badge: 'Komunikatif & Sederhana',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
      desc: 'Menghargai penjelasan tanpa jargon rumit yang mudah dipahami siapa saja.',
      sampleVoice: 'Hai! Kami sudah siap menyimak. Jelaskan dengan bahasa sehari-hari yang ringan dan seru ya!'
    }
  ];

  const handleStartPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const sessionTitle = title.trim() || `Latihan: ${topic.substring(0, 30)}`;
      const res = await api.post('/practice/sessions', {
        title: sessionTitle,
        topic: topic.trim(),
        practiceType,
        audienceType,
        difficulty,
        targetDurationSeconds: targetDurationMinutes * 60,
        interactionMode,
        language: 'id'
      });

      const newSession = res.data.data;
      navigate(`/practice/${newSession.id}`);
    } catch (err: any) {
      console.error('Failed to create practice session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in duration-300">
      
      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <Mic className="w-3.5 h-3.5" />
          <span>Studio Konfigurasi Latihan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Siapkan Sesi Presentasi Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tentukan topik, karakter persona audiens, dan batas durasi untuk latihan terarah dengan feedback cerdas.
        </p>
      </div>

      <form onSubmit={handleStartPractice} className="space-y-6">
        {/* Step 1: Materi */}
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-[11px] font-black">01</span>
            <span>Materi & Kategori Presentasi</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Topik Utama Presentasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Penerapan Artificial Intelligence dalam Diagnosis Medis Modern"
              className="w-full px-4 py-3.5 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 shadow-sm placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Kategori Presentasi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {practiceTypes.map((type) => {
                const isSelected = practiceType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setPracticeType(type.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 text-xs ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-brand-400 font-bold shadow-glow-sm ring-1 ring-brand-500/40'
                        : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="font-bold truncate text-slate-900 dark:text-white">{type.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{type.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Persona Audiens */}
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-[11px] font-black">02</span>
              <span>Pilih Karakter Persona Audiens</span>
            </div>
            <span className="text-[11px] text-brand-400 font-bold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              1 Persona Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {audiencePersonas.map((persona) => {
              const isSelected = audienceType === persona.id;
              return (
                <button
                  type="button"
                  key={persona.id}
                  onClick={() => setAudienceType(persona.id)}
                  className={`p-4 sm:p-5 rounded-3xl text-left border transition-all duration-300 relative flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-b from-brand-500/20 to-indigo-500/10 border-brand-500 shadow-glow-sm ring-2 ring-brand-500/30'
                      : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-brand-500/40 hover:bg-white dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {persona.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudienceType(persona.id);
                            speak(persona.sampleVoice, { persona: persona.id });
                          }}
                          className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/25 text-brand-400 transition"
                          title={`Dengarkan Suara ${persona.name}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 group-hover:border-brand-400 transition-colors" />
                        )}
                      </div>
                    </div>
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-lg border mb-2.5 ${persona.badgeColor}`}>
                      {persona.badge}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {persona.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Duration & Mode */}
        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-5 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-[11px] font-black">03</span>
            <span>Target Durasi & Tingkat Kesulitan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Waktu Bicara
              </label>
              <select
                value={targetDurationMinutes}
                onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer shadow-sm"
              >
                <option value={2}>⏱️ 2 Menit (Elevator Pitch)</option>
                <option value={3}>⏱️ 3 Menit (Presentasi Kilat)</option>
                <option value={5}>⏱️ 5 Menit (Standar Seminar)</option>
                <option value={10}>⏱️ 10 Menit (Sidang Skripsi)</option>
                <option value={15}>⏱️ 15 Menit (Rapat Lengkap)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tingkat Kesulitan Pertanyaan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer shadow-sm"
              >
                <option value="beginner">Pemula (Pertanyaan Dasar)</option>
                <option value="intermediate">Menengah (Pertanyaan Standar)</option>
                <option value="advanced">Tinggi (Kritis & Menantang)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mode Interaksi
              </label>
              <select
                value={interactionMode}
                onChange={(e) => setInteractionMode(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer shadow-sm"
              >
                <option value="interactive">Interactive (Audiens Menyela & Bertanya)</option>
                <option value="practice">Practice Mode (Lancar Tanpa Gangguan)</option>
                <option value="qa">Q&A Mode (Fokus Tanya Jawab)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 animate-stagger-5">
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-accent-blue active:scale-[0.98] text-white font-black text-sm sm:text-base shadow-glow-md transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Masuk ke Ruang Latihan (Practice Cockpit)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
