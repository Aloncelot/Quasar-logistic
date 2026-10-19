"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine } from "recharts";
import ChartCard from "./ChartCard";
import { TamanoItem, SERIES, tooltipStyle, axisTick, gridStroke } from "./types";

export default function OrderSizeChart({ data, meta }: { data: TamanoItem[]; meta: number }) {
  const minimo = Math.min(...data.flatMap((d) => [d.on_time_pct, d.in_full_pct, d.otif_pct]));
  const piso = Math.max(0, Math.floor((minimo - 5) / 5) * 5);

  return (
    <ChartCard title="Cumplimiento según tamaño del pedido" subtitle="Los pedidos grandes llegan incompletos con más frecuencia">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="Tamano" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis domain={[piso, 100]} tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(l) => {
              const item = data.find((d) => d.Tamano === l);
              return `${l} uds · ${item?.volumen ?? 0} pedidos · ${item?.pct_faltantes ?? 0}% de los faltantes`;
            }}
            formatter={(v) => `${v}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#93a2bc" }} />
          <ReferenceLine y={meta} stroke={SERIES.meta.color} strokeOpacity={0.6} strokeDasharray="5 5" />
          <Bar dataKey="on_time_pct" name={SERIES.a_tiempo.nombre} fill={SERIES.a_tiempo.color} radius={[3, 3, 0, 0]} />
          <Bar dataKey="in_full_pct" name={SERIES.completos.nombre} fill={SERIES.completos.color} radius={[3, 3, 0, 0]} />
          <Bar dataKey="otif_pct" name="OTIF" fill={SERIES.otif.color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
