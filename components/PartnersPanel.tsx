"use client";

import ChartCard from "./ChartCard";
import { CedisItem, PALETA, SEMAFORO, TransportistaItem, fmtNum } from "./types";
import { useIdioma } from "./preferencias";
import { useT } from "./i18n";

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
  const t = useT();
  const s = SEMAFORO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.fondo} ${s.texto}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.solido }} />
      {t.semaforo[estado]}
    </span>
  );
}

/** Desempeño de transportistas: puntualidad vs. meta, participación y costo. */
export function CarrierScorecard({ data, meta }: { data: TransportistaItem[]; meta: number }) {
  const t = useT();
  const [c0, c1, c2, c3, c4, c5] = t.transportistas.columnas;
  return (
    <ChartCard
      title={t.transportistas.titulo}
      subtitle={t.transportistas.subtitulo(meta)}
      className="h-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-xs text-bruma">
              <th className="py-3 pr-4 font-medium">{c0}</th>
              <th className="w-[32%] px-4 py-3 font-medium">{c1}</th>
              <th className="px-4 py-3 text-right font-medium">{c2}</th>
              <th className="px-4 py-3 text-right font-medium">{c3}</th>
              <th className="px-4 py-3 text-right font-medium">{c4}</th>
              <th className="py-3 pl-4 text-right font-medium">{c5}</th>
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
  const t = useT();
  const [idioma] = useIdioma();
  const maxFaltantes = Math.max(1, ...data.map((c) => c.unidades_faltantes));
  return (
    <ChartCard title={t.cedis.titulo} subtitle={t.cedis.subtitulo(meta)} className="h-auto">
      <div className="divide-y divide-linea/70">
        {data.map((c) => (
          <div key={c.CEDIS_Origen} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold text-tinta">{c.CEDIS_Origen}</p>
              <Pildora estado={c.estado_semaforo} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="mb-1.5 text-xs text-bruma">{t.cedis.completos}</p>
                <div className="flex items-center gap-2">
                  <Barra valor={c.in_full_pct} meta={meta} color={PALETA.artico} />
                  <span className="font-semibold text-tinta">{c.in_full_pct}%</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-bruma">{t.cedis.faltantes}</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-linea">
                    <div
                      className="h-full rounded-full bg-lavanda"
                      style={{ width: `${(c.unidades_faltantes / maxFaltantes) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-tinta">{fmtNum(c.unidades_faltantes, idioma)}</span>
                </div>
              </div>
            </div>
            {c.causa_principal && <p className="mt-2 text-xs text-bruma">{t.cedis.causa} <span className="text-niebla">{c.causa_principal}</span></p>}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
