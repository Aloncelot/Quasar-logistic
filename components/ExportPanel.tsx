"use client";

import { FileText, Presentation, Loader2, Download } from "lucide-react";
import { FormatoReporte } from "./api";
import { useT } from "./i18n";

const ICONOS = { pdf: FileText, pptx: Presentation } as const;

/** Descarga del reporte ejecutivo, generado en el servidor con texto real (no capturas de pantalla). */
export default function ExportPanel({
  exportando,
  onExportar,
}: {
  exportando: FormatoReporte | null;
  onExportar: (formato: FormatoReporte) => void;
}) {
  const t = useT();
  const opciones: { formato: FormatoReporte; titulo: string; detalle: string }[] = [
    { formato: "pdf", titulo: t.exportar.pdfTitulo, detalle: t.exportar.pdfDetalle },
    { formato: "pptx", titulo: t.exportar.pptxTitulo, detalle: t.exportar.pptxDetalle },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {opciones.map(({ formato, titulo, detalle }) => {
        const activo = exportando === formato;
        const Icono = ICONOS[formato];
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
              <span className="block font-display text-xl font-semibold text-tinta">{activo ? t.exportar.generando : titulo}</span>
              <span className="mt-1 block text-sm leading-relaxed text-niebla">{detalle}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-hielo">
                <Download size={15} /> {t.exportar.descargar(formato === "pdf" ? "PDF" : "PowerPoint")}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
