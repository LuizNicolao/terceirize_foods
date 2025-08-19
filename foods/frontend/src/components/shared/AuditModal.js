import React from 'react';
import { FaTimes, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button, Modal } from './ui';

const AuditModal = ({ 
  isOpen, 
  onClose, 
  auditLogs = [], 
  auditLoading = false,
  auditFilters = {},
  onFiltersChange = () => {},
  onApplyFilters = () => {},
  onExportXLSX = () => {},
  onExportPDF = () => {}
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const labels = {
      'nome': 'Nome',
      'descricao': 'Descrição',
      'codigo_barras': 'Código de Barras',
      'fator_conversao': 'Fator de Conversão',
      'preco_custo': 'Preço de Custo',
      'preco_venda': 'Preço de Venda',
      'estoque_atual': 'Estoque Atual',
      'estoque_minimo': 'Estoque Mínimo',
      'id_fornecedor': 'Fornecedor',
      'grupo_id': 'Grupo',
      'unidade_id': 'Unidade',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'preco_custo':
      case 'preco_venda':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'estoque_atual':
      case 'estoque_minimo':
        return value.toString();
      case 'status':
        return value === 1 ? 'Ativo' : 'Inativo';
      default:
        return value;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="7xl">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Relatório de Auditoria - Produtos
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={onExportXLSX}
              className="flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
              Excel
            </Button>
            <Button
              variant="info"
              size="sm"
              onClick={onExportPDF}
              className="flex items-center gap-2"
            >
              <FaFilePdf className="w-4 h-4" />
              PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <FaTimes className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={auditFilters.dataInicio || ''}
                onChange={(e) => onFiltersChange({...auditFilters, dataInicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={auditFilters.dataFim || ''}
                onChange={(e) => onFiltersChange({...auditFilters, dataFim: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ação
              </label>
              <select
                value={auditFilters.acao || ''}
                onChange={(e) => onFiltersChange({...auditFilters, acao: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criar</option>
                <option value="update">Editar</option>
                <option value="delete">Excluir</option>
                <option value="login">Login</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <select
                value={auditFilters.usuario_id || ''}
                onChange={(e) => onFiltersChange({...auditFilters, usuario_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos os usuários</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={auditFilters.periodo || ''}
                onChange={(e) => onFiltersChange({...auditFilters, periodo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Período personalizado</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
                <option value="todos">Todos os registros</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={onApplyFilters}
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={onExportXLSX}
              className="flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
              Exportar XLSX
            </Button>
            <Button
              variant="info"
              size="sm"
              onClick={onExportPDF}
              className="flex items-center gap-2"
            >
              <FaFilePdf className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {auditLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log encontrado com os filtros aplicados
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                {auditLogs.length} log(s) encontrado(s)
              </div>
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.acao === 'create' ? 'bg-green-100 text-green-800' : 
                          log.acao === 'update' ? 'bg-yellow-100 text-yellow-800' : 
                          log.acao === 'delete' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getActionLabel(log.acao)}
                        </span>
                        <span className="text-sm text-gray-600">
                          por {log.usuario_nome || 'Usuário desconhecido'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    
                    {log.detalhes && (
                      <div className="text-sm text-gray-700">
                        {log.detalhes.changes && (
                          <div className="mb-3">
                            <strong className="text-gray-900">Mudanças Realizadas:</strong>
                            <div className="mt-2 space-y-2">
                              {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                <div key={field} className="p-3 bg-gray-50 rounded border border-gray-200">
                                  <div className="font-semibold text-gray-900 mb-2">
                                    {getFieldLabel(field)}:
                                  </div>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-red-700">
                                      <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                    </span>
                                    <span className="text-gray-500">→</span>
                                    <span className="text-green-700">
                                      <strong>Depois:</strong> {formatFieldValue(field, change.to)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.detalhes.requestBody && !log.detalhes.changes && (
                          <div>
                            <strong className="text-gray-900">Dados do Produto:</strong>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                <div key={field} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                                  <div className="font-semibold text-gray-900 mb-1">
                                    {getFieldLabel(field)}:
                                  </div>
                                  <div className="text-green-700">
                                    {formatFieldValue(field, value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.detalhes.resourceId && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                            <strong className="text-blue-900">ID do Produto:</strong> 
                            <span className="text-blue-700 ml-1">
                              #{log.detalhes.resourceId}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuditModal; 