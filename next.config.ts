import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/comparateur2", destination: "/comparateur", permanent: true },
      { source: "/comparateur2/:path*", destination: "/comparateur", permanent: true },
    ];
  },
};

export default nextConfig;
