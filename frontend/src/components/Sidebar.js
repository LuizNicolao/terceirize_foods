import React, { useState } from 'react';
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
  FaFileAlt,
  FaBuilding,
  FaCog,
  FaDatabase,
  FaChevronDown,
  FaChevronUp,
  FaStore,
  FaClipboardList,
  FaExternalLinkAlt
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
  flex-shrink: 0;
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
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  
  /* Estilização da scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
`;

const MenuGroup = styled.div`
  margin: 8px 0;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;

  &:hover {
    background-color: var(--light-gray);
  }

  display: ${props => props.$collapsed ? 'none' : 'flex'};
`;

const GroupTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GroupToggle = styled.div`
  font-size: 10px;
  color: #999;
  transition: all 0.3s ease;
`;

const GroupContent = styled.div`
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  opacity: ${props => props.$expanded ? '1' : '0'};
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: var(--dark-gray);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  font-size: 13px;

  &:hover {
    background-color: var(--light-gray);
    color: var(--primary-green);
    border-left-color: var(--primary-green);
  }

  &.active {
    background-color: var(--light-green);
    color: var(--primary-green);
    border-left-color: var(--primary-green);
    font-weight: 600;
  }
`;

const NavIcon = styled.div`
  margin-right: ${props => props.$collapsed ? '0' : '12px'};
  font-size: 16px;
  min-width: 20px;
  text-align: center;
  color: ${props => props.$active ? 'var(--primary-green)' : 'inherit'};
`;

const NavText = styled.span`
  font-size: 13px;
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
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;

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

// Agrupamento dos itens do menu
const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/', icon: FaHome, label: 'Dashboard', screen: 'dashboard' },
    ]
  },
  {
    title: 'Cadastros',
    items: [
      { path: '/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
      { path: '/fornecedores', icon: FaTruck, label: 'Fornecedores', screen: 'fornecedores' },
      { path: '/clientes', icon: FaBuilding, label: 'Clientes', screen: 'clientes' },
      { path: '/filiais', icon: FaStore, label: 'Filiais', screen: 'filiais' },
      { path: '/produtos', icon: FaBox, label: 'Produtos', screen: 'produtos' },
      { path: '/grupos', icon: FaLayerGroup, label: 'Grupos', screen: 'grupos' },
      { path: '/subgrupos', icon: FaSitemap, label: 'Subgrupos', screen: 'subgrupos' },
      { path: '/classes', icon: FaCubes, label: 'Classes', screen: 'classes' },
      { path: '/nome-generico-produto', icon: FaFileAlt, label: 'Nomes Genéricos', screen: 'nome_generico_produto' },
      { path: '/unidades', icon: FaRulerCombined, label: 'Unidades', screen: 'unidades' },
      { path: '/marcas', icon: FaTag, label: 'Marcas', screen: 'marcas' },
    ]
  },
  {
    title: 'Suprimentos',
    items: [
      { path: '/cotacao', icon: FaClipboardList, label: 'Cotação', screen: 'cotacao', external: true },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' },
    ]
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout, token } = useAuth();
  const { canView, loading } = usePermissions();
  
  // Estado para controlar expansão dos grupos
  const [expandedGroups, setExpandedGroups] = useState({
    'Principal': true,
    'Cadastros': true,
    'Suprimentos': true,
    'Configurações': true
  });

  const handleLogout = () => {
    logout();
  };

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const handleExternalLink = async (item) => {
    if (item.external) {
      try {
        console.log('🔗 Iniciando integração...');
        console.log('🎫 Token:', token ? 'Presente' : 'Ausente');
        
        if (!token) {
          console.error('❌ Token não encontrado');
          return;
        }
        
        // Fazer requisição para obter URL de integração
        const response = await fetch('/api/integration/cotacao', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ URL gerada:', data.url);
          // Abrir em nova aba
          window.open(data.url, '_blank');
        } else {
          const errorData = await response.json();
          console.error('❌ Erro ao obter URL de integração:', errorData);
        }
      } catch (error) {
        console.error('❌ Erro ao acessar sistema de cotação:', error);
      }
    }
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
          {menuGroups.map((group, groupIndex) => (
            <MenuGroup key={groupIndex}>
              <GroupHeader 
                $collapsed={collapsed}
                onClick={() => !collapsed && toggleGroup(group.title)}
              >
                <GroupTitle>
                  {group.title}
                </GroupTitle>
                {!collapsed && (
                  <GroupToggle>
                    {expandedGroups[group.title] ? <FaChevronUp /> : <FaChevronDown />}
                  </GroupToggle>
                )}
              </GroupHeader>
              <GroupContent $expanded={expandedGroups[group.title]}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  // Verificar se o usuário pode visualizar este item
                  const canViewItem = item.screen === 'dashboard' || canView(item.screen);
                  
                  if (!canViewItem) {
                    return null;
                  }
                  
                  return (
                    <NavItem 
                      key={item.path} 
                      to={item.external ? '#' : item.path}
                      className={isActive ? 'active' : ''}
                      onClick={(e) => {
                        if (item.external) {
                          e.preventDefault();
                          handleExternalLink(item);
                        }
                        // Fechar sidebar no mobile quando clicar em um item
                        if (window.innerWidth <= 768) {
                          onToggle();
                        }
                      }}
                    >
                      <NavIcon $collapsed={collapsed} $active={isActive}>
                        <Icon />
                      </NavIcon>
                      <NavText $collapsed={collapsed}>
                        {item.label}
                        {item.external && <FaExternalLinkAlt style={{ marginLeft: '8px', fontSize: '10px' }} />}
                      </NavText>
                    </NavItem>
                  );
                })}
              </GroupContent>
            </MenuGroup>
          ))}
        </Nav>

        <LogoutButton onClick={handleLogout}>
          <NavIcon $collapsed={collapsed}>
            <FaSignOutAlt />
          </NavIcon>
          <NavText $collapsed={collapsed}>
            Sair
          </NavText>
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 