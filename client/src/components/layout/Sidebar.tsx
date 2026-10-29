import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, MessageSquare, Mic, HelpCircle, FileEdit, 
  FolderGit2, History, BarChart3, Settings, 
  ChevronLeft, ChevronRight, X, ChevronDown, Radio,
  LayoutDashboard, Bot, Video, Award, BookOpen, Sliders, Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  collapsed = false,
  onToggleCollapse
}) => {
  const [studioOpen, setStudioOpen] = useState(true);
  const [knowledgeOpen, setKnowledgeOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Navigation sections
  const mainItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', badge: null },
    { label: 'AI Assistant', icon: Bot, to: '/chat', badge: 'GPT & Gemini' },
  ];

  const studioItems = [
    { label: 'Presentation Coach', icon: Mic, to: '/practice', badge: 'Live AI' },
    { label: 'Q&A Simulator', icon: HelpCircle, to: '/practice/qa', badge: 'Drill' },
    { label: 'Script Assistant', icon: FileEdit, to: '/script-assistant', badge: null },
  ];

  const knowledgeItems = [
    { label: 'My Documents', icon: FolderGit2, to: '/documents', badge: null },
    { label: 'Practice History', icon: History, to: '/history', badge: null },
    { label: 'Progress & Analytics', icon: BarChart3, to: '/analytics', badge: null },
  ];

  const isPathActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    if (to === '/chat') return location.pathname.startsWith('/chat');
    if (to === '/practice') {
      return (
        location.pathname === '/practice' || 
        location.pathname.startsWith('/practice/setup') || 
        (location.pathname.startsWith('/practice/') && !location.pathname.startsWith('/practice/qa'))
      );
    }
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#040816]/80 backdrop-blur-md z-40 lg:hidden animate-fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#080E21]/95 backdrop-blur-3xl transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 sm:px-4 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/50 dark:bg-white/[0.02]">
          <NavLink 
            to="/dashboard" 
            onClick={onClose}
            className="flex items-center gap-2.5 overflow-hidden group min-w-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-blue flex-shrink-0 flex items-center justify-center text-white shadow-glow-sm group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-brand-600 via-indigo-400 to-accent-blue bg-clip-text text-transparent truncate">
                  PREZORA AI
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate leading-tight">
                  Presentation Studio
                </span>
              </div>
            )}
          </NavLink>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse/Expand Toggle for Desktop */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Content: Pure Dropdown Accordion Structure, NO "+ Mulai Chat Baru" */}
        <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-3 space-y-3.5 scrollbar-thin">
          
          {/* Group 1: Core Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 px-3 py-1 tracking-widest flex items-center justify-between">
                <span>Menu Utama</span>
              </div>
            )}
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                    active 
                      ? 'bg-brand-500/15 text-brand-500 dark:text-brand-300 border border-brand-500/30 shadow-glow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${active ? 'bg-brand-500/25 text-brand-400' : 'text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-glow-sm" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Group 2: Presentation Studio (Dropdown Accordion) */}
          <div className="space-y-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setStudioOpen(!studioOpen)}
                className="w-full flex items-center justify-between text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 px-3 py-1.5 tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition group rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <span>Presentation Studio</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                    3
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${studioOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
            )}

            {(studioOpen || collapsed) && (
              <div className="space-y-1 animate-fade-in duration-150">
                {studioItems.map((item) => {
                  const Icon = item.icon;
                  const active = isPathActive(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                        active 
                          ? 'bg-brand-500/15 text-brand-500 dark:text-brand-300 border border-brand-500/30 shadow-glow-sm' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${active ? 'bg-brand-500/25 text-brand-400' : 'text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              item.badge === 'Live AI' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-glow-sm" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3: Knowledge & Repository (Dropdown Accordion) */}
          <div className="space-y-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                className="w-full flex items-center justify-between text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 px-3 py-1.5 tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition group rounded-xl"
              >
                <div className="flex items-center gap-1.5">
                  <span>Knowledge & Data</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                    3
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${knowledgeOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
            )}

            {(knowledgeOpen || collapsed) && (
              <div className="space-y-1 animate-fade-in duration-150">
                {knowledgeItems.map((item) => {
                  const Icon = item.icon;
                  const active = isPathActive(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                        active 
                          ? 'bg-brand-500/15 text-brand-500 dark:text-brand-300 border border-brand-500/30 shadow-glow-sm' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${active ? 'bg-brand-500/25 text-brand-400' : 'text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-glow-sm" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 4: Settings & Configuration */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 px-3 py-1 tracking-widest">
                Pengaturan
              </div>
            )}
            <NavLink
              to="/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                location.pathname === '/settings'
                  ? 'bg-brand-500/15 text-brand-500 dark:text-brand-300 border border-brand-500/30 shadow-glow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? 'Pengaturan' : undefined}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${location.pathname === '/settings' ? 'bg-brand-500/25 text-brand-400' : 'text-slate-400'}`}>
                <Settings className="w-4 h-4" />
              </div>
              {!collapsed && <span className="truncate flex-1">Pengaturan Akun</span>}
              {location.pathname === '/settings' && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-glow-sm" />
              )}
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer Status Capsule */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.07] bg-white/40 dark:bg-white/[0.01]">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0D1528] border border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-glow-sm" />
                <div className="text-[11px] leading-tight truncate">
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 truncate">PREZORA Core v2.4</div>
                  <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold truncate">Realtime Engine Ready</div>
                </div>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-400 border border-brand-500/25 flex-shrink-0">
                PRO
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
