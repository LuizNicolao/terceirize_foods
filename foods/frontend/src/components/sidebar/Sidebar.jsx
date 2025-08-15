import React, { useState, useEffect } from 'react';
import { SidebarContainer } from './styles';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // Carregar estado salvo do localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Estado padrão baseado no tamanho da tela
    return window.innerWidth <= 768;
  });

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Detectar tamanho da tela e ajustar sidebar automaticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      }
    };

    // Definir estado inicial
    handleResize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualizar variável CSS para o MainContent
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      collapsed ? '60px' : '250px'
    );
  }, [collapsed]);

  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader collapsed={collapsed} onToggle={handleToggle} />
      <SidebarMenu collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </SidebarContainer>
  );
};

export default Sidebar;
