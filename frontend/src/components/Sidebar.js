import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaHome, 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaRulerCombined,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: var(--white);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  width: ${props => props.$collapsed ? '60px' : '250px'};
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
`;

const Logo = styled.h2`
  color: var(--primary-green);
  font-size: ${props => props.$collapsed ? '16px' : '24px'};
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Nav = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--dark-gray);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background-color: var(--light-gray);
    color: var(--primary-green);
    border-left-color: var(--primary-green);
  }

  &.active {
    background-color: var(--light-green);
    color: var(--primary-green);
    border-left-color: var(--primary-green);
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
  color: var(--error-red);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background-color: #ffebee;
    border-left-color: var(--error-red);
  }
`;

const menuItems = [
  { path: '/', icon: FaHome, label: 'Dashboard' },
  { path: '/usuarios', icon: FaUsers, label: 'Usuários' },
  { path: '/fornecedores', icon: FaTruck, label: 'Fornecedores' },
  { path: '/produtos', icon: FaBox, label: 'Produtos' },
  { path: '/grupos', icon: FaLayerGroup, label: 'Grupos' },
  { path: '/unidades', icon: FaRulerCombined, label: 'Unidades' },
  { path: '/configuracoes', icon: FaCog, label: 'Configurações' },
];

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader>
        <Logo $collapsed={collapsed}>
          {collapsed ? 'F' : 'Foods'}
        </Logo>
      </SidebarHeader>
      
      <Nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavItem 
              key={item.path} 
              to={item.path}
              className={isActive ? 'active' : ''}
            >
              <NavIcon $collapsed={collapsed}>
                <Icon />
              </NavIcon>
              <NavText $collapsed={collapsed}>
                {item.label}
              </NavText>
            </NavItem>
          );
        })}
      </Nav>

      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <LogoutButton onClick={handleLogout}>
          <NavIcon $collapsed={collapsed}>
            <FaSignOutAlt />
          </NavIcon>
          <NavText $collapsed={collapsed}>
            Sair
          </NavText>
        </LogoutButton>
      </div>
    </SidebarContainer>
  );
};

export default Sidebar; 