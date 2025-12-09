import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import ConfusionMatrix from '../../components/charts/ConfusionMatrix';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const LogisticTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [targetCol, setTargetCol] = useState("");
  const [featureCols, setFeatureCols] = useState<string[]>([]);

  const handleRun = () => {
    if (!targetCol || featureCols.length === 0) {
      alert("Selecciona la categoría objetivo (Y) y al menos un predictor (X).");
      return;
    }
    onAnalyze(featureCols, targetCol);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={{ fontSize: '2rem' }}>🚦</div>
          <div>
            <h3 style={{ margin: 0, color: '#059669' }}>Regresión Logística (Clasificación)</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Predice una <strong>Categoría o Estado</strong> (ej. Compra/No Compra, Falla/Ok, Lima/Provincia) basándose en variables numéricas.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          
          {/* SECCIÓN 1: OBJETIVO (Y) - CATEGÓRICO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeY}>Y</span> ¿Qué quieres Clasificar? (Categoría)
            </label>
            <select 
              value={targetCol} 
              onChange={(e) => setTargetCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Ej. Departamento, Estado, Sexo --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <small style={{ color: '#059669', display: 'block', marginTop: 5 }}>
              💡 Elige una columna con pocas opciones (ej. Sí/No, A/B/C).
            </small>
          </div>

          {/* SECCIÓN 2: PREDICTORES (X) - NUMÉRICOS */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeX}>X</span> Variables que influyen (Numéricas)
            </label>
            <select 
              multiple 
              value={featureCols}
              onChange={(e) => setFeatureCols(Array.from(e.target.selectedOptions, o => o.value))}
              style={styles.multiSelect}
            >
              {metadata.columns
                 .filter(c => c !== targetCol) // No puedes predecirte a ti mismo
                 .map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !targetCol || featureCols.length === 0}
            style={styles.btnPrimary}
          >
            {loading ? "Clasificando..." : "Ejecutar Clasificación"}
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
          <h2 style={{ margin: 0, color: '#333' }}>Resultados de Clasificación</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Ajustar</button>
        </div>

        {/* COMPONENTE MATRIZ DE CONFUSIÓN */}
        <ConfusionMatrix data={result} />

        {/* EXPLICACIÓN DIDÁCTICA */}
        <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>¿Cómo leer esto?</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d', lineHeight: 1.6 }}>
            <li><strong>Diagonal (Verde):</strong> Son las veces que el modelo acertó. (Ej. Era 'Lima' y predijo 'Lima').</li>
            <li><strong>Fuera de Diagonal (Rojo):</strong> Son los errores. (Ej. Era 'Lima' pero el modelo se confundió y dijo 'Arequipa').</li>
            <li>Si ves mucho rojo fuera de la diagonal, el modelo necesita mejores variables para distinguir las clases.</li>
          </ul>
        </div>
      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  headerBox: { background: '#ecfdf5', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #059669' },
  inputGroup: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#1f2937' },
  badgeY: { background: '#d1fae5', color: '#047857', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  badgeX: { background: '#e0e7ff', color: '#3730a3', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  multiSelect: { width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace' },
  btnPrimary: { padding: '15px 40px', background: '#059669', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
};

export default LogisticTool;