import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de um SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
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
        setCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      } else {
        // Em telas maiores, manter o estado salvo pelo usuário
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved === null) {
          setCollapsed(false);
          localStorage.setItem('sidebarCollapsed', 'false');
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
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const value = {
    collapsed,
    toggleSidebar,
    isSmallScreen: window.innerWidth <= 768
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}; 