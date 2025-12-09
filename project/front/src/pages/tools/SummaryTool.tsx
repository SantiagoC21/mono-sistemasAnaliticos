import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import SummaryTable from '../../components/results/SummaryTable';

interface Props {
  step: number;                // Saber si estamos configurando o viendo resultados
  metadata: FileMetadata;      // Para llenar los selects
  result: AnalysisResult | null; // Los datos que devuelve Python
  loading: boolean;
  onAnalyze: (xCols: string[]) => void; // Función para llamar al padre
  onBack: () => void;          // Volver a configurar
}

const SummaryTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  // Estado local exclusivo de esta herramienta
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  // Handler local antes de llamar al padre
  const handleRun = () => {
    if (selectedCols.length === 0) {
      alert("Debes seleccionar al menos una columna numérica.");
      return;
    }
    onAnalyze(selectedCols);
  };

  // --- VISTA DE CONFIGURACIÓN (PASO 2) ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Configurar Resumen Estadístico</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
            Esta herramienta calcula media, mediana, varianza y desviación estándar.
            Selecciona las variables numéricas que deseas analizar.
          </p>
        </div>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
          Variables Numéricas:
        </label>
        
        <select 
          multiple 
          value={selectedCols}
          onChange={(e) => setSelectedCols(Array.from(e.target.selectedOptions, o => o.value))}
          style={{ 
            width: '100%', height: '200px', padding: '10px', 
            borderRadius: '6px', border: '1px solid #ccc',
            fontFamily: 'monospace', fontSize: '0.9rem'
          }}
        >
          {metadata.columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          ℹ️ Mantén presionada la tecla Ctrl (Windows) o Cmd (Mac) para seleccionar varias.
        </p>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button 
            onClick={handleRun} 
            disabled={loading}
            style={{
              padding: '12px 25px', background: '#007bff', color: 'white', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Procesando..." : "Ejecutar Análisis"}
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA DE RESULTADOS (PASO 3) ---
  if (step === 3 && result) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>📊 Reporte Estadístico</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Variables analizadas: <strong>{selectedCols.join(', ')}</strong>
            </p>
          </div>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 15px', background: 'white', border: '1px solid #ccc',
              borderRadius: '6px', cursor: 'pointer', color: '#555'
            }}
          >
            ← Ajustar Configuración
          </button>
        </div>

        {/* Aquí usamos el componente de tabla que creamos antes */}
        <SummaryTable data={result} />
        
      </div>
    );
  }

  return null;
};

export default SummaryTool;