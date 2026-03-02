'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { SlidersVertical, AlertCircle, CheckCircle, FileText, Rocket, Info, Eye, EyeOff } from 'lucide-react';

/* ── Pastilles de scroll mobile ── */
function ScrollDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex justify-center items-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? '#6366f1' : '#cbd5e1' }}
        />
      ))}
    </div>
  );
}

/* ── Style unifié pour tous les boutons export PDF ── */
const PDF_BTN = 'cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

const REGIME_ANALYSIS: Record<string, { forts: string[]; vigilance: string }> = {
  Portage: {
    forts: [
      'Accès au chômage (ARE) en fin de mission',
      'Protection sociale complète (régime salarié)',
      'Zéro gestion administrative',
    ],
    vigilance: "Les frais de gestion (5–10 % du CA) réduisent directement votre net. À comparer avec le gain en tranquillité administrative.",
  },
  Micro: {
    forts: [
      'Création instantanée, formalités nulles',
      'Comptabilité ultra simplifiée',
      'Charges proportionnelles au CA réel',
    ],
    vigilance: "Plafond de CA à 77 700 € en BNC. Au-delà, passage obligatoire en société. Pas de déduction des charges réelles.",
  },
  'EURL IR': {
    forts: [
      'Déduction des charges professionnelles réelles',
      'IR progressif : avantageux si revenus modérés',
      'Structure souple et personnalisable',
    ],
    vigilance: "Cotisations TNS d'environ 40 % de la base. Comptabilité obligatoire (expert-comptable recommandé).",
  },
  'EURL IS': {
    forts: [
      "Bénéfice en société taxé à l'IS réduit (15–25 %)",
      'Pilotage flexible de la rémunération',
      'Optimisation par capitalisation possible',
    ],
    vigilance: "Double imposition si distribution de dividendes (IS + PFU 30 %). Comptabilité exigeante.",
  },
  SASU: {
    forts: [
      'Protection assimilé-salarié (retraite, prévoyance)',
      'Dividendes possibles au PFU 30 %',
      'Statut reconnu pour les missions premium',
    ],
    vigilance: "Charges sociales élevées sur le salaire (~75 %). Pas d'accès à l'ARE en fin d'activité de président.",
  },
};

/* ── Barre unique segmentée (Charges → Cotis → IR → Net) + labels à droite ── */
function StackedBar({ ca, fees, cotis, ir, net }: {
  ca: number; fees: number; cotis: number; ir: number; net: number;
}) {
  const total = Math.max(ca, 1);
  const segs = [
    { pct: (fees  / total) * 100, color: '#fb7185', label: 'Charges' },
    { pct: (cotis / total) * 100, color: '#fbbf24', label: 'Cotis'   },
    { pct: (ir    / total) * 100, color: '#f87171', label: 'Impôts'  },
    { pct: (net   / total) * 100, color: '#34d399', label: 'Net'     },
  ];
  return (
    <div className="flex items-center gap-3 py-1">
      {/* Barre */}
      <div
        className="rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700"
        style={{ width: 56, height: 88 }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.color }}
            className="transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      {/* Labels à droite */}
      <div className="flex flex-col gap-1.5">
        {segs.map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-[8px] font-black leading-none whitespace-nowrap" style={{ color: s.color }}>
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
            {s.label} {Math.round(s.pct)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonTable({ sim }: { sim: any }) {
  const [showDetails, setShowDetails] = useState(false);
  const [openSettings, setOpenSettings] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState(0);

  const printRef      = useRef<HTMLDivElement>(null);
  const cardScrollRef = useRef<HTMLDivElement>(null);

  const onCardScroll = () => {
    const el = cardScrollRef.current;
    if (!el) return;
    const count = sim.resultats.length;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / count));
    setActiveCard(Math.min(idx, count - 1));
  };
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: '@page { size: A4 landscape; margin: 12mm; }',
  });

  const regimes  = sim.resultats;
  const winnerId = [...regimes].sort((a: any, b: any) => b.net - a.net)[0].id;
  const fmt      = (v: number) => Math.round(v).toLocaleString() + ' €';

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

  const getDisplayValue = (r: any, row: typeof rows[number]) => (r[row.key] as number) / row.div;
  const getMobileUnit   = (row: typeof rows[number]) => row.div === 12 ? '/mois' : '/an';

  const getDetailText = (r: any, key: string): string => {
    const f = (v: number) => Math.round(v).toLocaleString() + ' €';
    switch (key) {
      case 'ca':        return `${sim.state.tjm} € × ${sim.state.days} jours`;
      case 'fees':
        if (r.id === 'Micro')   return r.fees > 0 ? `CFE = ${f(r.fees)}` : 'Aucune charge déductible';
        if (r.id === 'Portage') return `Commission ${sim.state.portageComm}% + Charges + IK`;
        return `Charges + IK + CFE`;
      case 'cotis':
        if (r.id === 'Micro')    return `${f(r.ca)} × 21,1%`;
        if (r.id === 'Portage')  return `Base nette × 45%`;
        if (r.id === 'EURL IR')  return `(CA − Charges) × 40%`;
        if (r.id === 'EURL IS')  return `Rémunération × 45%`;
        return `IS 20% (inclus dans rémunération)`;
      case 'beforeTax':
        if (r.id === 'EURL IS') return `(${f(r.ca)} − ${f(r.fees)}) ÷ 1,45`;
        if (r.id === 'SASU')    return `(${f(r.ca)} − ${f(r.fees)}) × 80% (IS 20%)`;
        return `${f(r.ca)} − ${f(r.fees)} − ${f(r.cotis)}`;
      case 'ir':
        if (r.id === 'Micro') return `Barème IR (base = CA × 66%)`;
        if (r.id === 'SASU')  return `Rémunération × 30% (PFU)`;
        return `Barème progressif IR — ${sim.state.taxParts} parts`;
      case 'net':
        return r.l > 0
          ? `${f(r.beforeTax)} − ${f(r.ir)} + Loyer ${f(r.l)}`
          : `${f(r.beforeTax)} − ${f(r.ir)}`;
      default: return '';
    }
  };

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

              {/* Cellule haut-gauche avec bouton Export PDF */}
              <th className="p-6 text-left border-b dark:border-slate-800 w-[220px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                  Comparatif<br />Stratégique
                </h3>
                <div className="flex flex-col gap-2 mt-3">
                  <button onClick={handlePrint} className={PDF_BTN}>
                    <FileText size={11} /> Export PDF
                  </button>
                  <button
                    onClick={() => setShowDetails(v => !v)}
                    className={`${PDF_BTN} ${showDetails ? 'bg-indigo-50! dark:bg-indigo-900/30! border-indigo-300! dark:border-indigo-700! text-indigo-600! dark:text-indigo-400!' : ''}`}
                  >
                    {showDetails ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showDetails ? 'Masquer' : 'Détails'}
                  </button>
                </div>
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
                <tr className={`transition-colors ${(row as any).highlight ? 'bg-slate-50/50 dark:bg-slate-900/30 font-bold' : ''} ${(row as any).isFinal ? 'bg-indigo-50/30 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black' : ''}`}>
                  <td className="p-4 border-r dark:border-slate-800">
                    <div className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">{row.label}</div>
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
                {showDetails && (
                  <tr className="bg-slate-50/40 dark:bg-slate-800/20">
                    <td className="px-4 py-1.5 border-r dark:border-slate-800 text-[8px] text-slate-400 font-bold uppercase italic tracking-widest">Calcul</td>
                    {regimes.map((r: any) => (
                      <td key={r.id} className="px-4 py-1.5 text-center">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{getDetailText(r, row.key)}</span>
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
                <td key={r.id} className="px-4 py-3">
                  <div className="flex justify-center">
                    <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                  </div>
                </td>
              ))}
            </tr>

            {/* ── Ligne Points Forts ── */}
            <tr className="bg-white dark:bg-[#0f172a]">
              <td className="px-4 pt-4 pb-2 border-r dark:border-slate-800 align-top">
                <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">Analyse<br />Statutaire</div>
              </td>
              {regimes.map((r: any) => {
                const data = REGIME_ANALYSIS[r.id];
                return (
                  <td key={r.id} className="px-3 pt-3 pb-1" style={{ height: '1px' }}>
                    {data && (
                      <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20 h-full">
                        <h4 className="text-[9px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-1">
                          <CheckCircle size={10} /> Points Forts
                        </h4>
                        <ul className="text-[10px] font-bold text-slate-700 dark:text-slate-300 space-y-1.5">
                          {data.forts.map(f => (
                            <li key={f} className="flex gap-1.5">
                              <span className="shrink-0 text-emerald-500">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* ── Ligne Vigilance ── */}
            <tr className="bg-white dark:bg-[#0f172a]">
              <td className="border-r dark:border-slate-800" />
              {regimes.map((r: any) => {
                const data = REGIME_ANALYSIS[r.id];
                return (
                  <td key={r.id} className="px-3 py-1" style={{ height: '1px' }}>
                    {data && (
                      <div className="bg-amber-50/60 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20 h-full">
                        <h4 className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center gap-1">
                          <AlertCircle size={10} /> Vigilance
                        </h4>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                          {data.vigilance}
                        </p>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* ── Ligne Boutons Je me lance ── */}
            <tr className="bg-white dark:bg-[#0f172a]">
              <td className="border-r dark:border-slate-800" />
              {regimes.map((r: any) => {
                const color = REGIME_COLORS[r.id] ?? '#6366f1';
                return (
                  <td key={r.id} className="px-3 pt-1 pb-4">
                    <Link
                      href={`/partenaires?regime=${encodeURIComponent(r.id)}`}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider transition-all hover:opacity-90 shadow-sm"
                      style={{ background: color }}
                    >
                      <Rocket size={12} /> Je me lance en {r.id}
                    </Link>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Vue mobile : cartes par régime ── */}
      <div className="block md:hidden p-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Comparatif stratégique
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(v => !v)}
              className={`${PDF_BTN} ${showDetails ? 'bg-indigo-50! dark:bg-indigo-900/30! border-indigo-300! text-indigo-600!' : ''}`}
            >
              {showDetails ? <EyeOff size={11} /> : <Eye size={11} />}
              {showDetails ? 'Masquer' : 'Détails'}
            </button>
            <button onClick={handlePrint} className={PDF_BTN}>
              <FileText size={11} /> PDF
            </button>
          </div>
        </div>
        <div
          ref={cardScrollRef}
          onScroll={onCardScroll}
          className="-mx-4 px-1 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
        >
          {regimes.map((r: any) => {
            const isWinner = r.id === winnerId;
            const color    = REGIME_COLORS[r.id] ?? '#6366f1';
            return (
              <div
                key={r.id}
                className="snap-center shrink-0 w-[calc(100vw-3rem)] max-w-sm relative border overflow-hidden rounded-2xl bg-white dark:bg-[#020617] shadow-lg"
              >
                <div className="h-1 w-full" style={{ background: color }} />
                <button
                  onClick={e => { e.stopPropagation(); setOpenSettings(openSettings === r.id ? null : r.id); }}
                  className={`absolute top-4 right-3 z-10 transition-colors ${openSettings === r.id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
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
                  {isWinner && (
                    <div className="mb-2 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>🏆</span> OPTIMUM
                    </div>
                  )}
                  <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center gap-1">🧠 {r.mental}/5</span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">{r.safety}</span>
                  </div>
                </div>
                <div className="px-4 pb-2 space-y-1.5">
                  {rows.map((row) => (
                    <div key={row.key}>
                      <div className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${
                        (row as any).isFinal ? 'bg-indigo-50/70 dark:bg-indigo-900/40'
                        : (row as any).highlight ? 'bg-slate-50/70 dark:bg-slate-900/40'
                        : 'bg-slate-50/40 dark:bg-slate-900/20'
                      }`}>
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.label}</p>
                        <span className={`text-[11px] font-black ${(row as any).isFinal ? 'text-indigo-700 dark:text-indigo-300' : (row as any).color || 'text-slate-800 dark:text-slate-100'}`}>
                          {(row as any).prefix} {fmt(getDisplayValue(r, row))}
                          <span className="text-[9px] text-slate-400 ml-1">{getMobileUnit(row)}</span>
                        </span>
                      </div>
                      {showDetails && (
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 italic font-medium px-3 pt-0.5 pb-1">
                          {getDetailText(r, row.key)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {/* Analyse statutaire mobile */}
                {(() => {
                  const data = REGIME_ANALYSIS[r.id];
                  return data ? (
                    <div className="px-4 pb-4 space-y-2 border-t dark:border-slate-800 pt-3 mt-1">
                      <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                        <h4 className="text-[9px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-1">
                          <CheckCircle size={10} /> Points Forts
                        </h4>
                        <ul className="text-[10px] font-bold text-slate-700 dark:text-slate-300 space-y-1.5">
                          {data.forts.map(f => (
                            <li key={f} className="flex gap-1.5">
                              <span className="shrink-0 text-emerald-500">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50/60 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
                        <h4 className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center gap-1">
                          <AlertCircle size={10} /> Vigilance
                        </h4>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                          {data.vigilance}
                        </p>
                      </div>
                      <Link
                        href={`/partenaires?regime=${encodeURIComponent(r.id)}`}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider transition-all hover:opacity-90 shadow-sm"
                        style={{ background: color }}
                      >
                        <Rocket size={12} /> Je me lance en {r.id}
                      </Link>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })}
        </div>
        <ScrollDots total={sim.resultats.length} active={activeCard} />
      </div>

      <p className="text-[9px] text-slate-400 italic px-4 md:px-6 py-3 flex items-center gap-1">
        <Info size={10} /> Simulation estimative. Consultez un expert-comptable pour votre situation personnelle.
      </p>

      {/* ── PDF Comparatif (masqué) ── */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', padding: '10mm', fontSize: 11 }}>
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
                {regimes.map((r: any) => (
                  <th key={r.id} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: REGIME_COLORS[r.id] }}>{r.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'CA Annuel',      key: 'ca' },
                { label: 'Charges & IK',   key: 'fees' },
                { label: 'Cotisations',    key: 'cotis' },
                { label: 'Net avant IR',   key: 'beforeTax', monthly: true },
                { label: 'Impôts (IR/IS)', key: 'ir' },
                { label: 'NET MENSUEL',    key: 'net',       monthly: true },
              ].map((row, i) => (
                <tr key={i} style={{ background: (row as any).monthly ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', fontWeight: (row as any).monthly ? 900 : 600, borderBottom: '1px solid #e2e8f0' }}>{row.label}</td>
                  {regimes.map((r: any) => (
                    <td key={r.id} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: (row as any).monthly ? 900 : 'normal', borderBottom: '1px solid #e2e8f0' }}>
                      {(row as any).monthly ? fmt((r[row.key] as number) / 12) + '/mois' : fmt(r[row.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 8, color: '#999', marginTop: 8 }}>Simulation estimative — barèmes 2026.</p>
        </div>
      </div>
    </div>
  );
}
