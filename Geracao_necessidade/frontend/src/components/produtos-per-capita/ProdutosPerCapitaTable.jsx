import React from 'react';
import { FaBox } from 'react-icons/fa';
import ActionButtons from '../ui/ActionButtons';
import Button from '../ui/Button';
import { Pagination } from '../shared';

const ProdutosPerCapitaTable = ({ 
  produtos = [], 
  loading = false,
  pagination = {},
  canView = false,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onPageChange,
  onLimitChange
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="text-center py-8 text-gray-500">
          <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando produtos per capita</p>
          {onAdd && (
            <Button
              onClick={onAdd}
              variant="primary"
              className="inline-flex items-center"
            >
              <FaBox className="mr-2" />
              Adicionar Produto
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header da Tabela */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Lista de Produtos ({pagination.totalItems || produtos.length})
        </h3>
      </div>

      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Per Capita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {produto.nome_produto}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {produto.per_capita_lanche_manha > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🌅 Lanche Manhã: {parseFloat(produto.per_capita_lanche_manha).toFixed(3)}
                          </span>
                        )}
                        {produto.per_capita_almoco > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🍽️ Almoço: {parseFloat(produto.per_capita_almoco).toFixed(3)}
                          </span>
                        )}
                        {produto.per_capita_lanche_tarde > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🌆 Lanche Tarde: {parseFloat(produto.per_capita_lanche_tarde).toFixed(3)}
                          </span>
                        )}
                        {produto.per_capita_parcial > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🥗 Parcial: {parseFloat(produto.per_capita_parcial).toFixed(3)}
                          </span>
                        )}
                        {produto.per_capita_eja > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            🌙 EJA: {parseFloat(produto.per_capita_eja).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {produto.unidade_medida}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      produto.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={produto}
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
        {produtos.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{produto.nome_produto}</h3>
                <p className="text-gray-600 text-xs">Unidade: {produto.unidade_medida}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={produto}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-xs">Per Capita:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {produto.per_capita_lanche_manha > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🌅 Lanche Manhã: {parseFloat(produto.per_capita_lanche_manha).toFixed(3)}
                    </span>
                  )}
                  {produto.per_capita_almoco > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🍽️ Almoço: {parseFloat(produto.per_capita_almoco).toFixed(3)}
                    </span>
                  )}
                  {produto.per_capita_lanche_tarde > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      🌆 Lanche Tarde: {parseFloat(produto.per_capita_lanche_tarde).toFixed(3)}
                    </span>
                  )}
                  {produto.per_capita_parcial > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🥗 Parcial: {parseFloat(produto.per_capita_parcial).toFixed(3)}
                    </span>
                  )}
                  {produto.per_capita_eja > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      🌙 EJA: {parseFloat(produto.per_capita_eja).toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  produto.ativo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
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

export default ProdutosPerCapitaTable;
