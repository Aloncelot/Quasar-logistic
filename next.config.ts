import type { NextConfig } from "next";

// URL del backend FastAPI. En local: http://127.0.0.1:8000 ; en producción, defínela en API_URL.
const API_URL = (process.env.API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Permite abrir el dev server desde la IP de la red local (ej. http://192.168.0.9:3000)
  allowedDevOrigins: ["192.168.0.9"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
