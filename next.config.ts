import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Old WordPress URLs (plan §10) → new routes, permanently.
const legacy: Array<[string, string]> = [
  ["/about", "/es/nosotros"],
  ["/aeronaves", "/es/flota"],
  ["/services", "/es/servicios"],
  ["/contact-us", "/es/contacto"],
  ["/welcome-to-helibol-s-r-l", "/es"],
  ["/404-2", "/es/servicios"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  experimental: { optimizePackageImports: ["lucide-react", "motion", "@react-three/drei"] },
  async redirects() {
    return legacy.flatMap(([source, destination]) => [
      { source, destination, statusCode: 301 },
      { source: `${source}/`, destination, statusCode: 301 },
    ]);
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
