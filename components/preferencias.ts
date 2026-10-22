// Preferencias del visitante: idioma y servidor de la API.
// Se guardan en localStorage (solo comodidad por navegador) y pueden venir en la URL:
//   ?idioma=en&servidor=aws  (así llega el enlace del correo de aprobación de la demo en AWS)
import { useSyncExternalStore } from "react";

export type Idioma = "es" | "en";
export type Servidor = "azure" | "aws";

const DEFINICION = {
  idioma: { clave: "quasar.idioma", valores: ["es", "en"], porDefecto: "es" },
  servidor: { clave: "quasar.servidor", valores: ["azure", "aws"], porDefecto: "azure" },
} as const;

type Nombre = keyof typeof DEFINICION;

const memoria: Partial<Record<Nombre, string>> = {};
const oyentes = new Set<() => void>();
let urlProcesada = false;

// La primera lectura en el navegador toma los valores de la URL y luego los quita de la barra de direcciones
function procesarUrl() {
  if (urlProcesada || typeof window === "undefined") return;
  urlProcesada = true;
  try {
    const url = new URL(window.location.href);
    let cambio = false;
    (Object.keys(DEFINICION) as Nombre[]).forEach((nombre) => {
      const valor = url.searchParams.get(nombre);
      if (valor && (DEFINICION[nombre].valores as readonly string[]).includes(valor)) {
        guardar(nombre, valor, false);
      }
      if (url.searchParams.has(nombre)) {
        url.searchParams.delete(nombre);
        cambio = true;
      }
    });
    if (cambio) window.history.replaceState(null, "", url.pathname + (url.search || "") + url.hash);
  } catch {
    /* URL no disponible: se ignoran los parámetros */
  }
}

function leer(nombre: Nombre): string {
  procesarUrl();
  const { clave, valores, porDefecto } = DEFINICION[nombre];
  let valor: string | null | undefined;
  try {
    valor = window.localStorage.getItem(clave);
  } catch {
    valor = memoria[nombre];
  }
  return valor && (valores as readonly string[]).includes(valor) ? valor : porDefecto;
}

function guardar(nombre: Nombre, valor: string, avisar = true) {
  memoria[nombre] = valor;
  try {
    window.localStorage.setItem(DEFINICION[nombre].clave, valor);
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  if (avisar) oyentes.forEach((fn) => fn());
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

export function useIdioma(): [Idioma, (nuevo: Idioma) => void] {
  const valor = useSyncExternalStore(suscribir, () => leer("idioma"), () => DEFINICION.idioma.porDefecto);
  return [valor as Idioma, (nuevo) => guardar("idioma", nuevo)];
}

export function useServidor(): [Servidor, (nuevo: Servidor) => void] {
  const valor = useSyncExternalStore(suscribir, () => leer("servidor"), () => DEFINICION.servidor.porDefecto);
  return [valor as Servidor, (nuevo) => guardar("servidor", nuevo)];
}
