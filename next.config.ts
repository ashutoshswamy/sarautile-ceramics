import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB is too small for hero image uploads (up to 3 files/req).
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
