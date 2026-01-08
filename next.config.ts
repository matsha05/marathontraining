import type { NextConfig } from "next";

const ensureScheme = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) return `http://${url}`;
  return `https://${url}`;
};

const normalizeSiteUrl = (url: string) => {
  const withScheme = ensureScheme(url.trim());
  return withScheme.endsWith('/') ? withScheme.slice(0, -1) : withScheme;
};

const canonicalSiteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thelonggame.win'
);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'thelonggame-black.vercel.app',
          },
        ],
        destination: `${canonicalSiteUrl}/:path*`,
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'thelonggame.win',
          },
        ],
        destination: `${canonicalSiteUrl}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
