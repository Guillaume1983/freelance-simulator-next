import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <SitePageHeader
        title={"Conditions d'utilisation & avertissements"}
        description="Simulateurs et comparateurs freelances : informations importantes à lire avant utilisation."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Objet du service
          </h2>
          <p className="mt-2">
            Le site propose des outils de simulation et de comparaison des statuts freelances (portage salarial, micro-entreprise,
            EURL, SASU, etc.). Ces outils ont une vocation informative et pédagogique : ils aident l&apos;utilisateur à visualiser
            l&apos;ordre de grandeur de ses charges, impôts et revenus nets dans différents scénarios.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Absence de conseil personnalisé
          </h2>
          <p className="mt-2">
            Les résultats fournis par les simulateurs ne constituent ni un conseil juridique, ni un conseil fiscal, ni un conseil
            social ou comptable personnalisé. Ils ne tiennent pas compte de l&apos;ensemble des paramètres propres à la situation
            de chaque utilisateur (historique professionnel, autres revenus, régime matrimonial, options fiscales spécifiques,
            conventions collectives, etc.). Avant toute décision structurante (choix de statut, création de société, option fiscale,
            souscription à un contrat), l&apos;utilisateur s&apos;engage à consulter un professionnel compétent (expert-comptable,
            avocat, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Hypothèses de calcul et mises à jour
          </h2>
          <p className="mt-2">
            Les simulations sont basées sur des barèmes publics (URSSAF, Service-Public, textes officiels) et sur des hypothèses de
            calcul simplifiées, décrites dans la section &laquo; Hypothèses de calcul &raquo; de l&apos;interface. Les barèmes et la
            réglementation pouvant évoluer, les informations affichées peuvent présenter un décalage temporel avec la réglementation
            la plus récente. Le site met en œuvre des efforts raisonnables pour maintenir les données à jour, sans toutefois pouvoir
            garantir une exhaustivité ou une actualité permanente des informations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Limitation de responsabilité
          </h2>
          <p className="mt-2">
            L&apos;utilisation des simulateurs et des contenus du site se fait sous la seule responsabilité de l&apos;utilisateur.
            Le site ne pourra être tenu responsable d&apos;aucun dommage direct ou indirect résultant de l&apos;utilisation ou de
            l&apos;impossibilité d&apos;utiliser les simulateurs, de décisions prises ou non sur la base des résultats de simulation
            ou des contenus du site, ou encore d&apos;erreurs, d&apos;omissions ou d&apos;imprécisions éventuelles dans les données
            utilisées ou affichées. Dans tous les cas où une limitation de responsabilité est juridiquement possible, la
            responsabilité cumulée de l&apos;éditeur sera limitée au montant éventuellement payé par l&apos;utilisateur au titre du
            service au cours des douze (12) derniers mois.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Usage autorisé
          </h2>
          <p className="mt-2">
            Les simulateurs sont fournis pour un usage personnel et non exclusif de l&apos;utilisateur. Toute réutilisation
            systématique, intégration dans un autre service ou exploitation commerciale des résultats nécessite l&apos;accord
            préalable écrit de l&apos;éditeur du site.
          </p>
        </section>

        <section className="border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-400 dark:text-slate-500">
          <p>
            Ce texte est fourni à titre informatif et ne remplace pas un avis juridique. Pour une politique contractuelle adaptée à
            votre activité, rapprochez-vous d&apos;un professionnel du droit.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}

