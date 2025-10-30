import React from 'react';
import { ActionButtons, EmptyState } from '../ui';
import { formatDate } from '../../utils/formatters';

/**
 * Componente de tabela para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
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
  onLimitChange,
  formatarPerCapita,
  formatarPeriodo,
  obterPeriodosComPerCapita
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto per capita encontrado"
        description={pagination.totalItems === 0 
          ? 'Comece adicionando um produto per capita'
          : 'Tente ajustar os filtros para encontrar o que procura'
        }
        icon="produtos"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Per Capita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos.map((produto) => {
                const periodos = obterPeriodosComPerCapita(produto);
                
                return (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {produto.nome_produto || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {produto.codigo_produto || '-'} - {produto.unidade_medida || '-'} - {produto.grupo || '-'}
                      </div>
                    </td>
                    
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        {periodos.length > 0 ? (
                          periodos.map((periodo) => (
                            <div key={periodo.periodo} className="text-sm">
                              <span className="text-gray-600">{periodo.nome}:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {formatarPerCapita(periodo.valor)}g
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Nenhum per capita definido</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        produto.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(produto.created_at)}
                    </td>
                    
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={() => onView(produto)}
                        onEdit={() => onEdit(produto)}
                        onDelete={() => onDelete(produto)}
                        size="xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {produtos.map((produto) => {
          const periodos = obterPeriodosComPerCapita(produto);
          
          return (
            <div key={produto.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{produto.nome_produto || '-'}</h3>
                </div>
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={() => onView(produto)}
                  onEdit={() => onEdit(produto)}
                  onDelete={() => onDelete(produto)}
                  size="xs"
                  className="p-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Código:</span>
                  <p className="font-medium">{produto.codigo_produto || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Grupo:</span>
                  <p className="font-medium">{produto.grupo || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unidade:</span>
                  <p className="font-medium">{produto.unidade_medida || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium ml-2 ${
                    produto.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {periodos.length > 0 && (
                <div className="mt-3 text-xs">
                  <span className="text-gray-500 font-medium">Per Capita:</span>
                  <div className="mt-1 space-y-1">
                    {periodos.map((periodo) => (
                      <div key={periodo.periodo} className="flex justify-between">
                        <span className="text-gray-600">{periodo.nome}:</span>
                        <span className="font-medium text-gray-900">
                          {formatarPerCapita(periodo.valor)}g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                </span>{' '}
                até{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                de{' '}
                <span className="font-medium">{pagination.totalItems}</span>{' '}
                resultados
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
              
              <div className="flex gap-1">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProdutosPerCapitaTable;
