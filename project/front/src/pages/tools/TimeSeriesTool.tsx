import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import DataPointsErrorModal from '../../components/common/DataPointsErrorModal';
import DateParseErrorModal from '../../components/common/DateParseErrorModal';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string, params: any) => void;
  onBack: () => void;
}

const TimeSeriesTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [dateCol, setDateCol] = useState("");
  const [valueCol, setValueCol] = useState("");
  const [period, setPeriod] = useState(12); // Default mensual

  const handleRun = () => {
    if (!dateCol || !valueCol) {
      alert("Selecciona la columna de Fecha y la de Valor.");
      return;
    }
    // Series de Tiempo: 
    // X = [Columna Fecha]
    // Y = Columna Valor
    // Params = { periodo }
    onAnalyze([dateCol], valueCol, { periodo: period });
  };



  if (step === 3 && result && result.error && result.error.includes("convertir la columna a fecha")) {
    return (
      <DateParseErrorModal 
        isOpen={true} 
        onClose={onBack} 
      />
    );
  }

  // Caso 2: Error de Puntos Insuficientes
  if (step === 3 && result && result.error && result.error.includes("Se necesitan al menos")) {
    return (
      <DataPointsErrorModal 
        isOpen={true} 
        message={result.error} 
        onClose={onBack} 
      />
    );
  }

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={{ fontSize: '2rem' }}>⏳</div>
          <div>
            <h3 style={{ margin: 0, color: '#d97706' }}>Series de Tiempo (Tendencia)</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Descompone tus datos históricos para encontrar la <strong>Tendencia real</strong> (crecimiento/caída) 
              y la <strong>Estacionalidad</strong> (patrones repetitivos).
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'grid', gap: '25px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* FECHA */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>1. Columna de Fecha (Eje X)</label>
              <select value={dateCol} onChange={e => setDateCol(e.target.value)} style={styles.select}>
                <option value="">-- Ej. Fecha, Mes, Año --</option>
                {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* VALOR */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>2. Columna de Valor (Eje Y)</label>
              <select value={valueCol} onChange={e => setValueCol(e.target.value)} style={styles.select}>
                <option value="">-- Ej. Ventas, Ingresos --</option>
                {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* PERIODO */}
          <div style={styles.periodBox}>
            <label style={styles.label}>3. Frecuencia del Patrón (Periodo)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input 
                type="number" 
                min="2"
                value={period} 
                onChange={e => setPeriod(parseInt(e.target.value))} 
                style={styles.numberInput} 
              />
              <div style={{ fontSize: '0.9rem', color: '#666', flex: 1 }}>
                <p style={{margin:0}}><strong>¿Cada cuánto se repite el ciclo?</strong></p>
                <ul style={{margin:'5px 0 0 0', paddingLeft:'20px', color:'#64748b'}}>
                  <li>Si son datos <strong>Mensuales</strong>, usa <strong>12</strong> (1 año).</li>
                  <li>Si son datos <strong>Diarios</strong>, usa <strong>7</strong> (1 semana) o <strong>30</strong> (1 mes).</li>
                  <li>Si son datos <strong>Trimestrales</strong>, usa <strong>4</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !dateCol || !valueCol}
            style={styles.btnPrimary}
          >
            {loading ? "Descomponiendo Serie..." : "Analizar Tendencia"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    if (result.error) {
       // Manejo básico de error por si el dataset es muy corto
       return <div style={{color:'red', padding: 20}}>Error: {result.error} <button onClick={onBack}>Volver</button></div>;
    }

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Resultados Temporales</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Ajustar</button>
        </div>

        <TimeSeriesChart data={result} />
        
      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  headerBox: { background: '#fff7ed', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #d97706' },
  inputGroup: { background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' },
  periodBox: { background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  label: { display: 'block', fontWeight: 700, marginBottom: '10px', color: '#1e293b' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  numberInput: { width: '80px', padding: '10px', fontSize: '1.2rem', textAlign: 'center' as const, borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' },
  btnPrimary: { padding: '15px 40px', background: '#d97706', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(217, 119, 6, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
};

export default TimeSeriesTool;