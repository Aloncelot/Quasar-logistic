"use client";

import React, { useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { EstadoKPI, PALETA, SEMAFORO, fmtMxn } from "./types";

// Contornos de los estados de México (Highcharts)
const geoUrl = "https://code.highcharts.com/mapdata/countries/mx/mx-all.topo.json";

// Rampa fría continua: menor OTIF = acero profundo, mayor OTIF = hielo
const RAMPA = [
  [29, 47, 85],
  [76, 130, 247],
  [156, 203, 255],
];
function colorRampa(t: number) {
  const v = Math.min(1, Math.max(0, t));
  const tramo = v < 0.5 ? 0 : 1;
  const local = tramo === 0 ? v / 0.5 : (v - 0.5) / 0.5;
  const c = RAMPA[tramo].map((f, i) => Math.round(f + (RAMPA[tramo + 1][i] - f) * local));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const normalizar = (texto: string) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

interface MapaProps {
  mapData: EstadoKPI[];
  meta: number;
}

interface HoverInfo {
  x: number;
  y: number;
  nombre: string;
  datos?: EstadoKPI;
}

export default function MapChart({ mapData, meta }: MapaProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const valores = mapData.map((d) => d.otif_pct);
  const minimo = Math.floor(Math.min(...valores) - 1);
  const maximo = Math.min(100, Math.ceil(Math.max(...valores, meta) + 3));
  const escala = (v: number) => (v - minimo) / (maximo - minimo);

  const moverTooltip = (e: React.MouseEvent, nombre: string, datos?: EstadoKPI) => {
    const rect = contenedorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, nombre, datos });
  };

  // Cruza el nombre del mapa con el estado que reporta la API
  const datosEstado = (nombreMapa: string) => {
    if (!nombreMapa) return undefined;
    const geo = normalizar(nombreMapa);
    return mapData.find((d) => {
      const api = normalizar(d.Estado_Destino);
      if (api.includes("mexico") && geo === "mexico") return true;
      return api === geo || geo.includes(api);
    });
  };

  return (
    <div ref={contenedorRef} className="relative h-[600px] w-full overflow-hidden rounded-xl border border-linea bg-panel">
      <div className="pointer-events-none absolute left-6 top-6 z-10">
        <h3 className="font-display text-xl font-semibold text-tinta">Pedidos perfectos por estado</h3>
        <p className="mt-1 text-sm text-bruma">Pasa el cursor sobre un estado para ver el detalle</p>
      </div>

      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1400, center: [-102, 24] }} className="h-full w-full">
        {/* ZoomableGroup usa center=[0,0] por defecto y sobrescribe el centro de la proyección */}
        <ZoomableGroup center={[-102, 24]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const datos = datosEstado(geo.properties?.name);
                const relleno = datos ? colorRampa(escala(datos.otif_pct)) : PALETA.panel2;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={relleno}
                    stroke={datos ? PALETA.noche : PALETA.linea}
                    strokeWidth={datos ? 1.2 : 0.8}
                    // react-simple-maps v5: `style` es CSSProperties plano; el hover va por clases
                    style={{ outline: "none", transition: "stroke 0.2s" }}
                    className="cursor-pointer focus:outline-none hover:stroke-tinta hover:[stroke-width:1.8]"
                    onMouseMove={(e: React.MouseEvent) => moverTooltip(e, geo.properties?.name ?? "", datos)}
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 min-w-[200px] rounded-lg border border-linea bg-noche/95 px-3.5 py-3 text-sm shadow-2xl backdrop-blur"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          <p className="font-display text-lg font-semibold text-tinta">{hover.datos?.Estado_Destino ?? hover.nombre}</p>
          {hover.datos ? (
            <div className="mt-1 space-y-1 text-niebla">
              <p className="flex items-center justify-between gap-4">
                OTIF
                <span className={`font-semibold ${SEMAFORO[hover.datos.estado_semaforo].texto}`}>
                  {hover.datos.otif_pct}% · {SEMAFORO[hover.datos.estado_semaforo].etiqueta}
                </span>
              </p>
              <p className="flex justify-between gap-4">A tiempo <span className="text-tinta">{hover.datos.on_time_pct}%</span></p>
              <p className="flex justify-between gap-4">Completos <span className="text-tinta">{hover.datos.in_full_pct}%</span></p>
              <p className="flex justify-between gap-4">Pedidos <span className="text-tinta">{hover.datos.volumen.toLocaleString("es-MX")}</span></p>
              <p className="flex justify-between gap-4">Valor con incidencia <span className="text-tinta">{fmtMxn(hover.datos.valor_incidencias_mxn)}</span></p>
              {hover.datos.causa_principal && <p className="pt-1 text-xs text-bruma">Causa principal: {hover.datos.causa_principal}</p>}
            </div>
          ) : (
            <p className="text-bruma">Sin operación en el periodo</p>
          )}
        </div>
      )}

      {/* Leyenda: rampa continua con la meta marcada */}
      <div className="absolute bottom-5 left-6 right-6 rounded-lg border border-linea bg-noche/85 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-xs text-niebla">
          <span>Menor OTIF</span>
          <span>Mayor OTIF</span>
        </div>
        <div className="relative">
          <div
            className="h-2.5 rounded-full"
            style={{ background: `linear-gradient(90deg, ${colorRampa(0)}, ${colorRampa(0.5)}, ${colorRampa(1)})` }}
          />
          {meta >= minimo && meta <= maximo && (
            <span className="absolute -top-1 h-[18px] w-0.5 bg-tinta" style={{ left: `${escala(meta) * 100}%` }} />
          )}
        </div>
        <div className="relative mt-1.5 h-4 text-xs text-bruma">
          <span className="absolute left-0">{minimo}%</span>
          {meta >= minimo && meta <= maximo && (
            <span className="absolute -translate-x-1/2 text-tinta" style={{ left: `${escala(meta) * 100}%` }}>
              Meta {meta}%
            </span>
          )}
          <span className="absolute right-0">{maximo}%</span>
        </div>
      </div>
    </div>
  );
}
