"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import { FallasEstadoItem, PALETA, tooltipStyle, axisTick, gridStroke } from "./types";
import { useT } from "./i18n";

export default function StateFailuresChart({ data }: { data: FallasEstadoItem[] }) {
  const t = useT();
  return (
    <ChartCard
      title={t.fallas.titulo}
      subtitle={t.fallas.subtitulo}
      className="h-[600px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis dataKey="Estado_Destino" type="category" width={130} tick={{ ...axisTick, fill: PALETA.niebla, fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 13, color: "#93a2bc", paddingTop: 8 }} />
          <Bar dataKey="solo_retraso" name={t.fallas.tarde} stackId="f" fill={PALETA.cobalto} barSize={22} />
          <Bar dataKey="solo_incompleto" name={t.fallas.incompleto} stackId="f" fill={PALETA.lavanda} />
          <Bar dataKey="ambos" name={t.fallas.ambos} stackId="f" fill={PALETA.hielo} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
