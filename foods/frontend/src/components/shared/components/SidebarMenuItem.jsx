import React from 'react';
import { Link } from 'react-router-dom';

export const SidebarMenuItem = ({ item, collapsed, isActive, canView }) => {
  const Icon = item.icon;

  if (!canView(item.key)) {
    return null;
  }

  return (
    <li>
      <Link
        to={item.path}
        className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        } ${collapsed ? 'justify-center' : 'justify-start'}`}
        title={collapsed ? item.label : ''}
      >
        <Icon className={`${collapsed ? 'text-lg' : 'text-lg mr-3'}`} />
        {!collapsed && (
          <span className="truncate">{item.label}</span>
        )}
      </Link>
    </li>
  );
};
