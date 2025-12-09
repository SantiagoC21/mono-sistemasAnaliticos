import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import ErrorModal from '../../components/common/ErrorModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string) => void;
  onBack: () => void;
}

const TTestTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [groupCol, setGroupCol] = useState("");
  const [valueCol, setValueCol] = useState("");
  
  // Estado para el Modal de Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    if (!groupCol || !valueCol) {
      alert("Selecciona ambas variables.");
      return;
    }
    // Ejecutamos análisis
    onAnalyze([valueCol], groupCol);
  };

  // --- INTERCEPTOR DE ERRORES DEL BACKEND ---
  // Si el backend responde con { "error": "..." }, React lo recibe como result.
  // Usamos useEffect o chequeo directo para mostrar el modal.
  if (step === 3 && result && result.error) {
    // Si hay un error en el resultado, mostramos el modal y NO la pantalla de resultados
    return (
      <ErrorModal 
        isOpen={true} 
        message={result.error} 
        onClose={() => {
          // Al cerrar, limpiamos el error (opcional: llamar a onBack para resetear vista)
          onBack(); 
        }} 
      />
    );
  }

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        {/* Header Explicativo */}
        <div style={styles.headerBox}>
          <div style={styles.headerIcon}>⚖️</div>
          <div>
            <h3 style={{ margin: 0, color: '#4f46e5' }}>Prueba T de Student</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Compara el promedio de una variable numérica entre <strong>dos grupos</strong> diferentes.
              <br/>(Ejemplo: ¿Ganan más salario los Hombres que las Mujeres?)
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
              <option value="">-- Ej. Ventas, Salario --</option>
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
              <option value="">-- Ej. Sexo, Turno --</option>
              {metadata.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <small style={{ display: 'block', marginTop: 8, color: '#e11d48', fontSize: '0.8rem' }}>
              ⚠️ Debe tener exactamente 2 categorías únicas.
            </small>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || !groupCol || !valueCol}
            style={styles.btnPrimary}
          >
            {loading ? "Calculando Diferencias..." : "Ejecutar Comparación"}
          </button>
        </div>

        {/* Modal de Error (por si acaso el estado se maneja externo) */}
        <ErrorModal 
          isOpen={!!errorMsg} 
          message={errorMsg || ""} 
          onClose={() => setErrorMsg(null)} 
        />
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result && !result.error) {
    // Preparar datos para gráfica
    const chartData = Object.keys(result.medias || {}).map(key => ({
      name: key,
      media: result.medias[key]
    }));

    const isSignificant = result.es_significativo;

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Resultado de la Comparación</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Nueva Prueba</button>
        </div>

        {/* TARJETA DE CONCLUSIÓN PRINCIPAL */}
        <div style={{ 
          background: isSignificant ? '#ecfdf5' : '#fef2f2', 
          border: `1px solid ${isSignificant ? '#34d399' : '#f87171'}`,
          borderRadius: '12px', padding: '20px', marginBottom: '30px',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{ fontSize: '2.5rem' }}>{isSignificant ? '✅' : '🤷'}</div>
          <div>
            <h3 style={{ margin: 0, color: isSignificant ? '#065f46' : '#991b1b' }}>
              {result.conclusion}
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#555' }}>
              Valor P: <strong>{result.p_valor?.toFixed(5)}</strong> 
              {isSignificant ? " (Menor a 0.05, es significativo)" : " (Mayor a 0.05, no es concluyente)"}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* GRÁFICO COMPARATIVO */}
          <div style={styles.card}>
            <h4 style={{ textAlign: 'center', marginBottom: 20 }}>Promedio por Grupo</h4>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="media" name="Promedio" radius={[5, 5, 0, 0]}>
                     {chartData.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#ec4899'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ESTADÍSTICAS DETALLADAS */}
          <div style={styles.card}>
            <h4 style={{ marginBottom: 20 }}>Detalle Estadístico</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Variable Numérica</td>
                  <td style={styles.tdValue}><strong>{valueCol}</strong></td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Grupos</td>
                  <td style={styles.tdValue}>{result.grupos_comparados?.join(' vs ')}</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Estadístico T</td>
                  <td style={styles.tdValue}>{result.estadistico_t?.toFixed(2) || 'N/A'}</td>
                </tr>
                {chartData.map(g => (
                  <tr key={g.name} style={styles.tr}>
                    <td style={styles.tdLabel}>Media {g.name}</td>
                    <td style={styles.tdValue}>{g.media.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
  }

  return null;
};

// --- ESTILOS CSS-IN-JS ---
const styles = {
  headerBox: { background: '#eef2ff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #6366f1' },
  headerIcon: { fontSize: '2rem' },
  inputGroup: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#374151' },
  badgeNum: { background: '#dbeafe', color: '#1e40af', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
  badgeCat: { background: '#fce7f3', color: '#9d174d', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' },
  btnPrimary: { padding: '15px 40px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)', transition: 'transform 0.1s' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  tdLabel: { padding: '12px 0', color: '#6b7280', fontSize: '0.9rem' },
  tdValue: { padding: '12px 0', textAlign: 'right' as const, color: '#111827' }
};

export default TTestTool;