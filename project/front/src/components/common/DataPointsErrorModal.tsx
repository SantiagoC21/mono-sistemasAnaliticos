import React from 'react';

interface Props {
  isOpen: boolean;
  message: string; // El mensaje del backend: "Se necesitan al menos X..."
  onClose: () => void;
}

const DataPointsErrorModal: React.FC<Props> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  // Extraer el número necesario del mensaje (Regex simple)
  // "Se necesitan al menos 24 puntos..." -> extrae "24"
  const requiredPoints = message.match(/\d+/)?.[0] || "N";

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="animate-pop-in">
        
        <div style={styles.header}>
          <div style={styles.iconCircle}>📉</div>
          <h2 style={styles.title}>Datos Insuficientes</h2>
        </div>

        <div style={styles.body}>
          <p style={styles.description}>
            No tienes suficientes registros históricos para calcular la <strong>Estacionalidad</strong> con el periodo seleccionado.
          </p>

          {/* VISUALIZACIÓN DEL PROBLEMA */}
          <div style={styles.visualError}>
            <div style={styles.barContainer}>
              <div style={styles.barLabel}>Tus Datos</div>
              <div style={{...styles.bar, width: '40%', background: '#ef4444'}}>Muy Corto</div>
            </div>
            <div style={styles.barContainer}>
              <div style={styles.barLabel}>Requerido</div>
              <div style={{...styles.bar, width: '100%', background: '#3b82f6'}}>
                Min: {requiredPoints} registros
              </div>
            </div>
          </div>

          <div style={styles.tipBox}>
            <strong>💡 ¿Cómo solucionarlo?</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '0.9rem' }}>
              <li>
                <strong>Opción A:</strong> Reduce el "Periodo". (Ej. Si pusiste 12, prueba con 4).
              </li>
              <li>
                <strong>Opción B:</strong> Sube un archivo con más historia (más meses/años).
              </li>
            </ul>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>
            Entendido, ajustar periodo
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  backdrop: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: 'white', width: '500px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e5e7eb', overflow: 'hidden', fontFamily: 'sans-serif' },
  header: { background: '#eff6ff', padding: '25px', textAlign: 'center' as const, borderBottom: '1px solid #dbeafe' },
  iconCircle: { fontSize: '3rem', marginBottom: '10px' },
  title: { margin: 0, color: '#1e40af', fontSize: '1.3rem', fontWeight: 700 },
  body: { padding: '25px' },
  description: { textAlign: 'center' as const, color: '#374151', fontSize: '1rem', marginBottom: '20px' },
  
  visualError: { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' },
  barContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  barLabel: { width: '80px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' },
  bar: { height: '24px', borderRadius: '4px', color: 'white', fontSize: '0.75rem', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontWeight: 600 },
  
  tipBox: { background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '15px', borderRadius: '4px', color: '#166534', fontSize: '0.9rem' },
  footer: { padding: '20px 25px', textAlign: 'right' as const, borderTop: '1px solid #f3f4f6' },
  button: { background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }
};

export default DataPointsErrorModal;