import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DateParseErrorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="animate-pop-in">
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>📅</div>
          <h2 style={styles.title}>Formato de Fecha Inválido</h2>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          <p style={styles.description}>
            El sistema no pudo interpretar la columna seleccionada como una serie de tiempo válida.
          </p>

          <div style={styles.exampleBox}>
            <div style={{ marginBottom: 10, fontWeight: 700, color: '#374151' }}>Formatos Esperados:</div>
            <div style={styles.validFormat}>✅ 2024-12-31 (Año-Mes-Día)</div>
            <div style={styles.validFormat}>✅ 31/12/2024 (Día/Mes/Año)</div>
            <div style={styles.validFormat}>✅ 12-31-2024 (Mes-Día-Año)</div>
            
            <div style={{ marginTop: 15, fontWeight: 700, color: '#374151' }}>Problema Detectado:</div>
            <div style={styles.invalidFormat}>❌ Texto, Números sueltos o Fechas mixtas</div>
          </div>

          <div style={styles.tipBox}>
            <strong>💡 Solución:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
              Verifica que hayas seleccionado la columna correcta en el campo <strong>"Eje X"</strong> o limpia tu archivo Excel para unificar el formato.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>
            Entendido, cambiar columna
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  backdrop: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: 'white', width: '450px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e5e7eb', overflow: 'hidden', fontFamily: 'sans-serif' },
  header: { background: '#fef2f2', padding: '25px', textAlign: 'center' as const, borderBottom: '1px solid #fee2e2' },
  iconCircle: { fontSize: '3rem', marginBottom: '10px' },
  title: { margin: 0, color: '#991b1b', fontSize: '1.3rem', fontWeight: 700 },
  body: { padding: '25px' },
  description: { textAlign: 'center' as const, color: '#4b5563', fontSize: '1rem', marginBottom: '20px' },
  exampleBox: { background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' },
  validFormat: { color: '#059669', fontSize: '0.9rem', marginBottom: '5px', fontFamily: 'monospace' },
  invalidFormat: { color: '#dc2626', fontSize: '0.9rem', fontFamily: 'monospace' },
  tipBox: { background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '15px', borderRadius: '4px', color: '#9a3412', fontSize: '0.9rem' },
  footer: { padding: '20px 25px', textAlign: 'right' as const, borderTop: '1px solid #f3f4f6' },
  button: { background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }
};

export default DateParseErrorModal;