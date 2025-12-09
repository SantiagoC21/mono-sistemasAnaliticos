import React from 'react';
import { AnalysisResult } from '../../types/analysis';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface Props {
  data: AnalysisResult;
}

const RandomForestResults: React.FC<Props> = ({ data }) => {
  const importances = data.importancia_variables || {};
  const score = data.metrica_valor || 0;
  const metricName = data.metrica_nombre || "Score";
  const modelType = data.tipo_modelo || "Random Forest";

  // 1. Datos para el Gráfico de Barras (Importancia)
  const barData = Object.entries(importances)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value) // Ordenar de mayor a menor
    .slice(0, 10); // Top 10 para no saturar

  // 2. Datos para el Gráfico Radial (Score)
  const radialData = [{
    name: metricName,
    value: score * 100,
    fill: '#8b5cf6' // Violeta intenso
  }];

  return (
    <div style={styles.container}>
      
      {/* HEADER: TÍTULO Y TIPO */}
      <div style={styles.header}>
        <div style={styles.iconBox}>🌲</div>
        <div>
          <h3 style={styles.title}>Resultados del Bosque Aleatorio</h3>
          <p style={styles.subtitle}>Modelo: <strong>{modelType}</strong> (Ensamble de 100 árboles)</p>
        </div>
      </div>

      <div style={styles.grid}>
        
        {/* PANEL IZQUIERDO: EL SCORE (RADIAL) */}
        <div style={styles.scoreCard}>
          <h4 style={styles.cardTitle}>Calidad del Modelo</h4>
          <div style={{ height: 250, position: 'relative' }}>
            <ResponsiveContainer>
              <RadialBarChart 
                innerRadius="70%" 
                outerRadius="100%" 
                barSize={20} 
                data={radialData} 
                startAngle={90} 
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            
            {/* Texto Central */}
            <div style={styles.centerText}>
              <div style={styles.scoreNumber}>{(score * 100).toFixed(1)}%</div>
              <div style={styles.scoreLabel}>{metricName}</div>
            </div>
          </div>
          <p style={styles.scoreDesc}>
            {score > 0.8 ? "🚀 Rendimiento Excelente" : score > 0.5 ? "⚠️ Rendimiento Moderado" : "❌ Rendimiento Bajo"}
          </p>
        </div>

        {/* PANEL DERECHO: IMPORTANCIA (BARRAS) */}
        <div style={styles.chartCard}>
          <h4 style={styles.cardTitle}>🏆 Drivers Principales (Top 10)</h4>
          <p style={styles.cardSubtitle}>¿Qué variables influyen más en la predicción?</p>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={barData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#c026d3" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#475569'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="url(#colorImp)" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* FOOTER: EXPLICACIÓN TÉCNICA */}
      <div style={styles.footer}>
        <strong>💡 ¿Cómo funciona?</strong> El algoritmo creó 100 árboles de decisión diferentes y promedió sus resultados.
        Las variables con barras más largas son las que aparecieron en la cima de la mayoría de esos árboles, indicando que son críticas para el negocio.
      </div>
    </div>
  );
};

// Tooltip Personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e1b4b', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <strong>{label}</strong>
        <div style={{ marginTop: 4, color: '#a78bfa' }}>Impacto: {(payload[0].value * 100).toFixed(2)}%</div>
      </div>
    );
  }
  return null;
};

// --- ESTILOS CSS-IN-JS ---
const styles: Record<string, React.CSSProperties> = {
  container: { animation: 'fadeIn 0.6s ease-out' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  iconBox: { width: 45, height: 45, background: '#f3e8ff', color: '#7c3aed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' },
  title: { margin: 0, color: '#1e293b', fontSize: '1.3rem' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.9rem' },
  
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px', marginBottom: '25px' },
  
  scoreCard: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', textAlign: 'center' as const, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  centerText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' as const },
  scoreNumber: { fontSize: '2.5rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1 },
  scoreLabel: { fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginTop: 5, letterSpacing: '1px' },
  scoreDesc: { marginTop: '10px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' },
  
  chartCard: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' },
  cardTitle: { margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.1rem' },
  cardSubtitle: { margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem' },
  
  footer: { background: '#faf5ff', padding: '15px', borderRadius: '8px', border: '1px solid #e9d5ff', color: '#6b21a8', fontSize: '0.9rem', lineHeight: 1.5 }
};

export default RandomForestResults;