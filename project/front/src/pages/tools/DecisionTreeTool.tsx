import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import DecisionTreeResults from '../../components/results/DecisionTreeResults';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const DecisionTreeTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [targetCol, setTargetCol] = useState("");
  const [featureCols, setFeatureCols] = useState<string[]>([]);

  const handleRun = () => {
    if (!targetCol || featureCols.length === 0) {
      alert("Selecciona un objetivo (Y) y al menos un predictor (X).");
      return;
    }
    // Árbol: Y=Target, X=Features
    onAnalyze(featureCols, targetCol);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={styles.headerIcon}>🌳</div>
          <div>
            <h3 style={{ margin: 0, color: '#047857' }}>Árbol de Decisión</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Crea reglas automáticas (ej. <em>"Si Ventas &gt; 100..."</em>) para explicar tus datos.
              Sirve tanto para predecir números como categorías.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          
          {/* OBJETIVO (Y) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeY}>Y</span> ¿Qué quieres Explicar? (Target)
            </label>
            <select 
              value={targetCol} 
              onChange={(e) => setTargetCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Seleccionar Columna --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* PREDICTORES (X) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeX}>X</span> Variables que generan las reglas
            </label>
            <select 
              multiple 
              value={featureCols}
              onChange={(e) => setFeatureCols(Array.from(e.target.selectedOptions, o => o.value))}
              style={styles.multiSelect}
            >
              {metadata.columns
                 .filter(c => c !== targetCol)
                 .map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
            <small style={{ color: '#666', display: 'block', marginTop: 5 }}>
              💡 Selecciona varias columnas para crear un árbol más profundo.
            </small>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !targetCol || featureCols.length === 0}
            style={styles.btnPrimary}
          >
            {loading ? "Generando Árbol..." : "Construir Árbol"}
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
          <h2 style={{ margin: 0, color: '#333' }}>Análisis de Árbol</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Ajustar</button>
        </div>

        {/* COMPONENTE VISUAL */}
        <DecisionTreeResults data={result} />
        
      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  headerBox: { background: '#ecfdf5', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #10b981' },
  headerIcon: { fontSize: '2rem' },
  inputGroup: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#1f2937' },
  badgeY: { background: '#d1fae5', color: '#065f46', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  badgeX: { background: '#e0e7ff', color: '#312e81', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  multiSelect: { width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace' },
  btnPrimary: { padding: '15px 40px', background: '#10b981', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
};

export default DecisionTreeTool;