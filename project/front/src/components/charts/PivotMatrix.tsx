import React, { useState } from 'react';
import { AnalysisResult } from '../../types/analysis';


interface Props {
  data: AnalysisResult; // { eje_x, eje_y, datos: {x,y,value}[] }
}

const PivotMatrix: React.FC<Props> = ({ data }) => {
  const [hovered, setHovered] = useState<{ r: string, c: string } | null>(null);

  const cols = data.eje_x || [];
  const rows = data.eje_y || [];
  const values = data.datos || [];

  // Encontrar valor máximo para la escala de color
  const allValues = values.map((v: any) => v.value);
  const maxValue = Math.max(...allValues, 1);
  const totalSum = allValues.reduce((a: number, b: number) => a + b, 0);

  // Helper para buscar valor
  const getValue = (r: string, c: string) => {
    const found = values.find((v: any) => v.y === r && v.x === c);
    return found ? found.value : 0;
  };

  // Formateador de moneda/número
  const formatVal = (val: number) => {
    if (val > 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val > 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div style={styles.container}>
      {/* HEADER DE RESUMEN */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Matriz Cruzada</h3>
          <p style={styles.subtitle}>Dimensiones: {rows.length} Filas x {cols.length} Columnas</p>
        </div>
        <div style={styles.kpiBox}>
          <span style={styles.kpiLabel}>Gran Total</span>
          <span style={styles.kpiValue}>{formatVal(totalSum)}</span>
        </div>
      </div>

      {/* CONTENEDOR CON SCROLL PARA LA MATRIZ */}
      <div style={styles.scrollWrapper}>
        <div style={{
          ...styles.grid,
          // CSS Grid Mágico: 1 col auto (etiquetas) + N columnas de igual tamaño
          gridTemplateColumns: `minmax(120px, auto) repeat(${cols.length}, minmax(100px, 1fr))`
        }}>
          
          {/* 1. CELDA ESQUINA VACÍA */}
          <div style={styles.cornerCell}></div>

          {/* 2. ENCABEZADOS DE COLUMNA */}
          {cols.map((col: string) => (
            <div 
              key={`h-${col}`} 
              style={{
                ...styles.colHeader,
                background: hovered?.c === col ? '#eff6ff' : '#f8fafc',
                color: hovered?.c === col ? '#1d4ed8' : '#64748b'
              }}
            >
              {col}
            </div>
          ))}

          {/* 3. FILAS DE DATOS */}
          {rows.map((row: string) => (
            <React.Fragment key={`row-${row}`}>
              {/* Encabezado de Fila */}
              <div 
                style={{
                  ...styles.rowHeader,
                  background: hovered?.r === row ? '#eff6ff' : 'white',
                  color: hovered?.r === row ? '#1d4ed8' : '#334155',
                  borderRight: hovered?.r === row ? '3px solid #3b82f6' : '1px solid #e2e8f0'
                }}
              >
                {row}
              </div>

              {/* Celdas de Valor */}
              {cols.map((col: string) => {
                const val = getValue(row, col);
                const intensity = val / maxValue; // 0 a 1
                const isHovered = hovered?.r === row && hovered?.c === col;
                
                // Color Base: Azul (Tailwind Blue)
                // Usamos rgba para controlar la opacidad según el valor
                const bgColor = val === 0 ? '#fff' : `rgba(59, 130, 246, ${0.1 + (intensity * 0.9)})`;
                const textColor = intensity > 0.6 ? 'white' : '#1e293b';

                return (
                  <div
                    key={`${row}-${col}`}
                    onMouseEnter={() => setHovered({ r: row, c: col })}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      ...styles.cell,
                      backgroundColor: bgColor,
                      color: textColor,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isHovered ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                      zIndex: isHovered ? 10 : 1,
                      border: isHovered ? '2px solid #1e40af' : '1px solid #f1f5f9'
                    }}
                    title={`${row} - ${col}: ${val.toLocaleString()}`}
                  >
                    {formatVal(val)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendGradient}></div>
        <div style={styles.legendLabels}>
          <span>0</span>
          <span>Máx ({formatVal(maxValue)})</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px', border: '1px solid #e2e8f0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '1.2rem', color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.9rem' },
  kpiBox: { textAlign: 'right' as const },
  kpiLabel: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 },
  kpiValue: { fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' },
  
  scrollWrapper: { overflowX: 'auto', paddingBottom: '10px', maxHeight: '500px', overflowY: 'auto' },
  grid: { display: 'grid', gap: '1px' },
  
  cornerCell: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  colHeader: { padding: '12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '0.9rem', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 20 },
  rowHeader: { padding: '12px', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'white' }, // Sticky left para filas
  
  cell: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', padding: '10px', cursor: 'default', transition: 'all 0.1s ease', borderRadius: '4px' },
  
  legend: { marginTop: '20px', padding: '0 20px' },
  legendGradient: { height: '8px', width: '200px', background: 'linear-gradient(to right, #eff6ff, #1e40af)', borderRadius: '4px', marginBottom: '5px' },
  legendLabels: { display: 'flex', width: '200px', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }
};

export default PivotMatrix;