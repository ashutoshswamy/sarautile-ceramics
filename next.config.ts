import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Form allows up to 10 photos x 5MB = 50MB/request; default 1MB is way too small.
    serverActions: { bodySizeLimit: "55mb" },
  },
  images: {
    // Product/hero photos are uploaded to Supabase Storage and served from
    // its public bucket URL, not from /public.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
