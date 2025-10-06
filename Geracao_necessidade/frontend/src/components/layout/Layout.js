import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Carregar estado salvo do localStorage
    const saved = localStorage.getItem('implantacao_sidebarCollapsed');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Estado padrão baseado no tamanho da tela
    return window.innerWidth <= 1024;
  });

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);

  // Detectar tamanho da tela e ajustar sidebar automaticamente
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // Em mobile/tablet, sempre colapsar (esconder)
        setSidebarCollapsed(true);
      } else {
        // Em desktop, manter o estado salvo pelo usuário
        const saved = localStorage.getItem('implantacao_sidebarCollapsed');
        if (saved === null) {
          setSidebarCollapsed(false);
          localStorage.setItem('implantacao_sidebarCollapsed', 'false');
        } else {
          setSidebarCollapsed(JSON.parse(saved));
        }
      }
    };

    // Definir estado inicial
    handleResize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('implantacao_sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main 
        className={`flex-1 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
        }`}
      >
        <Header onToggleSidebar={toggleSidebar} />
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
