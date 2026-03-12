'use client';

import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 md:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-3">
          Données & confidentialité
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Ce simulateur est conçu pour fonctionner avec un minimum de données personnelles.
          Les simulations sont purement indicatives et ne constituent pas un conseil fiscal
          ou comptable. Pour toute décision importante, rapprochez-vous d&apos;un expert-comptable.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Lorsque vous créez un compte, seule votre adresse email est demandée pour
          permettre la sauvegarde de vos paramètres et de vos simulations. Aucune donnée
          sensible (revenus bancaires, numéro de sécurité sociale, etc.) n&apos;est collectée.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Les cookies et outils de mesure d&apos;audience éventuellement utilisés le sont uniquement
          pour améliorer l&apos;ergonomie et le fonctionnement du site.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Pour toute question ou demande liée à vos données, vous pouvez nous contacter via la
          page{' '}
          <Link
            href="/contact"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            contact
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

