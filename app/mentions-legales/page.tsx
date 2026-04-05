import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <SitePageHeader
        title="Mentions légales"
        description="Éditeur, hébergement et cadre juridique du site."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Éditeur du site
          </h2>
          <p className="mt-2">
            <span className="font-semibold">GILLE GUILLAUME CONSULTING</span>, EURL, siège&nbsp;: 9007 chemin de
            Fouillusant, 69140 Rillieux-la-Pape, SIREN&nbsp;920&nbsp;812&nbsp;476, RCS Lyon, capital social&nbsp;:
            1&nbsp;000&nbsp;€. Contact&nbsp;:{' '}
            <a
              href="mailto:contact@freelance-simulateur.fr"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              contact@freelance-simulateur.fr
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Hébergement
          </h2>
          <p className="mt-2">
            <span className="font-semibold">Vercel Inc.</span>, 650 7th Street, San Francisco, CA 94103, États-Unis :{' '}
            <a
              href="https://vercel.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Propriété intellectuelle
          </h2>
          <p className="mt-2">
            L&apos;ensemble des contenus présents sur ce site (textes, graphiques, logos, icônes, images, mises en page, etc.)
            est protégé par le droit de la propriété intellectuelle et reste, sauf mention contraire, la propriété exclusive de
            l&apos;éditeur ou de ses partenaires.
          </p>
          <p className="mt-2">
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel
            que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Données personnelles &amp; cookies
          </h2>
          <p className="mt-2">
            Le traitement des données personnelles et l&apos;utilisation de cookies ou traceurs sont décrits dans la politique de
            confidentialité / de protection des données du site, accessible depuis le pied de page.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Droit applicable
          </h2>
          <p className="mt-2">
            Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, et à défaut de résolution
            amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}

