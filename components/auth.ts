// Autenticación de demostración: un usuario fijo o acceso como invitado.
// NO es seguridad real (todo vive en el navegador); se reemplazará por un proveedor de identidad.
import { useSyncExternalStore } from "react";

export interface Sesion {
  usuario: string;
  nombre: string;
  rol: "Administrador" | "Invitado";
}

export const CREDENCIALES_DEMO = { usuario: "demo", contrasena: "Quasar2026" };

const USUARIOS: Record<string, { contrasena: string; sesion: Sesion }> = {
  [CREDENCIALES_DEMO.usuario]: {
    contrasena: CREDENCIALES_DEMO.contrasena,
    sesion: { usuario: "demo", nombre: "Gerencia de Logística", rol: "Administrador" },
  },
};

const CLAVE = "quasar.sesion";
const PENDIENTE = "__pendiente__";
const oyentes = new Set<() => void>();

// Respaldo en memoria por si el navegador bloquea sessionStorage
let memoria = "";

function leer(): string {
  try {
    return window.sessionStorage.getItem(CLAVE) ?? "";
  } catch {
    return memoria;
  }
}

function escribir(valor: string) {
  memoria = valor;
  try {
    if (valor) window.sessionStorage.setItem(CLAVE, valor);
    else window.sessionStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: se usa la memoria */
  }
  oyentes.forEach((fn) => fn());
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/** Devuelve la sesión actual, `null` si no hay, o `undefined` mientras se hidrata. */
export function useSesion(): Sesion | null | undefined {
  const crudo = useSyncExternalStore(suscribir, leer, () => PENDIENTE);
  if (crudo === PENDIENTE) return undefined;
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as Sesion;
  } catch {
    return null;
  }
}

export function iniciarSesion(usuario: string, contrasena: string): boolean {
  const registro = USUARIOS[usuario.trim().toLowerCase()];
  if (!registro || registro.contrasena !== contrasena) return false;
  escribir(JSON.stringify(registro.sesion));
  return true;
}

export function entrarComoInvitado() {
  escribir(JSON.stringify({ usuario: "invitado", nombre: "Invitado", rol: "Invitado" } satisfies Sesion));
}

export function cerrarSesion() {
  escribir("");
}
