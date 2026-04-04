import ComparateurView from '@/components/comparateur/ComparateurView';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ComparateurPage() {
  return (
    <ComparateurView>
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
            <dd className="mt-0.5">Les cotisations sont estimées selon les taux en vigueur pour chaque régime : taux forfaitaire en micro-entreprise, barème TNS détaillé pour l&apos;EURL IR, cotisations TNS forfaitaires (~45&nbsp;%) pour l&apos;EURL IS, cotisations assimilé salarié (~82&nbsp;% du net) pour la SASU et le portage. L&apos;ACRE est désactivée par défaut (régime de croisière) mais peut être activée dans les réglages.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment fonctionne la SASU dans le comparateur ?</dt>
            <dd className="mt-0.5">Le président de SASU peut mixer salaire (soumis aux cotisations assimilé salarié + IR progressif) et dividendes (soumis à l&apos;IS PME 15&nbsp;%/25&nbsp;% puis au PFU 30&nbsp;%). Le curseur &laquo;&nbsp;Part salaire&nbsp;&raquo; permet d&apos;ajuster ce mix. À haut CA, les dividendes au PFU fixe deviennent plus avantageux que les tranches IR élevées.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Puis-je simuler sur plusieurs années ?</dt>
            <dd className="mt-0.5">Oui. Le <Link href="/simulateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur 5 ans</Link> projette votre activité avec un taux de croissance du CA, l&apos;ACRE la première année et la CFE à partir de la deuxième.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">La CFE est-elle prise en compte ?</dt>
            <dd className="mt-0.5">Oui. Le comparateur calcule en régime de croisière (année&nbsp;2) : la CFE est incluse selon la taille de ville sélectionnée (300&nbsp;€ à 900&nbsp;€/an). Elle est exonérée la première année uniquement.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment personnaliser les paramètres ?</dt>
            <dd className="mt-0.5">Ajustez directement le TJM, les jours travaillés, les charges et la situation fiscale depuis le panneau de réglages à droite (bouton <span className="font-semibold text-slate-600 dark:text-slate-300">Réglages</span> sur mobile).</dd>
          </div>
        </dl>
      </section>

      <Footer />
    </ComparateurView>
  );
}
