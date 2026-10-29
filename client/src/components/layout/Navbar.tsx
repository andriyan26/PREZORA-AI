import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, Moon, Menu, LogOut, 
  Settings as SettingsIcon, Sparkles, ChevronDown, 
  BarChart3, CheckCircle2, Search, Volume2, Square
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { RealtimeClock } from '../common/RealtimeClock';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenCommandPalette, title }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isSpeaking, cancel } = useSpeechSynthesis();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    cancel();
    await logout();
    navigate('/login');
  };

  // Determine active breadcrumb category
  const getCategory = () => {
    const path = location.pathname;
    if (path.startsWith('/practice') || path.startsWith('/script-assistant')) return 'Presentation Studio';
    if (path.startsWith('/documents') || path.startsWith('/history') || path.startsWith('/analytics')) return 'Knowledge & Data';
    if (path.startsWith('/chat')) return 'AI Intelligence';
    return 'Executive Suite';
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#070D1D]/85 backdrop-blur-2xl px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 transition-colors shadow-sm">
      
      {/* Left Side: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
        {/* Mobile menu hamburger */}
        <button
          onClick={onToggleSidebar}
          aria-label="Buka Navigasi"
          className="lg:hidden p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition active:scale-95 border border-slate-200/60 dark:border-white/[0.06] flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Icon (only on mobile) */}
        <Link to="/dashboard" className="lg:hidden flex items-center flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-blue flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
        </Link>

        {/* Desktop Breadcrumb Badge */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20">
            {getCategory()}
          </span>
          <span className="text-slate-400 dark:text-slate-600 font-bold">/</span>
        </div>

        {/* Page Title with sleek typography */}
        <h1 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Center / Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        
        {/* Active AI Voice Speaking Indicator Pill (1-Click Stop) */}
        {isSpeaking && (
          <button
            onClick={cancel}
            title="Klik untuk menghentikan suara AI"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-rose-500/20 border border-emerald-500/30 hover:border-rose-500/40 text-emerald-500 dark:text-emerald-300 hover:text-rose-400 text-[11px] font-extrabold transition animate-fade-in"
          >
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden md:inline">Suara AI Aktif</span>
            <Square className="w-2.5 h-2.5 fill-current ml-0.5" />
          </button>
        )}

        {/* Quick Search / Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            aria-label="Cari Fitur (Ctrl+K)"
            title="Pintasan Cepat (Ctrl+K)"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-xs font-semibold transition active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden xl:inline text-[11px]">Cari modul...</span>
            <kbd className="hidden xl:inline-block text-[9px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/10">
              Ctrl K
            </kbd>
          </button>
        )}

        {/* Live Real-time Clock (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center">
          <RealtimeClock showDate={true} />
        </div>

        {/* Live Real-time Clock (Mobile / Smartphone) */}
        <div className="sm:hidden flex items-center">
          <RealtimeClock compact={true} />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Ganti Tema"
          className="p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition active:scale-95 border border-slate-200/70 dark:border-white/[0.08]"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* User Account Capsule & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition group border border-transparent dark:hover:border-white/[0.08]"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue text-white flex items-center justify-center font-black text-xs shadow-glow-sm group-hover:scale-105 transition-transform">
                {user?.fullName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070D1D]" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span className="truncate max-w-[110px]">{user?.fullName || 'Akun Pengguna'}</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-500 dark:text-brand-300">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
                {user?.email}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform hidden sm:block" />
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white/95 dark:bg-[#0D152A]/95 backdrop-blur-2xl z-50 p-2.5 animate-fade-in-scale border border-slate-200/90 dark:border-white/[0.12] shadow-2xl shadow-black/40 specular-border">
                {/* User Profile Card */}
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl mb-2 border border-slate-200/60 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue text-white flex items-center justify-center font-black text-sm shadow-glow-sm">
                      {user?.fullName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Member Terverifikasi PRO</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-0.5">
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan Akun & Suara</span>
                  </Link>

                  <Link
                    to="/analytics"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span>Progress & Evaluasi 7 Dimensi</span>
                  </Link>

                  <div className="border-t border-slate-200/80 dark:border-white/[0.06] my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
