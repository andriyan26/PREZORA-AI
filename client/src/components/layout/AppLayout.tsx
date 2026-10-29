import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { CommandPaletteModal } from './CommandPaletteModal';
import { stopAllPrezoraAudio } from '../../hooks/useSpeechSynthesis';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();

  // Stop any playing voice when switching routes so audio never collides across pages
  useEffect(() => {
    stopAllPrezoraAudio();
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/chat')) return 'AI Assistant';
    if (path === '/practice') return 'Presentation Coach';
    if (path.startsWith('/practice/setup')) return 'Persiapan Latihan';
    if (path.startsWith('/practice/qa')) return 'Audience Q&A Simulator';
    if (path.includes('/evaluation')) return 'Laporan Evaluasi';
    if (path.startsWith('/practice/')) return 'Practice Room';
    if (path.startsWith('/script-assistant')) return 'Script & Slide Assistant';
    if (path.startsWith('/documents')) return 'My Documents';
    if (path.startsWith('/history')) return 'Practice History';
    if (path.startsWith('/analytics')) return 'Progress & Analytics';
    if (path.startsWith('/settings')) return 'Pengaturan Akun & Suara';
    return 'PREZORA AI';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-slate-800 dark:text-slate-100 flex transition-colors overflow-x-hidden">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area: dynamically adjusts padding when collapsed */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onOpenCommandPalette={() => setCommandOpen(true)}
          title={title} 
        />

        <main 
          key={location.pathname}
          className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-7xl w-full mx-auto animate-fade-in"
        >
          <Outlet />
        </main>

        {/* Smartphone Bottom Nav */}
        <MobileNav />
      </div>

      {/* Quick Search / Command Palette Modal */}
      <CommandPaletteModal isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
};
