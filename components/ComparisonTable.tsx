'use client';
import React, { useState } from 'react';
import { SlidersVertical, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

/* ── Histogramme vertical (répartition du CA) ── */
function MiniVerticalBars({ ca, fees, cotis, ir, net }: {
  ca: number; fees: number; cotis: number; ir: number; net: number;
}) {
  const total = Math.max(ca, 1);
  const MAX_H = 52;
  const bars = [
    { value: fees,  color: '#fb7185', label: 'Chg' },
    { value: cotis, color: '#fbbf24', label: 'Cot' },
    { value: ir,    color: '#f87171', label: 'IR'  },
    { value: net,   color: '#34d399', label: 'Net' },
  ];
  return (
    <div className="flex items-end justify-center gap-2 py-1">
      {bars.map((bar, i) => {
        const pct = (bar.value / total) * 100;
        const h   = Math.max(2, (bar.value / total) * MAX_H);
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-black" style={{ color: bar.color }}>{Math.round(pct)}%</span>
            <div className="w-5 rounded-t-sm transition-all duration-500" style={{ height: `${h}px`, background: bar.color }} />
            <span className="text-[7px] text-slate-400 font-bold">{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ComparisonTable({ sim }: { sim: any }) {
  const [openDetails, setOpenDetails] = useState<number[]>([]);
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  const regimes  = sim.resultats;
  const winnerId = [...regimes].sort((a: any, b: any) => b.net - a.net)[0].id;
  const fmt      = (v: number) => Math.round(v).toLocaleString() + ' €';

  const toggleDetail = (idx: number) =>
    setOpenDetails(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);

  const rows = [
    { label: 'CA Annuel Brut',               key: 'ca',        div: 1  },
    { label: 'Charges & IK déductibles',      key: 'fees',      div: 1,  prefix: '-', color: 'text-rose-500' },
    { label: 'Cotisations Sociales',          key: 'cotis',     div: 1,  prefix: '-', color: 'text-amber-600' },
    { label: 'Rémunération Nette (Avant IR)', key: 'beforeTax', div: 12, highlight: true },
    { label: 'Prélèvement Fiscal (IR/IS)',    key: 'ir',        div: 1,  prefix: '-', color: 'text-rose-600' },
    { label: 'DISPONIBLE FINAL (Cash-out)',   key: 'net',       div: 12, isFinal: true },
  ];

  const renderSettingsContent = (regimeId: string) => {
    if (regimeId === 'Portage') return (
      <div className="w-full">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Frais Gestion %</p>
        <input
          type="number"
          value={sim.state.portageComm}
          onChange={e => sim.setters.setPortageComm(Math.max(1, Math.min(15, parseFloat(e.target.value) || 5)))}
          min={1} max={15} step={0.5}
          className="w-full text-center text-sm p-2 rounded-xl"
          onClick={e => e.stopPropagation()}
        />
      </div>
    );
    return (
      <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-2">
        Paramètres configurés<br />dans la simulation globale
      </p>
    );
  };

  const getDisplayValue  = (r: any, row: typeof rows[number]) => (r[row.key] as number) / row.div;
  const getMobileUnit    = (row: typeof rows[number]) => row.div === 12 ? '/mois' : '/an';

  const RetirementBadge = ({ quarters }: { quarters: number }) => (
    <span title={quarters >= 4 ? '4 trimestres retraite validés' : `~${quarters}/4 trimestres`} className="text-[10px]">
      {quarters >= 4 ? '✅' : '⚠️'}
    </span>
  );

  return (
    <div className="card-pro overflow-visible mt-6 border-none shadow-2xl bg-white dark:bg-[#0f172a]">

      {/* ── Vue desktop ── */}
      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <th className="p-6 text-left border-b dark:border-slate-800 w-[220px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                  Comparatif<br />Stratégique
                </h3>
              </th>
              {regimes.map((r: any) => (
                <th key={r.id} className="p-4 relative pt-12 border-b dark:border-slate-800">
                  <div className={`header-band band-${r.class}`} />
                  {r.id === winnerId && <div className="winner-badge">🏆 OPTIMUM</div>}
                  <button
                    onClick={e => { e.stopPropagation(); setOpenSettings(openSettings === r.id ? null : r.id); }}
                    className={`absolute top-4 right-3 transition-colors z-30 ${openSettings === r.id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
                  >
                    <SlidersVertical size={14} />
                  </button>
                  {openSettings === r.id && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-4 px-3">
                      <div className="flex items-center justify-between w-full mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Réglages {r.id}</span>
                        <button onClick={() => setOpenSettings(null)}>
                          <CheckCircle size={16} className="text-indigo-500 hover:text-indigo-600 transition-colors" />
                        </button>
                      </div>
                      {renderSettingsContent(r.id)}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-[13px] font-black dark:text-white uppercase tracking-tighter">{r.id}</span>
                    {r.id === 'Micro' && r.ca > 77700 && <AlertCircle size={12} className="text-rose-500" />}
                    <RetirementBadge quarters={r.retirementQuarters} />
                  </div>
                  <div className="text-3xl font-black dark:text-white leading-none tracking-tighter">
                    {fmt(r.net / 12)}<span className="text-[11px] text-slate-400 font-bold ml-1">/m</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 justify-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center gap-1">🧠 {r.mental}/5</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">{r.safety}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className={`group transition-colors ${(row as any).highlight ? 'bg-slate-50/50 dark:bg-slate-900/30 font-bold' : ''} ${(row as any).isFinal ? 'bg-indigo-50/30 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black' : ''}`}>
                  <td className="p-4 border-r dark:border-slate-800">
                    <div className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">{row.label}</div>
                    <div onClick={() => toggleDetail(idx)} className="text-[8px] text-indigo-500 font-black cursor-pointer uppercase mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Détails <ArrowRight size={10} />
                    </div>
                  </td>
                  {regimes.map((r: any) => (
                    <td
                      key={r.id}
                      className={`p-4 text-center font-bold ${(row as any).isFinal ? 'text-lg' : 'text-sm'} ${(row as any).color || ''}`}
                    >
                      {(row as any).prefix} {fmt(getDisplayValue(r, row))}
                    </td>
                  ))}
                </tr>
                {openDetails.includes(idx) && (
                  <tr className="bg-slate-100/30 dark:bg-slate-800/20 animate-in fade-in slide-in-from-top-1 duration-300">
                    <td className="p-2 border-r dark:border-slate-800 text-[9px] text-slate-400 font-bold uppercase text-center italic tracking-widest">Base mensuelle</td>
                    {regimes.map((r: any) => (
                      <td key={r.id} className="p-2 text-center">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{fmt((r[row.key] as number) / 12)} / mois</span>
                      </td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* ── Ligne Répartitions ── */}
            <tr className="bg-slate-50/20 dark:bg-slate-900/10">
              <td className="p-4 border-r dark:border-slate-800">
                <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">Répartitions</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                  {[
                    { color: '#fb7185', label: 'Charges' },
                    { color: '#fbbf24', label: 'Cotis' },
                    { color: '#f87171', label: 'IR' },
                    { color: '#34d399', label: 'Net' },
                  ].map(item => (
                    <span key={item.label} className="flex items-center gap-1 text-[7px] text-slate-400 font-bold">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </td>
              {regimes.map((r: any) => (
                <td key={r.id} className="px-4 py-2">
                  <MiniVerticalBars ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Vue mobile ── */}
      <div className="block md:hidden p-4 pt-5">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">
          Comparatif stratégique
        </h3>
        <div className="-mx-4 px-1 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3">
          {regimes.map((r: any) => {
            const isWinner = r.id === winnerId;
            return (
              <div
                key={r.id}
                className="snap-center shrink-0 w-[calc(100vw-3rem)] max-w-sm relative border overflow-hidden rounded-2xl bg-white dark:bg-[#020617] shadow-lg"
              >
                <button
                  onClick={e => { e.stopPropagation(); setOpenSettings(openSettings === r.id ? null : r.id); }}
                  className={`absolute top-3 right-3 z-10 transition-colors ${openSettings === r.id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
                >
                  <SlidersVertical size={14} />
                </button>
                {openSettings === r.id && (
                  <div className="absolute inset-0 bg-white/96 dark:bg-[#020617]/96 backdrop-blur-sm z-20 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Réglages {r.id}</span>
                      <button onClick={() => setOpenSettings(null)}>
                        <CheckCircle size={18} className="text-indigo-500" />
                      </button>
                    </div>
                    {renderSettingsContent(r.id)}
                  </div>
                )}
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center">
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{r.id}</span>
                    {r.id === 'Micro' && r.ca > 77700 && <AlertCircle size={12} className="text-rose-500" />}
                    <RetirementBadge quarters={r.retirementQuarters} />
                  </div>
                  <div className="text-3xl font-black dark:text-white leading-none tracking-tight mb-2">
                    {fmt(r.net / 12)}
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/mois</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center gap-1">🧠 {r.mental}/5</span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">{r.safety}</span>
                  </div>
                  {isWinner && (
                    <div className="bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>🏆</span> OPTIMUM
                    </div>
                  )}
                  <div className="mt-3 w-full">
                    <MiniVerticalBars ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="space-y-2 mb-3">
                    {rows.map((row) => (
                      <div
                        key={row.key}
                        className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${
                          (row as any).isFinal ? 'bg-indigo-50/70 dark:bg-indigo-900/40'
                          : (row as any).highlight ? 'bg-slate-50/70 dark:bg-slate-900/40'
                          : 'bg-slate-50/40 dark:bg-slate-900/20'
                        }`}
                      >
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.label}</p>
                        <span className={`text-[11px] font-black ${(row as any).isFinal ? 'text-indigo-700 dark:text-indigo-300' : (row as any).color || 'text-slate-800 dark:text-slate-100'}`}>
                          {(row as any).prefix} {fmt(getDisplayValue(r, row))}
                          <span className="text-[9px] text-slate-400 ml-1">{getMobileUnit(row)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
