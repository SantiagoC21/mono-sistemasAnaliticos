// src/types/analysis.ts

export interface FileMetadata {
  filename: string;
  rows: number;
  columns: string[];
  preview: Record<string, Record<string, any>>;
}

export interface ChartDataPoint {
  x: string | number;
  y: string | number;
  c?: number; // Cluster ID
  label?: string;
}

export interface AnalysisResult {
  // Generales
  mean?: number;
  std?: number;
  p_valor?: number;
  conclusion?: string;
  
  // K-Means
  num_clusters?: number;
  perfil_promedio?: Record<string, any>;
  plot_data?: ChartDataPoint[];

  // Reglas (Árboles)
  reglas_texto?: string;
  importancia_variables?: Record<string, number>;

  // Correlación
  matriz?: Array<{x: string, y: string, value: number}>;
  variables?: string[];
  
  // Series de Tiempo
  fechas?: string[];
  observado?: number[];
  tendencia?: number[];
  
  // Catch-all
  [key: string]: any; 
}

export interface ParetoItem {
  etiqueta: string;
  frecuencia: number;
  porcentaje: number;
  acumulado: number;
  clase: "A" | "B" | "C";
}

export interface ParetoResult {
  columna_analizada: string;
  total_registros: number;
  items: ParetoItem[];
}