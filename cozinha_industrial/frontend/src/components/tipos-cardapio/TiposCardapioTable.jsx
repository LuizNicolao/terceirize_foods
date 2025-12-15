import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

/**
 * Componente de tabela para Tipos de Cardápio
 */
const TiposCardapioTable = ({
  tiposCardapio = [],
  loading = false,
  canView = true,
  canEdit = true,
  canDelete = true,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort
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

  if (tiposCardapio.length === 0) {
    return (
      <EmptyState
        title="Nenhum tipo de cardápio encontrado"
        description="Não há tipos de cardápio cadastrados ou os filtros aplicados não retornaram resultados"
        icon="utensils"
      />
    );
  }

  // Normalizar sortDirection para 'asc' ou 'desc'
  const normalizedSortDirection = sortDirection === 'ASC' ? 'asc' : sortDirection === 'DESC' ? 'desc' : null;
  
  // Handler para ordenação compatível com SortableTableHeader
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Agrupar dados por Filial + Centro de Custo + Contrato (se já vierem agrupados do backend)
  // Se não vierem agrupados, manter compatibilidade com formato antigo
  const dadosAgrupados = tiposCardapio.length > 0 && tiposCardapio[0].filial_nome 
    ? tiposCardapio 
    : [];

  // Se não houver dados agrupados, retornar empty state
  if (dadosAgrupados.length === 0 && tiposCardapio.length === 0) {
    return (
      <EmptyState
        title="Nenhum tipo de cardápio encontrado"
        description="Não há tipos de cardápio cadastrados ou os filtros aplicados não retornaram resultados"
        icon="utensils"
      />
    );
  }

  // Formatar lista de produtos
  const formatarListaProdutos = (produtos = []) => {
    if (!Array.isArray(produtos) || produtos.length === 0) {
      return '-';
    }
    return produtos
      .map(produto => produto.nome || `ID ${produto.id}`)
      .join(', ');
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
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Custo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos Comerciais
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosAgrupados
                .sort((a, b) => (a.filial_nome || '').localeCompare(b.filial_nome || ''))
                .map((item) => (
                <tr key={`${item.filial_id ?? 'sem'}-${item.centro_custo_id ?? 'sem'}-${item.contrato_id ?? 'sem'}-${item.primaryRecord?.id || 'sem-id'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.filial_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.centro_custo_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.contrato_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {item.total_unidades || 0}
                      {item.total_unidades === 1 ? ' UNIDADE' : ' UNIDADES'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatarListaProdutos(item.produtos)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {item.primaryRecord && (
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={() => onView && onView(item.primaryRecord)}
                        onEdit={() => onEdit && onEdit(item.primaryRecord)}
                        onDelete={() => onDelete && onDelete(item.primaryRecord)}
                        item={item.primaryRecord}
                        size="sm"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile/Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {dadosAgrupados
          .sort((a, b) => (a.filial_nome || '').localeCompare(b.filial_nome || ''))
          .map((item) => (
          <div key={`${item.filial_id ?? 'sem'}-${item.centro_custo_id ?? 'sem'}-${item.contrato_id ?? 'sem'}-${item.primaryRecord?.id || 'sem-id'}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {item.filial_nome || 'Filial não informada'}
                </p>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {item.centro_custo_nome || 'Centro de Custo não informado'}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  {item.contrato_nome || 'Contrato não informado'}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  {item.total_unidades || 0}
                  {item.total_unidades === 1 ? ' UNIDADE' : ' UNIDADES'}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  Produtos: {formatarListaProdutos(item.produtos)}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {item.primaryRecord && (
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={() => onView && onView(item.primaryRecord)}
                  onEdit={() => onEdit && onEdit(item.primaryRecord)}
                  onDelete={() => onDelete && onDelete(item.primaryRecord)}
                  item={item.primaryRecord}
                  size="sm"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TiposCardapioTable;

