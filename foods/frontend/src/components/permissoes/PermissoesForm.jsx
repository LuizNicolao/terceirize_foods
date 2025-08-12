import React from 'react';
import { FaChevronDown, FaChevronRight, FaSave, FaUndo } from 'react-icons/fa';
import { Button } from '../ui';

const PermissoesForm = ({ 
  selectedUser,
  editingPermissions,
  saving,
  expandedGroups,
  onSave,
  onReset,
  onPermissionChange,
  onExpandGroup,
  getTelaLabel,
  getPermissionLabel
}) => {
  if (!selectedUser) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Selecione um usuário para gerenciar suas permissões
      </div>
    );
  }

  // Agrupar telas por categoria
  const telasPorGrupo = {
    'Cadastros Básicos': ['usuarios', 'fornecedores', 'clientes', 'filiais'],
    'Produtos': ['produtos', 'grupos', 'subgrupos', 'classes', 'nome_generico_produto', 'unidades', 'marcas'],
    'Logística': ['rotas', 'veiculos', 'motoristas', 'ajudantes', 'unidades_escolares'],
    'Sistema': ['cotacao', 'permissoes']
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      {/* Header do usuário selecionado */}
      <div className="mb-4 sm:mb-6 pb-4 border-b">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          Permissões de: {selectedUser.nome}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>
            <p className="font-medium">{selectedUser.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Nível:</span>
            <p className="font-medium">{selectedUser.nivel_de_acesso}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
              selectedUser.status === 'ativo' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedUser.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário de permissões */}
      <div className="space-y-4">
        {Object.entries(telasPorGrupo).map(([grupo, telas]) => (
          <div key={grupo} className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => onExpandGroup(grupo)}
              className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
            >
              <span className="font-medium text-gray-800">{grupo}</span>
              {expandedGroups[grupo] ? (
                <FaChevronDown className="text-gray-500" />
              ) : (
                <FaChevronRight className="text-gray-500" />
              )}
            </button>
            
            {expandedGroups[grupo] && (
              <div className="p-4 space-y-4">
                {telas.map(tela => (
                  <div key={tela} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-3">
                      {getTelaLabel(tela)}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['pode_visualizar', 'pode_criar', 'pode_editar', 'pode_excluir'].map(permission => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingPermissions[tela]?.[permission] || false}
                            onChange={(e) => onPermissionChange(tela, permission, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {getPermissionLabel(permission)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button
          onClick={onReset}
          variant="secondary"
          size="sm"
          disabled={saving}
        >
          <FaUndo className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Desfazer</span>
          <span className="sm:hidden">Desfazer</span>
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          disabled={saving}
        >
          <FaSave className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </span>
          <span className="sm:hidden">
            {saving ? 'Salvando...' : 'Salvar'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default PermissoesForm;
