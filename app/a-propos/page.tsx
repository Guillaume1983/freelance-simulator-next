import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';
import { getAboutPageJsonLd, SITE_URL } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Mission de Freelance Simulateur, transparence sur les calculs (barèmes 2026, sources Urssaf et impots.gouv.fr) et limites des résultats. Thématique finance et indépendants.',
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    title: 'À propos | Freelance Simulateur',
    description:
      'Pourquoi cet outil existe, comment sont construits les calculs et pourquoi valider avec un expert-comptable.',
    url: `${SITE_URL}/a-propos`,
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function AProposPage() {
  const aboutLd = getAboutPageJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }}
      />
      <main className="min-h-screen bg-page-settings">
        <SitePageHeader
          title="À propos de Freelance Simulateur"
          description="Transparence sur les barèmes, sources officielles et limites des résultats : outil d'aide à la décision pour indépendants."
        />

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Freelance Simulateur est un outil d&apos;aide à la décision pour les travailleurs
            indépendants et les futurs freelances. Il permet de{' '}
            <strong className="text-slate-800 dark:text-slate-200">comparer des ordres de grandeur</strong>{' '}
            de revenu net entre plusieurs statuts (portage salarial, micro-entreprise, EURL, SASU)
            et de projeter une activité sur plusieurs années, à partir de barèmes publics et de
            règles fiscalisées simplifiées.
          </p>

          <section className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white mb-2 text-base">
                Pourquoi cet outil existe
              </h2>
              <p>
                Choisir ou comparer des statuts implique impôt sur le revenu ou sur les sociétés,
                cotisations sociales, charges et parfois TVA. Les interactions sont complexes : un
                même TJM ne produit pas le même net selon le régime. L&apos;objectif est de rendre
                ces écarts{' '}
                <strong className="text-slate-800 dark:text-slate-200">visibles et paramétrables</strong>,
                pour préparer un échange avec un professionnel plutôt que de se substituer à lui.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white mb-2 text-base">
                Sources et fiabilité (YMYL)
              </h2>
              <p className="mb-3">
                Les thématiques « argent et vie personnelle » (Your Money, Your Life) exigent de la
                clarté. Les calculs s&apos;inspirent des{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  barèmes et textes officiels
                </strong>{' '}
                tels que ceux publiés par l&apos;
                <a
                  href="https://www.urssaf.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Urssaf
                </a>{' '}
                et{' '}
                <a
                  href="https://www.impots.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  impots.gouv.fr
                </a>
                , ainsi que de la réglementation fiscale en vigueur (par ex. Loi de Finances pour
                l&apos;année modélisée sur le site). Des simplifications sont nécessaires pour tout
                simulateur en ligne : elles sont décrites dans la page{' '}
                <Link href="/hypotheses" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Méthodologie &amp; hypothèses
                </Link>
                .
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Important :</strong> les
                résultats affichés sont{' '}
                <strong>indicatifs</strong>. Ils ne tiennent pas compte de toutes les situations
                personnelles, des options fiscales, des régularisations ou des évolutions législatives
                après publication. Pour un montage, une optimisation ou une déclaration, un{' '}
                <strong>expert-comptable</strong> ou un conseil habilité reste indispensable.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white mb-2 text-base">
                Qui édite le site
              </h2>
              <p>
                Le projet est développé et maintenu dans une logique d&apos;outil utile et
                pédagogique pour les indépendants, avec une attention particulière à la performance
                (Next.js), à l&apos;accessibilité des parcours et à la clarté des écrans. Une partie
                de l&apos;équipe a une expérience directe du travail en freelance et de la vie
                d&apos;entreprise, ce qui nourrit les choix produit, sans remplacer une expertise
                comptable ou juridique.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white mb-2 text-base">
                Contact & évolutions
              </h2>
              <p>
                Les barèmes et règles sont mises à jour lors des changements législatifs majeurs
                pris en charge par l&apos;outil. Pour signaler une erreur, proposer une amélioration
                ou poser une question :{' '}
                <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  page Contact
                </Link>
                .
              </p>
            </div>
          </section>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
            <Link
              href="/hypotheses"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Méthodologie détaillée
            </Link>
            <Link href="/" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
