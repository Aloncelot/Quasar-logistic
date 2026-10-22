"use client";

import React from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid,
} from "recharts";
import ChartCard from "./ChartCard";
import { COLOR_CATEGORIA, PALETA, ParetoItem, tooltipStyle, axisTick, gridStroke } from "./types";
import { useT } from "./i18n";

interface ParetoProps {
  paretoData: ParetoItem[];
}

export default function ParetoChart({ paretoData }: ParetoProps) {
  const t = useT();
  // Ordenamos de mayor a menor frecuencia y recalculamos el % acumulado
  const ordenado = [...paretoData].sort((a, b) => b.Frecuencia - a.Frecuencia);
  const total = ordenado.reduce((s, d) => s + d.Frecuencia, 0);
  let acumulado = 0;
  const data = ordenado.map((d) => {
    acumulado += d.Frecuencia;
    return { ...d, Pct_Acumulado: total ? Math.round((acumulado / total) * 1000) / 10 : 0 };
  });

  return (
    <ChartCard
      title={t.pareto.titulo}
      subtitle={t.pareto.subtitulo}
      className="h-[460px]"
      action={
        <div className="flex gap-4 text-sm text-niebla">
          {Object.entries(COLOR_CATEGORIA)
            .filter(([c]) => c !== "otro")
            .map(([c, color]) => (
              <span key={c} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /> {t.categorias[c]}
              </span>
            ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" horizontal={false} />
          <XAxis xAxisId="freq" type="number" hide />
          <XAxis xAxisId="pct" type="number" orientation="top" domain={[0, 100]} unit="%" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis dataKey="Motivo" type="category" width={200} tick={{ ...axisTick, fill: PALETA.niebla, fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} formatter={(v, name) => (name === t.pareto.acumulado ? [`${v}%`, name] : [v, name])} />
          <ReferenceLine xAxisId="pct" x={80} stroke={PALETA.tinta} strokeOpacity={0.5} strokeDasharray="5 5" />
          <Bar xAxisId="freq" dataKey="Frecuencia" name={t.pareto.incidencias} radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((d) => (
              <Cell key={d.Motivo} fill={COLOR_CATEGORIA[d.Categoria_id] ?? COLOR_CATEGORIA.otro} />
            ))}
          </Bar>
          <Line xAxisId="pct" dataKey="Pct_Acumulado" name={t.pareto.acumulado} stroke={PALETA.hielo} strokeWidth={2} dot={{ r: 3, fill: PALETA.hielo, strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
