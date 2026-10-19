"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import { FallasEstadoItem, PALETA, tooltipStyle, axisTick, gridStroke } from "./types";

export default function StateFailuresChart({ data }: { data: FallasEstadoItem[] }) {
  return (
    <ChartCard
      title="Tipo de incumplimiento por estado"
      subtitle="Pedidos que no fueron perfectos: llegaron tarde, incompletos o ambos"
      className="h-[600px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis dataKey="Estado_Destino" type="category" width={130} tick={{ ...axisTick, fill: PALETA.niebla, fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 13, color: "#93a2bc", paddingTop: 8 }} />
          <Bar dataKey="solo_retraso" name="Solo tarde" stackId="f" fill={PALETA.cobalto} barSize={22} />
          <Bar dataKey="solo_incompleto" name="Solo incompleto" stackId="f" fill={PALETA.lavanda} />
          <Bar dataKey="ambos" name="Tarde e incompleto" stackId="f" fill={PALETA.hielo} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
