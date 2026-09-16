import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://18.223.124.192/api/:path*' 
      }
    ]
  }
};

export default nextConfig;