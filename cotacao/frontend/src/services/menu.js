import { 
  FaHome, 
  FaUsers, 
  FaClipboardList,
  FaChartLine,
  FaThumbsUp,
  FaSitemap,
  FaUserShield
} from 'react-icons/fa';

// Configuração dos grupos de menu
export const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard', screen: 'dashboard' },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { path: '/cotacoes', icon: FaClipboardList, label: 'Cotações', screen: 'cotacoes' },
      { path: '/supervisor', icon: FaSitemap, label: 'Supervisor', screen: 'supervisor' },
      { path: '/aprovacoes', icon: FaThumbsUp, label: 'Aprovações', screen: 'aprovacoes' },
      { path: '/saving', icon: FaChartLine, label: 'Saving', screen: 'saving' },
    ]
  },
  {
    title: 'Administração',
    items: [
      { path: '/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
      { path: '/permissoes', icon: FaUserShield, label: 'Permissões', screen: 'permissoes' }
    ]
  }
];

export const menuService = {
  // Obter todos os grupos de menu
  getMenuGroups: () => {
    return menuGroups;
  },

  // Obter todos os itens de menu
  getAllMenuItems: () => {
    return menuGroups.flatMap(group => group.items);
  },

  // Filtrar itens por termo de busca
  filterMenuItems: (searchTerm) => {
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
  },

  // Obter item por path
  getMenuItemByPath: (path) => {
    const allItems = menuService.getAllMenuItems();
    return allItems.find(item => item.path === path);
  },

  // Verificar se item é ativo
  isItemActive: (itemPath, currentPath) => {
    return itemPath === currentPath;
  }
};
