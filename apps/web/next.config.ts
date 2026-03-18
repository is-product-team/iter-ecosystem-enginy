import type { NextConfig } from "next";

const isElectronBuild = process.env.IS_ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isElectronBuild ? 'export' : 'standalone',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared", "@iter/ui"],
};

export default nextConfig;