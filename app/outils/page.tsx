import type { Metadata } from 'next';
import OutilsUnifiedClient from '@/components/outils/OutilsUnifiedClient';
import Footer from '@/components/Footer';
import { getOutilsPageJsonLd } from '@/lib/seo/mainPagesJsonLd';
import { outilsPageMetadata } from '@/lib/seo/mainPagesMetadata';
import Link from 'next/link';

export const metadata: Metadata = outilsPageMetadata;

const outilsJsonLd = getOutilsPageJsonLd();

export default function OutilsPage() {
  return (
    <OutilsUnifiedClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(outilsJsonLd) }}
      />
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
        <h1 className="sr-only">
          Outils freelance : calculateurs IK, CFE, ACRE, micro, TVA, TJM, IR et cotisations TNS (2026)
        </h1>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          Des calculateurs pour piloter votre activité
        </h2>
        <p className="mb-3">
          Cette page regroupe les outils essentiels pour un freelance ou créateur d&apos;entreprise : calcul des indemnités kilométriques (barème fiscal 2026), estimation de la CFE selon la taille de votre commune, simulation de l&apos;ACRE sur la première année, vérification des plafonds micro-entreprise et de la franchise en base de TVA, conversion TJM en revenu net annuel, calcul du taux effectif d&apos;IR et estimation des cotisations TNS.
        </p>
        <p className="mb-6 text-[13px] italic">
          Chaque outil s&apos;appuie sur les barèmes officiels en vigueur. Les résultats sont indicatifs et ne constituent pas un conseil fiscal.
        </p>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          Questions fréquentes
        </h2>
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment calculer mes indemnités kilométriques ?</dt>
            <dd className="mt-0.5">Renseignez votre kilométrage annuel professionnel et la puissance fiscale de votre véhicule. L&apos;outil applique le barème fiscal en vigueur pour estimer le montant déductible.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Qu&apos;est-ce que l&apos;ACRE ?</dt>
            <dd className="mt-0.5">L&apos;ACRE (aide aux créateurs et repreneurs d&apos;entreprise) réduit vos cotisations sociales la première année d&apos;activité. L&apos;outil estime l&apos;économie réalisée selon votre statut et votre chiffre d&apos;affaires.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-600 dark:text-slate-300">Comment convertir un TJM en revenu net annuel ?</dt>
            <dd className="mt-0.5">L&apos;outil multiplie votre TJM par le nombre de jours travaillés, puis déduit les cotisations et l&apos;impôt estimés pour chaque statut. Cela donne un ordre de grandeur du revenu net disponible.</dd>
          </div>
        </dl>

        <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500">
          Pour une vue d&apos;ensemble, utilisez le{' '}
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur de statuts</Link>
          {' '}ou le{' '}
          <Link href="/simulateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur 5 ans</Link>.
        </p>
      </section>

      <Footer />
    </OutilsUnifiedClient>
  );
}
