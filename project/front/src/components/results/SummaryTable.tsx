import React from 'react';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult;
}

const SummaryTable: React.FC<Props> = ({ data }) => {
  // El backend devuelve un objeto tipo: { "Ventas": {mean: 10, std: 2...}, "Costos": {...} }
  // Obtenemos los nombres de las variables (columnas) analizadas
  const variables = Object.keys(data);

  if (variables.length === 0) return <div style={{ color: '#666' }}>No hay datos para mostrar.</div>;

  // Obtenemos las métricas disponibles (keys del primer objeto)
  // Ej: mean, std, min, 25%, 50%, 75%, max, varianza, skew, kurtosis
  const metrics = Object.keys(data[variables[0]]);

  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
            <th style={styles.thFirst}>Métrica</th>
            {variables.map(variable => (
              <th key={variable} style={styles.th}>{variable}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, rowIndex) => (
            <tr key={metric} style={{ background: rowIndex % 2 === 0 ? 'white' : '#fcfcfc', borderBottom: '1px solid #f0f0f0' }}>
              <td style={styles.tdFirst}>
                <strong>{formatMetricName(metric)}</strong>
              </td>
              {variables.map(variable => {
                const value = data[variable][metric];
                return (
                  <td key={`${variable}-${metric}`} style={styles.td}>
                    {formatValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- HELPERS DE FORMATO ---

// Hace que "std" se vea como "Desviación Std"
const formatMetricName = (key: string) => {
  const map: Record<string, string> = {
    mean: 'Media (Promedio)',
    std: 'Desviación Estándar',
    min: 'Mínimo',
    max: 'Máximo',
    '25%': 'Q1 (25%)',
    '50%': 'Mediana (50%)',
    '75%': 'Q3 (75%)',
    count: 'Conteo',
    varianza: 'Varianza',
    asimetria: 'Asimetría (Skew)',
    curtosis: 'Curtosis',
    rango: 'Rango'
  };
  return map[key] || key; // Si no está en el mapa, devuelve la original
};

// Redondea decimales solo si es necesario
const formatValue = (val: any) => {
  if (typeof val === 'number') {
    // Si es entero o muy grande, sin decimales. Si es pequeño, 2 o 4 decimales.
    if (Number.isInteger(val)) return val;
    return Math.abs(val) < 0.01 ? val.toExponential(2) : val.toLocaleString('es-PE', { maximumFractionDigits: 2 });
  }
  return val;
};

// --- ESTILOS INLINE (Para este componente) ---
const styles = {
  th: { padding: '12px 15px', textAlign: 'right' as const, color: '#495057', fontWeight: 600 },
  thFirst: { padding: '12px 15px', textAlign: 'left' as const, color: '#495057', fontWeight: 600, width: '200px' },
  td: { padding: '10px 15px', textAlign: 'right' as const, color: '#333', fontFamily: 'monospace' },
  tdFirst: { padding: '10px 15px', textAlign: 'left' as const, color: '#007bff' }
};

export default SummaryTable;