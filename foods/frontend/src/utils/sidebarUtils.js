import { 
  FaHome, 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaRulerCombined,
  FaTag,
  FaShieldAlt,
  FaSitemap,
  FaCubes,
  FaFileAlt,
  FaBuilding,
  FaCog,
  FaDatabase,
  FaStore,
  FaClipboardList,
  FaRoute,
  FaCar,
  FaUserTie
} from 'react-icons/fa';

// Configuração dos grupos de menu
export const menuGroups = [
  {
    title: 'Principal',
    items: [
      { path: '/foods/dashboard', icon: FaHome, label: 'Dashboard', screen: 'dashboard' }
    ]
  },
  {
    title: 'Suprimentos',
    items: [
      { path: '/foods/produtos', icon: FaBox, label: 'Produtos', screen: 'produtos' },
      { path: '/foods/grupos', icon: FaLayerGroup, label: 'Grupos', screen: 'grupos' },
      { path: '/foods/subgrupos', icon: FaLayerGroup, label: 'Subgrupos', screen: 'subgrupos' },
      { path: '/foods/classes', icon: FaLayerGroup, label: 'Classes', screen: 'classes' },
      { path: '/foods/marcas', icon: FaTag, label: 'Marcas', screen: 'marcas' },
      { path: '/foods/unidades', icon: FaRulerCombined, label: 'Unidades', screen: 'unidades' },
      { path: '/foods/produto-generico', icon: FaCubes, label: 'Produto Genérico', screen: 'produto-generico' },
      { path: '/foods/produto-origem', icon: FaFileAlt, label: 'Produto Origem', screen: 'produto-origem' }
    ]
  },
  {
    title: 'Logística',
    items: [
      { path: '/foods/fornecedores', icon: FaTruck, label: 'Fornecedores', screen: 'fornecedores' },
      { path: '/foods/clientes', icon: FaUsers, label: 'Clientes', screen: 'clientes' },
      { path: '/foods/filiais', icon: FaBuilding, label: 'Filiais', screen: 'filiais' },
      { path: '/foods/unidades-escolares', icon: FaStore, label: 'Unidades Escolares', screen: 'unidades-escolares' },
      { path: '/foods/rotas', icon: FaRoute, label: 'Rotas', screen: 'rotas' }
    ]
  },
  {
    title: 'Frotas',
    items: [
      { path: '/foods/motoristas', icon: FaUserTie, label: 'Motoristas', screen: 'motoristas' },
      { path: '/foods/ajudantes', icon: FaUsers, label: 'Ajudantes', screen: 'ajudantes' },
      { path: '/foods/veiculos', icon: FaCar, label: 'Veículos', screen: 'veiculos' }
    ]
  },
  {
    title: 'Cadastros',
    items: [
      { path: '/foods/usuarios', icon: FaUsers, label: 'Usuários', screen: 'usuarios' },
      { path: '/foods/auditoria', icon: FaClipboardList, label: 'Auditoria', screen: 'auditoria' }
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/foods/permissoes', icon: FaShieldAlt, label: 'Permissões', screen: 'permissoes' }
    ]
  }
];

// Verificar se um item está ativo
export const isActiveItem = (itemPath, currentPath) => {
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};

// Filtrar itens por permissões
export const filterItemsByPermissions = (items, canView) => {
  return items.filter(item => canView(item.screen));
};
