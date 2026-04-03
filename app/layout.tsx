import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SimulationProvider } from '@/context/SimulationContext';
import AppShell from '@/components/AppShell';
import ChatBot from '@/components/ChatBot';
import {
  getFaqPageJsonLd,
  getOrganizationJsonLd,
  getWebApplicationJsonLd,
  SITE_URL,
} from '@/lib/seo/jsonLd';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  title: {
    default: 'Comparateur & simulateur sur mesure de revenus freelance 2026',
    template: '%s | Freelance Simulateur',
  },
  description:
    'Comparez votre revenu net selon le statut : Portage, Micro, EURL IR, EURL IS, SASU. Projections sur plusieurs années, simulations indicatives, barèmes 2026.',
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
    title: 'Comparateur & simulateur sur mesure de revenus freelance 2026',
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
        alt: 'Comparateur et simulateur sur mesure de revenus freelance — barèmes 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparateur & simulateur sur mesure de revenus freelance 2026',
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
            __html: JSON.stringify(getOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebApplicationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFaqPageJsonLd()),
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