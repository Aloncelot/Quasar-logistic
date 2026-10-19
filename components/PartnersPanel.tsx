"use client";

import ChartCard from "./ChartCard";
import { CedisItem, PALETA, SEMAFORO, TransportistaItem, fmtNum } from "./types";

/** Barra horizontal con escala de 60% a 100% y marca de meta. */
function Barra({ valor, meta, color }: { valor: number; meta: number; color: string }) {
  const escala = (v: number) => Math.max(0, Math.min(100, ((v - 60) / 40) * 100));
  return (
    <div className="relative h-2 w-full flex-1 rounded-full bg-linea">
      <div className="h-full rounded-full" style={{ width: `${escala(valor)}%`, backgroundColor: color }} />
      <span className="absolute -top-1 h-4 w-0.5 bg-tinta/70" style={{ left: `${escala(meta)}%` }} title={`Meta ${meta}%`} />
    </div>
  );
}

function Pildora({ estado }: { estado: keyof typeof SEMAFORO }) {
  const s = SEMAFORO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.fondo} ${s.texto}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.solido }} />
      {s.etiqueta}
    </span>
  );
}

/** Desempeño de transportistas: puntualidad vs. meta, participación y costo. */
export function CarrierScorecard({ data, meta }: { data: TransportistaItem[]; meta: number }) {
  return (
    <ChartCard
      title="Transportistas"
      subtitle={`Entregas a tiempo de cada transportista. La marca vertical es la meta de ${meta}%.`}
      className="h-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-xs text-bruma">
              <th className="py-3 pr-4 font-medium">Transportista</th>
              <th className="w-[32%] px-4 py-3 font-medium">Entregas a tiempo</th>
              <th className="px-4 py-3 text-right font-medium">Volumen</th>
              <th className="px-4 py-3 text-right font-medium">OTIF</th>
              <th className="px-4 py-3 text-right font-medium">Flete / valor</th>
              <th className="py-3 pl-4 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.Transportista} className="border-b border-linea/60 last:border-0">
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-tinta">{t.Transportista}</p>
                  <p className="text-xs text-bruma">{t.estados.join(", ")}</p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Barra valor={t.on_time_pct} meta={meta} color={PALETA.cobalto} />
                    <span className="w-12 text-right font-display text-lg font-semibold text-tinta">{t.on_time_pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-niebla">{t.participacion_pct}%</td>
                <td className="px-4 py-3.5 text-right text-niebla">{t.otif_pct}%</td>
                <td className="px-4 py-3.5 text-right text-niebla">{t.costo_flete_pct.toFixed(2)}%</td>
                <td className="py-3.5 pl-4 text-right">
                  <Pildora estado={t.estado_semaforo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

/** Desempeño de los CEDIS de origen: completitud y faltantes. */
export function CedisPanel({ data, meta }: { data: CedisItem[]; meta: number }) {
  const maxFaltantes = Math.max(1, ...data.map((c) => c.unidades_faltantes));
  return (
    <ChartCard title="Centros de distribución" subtitle={`Pedidos entregados completos. Meta: ${meta}%.`} className="h-auto">
      <div className="divide-y divide-linea/70">
        {data.map((c) => (
          <div key={c.CEDIS_Origen} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold text-tinta">{c.CEDIS_Origen}</p>
              <Pildora estado={c.estado_semaforo} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="mb-1.5 text-xs text-bruma">Completos</p>
                <div className="flex items-center gap-2">
                  <Barra valor={c.in_full_pct} meta={meta} color={PALETA.artico} />
                  <span className="font-semibold text-tinta">{c.in_full_pct}%</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-bruma">Unidades faltantes</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-linea">
                    <div
                      className="h-full rounded-full bg-lavanda"
                      style={{ width: `${(c.unidades_faltantes / maxFaltantes) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-tinta">{fmtNum(c.unidades_faltantes)}</span>
                </div>
              </div>
            </div>
            {c.causa_principal && <p className="mt-2 text-xs text-bruma">Causa principal: <span className="text-niebla">{c.causa_principal}</span></p>}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
