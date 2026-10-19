"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import ChartCard from "./ChartCard";
import { ImpactoItem, PALETA, tooltipStyle, axisTick, gridStroke, fmtMxn } from "./types";

export default function ImpactChart({ data }: { data: ImpactoItem[] }) {
  return (
    <ChartCard title="Unidades no entregadas por causa" subtitle="Causas de almacén medidas por unidades faltantes">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis dataKey="Causa" type="category" width={130} tick={{ ...axisTick, fill: PALETA.niebla }} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(v, _name, item) => {
              const fila = item?.payload as ImpactoItem | undefined;
              return [`${Number(v).toLocaleString("es-MX")} uds · ${fila?.pedidos ?? 0} pedidos · ${fmtMxn(fila?.valor_mxn ?? 0)}`, "Faltante"];
            }}
          />
          <Bar dataKey="unidades" name="Unidades" fill={PALETA.lavanda} radius={[0, 4, 4, 0]} barSize={22}>
            <LabelList dataKey="unidades" position="right" fill={PALETA.tinta} fontSize={12} formatter={(v) => Number(v).toLocaleString("es-MX")} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
