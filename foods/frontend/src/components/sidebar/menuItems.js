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
  FaSitemap,
  FaCubes,
  FaFileAlt,
  FaBuilding,
  FaCog,
  FaDatabase,
  FaStore,
  FaClipboardList,
  FaSearch,
  FaStar,
  FaRegStar,
  FaRoute,
  FaCar,
  FaUserTie
} from 'react-icons/fa';

export const menuItems = [
  {
    path: '/foods',
    label: 'Dashboard',
    icon: FaHome,
    permission: 'dashboard'
  },
  {
    path: '/foods/usuarios',
    label: 'Usuários',
    icon: FaUsers,
    permission: 'usuarios'
  },
  {
    path: '/foods/fornecedores',
    label: 'Fornecedores',
    icon: FaBuilding,
    permission: 'fornecedores'
  },
  {
    path: '/foods/clientes',
    label: 'Clientes',
    icon: FaUserTie,
    permission: 'clientes'
  },
  {
    path: '/foods/filiais',
    label: 'Filiais',
    icon: FaStore,
    permission: 'filiais'
  },
  {
    path: '/foods/rotas',
    label: 'Rotas',
    icon: FaRoute,
    permission: 'rotas'
  },
  {
    path: '/foods/unidades-escolares',
    label: 'Unidades Escolares',
    icon: FaBuilding,
    permission: 'unidades_escolares'
  },
  {
    path: '/foods/produtos',
    label: 'Produtos',
    icon: FaBox,
    permission: 'produtos'
  },
  {
    path: '/foods/grupos',
    label: 'Grupos',
    icon: FaLayerGroup,
    permission: 'grupos'
  },
  {
    path: '/foods/subgrupos',
    label: 'Subgrupos',
    icon: FaSitemap,
    permission: 'subgrupos'
  },
  {
    path: '/foods/unidades',
    label: 'Unidades',
    icon: FaRulerCombined,
    permission: 'unidades'
  },
  {
    path: '/foods/marcas',
    label: 'Marcas',
    icon: FaTag,
    permission: 'marcas'
  },
  {
    path: '/foods/classes',
    label: 'Classes',
    icon: FaCubes,
    permission: 'classes'
  },
  {
    path: '/foods/permissoes',
    label: 'Permissões',
    icon: FaShieldAlt,
    permission: 'permissoes'
  },
  {
    path: '/foods/veiculos',
    label: 'Veículos',
    icon: FaCar,
    permission: 'veiculos'
  },
  {
    path: '/foods/motoristas',
    label: 'Motoristas',
    icon: FaTruck,
    permission: 'motoristas'
  },
  {
    path: '/foods/ajudantes',
    label: 'Ajudantes',
    icon: FaUsers,
    permission: 'ajudantes'
  },
  {
    path: '/foods/produto-origem',
    label: 'Produto Origem',
    icon: FaDatabase,
    permission: 'produto_origem'
  },
  {
    path: '/foods/produto-generico',
    label: 'Produto Genérico',
    icon: FaCubes,
    permission: 'produto_generico'
  }
];
