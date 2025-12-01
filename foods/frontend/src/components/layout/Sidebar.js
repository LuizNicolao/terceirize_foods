import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaBoxes,
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
  FaShoppingCart,
  FaClipboardCheck,
  FaCreditCard,
  FaCalendarAlt as FaCalendarAltPayment,
  FaFilePdf,
  FaDollarSign,
  FaWarehouse
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
      { path: '/foods/tipo-rota', icon: FaRoute, label: 'Tipo de Rota', screen: 'tipo_rota' },
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
    title: 'Cadastros Básicos',
    items: [
      { path: '/foods/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
      { path: '/foods/fornecedores', icon: FaTruck, label: 'Fornecedores', screen: 'fornecedores' },
      { path: '/foods/clientes', icon: FaBuilding, label: 'Clientes', screen: 'clientes' },
      { path: '/foods/filiais', icon: FaStore, label: 'Filiais', screen: 'filiais' },
      { path: '/foods/centro-custo', icon: FaDollarSign, label: 'Centro de Custo', screen: 'centro_custo' },
      { path: '/foods/almoxarifado', icon: FaWarehouse, label: 'Almoxarifado', screen: 'almoxarifado' },
      { path: '/foods/estoque', icon: FaBoxes, label: 'Estoque', screen: 'almoxarifado_estoque' },
    ]
  },
  {
    title: 'Produtos & Categorias',
    items: [
      { path: '/foods/produtos', icon: FaBox, label: 'Produtos', screen: 'produtos' },
      { path: '/foods/grupos', icon: FaLayerGroup, label: 'Grupos', screen: 'grupos' },
      { path: '/foods/subgrupos', icon: FaSitemap, label: 'Subgrupos', screen: 'subgrupos' },
      { path: '/foods/classes', icon: FaCubes, label: 'Classes', screen: 'classes' },
      { path: '/foods/produto-origem', icon: FaBox, label: 'Produtos Origem', screen: 'produto_origem' },
      { path: '/foods/produto-comercial', icon: FaBox, label: 'Produtos Comerciais', screen: 'produto_comercial' },
      { path: '/foods/produto-generico', icon: FaBox, label: 'Produtos Genéricos', screen: 'produto_generico' },
      { path: '/foods/intolerancias', icon: FaAllergies, label: 'Intolerâncias', screen: 'intolerancias' },
      { path: '/foods/unidades', icon: FaRulerCombined, label: 'Unidades', screen: 'unidades' },
      { path: '/foods/marcas', icon: FaTag, label: 'Marcas', screen: 'marcas' },
    ]
  },
  {
    title: 'Gestão & Operações',
    items: [
      { path: '/foods/notas-fiscais', icon: FaFileInvoice, label: 'Notas Fiscais', screen: 'notas_fiscais' },
      { path: '/foods/patrimonios', icon: FaBuilding, label: 'Patrimônios', screen: 'patrimonios' },
      { path: '/foods/rotas-nutricionistas', icon: FaBuilding, label: 'Rotas Nutricionistas', screen: 'rotas_nutricionistas' },
      { path: '/foods/tipos-cardapio', icon: FaClipboardList, label: 'Tipos de Cardápio', screen: 'tipos_cardapio' },
      { path: '/foods/periodos-refeicao', icon: FaUtensils, label: 'Períodos de Refeição', screen: 'periodos_refeicao' },
      { path: '/foods/periodicidade', icon: FaCalendarAlt, label: 'Períodicidade', screen: 'periodicidade' },
      { path: '/foods/faturamento', icon: FaFileInvoice, label: 'Faturamento', screen: 'faturamento' },
      { path: '/foods/receitas', icon: FaUtensils, label: 'Receitas', screen: 'receitas' },
      { path: '/foods/necessidades-merenda', icon: FaShoppingCart, label: 'Necessidades da Merenda', screen: 'necessidades_merenda' },
      { path: '/foods/plano-amostragem', icon: FaClipboardCheck, label: 'Plano de Amostragem', screen: 'plano_amostragem' },
      { path: '/foods/relatorio-inspecao', icon: FaClipboardCheck, label: 'Relatório de Inspeção', screen: 'relatorio_inspecao' },
      { path: '/foods/solicitacoes-compras', icon: FaShoppingCart, label: 'Solicitações de Compras', screen: 'solicitacoes_compras' },
      { path: '/foods/formas-pagamento', icon: FaCreditCard, label: 'Formas de Pagamento', screen: 'formas_pagamento' },
      { path: '/foods/prazos-pagamento', icon: FaCalendarAltPayment, label: 'Prazos de Pagamento', screen: 'prazos_pagamento' },
      { path: '/foods/pedidos-compras', icon: FaFileInvoice, label: 'Pedidos de Compras', screen: 'pedidos_compras' },
      { path: '/foods/calendario', icon: FaCalendarAlt, label: 'Calendário', screen: 'calendario' },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/foods/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' },
      { path: '/foods/pdf-templates', icon: FaFilePdf, label: 'Templates de PDF', screen: 'pdf_templates' },
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
    'Logística': true,
    'Frotas': true,
    'Cadastros Básicos': true,
    'Produtos & Categorias': true,
    'Gestão & Operações': true,
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
                          const ssoToken = localStorage.getItem('ssoToken');
                          
                          if (ssoToken) {
                            const url = `https://foods.terceirizemais.com.br/cotacao?sso_token=${ssoToken}`;
                            window.open(url, '_blank');
                          } else {
                            window.open('https://foods.terceirizemais.com.br/cotacao', '_blank');
                          }
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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
                        // Se for o item de cotação, abrir em nova aba com token SSO
                        if (item.path === '/cotacao') {
                          e.preventDefault();
                          const ssoToken = localStorage.getItem('ssoToken');
                          
                          if (ssoToken) {
                            const url = `https://foods.terceirizemais.com.br/cotacao?sso_token=${ssoToken}`;
                            window.open(url, '_blank');
                          } else {
                            window.open('https://foods.terceirizemais.com.br/cotacao', '_blank');
                          }
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

