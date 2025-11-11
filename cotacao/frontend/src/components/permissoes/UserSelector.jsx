import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Button } from '../ui';

const UserSelector = ({ 
  usuarios, 
  selectedUserId, 
  selectedUser, 
  isSelectOpen, 
  onUserSelect, 
  setIsSelectOpen 
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Usuário
          </label>
          
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="w-full justify-between text-left"
            >
              <span className="truncate">
                {selectedUser ? (selectedUser.nome || selectedUser.name) : 'Selecione um usuário...'}
              </span>
              <FaChevronDown className={`ml-2 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isSelectOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                {/* Lista de usuários */}
                <div className="max-h-60 overflow-y-auto">
                  {usuarios.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      Nenhum usuário encontrado
                    </div>
                  ) : (
                    <div className="py-1">
                      {usuarios.map((usuario) => (
                        <button
                          key={usuario.id}
                          onClick={() => onUserSelect(usuario.id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                            selectedUserId === usuario.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{usuario.nome || usuario.name}</div>
                              <div className="text-xs text-gray-500 truncate">{usuario.email}</div>
                            </div>
                            <div className="ml-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                usuario.status === 'ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedUser && (
          <div className="flex-shrink-0">
            <Button
              onClick={() => onUserSelect('')}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Limpar Seleção
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelector;
