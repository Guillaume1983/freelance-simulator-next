'use client';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Rocket } from 'lucide-react';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

const regimeData: Record<string, { forts: string[]; vigilance: string }> = {
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
      'Bénéfice en société taxé à l\'IS réduit (15–25 %)',
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

export default function SidePanel({ selectedId }: { selectedId: string }) {
  const data  = regimeData[selectedId];
  const color = REGIME_COLORS[selectedId] ?? '#6366f1';

  return (
    <div className="card-pro bg-white dark:bg-[#0f172a] shadow-xl animate-in fade-in duration-300 overflow-hidden">
      {/* Bande couleur */}
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="px-5 md:px-6 py-5">
        {/* Layout horizontal sur desktop : [Identité + CTA | Points forts | Vigilance] */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-5 md:gap-6 items-start">

          {/* Colonne 1 : Identité du régime + bouton Je me lance */}
          <div className="md:border-r dark:border-slate-800 md:pr-6 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Statutaire</span>
              <h2
                className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mt-1"
                style={{ color }}
              >
                {selectedId}
              </h2>
            </div>
            <Link
              href={`/partenaires?regime=${encodeURIComponent(selectedId)}`}
              className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-black text-[11px] uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-lg shadow-md whitespace-nowrap w-fit"
              style={{ background: color }}
            >
              <Rocket size={13} /> Je me lance
            </Link>
          </div>

          {/* Colonne 2 : Points forts */}
          {data && (
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <h4 className="text-[11px] font-black text-emerald-600 uppercase mb-2.5 flex items-center gap-1.5 italic">
                <CheckCircle size={13} /> Points Forts
              </h4>
              <ul className="text-[11px] font-bold text-slate-700 dark:text-slate-300 space-y-1.5">
                {data.forts.map(f => (
                  <li key={f} className="flex gap-2"><span className="shrink-0">•</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Colonne 3 : Vigilance */}
          {data && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <h4 className="text-[11px] font-black text-amber-600 uppercase mb-2.5 flex items-center gap-1.5 italic">
                <AlertCircle size={13} /> Vigilance
              </h4>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                {data.vigilance}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
