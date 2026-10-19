import { KPIData } from "./types";

// Por defecto se usan rutas relativas (/api/...) que next.config.ts reenvía al backend.
// Para llamar al backend directo, define NEXT_PUBLIC_API_URL (p. ej. https://api.midominio.com).
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type FormatoReporte = "pdf" | "pptx";

async function leerError(res: Response): Promise<string> {
  const cuerpo = await res.json().catch(() => null);
  const detalle = cuerpo?.detail;
  if (typeof detalle === "string") return detalle;
  return `Error del servidor (${res.status})`;
}

async function solicitar(ruta: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${ruta}`, init);
  } catch {
    throw new Error("No se pudo conectar con el servidor de análisis. Verifica que la API esté en ejecución.");
  }
  if (!res.ok) throw new Error(await leerError(res));
  return res;
}

const formulario = (archivo: File) => {
  const datos = new FormData();
  datos.append("file", archivo);
  return datos;
};

/** Envía el CSV y devuelve todos los indicadores del tablero. */
export async function analizarArchivo(archivo: File): Promise<KPIData> {
  const res = await solicitar("/api/analisis", { method: "POST", body: formulario(archivo) });
  return res.json();
}

/** Descarga el CSV de ejemplo (datos simulados) como File, listo para analizarse. */
export async function obtenerEjemplo(): Promise<File> {
  const res = await solicitar("/api/ejemplo");
  const blob = await res.blob();
  return new File([blob], "reporte_sap_q3.csv", { type: "text/csv" });
}

/** Genera el reporte ejecutivo en el servidor y dispara la descarga en el navegador. */
export async function descargarReporte(archivo: File, formato: FormatoReporte): Promise<void> {
  const res = await solicitar(`/api/reporte/${formato}`, { method: "POST", body: formulario(archivo) });
  const blob = await res.blob();
  const disposicion = res.headers.get("Content-Disposition") ?? "";
  const nombre = /filename="?([^"]+)"?/.exec(disposicion)?.[1] ?? `Reporte_Ejecutivo_OTIF.${formato}`;

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
