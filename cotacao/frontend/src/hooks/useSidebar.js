import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
import { menuService } from '../services/menu';

export const useSidebar = () => {
  const location = useLocation();
  const { canView, loading: permissionsLoading } = usePermissions();
  
  // Estado para controlar expansão dos grupos
  const [expandedGroups, setExpandedGroups] = useState({
    'Principal': true,
    'Gestão': true,
    'Administração': true
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
    const allItems = menuService.getAllMenuItems();
    return allItems.filter(item => isFavorite(item));
  };

  // Função para filtrar itens baseado na busca
  const getFilteredGroups = () => {
    return menuService.filterMenuItems(searchTerm);
  };

  // Função para alternar expansão de grupo
  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  // Função para verificar se o usuário pode visualizar um item
  const canViewItem = (item) => {
    const hasPermission = item.screen === 'dashboard' || canView(item.screen);
    console.log(`🔍 Permissão para ${item.screen}:`, hasPermission);
    return hasPermission;
  };

  // Função para verificar se um item está ativo
  const isItemActive = (itemPath) => {
    return menuService.isItemActive(itemPath, location.pathname);
  };

  return {
    // Estados
    expandedGroups,
    favoritesExpanded,
    searchTerm,
    favorites,
    permissionsLoading,
    
    // Funções
    toggleFavorite,
    isFavorite,
    getFavoriteItems,
    getFilteredGroups,
    toggleGroup,
    canViewItem,
    isItemActive,
    setSearchTerm,
    setFavoritesExpanded
  };
};
