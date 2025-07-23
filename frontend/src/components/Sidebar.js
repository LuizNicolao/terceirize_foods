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
  FaSearch,
  FaStar,
  FaRegStar
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

const SearchContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
    background: white;
    box-shadow: 0 0 0 2px rgba(0, 114, 62, 0.1);
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const FavoritesSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

const FavoritesTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FavoritesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FavoriteItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  text-decoration: none;
  color: var(--dark-gray);
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 13px;

  &:hover {
    background: #f8f9fa;
    color: var(--primary-green);
  }

  &.active {
    background: var(--primary-green);
    color: white;
  }
`;

const FavoriteIcon = styled.div`
  margin-right: 8px;
  font-size: 12px;
  color: ${props => props.$active ? 'white' : '#ffc107'};
`;

const FavoriteText = styled.span`
  flex: 1;
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
  flex: 1;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  color: #ffc107;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: ${props => props.$collapsed ? '0' : '1'};
  margin-left: 8px;
  display: ${props => props.$collapsed ? 'none' : 'block'};

  &:hover {
    background: rgba(255, 193, 7, 0.1);
    transform: scale(1.1);
  }

  &.favorited {
    color: #ffc107;
  }

  &.not-favorited {
    color: #e0e0e0;
  }
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
    title: 'Suprimentos',
    items: [
      { path: '/cotacao', icon: FaClipboardList, label: 'Cotação', screen: 'cotacao' },
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
    title: 'Configurações',
    items: [
      { path: '/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' },
    ]
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { canView, loading } = usePermissions();
  
  // Estado para controlar expansão dos grupos
  const [expandedGroups, setExpandedGroups] = useState({
    'Principal': true,
    'Suprimentos': true,
    'Cadastros': true,
    'Configurações': true
  });

  // Estado para expandir/recolher favoritos
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  // Estado para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para favoritos (carregar do localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('sidebarFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Função para adicionar/remover favorito
  const toggleFavorite = (item) => {
    const itemKey = `${item.path}-${item.label}`;
    const newFavorites = favorites.includes(itemKey)
      ? favorites.filter(fav => fav !== itemKey)
      : [...favorites, itemKey];
    
    setFavorites(newFavorites);
    localStorage.setItem('sidebarFavorites', JSON.stringify(newFavorites));
  };

  // Função para verificar se um item é favorito
  const isFavorite = (item) => {
    const itemKey = `${item.path}-${item.label}`;
    return favorites.includes(itemKey);
  };

  // Função para obter itens favoritos
  const getFavoriteItems = () => {
    const allItems = menuGroups.flatMap(group => group.items);
    return allItems.filter(item => isFavorite(item));
  };

  // Função para filtrar itens baseado na busca
  const getFilteredGroups = () => {
    if (!searchTerm.trim()) {
      return menuGroups;
    }

    return menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
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

        {/* Campo de busca */}
        {!collapsed && (
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar páginas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        )}

        {/* Seção de Favoritos */}
        {!collapsed && getFavoriteItems().length > 0 && (
          <FavoritesSection>
            <FavoritesTitle style={{ cursor: 'pointer' }} onClick={() => setFavoritesExpanded(exp => !exp)}>
              <FaStar style={{ color: '#ffc107' }} />
              Favoritos
              <span style={{ marginLeft: 'auto' }}>
                {favoritesExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </FavoritesTitle>
            {favoritesExpanded && (
              <FavoritesList>
                {getFavoriteItems().map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <FavoriteItem 
                      key={item.path} 
                      to={item.path}
                      className={isActive ? 'active' : ''}
                      onClick={(e) => {
                        if (item.path === '/cotacao') {
                          e.preventDefault();
                          const token = localStorage.getItem('token');
                          if (token) {
                            const ssoUrl = `http://82.29.57.43:3002?sso_token=${token}`;
                            window.open(ssoUrl, '_blank');
                          } else {
                            window.open('http://82.29.57.43:3002', '_blank');
                          }
                        }
                        if (window.innerWidth <= 768) {
                          onToggle();
                        }
                      }}
                    >
                      <FavoriteIcon $active={isActive}>
                        <Icon />
                      </FavoriteIcon>
                      <FavoriteText>{item.label}</FavoriteText>
                    </FavoriteItem>
                  );
                })}
              </FavoritesList>
            )}
          </FavoritesSection>
        )}
        
        <Nav>
          {getFilteredGroups().map((group, groupIndex) => (
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
                      to={item.path}
                      className={isActive ? 'active' : ''}
                      onClick={(e) => {
                        // Se for o item de cotação, abrir em nova aba com SSO
                        if (item.path === '/cotacao') {
                          e.preventDefault();
                          const token = localStorage.getItem('token');
                          console.log('🔍 Token encontrado no sistema principal:', token ? 'Sim' : 'Não');
                          
                          if (token) {
                            // Passar o token como parâmetro na URL
                            const ssoUrl = `http://82.29.57.43:3002?sso_token=${token}`;
                            console.log('🔍 Abrindo URL SSO:', ssoUrl);
                            window.open(ssoUrl, '_blank');
                          } else {
                            console.log('🔍 Nenhum token encontrado, abrindo sem SSO');
                            window.open('http://82.29.57.43:3002', '_blank');
                          }
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
                      </NavText>
                      <FavoriteButton
                        $collapsed={collapsed}
                        className={isFavorite(item) ? 'favorited' : 'not-favorited'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        title={isFavorite(item) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        {isFavorite(item) ? <FaStar /> : <FaRegStar />}
                      </FavoriteButton>
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