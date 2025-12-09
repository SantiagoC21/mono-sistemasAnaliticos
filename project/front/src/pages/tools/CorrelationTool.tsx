import React from 'react';
import { AnalysisResult } from '../../types/analysis';
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap';

interface Props {
  step: number;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void; // No requiere argumentos
  onBack: () => void;
}

const CorrelationTool: React.FC<Props> = ({ step, result, loading, onAnalyze, onBack }) => {

  // --- PASO 2: CONFIGURACIÓN (Confirmación Simple) ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.infoBox}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🔗</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2563eb' }}>Matriz de Correlación</h3>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Esta herramienta analizará <strong>todas las variables numéricas</strong> de tu archivo para detectar relaciones ocultas.
            <br/><br/>
            • <strong>Correlación Positiva (Azul):</strong> Si una sube, la otra también.<br/>
            • <strong>Correlación Negativa (Rojo):</strong> Si una sube, la otra baja.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={onAnalyze} 
            disabled={loading}
            style={styles.btnPrimary}
          >
            {loading ? "Calculando Relaciones..." : "Generar Matriz de Correlación"}
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
            <h2 style={{ margin: 0, color: '#1e293b' }}>Mapa de Relaciones</h2>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Variables Analizadas: <strong>{result.variables?.length || 0}</strong>
            </p>
          </div>
          <button onClick={onBack} style={styles.btnSecondary}>← Volver</button>
        </div>

        {/* EL COMPONENTE ESTÉTICO */}
        <CorrelationHeatmap data={result} />

        <div style={styles.tipsBox}>
          <strong>💡 Tip de Interpretación:</strong> Busca los cuadros de color intenso (azul oscuro o rojo oscuro). 
          Esas son las variables que están fuertemente conectadas. Ignora la diagonal principal (siempre es 1.0).
        </div>
      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  infoBox: { background: '#eff6ff', padding: '30px', borderRadius: '16px', border: '1px solid #dbeafe', textAlign: 'center' as const },
  btnPrimary: { padding: '15px 40px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 },
  tipsBox: { marginTop: '20px', padding: '15px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', color: '#92400e', fontSize: '0.9rem' }
};

export default CorrelationTool;