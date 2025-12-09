import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart
} from 'recharts';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult;
}

const TimeSeriesChart: React.FC<Props> = ({ data }) => {
  const fechas = data.fechas || [];
  const observado = data.observado || [];
  const tendencia = data.tendencia || [];
  const estacionalidad = data.estacionalidad || [];
  const residuo = data.residuo || [];

  // 1. Fusionar datos para Recharts
  const chartData = fechas.map((fecha: string, i: number) => ({
    fecha,
    observado: observado[i],
    tendencia: tendencia[i],
    estacionalidad: estacionalidad[i],
    residuo: residuo[i]
  }));

  // Formateador de fecha simple
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    } catch { return dateStr; }
  };

  // Estilos de Ejes comunes
  const commonXAxis = { dataKey: "fecha", tickFormatter: formatDate, minTickGap: 30, tick: { fontSize: 11, fill: '#94a3b8' } };
  const commonYAxis = { width: 40, tick: { fontSize: 11, fill: '#94a3b8' } };
  const commonGrid = { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. GRÁFICO PRINCIPAL: REALIDAD VS TENDENCIA */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h4 style={styles.title}>📈 Análisis de Tendencia</h4>
          <span style={styles.tagPrimary}>Lo más importante</span>
        </div>
        <p style={styles.desc}>
          La línea <strong style={{color:'#f59e0b'}}>Naranja</strong> muestra hacia dónde va realmente tu negocio, eliminando el ruido y las temporadas.
        </p>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} syncId="timeSeriesSync" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...commonGrid} />
              <XAxis {...commonXAxis} />
              <YAxis {...commonYAxis} />
              <Tooltip contentStyle={styles.tooltip} itemStyle={{ fontSize: 12 }} />
              <Legend verticalAlign="top" height={36}/>
              
              <Area 
                type="monotone" 
                dataKey="observado" 
                name="Dato Real" 
                stroke="#3b82f6" 
                fill="url(#colorObs)" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="tendencia" 
                name="Tendencia (Suavizada)" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID INFERIOR: ESTACIONALIDAD Y RESIDUO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* 2. ESTACIONALIDAD (Patrones Repetitivos) */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h4 style={styles.title}>🔄 Estacionalidad</h4>
          </div>
          <p style={styles.desc}>Patrones cíclicos (ej. subidas en Diciembre).</p>
          
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} syncId="timeSeriesSync" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid {...commonGrid} />
                <XAxis {...commonXAxis} hide />
                <YAxis {...commonYAxis} />
                <Tooltip contentStyle={styles.tooltip} />
                <Area 
                  type="monotone" 
                  dataKey="estacionalidad" 
                  stroke="#10b981" 
                  fill="#d1fae5" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. RESIDUO (Ruido/Anomalías) */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h4 style={styles.title}>⚠️ Residuo (Ruido)</h4>
          </div>
          <p style={styles.desc}>Lo que no se explica ni por tendencia ni por temporada.</p>
          
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} syncId="timeSeriesSync" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid {...commonGrid} />
                <XAxis {...commonXAxis} hide />
                <YAxis {...commonYAxis} />
                <Tooltip contentStyle={styles.tooltip} />
                <Bar dataKey="residuo" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  title: { margin: 0, fontSize: '1rem', color: '#1e293b' },
  desc: { margin: '0 0 15px 0', fontSize: '0.85rem', color: '#64748b' },
  tagPrimary: { background: '#fff7ed', color: '#c2410c', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase' },
  tooltip: { borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.95)' }
};

export default TimeSeriesChart;