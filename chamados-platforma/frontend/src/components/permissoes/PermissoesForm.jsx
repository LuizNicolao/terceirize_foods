import React from 'react';
import { FaEye, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaSave, FaTimes, FaExchangeAlt, FaUserPlus, FaCheck, FaRedo, FaUserCheck } from 'react-icons/fa';
import { Button, Modal } from '../ui';

const PermissoesForm = ({ 
  isOpen,
  onClose,
  editingPermissions, 
  expandedGroups, 
  saving,
  onPermissionChange,
  onToggleAllPermissionsForScreen,
  onTogglePermissionForAllScreens,
  onExpandGroup, 
  onSavePermissions 
}) => {
  // Grupos de telas organizados por categoria
  const gruposTelas = {
    'Cadastros Básicos': [
      { key: 'usuarios', label: 'Usuários' }
    ],
    'Sistema': [
      { key: 'chamados', label: 'Chamados' },
      { key: 'permissoes', label: 'Permissões' }
    ]
  };

  const renderPermissionRow = (tela, label) => {
    const perms = editingPermissions[tela] || {
      pode_visualizar: false,
      pode_criar: false,
      pode_editar: false,
      pode_excluir: false,
      pode_movimentar: false,
      pode_assumir: false,
      pode_concluir: false,
      pode_reabrir: false,
      pode_atribuir: false
    };

    // Não há coluna movimentar no sistema de chamados
    const mostrarMovimentar = false;
    // Para chamados, mostrar permissões específicas (4 colunas extras)
    const mostrarPermissoesChamados = tela === 'chamados';
    const colSpan = mostrarPermissoesChamados ? 9 : 5;

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
        
        {/* Permissões específicas de chamados */}
        {mostrarPermissoesChamados && (
          <>
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={perms.pode_assumir || false}
                onChange={(e) => onPermissionChange(tela, 'pode_assumir', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                title="Assumir chamado"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={perms.pode_concluir || false}
                onChange={(e) => onPermissionChange(tela, 'pode_concluir', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                title="Concluir chamado"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={perms.pode_reabrir || false}
                onChange={(e) => onPermissionChange(tela, 'pode_reabrir', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                title="Reabrir chamado"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={perms.pode_atribuir || false}
                onChange={(e) => onPermissionChange(tela, 'pode_atribuir', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                title="Atribuir responsável"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  // Não há coluna movimentar no sistema de chamados
  const temPatrimoniosExpandidos = false;
  // Verificar se o grupo Sistema está expandido para mostrar colunas específicas de chamados
  const temChamadosExpandido = expandedGroups['Sistema'] === true;

  // Lista de todas as telas (apenas as que estão expandidas)
  const todasTelas = Object.entries(gruposTelas)
    .filter(([grupoNome]) => expandedGroups[grupoNome])
    .flatMap(([, telas]) => telas.map(t => t.key));

  // Lista de todas as permissões básicas
  const permissoesBasicas = ['pode_visualizar', 'pode_criar', 'pode_editar', 'pode_excluir'];
  // Lista de permissões específicas de chamados
  const permissoesChamados = ['pode_assumir', 'pode_concluir', 'pode_reabrir', 'pode_atribuir'];
  // Todas as permissões
  const todasPermissoes = [...permissoesBasicas, ...permissoesChamados];

  // Verificar se todas as permissões de uma tela estão marcadas
  const todasPermissoesMarcadasParaTela = (tela) => {
    const perms = editingPermissions[tela] || {};
    const permissoesParaTela = tela === 'chamados' ? todasPermissoes : permissoesBasicas;
    return permissoesParaTela.every(perm => perms[perm] === true);
  };

  // Verificar se uma permissão está marcada em todas as telas
  const permissaoMarcadaEmTodasTelas = (action) => {
    if (todasTelas.length === 0) return false;
    return todasTelas.every(tela => {
      const perms = editingPermissions[tela] || {};
      return perms[action] === true;
    });
  };

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
                  <div className="mt-1">
                    {todasTelas.length > 0 && (
                      <label className="flex items-center gap-1 text-xs font-normal text-gray-600 cursor-pointer hover:text-gray-800">
                        <input
                          type="checkbox"
                          checked={todasTelas.every(tela => todasPermissoesMarcadasParaTela(tela))}
                          onChange={(e) => {
                            todasTelas.forEach(tela => {
                              const todasPerms = tela === 'chamados' ? todasPermissoes : permissoesBasicas;
                              todasPerms.forEach(perm => {
                                onPermissionChange(tela, perm, e.target.checked);
                              });
                            });
                          }}
                          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                          title="Marcar/Desmarcar todas as permissões de todas as telas"
                        />
                        <span className="text-xs">Todos</span>
                      </label>
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-1">
                      <FaEye className="text-sm" />
                      <span className="hidden sm:inline">Visualizar</span>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissaoMarcadaEmTodasTelas('pode_visualizar')}
                        onChange={(e) => onTogglePermissionForAllScreens('pode_visualizar', e.target.checked)}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                        title="Marcar/Desmarcar em todas as telas"
                      />
                      <span className="text-xs">Todos</span>
                    </label>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-1">
                      <FaPlus className="text-sm" />
                      <span className="hidden sm:inline">Criar</span>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissaoMarcadaEmTodasTelas('pode_criar')}
                        onChange={(e) => onTogglePermissionForAllScreens('pode_criar', e.target.checked)}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                        title="Marcar/Desmarcar em todas as telas"
                      />
                      <span className="text-xs">Todos</span>
                    </label>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-1">
                      <FaEdit className="text-sm" />
                      <span className="hidden sm:inline">Editar</span>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissaoMarcadaEmTodasTelas('pode_editar')}
                        onChange={(e) => onTogglePermissionForAllScreens('pode_editar', e.target.checked)}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                        title="Marcar/Desmarcar em todas as telas"
                      />
                      <span className="text-xs">Todos</span>
                    </label>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-1">
                      <FaTrash className="text-sm" />
                      <span className="hidden sm:inline">Excluir</span>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissaoMarcadaEmTodasTelas('pode_excluir')}
                        onChange={(e) => onTogglePermissionForAllScreens('pode_excluir', e.target.checked)}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                        title="Marcar/Desmarcar em todas as telas"
                      />
                      <span className="text-xs">Todos</span>
                    </label>
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
                {/* Cabeçalhos para permissões específicas de chamados */}
                {temChamadosExpandido && (
                  <>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-gray-300">
                      <div className="flex flex-col items-center justify-center gap-1" title="Assumir chamado">
                        <div className="flex items-center justify-center gap-1">
                          <FaUserPlus className="text-sm" />
                          <span className="hidden sm:inline">Assumir</span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                          <input
                            type="checkbox"
                            checked={editingPermissions['chamados']?.pode_assumir === true}
                            onChange={(e) => onPermissionChange('chamados', 'pode_assumir', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                            title="Marcar/Desmarcar"
                          />
                          <span className="text-xs">Todos</span>
                        </label>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center justify-center gap-1" title="Concluir chamado">
                        <div className="flex items-center justify-center gap-1">
                          <FaCheck className="text-sm" />
                          <span className="hidden sm:inline">Concluir</span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                          <input
                            type="checkbox"
                            checked={editingPermissions['chamados']?.pode_concluir === true}
                            onChange={(e) => onPermissionChange('chamados', 'pode_concluir', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                            title="Marcar/Desmarcar"
                          />
                          <span className="text-xs">Todos</span>
                        </label>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center justify-center gap-1" title="Reabrir chamado">
                        <div className="flex items-center justify-center gap-1">
                          <FaRedo className="text-sm" />
                          <span className="hidden sm:inline">Reabrir</span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                          <input
                            type="checkbox"
                            checked={editingPermissions['chamados']?.pode_reabrir === true}
                            onChange={(e) => onPermissionChange('chamados', 'pode_reabrir', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                            title="Marcar/Desmarcar"
                          />
                          <span className="text-xs">Todos</span>
                        </label>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center justify-center gap-1" title="Atribuir responsável">
                        <div className="flex items-center justify-center gap-1">
                          <FaUserCheck className="text-sm" />
                          <span className="hidden sm:inline">Atribuir</span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                          <input
                            type="checkbox"
                            checked={editingPermissions['chamados']?.pode_atribuir === true}
                            onChange={(e) => onPermissionChange('chamados', 'pode_atribuir', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                            title="Marcar/Desmarcar"
                          />
                          <span className="text-xs">Todos</span>
                        </label>
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(gruposTelas).map(([grupoNome, telas]) => (
                <React.Fragment key={grupoNome}>
                  {/* Cabeçalho do grupo */}
                  <tr className="bg-gray-50">
                    <td colSpan={
                      temPatrimoniosExpandidos ? 6 : 
                      (grupoNome === 'Sistema' && expandedGroups[grupoNome] ? 9 : 5)
                    } className="px-6 py-3">
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
                    // Não há coluna movimentar no sistema de chamados
                    const mostrarMovimentar = false;
                    // Mostrar permissões específicas apenas para chamados
                    const mostrarPermissoesChamados = key === 'chamados';
                    
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{label}</span>
                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              <input
                                type="checkbox"
                                checked={todasPermissoesMarcadasParaTela(key)}
                                onChange={(e) => {
                                  const todasPerms = key === 'chamados' ? todasPermissoes : permissoesBasicas;
                                  todasPerms.forEach(perm => {
                                    onPermissionChange(key, perm, e.target.checked);
                                  });
                                }}
                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                                title="Marcar/Desmarcar todas as permissões desta tela"
                              />
                              <span className="text-xs">Todos</span>
                            </label>
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
                        {/* Permissões específicas de chamados */}
                        {mostrarPermissoesChamados && (
                          <>
                            <td className="px-3 py-3 text-center border-l-2 border-gray-300">
                              <input
                                type="checkbox"
                                checked={editingPermissions[key]?.pode_assumir || false}
                                onChange={(e) => onPermissionChange(key, 'pode_assumir', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                title="Assumir chamado"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[key]?.pode_concluir || false}
                                onChange={(e) => onPermissionChange(key, 'pode_concluir', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                title="Concluir chamado"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[key]?.pode_reabrir || false}
                                onChange={(e) => onPermissionChange(key, 'pode_reabrir', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                title="Reabrir chamado"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={editingPermissions[key]?.pode_atribuir || false}
                                onChange={(e) => onPermissionChange(key, 'pode_atribuir', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                title="Atribuir responsável"
                              />
                            </td>
                          </>
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
