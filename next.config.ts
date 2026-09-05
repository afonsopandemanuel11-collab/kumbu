import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type-checking is enforced via `tsc --noEmit` to prevent Turbopack sub-worker memory exhaustion
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
