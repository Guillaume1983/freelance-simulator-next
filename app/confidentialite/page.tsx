import Link from 'next/link';
import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <SitePageHeader
        title="Politique de confidentialité"
        description="Données personnelles, compte utilisateur et cookies — transparence sur les traitements."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          Ce simulateur est conçu pour fonctionner avec un minimum de données personnelles. Les simulations sont
          purement indicatives et ne constituent pas un conseil fiscal ou comptable. Pour toute décision importante,
          rapprochez-vous d&apos;un expert-comptable.
        </p>
        <p>
          Lorsque vous créez un compte, seule votre adresse email est demandée pour permettre la sauvegarde de vos
          paramètres et de vos simulations. Aucune donnée sensible (revenus bancaires, numéro de sécurité sociale,
          etc.) n&apos;est collectée.
        </p>
        <p>
          Les cookies et outils de mesure d&apos;audience éventuellement utilisés le sont uniquement pour améliorer
          l&apos;ergonomie et le fonctionnement du site.
        </p>
        <p>
          Pour toute question ou demande liée à vos données, vous pouvez nous contacter via la page{' '}
          <Link
            href="/contact"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            contact
          </Link>
          .
        </p>
      </div>

      <Footer />
    </main>
  );
}
