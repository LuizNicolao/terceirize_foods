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
  FaTag,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSitemap,
  FaCubes,
  FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

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
  display: flex;
  flex-direction: column;

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
  color: var(--primary-green);
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
  background: var(--primary-green);
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
    background: var(--dark-green);
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

const menuItems = [
  { path: '/', icon: FaHome, label: 'Dashboard', screen: 'dashboard' },
  { path: '/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
  { path: '/fornecedores', icon: FaTruck, label: 'Fornecedores', screen: 'fornecedores' },
  { path: '/produtos', icon: FaBox, label: 'Produtos', screen: 'produtos' },
  { path: '/grupos', icon: FaLayerGroup, label: 'Grupos', screen: 'grupos' },
  { path: '/subgrupos', icon: FaSitemap, label: 'Subgrupos', screen: 'subgrupos' },
  { path: '/classes', icon: FaCubes, label: 'Classes', screen: 'classes' },
  { path: '/nome-generico-produto', icon: FaFileAlt, label: 'Nomes Genéricos', screen: 'nome_generico_produto' },
  { path: '/unidades', icon: FaRulerCombined, label: 'Unidades', screen: 'unidades' },
  { path: '/marcas', icon: FaTag, label: 'Marcas', screen: 'marcas' },
  { path: '/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { canView, loading } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Overlay $visible={!collapsed} onClick={onToggle} />
      <SidebarContainer $collapsed={collapsed}>
        <SidebarHeader>
          <Logo $collapsed={collapsed}>
            {collapsed ? 'F' : 'Foods'}
          </Logo>
          <ToggleButton onClick={onToggle}>
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </ToggleButton>
        </SidebarHeader>
        
        <Nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Verificar se o usuário pode visualizar este item
            // Dashboard sempre é visível, outros itens dependem das permissões
            const canViewItem = item.screen === 'dashboard' || canView(item.screen);
            
            if (!canViewItem) {
              return null; // Não renderizar o item se não tiver permissão
            }
            
            return (
              <NavItem 
                key={item.path} 
                to={item.path}
                className={isActive ? 'active' : ''}
                onClick={() => {
                  // Fechar sidebar no mobile quando clicar em um item
                  if (window.innerWidth <= 768) {
                    onToggle();
                  }
                }}
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
    </>
  );
};

export default Sidebar; 