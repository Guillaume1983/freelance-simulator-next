'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Check, Zap, Shield, Crown, ArrowRight, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const plans = [
  {
    id: 'decouverte',
    name: 'Découverte',
    price: 0,
    period: 'Gratuit',
    description: 'Pour tester la simulation et découvrir votre potentiel freelance.',
    icon: Zap,
    color: 'text-slate-500',
    band: 'bg-slate-400',
    features: [
      '1 simulation par jour',
      'Comparatif des 5 régimes',
      'Calcul IR/IS 2026',
      'Interface mobile incluse',
    ],
    notIncluded: [
      'Export PDF',
      'Historique illimité',
      'Conseil personnalisé',
      'API Access',
    ],
    cta: 'Commencer gratuitement',
    ctaHref: '/inscription',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: '/ mois',
    description: 'Pour les freelances qui optimisent sérieusement leur stratégie fiscale.',
    icon: Shield,
    color: 'text-indigo-600',
    band: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    features: [
      'Simulations illimitées',
      'Comparatif des 5 régimes',
      'Calcul IR/IS 2026',
      'Interface mobile incluse',
      'Export PDF complet',
      'Historique & comparaisons',
      'Réglages avancés par régime',
    ],
    notIncluded: [
      'Conseil personnalisé',
      'API Access',
    ],
    cta: 'Essayer 14 jours gratuits',
    ctaHref: '/inscription',
    highlight: true,
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 49,
    period: '/ mois',
    description: 'Pour les consultants premium qui veulent une stratégie sur mesure.',
    icon: Crown,
    color: 'text-amber-500',
    band: 'bg-gradient-to-r from-amber-400 to-orange-400',
    features: [
      'Tout le plan Pro',
      'Conseil personnalisé mensuel',
      'Accès API REST',
      'Exports multi-formats',
      'Alertes réglementaires',
      'Accompagnement dédié',
    ],
    notIncluded: [],
    cta: 'Contacter un expert',
    ctaHref: '/inscription',
    highlight: false,
  },
];

const faq = [
  {
    q: 'Les calculs sont-ils certifiés pour 2026 ?',
    a: 'Oui, notre moteur de calcul est mis à jour en temps réel selon la Loi de Finances 2026, incluant les derniers barèmes IR, cotisations sociales et plafonds micro-entrepreneur.',
  },
  {
    q: 'Puis-je changer de plan à tout moment ?',
    a: 'Absolument. Vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre espace compte. Les changements prennent effet immédiatement.',
  },
  {
    q: 'Y a-t-il une période d\'engagement ?',
    a: 'Aucun engagement. Les plans mensuels sont résiliables à tout moment. Nous proposons également des plans annuels avec 2 mois offerts.',
  },
  {
    q: 'Le plan Découverte est-il vraiment gratuit ?',
    a: 'Oui, totalement gratuit et sans carte bancaire requise. Vous avez accès à 1 simulation complète par jour, pour toujours.',
  },
];

export default function TarifsPage() {
  const [isDark, setIsDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <Header isDark={isDark} setIsDark={setIsDark} />

        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tarifs 2026</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
            Investissez dans votre<br />
            <span className="text-indigo-600">stratégie fiscale</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Des formules pensées pour chaque étape de votre parcours freelance.
            Commencez gratuitement, évoluez à votre rythme.
          </p>
        </section>

        {/* Plans */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(plan => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`card-pro relative overflow-hidden flex flex-col ${plan.highlight ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/20' : ''}`}
                >
                  {/* Band couleur */}
                  <div className={`h-1.5 w-full absolute top-0 left-0 ${plan.band}`} />

                  {plan.highlight && (
                    <div className="absolute top-3 right-4 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg">
                      ★ POPULAIRE
                    </div>
                  )}

                  <div className="p-6 md:p-8 pt-8 flex flex-col flex-1">
                    {/* Header plan */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${plan.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.name}</div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-xs text-slate-400 font-bold">{plan.period}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                      {plan.description}
                    </p>

                    {/* Features incluses */}
                    <ul className="space-y-2.5 mb-4 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-indigo-600" />
                          </div>
                          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{f}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map(f => (
                        <li key={f} className="flex items-center gap-2.5 opacity-40">
                          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <X size={10} className="text-slate-400" />
                          </div>
                          <span className="text-[12px] font-bold text-slate-500 line-through">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.ctaHref}
                      className={`mt-6 w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        plan.highlight
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700'
                          : 'border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[11px] text-slate-400 font-bold mt-6">
            Sans engagement · Résiliable à tout moment · Paiement sécurisé
          </p>
        </section>

        {/* FAQ */}
        <section className="max-w-[800px] mx-auto px-4 md:px-6 pb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center mb-2">FAQ</h2>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-center mb-8">
            Questions fréquentes
          </h3>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div
                key={i}
                className="card-pro overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-[13px] font-black text-slate-800 dark:text-white">{item.q}</span>
                  <span className={`shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <span className="text-indigo-500 font-black text-lg leading-none">+</span>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-[12px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
