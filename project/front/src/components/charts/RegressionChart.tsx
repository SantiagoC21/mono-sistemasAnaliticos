import React from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult;
}

const RegressionChart: React.FC<Props> = ({ data }) => {
  // Validar que existan los datos necesarios
  if (!data.grafico_prediccion || !data.metrica_r2) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
        No hay datos de predicción disponibles.
      </div>
    );
  }

  const realValues = data.grafico_prediccion.real || [];
  const predValues = data.grafico_prediccion.predicho || [];

  // Transformar datos para Recharts (Merge de arrays)
  const chartData = realValues.map((val: number, i: number) => ({
    index: i + 1,
    Real: val,
    Predicción: predValues[i] || 0
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Evaluación del Modelo: Real vs Predicho</h3>
        <div style={styles.badges}>
          <span style={styles.badgeR2}>R²: {((data.metrica_r2 ?? 0) * 100).toFixed(2)}%</span>
          <span style={styles.badgeError}>MSE: {data.error_mse?.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="index" 
              label={{ value: 'Muestras de Prueba (Test Set)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8' }}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Valor', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
            
            <Legend verticalAlign="top" height={36} iconType="circle"/>

            {/* LÍNEA REAL (Sólida y con Área suave) */}
            <Area 
              type="monotone" 
              dataKey="Real" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorReal)" 
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />

            {/* LÍNEA PREDICCIÓN (Punteada y Diferente Color) */}
            <Line 
              type="monotone" 
              dataKey="Predicción" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              strokeDasharray="5 5" 
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- TOOLTIP PERSONALIZADO ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length >= 2) {
    const real = payload[0]?.value ?? 0;
    const pred = payload[1]?.value ?? 0;
    const diff = pred - real;
    const errorPerc = real !== 0 ? (Math.abs(diff) / Math.abs(real)) * 100 : 0;

    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipTitle}>Muestra #{label}</p>
        <div style={styles.tooltipRow}>
          <span style={{color: '#3b82f6'}}>● Real:</span>
          <strong>{real.toLocaleString()}</strong>
        </div>
        <div style={styles.tooltipRow}>
          <span style={{color: '#f59e0b'}}>● Predicho:</span>
          <strong>{pred.toLocaleString()}</strong>
        </div>
        <div style={{ marginTop: 8, borderTop: '1px solid #334155', paddingTop: 8, fontSize: '0.85rem', color: '#cbd5e1' }}>
          Diferencia: {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({errorPerc.toFixed(1)}%)
        </div>
      </div>
    );
  }
  return null;
};

// --- ESTILOS CSS (Tailwind-like) ---
const styles = {
  container: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  badges: {
    display: 'flex',
    gap: '12px',
  },
  badgeR2: {
    background: '#ecfdf5',
    color: '#059669',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: '1px solid #a7f3d0',
  },
  badgeError: {
    background: '#fff1f2',
    color: '#be123c',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: '1px solid #fecdd3',
  },
  tooltip: {
    background: '#0f172a',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    minWidth: '150px',
  },
  tooltipTitle: {
    margin: '0 0 8px 0',
    fontWeight: 600,
    color: '#94a3b8',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: '0.95rem',
  }
};

export default RegressionChart;