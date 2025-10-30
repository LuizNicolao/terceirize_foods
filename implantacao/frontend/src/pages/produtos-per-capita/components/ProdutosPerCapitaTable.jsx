import React from 'react';
import { EmptyState, ActionButtons, SortableHeader, useSorting } from '../../../components/ui';

const ProdutosPerCapitaTable = ({ 
  produtos, 
  loading, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  formatarPerCapita,
  formatarPeriodo,
  obterPeriodosComPerCapita
}) => {
  // Hook para ordenação
  const { sortConfig, handleSort, sortData } = useSorting('produto_nome', 'asc');
  
  // Aplicar ordenação aos dados
  const produtosOrdenados = sortData(produtos);
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!produtos || produtos.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <EmptyState
          title="Nenhum produto per capita encontrado"
          description="Tente ajustar os filtros de busca ou adicionar um novo produto per capita"
          icon="produtos"
        />
      </div>
    );
  }

  const formatPerCapita = (value) => {
    if (value === null || value === undefined) return '-';
    return parseFloat(value).toFixed(2);
  };

  const getStatusBadge = (ativo) => {
    const statusConfig = {
      1: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      0: { label: 'Inativo', className: 'bg-red-100 text-red-800' },
      true: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      false: { label: 'Inativo', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[ativo] || { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${config.className}`}>
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
                <SortableHeader 
                  field="produto_nome" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Produto
                </SortableHeader>
                <SortableHeader 
                  field="per_capita_lanche_manha" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Lanche Manhã
                </SortableHeader>
                <SortableHeader 
                  field="per_capita_almoco" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Almoço
                </SortableHeader>
                <SortableHeader 
                  field="per_capita_lanche_tarde" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Lanche Tarde
                </SortableHeader>
                <SortableHeader 
                  field="per_capita_parcial" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Parcial
                </SortableHeader>
                <SortableHeader 
                  field="per_capita_eja" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  EJA
                </SortableHeader>
                <SortableHeader 
                  field="ativo" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Status
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtosOrdenados.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {produto.produto_nome || produto.nome_produto || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {produto.produto_codigo || produto.codigo || '-'} - {produto.unidade_medida || '-'} - {produto.grupo || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatPerCapita(produto.per_capita_lanche_manha)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatPerCapita(produto.per_capita_almoco)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatPerCapita(produto.per_capita_lanche_tarde)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatPerCapita(produto.per_capita_parcial)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatPerCapita(produto.per_capita_eja)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(produto.ativo)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('produtos_per_capita')}
                      canEdit={canEdit('produtos_per_capita')}
                      canDelete={canDelete('produtos_per_capita')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={produto}
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
        {produtosOrdenados.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{produto.produto_nome || produto.nome_produto || '-'}</h3>
                <p className="text-gray-600 text-xs">
                  {produto.produto_codigo || produto.codigo || '-'} - {produto.unidade_medida || '-'} - {produto.grupo || '-'}
                </p>
              </div>
              <ActionButtons
                canView={canView('produtos_per_capita')}
                canEdit={canEdit('produtos_per_capita')}
                canDelete={canDelete('produtos_per_capita')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={produto}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Lanche Manhã:</span>
                <p className="font-medium">{formatPerCapita(produto.per_capita_lanche_manha)}</p>
              </div>
              <div>
                <span className="text-gray-500">Almoço:</span>
                <p className="font-medium">{formatPerCapita(produto.per_capita_almoco)}</p>
              </div>
              <div>
                <span className="text-gray-500">Lanche Tarde:</span>
                <p className="font-medium">{formatPerCapita(produto.per_capita_lanche_tarde)}</p>
              </div>
              <div>
                <span className="text-gray-500">Parcial:</span>
                <p className="font-medium">{formatPerCapita(produto.per_capita_parcial)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">EJA:</span>
                <p className="font-medium">{formatPerCapita(produto.per_capita_eja)}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <span className="text-gray-500 text-xs">Status:</span>
              {getStatusBadge(produto.ativo)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProdutosPerCapitaTable;
