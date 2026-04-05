import Link from 'next/link';
import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';

export default function HypothesesPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <SitePageHeader
        title={"Hypothèses de calcul & limites du simulateur"}
        description="Principales hypothèses du comparateur et des simulateurs. Ne remplace pas un conseil d'expert-comptable."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <section className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              ACRE & cotisations sociales
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                ACRE modélisée comme un allègement d&apos;environ 25&nbsp;% des cotisations
                TNS / Micro la première année (hors CSG/CRDS), sans dégressivité fine en fonction
                du revenu.
              </li>
              <li>
                Au-delà de la première année, les cotisations reviennent sur un niveau &laquo;&nbsp;plein&nbsp;&raquo;
                selon les barèmes 2026.
              </li>
              <li>
                Le <strong>comparateur</strong> calcule en année&nbsp;2 (régime établi)&nbsp;: l&apos;ACRE n&apos;y est pas
                prise en compte. Le <strong>simulateur 5 ans</strong> permet d&apos;activer l&apos;ACRE pour la
                première année de projection dans les réglages.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              CFE & année de référence
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Le comparateur calcule en <strong>année&nbsp;2</strong> (régime de croisière)&nbsp;:
                la CFE est prise en compte, sans application du taux de croissance sur le CA.
              </li>
              <li>
                Le simulateur 5&nbsp;ans projette les 5&nbsp;premières années avec la CFE
                à partir de l&apos;année&nbsp;2 et le taux de croissance paramétré.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              Micro‑entreprise
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Plafonds de chiffre d&apos;affaires 2026 utilisés (BIC/BNC), avec un indicateur
                de dépassement du plafond dans le comparateur.
              </li>
              <li>
                Taux de cotisations forfaitaires URSSAF 2026 par type d&apos;activité (BIC commerce,
                BIC services, BNC), sans prise en compte de toutes les options possibles (versement
                libératoire, etc.).
              </li>
              <li>
                Les dépenses professionnelles ne sont pas déduites en micro‑entreprise au‑delà de
                l&apos;abattement forfaitaire prévu par le régime.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              IR, IS & dividendes
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Impôt sur le revenu calculé à partir du barème progressif 2026 et du nombre de parts
                fiscales saisi, sur la base d&apos;un revenu imposable simplifié.
              </li>
              <li>
                <strong>EURL IS</strong>&nbsp;: IS appliqué à 25&nbsp;% sur le bénéfice non versé en salaire.
                Le gérant TNS perçoit un salaire (cotisations ~45&nbsp;% du net) soumis à l&apos;IR
                progressif. Part du résultat affectée au salaire paramétrable (défaut&nbsp;: 100&nbsp;%).
              </li>
              <li>
                <strong>SASU</strong>&nbsp;: le président (assimilé salarié) peut mixer salaire et dividendes
                via le curseur &laquo;&nbsp;Part salaire&nbsp;&raquo;. Le salaire supporte des cotisations
                d&apos;environ 82&nbsp;% du net et est soumis à l&apos;IR progressif. Le bénéfice non versé
                en salaire est taxé à l&apos;IS PME (15&nbsp;% jusqu&apos;à 42&nbsp;500&nbsp;€, 25&nbsp;% au-delà)
                puis distribué en dividendes au PFU 30&nbsp;% (12,8&nbsp;% IR + 17,2&nbsp;% prélèvements sociaux).
              </li>
              <li>
                Pas de simulation d&apos;arbitrage PFU / barème progressif pour les dividendes.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              Indemnités kilométriques & loyer
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Indemnités kilométriques calculées sur la base du barème fiscal annuel, en supposant
                que les déplacements déclarés sont bien éligibles.
              </li>
              <li>
                Loyer perçu modélisé comme une charge pour la société et un revenu imposable pour le
                foyer, sans détailler toutes les conséquences fiscales (foncier, micro‑foncier, etc.).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              Portage salarial
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Commission de portage paramétrable (taux par défaut inspiré du marché), appliquée
                sur le chiffre d&apos;affaires encaissé.
              </li>
              <li>
                Les frais de gestion additionnels et services optionnels ne sont pas modélisés de
                façon exhaustive.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">
              Limites de la simulation
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Les résultats sont des ordres de grandeur pédagogiques pour comparer les statuts,
                pas une situation fiscale exacte.
              </li>
              <li>
                Ne sont pas pris en compte&nbsp;: tous les crédits / réductions d&apos;impôt possibles,
                les situations familiales complexes, les activités mixtes, les options fiscales
                spécifiques, etc.
              </li>
              <li>
                Avant un choix de statut ou une décision importante, faites valider les résultats
                par un expert‑comptable.
              </li>
            </ul>
          </div>
        </section>

        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 italic">
          Dernière mise à jour&nbsp;: Loi de Finances 2026. Cette méthodologie est amenée à évoluer.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/comparateur"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow hover:bg-indigo-700 transition-colors"
          >
            ← Retour au comparateur
          </Link>
          <Link
            href="/simulateur/sasu"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            Voir un simulateur (ex. SASU)
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}

