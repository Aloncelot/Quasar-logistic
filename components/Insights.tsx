"use client";

import { TriangleAlert, CircleCheck, Info } from "lucide-react";
import { Hallazgo } from "./types";

const ESTILO = {
  alerta: { icono: TriangleAlert, color: "text-alerta" },
  positivo: { icono: CircleCheck, color: "text-ok" },
  info: { icono: Info, color: "text-hielo" },
};

/** Hallazgos clave: lo que un directivo debe saber en 30 segundos. */
export default function Insights({ items }: { items: Hallazgo[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-linea bg-linea md:grid-cols-2 xl:grid-cols-4">
      {items.map((h) => {
        const e = ESTILO[h.tipo] ?? ESTILO.info;
        const Icono = e.icono;
        return (
          <article key={h.titulo} className="bg-panel p-6">
            <Icono size={20} className={e.color} aria-hidden />
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-tinta">{h.titulo}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-niebla">{h.detalle}</p>
          </article>
        );
      })}
    </div>
  );
}
