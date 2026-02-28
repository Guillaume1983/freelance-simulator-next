'use client';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const regimeData: Record<string, { forts: string[]; vigilance: string }> = {
  Portage: {
    forts: [
      "Accès au chômage (ARE) en fin de mission",
      "Protection sociale complète (régime salarié)",
      "Zéro gestion administrative",
    ],
    vigilance: "Les frais de gestion (5–10 % du CA) réduisent directement votre net. À comparer avec le gain en tranquillité administrative.",
  },
  Micro: {
    forts: [
      "Création instantanée, formalités nulles",
      "Comptabilité ultra simplifiée",
      "Charges proportionnelles au CA réel",
    ],
    vigilance: "Plafond de CA à 77 700 € en BNC. Au-delà, passage obligatoire en société. Pas de déduction des charges réelles.",
  },
  "EURL IR": {
    forts: [
      "Déduction des charges professionnelles réelles",
      "IR progressif : avantageux si revenus modérés",
      "Structure souple et personnalisable",
    ],
    vigilance: "Cotisations TNS d\u2019environ 40 % de la base. Comptabilité obligatoire (expert-comptable recommandé).",
  },
  "EURL IS": {
    forts: [
      "Bénéfice en société taxé à l\u2019IS réduit (15–25 %)",
      "Pilotage flexible de la rémunération",
      "Optimisation par capitalisation possible",
    ],
    vigilance: "Double imposition si distribution de dividendes (IS + PFU 30 %). Comptabilité exigeante.",
  },
  SASU: {
    forts: [
      "Protection assimilé-salarié (retraite, prévoyance)",
      "Dividendes possibles au PFU 30 %",
      "Statut reconnu pour les missions premium",
    ],
    vigilance: "Charges sociales élevées sur le salaire (~75 %). Pas d\u2019accès à l\u2019ARE en fin d\u2019activité de président.",
  },
};

export default function SidePanel({ selectedId, setSelectedId }: any) {
  if (!selectedId) return null;
  const data = regimeData[selectedId];

  return (
    <aside className="animate-in slide-in-from-right duration-500 md:sticky md:top-24">
      <div className="card-pro px-5 md:px-7 py-6 md:py-8 shadow-2xl border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-[#0f172a]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Analyse Statutaire</span>
            <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none mt-1">{selectedId}</h2>
          </div>
          <button
            onClick={() => setSelectedId(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {data && (
          <div className="space-y-5">
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
          </div>
        )}
      </div>
    </aside>
  );
}
