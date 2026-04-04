import Link from 'next/link';
import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';
import {
  CFE_PAR_VILLE,
  DEFAULT_PORTAGE_COMM,
  PLAFOND_MICRO_BIC,
  PLAFOND_MICRO_BNC,
  SEUIL_TRIMESTRE_RETRAITE,
} from '@/lib/constants';
import { PASS, RATES_2026 } from '@/lib/financial/rates';
import { SITE_URL } from '@/lib/seo/jsonLd';

function eur(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + '\u00a0€';
}

function pct(n: number, digits = 1) {
  return (n * 100).toLocaleString('fr-FR', { maximumFractionDigits: digits }) + '\u00a0%';
}

export default function BaremePage() {
  const { ir, micro, portage, eurlIs, sasu, is, isSasu, ik } = RATES_2026;

  const irRows = ir.tranches.map((row, i) => {
    const low = i === 0 ? 0 : Number(ir.tranches[i - 1]!.seuil) + 1;
    const high = row.seuil === Infinity ? null : row.seuil;
    return { low, high, taux: row.taux };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Barèmes et plafonds — Freelance Simulateur',
    url: `${SITE_URL}/bareme`,
    isPartOf: { '@type': 'WebSite', name: 'Freelance Simulateur', url: SITE_URL },
    description:
      'Synthèse des constantes financières (PASS, micro, IR, IS, IK) utilisées dans les simulateurs.',
  };

  return (
    <main className="min-h-screen bg-page-settings">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SitePageHeader
        title="Barèmes & plafonds"
        description="Valeurs intégrées au moteur de calcul du site (référence fiscale et sociale modélisée 2026)."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-10 text-sm text-slate-700 dark:text-slate-300">
        <p className="leading-relaxed rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-slate-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100/90">
          Tableau indicatif : il reprend les barèmes et plafonds effectivement utilisés par les simulateurs et le
          comparateur. Pour la façon dont ils sont appliqués dans les calculs (hypothèses, simplifications), voir la{' '}
          <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            méthodologie
          </Link>
          .
        </p>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">PASS (Sécurité sociale)</h2>
          <p className="mt-2 leading-relaxed">
            Plafond annuel de la Sécurité sociale utilisé dans le moteur : <strong>{eur(PASS)}</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Plafonds de chiffre d’affaires — micro-entreprise</h2>
          <p className="mt-2 mb-3 text-slate-600 dark:text-slate-400">
            Prestations de services (BNC / BIC services) et vente / réservation d’hébergement (BIC).
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-bold">Catégorie</th>
                  <th className="px-3 py-2 font-bold">Plafond annuel de CA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">Prestations de services (BNC / BIC services)</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{eur(PLAFOND_MICRO_BNC)}</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">Vente / hébergement (BIC)</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{eur(PLAFOND_MICRO_BIC)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Micro-entreprise — cotisations et abattements</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[360px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-bold">Type</th>
                  <th className="px-3 py-2 font-bold">Cotisations (CA)</th>
                  <th className="px-3 py-2 font-bold">Abattement forfaitaire</th>
                  <th className="px-3 py-2 font-bold">PL (formation)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">BNC</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BNC.cotis, 2)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BNC.abattement, 0)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BNC.pl, 2)}</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">BIC services</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_SERVICE.cotis, 2)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_SERVICE.abattement, 0)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_SERVICE.pl, 2)}</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">BIC commerce</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_COMMERCE.cotis, 2)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_COMMERCE.abattement, 0)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(micro.BIC_COMMERCE.pl, 2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Facteur ACRE micro (fraction du taux payée la 1ʳᵉ année si option active) :{' '}
            <strong>{pct(micro.acre, 0)}</strong> du taux normal.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">CFE (montants indicatifs dans le simulateur)</h2>
          <p className="mt-2 mb-3">Ville selon taille choisie dans les réglages :</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Petite : <strong>{eur(CFE_PAR_VILLE.petite)}</strong>
            </li>
            <li>
              Moyenne : <strong>{eur(CFE_PAR_VILLE.moyenne)}</strong>
            </li>
            <li>
              Grande : <strong>{eur(CFE_PAR_VILLE.grande)}</strong>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Impôt sur le revenu — barème par part</h2>
          <p className="mt-2 mb-3">
            Abattement forfaitaire sur la base foyer (professions non salariées, modèle simplifié) :{' '}
            <strong>{pct(ir.abattement, 0)}</strong>. Tranches sur le revenu imposable <em>par part</em> (après
            abattement) :
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[320px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-bold">Revenu imposable / part (après abattement)</th>
                  <th className="px-3 py-2 font-bold">Taux marginal</th>
                </tr>
              </thead>
              <tbody>
                {irRows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2 font-mono tabular-nums">
                      {row.high === null
                        ? `Plus de ${eur(row.low - 1)}`
                        : `${eur(row.low)} à ${eur(row.high)}`}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums">{pct(row.taux, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Le calcul appliqué dans l’outil suit la logique progressive documentée dans le moteur (tranches successives).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Impôt sur les sociétés</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Taux standard modélisé : <strong>{pct(is.taux, 0)}</strong>
            </li>
            <li>
              IS PME (SASU / EURL IS) : <strong>{pct(isSasu.tauxReduit, 0)}</strong> jusqu’à{' '}
              <strong>{eur(isSasu.seuilTauxReduit)}</strong> de résultat imposable, puis{' '}
              <strong>{pct(isSasu.tauxNormal, 0)}</strong> au-delà (seuil défini dans le code).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Flat tax — dividendes</h2>
          <p className="mt-2">
            Taux forfaitaire retenu pour la composante « flat tax » sur dividendes : <strong>{pct(RATES_2026.flatTaxDividendes, 0)}</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Portage, EURL IS, SASU — taux retenus</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 font-bold">Statut (modèle)</th>
                  <th className="px-3 py-2 font-bold">Cotisations (ordre de grandeur)</th>
                  <th className="px-3 py-2 font-bold">Facteur ACRE</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">Portage</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(portage.cotis, 0)} de la base</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(portage.acre, 0)} du taux</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">EURL IS (gérant)</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(eurlIs.cotis, 0)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(eurlIs.acre, 0)} du taux</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">SASU (président)</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(sasu.cotis, 0)} du net (modèle)</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{pct(sasu.acre, 0)} du taux</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Commission de portage par défaut dans l’interface : <strong>{DEFAULT_PORTAGE_COMM}&nbsp;%</strong> du CA.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Indemnités kilométriques (URSSAF)</h2>
          <p className="mt-2 mb-3">
            Barème voiture (référence technique alignée sur l’arrêté URSSAF intégré au site) : tranches 0–5\u00a0000 km,
            5\u00a0001–20\u00a0000 km, au-delà de 20\u00a0000 km. Coefficients en euros par km et montant de raccordement par
            tranche, selon la puissance fiscale :
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[400px] text-left text-[11px] sm:text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-2 py-2 font-bold">CV</th>
                  <th className="px-2 py-2 font-bold">a</th>
                  <th className="px-2 py-2 font-bold">b</th>
                  <th className="px-2 py-2 font-bold">c</th>
                  <th className="px-2 py-2 font-bold">Raccord.</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ik).map(([cv, r]) => (
                  <tr key={cv} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-2 py-2 font-mono">{cv}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{r.a}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{r.b}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{r.c}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{r.midConst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Pour le détail moto et cyclomoteur (tranches et coefficients), utilisez l’outil{' '}
            <Link href="/outils?outil=indemnites-km" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Indemnités km
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Autres constantes</h2>
          <p className="mt-2">
            Seuil trimestre de retraite (base utilisée dans le moteur pour l’affichage du seuil) :{' '}
            <strong>{eur(SEUIL_TRIMESTRE_RETRAITE)}</strong> / trimestre.
          </p>
        </section>

        <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <Link href="/glossaire" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Glossaire
            </Link>
            {' · '}
            <Link href="/outils?outil=plafonds-micro" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Outil plafonds micro
            </Link>
            {' · '}
            <Link href="/comparateur" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Comparateur
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
