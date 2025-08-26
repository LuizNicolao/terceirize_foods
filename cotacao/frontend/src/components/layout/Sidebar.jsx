import React from 'react';
import { 
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../hooks/useSidebar';
import SidebarGroup from './SidebarGroup';

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout } = useAuth();
  const {
    expandedGroups,
    favoritesExpanded,
    searchTerm,
    getFavoriteItems,
    getFilteredGroups,
    toggleGroup,
    toggleFavorite,
    isFavorite,
    canViewItem,
    isItemActive,
    setSearchTerm,
    setFavoritesExpanded
  } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  const handleItemClick = () => {
    // Fechar sidebar no mobile quando clicar em um item
    if (window.innerWidth <= 768) {
      onToggle();
    }
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
            <div 
              className={`${collapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-green-600 rounded-full flex items-center justify-center text-white font-bold`}
            >
              C
            </div>
            <span className={`
              text-green-500 font-bold ${collapsed ? 'text-base' : 'text-2xl'} ml-2
              ${collapsed ? 'hidden' : 'block'}
              whitespace-nowrap overflow-hidden text-ellipsis
            `}>
              Cotação
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
                  const isActive = isItemActive(item.path);
                  return (
                    <div
                      key={item.path}
                      className={`
                        flex items-center px-3 py-2 text-decoration-none text-gray-700 rounded-md transition-all duration-200 text-sm cursor-pointer
                        hover:bg-gray-50 hover:text-green-500
                        ${isActive ? 'bg-green-500 text-white' : ''}
                      `}
                      onClick={handleItemClick}
                    >
                      <div className={`mr-2 text-xs ${isActive ? 'text-white' : 'text-yellow-400'}`}>
                        <Icon />
                      </div>
                      <span className="flex-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-0">
          {getFilteredGroups().map((group, groupIndex) => (
            <SidebarGroup
              key={groupIndex}
              group={group}
              expanded={expandedGroups[group.title]}
              collapsed={collapsed}
              onToggleGroup={toggleGroup}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              isItemActive={isItemActive}
              canViewItem={canViewItem}
              onItemClick={handleItemClick}
            />
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
