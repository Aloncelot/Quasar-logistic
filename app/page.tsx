"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Activity, Package, Truck, Moon } from "lucide-react";

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
  // 1. Agregamos el estado para detectar si el servidor duerme
  const [isServerAsleep, setIsServerAsleep] = useState(false); 

  useEffect(() => {
    fetch("/api/kpi/otif")
      .then((res) => {
        // 2. Si Vercel devuelve un 504 o la API falla, lanzamos el error
        if (!res.ok) throw new Error("Servidor EC2 apagado o inaccesible");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        // 3. Atrapamos el error y cambiamos el estado
        setIsServerAsleep(true); 
      });
  }, []);

  // Framer Motion para animación de entrada
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

  // 4. Pantalla de Degradación Elegante (Servidor en Reposo)
  if (isServerAsleep) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md text-center"
        >
          <div className="flex justify-center mb-4">
            <Moon className="text-indigo-400" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-3">Servidor en Reposo</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Para optimizar recursos en la nube, el motor de procesamiento de datos en AWS se encuentra pausado. 
          </p>          
          <a
            href="mailto:arch.alonso.correa@gmail.com?subject=Solicitud%20de%20encendido:%20API%20Quasar%20Logistics&body=Hola%20Alonso,%20estoy%20viendo%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20ver%20la%20Torre%20de%20Control%20funcionando.%20%C2%BFPodr%C3%ADas%20encender%20el%20servidor%20EC2%3F"
            className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
          >
            Notificar para encender sistema
          </a>
        </motion.div>
      </div>
    );
  }

  // Pantalla de Carga Original
  if (!data) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        Cargando Torre de Control...
      </motion.div>
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

      {/* Grid de Tarjetas KPI */}
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