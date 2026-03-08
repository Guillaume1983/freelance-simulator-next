'use client';

import { useRef, useState, useEffect } from 'react';

const labelLight = 'text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const labelDark = 'text-[8px] font-black text-white/90 uppercase tracking-wide';
const inputLight = 'w-14 text-center text-[10px] font-bold py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all';
const inputDark = 'tjm-days-input w-16 py-1.5 px-2 text-xs font-bold rounded-lg bg-white/10 border border-white/20 text-white text-center focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all';
const selectLight = 'w-auto min-w-[96px] text-[9px] py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shrink-0 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all';
const selectDark = 'w-auto min-w-[96px] text-[9px] py-1.5 px-2 rounded-lg bg-white/10 border border-white/20 text-white shrink-0 [&_option]:text-slate-900 cursor-pointer hover:border-white/40 transition-all';
const spanLight = 'text-[8px] text-slate-400 dark:text-slate-500';
const spanDark = 'text-[8px] text-white/80';
const spanValueLight = 'text-[9px] font-bold text-slate-600 dark:text-slate-300 tabular-nums';
const spanValueDark = 'text-[9px] font-bold text-white/85 tabular-nums';

const arrowBtn = 'w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20';

export default function RegimeParamsInline({ sim, regimeId, align = 'center', variant = 'light' }: { sim: any; regimeId: string; align?: 'center' | 'left'; variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';
  const lbl = isDark ? labelDark : labelLight;
  const sp = isDark ? spanDark : spanLight;
  const spVal = isDark ? spanValueDark : spanValueLight;

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startHold = (fn: () => void) => {
    fn();
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    holdDelayRef.current = setTimeout(() => { holdTimerRef.current = setInterval(fn, 120); }, 300);
  };
  const stopHold = () => {
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    holdDelayRef.current = null;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
  };

  const [portageInputStr, setPortageInputStr] = useState('');
  const [portageFocused, setPortageFocused] = useState(false);
  const portageComm = sim.state.portageComm;
  useEffect(() => {
    if (!portageFocused) setPortageInputStr('');
  }, [portageFocused]);
  useEffect(() => {
    if (portageFocused) {
      const fromInput = parseFloat(portageInputStr.replace(',', '.'));
      if (Number.isNaN(fromInput) || Math.abs(fromInput - portageComm) > 0.01) setPortageInputStr(String(portageComm));
    }
  }, [portageComm, portageFocused]);
  const portageValue = portageFocused ? (portageInputStr || String(portageComm)) : String(portageComm);
  const commitPortage = (raw: string) => {
    const n = parseFloat(raw.replace(',', '.'));
    const clamped = Number.isNaN(n) ? 7 : Math.max(1, Math.min(15, n));
    sim.setters.setPortageComm(clamped);
  };

  if (regimeId === 'Portage') return (
    <div className="space-y-1">
      <div className={`flex items-center gap-1.5 ${alignClass}`}>
        <label className={`${lbl} shrink-0`}>Frais gestion</label>
        <input
          type="text"
          inputMode="decimal"
          value={portageValue}
          onChange={e => {
            const v = e.target.value;
            setPortageInputStr(v);
            const n = parseFloat(v.replace(',', '.'));
            if (!Number.isNaN(n)) sim.setters.setPortageComm(Math.max(1, Math.min(15, n)));
          }}
          onFocus={e => {
            setPortageFocused(true);
            setPortageInputStr(String(portageComm));
            (e.target as HTMLInputElement).select();
          }}
          onBlur={() => {
            commitPortage(portageInputStr || String(portageComm));
            setPortageFocused(false);
          }}
          className={isDark ? inputDark : inputLight}
          onClick={e => e.stopPropagation()}
        />
        {isDark && (
          <div className="flex flex-col gap-0.5">
            <button type="button" className={arrowBtn} onMouseDown={() => startHold(() => sim.setters.setPortageComm((p: number) => Math.min(15, (p || 7) + 0.5)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+Frais">▲</button>
            <button type="button" className={arrowBtn} onMouseDown={() => startHold(() => sim.setters.setPortageComm((p: number) => Math.max(1, (p || 7) - 0.5)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-Frais">▼</button>
          </div>
        )}
        <span className={sp}>%</span>
      </div>
    </div>
  );
  if (regimeId === 'Micro') return (
    <div className={`space-y-1 flex flex-col ${alignClass === 'justify-center' ? 'items-center' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${alignClass}`}>
        <label className={`${lbl} shrink-0`}>Type</label>
        <select
          value={sim.state.typeActiviteMicro}
          onChange={e => sim.setters.setTypeActiviteMicro(e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE')}
          className={isDark ? selectDark : selectLight}
          onClick={e => e.stopPropagation()}
        >
          <option value="BNC">BNC</option>
          <option value="BIC_SERVICE">BIC Service</option>
          <option value="BIC_COMMERCE">BIC Commerce</option>
        </select>
      </div>
      <label className={`flex items-center gap-1.5 mt-1 cursor-pointer ${alignClass === 'justify-center' ? 'justify-center' : ''}`}>
        <input
          type="checkbox"
          checked={sim.state.prelevementLiberatoire}
          onChange={() => sim.setters.setPrelevementLiberatoire(!sim.state.prelevementLiberatoire)}
          className="rounded"
          onClick={e => e.stopPropagation()}
        />
        <span className={spVal}>Prélèv. libératoire</span>
      </label>
    </div>
  );
  if (regimeId === 'EURL IS') return (
    <div className="space-y-1.5 min-w-[120px]">
      <label className={`${lbl} block`}>Rémunération TNS</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0} max={100} step={5}
          value={(sim.state.remunerationDirigeantMensuelle ?? 1) * 100}
          onChange={e => sim.setters.setRemunerationDirigeantMensuelle(Number(e.target.value) / 100)}
          className={`flex-1 h-2 rounded-full cursor-pointer ${isDark ? 'accent-blue-400' : 'accent-blue-500'}`}
          onClick={e => e.stopPropagation()}
        />
        <span className={`${spVal} w-12 text-right`}>{Math.round((sim.state.remunerationDirigeantMensuelle ?? 1) * 100)}%</span>
      </div>
      <p className={`${sp} text-[7px]`}>Reste en trésorerie société</p>
    </div>
  );
  if (regimeId === 'SASU') return (
    <div className="space-y-1.5 min-w-[120px]">
      <label className={`${lbl} block`}>Dividendes</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0} max={100} step={5}
          value={sim.state.repartitionRemuneration ?? 100}
          onChange={e => sim.setters.setRepartitionRemuneration(Number(e.target.value))}
          className={`flex-1 h-2 rounded-full cursor-pointer ${isDark ? 'accent-violet-400' : 'accent-violet-500'}`}
          onClick={e => e.stopPropagation()}
        />
        <span className={`${spVal} w-12 text-right`}>{sim.state.repartitionRemuneration ?? 100}%</span>
      </div>
      <p className={`${sp} text-[7px]`}>Part du bénéfice en dividendes</p>
    </div>
  );
  return <p className={`text-[8px] italic ${isDark ? 'text-white/70' : 'text-slate-400'}`}>—</p>;
}
