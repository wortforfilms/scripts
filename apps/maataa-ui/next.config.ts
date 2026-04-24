import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: "standalone",
  serverExternalPackages: ["@libsql/client", "libsql", "@libsql/client/node"],
  experimental: {
    externalDir: true
  }
};

export default nextConfig;
