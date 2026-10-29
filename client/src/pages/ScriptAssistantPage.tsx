import React, { useState } from 'react';
import { 
  FileEdit, Sparkles, Copy, Check, ArrowRight, 
  Wand2, BookOpen, Layers, Clock, Users, Download, Volume2, VolumeX, CheckCircle2, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export const ScriptAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'outline' | 'refine'>('outline');
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  
  // Outline generator states
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Dosen & Mahasiswa');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('Profesional & Terstruktur');
  const [outlineResult, setOutlineResult] = useState('');
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);

  // Script refiner states
  const [draftScript, setDraftScript] = useState('');
  const [instruction, setInstruction] = useState('Perjelas kalimat dan buat pembukaan lebih memikat');
  const [targetTone, setTargetTone] = useState('Formal & Percaya Diri');
  const [refinedResult, setRefinedResult] = useState('');
  const [isLoadingRefine, setIsLoadingRefine] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoadingOutline(true);
    setOutlineResult('');
    try {
      const res = await api.post('/scripts/outline', {
        topic,
        audience,
        durationMinutes,
        goal,
        tone
      });
      setOutlineResult(res.data.data.outline);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingOutline(false);
    }
  };

  const handleRefineScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftScript.trim()) return;

    setIsLoadingRefine(true);
    setRefinedResult('');
    try {
      const res = await api.post('/scripts/refine', {
        originalScript: draftScript,
        instruction,
        targetTone
      });
      setRefinedResult(res.data.data.refinedScript);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingRefine(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-1 sm:pt-3 animate-fade-in duration-300">
      
      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <FileEdit className="w-3.5 h-3.5" />
          <span>Slide & Script Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Asisten Naskah & Outline Slide Presentasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Rancang outline slide yang memikat secara otomatis atau sempurnakan draft naskah bicara Anda dengan kecerdasan buatan.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200/80 dark:border-white/[0.08] gap-2 sm:gap-3 animate-stagger-2">
        <button
          onClick={() => {
            if (isSpeaking) stop();
            setActiveTab('outline');
          }}
          className={`py-3.5 px-4 sm:px-5 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'outline'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          <span>Generator Outline Slide</span>
        </button>

        <button
          onClick={() => {
            if (isSpeaking) stop();
            setActiveTab('refine');
          }}
          className={`py-3.5 px-4 sm:px-5 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'refine'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4 flex-shrink-0" />
          <span>Sempurnakan Naskah (Speech Refiner)</span>
        </button>
      </div>

      {/* Tab 1: Outline Generator */}
      {activeTab === 'outline' ? (
        <div className="space-y-6">
          <form onSubmit={handleGenerateOutline} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Topik Presentasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Strategi Pemasaran Digital Berbasis Konten Video Pendek"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audiens
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Contoh: Investor, Dosen & Mahasiswa"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimasi Durasi
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-semibold cursor-pointer shadow-sm"
                >
                  <option value={3}>3 Menit (Elevator Pitch)</option>
                  <option value={5}>5 Menit (Presentasi Kilat)</option>
                  <option value={10}>10 Menit (Sidang / Seminar)</option>
                  <option value={15}>15 Menit (Rapat Kerja)</option>
                  <option value={20}>20 Menit (Keynote Speech)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gaya Bahasa & Nada Bicara (Tone)
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Contoh: Inspiratif & Meyakinkan, Formal & Rinci"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isLoadingOutline}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-accent-blue text-white font-extrabold text-xs sm:text-sm shadow-glow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingOutline ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Struktur Slide Lengkap</span>
                </>
              )}
            </button>
          </form>

          {/* Progressive Result Card with Staggered Entrance */}
          {outlineResult && (
            <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-fade-in-up duration-500">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rancangan Struktur Slide Anda:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => isSpeaking ? stop() : speak(outlineResult, { persona: 'mentor_ramah' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-xs font-bold text-brand-500 dark:text-brand-300 border border-brand-500/20 transition"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Suara' : 'Dengarkan Slide'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(outlineResult)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold text-slate-700 dark:text-brand-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Seluruh Slide'}</span>
                  </button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm prose-p:my-2 prose-headings:my-2.5 prose-li:my-1 text-slate-800 dark:text-slate-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {outlineResult}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Speech Refiner */
        <div className="space-y-6">
          <form onSubmit={handleRefineScript} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Draft Naskah Asli Anda <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={draftScript}
                onChange={(e) => setDraftScript(e.target.value)}
                placeholder="Tempel draft naskah pidato atau kalimat presentasi Anda di sini..."
                className="w-full p-4 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-medium placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Instruksi Penyempurnaan
                </label>
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Contoh: Buat pembukaan lebih memikat dan hilangkan kata berbelit"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-medium shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Nada Bicara
                </label>
                <select
                  value={targetTone}
                  onChange={(e) => setTargetTone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-[#080E1E] border border-slate-200/90 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 font-semibold cursor-pointer shadow-sm"
                >
                  <option value="Formal & Percaya Diri">Formal & Percaya Diri</option>
                  <option value="Inspiratif & Energik">Inspiratif & Energik</option>
                  <option value="Ringkas & Padat (Executive Summary)">Ringkas & Padat (Executive Summary)</option>
                  <option value="Santai & Komunikatif">Santai & Komunikatif</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!draftScript.trim() || isLoadingRefine}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-accent-blue text-white font-extrabold text-xs sm:text-sm shadow-glow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingRefine ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Sempurnakan Naskah Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Refined Result with Smooth Entrance */}
          {refinedResult && (
            <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-fade-in-up duration-500">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Versi Naskah Hasil Penyempurnaan:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => isSpeaking ? stop() : speak(refinedResult, { persona: 'mentor_ramah' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 transition"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Suara' : 'Dengarkan Intonasi Natural'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(refinedResult)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold text-slate-700 dark:text-brand-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Naskah'}</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#070C1A] border border-slate-200/80 dark:border-white/[0.08] text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-medium">
                {refinedResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
