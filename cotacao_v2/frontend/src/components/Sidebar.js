import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import PermissionGuard from './PermissionGuard';
import styled from 'styled-components';
import { 
  FaUsers, 
  FaTruck, 
  FaSitemap, 
  FaThumbsUp,
  FaChevronLeft, 
  FaChevronRight, 
  FaSignOutAlt,
  FaChartLine
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';

// Componentes estilizados
const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: ${colors.neutral.white};
  box-shadow: ${shadows.sidebar};
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: ${props => props.$collapsed ? '60px' : '250px'};

  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '0' : '250px'};
    transform: ${props => props.$collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  position: relative;
`;

const Logo = styled.h2`
  color: ${colors.primary.green};
  font-size: ${props => props.$collapsed ? '16px' : '24px'};
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  background: ${colors.primary.green};
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    right: -15px;
    width: 30px;
    height: 30px;
  }
`;

const Nav = styled.nav`
  padding: 20px 0;
  flex: 1;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: ${colors.neutral.darkGray};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: ${colors.neutral.lightGray};
    color: ${colors.primary.green};
    border-left-color: ${colors.primary.green};
  }

  &.active {
    background-color: ${colors.primary.lightGreen};
    color: ${colors.primary.green};
    border-left-color: ${colors.primary.green};
  }
`;

const NavIcon = styled.div`
  margin-right: ${props => props.$collapsed ? '0' : '12px'};
  font-size: 18px;
  min-width: 20px;
  text-align: center;
`;

const NavText = styled.span`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: ${colors.status.error};
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background-color: #ffebee;
    border-left-color: ${colors.status.error};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.$visible ? 'block' : 'none'};

  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = () => {
  const { isExpanded, toggleSidebar, isSmallScreen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    navigate(path);
    // Fechar sidebar no mobile quando clicar em um item
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaChartLine,
      path: '/dashboard',
      screen: 'dashboard'
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: FaUsers,
      path: '/usuarios',
      screen: 'usuarios'
    },
    {
      id: 'cotacoes',
      label: 'Cotações',
      icon: FaTruck,
      path: '/cotacoes',
      screen: 'cotacoes'
    },
    {
      id: 'supervisor',
      label: 'Supervisor',
      icon: FaSitemap,
      path: '/supervisor',
      screen: 'supervisor'
    },
    {
      id: 'aprovacoes',
      label: 'Aprovações',
      icon: FaThumbsUp,
      path: '/aprovacoes',
      screen: 'aprovacoes'
    },
    {
      id: 'saving',
      label: 'Saving',
      icon: FaChartLine,
      path: '/saving',
      screen: 'saving'
    }
  ];

  return (
    <>
      <Overlay $visible={!isExpanded && isSmallScreen} onClick={toggleSidebar} />
      <SidebarContainer $collapsed={!isExpanded}>
        <SidebarHeader>
          <Logo $collapsed={!isExpanded}>
            {!isExpanded ? 'C' : 'Cotação'}
          </Logo>
          <ToggleButton onClick={toggleSidebar}>
            {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
          </ToggleButton>
        </SidebarHeader>
        
        <Nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <PermissionGuard key={item.id} screen={item.screen} action="can_view">
                <NavItem 
                  className={isActive ? 'active' : ''}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <NavIcon $collapsed={!isExpanded}>
                    <Icon />
                  </NavIcon>
                  <NavText $collapsed={!isExpanded}>
                    {item.label}
                  </NavText>
                </NavItem>
              </PermissionGuard>
            );
          })}
        </Nav>

        <div style={{ marginTop: 'auto', padding: '20px 0' }}>
          <LogoutButton onClick={handleLogout}>
            <NavIcon $collapsed={!isExpanded}>
              <FaSignOutAlt />
            </NavIcon>
            <NavText $collapsed={!isExpanded}>
              Sair
            </NavText>
          </LogoutButton>
        </div>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 