'use client';

import { cn } from '@/lib/utils';
import { InputNumber } from '@/components/input-number';

export default function NumberInput({
  value,
  onChange,
  onIncrement: _onIncrement,
  onDecrement: _onDecrement,
  suffix = '',
  min = 0,
  max,
  step = 1,
  label,
  disabled = false,
  inputClassName,
}: {
  value: number;
  onChange: (v: number) => void;
  /** Conservé pour compatibilité ; les flèches du navigateur utilisent `step`. */
  onIncrement?: () => void;
  onDecrement?: () => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  inputClassName?: string;
}) {
  return (
    <div className={cn(disabled && 'opacity-60 pointer-events-none')}>
      <InputNumber
        value={value}
        onChange={(v) => onChange(Math.max(min, v))}
        orientation="horizontal"
        ariaLabel={label}
        label={undefined}
        placeholder={undefined}
        hint={undefined}
        isRequired={false}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        suffix={suffix || undefined}
        inputClassName={inputClassName}
      />
    </div>
  );
}
