'use client';

import { useRef, useState, useEffect } from 'react';

const labelLight = 'text-[8px] font-black text-slate-400 uppercase';
const labelDark = 'text-[8px] font-black text-white/90 uppercase';
const inputLight = 'w-12 text-center text-[10px] font-bold p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600';
const inputDark = 'tjm-days-input w-16 py-1 px-2 text-xs font-bold rounded-lg bg-white/10 border border-white/20 text-white text-center';
const selectLight = 'w-auto min-w-[88px] text-[9px] p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 shrink-0';
const selectDark = 'w-auto min-w-[88px] text-[9px] p-1 rounded-lg bg-white/10 border border-white/20 text-white shrink-0 [&_option]:text-slate-900';
const spanLight = 'text-[8px] text-slate-400';
const spanDark = 'text-[8px] text-white/80';
const spanValueLight = 'text-[8px] font-bold text-slate-500';
const spanValueDark = 'text-[8px] font-bold text-white/85';

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
    <div className="space-y-1 min-w-[100px]">
      <label className={`${lbl} block`}>Rémunération</label>
      <input
        type="range"
        min={0} max={100} step={5}
        value={(sim.state.remunerationDirigeantMensuelle ?? 1) * 100}
        onChange={e => sim.setters.setRemunerationDirigeantMensuelle(Number(e.target.value) / 100)}
        className={`w-full h-1.5 ${isDark ? 'accent-indigo-400' : 'accent-indigo-600'}`}
        onClick={e => e.stopPropagation()}
      />
      <span className={spVal}>{Math.round((sim.state.remunerationDirigeantMensuelle ?? 1) * 100)}% salaire</span>
    </div>
  );
  if (regimeId === 'SASU') return (
    <div className="space-y-1 min-w-[100px]">
      <label className={`${lbl} block`}>Répartition</label>
      <input
        type="range"
        min={0} max={100} step={5}
        value={sim.state.repartitionRemuneration ?? 100}
        onChange={e => sim.setters.setRepartitionRemuneration(Number(e.target.value))}
        className={`w-full h-1.5 ${isDark ? 'accent-indigo-400' : 'accent-indigo-600'}`}
        onClick={e => e.stopPropagation()}
      />
      <span className={spVal}>{sim.state.repartitionRemuneration ?? 100}% dividendes</span>
    </div>
  );
  return <p className={`text-[8px] italic ${isDark ? 'text-white/70' : 'text-slate-400'}`}>—</p>;
}
