import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/kpi/otif',
        destination: 'http://18.223.124.192/:path*'
      }
    ]
  }
};

export default nextConfig;