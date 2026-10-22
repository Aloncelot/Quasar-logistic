"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine } from "recharts";
import ChartCard from "./ChartCard";
import { TamanoItem, SERIES, tooltipStyle, axisTick, gridStroke } from "./types";
import { useT } from "./i18n";

export default function OrderSizeChart({ data, meta }: { data: TamanoItem[]; meta: number }) {
  const t = useT();
  const minimo = Math.min(...data.flatMap((d) => [d.on_time_pct, d.in_full_pct, d.otif_pct]));
  const piso = Math.max(0, Math.floor((minimo - 5) / 5) * 5);

  return (
    <ChartCard title={t.tamano.titulo} subtitle={t.tamano.subtitulo}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="Tamano" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis domain={[piso, 100]} tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(l) => {
              const item = data.find((d) => d.Tamano === l);
              return t.tamano.detalle(String(l), item?.volumen ?? 0, item?.pct_faltantes ?? 0);
            }}
            formatter={(v) => `${v}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#93a2bc" }} />
          <ReferenceLine y={meta} stroke={SERIES.meta.color} strokeOpacity={0.6} strokeDasharray="5 5" />
          <Bar dataKey="on_time_pct" name={t.series.aTiempo} fill={SERIES.a_tiempo.color} radius={[3, 3, 0, 0]} />
          <Bar dataKey="in_full_pct" name={t.series.completos} fill={SERIES.completos.color} radius={[3, 3, 0, 0]} />
          <Bar dataKey="otif_pct" name={t.series.otifCorto} fill={SERIES.otif.color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
