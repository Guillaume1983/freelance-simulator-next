import Comparateur2View from '@/components/comparateur2/Comparateur2View';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ComparateurPage() {
  return (
    <>
      <Comparateur2View />

      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        <h1 className="sr-only">Comparateur de statuts freelance 2026</h1>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Pourquoi comparer les statuts freelance ?
        </h2>
        <p className="mb-4">
          Le choix du statut juridique détermine directement votre revenu net, vos cotisations sociales, votre imposition et votre protection. Portage salarial, micro-entreprise, EURL (IR ou IS) et SASU répondent chacun à des logiques différentes en termes de charges, de plafonds et de couverture sociale. Ce comparateur vous permet de visualiser ces différences sur un même chiffre d&apos;affaires pour identifier le régime le plus adapté à votre situation.
        </p>
        <p className="mb-8">
          Les résultats affichés sont indicatifs et s&apos;appuient sur les barèmes de la Loi de Finances 2026 et les publications de référence (Urssaf, impots.gouv.fr). Ils ne remplacent pas un conseil personnalisé auprès d&apos;un expert-comptable.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Questions fréquentes
        </h2>
        <dl className="space-y-5">
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Quel est le statut le plus avantageux en freelance ?</dt>
            <dd className="mt-1">Il n&apos;existe pas de réponse universelle : le meilleur statut dépend de votre chiffre d&apos;affaires, de vos charges déductibles, de votre situation familiale et de vos objectifs (protection sociale, retraite, dividendes). Le comparateur vous aide à objectiver la différence de revenu net entre chaque option.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Comment sont calculées les cotisations ?</dt>
            <dd className="mt-1">Les cotisations sont estimées selon les taux en vigueur pour chaque régime : taux forfaitaire en micro-entreprise, assiettes TNS pour l&apos;EURL, régime général assimilé salarié pour la SASU, et frais de gestion + cotisations salariales pour le portage. Chaque moteur de calcul intègre l&apos;ACRE si activée.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Puis-je simuler sur plusieurs années ?</dt>
            <dd className="mt-1">Oui. Le <Link href="/simulateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur 5 ans</Link> projette votre activité avec un taux de croissance du CA, l&apos;ACRE la première année et la CFE à partir de la deuxième.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Comment personnaliser les paramètres ?</dt>
            <dd className="mt-1">Ajustez directement le TJM, les jours travaillés, les charges et la situation fiscale depuis le panneau de réglages intégré au comparateur, ou via la page <Link href="/reglages" className="text-indigo-600 dark:text-indigo-400 hover:underline">Réglages</Link>.</dd>
          </div>
        </dl>
      </section>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </>
  );
}
