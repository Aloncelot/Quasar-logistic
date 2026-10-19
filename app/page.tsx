"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Truck } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import { useSesion } from "@/components/auth";

export default function Home() {
  const sesion = useSesion();

  // Mientras se lee la sesión guardada mostramos una pantalla neutra (evita parpadeos)
  if (sesion === undefined) {
    return (
      <main className="min-h-screen bg-abismo flex items-center justify-center">
        <Truck className="text-cyan-500/60 animate-pulse" size={40} />
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {sesion ? (
        <motion.div
          key="tablero"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Dashboard sesion={sesion} />
        </motion.div>
      ) : (
        <motion.div
          key="acceso"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          transition={{ duration: 0.35 }}
        >
          <Login />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
