'use client';

import { useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NumberInput({
  value,
  onChange,
  onIncrement,
  onDecrement,
  suffix = '',
  min = 0,
  label,
  disabled = false,
  inputClassName,
}: {
  value: number;
  onChange: (v: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  suffix?: string;
  min?: number;
  label?: string;
  disabled?: boolean;
  inputClassName?: string;
}) {
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startHold = (fn: () => void) => {
    fn();
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdDelayRef.current = null;
    holdTimerRef.current = null;
    holdDelayRef.current = setTimeout(() => {
      holdTimerRef.current = setInterval(fn, 80);
    }, 300);
  };
  const stopHold = () => {
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdDelayRef.current = null;
    holdTimerRef.current = null;
  };
  return (
    <div className={cn('flex items-center gap-2', disabled && 'opacity-60 pointer-events-none')}>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={() => !disabled && startHold(onDecrement)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => !disabled && startHold(onDecrement)}
        onTouchEnd={stopHold}
        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
        aria-label={label ? `Diminuer ${label}` : 'Diminuer'}
      >
        <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </button>
      <div className="relative">
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Number.isNaN(v) ? min : Math.max(min, v));
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-24 px-3 py-2 text-center font-semibold text-slate-900 dark:text-white',
            'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            inputClassName
          )}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={() => !disabled && startHold(onIncrement)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => !disabled && startHold(onIncrement)}
        onTouchEnd={stopHold}
        className="w-9 h-9 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 flex items-center justify-center transition-colors disabled:opacity-50"
        aria-label={label ? `Augmenter ${label}` : 'Augmenter'}
      >
        <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
      </button>
    </div>
  );
}
