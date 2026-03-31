import OutilsUnifiedClient from '@/components/outils/OutilsUnifiedClient';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function OutilsPage() {
  return (
    <>
      <OutilsUnifiedClient />

      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        <h1 className="sr-only">Outils et calculateurs freelance 2026</h1>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Des calculateurs pour piloter votre activité
        </h2>
        <p className="mb-4">
          Cette page regroupe les outils essentiels pour un freelance ou créateur d&apos;entreprise : calcul des indemnités kilométriques (barème fiscal 2026), estimation de la CFE selon la taille de votre commune, simulation de l&apos;ACRE sur la première année, vérification des plafonds micro-entreprise et de la franchise en base de TVA, conversion TJM en revenu net annuel, calcul du taux effectif d&apos;IR et estimation des cotisations TNS.
        </p>
        <p className="mb-8">
          Chaque outil s&apos;appuie sur les barèmes officiels en vigueur. Les résultats sont indicatifs et ne constituent pas un conseil fiscal. Pour une analyse personnalisée, rapprochez-vous d&apos;un expert-comptable.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Questions fréquentes
        </h2>
        <dl className="space-y-5">
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Comment calculer mes indemnités kilométriques ?</dt>
            <dd className="mt-1">Renseignez votre kilométrage annuel professionnel et la puissance fiscale de votre véhicule. L&apos;outil applique le barème fiscal en vigueur pour estimer le montant déductible.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Qu&apos;est-ce que l&apos;ACRE ?</dt>
            <dd className="mt-1">L&apos;ACRE (aide aux créateurs et repreneurs d&apos;entreprise) réduit vos cotisations sociales la première année d&apos;activité. L&apos;outil estime l&apos;économie réalisée selon votre statut et votre chiffre d&apos;affaires.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900 dark:text-white">Comment convertir un TJM en revenu net annuel ?</dt>
            <dd className="mt-1">L&apos;outil multiplie votre TJM par le nombre de jours travaillés, puis déduit les cotisations et l&apos;impôt estimés pour chaque statut. Cela donne un ordre de grandeur du revenu net disponible.</dd>
          </div>
        </dl>

        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Pour une vue d&apos;ensemble, utilisez le{' '}
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur de statuts</Link>
          {' '}ou le{' '}
          <Link href="/simulateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur 5 ans</Link>.
        </p>
      </section>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </>
  );
}
