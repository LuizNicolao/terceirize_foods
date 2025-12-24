import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import NotificacoesDropdown from '../notificacoes/NotificacoesDropdown';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.nome.split(' ')[0];
  };

  const getUserRole = () => {
    if (!user) return '';
    const roles = {
      'administrador': 'Administrador',
      'supervisor': 'Supervisor',
      'usuario': 'Usuário'
    };
    return roles[user.tipo_de_acesso] || user.tipo_de_acesso;
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-green-500 text-2xl font-bold m-0">
          Chamados - Plataforma de Gestão
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificacoesDropdown />
        
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
