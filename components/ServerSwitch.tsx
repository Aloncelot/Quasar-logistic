"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Server, Send, Loader2, CircleCheck, CircleAlert, RefreshCw } from "lucide-react";
import { consultarEstadoAws, solicitarDemoAws, type EstadoAws } from "./api";
import { useIdioma, type Servidor } from "./preferencias";
import { useT } from "./i18n";

/** Estado de la demo en AWS: undefined = consultando, null = control no disponible. */
export function useEstadoAws() {
  const [estado, setEstado] = useState<EstadoAws | null | undefined>(undefined);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vivo = true;
    let temporizador: ReturnType<typeof setTimeout>;
    const consultar = async () => {
      const resultado = await consultarEstadoAws();
      if (!vivo) return;
      setEstado(resultado);
      // Mientras arranca o se apaga se consulta seguido; en reposo, cada 30 s
      const transicion = resultado && !resultado.lista && resultado.estado !== "stopped";
      temporizador = setTimeout(consultar, transicion ? 8000 : 30000);
    };
    consultar();
    return () => {
      vivo = false;
      clearTimeout(temporizador);
    };
  }, [version]);

  const refrescar = useCallback(() => setVersion((v) => v + 1), []);
  return { estado, refrescar };
}

function claveEstado(estado: EstadoAws | null | undefined): string {
  if (estado === undefined) return "consultando";
  if (estado === null) return "noDisponible";
  if (estado.lista) return "lista";
  if (estado.estado === "pending" || estado.estado === "running") return "iniciando";
  return "apagada";
}

const COLOR_ESTADO: Record<string, string> = {
  consultando: "bg-bruma",
  lista: "bg-ok",
  iniciando: "bg-riesgo animate-pulse",
  apagada: "bg-acero",
  noDisponible: "bg-alerta",
};

/** Selector del servidor de análisis: Azure (siempre disponible) o AWS (bajo solicitud). */
export default function ServerSwitch({
  servidor,
  onCambiar,
  estadoAws,
}: {
  servidor: Servidor;
  onCambiar: (s: Servidor) => void;
  estadoAws: EstadoAws | null | undefined;
}) {
  const t = useT();
  const claveAws = claveEstado(estadoAws);
  const opciones = [
    { id: "azure" as const, Icono: Cloud, nombre: t.servidor.azure, detalle: t.servidor.azureDetalle, estado: "lista" },
    { id: "aws" as const, Icono: Server, nombre: t.servidor.aws, detalle: t.servidor.awsDetalle, estado: claveAws },
  ];

  return (
    <div role="radiogroup" aria-label={t.servidor.etiqueta} className="inline-flex gap-1 rounded-lg border border-linea bg-panel p-1">
      {opciones.map(({ id, Icono, nombre, detalle, estado }) => {
        const activo = servidor === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={activo}
            onClick={() => onCambiar(id)}
            title={`${detalle} · ${t.servidor.estados[estado]}`}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors ${
              activo ? "bg-hielo/15 text-hielo ring-1 ring-hielo/40" : "text-niebla hover:bg-panel-2 hover:text-tinta"
            }`}
          >
            <Icono size={16} aria-hidden />
            <span className="font-display text-sm font-semibold">{nombre}</span>
            <span className={`h-2 w-2 rounded-full ${COLOR_ESTADO[estado]}`} aria-hidden />
            <span className="sr-only">{t.servidor.estados[estado]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Aviso y formulario cuando se elige AWS y la instancia no está encendida. */
export function AwsPanel({
  estadoAws,
  onUsarAzure,
  onRefrescar,
}: {
  estadoAws: EstadoAws | null | undefined;
  onUsarAzure: () => void;
  onRefrescar: () => void;
}) {
  const t = useT();
  const [idioma] = useIdioma();
  const [campos, setCampos] = useState({ nombre: "", correo: "", empresa: "", mensaje: "", sitio: "" });
  const [envio, setEnvio] = useState<"inicial" | "enviando" | "enviado" | "error">("inicial");
  const clave = claveEstado(estadoAws);
  const iniciando = clave === "iniciando";

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvio("enviando");
    const ok = await solicitarDemoAws({ ...campos, idioma });
    setEnvio(ok ? "enviado" : "error");
  };

  const campo = "w-full rounded-lg border border-linea bg-noche/60 px-3 py-2.5 text-sm text-tinta outline-none transition placeholder:text-bruma focus:border-hielo focus:ring-2 focus:ring-hielo/20";

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 overflow-hidden rounded-2xl border border-hielo/25 bg-gradient-to-br from-panel-2 to-panel"
      aria-live="polite"
    >
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-hielo">
            <Server size={20} aria-hidden />
            <span className="font-display text-lg font-semibold">AWS · EC2 + Docker</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-tinta">
            {iniciando ? t.aws.iniciandoTitulo : t.aws.titulo}
          </h2>
          <p className="mt-3 leading-relaxed text-niebla">{iniciando ? t.aws.iniciandoDetalle : t.aws.descripcion}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={onUsarAzure} className="rounded-lg border border-linea px-4 py-2 text-sm font-semibold text-hielo transition-colors hover:bg-hielo/10">
              {t.aws.usarAzure}
            </button>
            <button onClick={onRefrescar} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-niebla transition-colors hover:text-tinta">
              <RefreshCw size={15} aria-hidden /> {t.aws.reintentar}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {iniciando ? (
              <motion.div key="iniciando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center gap-3 text-riesgo">
                <Loader2 className="animate-spin" aria-hidden /> {t.servidor.estados.iniciando}
              </motion.div>
            ) : envio === "enviado" ? (
              <motion.div key="enviado" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full items-start gap-3 rounded-xl border border-ok/30 bg-ok/10 p-5 text-ok">
                <CircleCheck className="mt-0.5 shrink-0" aria-hidden />
                <p>{t.aws.enviado}</p>
              </motion.div>
            ) : (
              <motion.form key="formulario" onSubmit={enviar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-niebla">{t.aws.nombre}</span>
                  <input required maxLength={80} value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} className={`mt-1 ${campo}`} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="text-xs text-niebla">{t.aws.correo}</span>
                  <input required type="email" maxLength={254} value={campos.correo} onChange={(e) => setCampos({ ...campos, correo: e.target.value })} className={`mt-1 ${campo}`} autoComplete="email" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-niebla">{t.aws.empresa}</span>
                  <input maxLength={120} value={campos.empresa} onChange={(e) => setCampos({ ...campos, empresa: e.target.value })} className={`mt-1 ${campo}`} autoComplete="organization" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-niebla">{t.aws.mensaje}</span>
                  <textarea rows={2} maxLength={1000} value={campos.mensaje} onChange={(e) => setCampos({ ...campos, mensaje: e.target.value })} className={`mt-1 resize-none ${campo}`} />
                </label>
                {/* Campo trampa para bots: oculto para personas */}
                <input tabIndex={-1} aria-hidden autoComplete="off" value={campos.sitio} onChange={(e) => setCampos({ ...campos, sitio: e.target.value })} className="hidden" />
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={envio === "enviando" || estadoAws === null}
                    className="flex items-center gap-2 rounded-lg bg-hielo px-5 py-2.5 font-semibold text-noche transition-colors hover:bg-white disabled:opacity-60"
                  >
                    {envio === "enviando" ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />}
                    {envio === "enviando" ? t.aws.enviando : t.aws.enviar}
                  </button>
                  {(envio === "error" || estadoAws === null) && (
                    <span className="flex items-center gap-2 text-sm text-alerta">
                      <CircleAlert size={16} aria-hidden /> {estadoAws === null ? t.servidor.estados.noDisponible : t.aws.error}
                    </span>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
