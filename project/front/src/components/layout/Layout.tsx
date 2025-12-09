import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <header className="header">
        <button type="button" className="header-logo" onClick={handleGoHome}>
          <div className="header-logo-icon">AD</div>
          <span>Analítica de Datos</span>
        </button>
      </header>
      <main className="main-container">
        {children}
      </main>
    </>
  );
};

export default Layout;
