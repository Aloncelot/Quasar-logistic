import { KPIData } from "./types";
import type { Idioma, Servidor } from "./preferencias";

// Todas las llamadas usan rutas relativas que next.config.ts reenvía al backend correspondiente:
//   /api/azure/*   -> Azure Container Apps
//   /api/aws/*     -> AWS EC2 (Docker)
//   /api/control/* -> Lambda que enciende la demo de AWS bajo solicitud
export type FormatoReporte = "pdf" | "pptx";

export interface MensajesError {
  conexion: string;
  servidor: (estado: number) => string;
}

export class ErrorApi extends Error {}

async function solicitar(ruta: string, errores: MensajesError, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(ruta, init);
  } catch {
    throw new ErrorApi(errores.conexion);
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    const detalle = cuerpo?.detail;
    throw new ErrorApi(typeof detalle === "string" ? detalle : errores.servidor(res.status));
  }
  return res;
}

const formulario = (archivo: File) => {
  const datos = new FormData();
  datos.append("file", archivo);
  return datos;
};

/** Envía el CSV y devuelve todos los indicadores del tablero, en el idioma pedido. */
export async function analizarArchivo(
  archivo: File,
  servidor: Servidor,
  idioma: Idioma,
  errores: MensajesError
): Promise<{ datos: KPIData; ms: number }> {
  const inicio = performance.now();
  const res = await solicitar(`/api/${servidor}/analisis?idioma=${idioma}`, errores, {
    method: "POST",
    body: formulario(archivo),
  });
  const datos: KPIData = await res.json();
  return { datos, ms: Math.round(performance.now() - inicio) };
}

/** Descarga el CSV de ejemplo (datos simulados) como File, listo para analizarse. */
export async function obtenerEjemplo(servidor: Servidor, errores: MensajesError): Promise<File> {
  const res = await solicitar(`/api/${servidor}/ejemplo`, errores);
  const blob = await res.blob();
  return new File([blob], "reporte_sap_q3.csv", { type: "text/csv" });
}

/** Genera el reporte ejecutivo en el servidor y dispara la descarga en el navegador. */
export async function descargarReporte(
  archivo: File,
  formato: FormatoReporte,
  servidor: Servidor,
  idioma: Idioma,
  errores: MensajesError
): Promise<void> {
  const res = await solicitar(`/api/${servidor}/reporte/${formato}?idioma=${idioma}`, errores, {
    method: "POST",
    body: formulario(archivo),
  });
  const blob = await res.blob();
  const disposicion = res.headers.get("Content-Disposition") ?? "";
  const nombre = /filename="?([^"]+)"?/.exec(disposicion)?.[1] ?? `OTIF.${formato}`;

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------------------
// Control de la demo en AWS
// ---------------------------------------------------------------------------------------
export interface EstadoAws {
  estado: "pending" | "running" | "stopping" | "stopped" | string;
  lista: boolean;
  apagado_programado: string | null;
}

export async function consultarEstadoAws(): Promise<EstadoAws | null> {
  try {
    const res = await fetch("/api/control/estado", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as EstadoAws;
  } catch {
    return null;
  }
}

export interface SolicitudDemo {
  nombre: string;
  correo: string;
  empresa: string;
  mensaje: string;
  idioma: Idioma;
  sitio: string; // campo trampa para bots (debe ir vacío)
}

export async function solicitarDemoAws(datos: SolicitudDemo): Promise<boolean> {
  try {
    const res = await fetch("/api/control/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return res.ok;
  } catch {
    return false;
  }
}
