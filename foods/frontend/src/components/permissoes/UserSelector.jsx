import React from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { Button, Input } from '../ui';

const UserSelector = ({ 
  usuarios, 
  selectedUserId, 
  selectedUser, 
  isSelectOpen, 
  searchTerm,
  onUserSelect, 
  onSearchChange, 
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
                {selectedUser ? selectedUser.nome : 'Selecione um usuário...'}
              </span>
              <FaChevronDown className={`ml-2 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isSelectOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                {/* Campo de busca */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <Input
                      type="text"
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lista de usuários */}
                <div className="max-h-48 overflow-y-auto">
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
                              <div className="font-medium truncate">{usuario.nome}</div>
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
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Informações do usuário selecionado */}
      {selectedUser && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nome:</span>
              <p className="text-gray-900">{selectedUser.nome}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{selectedUser.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Nível de Acesso:</span>
              <p className="text-gray-900">{selectedUser.nivel_de_acesso || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tipo de Acesso:</span>
              <p className="text-gray-900">{selectedUser.tipo_de_acesso || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                selectedUser.status === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedUser.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Permissões:</span>
              <p className="text-gray-900">{selectedUser.permissoes_count || 0} tela(s)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
