'use client';

import { useRef, useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnualGrowthBandProps {
  yearIndex: number;
  growthRate: number | undefined;
  onGrowthChange: (value: number) => void;
}

export function AnnualGrowthBand({
  yearIndex,
  growthRate,
  onGrowthChange,
}: AnnualGrowthBandProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  const currentValue = growthRate ?? 0;
  const isInvalid = currentValue < 0 || currentValue > 50;

  useEffect(() => {
    setIsOutOfRange(isInvalid);
  }, [isInvalid]);

  // Year 1 (index 0) doesn't have growth control
  if (yearIndex === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? 0 : Number(e.target.value);
    onGrowthChange(val);
  };

  return (
    <div
      className={cn(
        'w-full px-4 md:px-6 py-3.5 rounded-xl border transition-all duration-200',
        'bg-gradient-to-r from-slate-50 to-slate-50/50',
        'dark:from-slate-800/60 dark:to-slate-800/40',
        'border-slate-200/60 dark:border-slate-700/60',
        isInvalid
          ? 'ring-1 ring-red-300/50 dark:ring-red-700/30'
          : 'hover:border-slate-300/80 dark:hover:border-slate-600/80',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500/80 to-teal-500/80 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <label
            htmlFor={`growth-input-year-${yearIndex}`}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
          >
            Croissance CA
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            vs An {yearIndex}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm">
            <input
              ref={inputRef}
              type="number"
              id={`growth-input-year-${yearIndex}`}
              min={0}
              max={50}
              step={1}
              inputMode="numeric"
              value={currentValue || ''}
              placeholder="0"
              onChange={handleChange}
              aria-label={`Taux de croissance du chiffre d'affaires pour l'année ${yearIndex + 1}, par rapport à l'année ${yearIndex}`}
              aria-describedby={`growth-hint-${yearIndex}`}
              aria-invalid={isInvalid}
              className={cn(
                'w-14 text-center text-sm font-bold py-1 rounded border-0 bg-transparent tabular-nums',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all',
                isInvalid
                  ? 'text-red-700 dark:text-red-400 focus:ring-red-400/50 dark:focus:ring-red-500/40'
                  : 'text-slate-900 dark:text-slate-100 focus:ring-emerald-400/50 dark:focus:ring-emerald-500/40',
              )}
            />
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              %
            </span>
          </div>

          {isInvalid && (
            <span
              id={`growth-hint-${yearIndex}`}
              className="text-xs font-medium text-red-700 dark:text-red-400 whitespace-nowrap"
            >
              (0–50 %)
            </span>
          )}
          {!isInvalid && (
            <span
              id={`growth-hint-${yearIndex}`}
              className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap sm:hidden"
            >
              0–50 %
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
