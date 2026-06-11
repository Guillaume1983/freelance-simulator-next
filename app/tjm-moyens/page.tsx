import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/jsonLd";
import { BarometreTjmView } from "@/components/barometre-tjm/BarometreTjmView";

const canonicalUrl = `${SITE_URL}/tjm-moyens`;

export const metadata: Metadata = {
  title: "Baromètre TJM Freelance 2025 — Tarifs par métier, expérience et région | Freelance Simulateur",
  description:
    "Fourchettes indicatives de TJM freelance par métier (dev, design, conseil, marketing…), niveau d'expérience (junior, confirmé, senior) et région. Données issues des baromètres freelance 2024-2025.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Baromètre TJM Freelance 2025 — Tarifs par métier et expérience",
    description:
      "TJM médian et fourchettes par métier, expérience et région pour les freelances en France.",
    url: canonicalUrl,
    type: "website",
  },
};

export default function TjmMoyensPage() {
  return <BarometreTjmView />;
}
