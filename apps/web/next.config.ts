import type { NextConfig } from "next";

const isElectronBuild = process.env.IS_ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isElectronBuild ? 'export' : 'standalone',
  basePath: process.env.NODE_ENV === 'production' && !isElectronBuild ? '/iter' : '',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared"],
};

export default nextConfig;