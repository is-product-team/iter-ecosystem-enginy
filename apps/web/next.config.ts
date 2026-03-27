import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: process.env.NODE_ENV === 'production' ? '/iter' : '',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared"],
};

export default nextConfig;