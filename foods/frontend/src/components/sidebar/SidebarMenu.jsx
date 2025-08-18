import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaStar, FaRegStar } from 'react-icons/fa';
import { isActiveItem, filterItemsByPermissions } from '../../utils/sidebarUtils';

const SidebarMenu = ({ 
  groups, 
  collapsed, 
  expandedGroups, 
  onToggleGroup, 
  currentPath, 
  canView,
  onToggleFavorite,
  isFavorite 
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((group) => {
        const filteredItems = filterItemsByPermissions(group.items, canView);
        if (filteredItems.length === 0) return null;

        const isExpanded = expandedGroups[group.title];

        return (
          <div key={group.title} className="mb-2">
            {/* Cabeçalho do Grupo */}
            {!collapsed && (
              <div
                className="flex items-center justify-between px-5 py-2 cursor-pointer transition-colors duration-200 border-b border-gray-100 mb-1 hover:bg-gray-50"
                onClick={() => onToggleGroup(group.title)}
              >
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {group.title}
                </span>
                {isExpanded ? (
                  <FaChevronUp className="text-xs text-gray-400" />
                ) : (
                  <FaChevronDown className="text-xs text-gray-400" />
                )}
              </div>
            )}

            {/* Itens do Grupo */}
            <div className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {filteredItems.map((item) => {
                const active = isActiveItem(item.path, currentPath);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-5 py-2 text-gray-700 no-underline transition-all duration-200 border-l-4 text-sm ${
                      active
                        ? 'bg-green-50 text-green-700 border-green-500 font-semibold'
                        : 'border-transparent hover:bg-gray-50 hover:text-green-600 hover:border-green-300'
                    }`}
                  >
                    <div className={`mr-3 text-base min-w-5 text-center ${
                      active ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <Icon />
                    </div>
                    
                    {!collapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onToggleFavorite(item);
                          }}
                          className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                        >
                          {isFavorite(item) ? (
                            <FaStar className="w-3 h-3 text-yellow-500" />
                          ) : (
                            <FaRegStar className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
