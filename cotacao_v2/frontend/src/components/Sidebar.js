import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import PermissionGuard from './PermissionGuard';
import { 
  FaUsers, 
  FaTruck, 
  FaSitemap, 
  FaThumbsUp,
  FaChevronLeft, 
  FaChevronRight, 
  FaSignOutAlt,
  FaChartLine
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <FaChartLine />,
      label: 'Dashboard',
      permission: 'dashboard'
    },
    {
      path: '/cotacoes',
      icon: <FaTruck />,
      label: 'Cotações',
      permission: 'cotacoes'
    },
    {
      path: '/supervisor',
      icon: <FaThumbsUp />,
      label: 'Supervisor',
      permission: 'supervisor'
    },
    {
      path: '/aprovacoes',
      icon: <FaSitemap />,
      label: 'Aprovações',
      permission: 'aprovacoes'
    },
    {
      path: '/saving',
      icon: <FaChartLine />,
      label: 'Saving',
      permission: 'saving'
    },
    {
      path: '/usuarios',
      icon: <FaUsers />,
      label: 'Usuários',
      permission: 'usuarios'
    }
  ];

  return (
    <div className={`
      fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col
      ${collapsed ? 'w-15' : 'w-64'}
      md:${collapsed ? 'w-15' : 'w-64'}
      ${collapsed ? 'transform -translate-x-full' : 'transform translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-5 border-b border-gray-200 text-center relative">
        <h2 className={`
          text-green-600 font-bold m-0 whitespace-nowrap overflow-hidden
          ${collapsed ? 'text-sm' : 'text-xl'}
        `}>
          {collapsed ? 'CF' : 'Cotação Foods'}
        </h2>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-green-600 border-none rounded-full w-6 h-6 flex items-center justify-center text-white cursor-pointer transition-all duration-300 ease-in-out z-10 shadow-md hover:bg-green-700 hover:scale-110 md:w-8 md:h-8 md:-right-4"
        >
          {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-5 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <PermissionGuard key={item.path} permission={item.permission}>
              <li>
                <button
                  onClick={() => handleMenuClick(item.path)}
                  className={`
                    w-full flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out
                    ${location.pathname === item.path 
                      ? 'bg-green-100 text-green-700 border-l-4 border-green-600' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                    }
                    ${collapsed ? 'justify-center' : 'justify-start'}
                  `}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            </PermissionGuard>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out
            ${collapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <FaSignOutAlt className="text-lg mr-3" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 