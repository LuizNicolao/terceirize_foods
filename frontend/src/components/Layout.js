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

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Detectar tamanho da tela e ajustar sidebar automaticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Definir estado inicial
    handleResize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <Header onToggleSidebar={toggleSidebar} />
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 