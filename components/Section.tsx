"use client";

import React from "react";
import { Flag } from "lucide-react";

/**
 * Señal de ruta: escudo carretero con el número de parada.
 * El tablero se lee como un recorrido: cada sección es una parada sobre la línea de ruta.
 */
export function Escudo({ numero, destino = false }: { numero?: number; destino?: boolean }) {
  return (
    <span className="relative inline-flex h-14 w-12 shrink-0 items-center justify-center">
      <svg viewBox="0 0 48 56" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d="M4 6 Q24 0 44 6 L44 30 Q44 46 24 54 Q4 46 4 30 Z"
          className={destino ? "fill-hielo" : "fill-panel-2"}
          stroke={destino ? "none" : "currentColor"}
          strokeWidth={1.5}
        />
        <path d="M4 14 L44 14" className={destino ? "stroke-noche/30" : "stroke-linea"} strokeWidth={1} />
      </svg>
      <span
        className={`relative mt-3 font-display text-xl font-bold leading-none ${destino ? "text-noche" : "text-hielo"}`}
      >
        {destino ? <Flag size={18} strokeWidth={2.5} /> : String(numero).padStart(2, "0")}
      </span>
    </span>
  );
}

/** Sección del tablero: escudo sobre la línea de ruta, título y titular con la conclusión. */
export default function Section({
  id,
  numero,
  titulo,
  titular,
  destino = false,
  children,
}: {
  id?: string;
  numero?: number;
  titulo: string;
  titular?: string;
  destino?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-32">
      <header className="mb-7 flex items-start gap-4 xl:block">
        <div className="text-linea xl:absolute xl:-left-[4.75rem] xl:-top-1">
          <Escudo numero={numero} destino={destino} />
        </div>
        <div>
          <h2 className="font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.01em] text-tinta sm:text-[2.35rem]">
            {titulo}
          </h2>
          {titular && (
            <p className="mt-3 max-w-[68ch] border-l-2 border-hielo/60 pl-4 text-lg leading-snug text-niebla">
              {titular}
            </p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
