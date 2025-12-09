import React, { useState } from 'react';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult; // { variables: string[], matriz: {x, y, value}[] }
}

const CorrelationHeatmap: React.FC<Props> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: string, y: string } | null>(null);

  const variables = data.variables || [];
  const matrix = data.matriz || [];
  const gridSize = variables.length;

  // Función para obtener el color basado en el valor (-1 a 1)
  const getColor = (value: number) => {
    // Escala de color: Rojo (-1) -> Blanco (0) -> Azul (1)
    if (value > 0) {
      // Azul (Positivo)
      const intensity = Math.max(0.1, value); // Mínimo 10% de color
      return `rgba(37, 99, 235, ${intensity})`; // Tailwind blue-600
    } else if (value < 0) {
      // Rojo (Negativo)
      const intensity = Math.max(0.1, Math.abs(value));
      return `rgba(220, 38, 38, ${intensity})`; // Tailwind red-600
    } else {
      return '#f8fafc'; // Gris muy claro (Cero)
    }
  };

  const getTextColor = (value: number) => {
    return Math.abs(value) > 0.6 ? 'white' : '#1e293b';
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <div 
          style={{
            ...styles.grid,
            gridTemplateColumns: `auto repeat(${gridSize}, minmax(80px, 1fr))`,
          }}
        >
          {/* Fila Superior: Encabezados de Columnas */}
          <div style={styles.cornerCell}></div> {/* Celda vacía esquina */}
          {variables.map((v) => (
            <div 
              key={`col-${v}`} 
              style={{
                ...styles.headerCell,
                fontWeight: hoveredCell?.x === v ? '800' : '600',
                color: hoveredCell?.x === v ? '#2563eb' : '#64748b',
                background: hoveredCell?.x === v ? '#eff6ff' : 'transparent',
              }}
            >
              <div style={styles.rotatedText}>{v}</div>
            </div>
          ))}

          {/* Cuerpo de la Matriz */}
          {variables.map((yVar) => (
            <React.Fragment key={`row-${yVar}`}>
              {/* Encabezado de Fila */}
              <div 
                style={{
                  ...styles.rowHeaderCell,
                  fontWeight: hoveredCell?.y === yVar ? '800' : '600',
                  color: hoveredCell?.y === yVar ? '#2563eb' : '#64748b',
                  background: hoveredCell?.y === yVar ? '#eff6ff' : 'transparent',
                }}
              >
                {yVar}
              </div>

              {/* Celdas de Valor */}
              {variables.map((xVar) => {
                // Buscar el valor en la matriz plana
                const cell = matrix.find(m => m.x === xVar && m.y === yVar);
                const value = cell ? cell.value : 0;
                
                const isHovered = hoveredCell?.x === xVar && hoveredCell?.y === yVar;
                const isRelated = hoveredCell?.x === xVar || hoveredCell?.y === yVar;

                return (
                  <div
                    key={`${yVar}-${xVar}`}
                    onMouseEnter={() => setHoveredCell({ x: xVar, y: yVar })}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      ...styles.cell,
                      backgroundColor: getColor(value),
                      color: getTextColor(value),
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 1,
                      border: isHovered ? '2px solid #1e293b' : '1px solid white',
                      opacity: hoveredCell && !isRelated ? 0.4 : 1, // Atenuar lo no relacionado
                      boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    }}
                    title={`${yVar} vs ${xVar}: ${value.toFixed(4)}`}
                  >
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Leyenda */}
      <div style={styles.legend}>
        <div style={styles.legendItem}><span style={{...styles.dot, background: '#dc2626'}}></span> Negativa (-1)</div>
        <div style={styles.legendItem}><span style={{...styles.dot, background: '#f8fafc', border:'1px solid #ccc'}}></span> Neutra (0)</div>
        <div style={styles.legendItem}><span style={{...styles.dot, background: '#2563eb'}}></span> Positiva (+1)</div>
      </div>
    </div>
  );
};

// --- ESTILOS CSS-IN-JS ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: '20px',
    overflow: 'hidden',
  },
  scrollContainer: {
    overflowX: 'auto',
    paddingBottom: '10px',
  },
  grid: {
    display: 'grid',
    gap: '2px',
    alignItems: 'center',
  },
  cornerCell: {
    minWidth: '100px',
  },
  headerCell: {
    textAlign: 'center',
    padding: '10px',
    fontSize: '0.85rem',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  rotatedText: {
    transform: 'rotate(-45deg)',
    whiteSpace: 'nowrap',
    marginBottom: '10px',
  },
  rowHeaderCell: {
    textAlign: 'right',
    padding: '10px',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  cell: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '15px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-block',
  }
};

export default CorrelationHeatmap;