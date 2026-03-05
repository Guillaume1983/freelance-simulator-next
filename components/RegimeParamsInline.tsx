'use client';

export default function RegimeParamsInline({ sim, regimeId, align = 'center' }: { sim: any; regimeId: string; align?: 'center' | 'left' }) {
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';
  if (regimeId === 'Portage') return (
    <div className="space-y-1">
      <div className={`flex items-center gap-2 ${alignClass}`}>
        <label className="text-[8px] font-black text-slate-400 uppercase shrink-0">Frais gestion</label>
        <input
          type="number"
          value={sim.state.portageComm}
          onChange={e => sim.setters.setPortageComm(Math.max(1, Math.min(15, parseFloat(e.target.value) || 7)))}
          min={1} max={15} step={0.5}
          className="w-12 text-center text-[10px] font-bold p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600"
          onClick={e => e.stopPropagation()}
        />
        <span className="text-[8px] text-slate-400">%</span>
      </div>
    </div>
  );
  if (regimeId === 'Micro') return (
    <div className={`space-y-1 flex flex-col ${alignClass === 'justify-center' ? 'items-center' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${alignClass}`}>
        <label className="text-[8px] font-black text-slate-400 uppercase shrink-0">Type</label>
        <select
          value={sim.state.typeActiviteMicro}
          onChange={e => sim.setters.setTypeActiviteMicro(e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE')}
          className="w-auto min-w-[88px] text-[9px] p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 shrink-0"
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
        <span className="text-[8px] font-bold text-slate-500">Prélèv. libératoire</span>
      </label>
    </div>
  );
  if (regimeId === 'EURL IS') return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-slate-400 uppercase block">Rémunération</label>
      <input
        type="range"
        min={0} max={100} step={5}
        value={(sim.state.remunerationDirigeantMensuelle ?? 1) * 100}
        onChange={e => sim.setters.setRemunerationDirigeantMensuelle(Number(e.target.value) / 100)}
        className="w-full accent-indigo-600 h-1.5"
        onClick={e => e.stopPropagation()}
      />
      <span className="text-[8px] font-bold text-slate-500">{Math.round((sim.state.remunerationDirigeantMensuelle ?? 1) * 100)}% salaire</span>
    </div>
  );
  if (regimeId === 'SASU') return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-slate-400 uppercase block">Répartition</label>
      <input
        type="range"
        min={0} max={100} step={5}
        value={sim.state.repartitionRemuneration ?? 100}
        onChange={e => sim.setters.setRepartitionRemuneration(Number(e.target.value))}
        className="w-full accent-indigo-600 h-1.5"
        onClick={e => e.stopPropagation()}
      />
      <span className="text-[8px] font-bold text-slate-500">{sim.state.repartitionRemuneration ?? 100}% dividendes</span>
    </div>
  );
  return <p className="text-[8px] text-slate-400 italic">—</p>;
}
