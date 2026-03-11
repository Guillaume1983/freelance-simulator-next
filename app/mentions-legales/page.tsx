import Link from 'next/link';
import Footer from '@/components/Footer';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <span>←</span>
            <span>Retour à l&apos;accueil</span>
          </Link>
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Mentions légales
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Informations sur l&apos;éditeur du site, l&apos;hébergeur et les droits applicables.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Éditeur du site
          </h2>
          <p className="mt-2">
            Ce site est édité par&nbsp;:
          </p>
          <p className="mt-1">
            <span className="font-semibold">[Raison sociale / Nom Prénom]</span>
            <br />
            [Forme juridique le cas échéant]
            <br />
            [Adresse postale]
            <br />
            [Numéro SIREN / SIRET]
            <br />
            [Adresse e-mail de contact]
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Remplacez ces crochets par vos informations légales exactes (ou celles de votre entreprise).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Hébergement
          </h2>
          <p className="mt-2">
            Le site est hébergé par&nbsp;:
          </p>
          <p className="mt-1">
            <span className="font-semibold">[Nom de l&apos;hébergeur]</span>
            <br />
            [Adresse de l&apos;hébergeur]
            <br />
            [Site web de l&apos;hébergeur]
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

