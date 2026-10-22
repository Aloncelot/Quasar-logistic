"use client";

import ChartCard from "./ChartCard";
import { ClienteItem, Global, SEMAFORO, fmtMxn, fmtNum } from "./types";
import { useIdioma } from "./preferencias";
import { useT } from "./i18n";

/** Cifras de impacto económico: una franja continua, la cifra crítica resaltada. */
export function FinanceStrip({ g }: { g: Global }) {
  const t = useT();
  const [idioma] = useIdioma();
  const f = t.finanzas;
  const cifras = [
    { titulo: f.total, valor: fmtMxn(g.valor_total_mxn, idioma), detalle: f.pedidos(fmtNum(g.volumen_total, idioma)), critica: false },
    { titulo: f.incidencia, valor: fmtMxn(g.valor_incidencias_mxn, idioma), detalle: f.pctTotal(g.valor_incidencias_pct), critica: true },
    { titulo: f.noEntregado, valor: fmtMxn(g.valor_no_entregado_mxn, idioma), detalle: f.faltantes(fmtNum(g.unidades_faltantes, idioma)), critica: false },
    { titulo: f.flete, valor: fmtMxn(g.costo_flete_mxn, idioma), detalle: f.pctValor(g.costo_flete_pct.toFixed(2)), critica: false },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-linea bg-linea lg:grid-cols-4">
      {cifras.map((c) => (
        <div key={c.titulo} className={`p-6 ${c.critica ? "bg-[#1a1626]" : "bg-panel"}`}>
          <p className="text-sm text-niebla">{c.titulo}</p>
          <p className={`mt-2 font-display text-4xl font-semibold leading-none ${c.critica ? "text-alerta" : "text-tinta"}`}>
            {c.valor}
          </p>
          <p className="mt-2 text-xs text-bruma">{c.detalle}</p>
        </div>
      ))}
    </div>
  );
}

/** Clientes ordenados por el valor de sus pedidos con incidencia. */
export function ClientImpactTable({ data, titular }: { data: ClienteItem[]; titular?: string }) {
  const t = useT();
  const [idioma] = useIdioma();
  const [c0, c1, c2, c3, c4] = t.clientes.columnas;
  const max = Math.max(1, ...data.map((c) => c.valor_incidencias_mxn));
  return (
    <ChartCard title={t.clientes.titulo} subtitle={titular ?? t.clientes.subtitulo} className="h-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-xs text-bruma">
              <th className="py-3 pr-4 font-medium">{c0}</th>
              <th className="px-4 py-3 font-medium">{c1}</th>
              <th className="px-4 py-3 text-right font-medium">{c2}</th>
              <th className="px-4 py-3 text-right font-medium">{c3}</th>
              <th className="w-[34%] py-3 pl-4 font-medium">{c4}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.Cliente} className="border-b border-linea/60 last:border-0">
                <td className="py-3.5 pr-4 font-medium text-tinta">{c.Cliente}</td>
                <td className="px-4 py-3.5 text-niebla">{c.Canal}</td>
                <td className="px-4 py-3.5 text-right text-niebla">{fmtNum(c.volumen, idioma)}</td>
                <td className={`px-4 py-3.5 text-right font-semibold ${SEMAFORO[c.estado_semaforo].texto}`}>{c.otif_pct}%</td>
                <td className="py-3.5 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-linea">
                      <div className="h-full rounded-full bg-acero" style={{ width: `${(c.valor_incidencias_mxn / max) * 100}%` }} />
                    </div>
                    <span className="w-20 text-right font-display text-lg font-semibold text-tinta">{fmtMxn(c.valor_incidencias_mxn, idioma)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
