import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-neutral-900">
                Sistema de Cotações
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {user?.role}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Configurações"
                >
                  <FaCog className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Sair"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
