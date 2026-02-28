import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'Freelance Simulateur — Simulation fiscale 2026',
  description: 'Comparez les 5 régimes fiscaux (Portage, Micro, EURL IR, EURL IS, SASU) et optimisez votre revenu net en tant que freelance. Données certifiées Loi de Finances 2026.',
  metadataBase: new URL('https://freelance-simulateur.fr'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${jakarta.className} bg-[#f8fafc] text-[#1e293b] antialiased`}>
        {children}
      </body>
    </html>
  );
}