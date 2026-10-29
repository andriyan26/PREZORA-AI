import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealtimeClockProps {
  showDate?: boolean;
  compact?: boolean;
}

export const RealtimeClock: React.FC<RealtimeClockProps> = ({ showDate = true, compact = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dateString = time.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (compact) {
    return (
      <div 
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-[#0D152A] border border-slate-200/90 dark:border-white/[0.12] text-[11px] font-mono font-extrabold text-slate-800 dark:text-white shadow-sm"
        title={`Waktu Real-time: ${hours}:${minutes}:${seconds} WIB`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-sm" />
        <span className="tracking-tight text-brand-600 dark:text-brand-300">
          {hours}:{minutes}:{seconds}
        </span>
        <span className="text-[9px] text-slate-400 font-bold">WIB</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-[#0D152A]/90 border border-slate-200/90 dark:border-white/[0.12] text-xs shadow-inner transition-colors"
      title="Waktu Sistem Aktif Realtime"
    >
      <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
        <Clock className="w-3.5 h-3.5 animate-pulse-subtle" />
        <span className="font-mono font-black text-xs tracking-tight text-slate-900 dark:text-white">
          {hours}:{minutes}:{seconds}
        </span>
        <span className="text-[10px] font-black px-1 py-0.2 rounded bg-brand-500/15 text-brand-500 dark:text-brand-300">
          WIB
        </span>
      </div>

      {showDate && (
        <>
          <span className="text-slate-300 dark:text-white/10 font-bold">|</span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden lg:inline">
            {dateString}
          </span>
        </>
      )}

      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 dark:text-emerald-400 pl-1 border-l border-slate-200/80 dark:border-white/[0.08]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-sm" />
        <span className="hidden sm:inline">LIVE</span>
      </div>
    </div>
  );
};
