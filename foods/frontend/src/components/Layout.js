import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sidebar } from './sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: var(--sidebar-width, 250px);
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
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 