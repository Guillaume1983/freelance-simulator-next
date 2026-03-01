'use client';
import { useRef, useMemo, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { projeterSurNAns } from '@/lib/projections';
import { TrendingUp, FileText, FileBarChart2, X, Info } from 'lucide-react';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

export default function ProjectionSection({ sim, onClose }: { sim: any; onClose: () => void }) {
  const [activeRegime, setActiveRegime] = useState(
    [...sim.resultats].sort((a: any, b: any) => b.net - a.net)[0].id
  );

  const printComparRef = useRef<HTMLDivElement>(null);
  const printBizRef = useRef<HTMLDivElement>(null);

  const handlePrintCompar = useReactToPrint({
    contentRef: printComparRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: '@page { size: A4 landscape; margin: 12mm; }',
  });

  const handlePrintBiz = useReactToPrint({
    contentRef: printBizRef,
    documentTitle: 'BusinessPlan-Projection3ans-FreelanceSimulateur',
    pageStyle: '@page { size: A4 portrait; margin: 15mm; }',
  });

  const projections = useMemo(() => projeterSurNAns({
    tjm:          sim.state.tjm,
    days:         sim.state.days,
    taxParts:     sim.state.taxParts,
    spouseIncome: sim.state.spouseIncome,
    kmAnnuel:     sim.state.kmAnnuel,
    cvFiscaux:    sim.state.cvFiscaux,
    loyerPercu:   sim.state.loyerPercu,
    activeCharges: sim.state.activeCharges,
    sectionsActive: sim.state.sectionsActive,
    portageComm:  sim.state.portageComm,
    chargeAmounts: sim.state.chargeAmounts,
    acreEnabled:  sim.state.acreEnabled,
    citySize:     sim.state.citySize,
    growthRate:   sim.state.growthRate / 100,
  }), [sim.state]);

  const fmt = (v: number) => Math.round(v).toLocaleString() + ' €';
  const fmtK = (v: number) => {
    if (v >= 1000) return `${Math.round(v / 1000)}k €`;
    return `${Math.round(v)} €`;
  };

  const chartData = projections.map((yearResults, i) => {
    const r = yearResults.find((x: any) => x.id === activeRegime)!;
    return {
      name: `Année ${i + 1}`,
      'Net disponible': Math.round(r.net),
      'Cotisations':    Math.round(r.cotis),
      'Impôts (IR/IS)': Math.round(r.ir),
    };
  });

  const allRegimes = sim.resultats.map((r: any) => r.id);

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-sm font-900 uppercase tracking-widest dark:text-white">Projection 3 ans</h2>
            <p className="text-[10px] text-slate-400 font-bold">
              ACRE an 1{sim.state.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2 · +{sim.state.growthRate}%/an
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintCompar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wide transition-colors"
          >
            <FileText size={13} /> Export Comparatif
          </button>
          <button
            onClick={handlePrintBiz}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wide transition-colors"
          >
            <FileBarChart2 size={13} /> Business Plan
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tableau 3 ans */}
      <div className="card-pro overflow-x-auto mb-4">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60">
              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-800 min-w-[140px]">Régime</th>
              {[1, 2, 3].map(y => (
                <th key={y} className="p-4 text-center border-b dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Année {y}</span>
                  {y === 1 && sim.state.acreEnabled && (
                    <span className="ml-1 text-[8px] font-black text-emerald-500 uppercase">ACRE</span>
                  )}
                  {y > 1 && (
                    <span className="ml-1 text-[8px] font-black text-rose-400 uppercase">+CFE</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sim.resultats.map((regime: any) => {
              const color = REGIME_COLORS[regime.id] ?? '#6366f1';
              return (
                <tr
                  key={regime.id}
                  onClick={() => setActiveRegime(regime.id)}
                  className={`cursor-pointer transition-colors group ${activeRegime === regime.id ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/30'}`}
                >
                  <td className="p-4 border-b dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 rounded-full" style={{ background: color }} />
                      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">{regime.id}</span>
                    </div>
                  </td>
                  {projections.map((yearResults, i) => {
                    const r = yearResults.find((x: any) => x.id === regime.id)!;
                    const isMax = projections.every((yr, j) => {
                      if (i === j) return true;
                      const o = yr.find((x: any) => x.id === regime.id)!;
                      return r.net >= o.net;
                    });
                    return (
                      <td key={i} className="p-4 text-center border-b dark:border-slate-800/60">
                        <div className={`text-base font-900 ${i === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {fmt(r.net / 12)}<span className="text-[10px] font-bold text-slate-400">/mois</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">{fmt(r.net)} /an</div>
                        <div className="flex justify-center gap-2 mt-1">
                          <span className="text-[8px] text-amber-500 font-black">~{fmtK(r.cotis)}</span>
                          <span className="text-[8px] text-rose-400 font-black">~{fmtK(r.ir)}</span>
                          {r.retirementQuarters >= 4
                            ? <span title="4 trimestres retraite validés" className="text-[8px]">✅</span>
                            : <span title={`~${r.retirementQuarters}/4 trimestres`} className="text-[8px]">⚠️</span>
                          }
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[9px] text-slate-400 italic px-4 py-2 flex items-center gap-1">
          <Info size={10} /> Simulation estimative. Consultez un expert-comptable pour votre situation personnelle.
        </p>
      </div>

      {/* Graphique Recharts */}
      <div className="card-pro p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
            Répartition par année — {activeRegime}
          </h3>
          <div className="flex gap-1 flex-wrap">
            {allRegimes.map((id: string) => (
              <button
                key={id}
                onClick={() => setActiveRegime(id)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-colors ${
                  activeRegime === id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={{
                  background: activeRegime === id ? REGIME_COLORS[id] : 'transparent',
                  borderColor: REGIME_COLORS[id],
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
            <YAxis tickFormatter={v => `${Math.round(v / 1000)}k`} tick={{ fontSize: 10 }} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [`${Math.round(Number(value ?? 0)).toLocaleString()} €`, name ?? '']}
              contentStyle={{ fontSize: 11, borderRadius: 8, fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
            <Bar dataKey="Net disponible" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Cotisations"    stackId="a" fill="#f59e0b" />
            <Bar dataKey="Impôts (IR/IS)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== COMPOSANTS D'IMPRESSION (masqués à l'écran) ===== */}

      {/* Export Comparatif — paysage */}
      <div style={{ display: 'none' }}>
        <div ref={printComparRef} style={{ fontFamily: 'Arial, sans-serif', padding: '10mm', fontSize: 11 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Comparatif statuts freelance 2026</h1>
            <p style={{ fontSize: 10, color: '#666', margin: '4px 0 0' }}>
              CA : {fmt(sim.state.tjm * sim.state.days)} · {sim.state.taxParts} parts fiscales · freelance-simulateur.fr
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Métrique</th>
                {sim.resultats.map((r: any) => (
                  <th key={r.id} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: REGIME_COLORS[r.id] }}>{r.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'CA Annuel', key: 'ca' },
                { label: 'Charges & IK', key: 'fees' },
                { label: 'Cotisations', key: 'cotis' },
                { label: 'Net avant IR', key: 'beforeTax' },
                { label: 'Impôts (IR/IS)', key: 'ir' },
                { label: 'NET MENSUEL', key: 'net', monthly: true },
              ].map((row, i) => (
                <tr key={i} style={{ background: row.monthly ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', fontWeight: row.monthly ? 900 : 600, borderBottom: '1px solid #e2e8f0' }}>{row.label}</td>
                  {sim.resultats.map((r: any) => (
                    <td key={r.id} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: row.monthly ? 900 : 'normal', borderBottom: '1px solid #e2e8f0' }}>
                      {row.monthly ? fmt((r[row.key] as number) / 12) + '/mois' : fmt(r[row.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 8, color: '#999', marginTop: 8 }}>
            Simulation estimative basée sur les barèmes 2026. Consultez un expert-comptable pour valider votre situation.
          </p>
        </div>
      </div>

      {/* Export Business Plan — portrait */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 11 }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>Business Plan Freelance — Projection 3 ans</h1>
            <p style={{ fontSize: 10, color: '#666', margin: 0 }}>
              Régime analysé : <strong>{activeRegime}</strong> · TJM {sim.state.tjm}€ · {sim.state.days} jours · freelance-simulateur.fr
            </p>
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 900, borderBottom: '2px solid #4f46e5', paddingBottom: 4, marginBottom: 10 }}>Paramètres</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, fontSize: 10 }}>
            {[
              ['CA An 1', fmt(sim.state.tjm * sim.state.days)],
              ['Croissance CA', `+${sim.state.growthRate}%/an`],
              ['ACRE An 1', sim.state.acreEnabled ? 'Oui (−50% cotis)' : 'Non'],
              ['CFE dès An 2', sim.state.citySize === 'petite' ? '~300 €' : sim.state.citySize === 'moyenne' ? '~550 €' : '~900 €'],
              ['Parts fiscales', `${sim.state.taxParts} parts`],
              ['Foyer', sim.state.nbAdultes === 2 ? `Couple${sim.state.nbEnfants > 0 ? `, ${sim.state.nbEnfants} enf.` : ''}` : 'Célibataire'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 6, borderLeft: '3px solid #4f46e5' }}>
                <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontWeight: 900, fontSize: 12 }}>{v}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 900, borderBottom: '2px solid #4f46e5', paddingBottom: 4, marginBottom: 10 }}>Projection 3 ans — {activeRegime}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #c7d2fe' }}>Indicateur</th>
                {projections.map((_, i) => (
                  <th key={i} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '2px solid #c7d2fe', color: '#4f46e5' }}>
                    Année {i + 1}{i === 0 && sim.state.acreEnabled ? ' (ACRE)' : i > 0 ? ' (+CFE)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'CA Annuel', key: 'ca' },
                { label: 'Cotisations sociales', key: 'cotis' },
                { label: 'Impôts (IR/IS)', key: 'ir' },
                { label: 'Revenu net mensuel', key: 'net', monthly: true },
              ].map((row, i) => (
                <tr key={i} style={{ background: row.monthly ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', fontWeight: row.monthly ? 900 : 600, borderBottom: '1px solid #e2e8f0' }}>{row.label}</td>
                  {projections.map((yearResults, j) => {
                    const r = yearResults.find((x: any) => x.id === activeRegime)! as any;
                    return (
                      <td key={j} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: row.monthly ? 900 : 'normal', borderBottom: '1px solid #e2e8f0', color: row.monthly && j === 2 ? '#4f46e5' : 'inherit' }}>
                        {row.monthly ? fmt((r[row.key] as number) / 12) + '/mois' : fmt(r[row.key] as number)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: 8, color: '#999', marginTop: 12, lineHeight: 1.5 }}>
            Simulation estimative — barèmes 2026. L&apos;ACRE réduit les cotisations de 50% la 1ère année pour les nouveaux créateurs.
            La CFE s&apos;applique dès la 2ème année selon la taille de votre commune.
            Ces projections ne constituent pas un conseil fiscal ou juridique.
          </p>
        </div>
      </div>
    </div>
  );
}
