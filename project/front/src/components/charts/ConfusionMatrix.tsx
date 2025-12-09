import React from 'react';
import { AnalysisResult } from '../../types/analysis';

interface Props {
  data: AnalysisResult; // Espera { accuracy, matriz_confusion, clases_mapeo }
}

const ConfusionMatrix: React.FC<Props> = ({ data }) => {
  const matrix = data.matriz_confusion || [];
  
  // 1. CORRECCIÓN: Convertir el objeto 'clases_mapeo' a un array ordenado de strings
  // El backend devuelve: { "0": "ANCASH", "1": "AREQUIPA" ... }
  let classes: string[] = [];
  if (data.clases_mapeo) {
    // Ordenamos por clave numérica (0, 1, 2...) para que coincida con la matriz
    const sortedKeys = Object.keys(data.clases_mapeo).sort((a, b) => parseInt(a) - parseInt(b));
    classes = sortedKeys.map(key => data.clases_mapeo[key]);
  } else if (data.clases) {
    classes = data.clases; // Soporte legacy por si acaso
  }

  // Si la matriz es más pequeña que las clases (puede pasar si sklearn recorta), ajustamos
  const displayClasses = classes.slice(0, matrix.length);

  const accuracy = data.accuracy ? (data.accuracy * 100).toFixed(2) : "0.00";

  // Calcular máximo para el color (evitar división por cero)
  const flatValues = matrix.flat() as number[];
  const maxValue = Math.max(...flatValues, 1);

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Matriz de Confusión</h3>
          <p style={styles.subtitle}>
            {matrix.length > 1 
              ? "El modelo parece estar sesgado hacia una sola clase (Columna llena)." 
              : "Comparación: Realidad vs. Predicción"}
          </p>
        </div>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Precisión Global</div>
          <div style={styles.scoreValue}>{accuracy}%</div>
        </div>
      </div>

      {/* BODY CON SCROLL (Por si hay muchas provincias) */}
      <div style={styles.scrollContainer}>
        <div style={styles.matrixWrapper}>
          
          {/* EJE Y LABEL */}
          <div style={styles.axisYLabel}>REALIDAD (Histórico)</div>

          <div>
            {/* EJE X LABEL */}
            <div style={styles.axisXLabel}>PREDICCIÓN DEL MODELO</div>

            {/* GRID */}
            <div style={{
              display: 'grid',
              // Definimos columnas dinámicas
              gridTemplateColumns: `auto repeat(${matrix[0]?.length || 1}, minmax(60px, 1fr))`,
              gap: '4px'
            }}>
              
              {/* Esquina vacía */}
              <div></div>

              {/* Encabezados Columnas (Predicciones) */}
              {displayClasses.map((cls, i) => (
                // Solo mostramos el texto si cabe, o usamos la inicial si son muchas
                <div key={`head-${i}`} style={styles.colHeader} title={cls}>
                  {cls.length > 8 ? cls.substring(0, 3) + '.' : cls}
                </div>
              ))}

              {/* Filas */}
              {matrix.map((row: number[], i: number) => (
                <React.Fragment key={`row-${i}`}>
                  {/* Encabezado Fila (Realidad) */}
                  <div style={styles.rowHeader} title={displayClasses[i]}>
                    {displayClasses[i]}
                  </div>

                  {/* Celdas */}
                  {row.map((val: number, j: number) => {
                    const isDiagonal = i === j;
                    const intensity = val / maxValue; 
                    
                    // Lógica de color: 
                    // Si es diagonal y tiene valor > 0: Verde (Acierto)
                    // Si NO es diagonal y tiene valor > 0: Rojo (Error)
                    // Si es 0: Gris muy claro
                    let bg = '#f9fafb';
                    let textColor = '#e5e7eb'; // Casi invisible para ceros

                    if (val > 0) {
                      textColor = intensity > 0.6 ? 'white' : '#1f2937';
                      if (isDiagonal) {
                        bg = `rgba(16, 185, 129, ${0.3 + intensity * 0.7})`; // Verde
                      } else {
                        bg = `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Rojo
                      }
                    }

                    return (
                      <div 
                        key={`${i}-${j}`} 
                        style={{...styles.cell, backgroundColor: bg, color: textColor}}
                        title={`Real: ${displayClasses[i]} \nPredicho: ${displayClasses[j]} \nCantidad: ${val}`}
                      >
                        {val > 0 && <span style={{fontWeight: 'bold'}}>{val}</span>}
                        {val === 0 && <span style={{fontSize: '0.7rem'}}>0</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LEYENDA */}
      <div style={styles.legend}>
        <small style={{color:'#666'}}>
          Nota: Si ves toda una columna vertical llena, significa que el modelo predice la misma categoría para todos los casos (Sesgo).
        </small>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '25px', border: '1px solid #f3f4f6', maxWidth: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '1.2rem', color: '#111827' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  scoreCard: { textAlign: 'right' as const },
  scoreLabel: { fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 },
  scoreValue: { fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 },
  
  scrollContainer: { overflowX: 'auto', paddingBottom: '10px' },
  matrixWrapper: { display: 'inline-flex', alignItems: 'flex-start' },
  
  axisYLabel: { writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', marginRight: '10px', height: '100%' },
  axisXLabel: { textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', marginBottom: '5px', marginLeft: '80px' },
  
  colHeader: { textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', padding: '2px', overflow:'hidden', textOverflow:'ellipsis' },
  rowHeader: { textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', paddingRight: '10px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth: '100px' },
  
  cell: { height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' },
  legend: { marginTop: '15px', padding: '10px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fcd34d', fontSize: '0.85rem', textAlign: 'center' }
};

export default ConfusionMatrix;