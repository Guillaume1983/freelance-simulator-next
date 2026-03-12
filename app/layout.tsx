import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SimulationProvider } from '@/context/SimulationContext';
import AppShell from '@/components/AppShell';
import ChatBot from '@/components/ChatBot';
import { WebsiteJsonLd, OrganizationJsonLd, SoftwareApplicationJsonLd, FAQJsonLd } from '@/components/JsonLd';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'Freelance Simulateur — Simulation fiscale 2026',
    template: '%s | Freelance Simulateur',
  },
  description: 'Comparez les 5 statuts freelance (Portage, Micro, EURL IR, EURL IS, SASU) et optimisez votre revenu net. Simulateur gratuit basé sur la Loi de Finances 2026.',
  metadataBase: new URL('https://freelance-simulateur.fr'),
  keywords: [
    'simulateur freelance',
    'comparateur statut freelance',
    'portage salarial',
    'micro-entreprise',
    'EURL',
    'SASU',
    'calcul revenu net freelance',
    'charges sociales freelance',
    'fiscalité freelance 2026',
  ],
  authors: [{ name: 'Freelance Simulateur' }],
  creator: 'Freelance Simulateur',
  publisher: 'Freelance Simulateur',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://freelance-simulateur.fr',
    siteName: 'Freelance Simulateur',
    title: 'Freelance Simulateur — Comparez les statuts et optimisez votre revenu',
    description: 'Simulateur gratuit pour comparer Portage, Micro, EURL et SASU. Calculez votre revenu net en fonction de vos paramètres.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Freelance Simulateur - Comparateur de statuts freelance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelance Simulateur — Simulation fiscale 2026',
    description: 'Comparez Portage, Micro, EURL et SASU. Calculez votre revenu net freelance gratuitement.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        <SoftwareApplicationJsonLd />
        <FAQJsonLd />
      </head>
      <body className={jakarta.className}>
        <SimulationProvider>
          <AppShell>{children}</AppShell>
          <ChatBot />
        </SimulationProvider>
        <Analytics />
      </body>
    </html>
  );
}
