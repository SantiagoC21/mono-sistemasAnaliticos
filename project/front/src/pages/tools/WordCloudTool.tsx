import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | any; // Array [{text, value}]
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const WordCloudTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [textCol, setTextCol] = useState("");

  const handleRun = () => {
    if (!textCol) {
      alert("Selecciona una columna de texto.");
      return;
    }
    // NLP usa: Y=Columna Texto
    onAnalyze([], textCol);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={{ fontSize: '2rem' }}>☁️</div>
          <div>
            <h3 style={{ margin: 0, color: '#0891b2' }}>Nube de Palabras (NLP)</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Analiza columnas de texto libre (descripciones, comentarios) para detectar los temas más recurrentes.
              <br/>El sistema elimina automáticamente palabras comunes ("de", "la", "y").
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <label style={styles.label}>
            Variable de Texto
          </label>
          <select 
            value={textCol} 
            onChange={(e) => setTextCol(e.target.value)} 
            style={styles.select}
          >
            <option value="">-- Ej. Descripción, Comentarios, Reseñas --</option>
            {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <small style={{ color: '#0891b2', display: 'block', marginTop: 5 }}>
            ℹ️ Selecciona una columna que contenga frases o palabras (String).
          </small>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !textCol}
            style={styles.btnPrimary}
          >
            {loading ? "Minando Texto..." : "Generar Nube"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    // El backend devuelve directamente un array, o un objeto con una clave. 
    // Aseguramos que sea array.
    const words = Array.isArray(result) ? result : [];
    
    // Cálculos para la nube
    const maxValue = Math.max(...words.map((w: any) => w.value), 1);
    const top10 = words.slice(0, 10);

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Frecuencia de Palabras</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Otra Columna</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          
          {/* 1. VISUALIZACIÓN NUBE (CSS Custom Cloud) */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Nube de Conceptos</h3>
            <div style={styles.cloudContainer}>
              {words.slice(0, 50).map((w: any, i: number) => {
                // Cálculo de tamaño relativo (Min 12px, Max 40px)
                const size = 12 + (w.value / maxValue) * 35;
                // Opacidad basada en importancia
                const opacity = 0.5 + (w.value / maxValue) * 0.5;
                
                return (
                  <span 
                    key={i} 
                    style={{
                      fontSize: `${size}px`,
                      padding: '5px',
                      color: `rgba(8, 145, 178, ${opacity})`, // Cyan color base
                      display: 'inline-block',
                      cursor: 'default',
                      fontWeight: w.value > (maxValue * 0.5) ? 'bold' : 'normal'
                    }}
                    title={`${w.text}: ${w.value} veces`}
                  >
                    {w.text}
                  </span>
                )
              })}
            </div>
            <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#999', marginTop: 10}}>
              * Se muestran las top 50 palabras
            </p>
          </div>

          {/* 2. GRÁFICO DE BARRAS (Top 10) */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top 10 Términos</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart 
                  layout="vertical" 
                  data={top10} 
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="text" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0891b2" radius={[0, 4, 4, 0]} barSize={20}>
                    {top10.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`rgba(8, 145, 178, ${1 - (index * 0.08)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* TABLA DE DATOS */}
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Listado Completo</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: 10 }}>Palabra</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Frecuencia</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Importancia Relativa</th>
                </tr>
              </thead>
              <tbody>
                {words.slice(0, 100).map((w: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '8px 10px' }}>{w.text}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{w.value}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#666' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.8rem' }}>{((w.value / maxValue) * 100).toFixed(0)}%</span>
                        <div style={{ width: 50, height: 6, background: '#eee', borderRadius: 3 }}>
                          <div style={{ width: `${(w.value / maxValue) * 100}%`, height: '100%', background: '#0891b2', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
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
  headerBox: { background: '#ecfeff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #0891b2' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#155e75' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  btnPrimary: { padding: '15px 40px', background: '#0891b2', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(8, 145, 178, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  cardTitle: { margin: '0 0 20px 0', color: '#164e63', fontSize: '1.1rem' },
  cloudContainer: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '10px', minHeight: '200px' }
};

export default WordCloudTool;