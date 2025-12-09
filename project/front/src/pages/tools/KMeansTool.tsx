import React, { useState } from 'react';
import { FileMetadata, AnalysisResult } from '../../types/analysis';
import KMeansScatter from '../../components/charts/KMeansScatter';

interface Props {
  step: number;
  metadata: FileMetadata;
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: (xCols: string[], yCol: string, params: any) => void;
  onBack: () => void;
}

const KMeansTool: React.FC<Props> = ({ step, metadata, result, loading, onAnalyze, onBack }) => {
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [numClusters, setNumClusters] = useState(3);

  const handleRun = () => {
    if (selectedCols.length < 2) {
      alert("Selecciona al menos 2 variables numéricas para visualizar el gráfico.");
      return;
    }
    // K-Means: X=Features, Params={n_clusters}
    onAnalyze(selectedCols, "", { n_clusters: numClusters });
  };

  // --- PASO 2: CONFIGURACIÓN ---
  if (step === 2) {
    return (
      <div className="animate-fade-in">
        <div style={styles.headerBox}>
          <div style={{ fontSize: '2rem' }}>🧩</div>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Clustering K-Means</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Agrupa tus datos en segmentos similares automáticamente. 
              Ideal para segmentación de clientes, detección de anomalías o agrupación de productos.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', marginTop: '30px' }}>
          
          {/* SELECCIÓN DE VARIABLES */}
          <div>
            <label style={styles.label}>
              <span style={styles.badge}>1</span> Variables de Segmentación (Numéricas)
            </label>
            <select 
              multiple 
              value={selectedCols}
              onChange={(e) => setSelectedCols(Array.from(e.target.selectedOptions, o => o.value))}
              style={styles.multiSelect}
            >
              {metadata.columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <small style={{ color: '#64748b', display: 'block', marginTop: 5 }}>
              Selecciona variables que definan al grupo (ej. Edad, Ingresos, Gasto).
            </small>
          </div>

          {/* PARÁMETRO K */}
          <div>
            <label style={styles.label}>
              <span style={styles.badge}>2</span> Número de Grupos (K)
            </label>
            <div style={styles.kInputBox}>
              <input 
                type="number" 
                min="2" max="10" 
                value={numClusters}
                onChange={(e) => setNumClusters(parseInt(e.target.value))}
                style={styles.kInput}
              />
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Clusters</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
              ¿En cuántos grupos quieres dividir tus datos? (Lo usual es 3 a 5).
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleRun} 
            disabled={loading || selectedCols.length < 2}
            style={styles.btnPrimary}
          >
            {loading ? "Segmentando..." : "Ejecutar K-Means"}
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 3: RESULTADOS ---
  if (step === 3 && result) {
    const profiles = result.perfil_promedio || {};
    const distribution = result.distribucion || {};
    
    // Convertir profiles a array para iterar
    const clustersIds = Object.keys(profiles);

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Resultados de Segmentación</h2>
          <button onClick={onBack} style={styles.btnSecondary}>← Recalcular</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          {/* 1. EL GRÁFICO */}
          <KMeansScatter data={result} />

          {/* 2. DISTRIBUCIÓN (Tabla simple) */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Tamaño de los Grupos</h3>
            <div style={{ marginTop: '20px' }}>
              {Object.entries(distribution).map(([clusterId, count]: any, idx) => {
                const total = result.plot_data?.length || 1;
                const perc = ((count / total) * 100).toFixed(1);
                const color = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'][idx % 5];
                
                return (
                  <div key={clusterId} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span style={{fontWeight: 700, color: '#333'}}>Cluster {clusterId}</span>
                      <span>{count} registros ({perc}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                      <div style={{ width: `${perc}%`, height: '100%', background: color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. PERFILES PROMEDIO (TABLA DETALLADA) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔎 Perfil Promedio (Centroides)</h3>
          <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>
            Esta tabla muestra el valor promedio de cada variable para cada grupo. Úsala para darle un nombre a cada segmento.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={styles.th}>Variable</th>
                  {clustersIds.map((id, idx) => (
                    <th key={id} style={{ ...styles.th, color: ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'][idx % 5] }}>
                      Cluster {id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Iteramos sobre las variables (keys del primer cluster) */}
                {Object.keys(profiles[clustersIds[0]] || {}).map(variable => (
                  <tr key={variable} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#475569' }}>{variable}</td>
                    {clustersIds.map(id => (
                      <td key={`${id}-${variable}`} style={{ padding: '12px', textAlign: 'center', fontFamily: 'monospace' }}>
                        {typeof profiles[id][variable] === 'number' 
                          ? profiles[id][variable].toFixed(2) 
                          : profiles[id][variable]}
                      </td>
                    ))}
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

const styles: Record<string, React.CSSProperties> = {
  headerBox: { background: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', borderLeft: '5px solid #0f172a' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '15px', color: '#1e293b' },
  badge: { background: '#e2e8f0', color: '#0f172a', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
  multiSelect: { width: '100%', height: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace' },
  kInputBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  kInput: { width: '80px', padding: '10px', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' as const, borderRadius: '8px', border: '1px solid #cbd5e1' },
  btnPrimary: { padding: '15px 40px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)' },
  btnSecondary: { padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#475569' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  cardTitle: { margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.1rem' },
  th: { padding: '12px', textAlign: 'center' as const, fontWeight: 700 }
};

export default KMeansTool;