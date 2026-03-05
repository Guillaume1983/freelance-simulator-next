'use client';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useSimulation } from '@/hooks/useSimulation';
import { ARTICLES } from '@/lib/articles';
import Header from '@/components/Header';
import ResourcesPanel from '@/components/ResourcesPanel';
import TopCards from '@/components/TopCards';
import ExpandPanels from '@/components/ExpandPanels';
import ComparisonTable from '@/components/ComparisonTable';
import ProjectionSection from '@/components/ProjectionSection';
import Footer from '@/components/Footer';

export default function Home() {
  const sim = useSimulation();
  const [isDark, setIsDark]           = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [projectionRegime, setProjectionRegime] = useState('Portage');

  const togglePanel = (panelId: string) =>
    setActivePanel(activePanel === panelId ? null : panelId);

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* ── Fond vivant : blobs animés + grille ── */}
      <div className="page-blob-1" aria-hidden />
      <div className="page-blob-2" aria-hidden />
      <div className="page-blob-3" aria-hidden />
      <div className="bg-page-grid" aria-hidden />

      <main className="relative z-10 min-h-screen transition-colors duration-500">
        {/* Barre de couleur animée tout en haut */}
        <div className="top-accent-bar" aria-hidden />

        <Header isDark={isDark} setIsDark={setIsDark} saveStatus={sim.saveStatus} />
        <ResourcesPanel />

        {/* ── Hero : image + intro + TopCards + Comparatif stratégique ── */}
        <section
          className="section-hero section-comparatif-hero w-full pt-8 pb-10 md:pt-10 md:pb-10 animate-fade-up"
          aria-label="Simulateur et comparatif des statuts freelance"
        >
          {/* Image de fond */}
          <div
            className="section-hero-bg"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600')" }}
            aria-hidden
          />
          {/* Overlay dégradé indigo */}
          <div className="section-hero-overlay" aria-hidden />

          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
            <p className="text-sm md:text-base text-white/90 font-medium leading-snug mb-6">
              Renseignez votre activité, vos dépenses, vos optimisations et votre situation fiscale — les résultats se recalculent en temps réel.
            </p>

            <TopCards sim={sim} activePanel={activePanel} togglePanel={togglePanel} />

            {/* Panneaux détaillés juste sous les cartes, dans le même bloc visuel */}
            <ExpandPanels activePanel={activePanel} sim={sim} />

            {/* Intro comparatif collée aux panneaux */}
            <div className="mt-10 md:mt-12">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-xl leading-tight">
                Comparatif stratégique
              </h2>
              <p className="text-base md:text-lg text-white/90 font-medium mt-2 leading-snug drop-shadow-md">
                Comparez les 5 statuts freelance sur l&apos;ensemble des indicateurs clés — la colonne 🏆 correspond au plus avantageux pour votre profil.
              </p>
            </div>
          </div>
        </section>

        {/* ── Tableau comparatif ── */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
          <ComparisonTable sim={sim} />
        </div>

        {/* ── Séparateur visuel ── */}
        <div className="section-divider max-w-[1600px] mx-auto px-4 md:px-6" aria-hidden />

        {/* ── Bandeau Projection sur 5 ans ── */}
        <section className="section-projection-hero w-full animate-fade-up animate-fade-up-2" aria-label="Projection sur 5 ans">
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-indigo-200 shadow-lg border border-white/10">
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Projection sur 5 ans</h2>
                <p className="text-[10px] text-indigo-200 font-bold mt-0.5">
                  ACRE an 1{sim.state.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
                </p>
              </div>
            </div>
            <p className="text-sm md:text-base text-white/85 font-medium leading-snug">
              Visualisez votre business plan sur 5 ans — sélectionnez un statut et ajustez le taux de croissance annuel du CA.
            </p>
          </div>
        </section>

        {/* ── Tableau de projection ── */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-8">
          <ProjectionSection
            sim={sim}
            activeRegime={projectionRegime}
            setActiveRegime={setProjectionRegime}
          />
        </div>

        {/* ── À propos de nous (mobile / tablette) ── */}
        <section
          id="about-us"
          className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-6 md:pb-8 md:hidden"
        >
          <div className="card-pro bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 py-5 md:py-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
            <div className="flex-1">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                À propos de nous
              </p>
              <h2 className="mt-2 text-lg md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Un simulateur construit avec des experts-comptables
              </h2>
              <p className="mt-2 text-[13px] md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Freelance-simulateur.fr est né d’échanges répétés entre freelances, développeurs et experts-comptables
                spécialisés dans les indépendants. L’objectif&nbsp;: rendre lisibles, en quelques secondes, des écarts de
                rémunération qui sont souvent noyés dans des tableaux Excel illisibles.
              </p>
              <p className="mt-1.5 text-[13px] md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Le moteur financier est mis à jour chaque année avec les nouveaux barèmes (URSSAF, impôt sur le revenu,
                plafonds micro, IS…) pour vous aider à prendre des décisions éclairées, sans remplacer le conseil
                personnalisé de votre expert-comptable.
              </p>
            </div>
            <div className="w-full md:w-72">
              <div className="rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60">
                <img
                  src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format&fit=crop&q=80"
                  alt="Équipe travaillant sur un tableau blanc"
                  className="w-full h-32 md:h-40 object-cover"
                />
                <div className="px-3 py-2.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Transparence & pédagogie
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Nous construisons ce simulateur comme un outil d’aide à la décision, pas comme une boîte noire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Articles & ressources (mobile / tablette) ── */}
        <section
          id="articles-home"
          className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-10 md:pb-14 md:hidden"
        >
          <div className="card-pro bg-white/90 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800/80 px-4 md:px-6 py-5 md:py-6">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 md:gap-4 mb-4">
              <div>
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Articles & ressources
                </p>
                <h2 className="mt-1 text-lg md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                  Aller plus loin sur le choix de statut
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {ARTICLES.slice(0, 3).map((article) => (
                <article
                  key={article.slug}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-28 md:h-32 w-full overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                      <span>{article.category}</span>
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(article.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        · {article.readingTime}
                      </span>
                    </div>
                    <h3 className="text-[13px] md:text-sm font-900 tracking-tight text-slate-900 dark:text-slate-50">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-1 px-4 pb-3 flex items-center justify-between">
                    <a
                      href="/articles"
                      className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200"
                    >
                      Lire les articles
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
