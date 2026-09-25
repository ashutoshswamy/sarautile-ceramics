import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Invoice PDFs (app/invoice/[id]/route.tsx) read these from disk at runtime.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/invoice/[id]": ["./lib/fonts/*.ttf", "./public/logo-nobg.png"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
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
