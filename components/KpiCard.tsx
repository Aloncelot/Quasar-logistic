"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpiTarjeta, SEMAFORO } from "./types";
import { useT } from "./i18n";

const decimales = (k: KpiTarjeta) => (k.id === "costo_flete_pct" ? 2 : 1);

export const formatoKpi = (k: KpiTarjeta, valor = k.valor) =>
  k.unidad === "%" ? `${valor.toFixed(decimales(k))}%` : `${valor.toFixed(1)} ${k.unidad}`;

const formatoMeta = (k: KpiTarjeta) =>
  `${k.mayor_es_mejor ? "≥" : "≤"} ${k.unidad === "%" ? `${k.meta}%` : `${k.meta} ${k.unidad}`}`;

function Estado({ kpi }: { kpi: KpiTarjeta }) {
  const t = useT();
  const s = SEMAFORO[kpi.estado];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.fondo} ${s.texto}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.solido }} />
      {t.semaforo[kpi.estado]}
    </span>
  );
}

function Variacion({ kpi, mesActual, mesAnterior }: { kpi: KpiTarjeta; mesActual: string | null; mesAnterior: string | null }) {
  const t = useT();
  if (kpi.variacion === null || !mesActual || !mesAnterior) return null;
  const abreviar = (mes: string) => (t.locale.startsWith("es") ? mes.slice(0, 3).toLowerCase() : mes.slice(0, 3));
  const Icono = kpi.variacion === 0 ? Minus : kpi.variacion > 0 ? TrendingUp : TrendingDown;
  const color = kpi.mejora === null ? "text-niebla" : kpi.mejora ? "text-ok" : "text-alerta";
  const unidad = kpi.unidad === "%" ? "pts" : kpi.unidad;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" title={`${mesActual} contra ${mesAnterior}`}>
      <Icono size={15} className={color} />
      <span className={`font-semibold ${color}`}>
        {kpi.variacion > 0 ? "+" : ""}
        {kpi.variacion.toFixed(decimales(kpi))} {unidad}
      </span>
      <span className="text-bruma">
        {abreviar(mesActual)} vs. {abreviar(mesAnterior)}
      </span>
    </span>
  );
}

/** Regla horizontal con la posición del valor y la marca de la meta. */
function Regla({ kpi }: { kpi: KpiTarjeta }) {
  const t = useT();
  const s = SEMAFORO[kpi.estado];
  // Escala centrada en la meta para que la distancia se vea con claridad
  const rango = kpi.unidad === "%" ? Math.max(15, Math.abs(kpi.brecha) * 1.6) : Math.max(kpi.meta, Math.abs(kpi.brecha) * 1.6);
  const minimo = kpi.meta - rango;
  const maximo = kpi.meta + rango;
  const posicion = (v: number) => Math.min(100, Math.max(0, ((v - minimo) / (maximo - minimo)) * 100));
  const pv = posicion(kpi.valor);
  const pm = posicion(kpi.meta);
  return (
    <div className="relative mt-6 h-10">
      <div className="absolute inset-x-0 top-4 h-1.5 rounded-full bg-linea" />
      <div
        className="absolute top-4 h-1.5 rounded-full"
        style={{ left: `${Math.min(pv, pm)}%`, width: `${Math.abs(pv - pm)}%`, backgroundColor: s.solido, opacity: 0.55 }}
      />
      <div className="absolute top-1.5 h-6 w-0.5 bg-tinta/80" style={{ left: `${pm}%` }} />
      <span className="absolute top-8 -translate-x-1/2 whitespace-nowrap text-xs text-niebla" style={{ left: `${pm}%` }}>
        {t.kpi.meta} {formatoMeta(kpi)}
      </span>
      <div
        className="absolute top-[11px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-noche"
        style={{ left: `${pv}%`, backgroundColor: s.solido }}
      />
    </div>
  );
}

/** Indicador con valor, meta, semáforo y variación contra el mes anterior. */
export default function KpiCard({
  kpi,
  mesActual,
  mesAnterior,
  destacado = false,
}: {
  kpi: KpiTarjeta;
  mesActual: string | null;
  mesAnterior: string | null;
  destacado?: boolean;
}) {
  const t = useT();
  const s = SEMAFORO[kpi.estado];

  if (destacado) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-hielo/25 bg-gradient-to-b from-panel-2 to-panel p-7">
        <h3 className="font-display text-2xl font-semibold leading-tight text-tinta">{kpi.nombre}</h3>
        <p className="mt-1 text-sm text-niebla">{kpi.descripcion}</p>
        <div className="mt-4">
          <Estado kpi={kpi} />
        </div>
        <p className="mt-5 font-display text-[5.5rem] font-semibold leading-none tracking-[-0.02em] text-tinta">
          {formatoKpi(kpi)}
        </p>
        <Regla kpi={kpi} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-linea pt-4">
          <Variacion kpi={kpi} mesActual={mesActual} mesAnterior={mesAnterior} />
          <span className={`text-sm font-medium ${s.texto}`}>
            {kpi.brecha > 0 ? "+" : ""}
            {kpi.brecha.toFixed(1)} {t.kpi.vsMeta}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col rounded-xl border border-linea bg-panel p-5 pl-6">
      <span className="absolute inset-y-4 left-0 w-[3px] rounded-r-full" style={{ backgroundColor: s.solido }} />
      <h3 className="font-display text-lg font-semibold leading-tight text-tinta">{kpi.nombre}</h3>
      <p className="mt-0.5 text-[13px] text-bruma">{kpi.descripcion}</p>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`font-display text-[2.6rem] font-semibold leading-none ${s.texto}`}>
          {kpi.unidad === "%" ? formatoKpi(kpi) : kpi.valor.toFixed(1)}
          {kpi.unidad !== "%" && <span className="ml-1 text-xl">{kpi.unidad}</span>}
        </span>
        <span className="text-sm text-niebla">{t.kpi.metaMin} {formatoMeta(kpi)}</span>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <Variacion kpi={kpi} mesActual={mesActual} mesAnterior={mesAnterior} />
        <Estado kpi={kpi} />
      </div>
    </div>
  );
}
