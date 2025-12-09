import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import RandomForestResults from '../../components/results/RandomForestResults';
import HighCardinalityModal from '../../components/common/HighCardinalityModal';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const RandomForestTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [targetCol, setTargetCol] = useState("");
  const [featureCols, setFeatureCols] = useState<string[]>([]);

  const handleRun = () => {
    if (!targetCol || featureCols.length === 0) {
      alert("Selecciona un objetivo (Y) y al menos un predictor (X).");
      return;
    }
    // Random Forest: Y=Target, X=Features
    onAnalyze(featureCols, targetCol);
  };

  // --- 2. INTERCEPTOR DE ERROR DE CARDINALIDAD ---
  // Verificamos si el resultado tiene la firma del error JSON que definiste
  if (step === 3 && result && result.error && result.num_clases) {
    return (
      <HighCardinalityModal
        isOpen={true}
        data={{
          error: result.error,
          columna_target: result.columna_target,
          num_clases: result.num_clases
        }}
        onClose={() => {
          // Al cerrar, regresamos al paso de configuración automáticamente
          onBack(); 
        }}
      />
    );
  }



  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={styles.headerIcon}>🌲</div>
          <div>
            <h3 style={{ margin: 0, color: '#6d28d9' }}>Random Forest (Avanzado)</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Utiliza el poder de <strong>100 árboles de decisión</strong> simultáneos para obtener la máxima precisión posible.
              <br/>Funciona para números (Regresión) y categorías (Clasificación).
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          
          {/* OBJETIVO (Y) */}
          <div style={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={styles.label}>
                <span style={styles.badgeY}>Y</span> Variable Objetivo (Target)
              </label>
              <span style={styles.tag}>Alta Precisión</span>
            </div>
            <select 
              value={targetCol} 
              onChange={(e) => setTargetCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- ¿Qué quieres predecir? --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* PREDICTORES (X) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeX}>X</span> Variables Predictoras (Features)
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
            <small style={{ color: '#7c3aed', display: 'block', marginTop: 8 }}>
              💡 Random Forest maneja muy bien el "ruido". Selecciona todas las variables que creas relevantes.
            </small>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !targetCol || featureCols.length === 0}
            style={styles.btnPrimary}
          >
            {loading ? "Entrenando 100 Árboles..." : "Ejecutar Random Forest"}
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
          <h2 style={{ margin: 0, color: '#333' }}>Análisis de Ensamble</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Nuevo Modelo</button>
        </div>

        {/* COMPONENTE VISUAL */}
        <RandomForestResults data={result} />
        
      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  headerBox: { background: '#f3e8ff', padding: '25px', borderRadius: '16px', display: 'flex', gap: '20px', borderLeft: '6px solid #7c3aed' },
  headerIcon: { fontSize: '2.5rem' },
  inputGroup: { background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#1f2937' },
  badgeY: { background: '#ddd6fe', color: '#5b21b6', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  badgeX: { background: '#fae8ff', color: '#86198f', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  tag: { background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' as const, fontWeight: 700 },
  select: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', background: '#f8fafc' },
  multiSelect: { width: '100%', height: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace', background: '#f8fafc' },
  btnPrimary: { padding: '16px 50px', background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)', transition: 'transform 0.1s', fontSize: '1.1rem' },
  btnSecondary: { padding: '10px 20px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }
};

export default RandomForestTool;