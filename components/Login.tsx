"use client";

import { useState } from "react";
import { motion, AnimatePresence, useAnimate, type Variants } from "framer-motion";
import {
  Truck, User, Lock, Eye, EyeOff, LogIn, UserRound, Loader2, CircleAlert, ShieldCheck, ChartColumn, FileText,
  KeyRound,
} from "lucide-react";
import { iniciarSesion, entrarComoInvitado, CREDENCIALES_DEMO } from "./auth";
import MapaPuntos from "./MapaPuntos";

const BENEFICIOS = [
  { icono: ChartColumn, texto: "Indicadores OTIF con metas y semáforo" },
  { icono: ShieldCheck, texto: "Hallazgos, conclusiones y recomendaciones" },
  { icono: FileText, texto: "Reporte ejecutivo en PDF y PowerPoint" },
];

const contenedor: Variants = {
  oculto: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};
const elemento: Variants = {
  oculto: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState<"usuario" | "invitado" | null>(null);
  const [tarjeta, animar] = useAnimate();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEntrando("usuario");
    // Pequeña pausa para que la transición se perciba
    await new Promise((r) => setTimeout(r, 650));
    if (!iniciarSesion(usuario, contrasena)) {
      setEntrando(null);
      setError("Usuario o contraseña incorrectos.");
      animar(tarjeta.current, { x: [0, -12, 12, -8, 8, -4, 4, 0] }, { duration: 0.45 });
    }
  };

  const invitado = async () => {
    setError(null);
    setEntrando("invitado");
    await new Promise((r) => setTimeout(r, 450));
    entrarComoInvitado();
  };

  const usarDemo = () => {
    setUsuario(CREDENCIALES_DEMO.usuario);
    setContrasena(CREDENCIALES_DEMO.contrasena);
    setError(null);
  };

  return (
    <main className="relative min-h-screen bg-abismo text-white overflow-hidden flex items-center justify-center p-4 sm:p-8">
      <MapaPuntos />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Panel de presentación */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_30px_#22d3ee40]">
              <Truck className="text-cyan-300" size={26} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">Quasar Logistics</p>
              <p className="text-sm text-slate-400 mt-1">Torre de control logística</p>
            </div>
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.01em] text-balance">
            Convierte tu reporte de entregas en decisiones de negocio.
          </h1>
          <p className="text-slate-300/80 text-lg mt-5 max-w-md leading-relaxed">
            Carga el reporte de SAP y obtén en segundos el diagnóstico de cumplimiento de tu operación logística.
          </p>
          <motion.ul variants={contenedor} initial="oculto" animate="visible" className="mt-8 space-y-3">
            {BENEFICIOS.map(({ icono: Icono, texto }) => (
              <motion.li key={texto} variants={elemento} className="flex items-center gap-3 text-slate-300">
                <span className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  <Icono size={16} className="text-cyan-300" />
                </span>
                {texto}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Tarjeta de acceso */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
          className="w-full max-w-md mx-auto"
        >
          <div
            ref={tarjeta}
            className="bg-slate-950/75 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-8 shadow-2xl shadow-black/60"
          >
            <motion.div variants={contenedor} initial="oculto" animate="visible">
              <motion.div variants={elemento} className="lg:hidden flex items-center gap-2 mb-6">
                <Truck className="text-cyan-300" size={22} />
                <span className="font-display text-xl font-semibold">Quasar Logistics</span>
              </motion.div>
              <motion.h2 variants={elemento} className="font-display text-3xl font-semibold">
                Iniciar sesión
              </motion.h2>
              <motion.p variants={elemento} className="text-slate-400 text-sm mt-1 mb-6">
                Accede a la torre de control logística.
              </motion.p>

              <form onSubmit={enviar} className="space-y-4">
                <motion.label variants={elemento} className="block">
                  <span className="text-xs font-medium text-slate-400">Usuario</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950/60 border border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-lg px-3 transition">
                    <User size={18} className="text-slate-500" />
                    <input
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      autoComplete="username"
                      placeholder="Tu usuario"
                      className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </motion.label>

                <motion.label variants={elemento} className="block">
                  <span className="text-xs font-medium text-slate-400">Contraseña</span>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950/60 border border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-lg px-3 transition">
                    <Lock size={18} className="text-slate-500" />
                    <input
                      type={verContrasena ? "text" : "password"}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setVerContrasena((v) => !v)}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.label>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                        <CircleAlert size={16} className="shrink-0" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  variants={elemento}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={entrando !== null}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-70 text-slate-950 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait transition-colors"
                >
                  {entrando === "usuario" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {entrando === "usuario" ? "Verificando..." : "Entrar"}
                </motion.button>
              </form>

              <motion.div variants={elemento} className="flex items-center gap-3 my-5 text-xs text-slate-500">
                <span className="flex-1 h-px bg-slate-700" /> o <span className="flex-1 h-px bg-slate-700" />
              </motion.div>

              <motion.button
                variants={elemento}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={invitado}
                disabled={entrando !== null}
                className="w-full border border-slate-600 hover:border-cyan-500/60 hover:bg-slate-800/60 text-slate-200 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait transition-colors"
              >
                {entrando === "invitado" ? <Loader2 size={18} className="animate-spin" /> : <UserRound size={18} />}
                Entrar como invitado
              </motion.button>

              <motion.button
                variants={elemento}
                type="button"
                onClick={usarDemo}
                className="mt-5 w-full text-left text-xs text-slate-400 bg-slate-800/50 border border-dashed border-slate-700 hover:border-cyan-600/60 rounded-lg px-3 py-2.5 flex items-start gap-2 cursor-pointer transition"
              >
                <KeyRound size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                <span>
                  Acceso de demostración: usuario <code className="text-cyan-300">{CREDENCIALES_DEMO.usuario}</code> ·
                  contraseña <code className="text-cyan-300">{CREDENCIALES_DEMO.contrasena}</code>. Haz clic para
                  llenarlo.
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
