import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Carregar estado salvo do localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Estado padrão baseado no tamanho da tela
    return window.innerWidth <= 768;
  });

  // Detectar tamanho da tela e ajustar sidebar automaticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      } else {
        // Em telas maiores, manter o estado salvo pelo usuário
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved === null) {
          setSidebarCollapsed(false);
          localStorage.setItem('sidebarCollapsed', 'false');
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
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main 
        className={`flex-1 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
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
