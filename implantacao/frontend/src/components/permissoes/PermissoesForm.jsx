import React from 'react';
import { FaEye, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaSave, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import { Button, Modal } from '../ui';

const PermissoesForm = ({ 
  isOpen,
  onClose,
  editingPermissions, 
  expandedGroups,
  expandedAbas,
  saving,
  onPermissionChange, 
  onExpandGroup,
  onExpandAbas,
  onSavePermissions 
}) => {
  // Grupos de telas organizados por categoria - apenas funcionalidades implementadas
  const gruposTelas = {
    'Cadastros': [
      { key: 'usuarios', label: 'Usuários' },
      { key: 'filiais', label: 'Filiais' },
      { key: 'fornecedores', label: 'Fornecedores' },
      { key: 'unidades_escolares', label: 'Unidades Escolares' },
      { key: 'rotas_nutricionistas', label: 'Rotas Nutricionistas' },
      { key: 'produtos_origem', label: 'Produtos Origem' },
      { key: 'unidades_medida', label: 'Unidades de Medida' },
      { key: 'grupos', label: 'Grupos' },
      { key: 'subgrupos', label: 'Subgrupos' },
      { key: 'classes', label: 'Classes' },
      { key: 'produtos_per_capita', label: 'Produtos Per Capita' },
      { key: 'recebimentos_escolas', label: 'Recebimentos Escolas' },
      { key: 'registros_diarios', label: 'Quantidade Servida' },
      { key: 'necessidades', label: 'Gerar Necessidades' },
      { key: 'necessidades_padroes', label: 'Pedido Mensal' },
      { key: 'calendario', label: 'Calendário' },
      { key: 'analise_necessidades', label: 'Analise Necessidades' },
      { key: 'analise_necessidades_substituicoes', label: 'Análise Substituições' },
      { key: 'consulta_status_necessidade', label: 'Consulta Status Necessidade' }
      
      
    ],
    'Sistema': [
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

    // Determinar se uma tela é apenas de consulta
    const telasConsulta = [
      'fornecedores',
      'filiais', 
      'unidades_escolares',
      'rotas_nutricionistas',
      'produtos_origem',
      'unidades_medida',
      'grupos',
      'subgrupos',
      'classes'
    ];
    const apenasConsulta = telasConsulta.includes(tela);

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
            checked={apenasConsulta ? false : perms.pode_criar}
            onChange={(e) => onPermissionChange(tela, 'pode_criar', e.target.checked)}
            disabled={apenasConsulta}
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
              apenasConsulta ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'
            }`}
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={apenasConsulta ? false : perms.pode_editar}
            onChange={(e) => onPermissionChange(tela, 'pode_editar', e.target.checked)}
            disabled={apenasConsulta}
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
              apenasConsulta ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'
            }`}
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <input
            type="checkbox"
            checked={apenasConsulta ? false : perms.pode_excluir}
            onChange={(e) => onPermissionChange(tela, 'pode_excluir', e.target.checked)}
            disabled={apenasConsulta}
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
              apenasConsulta ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'
            }`}
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
                    
                    // Verificar se esta tela tem abas (sub-permissões)
                    const temAbas = key === 'analise_necessidades';
                    const abas = temAbas ? [
                      { key: `${key}.nutricionista`, label: '👩‍⚕️ Ajuste Nutricionista' },
                      { key: `${key}.coordenacao`, label: '👨‍💼 Ajuste Coordenação' },
                      { key: `${key}.logistica`, label: '🚚 Ajuste Logística' }
                    ] : [];
                    
                    return (
                      <React.Fragment key={key}>
                        {/* Linha principal da tela */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              {temAbas && (
                                <button
                                  onClick={() => onExpandAbas(key)}
                                  className="flex items-center text-gray-500 hover:text-gray-700"
                                  title="Expandir abas"
                                >
                                  {expandedAbas[key] ? (
                                    <FaChevronDown className="text-xs" />
                                  ) : (
                                    <FaChevronRight className="text-xs" />
                                  )}
                                </button>
                              )}
                              <span>{label}</span>
                            </div>
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
                        
                        {/* Abas (sub-permissões) */}
                        {temAbas && expandedAbas[key] && abas.map((aba) => (
                          <tr key={aba.key} className="hover:bg-gray-50 bg-gray-50">
                            <td className="px-12 py-2 text-sm text-gray-700 italic">
                              {aba.label}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[aba.key]?.pode_visualizar || false}
                                onChange={(e) => onPermissionChange(aba.key, 'pode_visualizar', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[aba.key]?.pode_criar || false}
                                onChange={(e) => onPermissionChange(aba.key, 'pode_criar', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[aba.key]?.pode_editar || false}
                                onChange={(e) => onPermissionChange(aba.key, 'pode_editar', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[aba.key]?.pode_excluir || false}
                                onChange={(e) => onPermissionChange(aba.key, 'pode_excluir', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            {mostrarMovimentar && (
                              <td className="px-3 py-2 text-center"></td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
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
