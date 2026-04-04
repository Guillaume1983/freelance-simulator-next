import type { NextConfig } from "next";
import { OUTIL_IDS } from "./lib/outils/outilsConfig";

/** Anciennes URL /outils/{id} — la query d’origine est conservée par Next en plus de ?outil=. */
const outilLegacyRedirects = OUTIL_IDS.flatMap((id) => [
  { source: `/outils/${id}`, destination: `/outils?outil=${id}`, permanent: true },
  { source: `/outils/${id}/`, destination: `/outils?outil=${id}`, permanent: true },
]);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [...outilLegacyRedirects];
  },
};

export default nextConfig;
