import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarMenu } from './components/SidebarMenu';
import { SidebarFooter } from './components/SidebarFooter';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canView } = usePermissions();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out z-50 ${
      collapsed ? 'w-16' : 'w-64'
    } ${collapsed ? 'md:w-16' : 'md:w-64'} ${
      collapsed ? 'transform -translate-x-full' : 'transform translate-x-0'
    } md:transform-none`}>
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <SidebarHeader 
          collapsed={collapsed} 
          toggleCollapse={toggleCollapse} 
        />

        {/* Menu */}
        <SidebarMenu
          collapsed={collapsed}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
          location={location}
          canView={canView}
        />

        {/* Footer */}
        <SidebarFooter
          collapsed={collapsed}
          user={user}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;
