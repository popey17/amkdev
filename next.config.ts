import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: deployed as static assets on Cloudflare Workers.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
