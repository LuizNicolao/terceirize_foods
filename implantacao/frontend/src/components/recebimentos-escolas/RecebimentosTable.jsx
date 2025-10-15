import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { ActionButtons, EmptyState, Pagination } from '../ui';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';

const RecebimentosTable = ({ 
  recebimentos, 
  pagination,
  onView, 
  onEdit, 
  onDelete, 
  onAdd,
  canView, 
  canEdit, 
  canDelete, 
  canCreate,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!recebimentos || recebimentos.length === 0) {
    return (
      <EmptyState
        title="Nenhum recebimento encontrado"
        description="Comece adicionando um novo recebimento"
        icon="recebimentos"
        action={
          canCreate && (
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaPlus className="mr-2" />
              Novo Recebimento
            </button>
          )
        }
      />
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completo': { color: 'bg-green-100 text-green-800', label: 'Completo' },
      'Parcial': { color: 'bg-yellow-100 text-yellow-800', label: 'Parcial' },
      'Pendente': { color: 'bg-red-100 text-red-800', label: 'Pendente' }
    };

    const config = statusConfig[status] || statusConfig['Pendente'];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Recebimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos
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
                      {recebimento.escola_nome || 'N/A'}
                    </div>
                    {recebimento.escola_cidade && (
                      <div className="text-sm text-gray-500">
                        {recebimento.escola_cidade}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarDataParaExibicao(recebimento.data_recebimento) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recebimento.tipo_entrega || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(recebimento.status || recebimento.tipo_recebimento)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recebimento.total_produtos || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView(recebimento)}
                      onEdit={() => onEdit(recebimento)}
                      onDelete={() => onDelete(recebimento)}
                      item={recebimento}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {recebimentos.map((recebimento) => (
          <div key={recebimento.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {recebimento.escola_nome || 'N/A'}
                </h3>
                <p className="text-gray-600 text-xs">
                  {recebimento.escola_cidade || ''}
                </p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={() => onView(recebimento)}
                onEdit={() => onEdit(recebimento)}
                onDelete={() => onDelete(recebimento)}
                item={recebimento}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Data:</span>
                <p className="font-medium">
                  {formatarDataParaExibicao(recebimento.data_recebimento) || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{recebimento.tipo_entrega || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="mt-1">
                  {getStatusBadge(recebimento.status || recebimento.tipo_recebimento)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Produtos:</span>
                <p className="font-medium">{recebimento.total_produtos || 0}</p>
              </div>
            </div>
            
            {recebimento.observacoes && (
              <div className="mt-3 text-xs">
                <span className="text-gray-500">Observações:</span>
                <p className="text-gray-700 mt-1">{recebimento.observacoes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={pagination.onLimitChange}
          />
        </div>
      )}
    </>
  );
};

export default RecebimentosTable;