import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import styled from 'styled-components';
import { colors, typography, shadows } from '../design-system';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '60px' : '250px'};
  transition: margin-left 0.3s ease;
  background-color: ${colors.neutral.lightGray};
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const HeaderContainer = styled.header`
  background: ${colors.neutral.white};
  box-shadow: ${shadows.md};
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  color: ${colors.primary.green};
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: ${colors.neutral.lightGray};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${colors.primary.lightGreen};
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
`;

const UserRole = styled.span`
  color: ${colors.neutral.gray};
  font-size: 12px;
`;

const ContentArea = styled.div`
  padding: 20px;
`;

const Layout = ({ children }) => {
  const { user } = useAuth();
  const { isExpanded, isSmallScreen } = useSidebar();

  // Em telas pequenas, sempre considera como recolhida
  const isEffectivelyCollapsed = isSmallScreen || !isExpanded;

  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    return user.name ? user.name.split(' ')[0] : 'Usuário';
  };

  const getUserRole = () => {
    if (!user) return '';
    const roles = {
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'supervisor': 'Supervisor',
      'comprador': 'Comprador'
    };
    return roles[user.role] || user.role || '';
  };

  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent $sidebarCollapsed={isEffectivelyCollapsed}>
        <HeaderContainer>
          <LeftSection>
            <Title>Sistema de Cotação</Title>
          </LeftSection>

          <RightSection>
            <UserInfo>
              <div>
                <UserName>Bem-vindo, {getUserDisplayName()}!</UserName>
                {getUserRole() && <UserRole>{getUserRole()}</UserRole>}
              </div>
            </UserInfo>
          </RightSection>
        </HeaderContainer>

        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 