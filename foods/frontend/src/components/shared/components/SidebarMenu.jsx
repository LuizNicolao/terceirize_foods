import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaRulerCombined,
  FaTag,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
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
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarSubMenu } from './SidebarSubMenu';

export const SidebarMenu = ({ 
  collapsed, 
  expandedMenus, 
  toggleMenu, 
  location, 
  canView 
}) => {
  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: FaHome,
      path: '/foods',
      type: 'link'
    },
    {
      key: 'cadastros',
      label: 'Cadastros',
      icon: FaDatabase,
      type: 'submenu',
      items: [
        { key: 'usuarios', label: 'Usuários', icon: FaUsers, path: '/foods/usuarios' },
        { key: 'fornecedores', label: 'Fornecedores', icon: FaTruck, path: '/foods/fornecedores' },
        { key: 'clientes', label: 'Clientes', icon: FaUserTie, path: '/foods/clientes' },
        { key: 'produtos', label: 'Produtos', icon: FaBox, path: '/foods/produtos' },
        { key: 'grupos', label: 'Grupos', icon: FaLayerGroup, path: '/foods/grupos' },
        { key: 'subgrupos', label: 'Subgrupos', icon: FaLayerGroup, path: '/foods/subgrupos' },
        { key: 'classes', label: 'Classes', icon: FaLayerGroup, path: '/foods/classes' },
        { key: 'marcas', label: 'Marcas', icon: FaTag, path: '/foods/marcas' },
        { key: 'unidades', label: 'Unidades', icon: FaRulerCombined, path: '/foods/unidades' },
        { key: 'produto-generico', label: 'Produto Genérico', icon: FaCubes, path: '/foods/produto-generico' },
        { key: 'produto-origem', label: 'Produto Origem', icon: FaCubes, path: '/foods/produto-origem' }
      ]
    },
    {
      key: 'operacional',
      label: 'Operacional',
      icon: FaCog,
      type: 'submenu',
      items: [
        { key: 'filiais', label: 'Filiais', icon: FaBuilding, path: '/foods/filiais' },
        { key: 'unidades-escolares', label: 'Unidades Escolares', icon: FaStore, path: '/foods/unidades-escolares' },
        { key: 'rotas', label: 'Rotas', icon: FaRoute, path: '/foods/rotas' },
        { key: 'motoristas', label: 'Motoristas', icon: FaCar, path: '/foods/motoristas' },
        { key: 'ajudantes', label: 'Ajudantes', icon: FaUsers, path: '/foods/ajudantes' },
        { key: 'veiculos', label: 'Veículos', icon: FaTruck, path: '/foods/veiculos' }
      ]
    },
    {
      key: 'sistema',
      label: 'Sistema',
      icon: FaShieldAlt,
      type: 'submenu',
      items: [
        { key: 'permissoes', label: 'Permissões', icon: FaShieldAlt, path: '/foods/permissoes' },
        { key: 'auditoria', label: 'Auditoria', icon: FaFileAlt, path: '/foods/auditoria' }
      ]
    }
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          if (item.type === 'link') {
            return (
              <SidebarMenuItem
                key={item.key}
                item={item}
                collapsed={collapsed}
                isActive={location.pathname === item.path}
                canView={canView}
              />
            );
          } else if (item.type === 'submenu') {
            return (
              <SidebarSubMenu
                key={item.key}
                item={item}
                collapsed={collapsed}
                expanded={expandedMenus[item.key]}
                toggleMenu={toggleMenu}
                location={location}
                canView={canView}
              />
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
};
