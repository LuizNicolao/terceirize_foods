import React from 'react';
import { EmptyState, ActionButtons } from '../../../components/ui';

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lanche Manhã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Almoço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lanche Tarde
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EJA
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
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {produto.produto_nome || produto.nome_produto || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {produto.produto_codigo || produto.codigo || '-'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {produto.unidade_medida || '-'} - {produto.grupo || '-'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPerCapita(produto.per_capita_lanche_manha)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPerCapita(produto.per_capita_almoco)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPerCapita(produto.per_capita_lanche_tarde)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPerCapita(produto.per_capita_parcial)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPerCapita(produto.per_capita_eja)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(produto.ativo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <ActionButtons
                    canView={canView('produtos_per_capita')}
                    canEdit={canEdit('produtos_per_capita')}
                    canDelete={canDelete('produtos_per_capita')}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    item={produto}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ProdutosPerCapitaTable;
