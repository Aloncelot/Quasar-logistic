"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Activity, CircleAlert, Database, X } from "lucide-react";
import { useT } from "./i18n";

/** Ventana para cargar el CSV (arrastrar y soltar, explorador o datos de ejemplo). */
export default function UploadModal({
  abierto,
  procesando,
  error,
  onCerrar,
  onArchivo,
  onEjemplo,
}: {
  abierto: boolean;
  procesando: boolean;
  error: string | null;
  onCerrar: () => void;
  onArchivo: (archivo: File) => void;
  onEjemplo: () => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const detener = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-noche/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !procesando && onCerrar()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-panel border border-linea p-8 rounded-2xl w-full max-w-lg relative shadow-2xl"
          >
            <button
              onClick={onCerrar}
              disabled={procesando}
              className="absolute top-4 right-4 text-niebla hover:text-tinta cursor-pointer"
              aria-label={t.carga.cerrar}
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl font-semibold text-tinta mb-1">{t.carga.titulo}</h2>
            <p className="text-niebla text-sm mb-6">
              {t.carga.descripcion}
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) onArchivo(archivo);
                e.target.value = "";
              }}
            />

            <div
              onClick={() => !procesando && inputRef.current?.click()}
              onDragEnter={(e) => {
                detener(e);
                setArrastrando(true);
              }}
              onDragOver={(e) => {
                detener(e);
                e.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={(e) => {
                detener(e);
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setArrastrando(false);
              }}
              onDrop={(e) => {
                detener(e);
                setArrastrando(false);
                const archivo = e.dataTransfer.files?.[0];
                if (archivo) onArchivo(archivo);
              }}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                arrastrando
                  ? "border-hielo bg-hielo/10 scale-[1.01]"
                  : "border-linea hover:border-hielo/50 bg-noche/60"
              }`}
            >
              {procesando ? (
                <div className="text-hielo animate-pulse flex flex-col items-center">
                  <Activity size={48} className="mb-3" />
                  <p className="font-medium">{t.carga.analizando}</p>
                </div>
              ) : (
                <>
                  <UploadCloud size={48} className={`mb-3 ${arrastrando ? "text-hielo" : "text-bruma"}`} />
                  <p className="text-tinta font-medium text-center">{t.carga.soltar}</p>
                  <p className="text-niebla text-sm mt-1">{t.carga.buscar}</p>
                </>
              )}
            </div>

            <button
              onClick={onEjemplo}
              disabled={procesando}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-hielo border border-linea hover:bg-hielo/10 rounded-lg py-2.5 transition cursor-pointer disabled:opacity-50"
            >
              <Database size={16} /> {t.carga.ejemplo}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-alerta/10 border border-alerta/40 rounded-lg flex items-center gap-2 text-alerta text-sm">
                <CircleAlert size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
