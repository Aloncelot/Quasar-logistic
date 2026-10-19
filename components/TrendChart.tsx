"use client";

import React, { useState } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import ChartCard from "./ChartCard";
import { MensualItem, TendenciaItem, SERIES, tooltipStyle, axisTick, gridStroke } from "./types";

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const formatoSemana = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MESES_CORTOS[Number(m) - 1]}`;
};

type Vista = "semanal" | "mensual";

interface PuntoTendencia {
  etiqueta: string;
  on_time_pct: number;
  in_full_pct: number;
  otif_pct: number;
}

export default function TrendChart({
  semanal,
  mensual,
  meta,
}: {
  semanal: TendenciaItem[];
  mensual: MensualItem[];
  meta: number;
}) {
  const [vista, setVista] = useState<Vista>("semanal");

  // Una sola forma de punto para ambas vistas (Recharts exige un arreglo de un solo tipo)
  const datos: PuntoTendencia[] =
    vista === "semanal"
      ? semanal.map((s) => ({
          etiqueta: formatoSemana(s.Semana) + (s.parcial ? "*" : ""),
          on_time_pct: s.on_time_pct,
          in_full_pct: s.in_full_pct,
          otif_pct: s.otif_pct,
        }))
      : mensual.map((m) => ({
          etiqueta: m.etiqueta,
          on_time_pct: m.on_time_pct,
          in_full_pct: m.in_full_pct,
          otif_pct: m.otif_pct,
        }));

  const minimo = Math.min(meta, ...datos.flatMap((d) => [d.on_time_pct, d.in_full_pct, d.otif_pct]));
  const piso = Math.max(0, Math.floor((minimo - 5) / 5) * 5);

  const selector = (
    <div className="flex rounded-lg border border-linea p-0.5 text-sm" role="tablist" aria-label="Agrupar por">
      {(["semanal", "mensual"] as Vista[]).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={vista === v}
          onClick={() => setVista(v)}
          className={`rounded-md px-3 py-1 capitalize transition-colors ${
            vista === v ? "bg-hielo/15 text-hielo" : "text-niebla hover:text-tinta"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Evolución del cumplimiento"
      subtitle={`Por ${vista === "semanal" ? "semana" : "mes"} de la fecha prometida. Meta de pedidos perfectos: ${meta}%.${
        vista === "semanal" ? " (*) semana parcial." : ""
      }`}
      className="h-[440px]"
      action={selector}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datos} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="relleno-otif" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES.otif.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={SERIES.otif.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridStroke} strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="etiqueta" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis domain={[piso, 100]} tick={axisTick} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            {...tooltipStyle}
            cursor={{ stroke: gridStroke }}
            labelFormatter={(l) =>
              vista === "semanal"
                ? `Semana del ${String(l).replace("*", "")}${String(l).endsWith("*") ? " (parcial)" : ""}`
                : String(l)
            }
            formatter={(v) => `${v}%`}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: "#93a2bc", paddingTop: 8 }} iconType="plainline" />
          <ReferenceLine
            y={meta}
            stroke={SERIES.meta.color}
            strokeOpacity={0.6}
            strokeDasharray="5 5"
            label={{ value: `Meta ${meta}%`, fill: "#e6edf7", fontSize: 12, position: "insideTopRight" }}
          />
          <Line type="monotone" dataKey="on_time_pct" name={SERIES.a_tiempo.nombre} stroke={SERIES.a_tiempo.color} strokeWidth={1.75} dot={false} />
          <Line type="monotone" dataKey="in_full_pct" name={SERIES.completos.nombre} stroke={SERIES.completos.color} strokeWidth={1.75} dot={false} />
          <Area
            type="monotone"
            dataKey="otif_pct"
            name={SERIES.otif.nombre}
            stroke={SERIES.otif.color}
            strokeWidth={3}
            fill="url(#relleno-otif)"
            dot={{ r: 3, fill: SERIES.otif.color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
