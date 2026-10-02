import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  frame-src 'self' https://challenges.cloudflare.com;
  connect-src 'self' https://challenges.cloudflare.com https://api.iconify.design;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['motion', 'animejs', 'next-intl'],
  },
  async redirects() {
    return [
      {
        source: '/es',
        destination: '/',
        permanent: true,
      },
      {
        source: '/es/:path*',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/store/game/GTA%20V',
        destination: '/store/game/gta-5',
        permanent: true,
      },
      {
        source: '/store/game/gta-v',
        destination: '/store/game/gta-5',
        permanent: true,
      },
      {
        source: '/store/game/cs-2',
        destination: '/store/game/cs2',
        permanent: true,
      },
      {
        source: '/store/game/rdr-2',
        destination: '/store/game/rdr2',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*\\.(?:ico|png|svg|jpg|jpeg|webp|avif|woff2))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);