import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals ?? []), { canvas: "commonjs canvas" }];
    return config;
  },
};
