import React from 'react';

interface ErrorData {
  error: string;
  columna_target: string;
  num_clases: number;
}

interface Props {
  isOpen: boolean;
  data: ErrorData;
  onClose: () => void; // Acción para rectificar (volver atrás)
}

const HighCardinalityModal: React.FC<Props> = ({ isOpen, data, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="animate-pop-in">
        
        {/* HEADER DE ADVERTENCIA */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>⚠️</div>
          <h2 style={styles.title}>Complejidad Excesiva Detectada</h2>
        </div>

        {/* CUERPO DEL PROBLEMA */}
        <div style={styles.body}>
          <p style={styles.description}>
            La variable objetivo <strong>"{data.columna_target}"</strong> tiene demasiadas opciones distintas para realizar una clasificación fiable.
          </p>

          {/* VISUALIZACIÓN DEL DATO */}
          <div style={styles.statBox}>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Clases Encontradas</div>
              <div style={styles.statValueBad}>{data.num_clases}</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Máximo Recomendado</div>
              <div style={styles.statValueGood}>≤ 50</div>
            </div>
          </div>

          {/* EXPLICACIÓN TÉCNICA (Consejo) */}
          <div style={styles.tipBox}>
            <strong>¿Por qué ocurre esto?</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
              Un modelo de clasificación (Random Forest) intenta encontrar reglas para separar grupos. 
              Con <strong>{data.num_clases} grupos</strong>, el modelo se confunde y pierde precisión.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <strong>💡 Sugerencia de Rectificación:</strong>
            <ul style={styles.list}>
              <li>Elige una variable más general (ej. "Continente" en lugar de "País").</li>
              <li>Agrupa las categorías pequeñas en una sola llamada "Otros".</li>
              <li>Si son números, usa un modelo de <strong>Regresión</strong>, no Clasificación.</li>
            </ul>
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>
            Entendido, voy a cambiar la variable
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS PROFESIONALES (Amber/Orange Theme) ---
const styles = {
  backdrop: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco nublado estilo Apple
    backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    background: 'white', width: '500px', borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
    overflow: 'hidden', fontFamily: '"Segoe UI", sans-serif'
  },
  header: {
    background: '#fffbeb', padding: '30px 30px 10px 30px', textAlign: 'center' as const,
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center'
  },
  iconCircle: {
    fontSize: '3rem', marginBottom: '10px'
  },
  title: {
    margin: 0, color: '#b45309', fontSize: '1.4rem', fontWeight: 700
  },
  body: { padding: '20px 30px' },
  description: {
    textAlign: 'center' as const, color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px'
  },
  statBox: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#f9fafb', borderRadius: '12px', padding: '15px', border: '1px solid #f3f4f6', marginBottom: '20px'
  },
  statItem: { flex: 1, textAlign: 'center' as const },
  statLabel: { fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' as const, fontWeight: 700 },
  statValueBad: { fontSize: '2rem', fontWeight: 800, color: '#dc2626' }, // Rojo
  statValueGood: { fontSize: '2rem', fontWeight: 800, color: '#10b981' }, // Verde
  divider: { width: '1px', height: '40px', background: '#e5e7eb' },
  tipBox: {
    background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '4px',
    color: '#1e3a8a', fontSize: '0.9rem'
  },
  list: {
    paddingLeft: '20px', color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '5px'
  },
  footer: { padding: '20px 30px', background: '#fafafa', borderTop: '1px solid #f0f0f0', textAlign: 'right' as const },
  button: {
    background: '#b45309', color: 'white', border: 'none', padding: '12px 24px',
    borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem',
    boxShadow: '0 4px 10px rgba(180, 83, 9, 0.2)', transition: 'transform 0.1s'
  }
};

export default HighCardinalityModal;