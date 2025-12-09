import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import FrequencyChart from '../../components/charts/FrequencyChart';

interface Props {
  step: number;
  metadata: FileMetadata | null;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[]) => void;
  onBack: () => void;
}

const FrequencyTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [selectedCol, setSelectedCol] = useState<string>("");

  const handleRun = () => {
    if (!selectedCol) {
      alert("Selecciona una columna para analizar.");
      return;
    }
    // El backend espera un array en columnas_x, aunque sea solo 1
    onAnalyze([selectedCol]);
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2 && metadata) {
    return (
      <div className="animate-fade-in">
        <div style={styles.infoBox}>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📊</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#0ea5e9' }}>Distribución de Frecuencias</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
            Genera un <strong>Histograma</strong> (para números) o un <strong>Gráfico de Barras</strong> (para categorías).
            Ideal para entender cómo se comportan tus datos.
          </p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Variable a Analizar:</label>
          <select 
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Seleccionar Columna --</option>
            {metadata.columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !selectedCol}
            style={styles.btnPrimary}
          >
            {loading ? "Generando Gráfico..." : "Visualizar Distribución"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>Resultados Visuales</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Variable: <strong>{selectedCol}</strong></p>
          </div>
          <button onClick={onBack} style={styles.btnSecondary}>← Otra Variable</button>
        </div>

        {/* COMPONENTE DE GRÁFICO PROFESIONAL */}
        <FrequencyChart data={result} />

        {/* MINI TABLA DE DATOS (Opcional, para complementar) */}
        <div style={{ marginTop: '30px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left' }}>Rango / Etiqueta</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {result.etiquetas?.map((label: string, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px' }}>{label}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{result.valores[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

// --- ESTILOS INLINE ---
const styles = {
  infoBox: { background: '#e0f2fe', padding: '20px', borderRadius: '12px', marginBottom: '30px', borderLeft: '5px solid #0ea5e9' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: 600, marginBottom: '8px', color: '#333' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#fff' },
  btnPrimary: { padding: '12px 30px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }
};

export default FrequencyTool;