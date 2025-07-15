import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  background-color: var(--light-gray);
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 60px;
  }
`;

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} />
      <div style={{ flex: 1, marginLeft: sidebarCollapsed ? '60px' : '250px' }}>
        <Header onToggleSidebar={toggleSidebar} />
        <MainContent style={{ marginLeft: 0 }}>
          {children}
        </MainContent>
      </div>
    </LayoutContainer>
  );
};

export default Layout; 