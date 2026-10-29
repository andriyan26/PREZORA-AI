import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number | null | undefined;
  durationMs?: number;
  delayMs?: number;
  fallback?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Smoothly counts up from 0 to target value when data arrives ("muncul secara perlahan")
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 1350,
  delayMs = 150,
  fallback = '—',
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (value === null || value === undefined || isNaN(value)) {
      return;
    }

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
      const target = Math.round(value);
      if (target === 0) {
        setDisplayValue(0);
        return;
      }

      const startTime = performance.now();
      let rafId: number;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Ease-out cubic curve for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(target * eased));

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(target);
        }
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, delayMs);

    return () => clearTimeout(startTimeout);
  }, [value, durationMs, delayMs]);

  if (value === null || value === undefined) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <span className={`inline-block transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-40'} ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

interface AnimatedProgressBarProps {
  percentage: number;
  delayMs?: number;
  heightClass?: string;
  barClass?: string;
  className?: string;
}

/**
 * Smoothly fills progress bar from 0% to target percentage after delay
 */
export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percentage,
  delayMs = 200,
  heightClass = 'h-2.5',
  barClass = 'bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-blue',
  className,
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.max(0, Math.min(100, percentage)));
    }, delayMs);
    return () => clearTimeout(timer);
  }, [percentage, delayMs]);

  return (
    <div className={`w-full ${heightClass} rounded-full bg-slate-200 dark:bg-slate-800/90 overflow-hidden shadow-inner`}>
      <div
        className={`h-full ${className || barClass} rounded-full transition-all duration-[1300ms] ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

interface ProgressiveItemProps {
  index?: number;
  baseDelayMs?: number;
  stepDelayMs?: number;
  stepMs?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reveals an item smoothly with a staggered delay based on its index
 */
export const ProgressiveItem: React.FC<ProgressiveItemProps> = ({
  index = 0,
  baseDelayMs = 100,
  stepDelayMs,
  stepMs,
  className = '',
  children,
}) => {
  const effectiveStep = stepDelayMs ?? stepMs ?? 130;
  const delay = Math.min(baseDelayMs + index * effectiveStep, 1800);
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '880ms',
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};
