import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarItem as StyledItem } from './styles';

const SidebarItem = ({ item, collapsed, isActive }) => {
  const IconComponent = item.icon;

  return (
    <Link to={item.path} style={{ textDecoration: 'none' }}>
      <StyledItem 
        $collapsed={collapsed}
        className={isActive ? 'active' : ''}
      >
        <IconComponent className="icon" />
        <span className="label">{item.label}</span>
      </StyledItem>
    </Link>
  );
};

export default SidebarItem;
