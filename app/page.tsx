"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Activity, Package, Truck } from "lucide-react";

// Tipamos el JSON que vimos en image_3d4e0a.png
interface KPIData {
  global: {
    on_time_pct: number;
    in_full_pct: number;
    otif_pct: number;
  };
  desglose_cedis: {
    cedis: string;
    otif_porcentaje: number;
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<KPIData | null>(null);

  useEffect(() => {
    // Consumiendo tu API de FastAPI local
    fetch("http://18.223.124.192/api/kpi/otif")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);

  // Variantes de Framer Motion para orquestar la animación de entrada
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  if (!data) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      Cargando Torre de Control...
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-cyan-400">Torre de Control Logística</h1>
        <p className="text-slate-400">Rendimiento Operativo en Tiempo Real</p>
      </motion.div>

      {/* Grid de Tarjetas KPI con animaciones escalonadas */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-300 font-medium">On-Time (OT)</h2>
            <Truck className="text-cyan-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{data.global.on_time_pct}%</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-300 font-medium">In-Full (IF)</h2>
            <Package className="text-emerald-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{data.global.in_full_pct}%</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg border-b-4 border-b-indigo-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-300 font-medium">Global OTIF</h2>
            <Activity className="text-indigo-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{data.global.otif_pct}%</p>
        </motion.div>
      </motion.div>
    </main>
  );
}