import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Allow video uploads up to 500MB
    },
    // Also increase proxy/middleware body size limit for large uploads
    proxyClientMaxBodySize: '500mb',
  },
};

export default nextConfig;
