import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import ErrorModal from '../../components/common/ErrorModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from 'recharts';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const AnovaTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [groupCol, setGroupCol] = useState("");
  const [valueCol, setValueCol] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = () => {
    if (!groupCol || !valueCol) {
      alert("Por favor selecciona ambas variables.");
      return;
    }
    // ANOVA usa: Y=Grupo, X=Valor
    onAnalyze([valueCol], groupCol);
  };

  // --- INTERCEPTOR DE ERRORES ---
  if (step === 3 && result && result.error) {
    return (
      <ErrorModal 
        isOpen={true} 
        message={result.error} 
        onClose={() => {
          setErrorMsg(null);
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
          <div style={styles.headerIcon}>📊</div>
          <div>
            <h3 style={{ margin: 0, color: '#7c3aed' }}>ANOVA de un Factor</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Compara el promedio de una variable numérica entre <strong>3 o más grupos</strong>.
              <br/>(Ejemplo: Ventas promedio en Norte vs Sur vs Centro vs Este).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
          
          {/* Columna 1: Variable Numérica */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeNum}>1</span> Variable Numérica (Valor)
            </label>
            <select 
              value={valueCol} 
              onChange={(e) => setValueCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Ej. Ventas, Rendimiento --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Columna 2: Variable de Grupo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.badgeCat}>2</span> Variable de Agrupación
            </label>
            <select 
              value={groupCol} 
              onChange={(e) => setGroupCol(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Ej. Región, Categoría --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <small style={{ display: 'block', marginTop: 8, color: '#e11d48', fontSize: '0.8rem', background: '#ffe4e6', padding: '5px', borderRadius: '4px' }}>
              ⚠️ Debe tener <strong>3 o más</strong> categorías únicas.
            </small>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !groupCol || !valueCol}
            style={styles.btnPrimary}
          >
            {loading ? "Analizando Varianza..." : "Ejecutar ANOVA"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result && !result.error) {
    const isSignificant = result.es_significativo;
    
    // Preparar datos para el gráfico (Backend no devuelve las medias por grupo en ANOVA simple a veces, 
    // pero si tu backend lo hace, úsalos. Si no, mostramos solo el resultado textual).
    // Asumiremos que el backend podría devolver 'medias' o 'grupos_data' si lo mejoras, 
    // pero por ahora usaremos la conclusión textual fuerte.
    
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Resultados del ANOVA</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Volver</button>
        </div>

        {/* TARJETA DE CONCLUSIÓN */}
        <div style={{ 
          background: isSignificant ? '#f0fdf4' : '#fff1f2', 
          borderLeft: `6px solid ${isSignificant ? '#16a34a' : '#e11d48'}`,
          borderRadius: '8px', padding: '25px', marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: isSignificant ? '#15803d' : '#be123c', fontSize: '1.4rem' }}>
            {result.conclusion}
          </h3>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem' }}>
            Valor P (Significancia): <strong>{result.p_valor?.toExponential(4)}</strong>
            <br/>
            Estadístico F: <strong>{result.estadistico_f?.toFixed(2)}</strong>
          </p>
        </div>

        {/* EXPLICACIÓN DIDÁCTICA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={styles.card}>
            <h4 style={{ color: '#555', marginBottom: '15px' }}>¿Qué significa esto?</h4>
            <p style={{ lineHeight: 1.6, color: '#666' }}>
              {isSignificant 
                ? "El análisis indica que AL MENOS UNO de los grupos es diferente a los demás. La variable de agrupación (ej. Región) SÍ influye en la variable numérica."
                : "No se encontró evidencia suficiente para decir que los grupos son diferentes. Las variaciones observadas son probablemente fruto del azar."
              }
            </p>
          </div>

          <div style={styles.card}>
            <h4 style={{ color: '#555', marginBottom: '15px' }}>Detalles Técnicos</h4>
            <ul style={{ paddingLeft: '20px', color: '#666', lineHeight: 1.6 }}>
              <li><strong>Variable Dependiente:</strong> {valueCol}</li>
              <li><strong>Factor (Grupos):</strong> {groupCol}</li>
              <li><strong>Confianza:</strong> 95% (alpha = 0.05)</li>
            </ul>
          </div>
        </div>

      </div>
    );
  }

  return null;
};

// --- ESTILOS ---
const styles = {
  headerBox: { background: '#f5f3ff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #7c3aed' },
  headerIcon: { fontSize: '2rem' },
  inputGroup: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#374151' },
  badgeNum: { background: '#ddd6fe', color: '#5b21b6', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
  badgeCat: { background: '#fce7f3', color: '#9d174d', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' },
  btnPrimary: { padding: '15px 40px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }
};

export default AnovaTool;