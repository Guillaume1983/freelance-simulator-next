import Comparateur2View from '@/components/comparateur2/Comparateur2View';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ComparateurPage() {
  return (
    <Comparateur2View>
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
        <h1 className="sr-only">Comparateur de statuts freelance 2026</h1>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          Pourquoi comparer les statuts freelance ?
        </h2>
        <p className="mb-3">
          Le choix du statut juridique détermine directement votre revenu net, vos cotisations sociales, votre imposition et votre protection. Portage salarial, micro-entreprise, EURL (IR ou IS) et SASU répondent chacun à des logiques différentes en termes de charges, de plafonds et de couverture sociale. Ce comparateur vous permet de visualiser ces différences sur un même chiffre d&apos;affaires pour identifier le régime le plus adapté à votre situation.
        </p>
        <p className="mb-6 text-[13px] italic">
          Les résultats sont indicatifs et s&apos;appuient sur les barèmes de la Loi de Finances 2026 (Urssaf, impots.gouv.fr). Ils ne remplacent pas un conseil personnalisé auprès d&apos;un expert-comptable.
        </p>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          Questions fréquentes
        </h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Quel est le statut le plus avantageux en freelance ?</dt>
            <dd className="mt-0.5">Il n&apos;existe pas de réponse universelle : le meilleur statut dépend de votre chiffre d&apos;affaires, de vos charges déductibles, de votre situation familiale et de vos objectifs (protection sociale, retraite, dividendes). Le comparateur vous aide à objectiver la différence de revenu net entre chaque option.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment sont calculées les cotisations ?</dt>
            <dd className="mt-0.5">Les cotisations sont estimées selon les taux en vigueur pour chaque régime : taux forfaitaire en micro-entreprise, assiettes TNS pour l&apos;EURL, régime général assimilé salarié pour la SASU, et frais de gestion + cotisations salariales pour le portage. Chaque moteur de calcul intègre l&apos;ACRE si activée.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Puis-je simuler sur plusieurs années ?</dt>
            <dd className="mt-0.5">Oui. Le <Link href="/simulateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur 5 ans</Link> projette votre activité avec un taux de croissance du CA, l&apos;ACRE la première année et la CFE à partir de la deuxième.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment personnaliser les paramètres ?</dt>
            <dd className="mt-0.5">Ajustez directement le TJM, les jours travaillés, les charges et la situation fiscale depuis le panneau de réglages intégré au comparateur, ou via la page <Link href="/reglages" className="text-indigo-600 dark:text-indigo-400 hover:underline">Réglages</Link>.</dd>
          </div>
        </dl>
      </section>

      <Footer />
    </Comparateur2View>
  );
}
