import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import SidebarItem from './SidebarItem';

const SidebarGroup = ({ 
  group, 
  expanded, 
  collapsed, 
  onToggleGroup, 
  onToggleFavorite, 
  isFavorite, 
  isItemActive, 
  canViewItem, 
  onItemClick 
}) => {
  return (
    <div className="my-2">
      <div 
        className={`
          flex items-center justify-between px-5 py-2 cursor-pointer transition-all duration-300 border-b border-gray-100 mb-1
          hover:bg-gray-50
          ${collapsed ? 'hidden' : 'flex'}
        `}
        onClick={() => !collapsed && onToggleGroup(group.title)}
      >
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {group.title}
        </div>
        {!collapsed && (
          <div className="text-xs text-gray-400 transition-all duration-300">
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        )}
      </div>
      <div 
        className={`
          overflow-hidden transition-all duration-300
          ${expanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {group.items.map((item) => {
          // Verificar se o usuário pode visualizar este item
          if (!canViewItem(item)) {
            return null;
          }

          return (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={isItemActive(item.path)}
              collapsed={collapsed}
              isFavorite={isFavorite(item)}
              onToggleFavorite={onToggleFavorite}
              onItemClick={onItemClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SidebarGroup;
