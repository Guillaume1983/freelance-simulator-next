'use client';
import { X, CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';

export default function SidePanel({ selectedId, setSelectedId }: any) {
  if (!selectedId) return null;

  return (
    <aside className="animate-in slide-in-from-right duration-500 sticky top-24">
      <div className="card-pro p-8 shadow-2xl border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-[#0f172a]">
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Analyse Statutaire</span>
            <h2 className="text-3xl font-900 dark:text-white uppercase tracking-tighter leading-none mt-1">{selectedId}</h2>
          </div>
          <button 
            onClick={() => setSelectedId(null)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Points Forts */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[24px] border border-emerald-100 dark:border-emerald-900/20">
            <h4 className="text-[11px] font-900 text-emerald-600 uppercase mb-4 flex items-center gap-2 italic">
              <CheckCircle size={14}/> Points Forts
            </h4>
            <ul className="text-[13px] font-bold text-slate-700 dark:text-slate-300 space-y-3">
              <li className="flex gap-2"><span>•</span> Optimisation fiscale validée 2026</li>
              <li className="flex gap-2"><span>•</span> Protection sociale adaptée au profil</li>
            </ul>
          </div>

          {/* Points de Vigilance */}
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[24px] border border-amber-100 dark:border-amber-900/20">
            <h4 className="text-[11px] font-900 text-amber-600 uppercase mb-4 flex items-center gap-2 italic">
              <AlertCircle size={14}/> Vigilance
            </h4>
            <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
              La gestion administrative est plus lourde sur ce statut. Un accompagnement comptable est fortement recommandé.
            </p>
          </div>

          {/* Call to action */}
          <div className="p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm flex items-center justify-between group hover:bg-indigo-600 transition-all">
              <span className="text-[11px] font-900 uppercase tracking-widest group-hover:text-white">Télécharger le rapport</span>
              <ArrowRight size={16} className="text-indigo-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}