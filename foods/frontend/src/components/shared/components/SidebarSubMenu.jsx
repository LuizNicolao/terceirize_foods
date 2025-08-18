import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export const SidebarSubMenu = ({ 
  item, 
  collapsed, 
  expanded, 
  toggleMenu, 
  location, 
  canView 
}) => {
  const Icon = item.icon;
  const ChevronIcon = expanded ? FaChevronUp : FaChevronDown;

  const hasVisibleItems = item.items.some(subItem => canView(subItem.key));

  if (!hasVisibleItems) {
    return null;
  }

  return (
    <li>
      {/* Menu Header */}
      <button
        onClick={() => toggleMenu(item.key)}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={collapsed ? item.label : ''}
      >
        <div className="flex items-center">
          <Icon className={`${collapsed ? 'text-lg' : 'text-lg mr-3'}`} />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </div>
        {!collapsed && (
          <ChevronIcon className="text-xs" />
        )}
      </button>

      {/* Submenu Items */}
      {!collapsed && expanded && (
        <ul className="bg-gray-50">
          {item.items.map((subItem) => {
            if (!canView(subItem.key)) {
              return null;
            }

            const SubIcon = subItem.icon;
            const isActive = location.pathname === subItem.path;

            return (
              <li key={subItem.key}>
                <Link
                  to={subItem.path}
                  className={`flex items-center px-8 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <SubIcon className="text-sm mr-3" />
                  <span className="truncate">{subItem.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};
