import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../../config/environment';
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
  FaRegStar,
  FaRoute,
  FaCar,
  FaUserTie,
  FaAllergies,
  FaUtensils,
  FaCalendarAlt,
  FaFileInvoice,
  FaShoppingCart
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

// Agrupamento dos itens do menu
const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/foods', icon: FaHome, label: 'Dashboard', screen: 'dashboard' },
    ]
  },
  {
    title: 'Suprimentos',
    items: [
      { path: '/cotacao', icon: FaClipboardList, label: 'Cotação', screen: 'cotacao' },
    ]
  },
  {
    title: 'Logística',
    items: [
      { path: '/foods/rotas', icon: FaRoute, label: 'Rotas', screen: 'rotas' },
      { path: '/foods/unidades-escolares', icon: FaBuilding, label: 'Unidades Escolares', screen: 'unidades_escolares' },
    ]
  },
  {
    title: 'Frotas',
    items: [
      { path: '/foods/veiculos', icon: FaCar, label: 'Veículos', screen: 'veiculos' },
      { path: '/foods/motoristas', icon: FaUserTie, label: 'Motoristas', screen: 'motoristas' },
      { path: '/foods/ajudantes', icon: FaUserTie, label: 'Ajudantes', screen: 'ajudantes' },
    ]
  },
  {
    title: 'Cadastros',
    items: [
      { path: '/foods/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
      { path: '/foods/fornecedores', icon: FaTruck, label: 'Fornecedores', screen: 'fornecedores' },
      { path: '/foods/clientes', icon: FaBuilding, label: 'Clientes', screen: 'clientes' },
      { path: '/foods/filiais', icon: FaStore, label: 'Filiais', screen: 'filiais' },
      { path: '/foods/produtos', icon: FaBox, label: 'Produtos', screen: 'produtos' },
      { path: '/foods/grupos', icon: FaLayerGroup, label: 'Grupos', screen: 'grupos' },
      { path: '/foods/subgrupos', icon: FaSitemap, label: 'Subgrupos', screen: 'subgrupos' },
      { path: '/foods/classes', icon: FaCubes, label: 'Classes', screen: 'classes' },
      { path: '/foods/produto-origem', icon: FaBox, label: 'Produtos Origem', screen: 'produto_origem' },
      { path: '/foods/produto-generico', icon: FaBox, label: 'Produtos Genéricos', screen: 'produto_generico' },
      { path: '/foods/intolerancias', icon: FaAllergies, label: 'Intolerâncias', screen: 'intolerancias' },
      { path: '/foods/unidades', icon: FaRulerCombined, label: 'Unidades', screen: 'unidades' },
      { path: '/foods/marcas', icon: FaTag, label: 'Marcas', screen: 'marcas' },
      { path: '/foods/patrimonios', icon: FaBuilding, label: 'Patrimônios', screen: 'patrimonios' },
      { path: '/foods/rotas-nutricionistas', icon: FaBuilding, label: 'Rotas Nutricionistas', screen: 'rotas_nutricionistas' },
      { path: '/foods/tipos-cardapio', icon: FaClipboardList, label: 'Tipos de Cardápio', screen: 'tipos_cardapio' },
      { path: '/foods/periodos-refeicao', icon: FaUtensils, label: 'Períodos de Refeição', screen: 'periodos_refeicao' },
      { path: '/foods/periodicidade', icon: FaCalendarAlt, label: 'Períodicidade', screen: 'periodicidade' },
      { path: '/foods/faturamento', icon: FaFileInvoice, label: 'Faturamento', screen: 'faturamento' },
      { path: '/foods/receitas', icon: FaUtensils, label: 'Receitas', screen: 'receitas' },
      { path: '/foods/necessidades-merenda', icon: FaShoppingCart, label: 'Necessidades da Merenda', screen: 'necessidades_merenda' },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/foods/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' },
    ]
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canView, loading } = usePermissions();
  
  // Estado para controlar expansão dos grupos
  const [expandedGroups, setExpandedGroups] = useState({
    'Principal': true,
    'Suprimentos': true,
    'Logística': true,
    'Frotas': true,
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
      {/* Overlay para mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
        ${collapsed ? 'md:translate-x-0 -translate-x-full' : 'translate-x-0'}
        ${collapsed ? 'sidebar collapsed' : 'sidebar'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-gray-200 text-center relative flex-shrink-0">
          <div className="flex items-center justify-center m-0">
            <img 
              src="/foods/logo-small.png" 
              alt="Foods Logo" 
              className={`object-contain ${collapsed ? 'h-8' : 'h-10'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className={`${collapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-green-600 rounded-full flex items-center justify-center text-white font-bold hidden`}
              style={{ display: 'none' }}
            >
              F
            </div>
            <span className={`
              text-green-500 font-bold ${collapsed ? 'text-base' : 'text-2xl'} ml-2
              ${collapsed ? 'hidden' : 'block'}
              whitespace-nowrap overflow-hidden text-ellipsis
            `}>
              Foods
            </span>
          </div>
          <button 
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-green-500 border-none rounded-full w-6 h-6 flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:bg-green-600 hover:scale-110 z-50 shadow-md md:-right-4 md:w-8 md:h-8"
            onClick={onToggle}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Campo de busca */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <input
              type="text"
              placeholder="Buscar páginas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-green-500 focus:bg-white focus:shadow-md placeholder-gray-500"
            />
          </div>
        )}

        {/* Seção de Favoritos */}
        {!collapsed && getFavoriteItems().length > 0 && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div 
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 cursor-pointer"
              onClick={() => setFavoritesExpanded(exp => !exp)}
            >
              <FaStar className="text-yellow-400" />
              Favoritos
              <span className="ml-auto">
                {favoritesExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {favoritesExpanded && (
              <div className="flex flex-col gap-1">
                {getFavoriteItems().map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 text-decoration-none text-gray-700 rounded-md transition-all duration-200 text-sm
                        hover:bg-gray-50 hover:text-green-500
                        ${isActive ? 'bg-green-500 text-white' : ''}
                      `}
                      onClick={(e) => {
                        if (item.path === '/cotacao') {
                          e.preventDefault();
                          const user = JSON.parse(localStorage.getItem('user') || '{}');
                          const userData = encodeURIComponent(JSON.stringify({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                          }));
                          const cotacaoUrl = `https://foods.terceirizemais.com.br/cotacao?user=${userData}`;
                          window.open(cotacaoUrl, '_blank');
                        }
                        if (window.innerWidth <= 768) {
                          onToggle();
                        }
                      }}
                    >
                      <div className={`mr-2 text-xs ${isActive ? 'text-white' : 'text-yellow-400'}`}>
                        <Icon />
                      </div>
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-0">
          {getFilteredGroups().map((group, groupIndex) => (
            <div key={groupIndex} className="my-2">
              <div 
                className={`
                  flex items-center justify-between px-5 py-2 cursor-pointer transition-all duration-300 border-b border-gray-100 mb-1
                  hover:bg-gray-50
                  ${collapsed ? 'hidden' : 'flex'}
                `}
                onClick={() => !collapsed && toggleGroup(group.title)}
              >
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {group.title}
                </div>
                {!collapsed && (
                  <div className="text-xs text-gray-400 transition-all duration-300">
                    {expandedGroups[group.title] ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                )}
              </div>
              <div 
                className={`
                  overflow-hidden transition-all duration-300
                  ${expandedGroups[group.title] ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  // Verificar se o usuário pode visualizar este item
                  const canViewItem = item.screen === 'dashboard' || canView(item.screen);
                  
                  if (!canViewItem) {
                    return null;
                  }
                  
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`
                        flex items-center px-5 py-2.5 text-gray-700 text-decoration-none transition-all duration-300 border-l-3 border-transparent text-sm
                        hover:bg-gray-50 hover:text-green-500 hover:border-l-green-500
                        ${isActive ? 'bg-green-100 text-green-500 border-l-green-500 font-semibold' : ''}
                      `}
                      onClick={(e) => {
                        // Se for o item de cotação, abrir em nova aba com dados do usuário
                        if (item.path === '/cotacao') {
                          e.preventDefault();
                          
                          // Usar dados do contexto de autenticação
                          const currentUser = user;
                          console.log('🔍 [FOODS DEBUG] User do contexto:', currentUser);
                          
                          // Verificar se temos dados válidos do usuário
                          if (!currentUser || !currentUser.id || !currentUser.nome || !currentUser.email) {
                            console.error('❌ [FOODS DEBUG] Dados do usuário incompletos:', currentUser);
                            alert('Erro: Dados do usuário não encontrados. Faça login novamente.');
                            return;
                          }
                          
                          const userData = {
                            id: currentUser.id,
                            name: currentUser.nome,
                            email: currentUser.email,
                            role: currentUser.tipo_de_acesso || 'usuario'
                          };
                          console.log('🔍 [FOODS DEBUG] UserData criado:', userData);
                          
                          // Salvar dados no localStorage ANTES de abrir a nova aba
                          localStorage.setItem('foodsUser', JSON.stringify(userData));
                          console.log('✅ [FOODS DEBUG] foodsUser salvo no localStorage:', localStorage.getItem('foodsUser'));
                          
                          // Preparar URL com dados do usuário como backup
                          const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
                          const cotacaoUrlWithSSO = `${config.cotacaoUrl}?sso=${userDataEncoded}`;
                          console.log('🔍 [FOODS DEBUG] URL de cotação:', cotacaoUrlWithSSO);
                          
                          // Aguardar um pouco para garantir que o localStorage foi salvo
                          setTimeout(() => {
                            // Abrir cotação em nova aba
                            const cotacaoWindow = window.open(cotacaoUrlWithSSO, '_blank');
                            
                            // Salvar referência da janela para possível fechamento
                            window.cotacaoWindow = cotacaoWindow;
                            
                            console.log('✅ [FOODS DEBUG] Nova aba de cotação aberta');
                          }, 100);
                        }
                        
                        // Fechar sidebar no mobile quando clicar em um item
                        if (window.innerWidth <= 768) {
                          onToggle();
                        }
                      }}
                    >
                      <div className={`${collapsed ? 'mr-0' : 'mr-3'} text-base min-w-5 text-center ${isActive ? 'text-green-500' : 'inherit'}`}>
                        <Icon />
                      </div>
                      <span className={`
                        text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1
                        ${collapsed ? 'hidden' : 'block'}
                      `}>
                        {item.label}
                      </span>
                      <button
                        className={`
                          bg-transparent border-none cursor-pointer p-1 rounded transition-all duration-200 ml-2
                          ${collapsed ? 'hidden' : 'block'}
                          ${isFavorite(item) ? 'text-yellow-400' : 'text-gray-300'}
                          hover:bg-yellow-50 hover:scale-110
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        title={isFavorite(item) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        {isFavorite(item) ? <FaStar /> : <FaRegStar />}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Botão de Logout */}
        <button 
          className="flex items-center w-full px-5 py-3 bg-transparent border-none text-red-500 cursor-pointer transition-all duration-300 border-l-3 border-transparent border-t border-gray-100 flex-shrink-0 hover:bg-red-50 hover:border-l-red-500"
          onClick={handleLogout}
        >
          <div className={`${collapsed ? 'mr-0' : 'mr-3'} text-base min-w-5 text-center`}>
            <FaSignOutAlt />
          </div>
          <span className={`
            text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1
            ${collapsed ? 'hidden' : 'block'}
          `}>
            Sair
          </span>
        </button>
      </div>
    </>
  );
};

export default Sidebar; 

