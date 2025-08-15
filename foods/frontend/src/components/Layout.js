import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '60px' : '250px'};
  transition: margin-left 0.3s ease;
  background-color: var(--light-gray);
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100vw;
    max-width: 100vw;
  }
`;

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
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <Header onToggleSidebar={toggleSidebar} />
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 