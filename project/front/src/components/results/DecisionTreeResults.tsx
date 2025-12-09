import React from 'react';
import { AnalysisResult } from '../../types/analysis';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  data: AnalysisResult;
}

const DecisionTreeResults: React.FC<Props> = ({ data }) => {
  const importances = data.importancia_variables || {};
  const rules = data.reglas_texto || "";
  const modelType = data.tipo_modelo || "Árbol de Decisión";

  // Preparar datos para el gráfico de barras (Ordenado de mayor a menor)
  const chartData = Object.entries(importances)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.iconBox}>🌳</div>
        <div>
          <h3 style={styles.title}>Resultados del Modelo</h3>
          <p style={styles.subtitle}>Tipo detectado: <strong>{modelType}</strong></p>
        </div>
      </div>

      <div style={styles.grid}>
        
        {/* SECCIÓN IZQUIERDA: IMPORTANCIA DE VARIABLES */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>🔥 Importancia de Variables</h4>
          <p style={styles.cardSubtitle}>¿Qué factores influyen más en la decisión?</p>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECCIÓN DERECHA: REGLAS DEL ÁRBOL (TEXTO) */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>📜 Reglas Generadas</h4>
          <p style={styles.cardSubtitle}>Lógica interna del árbol (Leíble por humanos)</p>
          
          <div style={styles.codeBlock}>
            <pre style={styles.pre}>{rules}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};

// Tooltip para las barras
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#333', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
        <strong>{label}</strong>: {(payload[0].value * 100).toFixed(1)}% de impacto
      </div>
    );
  }
  return null;
};

// --- ESTILOS ---
const styles: Record<string, React.CSSProperties> = {
  container: { animation: 'fadeIn 0.5s ease-in-out' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  iconBox: { width: 40, height: 40, background: '#d1fae5', color: '#047857', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' },
  title: { margin: 0, color: '#1f2937', fontSize: '1.25rem' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' },
  cardTitle: { margin: '0 0 5px 0', color: '#374151', fontSize: '1rem' },
  cardSubtitle: { margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.85rem' },
  
  // Estilo "Terminal" para las reglas
  codeBlock: { 
    background: '#1e293b', 
    color: '#a5f3fc', 
    padding: '15px', 
    borderRadius: '8px', 
    height: '300px', 
    overflow: 'auto',
    fontFamily: '"Fira Code", monospace',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    border: '1px solid #334155'
  },
  pre: { margin: 0 }
};

export default DecisionTreeResults;