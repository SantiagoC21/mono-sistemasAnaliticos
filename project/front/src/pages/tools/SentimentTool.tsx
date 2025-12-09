import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | any; // { resumen: {positivos: 10...}, muestras: [] }
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const SentimentTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [textCol, setTextCol] = useState("");

  const handleRun = () => {
    if (!textCol) {
      alert("Selecciona la columna con los comentarios o textos.");
      return;
    }
    onAnalyze([], textCol);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={{ fontSize: '2rem' }}>🎭</div>
          <div>
            <h3 style={{ margin: 0, color: '#be123c' }}>Análisis de Sentimiento</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Detecta emociones automáticamente en textos. Clasifica cada fila como 
              <span style={{color:'#16a34a', fontWeight:'bold'}}> Positiva</span>, 
              <span style={{color:'#dc2626', fontWeight:'bold'}}> Negativa</span> o 
              <span style={{color:'#64748b', fontWeight:'bold'}}> Neutra</span>.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <label style={styles.label}>Columna de Opiniones/Texto</label>
          <select 
            value={textCol} 
            onChange={(e) => setTextCol(e.target.value)} 
            style={styles.select}
          >
            <option value="">-- Ej. Comentarios, Feedback, Reseña --</option>
            {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <small style={{ color: '#be123c', display: 'block', marginTop: 5 }}>
            ℹ️ Ideal para encuestas de satisfacción o comentarios de clientes.
          </small>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !textCol}
            style={styles.btnPrimary}
          >
            {loading ? "Analizando Emociones..." : "Calcular Sentimientos"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    const summary = result.resumen || { positivos: 0, negativos: 0, neutros: 0 };
    const samples = result.muestras || [];
    
    // Preparar datos para gráfico
    const chartData = [
      { name: 'Positivos', value: summary.positivos, color: '#22c55e' }, // Green
      { name: 'Neutros', value: summary.neutros, color: '#94a3b8' },   // Slate
      { name: 'Negativos', value: summary.negativos, color: '#ef4444' } // Red
    ].filter(d => d.value > 0); // Ocultar si es 0

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Radiografía Emocional</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Volver</button>
        </div>

        {/* 1. SECCIÓN SUPERIOR: GRÁFICO Y TARJETAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '25px', marginBottom: '30px' }}>
          
          {/* Gráfico de Donas */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Distribución General</h4>
            <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tarjetas de Resumen (KPIs) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ ...styles.kpiCard, borderLeft: '5px solid #22c55e' }}>
              <span style={{ fontSize: '2rem' }}>😃</span>
              <div>
                <div style={styles.kpiValue}>{summary.positivos}</div>
                <div style={styles.kpiLabel}>Positivos</div>
              </div>
            </div>
            <div style={{ ...styles.kpiCard, borderLeft: '5px solid #94a3b8' }}>
              <span style={{ fontSize: '2rem' }}>😐</span>
              <div>
                <div style={styles.kpiValue}>{summary.neutros}</div>
                <div style={styles.kpiLabel}>Neutros</div>
              </div>
            </div>
            <div style={{ ...styles.kpiCard, borderLeft: '5px solid #ef4444' }}>
              <span style={{ fontSize: '2rem' }}>😡</span>
              <div>
                <div style={styles.kpiValue}>{summary.negativos}</div>
                <div style={styles.kpiLabel}>Negativos</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECCIÓN INFERIOR: FEED DE MUESTRAS */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>🔍 Análisis Detallado (Primeros registros)</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: 12, width: '60%' }}>Texto Analizado</th>
                  <th style={{ padding: 12 }}>Polaridad (-1 a 1)</th>
                  <th style={{ padding: 12 }}>Clasificación</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((item: any, idx: number) => {
                  let badgeColor = '#94a3b8';
                  let icon = '⚪';
                  if (item.clasificacion === 'Positivo') { badgeColor = '#22c55e'; icon = '🟢'; }
                  if (item.clasificacion === 'Negativo') { badgeColor = '#ef4444'; icon = '🔴'; }

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#334155', fontStyle: 'italic' }}>
                        "{item.texto.length > 80 ? item.texto.substring(0, 80) + '...' : item.texto}"
                      </td>
                      <td style={{ padding: '12px' }}>
                        {/* Barra de progreso visual para polaridad */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'monospace', width: 40, textAlign: 'right' }}>
                            {item.polaridad.toFixed(2)}
                          </span>
                          <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, position: 'relative' }}>
                            <div style={{ 
                              position: 'absolute',
                              left: '50%', // Centro es 0
                              width: `${Math.abs(item.polaridad) * 50}%`, // Ancho relativo
                              height: '100%', 
                              background: badgeColor, 
                              borderRadius: 3,
                              transform: item.polaridad < 0 ? 'translateX(-100%)' : 'none' // Si es negativo va a la izquierda
                            }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', 
                          color: 'white', background: badgeColor, 
                          fontSize: '0.8rem', fontWeight: 'bold' 
                        }}>
                          {icon} {item.clasificacion}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  headerBox: { background: '#fff1f2', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #be123c' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#9f1239' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  btnPrimary: { padding: '15px 40px', background: '#be123c', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(190, 18, 60, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' },
  card: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  cardTitle: { margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.1rem' },
  
  kpiCard: { background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
  kpiValue: { fontSize: '1.5rem', fontWeight: 800, color: '#333', lineHeight: 1 },
  kpiLabel: { fontSize: '0.8rem', color: '#666' }
};

export default SentimentTool;