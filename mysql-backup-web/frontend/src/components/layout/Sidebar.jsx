import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaDatabase,
  FaCalendarAlt,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaStar,
  FaRegStar,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

// Agrupamento dos itens do menu
const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/', icon: FaHome, label: 'Dashboard' },
    ]
  },
  {
    title: 'Backups',
    items: [
      { path: '/backups', icon: FaDatabase, label: 'Backups' },
      { path: '/schedules', icon: FaCalendarAlt, label: 'Agendamentos' },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/settings', icon: FaCog, label: 'Configurações' },
    ]
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Estado para controlar expansão dos grupos
  const [expandedGroups, setExpandedGroups] = useState({
    'Principal': true,
    'Backups': true,
    'Configurações': true
  });

  // Estado para expandir/recolher favoritos
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  // Estado para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para favoritos (carregar do localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('mysql_backup_sidebarFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Função para adicionar/remover favorito
  const toggleFavorite = (item) => {
    const itemKey = `${item.path}-${item.label}`;
    const newFavorites = favorites.includes(itemKey)
      ? favorites.filter(fav => fav !== itemKey)
      : [...favorites, itemKey];
    
    setFavorites(newFavorites);
    localStorage.setItem('mysql_backup_sidebarFavorites', JSON.stringify(newFavorites));
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
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity ${
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
              src={`${process.env.PUBLIC_URL || '/mysql-backup-web'}/logo-small.png`} 
              alt="MySQL Backup Web Logo" 
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
              M
            </div>
            <span className={`
              text-green-500 font-bold ${collapsed ? 'text-base' : 'text-2xl'} ml-2
              ${collapsed ? 'hidden' : 'block'}
              whitespace-nowrap overflow-hidden text-ellipsis
            `}>
              MySQL Backup
            </span>
          </div>
          <button 
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-green-500 border-none rounded-full w-6 h-6 flex items-center justify-center text-white cursor-pointer transition-colors hover:bg-green-600 z-50 shadow-md md:-right-4 md:w-8 md:h-8"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 transition-colors focus:outline-none focus:border-green-500 focus:bg-white focus:shadow-md placeholder-gray-500"
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
                      onClick={() => {
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
                  flex items-center justify-between px-5 py-2 cursor-pointer transition-colors border-b border-gray-100 mb-1
                  hover:bg-gray-50
                  ${collapsed ? 'hidden' : 'flex'}
                `}
                onClick={() => !collapsed && toggleGroup(group.title)}
              >
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {group.title}
                </div>
                {!collapsed && (
                  <div className="text-xs text-gray-400 transition-colors">
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
                  
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`
                        flex items-center px-5 py-2.5 text-gray-700 text-decoration-none transition-colors border-l-[3px] border-transparent text-sm
                        hover:bg-gray-50 hover:text-green-500 hover:border-l-green-500
                        ${isActive ? 'bg-green-100 text-green-500 border-l-green-500 font-semibold' : ''}
                      `}
                      onClick={() => {
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
                          hover:bg-yellow-50
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
          className="flex items-center w-full px-5 py-3 bg-transparent border-none text-red-500 cursor-pointer transition-colors border-l-3 border-transparent border-t border-gray-100 flex-shrink-0 hover:bg-red-50 hover:border-l-red-500"
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

