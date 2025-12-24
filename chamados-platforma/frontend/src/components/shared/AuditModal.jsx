import React, { useState } from 'react';
import { FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Button, Input, Modal, Pagination } from '../ui';
import ExportButtons from './ExportButtons';

const AuditModal = ({
  isOpen,
  onClose,
  logs,
  auditLogs, // Adicionar suporte para auditLogs
  loading,
  auditLoading, // Adicionar suporte para auditLoading
  filters,
  auditFilters, // Adicionar suporte para auditFilters
  onApplyFilters,
  onExportXLSX,
  onExportPDF,
  onSetFilters,
  onFilterChange, // Adicionar suporte para onFilterChange
  title, // Adicionar suporte para title
  // Props de paginação
  auditPagination,
  onPageChange,
  onItemsPerPageChange
}) => {
  const [expandedDetails, setExpandedDetails] = useState({});

  const toggleDetails = (index) => {
    setExpandedDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isOpen) return null;

  // Usar as props corretas com fallback
  const currentLogs = Array.isArray(auditLogs) ? auditLogs : (Array.isArray(logs) ? logs : []);
  const currentLoading = auditLoading !== undefined ? auditLoading : loading;
  const currentFilters = auditFilters || filters || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {title || 'Relatório de Auditoria'}
          </h2>
          <div className="flex items-center gap-2">
            <ExportButtons
              onExportXLSX={onExportXLSX}
              onExportPDF={onExportPDF}
              variant="outline"
              size="sm"
              showLabels={true}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <FaTimes className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <Input
                type="date"
                value={currentFilters?.dataInicio || ''}
                onChange={(e) => {
                  const newFilters = { ...currentFilters, dataInicio: e.target.value };
                  if (onSetFilters) {
                    onSetFilters(newFilters);
                  } else if (onFilterChange) {
                    onFilterChange('dataInicio', e.target.value);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <Input
                type="date"
                value={currentFilters?.dataFim || ''}
                onChange={(e) => {
                  const newFilters = { ...currentFilters, dataFim: e.target.value };
                  if (onSetFilters) {
                    onSetFilters(newFilters);
                  } else if (onFilterChange) {
                    onFilterChange('dataFim', e.target.value);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={currentFilters?.acao || ''}
                onChange={(e) => {
                  const newFilters = { ...currentFilters, acao: e.target.value };
                  if (onSetFilters) {
                    onSetFilters(newFilters);
                  } else if (onFilterChange) {
                    onFilterChange('acao', e.target.value);
                  }
                }}
              >
                <option value="">Todas</option>
                <option value="create">Criar</option>
                <option value="update">Editar</option>
                <option value="delete">Excluir</option>
                <option value="view">Visualizar</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={onApplyFilters}
                className="w-full"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {currentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs de auditoria...</p>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log de auditoria encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLogs.map((log, index) => (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.usuario_nome || 'Sistema'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.acao === 'create' ? 'bg-green-100 text-green-800' :
                            log.acao === 'update' ? 'bg-blue-100 text-blue-800' :
                            log.acao === 'delete' ? 'bg-red-100 text-red-800' :
                            log.acao === 'login' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.acao === 'create' ? 'Criar' :
                             log.acao === 'update' ? 'Editar' :
                             log.acao === 'delete' ? 'Excluir' :
                             log.acao === 'login' ? 'Login' :
                             log.acao === 'view' ? 'Visualizar' : log.acao}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.detalhes ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDetails(index)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            >
                              {expandedDetails[index] ? (
                                <FaChevronDown className="w-3 h-3" />
                              ) : (
                                <FaChevronRight className="w-3 h-3" />
                              )}
                              Ver detalhes
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                      {expandedDetails[index] && log.detalhes && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 bg-gray-50">
                            <div className="max-w-full">
                              {typeof log.detalhes === 'object' ? (
                                <div className="space-y-3">
                                  {/* Dados de criação (requestBody) - apenas para ações de criação */}
                                  {log.detalhes.requestBody && log.acao === 'create' && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Dados Criados:</h4>
                                      <div className="bg-white p-3 rounded border">
                                        <div className="space-y-3">
                                          {Object.entries(log.detalhes.requestBody).map(([field, value], idx) => {
                                            // Traduzir nomes de campos comuns
                                            const fieldTranslations = {
                                              'razao_social': 'Razão Social',
                                              'nome_fantasia': 'Nome Fantasia',
                                              'cnpj': 'CNPJ',
                                              'inscricao_estadual': 'Inscrição Estadual',
                                              'endereco': 'Endereço',
                                              'cidade': 'Cidade',
                                              'uf': 'UF',
                                              'cep': 'CEP',
                                              'telefone': 'Telefone',
                                              'email': 'Email',
                                              'contato': 'Contato',
                                              'status': 'Status',
                                              'nome': 'Nome',
                                              'descricao': 'Descrição',
                                              'codigo': 'Código',
                                              'titulo': 'Título',
                                              'descricao': 'Descrição',
                                              'sistema': 'Sistema',
                                              'tela': 'Tela',
                                              'tipo': 'Tipo',
                                              'status': 'Status',
                                              'prioridade': 'Prioridade'
                                            };
                                            
                                            const displayField = fieldTranslations[field] || field;
                                            const displayValue = value === null ? 'Nulo' : String(value);
                                            
                                            return (
                                              <div key={idx} className="border-l-4 border-green-200 pl-3">
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-medium text-gray-700 mb-1">
                                                    {displayField}
                                                  </span>
                                                  <div className="text-sm">
                                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                                      {displayValue}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Dados de edição (requestBody) - para ações de edição */}
                                  {log.detalhes.requestBody && log.acao === 'update' && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Dados Editados:</h4>
                                      <div className="bg-white p-3 rounded border">
                                        <div className="space-y-3">
                                          {Object.entries(log.detalhes.requestBody).map(([field, value], idx) => {
                                            // Traduzir nomes de campos comuns
                                            const fieldTranslations = {
                                              'razao_social': 'Razão Social',
                                              'nome_fantasia': 'Nome Fantasia',
                                              'cnpj': 'CNPJ',
                                              'inscricao_estadual': 'Inscrição Estadual',
                                              'endereco': 'Endereço',
                                              'cidade': 'Cidade',
                                              'uf': 'UF',
                                              'cep': 'CEP',
                                              'telefone': 'Telefone',
                                              'email': 'Email',
                                              'contato': 'Contato',
                                              'status': 'Status',
                                              'nome': 'Nome',
                                              'descricao': 'Descrição',
                                              'codigo': 'Código',
                                              'titulo': 'Título',
                                              'descricao': 'Descrição',
                                              'sistema': 'Sistema',
                                              'tela': 'Tela',
                                              'tipo': 'Tipo',
                                              'status': 'Status',
                                              'prioridade': 'Prioridade'
                                            };
                                            
                                            const displayField = fieldTranslations[field] || field;
                                            const displayValue = value === null ? 'Nulo' : String(value);
                                            
                                            return (
                                              <div key={idx} className="border-l-4 border-yellow-200 pl-3">
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-medium text-gray-700 mb-1">
                                                    {displayField}
                                                  </span>
                                                  <div className="text-sm">
                                                    <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                      {displayValue}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Mudanças de edição (changes) */}
                                  {log.detalhes.changes && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Mudanças Realizadas:</h4>
                                      <div className="bg-white p-3 rounded border">
                                        <div className="space-y-3">
                                          {Object.entries(log.detalhes.changes).map(([field, change], idx) => {
                                            // Traduzir nomes de campos comuns
                                            const fieldTranslations = {
                                              'razao_social': 'Razão Social',
                                              'nome_fantasia': 'Nome Fantasia',
                                              'cnpj': 'CNPJ',
                                              'inscricao_estadual': 'Inscrição Estadual',
                                              'endereco': 'Endereço',
                                              'cidade': 'Cidade',
                                              'uf': 'UF',
                                              'cep': 'CEP',
                                              'telefone': 'Telefone',
                                              'email': 'Email',
                                              'contato': 'Contato',
                                              'status': 'Status',
                                              'nome': 'Nome',
                                              'descricao': 'Descrição',
                                              'codigo': 'Código',
                                              'titulo': 'Título',
                                              'descricao': 'Descrição',
                                              'sistema': 'Sistema',
                                              'tela': 'Tela',
                                              'tipo': 'Tipo',
                                              'status': 'Status',
                                              'prioridade': 'Prioridade'
                                            };
                                            
                                            const displayField = fieldTranslations[field] || field;
                                            const fromValue = change.from || 'vazio';
                                            const toValue = change.to || 'vazio';
                                            
                                            return (
                                              <div key={idx} className="border-l-4 border-blue-200 pl-3">
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-medium text-gray-700 mb-1">
                                                    {displayField}
                                                  </span>
                                                  <div className="flex items-center space-x-2 text-sm">
                                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                                      {fromValue}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                                      {toValue}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Informações da requisição */}
                                  {(log.detalhes.url || log.detalhes.method || log.detalhes.statusCode) && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Informações da Requisição:</h4>
                                      <div className="bg-white p-3 rounded border">
                                        <div className="space-y-2">
                                          {log.detalhes.url && (
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-600">URL:</span>
                                              <span className="text-sm text-gray-900">{log.detalhes.url}</span>
                                            </div>
                                          )}
                                          {log.detalhes.method && (
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-600">Método:</span>
                                              <span className="text-sm text-gray-900">{log.detalhes.method}</span>
                                            </div>
                                          )}
                                          {log.detalhes.statusCode && (
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-600">Status:</span>
                                              <span className={`text-sm px-2 py-1 rounded ${
                                                log.detalhes.statusCode >= 200 && log.detalhes.statusCode < 300 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {log.detalhes.statusCode}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* User Agent */}
                                  {log.detalhes.userAgent && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-1">User Agent:</h4>
                                      <div className="bg-white p-2 rounded border text-sm text-gray-600">
                                        {log.detalhes.userAgent}
                                      </div>
                                    </div>
                                  )}

                                  {/* IP Address */}
                                  {log.detalhes.ip_address && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-1">Endereço IP:</h4>
                                      <div className="bg-white p-2 rounded border text-sm text-gray-600">
                                        {log.detalhes.ip_address}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              ) : (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm text-gray-600">{String(log.detalhes)}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {auditPagination && onPageChange && onItemsPerPageChange && (
          <div className="p-6 border-t border-gray-200">
            <Pagination
              currentPage={auditPagination.currentPage}
              totalPages={auditPagination.totalPages}
              totalItems={auditPagination.totalItems}
              itemsPerPage={auditPagination.itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AuditModal;
