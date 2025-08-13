import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-patterns-docs"],
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Auto-discover and watch all files in the packages directory
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules\/(?!react-patterns-docs)/,
      };
    }
    return config;
  },
};

export default nextConfig;
