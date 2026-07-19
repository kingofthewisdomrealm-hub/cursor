import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGithubPages ? "/cursor" : "",
  assetPrefix: isGithubPages ? "/cursor/" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
