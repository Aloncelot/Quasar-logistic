"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Activity, UploadCloud, LogOut, Truck, Database, ChevronDown, CircleAlert, FileSpreadsheet } from "lucide-react";
import MapChart from "./MapChart";
import ParetoChart from "./ParetoCharts";
import TrendChart from "./TrendChart";
import DelayHistogram from "./DelayHistogram";
import StateFailuresChart from "./StateFailuresChart";
import CategoryDonut from "./CategoryDonut";
import CauseHeatmap from "./CauseHeatmap";
import ImpactChart from "./ImpactChart";
import OrderSizeChart from "./OrderSizeChart";
import StateRankingTable from "./StateRankingTable";
import KpiCard from "./KpiCard";
import Section from "./Section";
import Insights from "./Insights";
import { CarrierScorecard, CedisPanel } from "./PartnersPanel";
import { FinanceStrip, ClientImpactTable } from "./FinancePanel";
import Recommendations from "./Recommendations";
import ExportPanel from "./ExportPanel";
import UploadModal from "./UploadModal";
import { analizarArchivo, descargarReporte, obtenerEjemplo, FormatoReporte } from "./api";
import { cerrarSesion, Sesion } from "./auth";
import { KPIData, fmtNum } from "./types";

const NAVEGACION = [
  { id: "resumen", texto: "Resumen" },
  { id: "evolucion", texto: "Evolución" },
  { id: "donde", texto: "Dónde" },
  { id: "porque", texto: "Por qué" },
  { id: "socios", texto: "Socios" },
  { id: "finanzas", texto: "Finanzas" },
  { id: "acciones", texto: "Acciones" },
  { id: "descargar", texto: "Descargar" },
];

// Única secuencia de entrada orquestada: la primera pantalla del resumen
const contenedor: Variants = {
  oculto: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const elemento: Variants = {
  oculto: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 28 } },
};

export default function Dashboard({ sesion }: { sesion: Sesion }) {
  const [data, setData] = useState<KPIData | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exportando, setExportando] = useState<FormatoReporte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);
  const [verDetalle, setVerDetalle] = useState(false);

  // Evita que el navegador abra el archivo si se suelta fuera de la zona de carga
  useEffect(() => {
    const prevenir = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevenir);
    window.addEventListener("drop", prevenir);
    return () => {
      window.removeEventListener("dragover", prevenir);
      window.removeEventListener("drop", prevenir);
    };
  }, []);

  const procesar = async (nuevo: File) => {
    setError(null);
    if (!nuevo.name.toLowerCase().endsWith(".csv")) {
      setError("El archivo debe tener extensión .csv");
      setModalAbierto(true);
      return;
    }
    setProcesando(true);
    try {
      const resultado = await analizarArchivo(nuevo);
      setData(resultado);
      setArchivo(nuevo);
      setModalAbierto(false);
      setErrorExportar(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el archivo.");
      setModalAbierto(true);
    } finally {
      setProcesando(false);
    }
  };

  const usarEjemplo = async () => {
    setError(null);
    setProcesando(true);
    try {
      await procesar(await obtenerEjemplo());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron obtener los datos de ejemplo.");
      setModalAbierto(true);
      setProcesando(false);
    }
  };

  const exportar = async (formato: FormatoReporte) => {
    if (!archivo) return;
    setErrorExportar(null);
    setExportando(formato);
    try {
      await descargarReporte(archivo, formato);
    } catch (err) {
      setErrorExportar(err instanceof Error ? err.message : "No se pudo generar el reporte.");
    } finally {
      setExportando(null);
    }
  };

  const kpis = data ? Object.fromEntries(data.kpis.map((k) => [k.id, k])) : {};
  const metaOtif = data?.metas.otif_pct?.meta ?? 90;

  return (
    <main className="min-h-screen bg-noche font-sans text-tinta">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-linea bg-noche/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-hielo/30 bg-hielo/10">
              <Truck className="text-hielo" size={21} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold leading-none text-tinta">Torre de Control Logística</h1>
              <p className="mt-1 text-sm text-niebla">
                {data
                  ? `Cumplimiento de entregas, ${data.periodo.etiqueta}`
                  : "Análisis de cumplimiento de entregas a partir del reporte de SAP"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setError(null);
                setModalAbierto(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-hielo px-4 py-2 text-sm font-semibold text-noche transition-colors hover:bg-white"
            >
              <UploadCloud size={17} />
              {data ? "Cargar otro reporte" : "Cargar reporte"}
            </button>
            <div className="flex items-center gap-2 border-l border-linea pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 font-display text-base font-semibold text-hielo">
                {sesion.nombre.slice(0, 1)}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm text-tinta">{sesion.nombre}</p>
                <p className="text-xs text-bruma">{sesion.rol}</p>
              </div>
              <button
                onClick={cerrarSesion}
                className="ml-1 rounded-lg p-2 text-niebla transition-colors hover:bg-panel-2 hover:text-tinta"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {data && (
          <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 pb-3 text-sm sm:px-8" aria-label="Secciones">
            {NAVEGACION.map((n, i) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-niebla transition-colors hover:bg-panel-2 hover:text-tinta"
              >
                <span className="font-display text-xs font-semibold text-bruma">{String(i + 1).padStart(2, "0")}</span>
                {n.texto}
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8">
        {!data ? (
          /* Estado vacío */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-linea bg-panel/50 p-8 text-center"
          >
            <FileSpreadsheet size={56} className="mb-4 text-acero" />
            <h2 className="font-display text-3xl font-semibold text-tinta">Carga el reporte de entregas para empezar</h2>
            <p className="mt-3 max-w-lg text-niebla">
              Importa el reporte de SAP (.csv) y obtén los indicadores de cumplimiento, los hallazgos clave y las
              recomendaciones del periodo.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setModalAbierto(true)}
                className="flex items-center gap-2 rounded-lg bg-hielo px-5 py-2.5 font-semibold text-noche transition-colors hover:bg-white"
              >
                <UploadCloud size={18} /> Cargar archivo CSV
              </button>
              <button
                onClick={usarEjemplo}
                disabled={procesando}
                className="flex items-center gap-2 rounded-lg border border-linea px-5 py-2.5 font-semibold text-hielo transition-colors hover:bg-hielo/10 disabled:opacity-60"
              >
                {procesando ? <Activity size={18} className="animate-pulse" /> : <Database size={18} />}
                Ver con datos de ejemplo
              </button>
            </div>
            {error && !modalAbierto && (
              <p className="mt-4 flex items-center gap-2 text-sm text-alerta">
                <CircleAlert size={16} /> {error}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="relative xl:pl-20">
            {/* Línea de ruta que une las secciones */}
            <div
              aria-hidden
              className="absolute bottom-24 left-[1.75rem] top-28 hidden w-px bg-gradient-to-b from-hielo/50 via-linea to-hielo/50 xl:block"
            />

            <div className="space-y-20">
              {/* Ficha del archivo */}
              <p className="text-sm text-bruma">
                Fuente: <span className="text-niebla">{archivo?.name}</span>
                <span className="mx-3 text-linea">|</span>
                {fmtNum(data.global.volumen_total)} pedidos con fecha prometida del {data.periodo.inicio} al {data.periodo.fin}
                {data.global.filas_descartadas > 0 && (
                  <span className="ml-3 text-riesgo">{data.global.filas_descartadas} filas descartadas por datos inválidos</span>
                )}
              </p>

              {/* 1. Resumen ejecutivo */}
              <Section id="resumen" numero={1} titulo="Resumen ejecutivo" titular={data.titulares.resumen}>
                <motion.div variants={contenedor} initial="oculto" animate="visible" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {kpis.otif_pct && (
                    <motion.div variants={elemento} className="md:col-span-2 xl:col-span-1 xl:row-span-2">
                      <KpiCard kpi={kpis.otif_pct} mesActual={data.periodo.mes_actual} mesAnterior={data.periodo.mes_anterior} destacado />
                    </motion.div>
                  )}
                  {data.kpis
                    .filter((k) => k.id !== "otif_pct")
                    .map((k) => (
                      <motion.div key={k.id} variants={elemento}>
                        <KpiCard kpi={k} mesActual={data.periodo.mes_actual} mesAnterior={data.periodo.mes_anterior} />
                      </motion.div>
                    ))}
                </motion.div>
                <p className="mt-3 text-sm text-bruma">
                  La variación compara {data.periodo.mes_actual?.toLowerCase()} contra {data.periodo.mes_anterior?.toLowerCase()}.
                  Verde: en meta. Ámbar: dentro de la tolerancia. Rosa: fuera de meta.
                </p>
                <div className="mt-10">
                  <h3 className="mb-4 font-display text-2xl font-semibold text-tinta">Hallazgos clave</h3>
                  <Insights items={data.hallazgos} />
                </div>
              </Section>

              {/* 2. Evolución */}
              <Section id="evolucion" numero={2} titulo="¿Cómo vamos en el tiempo?" titular={data.titulares.tendencia}>
                <TrendChart semanal={data.tendencia} mensual={data.mensual} meta={metaOtif} />
              </Section>

              {/* 3. Geografía */}
              <Section id="donde" numero={3} titulo="¿Dónde fallamos?" titular={data.titulares.geografia}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  <div className="lg:col-span-2">
                    <MapChart mapData={data.mapa} meta={metaOtif} />
                  </div>
                  <div className="lg:col-span-3">
                    <StateFailuresChart data={data.fallas_estado} />
                  </div>
                  <div className="lg:col-span-5">
                    <StateRankingTable data={data.mapa} />
                  </div>
                </div>
              </Section>

              {/* 4. Causas */}
              <Section id="porque" numero={4} titulo="¿Por qué fallamos?" titular={data.titulares.causas}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ParetoChart paretoData={data.pareto} />
                  </div>
                  <CategoryDonut data={data.categorias} />
                </div>
              </Section>

              {/* 5. Socios logísticos */}
              <Section id="socios" numero={5} titulo="Transportistas y centros de distribución" titular={data.titulares.socios}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                  <div className="xl:col-span-3">
                    <CarrierScorecard data={data.transportistas} meta={data.metas.on_time_pct?.meta ?? 93} />
                  </div>
                  <div className="xl:col-span-2">
                    <CedisPanel data={data.cedis} meta={data.metas.in_full_pct?.meta ?? 95} />
                  </div>
                </div>
              </Section>

              {/* 6. Finanzas y clientes */}
              <Section id="finanzas" numero={6} titulo="Impacto financiero y en clientes" titular={data.titulares.finanzas}>
                <div className="space-y-6">
                  <FinanceStrip g={data.global} />
                  <ClientImpactTable data={data.clientes} titular={data.titulares.clientes} />
                </div>
              </Section>

              {/* Detalle operativo (plegable, para el equipo de operación) */}
              <section aria-label="Análisis operativo detallado">
                <button
                  onClick={() => setVerDetalle((v) => !v)}
                  aria-expanded={verDetalle}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-linea bg-panel px-6 py-5 text-left transition-colors hover:bg-panel-2"
                >
                  <span>
                    <span className="block font-display text-xl font-semibold text-tinta">Análisis operativo detallado</span>
                    <span className="mt-0.5 block text-sm text-bruma">
                      Para el equipo de operación: concentración de causas, días de retraso, faltantes y tamaño de pedido.
                    </span>
                  </span>
                  <motion.span animate={{ rotate: verDetalle ? 180 : 0 }}>
                    <ChevronDown className="text-niebla" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {verDetalle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
                        <div className="lg:col-span-3">
                          <CauseHeatmap data={data.heatmap} />
                        </div>
                        <DelayHistogram data={data.distribucion_retraso} />
                        <ImpactChart data={data.impacto_faltantes} />
                        <OrderSizeChart data={data.tamano_pedido} meta={metaOtif} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* 7. Conclusiones y recomendaciones */}
              <Section
                id="acciones"
                numero={7}
                titulo="Conclusiones y recomendaciones"
                titular="Acciones priorizadas por su impacto estimado en los pedidos perfectos."
              >
                <Recommendations conclusiones={data.conclusiones} recomendaciones={data.recomendaciones} />
              </Section>

              {/* Destino: descarga del reporte (al final de la página) */}
              <Section
                id="descargar"
                destino
                titulo="Lleva el reporte a tu junta"
                titular={`Todo el análisis de ${data.periodo.etiqueta_corta} en documento y presentación, generados con texto, tablas y gráficas reales.`}
              >
                <ExportPanel exportando={exportando} onExportar={exportar} />
                {errorExportar && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-alerta">
                    <CircleAlert size={16} /> {errorExportar}
                  </p>
                )}
              </Section>

            </div>
          </div>
        )}

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-linea pt-6 text-sm text-bruma">
          <span>{data ? data.nota_datos : "Quasar Logistics, torre de control logística."}</span>
          <span>
            Built by{" "}
            <a
              href="https://quasar-devs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="enlace-quasar font-display text-base font-semibold"
            >
              QUASAR DEVS
              
            </a>
          </span>
        </footer>
      </div>

      <UploadModal
        abierto={modalAbierto}
        procesando={procesando}
        error={error}
        onCerrar={() => setModalAbierto(false)}
        onArchivo={procesar}
        onEjemplo={usarEjemplo}
      />
    </main>
  );
}
