import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ZAxis
} from 'recharts';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult;
}

// Paleta de colores profesional para Clusters (hasta 5 grupos)
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

const KMeansScatter: React.FC<Props> = ({ data }) => {
  const points = data.plot_data || [];
  const numClusters = data.num_clusters || 0;

  // Generamos un array de índices [0, 1, 2...]
  const clusters = Array.from({ length: numClusters }, (_, i) => i);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Mapa de Segmentación</h3>
        <p style={styles.subtitle}>
          Visualización 2D basada en las dos primeras variables seleccionadas.
        </p>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis type="number" dataKey="x" name="Variable X" tick={{fontSize: 12}} />
            <YAxis type="number" dataKey="y" name="Variable Y" tick={{fontSize: 12}} />
            <ZAxis type="number" range={[60, 60]} /> {/* Tamaño de los puntos */}
            
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend />

            {/* Renderizamos un Scatter por cada Cluster para tener colores distintos */}
            {clusters.map((clusterId, index) => (
              <Scatter
                key={clusterId}
                name={`Cluster ${clusterId}`}
                data={points.filter((p: any) => p.c === clusterId)}
                fill={COLORS[index % COLORS.length]}
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Tooltip Personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#1e293b', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
        <strong>Cluster {data.c}</strong>
        <div style={{ marginTop: 5 }}>
          X: {data.x.toFixed(2)}<br/>
          Y: {data.y.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

const styles = {
  container: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '20px', border: '1px solid #f1f5f9' },
  header: { marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  title: { margin: 0, color: '#1e293b', fontSize: '1.1rem' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.85rem' }
};

export default KMeansScatter;