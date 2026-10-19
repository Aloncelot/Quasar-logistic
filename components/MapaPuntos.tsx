"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FILAS_MAPA, CIUDADES, RUTAS } from "./mapaMundi";

const COLUMNAS = FILAS_MAPA[0].length;
const FILAS = FILAS_MAPA.length;

// Generador pseudoaleatorio con semilla: el parpadeo es distinto por punto pero igual en cada carga
function semilla(n: number) {
  let t = n + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface Punto {
  x: number; // en celdas (centro)
  y: number;
  fase: number;
  velocidad: number;
  base: number;
}

const PUNTOS: Punto[] = FILAS_MAPA.flatMap((fila, i) =>
  [...fila].flatMap((c, j) =>
    c === "1"
      ? [{
          x: j + 0.5,
          y: i + 0.5,
          fase: semilla(i * 1000 + j) * Math.PI * 2,
          velocidad: 0.35 + semilla(i * 7919 + j * 31) * 0.55,
          base: 0.14 + semilla(j * 4099 + i) * 0.12,
        }]
      : []
  )
);

const centro = (k: number) => ({ x: CIUDADES[k].col + 0.5, y: CIUDADES[k].fila + 0.5 });

// Arcos curvos entre ciudades (siempre se arquean hacia el norte)
const ARCOS = RUTAS.map(([a, b]) => {
  const p1 = centro(a);
  const p2 = centro(b);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const largo = Math.hypot(dx, dy);
  let nx = -dy / largo;
  let ny = dx / largo;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const curva = largo * 0.22;
  return {
    id: `${a}-${b}`,
    d: `M${p1.x} ${p1.y} Q ${mx + nx * curva} ${my + ny * curva} ${p2.x} ${p2.y}`,
  };
});

/** Lienzo con los puntos de tierra que se encienden y apagan suavemente. */
function LienzoPuntos() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = lienzo.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ancho = 0;
    let alto = 0;
    let cuadro = 0;

    const dibujar = (t: number) => {
      const celda = ancho / COLUMNAS;
      const radio = Math.max(0.8, celda * 0.17);
      ctx.clearRect(0, 0, ancho, alto);
      ctx.fillStyle = "#e2e8f0";
      for (const p of PUNTOS) {
        const ola = 0.5 + 0.5 * Math.sin(t * p.velocidad + p.fase);
        ctx.globalAlpha = reducido ? p.base + 0.08 : p.base + 0.6 * ola ** 6;
        ctx.beginPath();
        ctx.arc(p.x * celda, p.y * celda, radio, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = canvas.clientWidth;
      alto = canvas.clientHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducido) dibujar(0);
    };

    const observador = new ResizeObserver(ajustar);
    observador.observe(canvas);
    ajustar();

    const animar = (ms: number) => {
      dibujar(ms / 1000);
      cuadro = requestAnimationFrame(animar);
    };
    if (!reducido) cuadro = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
    };
  }, []);

  return <canvas ref={lienzo} className="absolute inset-0 h-full w-full" aria-hidden />;
}

/** Fondo del acceso: mapamundi de puntos con las rutas animadas encima. */
export default function MapaPuntos() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Resplandor frío detrás del mapa */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_45%,rgba(14,116,144,0.28),transparent_60%)]" />

      {/* El mapa conserva su proporción y cubre la pantalla sin deformarse */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `max(100vw, calc(82vh * ${COLUMNAS / FILAS}))`, aspectRatio: `${COLUMNAS} / ${FILAS}` }}
      >
        <LienzoPuntos />
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${COLUMNAS} ${FILAS}`}>
          {ARCOS.map((arco, i) => (
            <g key={arco.id}>
              <path d={arco.d} stroke="#164e63" strokeWidth={0.07} fill="none" />
              <motion.path
                d={arco.d}
                stroke="#22d3ee"
                strokeWidth={0.12}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
                transition={{ duration: 3.2, delay: i * 0.45, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
              />
            </g>
          ))}
          {CIUDADES.map((c, i) => (
            <g key={c.nombre}>
              <motion.circle
                cx={c.col + 0.5}
                cy={c.fila + 0.5}
                r={0.9}
                fill="#22d3ee"
                initial={{ opacity: 0.25, scale: 0.6 }}
                animate={{ opacity: [0.25, 0, 0.25], scale: [0.6, 1.6, 0.6] }}
                transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
              />
              <circle cx={c.col + 0.5} cy={c.fila + 0.5} r={i === 0 ? 0.42 : 0.3} fill="#67e8f9" />
            </g>
          ))}
        </svg>
      </div>

      {/* Velo oscuro detrás del texto de bienvenida para mantener la lectura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_28%_50%,rgba(2,6,23,0.82),transparent_70%)]" />
    </div>
  );
}
