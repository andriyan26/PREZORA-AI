import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Bot, Mic, HelpCircle, 
  FileEdit, FolderGit2, History, BarChart3, Settings, 
  Sparkles, ArrowRight, X, Command
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dash', title: 'Dashboard Ringkasan', desc: 'Lihat statistik latihan dan evaluasi', icon: LayoutDashboard, to: '/dashboard', category: 'Navigasi' },
    { id: 'chat', title: 'AI Assistant', desc: 'Diskusi ide & konsultasi public speaking', icon: Bot, to: '/chat', category: 'AI Intelligence' },
    { id: 'coach', title: 'Presentation Coach', desc: 'Mulai simulasi bicara dengan AI real-time', icon: Mic, to: '/practice/setup', category: 'Presentation Studio' },
    { id: 'qa', title: 'Audience Q&A Simulator', desc: 'Latihan menjawab pertanyaan audiens kritis', icon: HelpCircle, to: '/practice/qa', category: 'Presentation Studio' },
    { id: 'script', title: 'Script & Slide Assistant', desc: 'Susun outline slide dan script pidato', icon: FileEdit, to: '/script-assistant', category: 'Presentation Studio' },
    { id: 'docs', title: 'My Documents', desc: 'Upload materi presentasi PDF & PPTX', icon: FolderGit2, to: '/documents', category: 'Repository' },
    { id: 'history', title: 'Practice History', desc: 'Dengar rekaman dan ulas skor lampau', icon: History, to: '/history', category: 'Repository' },
    { id: 'analytics', title: 'Progress & Analytics', desc: 'Radar skor 7 dimensi & evaluasi performa', icon: BarChart3, to: '/analytics', category: 'Repository' },
    { id: 'settings', title: 'Pengaturan Akun & Suara', desc: 'Ubah profil, persona suara, dan API key', icon: Settings, to: '/settings', category: 'Sistem' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // handled by parent or opened
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#050914]/80 backdrop-blur-md animate-fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0D152A] border border-slate-200/90 dark:border-white/[0.14] shadow-2xl shadow-black/50 overflow-hidden z-10 animate-fade-in-scale duration-200 specular-border">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
          <Search className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik fitur atau modul (contoh: coach, chat, skor)..."
            autoFocus
            className="flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada fitur yang cocok dengan "<span className="text-white font-bold">{query}</span>"
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    navigate(cmd.to);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-glow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cmd.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Pintasan Cepat Antigravity Intelligence</span>
          </div>
          <span className="text-[10px] text-slate-500">Pilih modul untuk langsung meluncur</span>
        </div>
      </div>
    </div>
  );
};
