import React from 'react';
import { FaUser, FaBell, FaBars } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.nome.split(' ')[0];
  };

  const getUserRole = () => {
    if (!user) return '';
    const roles = {
      'Coordenacao': 'Coordenador',
      'Supervisao': 'Supervisor',
      'Nutricionista': 'Nutricionista'
    };
    return roles[user.tipo_usuario] || user.tipo_usuario;
  };

  return (
    <header className="bg-white shadow-md px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        {/* Botão de menu para mobile/tablet */}
        <button 
          onClick={onToggleSidebar}
          className="xl:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
          title="Abrir menu"
        >
          <FaBars className="w-5 h-5" />
        </button>
        
        <h1 className="text-green-500 text-lg md:text-2xl font-bold m-0 truncate">
          <span className="hidden sm:inline">Implantação - Gestão de Necessidades das Nutricionistas</span>
          <span className="sm:hidden">Implantação</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button className="bg-transparent border-none text-lg text-gray-700 cursor-pointer p-2 rounded transition-all duration-300 hover:bg-gray-100 hover:text-green-500 relative">
          <FaBell />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            0
          </span>
        </button>
        
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-md bg-gray-100 cursor-pointer transition-all duration-300 hover:bg-green-100">
          <FaUser className="text-sm md:text-base" />
          <div className="hidden md:block">
            <div className="font-semibold text-gray-700 text-sm">
              {getUserDisplayName()}
            </div>
            <div className="text-gray-500 text-xs">
              {getUserRole()}
            </div>
          </div>
          <div className="md:hidden">
            <div className="font-semibold text-gray-700 text-xs">
              {getUserDisplayName()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
