import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult; // { tipo: string, etiquetas: [], valores: [] }
}

const FrequencyChart: React.FC<Props> = ({ data }) => {
  // 1. Transformar datos paralelos (dos arrays) a formato objeto para Recharts
  const chartData = data.etiquetas?.map((label: string, index: number) => ({
    name: label,
    value: data.valores ? data.valores[index] : 0,
  })) || [];

  // Configuración visual según el tipo
  const isNumeric = data.tipo === 'numerico';
  const barColorStart = isNumeric ? '#4f46e5' : '#0ea5e9'; // Índigo vs Azul Cielo
  const barColorEnd = isNumeric ? '#818cf8' : '#38bdf8';
  const title = isNumeric ? 'Histograma de Frecuencia' : 'Conteo por Categoría';

  return (
    <div style={styles.container}>
      {/* Header del Gráfico con Metadatos */}
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.badge}>
          Total Clases: <strong>{chartData.length}</strong>
        </div>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barCategoryGap={isNumeric ? 1 : '20%'} // Si es numérico, juntamos las barras (Histograma)
          >
            {/* Definición de Degradados */}
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={barColorStart} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={barColorEnd} stopOpacity={0.6}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }}
              dy={10}
              angle={-45}
              textAnchor="end"
              interval={0} // Forzar mostrar todas las etiquetas (cuidado si son muchas)
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }} 
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            
            <Bar 
              dataKey="value" 
              fill="url(#colorBar)" 
              radius={[6, 6, 0, 0]} // Bordes redondeados arriba
              animationDuration={1500}
            >
              {chartData.map((_entry: { name: string; value: number }, index: number) => (
                 <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- TOOLTIP PERSONALIZADO (CSS IN JS) ---
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        <p style={styles.tooltipValue}>
          Frecuencia: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

// --- ESTILOS PROFESIONALES ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', // Sombra suave "elevada"
    padding: '25px',
    border: '1px solid #f0f0f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #f5f5f5'
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  badge: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  tooltip: {
    background: '#1e293b', // Fondo oscuro
    color: 'white',
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: 'none',
  },
  tooltipLabel: {
    margin: '0 0 5px 0',
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  tooltipValue: {
    margin: 0,
    fontSize: '1rem',
  }
};

export default FrequencyChart;
