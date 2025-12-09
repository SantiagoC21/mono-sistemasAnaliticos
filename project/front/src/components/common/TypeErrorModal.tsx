import React from 'react';

interface ErrorData {
  error: string;
  columna: string;
  dtype: string;
}

interface Props {
  isOpen: boolean;
  data: ErrorData;
  onClose: () => void;
}

const TypeErrorModal: React.FC<Props> = ({ isOpen, data, onClose }) => {
  if (!isOpen) return null;

  // Helper para traducir tipos técnicos a lenguaje humano
  const formatType = (type: string) => {
    if (type.includes('float')) return 'Número Decimal (10.5)';
    if (type.includes('int')) return 'Número Entero (10)';
    if (type.includes('datetime')) return 'Fecha';
    return type;
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="animate-pop-in">
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>🔢</div>
          <h2 style={styles.title}>Tipo de Dato Incompatible</h2>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          <p style={styles.description}>
            Has seleccionado la columna <strong>"{data.columna}"</strong> para agrupar datos, 
            pero el sistema detectó que contiene <strong>Números</strong> en lugar de Texto/Categorías.
          </p>

          {/* CAJA DE COMPARACIÓN */}
          <div style={styles.comparisonBox}>
            <div style={styles.compItem}>
              <span style={styles.compLabel}>Requerido</span>
              <div style={styles.compValueOk}> Texto / Categoría</div>
              <small style={{color:'#666'}}>(Ej. "Lima", "Norte")</small>
            </div>
            
            <div style={styles.arrow}>→</div>

            <div style={styles.compItem}>
              <span style={styles.compLabel}>Detectado</span>
              <div style={styles.compValueBad}>{formatType(data.dtype)}</div>
              <small style={{color:'#ef4444'}}>({data.dtype})</small>
            </div>
          </div>

          {/* EXPLICACIÓN */}
          <div style={styles.tipBox}>
            <strong>💡 ¿Por qué ocurre esto?</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
              En una Tabla Dinámica, las <strong>Filas</strong> y <strong>Columnas</strong> (Ejes) deben ser categorías para agrupar.
              <br/><br/>
              Los <strong>Números</strong> (como "{data.columna}") deben usarse únicamente en el campo <strong>"Valores"</strong> para ser sumados o promediados.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>
            Entendido, corregir selección
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS (Tema Azul/Profesional) ---
const styles = {
  backdrop: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    background: 'white', width: '500px', borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e5e7eb', overflow: 'hidden', fontFamily: 'sans-serif'
  },
  header: {
    background: '#eff6ff', padding: '25px', textAlign: 'center' as const, borderBottom: '1px solid #dbeafe'
  },
  iconCircle: {
    fontSize: '3rem', marginBottom: '10px'
  },
  title: {
    margin: 0, color: '#1e3a8a', fontSize: '1.3rem', fontWeight: 700
  },
  body: { padding: '25px' },
  description: {
    textAlign: 'center' as const, color: '#374151', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px'
  },
  comparisonBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px'
  },
  compItem: { textAlign: 'center' as const, flex: 1 },
  arrow: { fontSize: '1.5rem', color: '#94a3b8', padding: '0 10px' },
  compLabel: { fontSize: '0.75rem', textTransform: 'uppercase' as const, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 },
  compValueOk: { color: '#059669', fontWeight: 700, fontSize: '1.1rem' },
  compValueBad: { color: '#dc2626', fontWeight: 700, fontSize: '1.1rem' },
  
  tipBox: {
    background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '15px', borderRadius: '4px',
    color: '#9a3412', fontSize: '0.9rem', lineHeight: 1.5
  },
  footer: { padding: '20px 25px', textAlign: 'right' as const, borderTop: '1px solid #f3f4f6' },
  button: {
    background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
    borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
  }
};

export default TypeErrorModal;