"use client";

import React from "react";
import ChartCard from "./ChartCard";
import { HeatmapData } from "./types";
import { useT } from "./i18n";

// Rampa fría: panel → cobalto → hielo según la intensidad (0..1)
const PARADAS = [
  [17, 29, 51],
  [76, 130, 247],
  [156, 203, 255],
];
const colorCelda = (t: number) => {
  const tramo = t < 0.5 ? 0 : 1;
  const local = tramo === 0 ? t / 0.5 : (t - 0.5) / 0.5;
  const c = PARADAS[tramo].map((f, i) => Math.round(f + (PARADAS[tramo + 1][i] - f) * local));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export default function CauseHeatmap({ data }: { data: HeatmapData }) {
  const t = useT();
  const max = Math.max(1, ...data.valores.flat());

  return (
    <ChartCard title={t.heatmap.titulo} subtitle={t.heatmap.subtitulo} className="h-auto">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-bruma">{t.heatmap.causa}</th>
              {data.estados.map((e) => (
                <th key={e} className="whitespace-nowrap p-2 text-xs font-medium text-niebla">
                  {e}
                </th>
              ))}
              <th className="p-2 text-xs font-medium text-niebla">{t.heatmap.total}</th>
            </tr>
          </thead>
          <tbody>
            {data.causas.map((causa, i) => {
              const fila = data.valores[i];
              const totalFila = fila.reduce((s, v) => s + v, 0);
              return (
                <tr key={causa}>
                  <td className="whitespace-nowrap p-2 text-xs text-niebla">{causa}</td>
                  {fila.map((v, j) => {
                    const t = v / max;
                    return (
                      <td
                        key={j}
                        title={`${causa} · ${data.estados[j]}: ${v}`}
                        className="rounded-md p-2 text-center font-semibold tabular-nums"
                        style={{ backgroundColor: colorCelda(t), color: t > 0.55 ? "#070d1a" : "#cbd5e6" }}
                      >
                        {v}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-semibold text-tinta">{totalFila}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
