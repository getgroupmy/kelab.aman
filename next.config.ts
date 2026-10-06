import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Two 2 MB uploads plus form fields and multipart overhead. Keep this
      // under Vercel's 4.5 MB request body limit.
      bodySizeLimit: "4.4mb",
    },
  },
};

export default nextConfig;
