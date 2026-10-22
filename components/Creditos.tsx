"use client";

import { FaAws } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";
import { SiDocker, SiFastapi, SiNextdotjs, SiPython, SiReact, SiTypescript } from "react-icons/si";
import { useT } from "./i18n";

// Iconos de marca de react-icons (Simple Icons, Font Awesome y Codicons, con sus licencias abiertas)
const TECNOLOGIAS = [
  { nombre: "Next.js", Icono: SiNextdotjs },
  { nombre: "React", Icono: SiReact },
  { nombre: "TypeScript", Icono: SiTypescript },
  { nombre: "FastAPI", Icono: SiFastapi },
  { nombre: "Python", Icono: SiPython },
  { nombre: "Docker", Icono: SiDocker },
  { nombre: "AWS", Icono: FaAws },
  { nombre: "Azure", Icono: VscAzure },
];

/** Enlace de autoría con el brillo turquesa que se enciende y apaga al pasar el cursor. */
export function EnlaceQuasar({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <span className={`text-sm text-bruma ${className}`}>
      {t.creditos}{" "}
      <a
        href="https://quasar-devs.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="enlace-quasar font-display text-base font-semibold tracking-wide"
      >
        QUASAR DEVS
      </a>
    </span>
  );
}

/** Pie de página: nota de datos, tecnologías usadas y autoría. */
export default function Creditos({ nota }: { nota?: string }) {
  const t = useT();
  return (
    <footer className="mt-20 border-t border-linea pt-6">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-bruma">{t.footer.tecnologias}</span>
          <ul className="flex flex-wrap items-center gap-3">
            {TECNOLOGIAS.map(({ nombre, Icono }) => (
              <li key={nombre}>
                <span
                  title={nombre}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-linea bg-panel text-niebla transition-colors hover:border-hielo/40 hover:text-tinta"
                >
                  <Icono size={18} aria-hidden />
                  <span className="sr-only">{nombre}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <EnlaceQuasar />
      </div>
      {nota && <p className="mt-4 text-xs text-bruma">{nota}</p>}
    </footer>
  );
}
