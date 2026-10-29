import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, MessageSquare, Mic, FolderGit2, History, BarChart3 } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Home', icon: Sparkles, to: '/dashboard' },
    { label: 'Chat AI', icon: MessageSquare, to: '/chat' },
    { label: 'Coach', icon: Mic, to: '/practice' },
    { label: 'Dokumen', icon: FolderGit2, to: '/documents' },
    { label: 'Riwayat', icon: History, to: '/history' },
    { label: 'Progres', icon: BarChart3, to: '/analytics' },
  ];

  return (
    <div className="lg:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40 pb-safe pointer-events-none">
      <nav className="pointer-events-auto h-16 bg-white/95 dark:bg-[#0D152A]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.12] rounded-3xl px-1.5 flex items-center justify-around shadow-2xl shadow-black/30 specular-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-2xl transition-all duration-300 relative min-w-[48px]
                ${isActive 
                  ? 'text-brand-600 dark:text-brand-400 font-extrabold scale-105' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white active:scale-95'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-500/15 shadow-glow-sm' : ''}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 font-bold truncate">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-glow-sm" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
