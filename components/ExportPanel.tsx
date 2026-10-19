"use client";

import { FileText, Presentation, Loader2, Download } from "lucide-react";
import { FormatoReporte } from "./api";

const OPCIONES: { formato: FormatoReporte; titulo: string; detalle: string; icono: typeof FileText }[] = [
  {
    formato: "pdf",
    titulo: "Documento ejecutivo",
    detalle: "PDF tamaño A4 con resumen, hallazgos, gráficas, conclusiones, recomendaciones y definiciones.",
    icono: FileText,
  },
  {
    formato: "pptx",
    titulo: "Presentación para la junta",
    detalle: "PowerPoint de 11 diapositivas con gráficas y tablas editables.",
    icono: Presentation,
  },
];

/** Descarga del reporte ejecutivo, generado en el servidor con texto real (no capturas de pantalla). */
export default function ExportPanel({
  exportando,
  onExportar,
}: {
  exportando: FormatoReporte | null;
  onExportar: (formato: FormatoReporte) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {OPCIONES.map(({ formato, titulo, detalle, icono: Icono }) => {
        const activo = exportando === formato;
        return (
          <button
            key={formato}
            onClick={() => onExportar(formato)}
            disabled={exportando !== null}
            className="group flex items-start gap-4 rounded-xl border border-linea bg-panel p-6 text-left transition-colors hover:border-hielo/50 hover:bg-panel-2 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-hielo/10 text-hielo">
              {activo ? <Loader2 size={22} className="animate-spin" /> : <Icono size={22} />}
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl font-semibold text-tinta">{activo ? "Generando archivo..." : titulo}</span>
              <span className="mt-1 block text-sm leading-relaxed text-niebla">{detalle}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-hielo">
                <Download size={15} /> Descargar {formato === "pdf" ? "PDF" : "PowerPoint"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
