import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useSidebar } from '../hooks/useSidebar';
import { menuGroups } from '../utils/sidebarUtils';
import { 
  SidebarHeader, 
  SidebarSearch, 
  SidebarMenu, 
  SidebarFavorites 
} from './sidebar/index';

const Sidebar = ({ collapsed, onToggle }) => {
  const {
    location,
    loading,
    canView,
    expandedGroups,
    favoritesExpanded,
    searchTerm,
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteItems,
    getFilteredGroups,
    handleLogout,
    toggleGroup,
    setFavoritesExpanded,
    setSearchTerm
  } = useSidebar();

  // Loading state
  if (loading) {
    return (
      <div className="fixed left-0 top-0 h-full bg-white shadow-lg z-50 w-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const favoriteItems = getFavoriteItems();
  const filteredGroups = getFilteredGroups();

  return (
    <>
      {/* Overlay para mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } md:translate-x-0 ${
        collapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        
        {/* Cabeçalho */}
        <SidebarHeader collapsed={collapsed} onToggle={onToggle} />

        {/* Busca */}
        <SidebarSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          collapsed={collapsed} 
        />

        {/* Favoritos */}
        <SidebarFavorites
          favorites={favoriteItems}
          collapsed={collapsed}
          expanded={favoritesExpanded}
          onToggleExpanded={() => setFavoritesExpanded(!favoritesExpanded)}
          currentPath={location.pathname}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
        />

        {/* Menu Principal */}
        <SidebarMenu
          groups={filteredGroups}
          collapsed={collapsed}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
          currentPath={location.pathname}
          canView={canView}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
        />

        {/* Footer com Logout */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 