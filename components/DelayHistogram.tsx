"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import { DistribucionItem, PALETA, tooltipStyle, axisTick, gridStroke } from "./types";

// Anticipado = ártico, puntual = hielo, tarde = lavanda (más intenso conforme crece el retraso)
const color = (dias: number) =>
  dias < 0 ? PALETA.artico : dias === 0 ? PALETA.hielo : dias <= 2 ? PALETA.lavanda : "#7c7fe0";

const etiqueta = (dias: number) =>
  dias === 0 ? "El día prometido" : dias < 0 ? `${Math.abs(dias)} día(s) antes` : `${dias} día(s) tarde`;

export default function DelayHistogram({ data }: { data: DistribucionItem[] }) {
  return (
    <ChartCard title="¿Qué tan tarde llegamos?" subtitle="Pedidos según días de diferencia contra la fecha prometida">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="dias" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(d) => (d > 0 ? `+${d}` : String(d))} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} labelFormatter={(d) => etiqueta(Number(d))} formatter={(v) => [v, "Pedidos"]} />
          <Bar dataKey="pedidos" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.dias} fill={color(d.dias)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
