'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type InputNumberOrientation = 'horizontal' | 'vertical';

export function InputNumber({
  value,
  onChange,
  label,
  hint,
  placeholder,
  isRequired = false,
  orientation = 'vertical',
  ariaLabel,
  min,
  max,
  step = 1,
  disabled = false,
  suffix,
  inputClassName,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  isRequired?: boolean;
  orientation?: InputNumberOrientation;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  suffix?: string;
  inputClassName?: string;
}) {
  const id = React.useId();

  const containerClass =
    orientation === 'horizontal'
      ? 'flex items-start justify-between gap-2'
      : cn('flex flex-col gap-1', suffix && 'items-center');

  /** Sans suffixe : champ pleine largeur ; avec suffixe (ex. %) : largeur du champ seule pour ne pas éloigner le suffixe */
  const inputWrapClass =
    orientation === 'horizontal'
      ? 'shrink-0'
      : suffix
        ? 'inline-block max-w-full'
        : 'w-full';

  return (
    <div className={cn('w-full', disabled && 'opacity-60 pointer-events-none')}>
      <div className={containerClass}>
        {(label || hint) && (
          <div className={cn('min-w-0', orientation === 'horizontal' && 'flex-1')}>
            {label && (
              <label htmlFor={id} className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {label}
                {isRequired ? <span className="text-rose-500">&nbsp;*</span> : null}
              </label>
            )}
            {hint ? null : null}
          </div>
        )}

        <div className={cn('relative', inputWrapClass)}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            aria-label={ariaLabel}
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isNaN(n)) return onChange(min ?? 0);
              let next = n;
              if (typeof min === 'number') next = Math.max(min, next);
              if (typeof max === 'number') next = Math.min(max, next);
              onChange(next);
            }}
            onFocus={(e) => e.target.select()}
            className={cn(
              'w-24 h-9 px-3 text-center text-sm font-semibold text-slate-900 dark:text-white tabular-nums',
              'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg',
              'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all',
              'disabled:cursor-not-allowed',
              suffix && 'pr-9',
              inputClassName,
            )}
          />
          {suffix ? (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

