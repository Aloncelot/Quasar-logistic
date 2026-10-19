"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { CategoriaItem, COLOR_CATEGORIA, PALETA, tooltipStyle } from "./types";

export default function CategoryDonut({ data }: { data: CategoriaItem[] }) {
  const total = data.reduce((s, d) => s + d.pedidos, 0);
  const principal = [...data].sort((a, b) => b.pedidos - a.pedidos)[0];

  return (
    <ChartCard title="¿Quién origina la falla?" subtitle="Incidencias atribuibles a transporte o a almacén" className="h-[460px]">
      <div className="flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="pedidos" nameKey="categoria" innerRadius="70%" outerRadius="92%" paddingAngle={2} stroke={PALETA.panel} strokeWidth={3}>
                {data.map((d) => (
                  <Cell key={d.categoria} fill={COLOR_CATEGORIA[d.categoria] ?? COLOR_CATEGORIA.Otro} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          {principal && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-5xl font-semibold leading-none text-tinta">{principal.pct.toFixed(0)}%</span>
              <span className="mt-1 text-sm text-niebla">{principal.categoria}</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-linea pt-4">
          {data.map((d) => (
            <div key={d.categoria} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-niebla">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_CATEGORIA[d.categoria] ?? COLOR_CATEGORIA.Otro }} />
                {d.categoria}
              </span>
              <span className="text-bruma">
                {d.pedidos} de {total} · <span className="font-semibold text-tinta">{d.pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
