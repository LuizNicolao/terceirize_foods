import React from 'react';
import { FaUser, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getUserDisplayName = () => {
    console.log('🔍 Header - Dados do usuário:', user);
    
    if (!user) return 'Usuário';
    
    // Tentar diferentes campos possíveis para o nome
    const name = user.nome || user.name || user.username || user.email || 'Usuário';
    console.log('🔍 Header - Nome extraído:', name);
    
    // Se for um email, pegar apenas a parte antes do @
    if (name.includes('@')) {
      return name.split('@')[0];
    }
    
    // Se for um nome completo, pegar apenas o primeiro nome
    if (name.includes(' ')) {
      return name.split(' ')[0];
    }
    
    return name;
  };

  const getUserRole = () => {
    if (!user) return '';
    
    // Tentar diferentes campos possíveis para o tipo de acesso
    const role = user.tipo_de_acesso || user.role || user.tipo_acesso || user.access_type || '';
    
    const roles = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor',
      'admin': 'Administrador',
      'coordinator': 'Coordenador',
      'manager': 'Gerente'
    };
    
    return roles[role] || role;
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-green-500 text-2xl font-bold m-0">
          Cotação - Sistema de Gestão
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-transparent border-none text-lg text-gray-700 cursor-pointer p-2 rounded transition-all duration-300 hover:bg-gray-100 hover:text-green-500 relative">
          <FaBell />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            3
          </span>
        </button>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 cursor-pointer transition-all duration-300 hover:bg-green-100">
          <FaUser />
          <div>
            <div className="font-semibold text-gray-700 text-sm">
              {getUserDisplayName()}
            </div>
            <div className="text-gray-500 text-xs">
              {getUserRole()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
