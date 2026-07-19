import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/cursor",
  assetPrefix: "/cursor/",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
