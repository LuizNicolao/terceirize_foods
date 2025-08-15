import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionsContext';
import SidebarItem from './SidebarItem';
import { menuItems } from './menuItems';
import { SidebarMenu as StyledMenu } from './styles';

const SidebarMenu = ({ collapsed }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  return (
    <StyledMenu>
      {menuItems.map((item) => (
        hasPermission(item.permission) && (
          <SidebarItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname === item.path}
          />
        )
      ))}
    </StyledMenu>
  );
};

export default SidebarMenu;
