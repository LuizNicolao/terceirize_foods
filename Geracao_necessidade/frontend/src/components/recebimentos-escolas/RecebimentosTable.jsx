import React from 'react';
import { FaPlus } from 'react-icons/fa';
import ActionButtons from '../ui/ActionButtons';
import { formatarDataParaExibicao } from '../../utils/recebimentosUtils';
import { getStatusColor } from '../../utils/recebimentosUtils';
import { Pagination } from '../shared';

const RecebimentosTable = ({ 
  recebimentos, 
  pagination = {},
  onEdit, 
  onDelete, 
  onView,
  onAdd,
  onPageChange,
  onLimitChange,
  canEdit,
  canDelete,
  canView,
  canCreate,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando recebimentos...</span>
      </div>
    );
  }

  if (recebimentos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum recebimento encontrado</h3>
        <p className="text-gray-600 mb-4">Comece adicionando um novo recebimento</p>
        {canCreate && (
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaPlus className="mr-2" />
            Novo Recebimento
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header da Tabela */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Lista de Recebimentos ({pagination.totalItems || recebimentos.length})
        </h3>
      </div>

      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Recebimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendência Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recebimentos.map((recebimento) => (
                <tr key={recebimento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {recebimento.nome_escola}
                    </div>
                    <div className="text-sm text-gray-500">
                      {recebimento.rota}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatarDataParaExibicao(recebimento.data_recebimento)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recebimento.tipo_recebimento === 'Completo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recebimento.tipo_recebimento}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {recebimento.tipo_entrega}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recebimento.status_entrega === 'No Prazo' 
                        ? 'bg-green-100 text-green-800' 
                        : recebimento.status_entrega === 'Atrasado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recebimento.status_entrega}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recebimento.pendencia_anterior === 'Sim' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {recebimento.pendencia_anterior}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recebimento.usuario_nome || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={recebimento}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden p-4 space-y-3">
        {recebimentos.map((recebimento) => (
          <div key={recebimento.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{recebimento.nome_escola}</h3>
                <p className="text-gray-600 text-xs">{recebimento.rota}</p>
                <p className="text-gray-500 text-xs">
                  Data: {formatarDataParaExibicao(recebimento.data_recebimento)}
                </p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={recebimento}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  recebimento.tipo_recebimento === 'Completo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {recebimento.tipo_recebimento}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {recebimento.tipo_entrega}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  recebimento.status_entrega === 'No Prazo' 
                    ? 'bg-green-100 text-green-800' 
                    : recebimento.status_entrega === 'Atrasado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {recebimento.status_entrega}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  recebimento.pendencia_anterior === 'Sim' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  Pendência: {recebimento.pendencia_anterior}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Usuário:</span>
                <p className="font-medium text-sm">{recebimento.usuario_nome || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={loading}
        />
      )}
    </div>
  );
};

export default RecebimentosTable;
