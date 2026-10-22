"use client";

import { useEffect } from "react";
import { useIdioma, type Idioma } from "./preferencias";
import { DICCIONARIOS } from "./i18n";

function BanderaMexico() {
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 overflow-hidden rounded-[3px]" aria-hidden>
      <rect width="10" height="20" fill="#006847" />
      <rect x="10" width="10" height="20" fill="#ffffff" />
      <rect x="20" width="10" height="20" fill="#ce1126" />
      <circle cx="15" cy="10" r="2.6" fill="#8c6239" />
      <path d="M12.6 11.6 Q15 13.6 17.4 11.6" stroke="#006847" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

function BanderaEstadosUnidos() {
  const franjas = Array.from({ length: 13 }, (_, i) => i);
  const estrellas = Array.from({ length: 20 }, (_, i) => i);
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 overflow-hidden rounded-[3px]" aria-hidden>
      {franjas.map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13 + 0.05} fill={i % 2 === 0 ? "#b22234" : "#ffffff"} />
      ))}
      <rect width="12.5" height={(20 * 7) / 13} fill="#3c3b6e" />
      {estrellas.map((i) => (
        <circle key={i} cx={1.4 + (i % 5) * 2.4} cy={1.4 + Math.floor(i / 5) * 2.55} r="0.55" fill="#ffffff" />
      ))}
    </svg>
  );
}

const OPCIONES: { idioma: Idioma; bandera: () => React.ReactElement; codigo: string }[] = [
  { idioma: "es", bandera: BanderaMexico, codigo: "ES" },
  { idioma: "en", bandera: BanderaEstadosUnidos, codigo: "EN" },
];

/** Selector de idioma con banderas de México (español) y Estados Unidos (inglés). */
export default function LanguageSwitch({ className = "" }: { className?: string }) {
  const [idioma, cambiar] = useIdioma();
  const t = DICCIONARIOS[idioma];

  // Mantiene el atributo lang del documento alineado con el idioma elegido
  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  return (
    <div
      role="group"
      aria-label={t.idioma.etiqueta}
      className={`inline-flex items-center gap-1 rounded-lg border border-linea bg-panel/80 p-1 backdrop-blur ${className}`}
    >
      {OPCIONES.map(({ idioma: valor, bandera: Bandera, codigo }) => {
        const activo = valor === idioma;
        return (
          <button
            key={valor}
            type="button"
            onClick={() => cambiar(valor)}
            aria-pressed={activo}
            title={t.idioma[valor]}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-display text-sm font-semibold transition-colors ${
              activo ? "bg-hielo/15 text-hielo ring-1 ring-hielo/40" : "text-niebla hover:bg-panel-2 hover:text-tinta"
            }`}
          >
            <Bandera />
            {codigo}
          </button>
        );
      })}
    </div>
  );
}
