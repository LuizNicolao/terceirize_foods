import { 
  FaHome, 
  FaUsers, 
  FaClipboardList,
  FaChartLine,
  FaThumbsUp,
  FaSitemap
} from 'react-icons/fa';

// Configuração dos grupos de menu
export const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/cotacao/dashboard', icon: FaHome, label: 'Dashboard', screen: 'dashboard' },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { path: '/cotacao/cotacoes', icon: FaClipboardList, label: 'Cotações', screen: 'cotacoes' },
      { path: '/cotacao/supervisor', icon: FaSitemap, label: 'Supervisor', screen: 'supervisor' },
      { path: '/cotacao/aprovacoes', icon: FaThumbsUp, label: 'Aprovações', screen: 'aprovacoes' },
      { path: '/cotacao/saving', icon: FaChartLine, label: 'Saving', screen: 'saving' },
    ]
  },
  {
    title: 'Administração',
    items: [
      { path: '/cotacao/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },

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
