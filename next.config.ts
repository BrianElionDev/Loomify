import type { NextConfig } from "next";

/**
 * Next.js configuration with TypeScript
 */
const nextConfig: NextConfig = {
  // Configure allowed image domains
  images: {
    // Legacy format for backwards compatibility
    domains: ["cdn.loom.com", "www.loom.com"],
    // Modern format with more security options
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.loom.com",
      },
      {
        protocol: "https",
        hostname: "www.loom.com",
      },
    ],
  },
  // TypeScript support
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Fix for TypeScript configuration
  transpilePackages: ["sonner", "framer-motion"],
};

export default nextConfig;
