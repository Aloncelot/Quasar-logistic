// Contrato de datos entre FastAPI (POST /api/analisis) y el dashboard

export type Semaforo = "verde" | "ambar" | "rojo";

export interface Periodo {
  inicio: string;
  fin: string;
  etiqueta: string; // "Q3 2026 (julio – septiembre)"
  etiqueta_corta: string; // "Q3 2026"
  mes_actual: string | null;
  mes_anterior: string | null;
}

export interface KpiTarjeta {
  id: string;
  nombre: string;
  descripcion: string;
  valor: number;
  unidad: string; // "%" | "días"
  meta: number;
  mayor_es_mejor: boolean;
  estado: Semaforo;
  brecha: number;
  valor_mes_actual: number | null;
  valor_mes_anterior: number | null;
  variacion: number | null;
  mejora: boolean | null;
}

export interface MetaInfo {
  nombre: string;
  meta: number;
  unidad: string;
  mayor_es_mejor: boolean;
  tolerancia: number;
}

export interface Indicadores {
  volumen: number;
  otif_pct: number;
  on_time_pct: number;
  in_full_pct: number;
  fill_rate_pct: number;
  dias_retraso_prom: number;
  costo_flete_pct: number;
  valor_incidencias_pct: number;
}

export interface Global extends Indicadores {
  volumen_total: number;
  pedidos_perfectos: number;
  pedidos_con_incidencia: number;
  pedidos_tarde: number;
  pedidos_incompletos: number;
  pedidos_para_meta: number;
  unidades_solicitadas: number;
  unidades_faltantes: number;
  entregas_anticipadas_pct: number;
  ciclo_prom_dias: number;
  valor_total_mxn: number;
  valor_incidencias_mxn: number;
  valor_no_entregado_mxn: number;
  costo_flete_mxn: number;
  filas_descartadas: number;
}

export interface MensualItem extends Indicadores {
  mes: string;
  etiqueta: string;
}

export interface EstadoKPI extends Indicadores {
  Estado_Destino: string;
  pedidos_con_incidencia: number;
  valor_incidencias_mxn: number;
  causa_principal: string | null;
  estado_semaforo: Semaforo;
  tendencia: (number | null)[]; // OTIF % semanal del estado
}

export interface ParetoItem {
  Motivo: string;
  Categoria: string;
  Frecuencia: number;
  Pct: number;
  Pct_Acumulado: number;
}

export interface TendenciaItem {
  Semana: string; // YYYY-MM-DD (lunes de la semana)
  volumen: number;
  on_time_pct: number;
  in_full_pct: number;
  otif_pct: number;
  parcial: boolean;
}

export interface DistribucionItem {
  dias: number; // <0 anticipado, 0 puntual, >0 tarde
  pedidos: number;
}

export interface FallasEstadoItem {
  Estado_Destino: string;
  solo_retraso: number;
  solo_incompleto: number;
  ambos: number;
}

export interface CategoriaItem {
  categoria: string;
  pedidos: number;
  pct: number;
}

export interface HeatmapData {
  estados: string[];
  causas: string[];
  valores: number[][]; // [causa][estado]
}

export interface ImpactoItem {
  Causa: string;
  unidades: number;
  pedidos: number;
  valor_mxn: number;
}

export interface TamanoItem {
  Tamano: string;
  volumen: number;
  on_time_pct: number;
  in_full_pct: number;
  otif_pct: number;
  pct_faltantes: number;
}

export interface TransportistaItem extends Indicadores {
  Transportista: string;
  participacion_pct: number;
  costo_por_pedido_mxn: number;
  estados: string[];
  estado_semaforo: Semaforo;
}

export interface CedisItem extends Indicadores {
  CEDIS_Origen: string;
  unidades_faltantes: number;
  valor_no_entregado_mxn: number;
  causa_principal: string | null;
  estado_semaforo: Semaforo;
}

export interface ClienteItem {
  Cliente: string;
  Canal: string;
  volumen: number;
  otif_pct: number;
  in_full_pct: number;
  on_time_pct: number;
  valor_total_mxn: number;
  valor_incidencias_mxn: number;
  estado_semaforo: Semaforo;
}

export interface Hallazgo {
  tipo: "alerta" | "positivo" | "info";
  titulo: string;
  detalle: string;
}

export interface Recomendacion {
  titulo: string;
  detalle: string;
  responsable: string;
  plazo: string;
  impacto_pts: number | null;
  impacto: string;
}

export interface Titulares {
  resumen?: string;
  tendencia?: string;
  geografia?: string;
  causas?: string;
  socios?: string;
  almacen?: string;
  finanzas?: string;
  clientes?: string;
}

export interface KPIData {
  periodo: Periodo;
  global: Global;
  kpis: KpiTarjeta[];
  metas: Record<string, MetaInfo>;
  mensual: MensualItem[];
  tendencia: TendenciaItem[];
  mapa: EstadoKPI[];
  pareto: ParetoItem[];
  categorias: CategoriaItem[];
  fallas_estado: FallasEstadoItem[];
  heatmap: HeatmapData;
  impacto_faltantes: ImpactoItem[];
  distribucion_retraso: DistribucionItem[];
  tamano_pedido: TamanoItem[];
  transportistas: TransportistaItem[];
  cedis: CedisItem[];
  clientes: ClienteItem[];
  titulares: Titulares;
  hallazgos: Hallazgo[];
  conclusiones: string[];
  recomendaciones: Recomendacion[];
  nota_datos: string;
}

// Paleta fría para gráficas (mismos valores que los tokens de app/globals.css)
export const PALETA = {
  noche: "#070d1a",
  panel: "#0c1526",
  panel2: "#111d33",
  linea: "#1c2a44",
  tinta: "#e6edf7",
  niebla: "#93a2bc",
  bruma: "#5e6e8c",
  hielo: "#9ccbff",
  cobalto: "#4c82f7",
  artico: "#3cc4b4",
  lavanda: "#a3a6f5",
  acero: "#6c84ae",
};

// Series estándar del cumplimiento: se usan igual en todas las gráficas
export const SERIES = {
  otif: { nombre: "Pedidos perfectos (OTIF)", color: PALETA.hielo },
  a_tiempo: { nombre: "A tiempo", color: PALETA.cobalto },
  completos: { nombre: "Completos", color: PALETA.artico },
  meta: { color: "#e6edf7" },
};

// Semáforo: los únicos tonos que se salen de la paleta fría, para que el estado se lea de inmediato
export const SEMAFORO: Record<Semaforo, { etiqueta: string; texto: string; fondo: string; solido: string }> = {
  verde: { etiqueta: "En meta", texto: "text-ok", fondo: "bg-ok/10", solido: "#38c7a1" },
  ambar: { etiqueta: "En riesgo", texto: "text-riesgo", fondo: "bg-riesgo/10", solido: "#e7b85c" },
  rojo: { etiqueta: "Fuera de meta", texto: "text-alerta", fondo: "bg-alerta/10", solido: "#f0748e" },
};

export const COLOR_CATEGORIA: Record<string, string> = {
  Transporte: PALETA.cobalto,
  "Almacén": PALETA.lavanda,
  Otro: PALETA.acero,
};

// Formato de moneda compacto: $46.9 M, $850 mil
export const fmtMxn = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toLocaleString("es-MX", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} M`;
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000).toLocaleString("es-MX")} mil`;
  return `$${Math.round(v).toLocaleString("es-MX")}`;
};

export const fmtNum = (v: number) => v.toLocaleString("es-MX");

// Estilo compartido de tooltips de Recharts
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: PALETA.panel,
    borderColor: PALETA.linea,
    color: PALETA.tinta,
    borderRadius: "10px",
    fontSize: "13px",
    boxShadow: "0 12px 32px rgba(2, 6, 23, 0.6)",
  },
  labelStyle: { color: PALETA.tinta, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: PALETA.niebla },
  cursor: { fill: PALETA.linea, opacity: 0.5 },
};

export const axisTick = { fill: "#7f8fad", fontSize: 12 };
export const gridStroke = PALETA.linea;
