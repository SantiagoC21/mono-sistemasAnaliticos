import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import RegressionChart from '../../components/charts/RegressionChart';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const RegressionTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [targetCol, setTargetCol] = useState("");
  const [featureCols, setFeatureCols] = useState<string[]>([]);

  const handleRun = () => {
    if (!targetCol || featureCols.length === 0) {
      alert("Selecciona un objetivo (Y) y al menos una variable predictora (X).");
      return;
    }
    // Regresión usa: Y=Target, X=Features (Lista)
    onAnalyze(featureCols, targetCol);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={styles.headerIcon}>📈</div>
          <div>
            <h3 style={{ margin: 0, color: '#2563eb' }}>Modelo de Regresión Lineal</h3>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Entrena un algoritmo de Machine Learning para predecir valores numéricos futuros.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          
          {/* SECCIÓN 1: OBJETIVO (Y) */}
          <div style={styles.section}>
            <label style={styles.label}>
              <span style={styles.badgeY}>Y</span> ¿Qué quieres predecir? (Variable Dependiente)
            </label>
            <select 
              value={targetCol} 
              onChange={(e) => setTargetCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Ej. Ventas, Precio, Temperatura --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* SECCIÓN 2: PREDICTORES (X) */}
          <div style={styles.section}>
            <label style={styles.label}>
              <span style={styles.badgeX}>X</span> ¿Qué datos usarás para predecir? (Variables Independientes)
            </label>
            <select 
              multiple 
              value={featureCols}
              onChange={(e) => setFeatureCols(Array.from(e.target.selectedOptions, o => o.value))}
              style={styles.multiSelect}
            >
              {metadata.columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
              ℹ️ Mantén Ctrl/Cmd para seleccionar múltiples factores (ej. Publicidad + Descuentos).
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !targetCol || featureCols.length === 0}
            style={styles.btnPrimary}
          >
            {loading ? "Entrenando Modelo..." : "Entrenar y Predecir"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b' }}>Resultados del Modelo</h2>
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
              Prediciendo: <strong>{targetCol}</strong> usando {featureCols.length} variables.
            </p>
          </div>
          <button onClick={onBack} style={styles.btnSecondary}>← Ajustar Modelo</button>
        </div>

        {/* 1. GRÁFICO PRINCIPAL */}
        <RegressionChart data={result} />

        {/* 2. TABLA DE COEFICIENTES */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div style={styles.card}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Impacto de Variables (Coeficientes)</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#64748b' }}>Variable</th>
                  <th style={{ textAlign: 'right', padding: '10px', color: '#64748b' }}>Peso (Impacto)</th>
                </tr>
              </thead>
              <tbody>
                {result.coeficientes && Object.entries(result.coeficientes).map(([key, val]: any) => (
                  <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#334155' }}>{key}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: val > 0 ? '#16a34a' : '#dc2626' }}>
                      {val > 0 ? '+' : ''}{val.toFixed(4)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#64748b', fontStyle: 'italic' }}>Intercepto (Base)</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>
                    {result.intercepto?.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Interpretación</h4>
            <p style={{ lineHeight: 1.6, color: '#475569', fontSize: '0.95rem' }}>
              El modelo tiene una precisión del <strong>{((result.metrica_r2 ?? 0) * 100).toFixed(1)}%</strong> (R²).
              <br/><br/>
              Esto significa que el { ((result.metrica_r2 ?? 0) * 100).toFixed(0) }% de la variación en <em>{targetCol}</em> puede explicarse por las variables que seleccionaste.
              <br/><br/>
              Las líneas punteadas naranjas en el gráfico muestran lo que el modelo "pensó" que pasaría, versus la línea azul sólida que es lo que "realmente" pasó.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  headerBox: { background: '#eff6ff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #2563eb' },
  headerIcon: { fontSize: '2rem' },
  section: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#1e293b' },
  badgeY: { background: '#dbeafe', color: '#1d4ed8', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  badgeX: { background: '#ffedd5', color: '#c2410c', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  multiSelect: { width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace' },
  btnPrimary: { padding: '15px 40px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
};

export default RegressionTool;