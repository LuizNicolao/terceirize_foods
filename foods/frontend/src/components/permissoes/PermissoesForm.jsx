import React from 'react';
import { FaEye, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaSave, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import { Button, Modal } from '../ui';

const PermissoesForm = ({ 
  isOpen,
  onClose,
  editingPermissions, 
  expandedGroups, 
  saving,
  onPermissionChange, 
  onExpandGroup, 
  onSavePermissions 
}) => {
  // Grupos de telas organizados por categoria
  const gruposTelas = {
    'Cadastros Básicos': [
      { key: 'usuarios', label: 'Usuários' },
      { key: 'fornecedores', label: 'Fornecedores' },
      { key: 'clientes', label: 'Clientes' },
      { key: 'filiais', label: 'Filiais' }
    ],
    'Produtos e Categorias': [
      { key: 'produtos', label: 'Produtos' },
      { key: 'grupos', label: 'Grupos' },
      { key: 'subgrupos', label: 'Subgrupos' },
      { key: 'classes', label: 'Classes' },
      { key: 'unidades', label: 'Unidades' },
      { key: 'unidades_escolares', label: 'Unidades Escolares' },
      { key: 'marcas', label: 'Marcas' },
      { key: 'produto_origem', label: 'Produtos Origem' },
      { key: 'produto_generico', label: 'Produtos Genéricos' },
      { key: 'intolerancias', label: 'Intolerâncias' },
      { key: 'patrimonios', label: 'Patrimônios' },
      { key: 'rotas_nutricionistas', label: 'Rotas Nutricionistas' },
      { key: 'tipos_cardapio', label: 'Tipos de Cardápio' },
      { key: 'periodos_refeicao', label: 'Períodos de Refeição' },
      { key: 'periodicidade', label: 'Períodicidade' },
      { key: 'faturamento', label: 'Faturamento' },
      { key: 'receitas', label: 'Receitas' },
      { key: 'necessidades_merenda', label: 'Necessidades da Merenda' },
      { key: 'plano_amostragem', label: 'Plano de Amostragem' },
      { key: 'relatorio_inspecao', label: 'Relatório de Inspeção' },
      { key: 'solicitacoes_compras', label: 'Solicitações de Compras' },
      { key: 'calendario', label: 'Calendário' },
      { key: 'formas_pagamento', label: 'Formas de Pagamento' },
      { key: 'prazos_pagamento', label: 'Prazos de Pagamento' },
      { key: 'pedidos_compras', label: 'Pedidos de Compras' }
    ],
    'Logística': [
      { key: 'veiculos', label: 'Veículos' },
      { key: 'motoristas', label: 'Motoristas' },
      { key: 'ajudantes', label: 'Ajudantes' },
      { key: 'rotas', label: 'Rotas' },
      { key: 'tipo_rota', label: 'Tipo de Rota' }
    ],
    'Sistema': [
      { key: 'cotacao', label: 'Cotação' },
      { key: 'permissoes', label: 'Permissões' }
    ]
  };

  const renderPermissionRow = (tela, label) => {
    const perms = editingPermissions[tela] || {
      pode_visualizar: false,
      pode_criar: false,
      pode_editar: false,
      pode_excluir: false,
      pode_movimentar: false
    };

    // Determinar se deve mostrar a coluna movimentar (apenas para patrimônios)
    const mostrarMovimentar = tela === 'patrimonios';
    const colSpan = mostrarMovimentar ? 6 : 5;

    return (
      <div key={tela} className={`grid grid-cols-${colSpan} gap-2 p-3 border-b border-gray-100 hover:bg-gray-50`}>
        <div className="col-span-1 flex items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={perms.pode_visualizar}
            onChange={(e) => onPermissionChange(tela, 'pode_visualizar', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={perms.pode_criar}
            onChange={(e) => onPermissionChange(tela, 'pode_criar', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={perms.pode_editar}
            onChange={(e) => onPermissionChange(tela, 'pode_editar', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={perms.pode_excluir}
            onChange={(e) => onPermissionChange(tela, 'pode_excluir', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
        
        {mostrarMovimentar && (
          <div className="col-span-1 flex justify-center">
            <input
              type="checkbox"
              checked={perms.pode_movimentar}
              onChange={(e) => onPermissionChange(tela, 'pode_movimentar', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        )}
      </div>
    );
  };

  // Determinar se deve mostrar a coluna movimentar (verificar se há patrimônios expandidos)
  const temPatrimoniosExpandidos = Object.entries(gruposTelas).some(([grupoNome, telas]) => 
    expandedGroups[grupoNome] && telas.some(({ key }) => key === 'patrimonios')
  );

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Permissões"
      size="full"
    >
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabela de permissões */}
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tela
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <FaEye className="text-sm" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <FaPlus className="text-sm" />
                    <span className="hidden sm:inline">Criar</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <FaEdit className="text-sm" />
                    <span className="hidden sm:inline">Editar</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <FaTrash className="text-sm" />
                    <span className="hidden sm:inline">Excluir</span>
                  </div>
                </th>
                {temPatrimoniosExpandidos && (
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaExchangeAlt className="text-sm" />
                      <span className="hidden sm:inline">Movimentar</span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(gruposTelas).map(([grupoNome, telas]) => (
                <React.Fragment key={grupoNome}>
                  {/* Cabeçalho do grupo */}
                  <tr className="bg-gray-50">
                    <td colSpan={temPatrimoniosExpandidos ? 6 : 5} className="px-6 py-3">
                      <button
                        onClick={() => onExpandGroup(grupoNome)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        {expandedGroups[grupoNome] ? (
                          <FaChevronDown className="text-xs" />
                        ) : (
                          <FaChevronRight className="text-xs" />
                        )}
                        {grupoNome}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Telas do grupo */}
                  {expandedGroups[grupoNome] && telas.map(({ key, label }) => {
                    // Determinar se deve mostrar a coluna movimentar (apenas para patrimônios)
                    const mostrarMovimentar = key === 'patrimonios';
                    
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {label}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions[key]?.pode_visualizar || false}
                            onChange={(e) => onPermissionChange(key, 'pode_visualizar', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions[key]?.pode_criar || false}
                            onChange={(e) => onPermissionChange(key, 'pode_criar', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions[key]?.pode_editar || false}
                            onChange={(e) => onPermissionChange(key, 'pode_editar', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions[key]?.pode_excluir || false}
                            onChange={(e) => onPermissionChange(key, 'pode_excluir', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        {mostrarMovimentar && (
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editingPermissions[key]?.pode_movimentar || false}
                              onChange={(e) => onPermissionChange(key, 'pode_movimentar', e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer com botões */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              <FaTimes className="mr-1 sm:mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={onSavePermissions}
              disabled={saving}
              size="sm"
              className="flex items-center gap-2"
            >
              <FaSave className="text-sm" />
              {saving ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PermissoesForm;
