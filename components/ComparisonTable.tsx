'use client';
import React, { useState } from 'react';
import { SlidersVertical, AlertCircle, ArrowRight } from 'lucide-react';

export default function ComparisonTable({ sim, selectedId, setSelectedId }: any) {
  const [openDetails, setOpenDetails] = useState<number[]>([]);
  const regimes = sim.resultats;
  const winnerId = [...regimes].sort((a, b) => b.net - a.net)[0].id;
  const fmt = (v: number) => Math.round(v).toLocaleString() + " €";

  const toggleDetail = (idx: number) => {
    setOpenDetails(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const rows = [
    { label: "CA Annuel Brut", key: 'ca', div: 1 },
    { label: "Charges & IK déductibles", key: 'fees', div: 1, prefix: '-', color: 'text-rose-500' },
    { label: "Cotisations Sociales", key: 'cotis', div: 1, prefix: '-', color: 'text-amber-600' },
    { label: "Rémunération Nette (Avant IR)", key: 'beforeTax', div: 1, highlight: true },
    { label: "Prélèvement Fiscal (IR/IS)", key: 'ir', div: 1, prefix: '-', color: 'text-rose-600' },
    { label: "DISPONIBLE FINAL (Cash-out)", key: 'net', div: 12, isFinal: true }
  ];

  const getDisplayValue = (r: any, row: (typeof rows)[number]) => {
    const rawValue = r[row.key] as number;
    // On reste cohérent avec la vue desktop :
    // - net & beforeTax : ramenés au mensuel
    // - le reste : valeur annuelle
    return (row.key === 'net' || row.key === 'beforeTax') ? rawValue / 12 : rawValue;
  };

  const getMobileUnit = (rowKey: string) => {
    return rowKey === 'net' || rowKey === 'beforeTax' ? '/mois' : '/an';
  };

  return (
    <div className="card-pro overflow-visible mt-6 border-none shadow-2xl bg-white dark:bg-[#0f172a]">
      {/* Vue desktop : tableau comparatif */}
      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-0 table-fixed">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <th className="p-6 text-left border-b dark:border-slate-800 w-[220px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                Comparatif<br/>Stratégique
              </h3>
            </th>
            {regimes.map((r: any) => (
              <th key={r.id} className={`p-4 relative pt-12 border-b dark:border-slate-800 transition-all duration-300 ${selectedId === r.id ? 'col-active' : ''}`}>
                <div className={`header-band band-${r.class}`}></div>
                {r.id === winnerId && <div className="winner-badge">🏆 OPTIMUM</div>}
                <button className="absolute top-4 right-3 text-slate-400 hover:text-indigo-500 transition-colors">
                  <SlidersVertical size={14}/>
                </button>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[13px] font-black dark:text-white uppercase tracking-tighter">{r.id}</span>
                  {r.id === 'Micro' && r.ca > 77700 && <AlertCircle size={12} className="text-rose-500" />}
                </div>
                <div className="text-3xl font-black dark:text-white leading-none tracking-tighter">
                  {fmt(r.net / 12)}<span className="text-[11px] text-slate-400 font-bold ml-1">/m</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center gap-1">🧠 {r.mental}/5</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">{r.safety}</span>
                </div>
                <button onClick={() => setSelectedId(r.id === selectedId ? null : r.id)} className={`btn-select ${selectedId === r.id ? 'btn-active' : ''}`}>
                  {selectedId === r.id ? 'Analyse Active' : 'Analyse Expert'}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-700 dark:text-slate-300">
          {rows.map((row, idx) => (
            <React.Fragment key={idx}>
              <tr className={`group transition-colors ${row.highlight ? 'bg-slate-50/50 dark:bg-slate-900/30 font-bold' : ''} ${row.isFinal ? 'bg-indigo-50/30 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black' : ''}`}>
                <td className="p-4 border-r dark:border-slate-800">
                  <div className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">{row.label}</div>
                  <div onClick={() => toggleDetail(idx)} className="text-[8px] text-indigo-500 font-black cursor-pointer uppercase mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Détails <ArrowRight size={10}/>
                  </div>
                </td>
                {regimes.map((r: any) => {
                  const displayValue = getDisplayValue(r, row);

                  return (
                    <td
                      key={r.id}
                      className={`p-4 text-center font-bold transition-all duration-300 ${selectedId === r.id ? 'col-active' : ''} ${row.isFinal ? 'text-lg' : 'text-sm'} ${row.color || ''}`}
                    >
                      {row.prefix} {fmt(displayValue)}
                    </td>
                  );
                })}
              </tr>
              {openDetails.includes(idx) && (
                <tr className="bg-slate-100/30 dark:bg-slate-800/20 animate-in fade-in slide-in-from-top-1 duration-300">
                  <td className="p-2 border-r dark:border-slate-800 text-[9px] text-slate-400 font-bold uppercase text-center italic tracking-widest">Base mensuelle</td>
                  {regimes.map((r: any) => (
                    <td key={r.id} className={`p-2 text-center transition-all duration-300 ${selectedId === r.id ? 'col-active' : ''}`}>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{fmt((r[row.key] as number) / 12)} / mois</span>
                    </td>
                  ))}
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>

      {/* Vue mobile : carrousel de cartes par régime (toujours étendues) */}
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
                className="snap-center shrink-0 w-[calc(100vw-3rem)] max-w-sm relative border overflow-hidden rounded-2xl bg-white dark:bg-[#020617] shadow-lg transition-all duration-300"
              >
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center">
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                      {r.id}
                    </span>
                    {r.id === 'Micro' && r.ca > 77700 && (
                      <AlertCircle size={12} className="text-rose-500" />
                    )}
                  </div>
                  <div className="text-3xl font-black dark:text-white leading-none tracking-tight mb-2">
                    {fmt(r.net / 12)}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold ml-1">
                      /mois
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1 mb-2">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center gap-1">
                      🧠 {r.mental}/5
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">
                      {r.safety}
                    </span>
                  </div>
                  {isWinner && (
                    <div className="mt-1 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>🏆</span> OPTIMUM
                    </div>
                  )}
                  <div className="mt-4 text-[11px] text-slate-600 dark:text-slate-300 w-full">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-500 mb-1">
                      Analyse statutaire
                    </p>
                    <p className="leading-snug">
                      {r.id === 'Portage' && "Sécurité maximale et gestion administrative déléguée : tu échanges un peu de net contre un confort administratif très élevé."}
                      {r.id === 'Micro' && "Formalisme ultra léger et très accessible, mais plafonds de chiffre d’affaires et moins d’optimisations fiscales possibles à moyen terme."}
                      {r.id === 'EURL IR' && "Bon compromis entre optimisation et lisibilité fiscale, adapté aux profils prêts à gérer un peu plus d’administratif pour gagner en net."}
                      {r.id === 'EURL IS' && "Structure orientée capitalisation dans la société : intéressante si tu laisses une partie du bénéfice en réserve et raisonnes long terme."}
                      {r.id === 'SASU' && "Grande flexibilité sur la combinaison salaire/dividendes, statut prisé des consultants premium mais avec des cotisations souvent plus élevées."}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {rows.map((row) => {
                      const displayValue = getDisplayValue(r, row);
                      const unit = getMobileUnit(row.key);

                      return (
                        <div
                          key={row.key}
                          className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${
                            row.isFinal
                              ? 'bg-indigo-50/70 dark:bg-indigo-900/40'
                              : row.highlight
                              ? 'bg-slate-50/70 dark:bg-slate-900/40'
                              : 'bg-slate-50/40 dark:bg-slate-900/20'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                              {row.label}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-[11px] font-black ${
                                row.isFinal
                                  ? 'text-indigo-700 dark:text-indigo-300'
                                  : row.color || 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {row.prefix} {fmt(displayValue)}
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1">
                                {unit}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
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