import SimulateurStatutView from '@/components/simulateur/SimulateurStatutView';
import Footer from '@/components/Footer';
import Link from 'next/link';

const SEO_CONTENT: Record<string, { h1: string; intro: string; faq: { q: string; a: string }[] }> = {
  portage: {
    h1: 'Simulateur portage salarial — revenu net sur 5 ans',
    intro: 'Le portage salarial permet de facturer comme indépendant tout en conservant le statut de salarié : couverture sociale, assurance chômage (sous conditions) et bulletin de paie. En contrepartie, des frais de gestion (généralement 5 à 10 % du CA HT) et des cotisations salariales et patronales s\'appliquent. Ce simulateur projette votre revenu net après ces prélèvements sur 5 ans, en intégrant l\'ACRE et la croissance de votre chiffre d\'affaires.',
    faq: [
      { q: 'Quels frais sont prélevés en portage salarial ?', a: 'La société de portage prélève des frais de gestion (en général 5 à 10 % du CA HT), auxquels s\'ajoutent les cotisations salariales et patronales calculées sur votre salaire brut.' },
      { q: 'Le portage est-il intéressant à haut chiffre d\'affaires ?', a: 'Le portage reste pertinent pour sécuriser une activité ou tester un marché, mais à CA élevé, les cotisations et frais cumulés peuvent rendre une société (EURL, SASU) plus avantageuse en net.' },
    ],
  },
  micro: {
    h1: 'Simulateur micro-entreprise — net après cotisations et impôt',
    intro: 'La micro-entreprise (auto-entrepreneur) offre une gestion simplifiée avec des cotisations proportionnelles au chiffre d\'affaires encaissé. Ce régime est soumis à des plafonds de CA et ne permet pas de déduire les charges au réel. Le simulateur estime votre revenu net sur 5 ans en tenant compte du taux de cotisations, du versement libératoire ou de l\'IR classique, de l\'ACRE et de la CFE.',
    faq: [
      { q: 'Quels sont les plafonds de la micro-entreprise en 2026 ?', a: 'Pour les prestations de services (BIC/BNC), le plafond est de 83 600 € de CA annuel. Pour les activités commerciales (vente, hébergement), il est de 203 100 €. Au-delà de deux dépassements consécutifs, vous basculez vers un régime réel.' },
      { q: 'Qu\'est-ce que le versement libératoire ?', a: 'C\'est une option qui permet de payer l\'impôt sur le revenu en même temps que les cotisations, avec un taux fixe appliqué au CA (1 % à 2,2 % selon l\'activité), sous conditions de revenu fiscal de référence.' },
    ],
  },
  'eurl-ir': {
    h1: 'Simulateur EURL à l\'IR — gérant TNS, projection 5 ans',
    intro: 'L\'EURL soumise à l\'impôt sur le revenu permet de déduire les charges professionnelles au réel et de piloter sa rémunération en tant que gérant TNS. Le bénéfice est intégré au barème progressif de l\'IR du foyer. Ce simulateur projette votre revenu net sur 5 ans après cotisations TNS, IR et charges, avec ACRE et CFE.',
    faq: [
      { q: 'Quelle différence entre EURL IR et EURL IS ?', a: 'En EURL IR, le bénéfice est imposé directement au barème de l\'IR du foyer. En EURL IS, la société paie l\'impôt sur les sociétés et le dirigeant est imposé sur sa rémunération et ses dividendes.' },
      { q: 'Les cotisations TNS sont-elles plus basses qu\'en SASU ?', a: 'Globalement oui : les cotisations TNS représentent environ 45 % du revenu net, contre environ 65 à 80 % de charges patronales et salariales sur la rémunération en SASU (assimilé salarié).' },
    ],
  },
  'eurl-is': {
    h1: 'Simulateur EURL à l\'IS — IS, rémunération et résultat',
    intro: 'L\'EURL à l\'IS offre une fiscalité à deux niveaux : l\'impôt sur les sociétés sur le bénéfice, puis l\'imposition personnelle du gérant sur sa rémunération et ses éventuels dividendes. Ce simulateur projette le revenu net du dirigeant sur 5 ans en fonction du curseur rémunération / résultat, des cotisations TNS et de l\'IS.',
    faq: [
      { q: 'Puis-je moduler la répartition rémunération / bénéfice ?', a: 'Oui, le curseur dans les réglages permet d\'ajuster la part de rémunération versée par rapport au bénéfice laissé en société. Cela impacte directement l\'IS, les cotisations TNS et votre IR personnel.' },
      { q: 'Quand l\'IS est-il plus avantageux que l\'IR ?', a: 'L\'IS peut être plus avantageux lorsque votre tranche marginale d\'IR est élevée et que vous souhaitez capitaliser en société (réinvestir, amortir du matériel) plutôt que distribuer l\'intégralité du bénéfice.' },
    ],
  },
  sasu: {
    h1: 'Simulateur SASU — IS, salaire président et dividendes',
    intro: 'La SASU permet au président d\'être assimilé salarié (régime général) et de distribuer des dividendes soumis au PFU (30 %) ou au barème de l\'IR. L\'impôt sur les sociétés s\'applique au bénéfice après déduction de la rémunération et des charges. Ce simulateur projette votre revenu net sur 5 ans en combinant salaire, dividendes, IS, ACRE et CFE.',
    faq: [
      { q: 'Comment fonctionne la répartition salaire / dividendes ?', a: 'Le curseur dans les réglages ajuste la part de rémunération (soumise aux cotisations du régime général) et la part laissée en bénéfice pour distribution en dividendes (soumis au PFU de 30 % ou au barème IR).' },
      { q: 'Le président de SASU a-t-il droit au chômage ?', a: 'Le président assimilé salarié cotise au régime général mais n\'est pas éligible à l\'assurance chômage au titre de son mandat social (sauf cas particuliers avec un contrat de travail distinct).' },
    ],
  },
};

export default async function SimulateurStatutPage({
  params,
}: {
  params: Promise<{ statut: string }>;
}) {
  const { statut } = await params;
  const seo = SEO_CONTENT[statut];

  return (
    <SimulateurStatutView>
      {seo && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          <h1 className="sr-only">{seo.h1}</h1>

          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            À propos de cette simulation
          </h2>
          <p className="mb-6">{seo.intro}</p>

          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            Questions fréquentes
          </h2>
          <dl className="space-y-4 mb-6">
            {seo.faq.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-slate-600 dark:text-slate-300">{q}</dt>
                <dd className="mt-0.5">{a}</dd>
              </div>
            ))}
          </dl>

          <p className="text-[13px] text-slate-400 dark:text-slate-500">
            Comparez ce statut avec les autres via le{' '}
            <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur</Link>
            , ou consultez nos{' '}
            <Link href="/articles" className="text-indigo-600 dark:text-indigo-400 hover:underline">guides détaillés</Link>.
          </p>
        </section>
      )}

      <Footer />
    </SimulateurStatutView>
  );
}
