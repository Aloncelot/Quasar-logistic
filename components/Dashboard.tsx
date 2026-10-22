"use client";

import { useEffect, useRef, useState } from "react";
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
import LanguageSwitch from "./LanguageSwitch";
import ServerSwitch, { AwsPanel, useEstadoAws } from "./ServerSwitch";
import Creditos from "./Creditos";
import { analizarArchivo, descargarReporte, obtenerEjemplo, FormatoReporte } from "./api";
import { cerrarSesion, Sesion } from "./auth";
import { useIdioma, useServidor, type Servidor } from "./preferencias";
import { useT } from "./i18n";
import { KPIData, fmtNum } from "./types";

const SECCIONES = ["resumen", "evolucion", "donde", "porque", "socios", "finanzas", "acciones", "descargar"];

const NOMBRE_SERVIDOR: Record<Servidor, string> = {
  azure: "Azure Container Apps",
  aws: "AWS EC2 · Docker",
};

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
  const t = useT();
  const [idioma] = useIdioma();
  const [servidor, setServidor] = useServidor();
  const { estado: estadoAws, refrescar: refrescarAws } = useEstadoAws();

  // Si se eligió AWS pero aún no está encendido, el análisis se resuelve en Azure
  const servidorActivo: Servidor = servidor === "aws" && estadoAws?.lista ? "aws" : "azure";

  const [data, setData] = useState<KPIData | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesadoEn, setProcesadoEn] = useState<{ servidor: Servidor; ms: number } | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exportando, setExportando] = useState<FormatoReporte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);
  const [verDetalle, setVerDetalle] = useState(false);
  const archivoRef = useRef<File | null>(null);

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

  // Al cambiar de idioma o de servidor se vuelve a analizar el archivo cargado
  useEffect(() => {
    const actual = archivoRef.current;
    if (!actual) return;
    let vigente = true;
    analizarArchivo(actual, servidorActivo, idioma, t.errores)
      .then(({ datos, ms }) => {
        if (!vigente) return;
        setData(datos);
        setProcesadoEn({ servidor: servidorActivo, ms });
      })
      .catch(() => {
        /* se conserva el último resultado mostrado */
      });
    return () => {
      vigente = false;
    };
    // t.errores cambia junto con el idioma
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioma, servidorActivo]);

  const procesar = async (nuevo: File) => {
    setError(null);
    if (!nuevo.name.toLowerCase().endsWith(".csv")) {
      setError(t.carga.soloCsv);
      setModalAbierto(true);
      return;
    }
    setProcesando(true);
    try {
      const { datos, ms } = await analizarArchivo(nuevo, servidorActivo, idioma, t.errores);
      archivoRef.current = nuevo;
      setData(datos);
      setArchivo(nuevo);
      setProcesadoEn({ servidor: servidorActivo, ms });
      setModalAbierto(false);
      setErrorExportar(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errores.procesar);
      setModalAbierto(true);
    } finally {
      setProcesando(false);
    }
  };

  const usarEjemplo = async () => {
    setError(null);
    setProcesando(true);
    try {
      await procesar(await obtenerEjemplo(servidorActivo, t.errores));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errores.ejemplo);
      setModalAbierto(true);
      setProcesando(false);
    }
  };

  const exportar = async (formato: FormatoReporte) => {
    if (!archivo) return;
    setErrorExportar(null);
    setExportando(formato);
    try {
      await descargarReporte(archivo, formato, servidorActivo, idioma, t.errores);
    } catch (err) {
      setErrorExportar(err instanceof Error ? err.message : t.errores.reporte);
    } finally {
      setExportando(null);
    }
  };

  const kpis = data ? Object.fromEntries(data.kpis.map((k) => [k.id, k])) : {};
  const metaOtif = data?.metas.otif_pct?.meta ?? 90;
  const mostrarPanelAws = servidor === "aws" && !estadoAws?.lista;

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
              <h1 className="font-display text-2xl font-semibold leading-none text-tinta">{t.encabezado.titulo}</h1>
              <p className="mt-1 text-sm text-niebla">
                {data ? t.encabezado.periodo(data.periodo.etiqueta) : t.encabezado.vacio}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ServerSwitch servidor={servidor} onCambiar={setServidor} estadoAws={estadoAws} />
            <LanguageSwitch />
            <button
              onClick={() => {
                setError(null);
                setModalAbierto(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-hielo px-4 py-2 text-sm font-semibold text-noche transition-colors hover:bg-white"
            >
              <UploadCloud size={17} />
              {data ? t.encabezado.cargarOtro : t.encabezado.cargar}
            </button>
            <div className="flex items-center gap-2 border-l border-linea pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 font-display text-base font-semibold text-hielo">
                {t.sesion[sesion.rol].slice(0, 1)}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm text-tinta">{t.sesion[sesion.rol]}</p>
                <p className="text-xs text-bruma">{sesion.rol === "admin" ? t.sesion.rolAdmin : t.sesion.rolInvitado}</p>
              </div>
              <button
                onClick={cerrarSesion}
                className="ml-1 rounded-lg p-2 text-niebla transition-colors hover:bg-panel-2 hover:text-tinta"
                title={t.sesion.salir}
                aria-label={t.sesion.salir}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {data && (
          <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 pb-3 text-sm sm:px-8" aria-label={t.encabezado.secciones}>
            {SECCIONES.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-niebla transition-colors hover:bg-panel-2 hover:text-tinta"
              >
                <span className="font-display text-xs font-semibold text-bruma">{String(i + 1).padStart(2, "0")}</span>
                {t.navegacion[i]}
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8">
        {mostrarPanelAws && (
          <AwsPanel estadoAws={estadoAws} onUsarAzure={() => setServidor("azure")} onRefrescar={refrescarAws} />
        )}

        {!data ? (
          /* Estado vacío */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-linea bg-panel/50 p-8 text-center"
          >
            <FileSpreadsheet size={56} className="mb-4 text-acero" />
            <h2 className="font-display text-3xl font-semibold text-tinta">{t.vacio.titulo}</h2>
            <p className="mt-3 max-w-lg text-niebla">{t.vacio.descripcion}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setModalAbierto(true)}
                className="flex items-center gap-2 rounded-lg bg-hielo px-5 py-2.5 font-semibold text-noche transition-colors hover:bg-white"
              >
                <UploadCloud size={18} /> {t.vacio.cargar}
              </button>
              <button
                onClick={usarEjemplo}
                disabled={procesando}
                className="flex items-center gap-2 rounded-lg border border-linea px-5 py-2.5 font-semibold text-hielo transition-colors hover:bg-hielo/10 disabled:opacity-60"
              >
                {procesando ? <Activity size={18} className="animate-pulse" /> : <Database size={18} />}
                {t.vacio.ejemplo}
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
                {t.ficha.fuente} <span className="text-niebla">{archivo?.name}</span>
                <span className="mx-3 text-linea">|</span>
                {t.ficha.pedidos(fmtNum(data.global.volumen_total, idioma), data.periodo.inicio, data.periodo.fin)}
                {procesadoEn && (
                  <>
                    <span className="mx-3 text-linea">|</span>
                    {t.ficha.procesado}{" "}
                    <span className="text-niebla">
                      {NOMBRE_SERVIDOR[procesadoEn.servidor]} ({fmtNum(procesadoEn.ms, idioma)} ms)
                    </span>
                  </>
                )}
                {data.global.filas_descartadas > 0 && (
                  <span className="ml-3 text-riesgo">{t.ficha.descartadas(data.global.filas_descartadas)}</span>
                )}
              </p>

              {/* 1. Resumen ejecutivo */}
              <Section id="resumen" numero={1} titulo={t.secciones.resumen} titular={data.titulares.resumen}>
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
                  {t.secciones.variacion(data.periodo.mes_actual ?? "", data.periodo.mes_anterior ?? "")}
                </p>
                <div className="mt-10">
                  <h3 className="mb-4 font-display text-2xl font-semibold text-tinta">{t.secciones.hallazgos}</h3>
                  <Insights items={data.hallazgos} />
                </div>
              </Section>

              {/* 2. Evolución */}
              <Section id="evolucion" numero={2} titulo={t.secciones.evolucion} titular={data.titulares.tendencia}>
                <TrendChart semanal={data.tendencia} mensual={data.mensual} meta={metaOtif} />
              </Section>

              {/* 3. Geografía */}
              <Section id="donde" numero={3} titulo={t.secciones.donde} titular={data.titulares.geografia}>
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
              <Section id="porque" numero={4} titulo={t.secciones.porque} titular={data.titulares.causas}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ParetoChart paretoData={data.pareto} />
                  </div>
                  <CategoryDonut data={data.categorias} />
                </div>
              </Section>

              {/* 5. Socios logísticos */}
              <Section id="socios" numero={5} titulo={t.secciones.socios} titular={data.titulares.socios}>
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
              <Section id="finanzas" numero={6} titulo={t.secciones.finanzas} titular={data.titulares.finanzas}>
                <div className="space-y-6">
                  <FinanceStrip g={data.global} />
                  <ClientImpactTable data={data.clientes} titular={data.titulares.clientes} />
                </div>
              </Section>

              {/* Detalle operativo (plegable, para el equipo de operación) */}
              <section aria-label={t.secciones.detalle}>
                <button
                  onClick={() => setVerDetalle((v) => !v)}
                  aria-expanded={verDetalle}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-linea bg-panel px-6 py-5 text-left transition-colors hover:bg-panel-2"
                >
                  <span>
                    <span className="block font-display text-xl font-semibold text-tinta">{t.secciones.detalle}</span>
                    <span className="mt-0.5 block text-sm text-bruma">{t.secciones.detalleSub}</span>
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
              <Section id="acciones" numero={7} titulo={t.secciones.acciones} titular={t.secciones.accionesSub}>
                <Recommendations conclusiones={data.conclusiones} recomendaciones={data.recomendaciones} />
              </Section>

              {/* Destino: descarga del reporte (al final de la página) */}
              <Section id="descargar" destino titulo={t.secciones.destino} titular={t.secciones.destinoSub(data.periodo.etiqueta_corta)}>
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

        <Creditos nota={data?.nota_datos} />
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
