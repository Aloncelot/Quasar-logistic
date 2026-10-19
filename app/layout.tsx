import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Barlow está inspirada en la señalización carretera: encaja con una torre de control logística.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Quasar Logistics · Torre de Control Logística",
  description:
    "Análisis de cumplimiento de entregas (OTIF) a partir de reportes de SAP: indicadores con metas, hallazgos, recomendaciones y reporte ejecutivo en PDF y PowerPoint.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-noche">{children}</body>
    </html>
  );
}
