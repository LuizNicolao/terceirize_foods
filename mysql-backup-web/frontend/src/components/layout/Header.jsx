import React from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onToggleSidebar, health }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-green-500 text-2xl font-bold m-0">
          MySQL Backup Web
        </h1>
        {health && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            health.status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {health.status === 'healthy' ? '✅ Online' : '❌ Offline'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 cursor-pointer transition-colors hover:bg-green-100">
            <FaUser />
            <div>
              <div className="font-semibold text-gray-700 text-sm">
                {user.nome ? user.nome.split(' ')[0] : user.email}
              </div>
              <div className="text-gray-500 text-xs">
                Administrador
              </div>
            </div>
          </div>
        )}
        <button className="bg-transparent border-none text-lg text-gray-700 cursor-pointer p-2 rounded transition-colors hover:bg-gray-100 hover:text-green-500 relative">
          <FaBell />
        </button>
      </div>
    </header>
  );
};

export default Header;

