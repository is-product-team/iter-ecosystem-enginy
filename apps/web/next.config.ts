import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: process.env.NODE_ENV === 'production' ? '/iter' : '',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared"],
};

export default nextConfig;