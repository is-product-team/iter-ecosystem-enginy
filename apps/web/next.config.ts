import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: process.env.NODE_ENV === 'production' ? '/iter' : '',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared"],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8000', '127.0.0.1:8000', 'http://localhost:8000'],
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);