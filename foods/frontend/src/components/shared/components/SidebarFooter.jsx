import React from 'react';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

export const SidebarFooter = ({ collapsed, user, handleLogout }) => {
  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      {!collapsed && (
        <div className="mb-3">
          <div className="flex items-center">
            <FaUser className="text-gray-400 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'email@exemplo.com'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 ${
          collapsed ? 'justify-center' : 'justify-start'
        }`}
        title={collapsed ? 'Sair' : ''}
      >
        <FaSignOutAlt className={`${collapsed ? 'text-lg' : 'text-lg mr-2'}`} />
        {!collapsed && <span>Sair</span>}
      </button>
    </div>
  );
};
