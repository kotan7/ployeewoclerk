import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: false,
  },
  // Ensure proper SEO handling
  trailingSlash: false,
};

export default nextConfig;
