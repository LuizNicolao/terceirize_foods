import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaFileExcel, FaFilePdf, FaFilter, FaSearch } from 'react-icons/fa';
import { useAuditoria } from '../../hooks/useAuditoria';
import { Button, Modal } from '../ui';
import toast from 'react-hot-toast';

const AuditModal = ({ isOpen, onClose, entityName = 'cotacoes' }) => {
  const {
    logs,
    loading,
    error,
    filters,
    pagination,
    fetchLogs,
    fetchStats,
    exportXLSX,
    exportPDF,
    updateFilters,
    goToPage,
    nextPage,
    prevPage
  } = useAuditoria(entityName);

  const [stats, setStats] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Carregar estatísticas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    const statsData = await fetchStats();
    setStats(statsData);
  };

  const handleExportXLSX = async () => {
    await exportXLSX();
  };

  const handleExportPDF = async () => {
    await exportPDF();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actionLabels = {
      'create': 'Criar',
      'update': 'Atualizar',
      'delete': 'Excluir',
      'view': 'Visualizar',
      'approve': 'Aprovar',
      'reject': 'Rejeitar',
      'send_to_supervisor': 'Enviar para Supervisor',
      'send_to_gestor': 'Enviar para Gestor',
      'renegotiate': 'Renegociar',
      'upload_file': 'Upload de Arquivo',
      'import_products': 'Importar Produtos',
      'export_data': 'Exportar Dados'
    };
    return actionLabels[action] || action;
  };

  const getResourceLabel = (resource) => {
    const resourceLabels = {
      'cotacoes': 'Cotações',
      'usuarios': 'Usuários',
      'fornecedores': 'Fornecedores',
      'aprovacoes': 'Aprovações',
      'saving': 'Saving'
    };
    return resourceLabels[resource] || resource;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Auditoria">
      <div className="space-y-4">
        {/* Cabeçalho com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-blue-800">Total de Logs</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.acoes?.length || 0}</div>
            <div className="text-sm text-green-800">Tipos de Ação</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.recursos?.length || 0}</div>
            <div className="text-sm text-purple-800">Recursos Acessados</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.logsPorDia?.length || 0}</div>
            <div className="text-sm text-orange-800">Dias com Atividade</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FaFilter />
            Filtros
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleExportXLSX}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaFileExcel />
              Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaFilePdf />
              PDF
            </Button>
          </div>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filters.data_inicio}
                  onChange={(e) => updateFilters({ data_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filters.data_fim}
                  onChange={(e) => updateFilters({ data_fim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ação
                </label>
                <select
                  value={filters.acao}
                  onChange={(e) => updateFilters({ acao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas as ações</option>
                  <option value="create">Criar</option>
                  <option value="update">Atualizar</option>
                  <option value="delete">Excluir</option>
                  <option value="view">Visualizar</option>
                  <option value="approve">Aprovar</option>
                  <option value="reject">Rejeitar</option>
                  <option value="send_to_supervisor">Enviar para Supervisor</option>
                  <option value="send_to_gestor">Enviar para Gestor</option>
                  <option value="renegotiate">Renegociar</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurso
                </label>
                <select
                  value={filters.recurso}
                  onChange={(e) => updateFilters({ recurso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos os recursos</option>
                  <option value="cotacoes">Cotações</option>
                  <option value="usuarios">Usuários</option>
                  <option value="fornecedores">Fornecedores</option>
                  <option value="aprovacoes">Aprovações</option>
                  <option value="saving">Saving</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário ID
                </label>
                <input
                  type="number"
                  value={filters.usuario_id}
                  onChange={(e) => updateFilters({ usuario_id: e.target.value })}
                  placeholder="Digite o ID do usuário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de logs */}
        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs de auditoria...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhum log de auditoria encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.usuario_nome || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.usuario_email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getActionLabel(log.acao)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getResourceLabel(log.recurso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex gap-2">
              <Button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AuditModal;
