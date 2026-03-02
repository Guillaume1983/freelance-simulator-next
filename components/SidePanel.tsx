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
    <aside className="md:sticky md:top-24 animate-in fade-in duration-300">
      <div className="card-pro px-5 md:px-7 py-6 md:py-8 shadow-2xl border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-[#0f172a]">

        {/* En-tête */}
        <div className="mb-6">
          <div className="w-8 h-1.5 rounded-full mb-3" style={{ background: color }} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Statutaire</span>
          <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none mt-1">
            {selectedId}
          </h2>
        </div>

        {data && (
          <div className="space-y-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-[20px] border border-emerald-100 dark:border-emerald-900/20">
              <h4 className="text-[11px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2 italic">
                <CheckCircle size={13} /> Points Forts
              </h4>
              <ul className="text-[12px] font-bold text-slate-700 dark:text-slate-300 space-y-2.5">
                {data.forts.map(f => (
                  <li key={f} className="flex gap-2"><span className="shrink-0">•</span>{f}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-[20px] border border-amber-100 dark:border-amber-900/20">
              <h4 className="text-[11px] font-black text-amber-600 uppercase mb-3 flex items-center gap-2 italic">
                <AlertCircle size={13} /> Vigilance
              </h4>
              <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                {data.vigilance}
              </p>
            </div>

            {/* Bouton Je me lance */}
            <Link
              href={`/partenaires?regime=${encodeURIComponent(selectedId)}`}
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl text-white font-black text-[11px] uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-lg shadow-md"
              style={{ background: color }}
            >
              <Rocket size={14} /> Je me lance avec {selectedId}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
