'use client';

import { cn } from '@/lib/utils';
import { InputNumber } from '@/components/input-number';

export default function RegimeParamsInline({ sim, regimeId, align = 'center', variant = 'light' }: { sim: any; regimeId: string; align?: 'center' | 'left' | 'right'; variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';
  const portageComm = sim.state.portageComm ?? 0;
  const rowClass = cn(
    'w-full flex items-center gap-3',
    align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start',
  );
  const labelClass = 'min-w-[150px] text-right pr-1 text-[13px] font-medium text-slate-900 dark:text-white leading-none h-9 flex items-center justify-end whitespace-nowrap';
  const rightClass = 'shrink-0 flex items-center gap-2';
  const selectClass =
    'h-9 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all';
  const checkboxClass =
    'h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50';

  if (regimeId === 'Portage') return (
    <div className={cn('flex flex-col gap-1.5', align === 'center' ? 'items-stretch' : 'items-start')}>
      <div className={rowClass}>
        <span className={labelClass}>Frais gestion portage</span>
        <div className={rightClass}>
          <InputNumber
            value={Math.max(0, Math.min(20, portageComm))}
            onChange={(v) => sim.setters.setPortageComm(Math.max(0, Math.min(20, Math.round(v))))}
            orientation="horizontal"
            ariaLabel="Frais gestion portage"
            min={0}
            max={20}
            step={1}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
  if (regimeId === 'Micro') return (
    <div className={cn('flex flex-col gap-1.5', align === 'center' ? 'items-center' : 'items-start')}>
      <div className={rowClass}>
        <span className={labelClass}>Type</span>
        <div className={rightClass}>
          <select
            value={sim.state.typeActiviteMicro}
            onChange={(e) =>
              sim.setters.setTypeActiviteMicro(e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE')
            }
            className={selectClass}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="BNC">BNC</option>
            <option value="BIC_SERVICE">BIC Service</option>
            <option value="BIC_COMMERCE">BIC Commerce</option>
          </select>
        </div>
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Prélèv. libératoire</span>
        <div className={rightClass}>
          <input
            type="checkbox"
            checked={Boolean(sim.state.prelevementLiberatoire)}
            onChange={() => sim.setters.setPrelevementLiberatoire(!sim.state.prelevementLiberatoire)}
            className={checkboxClass}
            onClick={(e) => e.stopPropagation()}
            aria-label="Prélèvement libératoire"
          />
        </div>
      </div>
    </div>
  );
  if (regimeId === 'EURL IS') return (
    <div className={cn('flex flex-col gap-1.5', align === 'center' ? 'items-center' : 'items-start')}>
      <div className={rowClass}>
        <span className={labelClass}>Rémunération TNS</span>
        <div className={rightClass}>
          <InputNumber
            value={Math.round((sim.state.remunerationDirigeantMensuelle ?? 1) * 100)}
            onChange={(v) => {
              const safe = Math.max(0, Math.min(100, Math.round(v)));
              sim.setters.setRemunerationDirigeantMensuelle(safe / 100);
            }}
            orientation="horizontal"
            ariaLabel="Rémunération TNS"
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
  if (regimeId === 'SASU') return (
    <div className={cn('flex flex-col gap-1.5', align === 'center' ? 'items-center' : 'items-start')}>
      <div className={rowClass}>
        <span className={labelClass}>Part salaire</span>
        <div className={rightClass}>
          <InputNumber
            value={Math.max(0, Math.min(100, sim.state.repartitionRemuneration ?? 0))}
            onChange={(v) => sim.setters.setRepartitionRemuneration(Math.max(0, Math.min(100, Math.round(v))))}
            orientation="horizontal"
            ariaLabel="Part salaire président"
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
  return <p className={`text-[8px] italic ${isDark ? 'text-white/70' : 'text-slate-400'}`}>—</p>;
}
