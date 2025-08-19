import React, { useState } from 'react';
import { FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import ExportButtons from './ExportButtons';

const AuditModal = ({
  isOpen,
  onClose,
  title,
  auditLogs,
  auditLoading,
  auditFilters,
  onApplyFilters,
  onExportXLSX,
  onExportPDF,
  onFilterChange
}) => {
  const [expandedDetails, setExpandedDetails] = useState({});

  const toggleDetails = (index) => {
    setExpandedDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
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
                value={auditFilters.dataInicio}
                onChange={(e) => onFilterChange('dataInicio', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <Input
                type="date"
                value={auditFilters.dataFim}
                onChange={(e) => onFilterChange('dataFim', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={auditFilters.acao}
                onChange={(e) => onFilterChange('acao', e.target.value)}
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
          {auditLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs de auditoria...</p>
            </div>
          ) : auditLogs.length === 0 ? (
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
                  {auditLogs.map((log, index) => (
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
                                              'preco': 'Preço',
                                              'estoque': 'Estoque'
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
                                  {log.detalhes.recurso && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-1">Recurso:</h4>
                                      <div className="bg-white p-2 rounded border text-sm text-gray-600">
                                        {log.detalhes.recurso}
                                      </div>
                                    </div>
                                  )}
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
      </div>
    </Modal>
  );
};

export default AuditModal;
