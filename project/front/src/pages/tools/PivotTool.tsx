import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import PivotMatrix from '../../components/charts/PivotMatrix';
import TypeErrorModal from '../../components/common/TypeErrorModal';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string, params: any) => void;
  onBack: () => void;
}

const PivotTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  // Pivot Table requiere 3 selecciones + 1 parámetro
  const [rowCol, setRowCol] = useState("");    // Eje Y (Index)
  const [colCol, setColCol] = useState("");    // Eje X (Columnas)
  const [valCol, setValCol] = useState("");    // Valores (Celdas)
  const [aggFunc, setAggFunc] = useState("sum"); // Función (Suma, Promedio...)

  const handleRun = () => {
    if (!rowCol || !colCol || !valCol) {
      alert("Debes configurar Filas, Columnas y Valores.");
      return;
    }
    // ESTRUCTURA BACKEND:
    // Y = Index (Filas)
    // X = [Columnas, Valores]
    // Params = { aggfunc }
    onAnalyze([colCol, valCol], rowCol, { aggfunc: aggFunc });
  };


  if (step === 3 && result && result.error && result.dtype) {
    return (
      <TypeErrorModal
        isOpen={true}
        data={{
          error: result.error,
          columna: result.columna,
          dtype: result.dtype
        }}
        onClose={() => {
          // Volver a la configuración para cambiar la columna
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
          <div style={{ fontSize: '2rem' }}>📐</div>
          <div>
            <h3 style={{ margin: 0, color: '#3b82f6' }}>Tabla Dinámica (Pivot Table)</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Resume grandes volúmenes de datos cruzando dos variables categóricas y calculando métricas.
              Similar a las tablas dinámicas de Excel.
            </p>
          </div>
        </div>

        {/* AREA DE CONFIGURACIÓN "DRAG & DROP" SIMULADO */}
        <div style={styles.configArea}>
          
          <div style={styles.gridConfig}>
            
            {/* 1. FILAS (Y) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>1. Filas (Categoría)</label>
              <select value={rowCol} onChange={e => setRowCol(e.target.value)} style={styles.select}>
                <option value="">-- Ej. Departamento, Vendedor --</option>
                {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 2. COLUMNAS (X) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>2. Columnas (Categoría)</label>
              <select value={colCol} onChange={e => setColCol(e.target.value)} style={styles.select}>
                <option value="">-- Ej. Año, Mes, Producto --</option>
                {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 3. VALORES (NUM) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>3. Valores (Numérico)</label>
              <select value={valCol} onChange={e => setValCol(e.target.value)} style={styles.select}>
                <option value="">-- Ej. Ventas, Costos --</option>
                {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 4. FUNCIÓN */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>4. Operación</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['sum', 'mean', 'count', 'max'].map(op => (
                  <button
                    key={op}
                    onClick={() => setAggFunc(op)}
                    style={{
                      ...styles.opButton,
                      background: aggFunc === op ? '#3b82f6' : '#f1f5f9',
                      color: aggFunc === op ? 'white' : '#475569',
                      borderColor: aggFunc === op ? '#3b82f6' : '#e2e8f0'
                    }}
                  >
                    {op === 'sum' ? 'Suma' : op === 'mean' ? 'Promedio' : op === 'count' ? 'Conteo' : 'Máx'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !rowCol || !colCol || !valCol}
            style={styles.btnPrimary}
          >
            {loading ? "Calculando..." : "Generar Tabla Cruzada"}
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
          <h2 style={{ margin: 0, color: '#333' }}>Análisis Cruzado</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Reconfigurar</button>
        </div>

        <PivotMatrix data={result} />
        
        <div style={{ marginTop: 20, fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
          * Los colores representan la intensidad del valor. Usa el scroll para ver tablas grandes.
        </div>
      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  headerBox: { background: '#eff6ff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #3b82f6' },
  configArea: { marginTop: '30px', background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  gridConfig: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  inputGroup: { marginBottom: '10px' },
  label: { display: 'block', fontWeight: 700, marginBottom: '8px', color: '#1e293b', fontSize: '0.9rem' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', background: 'white' },
  opButton: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' },
  btnPrimary: { padding: '15px 40px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
};

export default PivotTool;