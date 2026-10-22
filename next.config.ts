import type { NextConfig } from "next";

// Backends (se definen en Vercel → Settings → Environment Variables; se leen al compilar):
//   AZURE_API_URL    https://quasar-api.<region>.azurecontainerapps.io   (versión gratuita, siempre disponible)
//   AWS_API_URL      http://<IP-elastica-EC2>                             (versión bajo solicitud)
//   AWS_CONTROL_URL  https://<id>.lambda-url.<region>.on.aws/             (Lambda que enciende la demo)
// API_URL se conserva como respaldo de AZURE_API_URL para despliegues anteriores.
const limpiar = (url?: string) => url?.replace(/\/$/, "");

const AZURE = limpiar(process.env.AZURE_API_URL ?? process.env.API_URL ?? "http://127.0.0.1:8000");
const AWS = limpiar(process.env.AWS_API_URL);
const CONTROL = limpiar(process.env.AWS_CONTROL_URL);

const nextConfig: NextConfig = {
  // Permite abrir el dev server desde la IP de la red local (ej. http://192.168.0.9:3000)
  allowedDevOrigins: ["192.168.0.9"],
  async rewrites() {
    return [
      { source: "/api/azure/:path*", destination: `${AZURE}/api/:path*` },
      ...(AWS ? [{ source: "/api/aws/:path*", destination: `${AWS}/api/:path*` }] : []),
      ...(CONTROL ? [{ source: "/api/control/:path*", destination: `${CONTROL}/:path*` }] : []),
    ];
  },
};

export default nextConfig;
