'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Star, Building2, Calculator, Banknote, Shield, Rocket } from 'lucide-react';

interface Partner {
  name: string;
  description: string;
  url: string;
  badge?: string;
  regimes?: string[];
  highlight?: boolean;
}

const CATEGORIES: {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  regimes: string[];
  partners: Partner[];
}[] = [
  {
    id: 'portage',
    label: 'Portage Salarial',
    icon: <Building2 size={18} />,
    color: 'indigo',
    regimes: ['Portage'],
    partners: [
      {
        name: 'Freelance.com',
        description: 'Leader français du portage salarial. Plateforme complète avec gestion administrative incluse.',
        url: 'https://www.freelance.com',
        badge: '1er réseau',
        highlight: true,
      },
      {
        name: 'ITG',
        description: 'Spécialiste du portage salarial IT & consulting, accompagnement personnalisé.',
        url: 'https://www.itg.fr',
        badge: 'IT & Conseil',
      },
      {
        name: 'Portageo',
        description: 'Portage salarial simple et digital, avec tableau de bord en ligne.',
        url: 'https://www.portageo.fr',
      },
      {
        name: 'Cadre en Mission',
        description: 'Portage salarial pour cadres et consultants expérimentés.',
        url: 'https://www.cadreenmission.com',
      },
    ],
  },
  {
    id: 'compta',
    label: 'Expert-Comptable Digital',
    icon: <Calculator size={18} />,
    color: 'emerald',
    regimes: ['EURL IR', 'EURL IS', 'SASU'],
    partners: [
      {
        name: 'Dougs',
        description: 'Comptabilité en ligne pour indépendants et sociétés. Interface intuitive, tarif fixe.',
        url: 'https://www.dougs.fr',
        badge: 'Recommandé',
        highlight: true,
        regimes: ['EURL IR', 'EURL IS', 'SASU'],
      },
      {
        name: 'Indy',
        description: 'Logiciel comptable automatisé pour micro-entrepreneurs et EI. Gratuit au démarrage.',
        url: 'https://www.indy.fr',
        badge: 'Micro-BNC',
        regimes: ['Micro'],
      },
      {
        name: 'Numbr',
        description: 'Cabinet comptable digital spécialisé freelances tech et consultants.',
        url: 'https://www.numbr.fr',
        regimes: ['EURL IR', 'EURL IS', 'SASU'],
      },
      {
        name: 'Comptabox',
        description: 'Expert-comptable en ligne accessible, pour TPE et indépendants.',
        url: 'https://www.comptabox.fr',
      },
    ],
  },
  {
    id: 'banque',
    label: 'Banque Professionnelle',
    icon: <Banknote size={18} />,
    color: 'blue',
    regimes: ['Micro', 'EURL IR', 'EURL IS', 'SASU'],
    partners: [
      {
        name: 'Shine',
        description: 'Compte pro tout-en-un pour freelances : facturation, TVA, comptabilité intégrée.',
        url: 'https://www.shine.fr',
        badge: 'Freelances',
        highlight: true,
      },
      {
        name: 'Qonto',
        description: 'La néobanque business leader en Europe pour TPE et indépendants.',
        url: 'https://www.qonto.com',
        badge: 'N°1 Europe',
        highlight: true,
      },
      {
        name: 'Blank',
        description: 'Compte pro simple et rapide à ouvrir, avec outils de gestion intégrés.',
        url: 'https://www.blank.app',
      },
      {
        name: 'Propulse by CA',
        description: 'Le compte pro du Crédit Agricole, sans frais cachés pour les indépendants.',
        url: 'https://www.propulse.fr',
      },
    ],
  },
  {
    id: 'assurance',
    label: 'Assurance RC Pro',
    icon: <Shield size={18} />,
    color: 'rose',
    regimes: ['Micro', 'EURL IR', 'EURL IS', 'SASU', 'Portage'],
    partners: [
      {
        name: 'Hiscox',
        description: 'Assureur spécialisé professions libérales et freelances. Devis en 5 minutes.',
        url: 'https://www.hiscox.fr',
        badge: 'Spécialiste',
        highlight: true,
      },
      {
        name: 'April',
        description: 'RC Pro et protection juridique adaptées aux indépendants, compétitives.',
        url: 'https://www.april.fr',
      },
      {
        name: 'Wakam (via Luko)',
        description: 'Assurance pro modulable, souscription 100% digitale.',
        url: 'https://www.luko.eu',
      },
    ],
  },
  {
    id: 'creation',
    label: 'Création & Juridique',
    icon: <Rocket size={18} />,
    color: 'violet',
    regimes: ['EURL IR', 'EURL IS', 'SASU'],
    partners: [
      {
        name: 'Legalstart',
        description: 'Création de société en ligne (EURL, SASU) rapide et accompagnée. Dès 49€.',
        url: 'https://www.legalstart.fr',
        badge: 'EURL / SASU',
        highlight: true,
      },
      {
        name: 'Captain Contrat',
        description: 'Avocats en ligne et création d\'entreprise, pour sécuriser votre lancement.',
        url: 'https://www.captaincontrat.com',
      },
      {
        name: 'Infogreffe',
        description: 'Immatriculation officielle au RCS, accès aux formalités légales.',
        url: 'https://www.infogreffe.fr',
      },
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  indigo: 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
  emerald: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
  blue: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  rose: 'border-l-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600',
  violet: 'border-l-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600',
};

function PartenairesContent() {
  const searchParams = useSearchParams();
  const regime = searchParams.get('regime') ?? '';

  const highlight = (cat: typeof CATEGORIES[0]) =>
    regime && cat.regimes.includes(regime);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour au simulateur
        </Link>

        {/* En-tête */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Rocket size={12} /> Partenaires sélectionnés
          </div>
          <h1 className="text-3xl font-900 text-slate-900 dark:text-white tracking-tight mb-2">
            Je me lance — par où commencer ?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
            Une sélection d&apos;outils et de services pour démarrer sereinement votre activité freelance.
            {regime && (
              <span className="ml-1 text-indigo-600 font-black">
                Les recommandations sont filtrées pour votre régime : {regime}.
              </span>
            )}
          </p>
        </div>

        {/* Catégories */}
        <div className="space-y-10">
          {CATEGORIES
            .sort((a, b) => {
              if (!regime) return 0;
              return (highlight(b) ? 1 : 0) - (highlight(a) ? 1 : 0);
            })
            .map(cat => {
              const isHighlighted = highlight(cat);
              const colorClasses = COLOR_MAP[cat.color] ?? COLOR_MAP.indigo;

              return (
                <section key={cat.id}>
                  <div className={`flex items-center gap-3 mb-4 ${isHighlighted ? 'opacity-100' : 'opacity-70'}`}>
                    <div className={`p-2 rounded-xl border-l-4 ${colorClasses}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className="text-sm font-900 uppercase tracking-widest text-slate-700 dark:text-slate-200">
                        {cat.label}
                      </h2>
                      {isHighlighted && (
                        <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                          <Star size={9} fill="currentColor" /> Recommandé pour {regime}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.partners.map(partner => (
                      <a
                        key={partner.name}
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative rounded-2xl bg-white dark:bg-slate-900/60 border transition-all duration-200 p-4 hover:shadow-md hover:-translate-y-0.5 ${
                          partner.highlight && isHighlighted
                            ? 'border-indigo-200 dark:border-indigo-700 ring-1 ring-indigo-100 dark:ring-indigo-900'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-900 text-slate-800 dark:text-white text-sm">
                                {partner.name}
                              </span>
                              {partner.badge && (
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${colorClasses.split(' ').slice(1).join(' ')}`}>
                                  {partner.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {partner.description}
                            </p>
                          </div>
                          <ExternalLink
                            size={14}
                            className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5"
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-5 py-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
            freelance-simulateur.fr ne perçoit aucune commission de ces partenaires.
            Ces recommandations sont basées sur leur pertinence pour les freelances français.
            <br />Consultez un expert-comptable pour adapter ces choix à votre situation personnelle.
          </p>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wide transition-colors"
          >
            <ArrowLeft size={14} /> Retour au simulateur
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PartenairesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]" />}>
      <PartenairesContent />
    </Suspense>
  );
}
