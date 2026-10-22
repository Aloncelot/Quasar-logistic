"use client";

import React from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { EstadoKPI, PALETA, SEMAFORO, fmtMxn, fmtNum } from "./types";
import { useIdioma } from "./preferencias";
import { useT } from "./i18n";

export default function StateRankingTable({ data }: { data: EstadoKPI[] }) {
  const t = useT();
  const [idioma] = useIdioma();
  const ordenado = [...data].sort((a, b) => b.otif_pct - a.otif_pct);

  return (
    <ChartCard title={t.ranking.titulo} subtitle={t.ranking.subtitulo} className="h-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-xs text-bruma">
              {t.ranking.columnas.map((c, i) => (
                <th
                  key={c}
                  className={`py-3 font-medium ${i === 0 || i === 1 ? "pr-4" : i === 8 ? "w-40 pl-4" : "px-4"} ${
                    [2, 3, 4, 5, 7].includes(i) ? "text-right" : ""
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenado.map((e, i) => {
              const serie = e.tendencia.map((v, idx) => ({ idx, v }));
              const validos = e.tendencia.filter((v): v is number => v !== null);
              const sube = validos.length > 1 && validos[validos.length - 1] >= validos[0];
              const s = SEMAFORO[e.estado_semaforo];
              return (
                <tr key={e.Estado_Destino} className="border-b border-linea/60 last:border-0">
                  <td className="py-3 pr-4 font-display text-lg text-bruma">{i + 1}</td>
                  <td className="whitespace-nowrap py-3 pr-4 font-medium text-tinta">{e.Estado_Destino}</td>
                  <td className="px-4 py-3 text-right text-niebla">{fmtNum(e.volumen, idioma)}</td>
                  <td className="px-4 py-3 text-right text-niebla">{e.on_time_pct}%</td>
                  <td className="px-4 py-3 text-right text-niebla">{e.in_full_pct}%</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${s.fondo} ${s.texto}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.solido }} />
                      {e.otif_pct}%
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-niebla">{e.causa_principal ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-niebla">{fmtMxn(e.valor_incidencias_mxn, idioma)}</td>
                  <td className="py-2 pl-4">
                    <div className="h-8 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={serie}>
                          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={sube ? PALETA.artico : PALETA.lavanda}
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
