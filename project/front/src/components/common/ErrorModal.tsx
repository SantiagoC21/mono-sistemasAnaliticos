import React from 'react';

interface Props {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<Props> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="animate-pop-in">
        {/* Icono de Error */}
        <div style={styles.iconHeader}>
          <div style={styles.iconCircle}>
            ⚠️
          </div>
        </div>

        {/* Contenido */}
        <div style={styles.content}>
          <h3 style={styles.title}>Error de Validación</h3>
          <p style={styles.message}>
            {message}
          </p>
          
          <div style={styles.tipBox}>
            <strong>💡 Sugerencia:</strong> La Prueba T requiere una variable categórica que tenga 
            <strong> exactamente 2 opciones</strong> (ej. "Sí/No", "M/F").
            <br/>Tu variable seleccionada no cumple esto.
          </div>
        </div>

        {/* Botón */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>
            Entendido, corregir
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS MODAL ---
const styles = {
  backdrop: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white', width: '450px', borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden', fontFamily: 'sans-serif'
  },
  iconHeader: {
    background: '#fef2f2', padding: '20px', display: 'flex', justifyContent: 'center'
  },
  iconCircle: {
    width: 60, height: 60, background: '#fee2e2', color: '#ef4444',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', border: '4px solid white', boxShadow: '0 0 0 4px #fef2f2'
  },
  content: { padding: '25px' },
  title: { margin: '0 0 10px 0', color: '#1f2937', textAlign: 'center' as const, fontSize: '1.25rem' },
  message: { margin: '0 0 20px 0', color: '#4b5563', textAlign: 'center' as const, lineHeight: 1.5 },
  tipBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '12px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4
  },
  footer: { padding: '15px 25px', background: '#f9fafb', textAlign: 'right' as const },
  button: {
    background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px',
    borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
  }
};

export default ErrorModal;