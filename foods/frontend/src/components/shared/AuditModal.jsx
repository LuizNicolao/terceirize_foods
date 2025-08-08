import React from 'react';
import { FaTimes, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

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
            <Button 
              variant="outline"
              size="sm"
              onClick={onExportXLSX}
              className="flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
              Exportar XLSX
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="flex items-center gap-2"
            >
              <FaFilePdf className="w-4 h-4" />
              Exportar PDF
            </Button>
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
                      Campo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Anterior
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Novo Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.usuario_nome || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.action === 'create' ? 'bg-green-100 text-green-800' :
                          log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'delete' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action === 'create' ? 'Criar' :
                           log.action === 'update' ? 'Editar' :
                           log.action === 'delete' ? 'Excluir' :
                           log.action === 'view' ? 'Visualizar' : log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.field_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.old_value || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.new_value || '-'}
                      </td>
                    </tr>
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
