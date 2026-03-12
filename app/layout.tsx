import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SimulationProvider } from '@/context/SimulationContext';
import AppShell from '@/components/AppShell';
import ChatBot from '@/components/ChatBot';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const SITE_URL = 'https://freelance-simulateur.fr';

export const metadata: Metadata = {
  title: {
    default: 'Freelance Simulateur — Comparateur & simulateur de revenus freelance 2026',
    template: '%s | Freelance Simulateur',
  },
  description:
    'Comparez les 5 régimes fiscaux (Portage, Micro, EURL IR, EURL IS, SASU) et optimisez votre revenu net en tant que freelance. Données certifiées Loi de Finances 2026.',
  metadataBase: new URL(SITE_URL),
  keywords: [
    'simulateur freelance',
    'comparateur statut freelance',
    'portage salarial',
    'micro-entreprise',
    'EURL',
    'SASU',
    'revenu net freelance',
    'charges sociales freelance',
    'fiscalité freelance 2026',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Freelance Simulateur — Comparateur & simulateur de revenus 2026',
    description:
      'Simulez et comparez votre revenu net en portage salarial, micro-entreprise, EURL et SASU avec les barèmes 2026.',
    url: SITE_URL,
    siteName: 'Freelance Simulateur',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Freelance Simulateur — Comparateur & simulateur de revenus freelance 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelance Simulateur — Comparateur & simulateur de revenus 2026',
    description:
      'Simulez et comparez votre revenu net selon votre statut freelance avec les barèmes 2026.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={jakarta.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Freelance Simulateur',
              url: SITE_URL,
              applicationCategory: 'FinanceApplication',
              description:
                'Outil de simulation et comparateur de statuts freelances (portage, micro-entreprise, EURL, SASU) avec barèmes 2026.',
              inLanguage: 'fr-FR',
            }),
          }}
        />
        <SimulationProvider>
          <AppShell>{children}</AppShell>
          <ChatBot />
        </SimulationProvider>
        <Analytics />
      </body>
    </html>
  );
}