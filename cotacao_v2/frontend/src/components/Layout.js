import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const { collapsed } = useSidebar();

  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    return user.name ? user.name.split(' ')[0] : 'Usuário';
  };

  const getUserRole = () => {
    if (!user) return '';
    const roles = {
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'supervisor': 'Supervisor',
      'comprador': 'Comprador'
    };
    return roles[user.role] || user.role || '';
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`
        flex-1 transition-all duration-300 ease-in-out bg-gray-50 min-h-screen
        ${collapsed ? 'ml-15' : 'ml-64'}
        md:${collapsed ? 'ml-15' : 'ml-64'}
        ml-0
      `}>
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-green-600 text-2xl font-bold m-0">
              Sistema de Cotação
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 cursor-pointer transition-all duration-300 hover:bg-green-100">
              <div>
                <div className="font-semibold text-gray-800 text-sm">
                  Bem-vindo, {getUserDisplayName()}!
                </div>
                {getUserRole() && (
                  <div className="text-gray-600 text-xs">
                    {getUserRole()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-5">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 