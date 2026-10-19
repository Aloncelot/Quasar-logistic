"use client";

import { CalendarClock, UserCog } from "lucide-react";
import { Recomendacion } from "./types";

/** Conclusiones y recomendaciones con responsable, plazo e impacto estimado. */
export default function Recommendations({
  conclusiones,
  recomendaciones,
}: {
  conclusiones: string[];
  recomendaciones: Recomendacion[];
}) {
  const maxImpacto = Math.max(0.1, ...recomendaciones.map((r) => r.impacto_pts ?? 0));
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <h3 className="font-display text-2xl font-semibold text-tinta">Lo que nos dice el periodo</h3>
        <ul className="mt-5 space-y-4">
          {conclusiones.map((c) => (
            <li key={c} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hielo" aria-hidden />
              <p className="text-[15px] leading-relaxed text-niebla">{c}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="xl:col-span-3">
        <h3 className="font-display text-2xl font-semibold text-tinta">Qué proponemos, en orden de prioridad</h3>
        <ol className="mt-5 overflow-hidden rounded-xl border border-linea">
          {recomendaciones.map((r, i) => (
            <li key={r.titulo} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-linea bg-panel p-5 last:border-0 sm:grid-cols-[3rem_1fr_9rem]">
              <span className="font-display text-3xl font-semibold leading-none text-acero">{i + 1}</span>
              <div>
                <h4 className="font-display text-lg font-semibold leading-snug text-tinta">{r.titulo}</h4>
                <p className="mt-1 text-sm leading-relaxed text-niebla">{r.detalle}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-bruma">
                  <span className="inline-flex items-center gap-1.5">
                    <UserCog size={13} /> {r.responsable}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock size={13} /> {r.plazo}
                  </span>
                </div>
              </div>
              {/* Impacto: barra proporcional para comparar acciones de un vistazo */}
              <div className="col-span-2 sm:col-span-1 sm:text-right">
                {r.impacto_pts ? (
                  <>
                    <p className="font-display text-2xl font-semibold leading-none text-artico">+{r.impacto_pts.toFixed(1)} pts</p>
                    <p className="mt-1 text-xs text-bruma">OTIF estimado</p>
                    <div className="mt-2 h-1.5 rounded-full bg-linea sm:ml-auto sm:w-28">
                      <div className="h-full rounded-full bg-artico" style={{ width: `${(r.impacto_pts / maxImpacto) * 100}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-niebla">{r.impacto}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-bruma">
          Impacto estimado: el grupo intervenido iguala el desempeño promedio del resto. Los efectos no son estrictamente acumulables.
        </p>
      </div>
    </div>
  );
}
