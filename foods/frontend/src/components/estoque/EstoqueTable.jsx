import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const EstoqueTable = ({ 
  estoques, 
  canView, 
  onView, 
  getStatusLabel,
  formatDate,
  formatCurrency,
  formatNumber,
  sortField,
  sortDirection,
  onSort
}) => {
  if (!Array.isArray(estoques) || estoques.length === 0) {
    return (
      <EmptyState
        title="Nenhum estoque encontrado"
        description="Tente ajustar os filtros de busca"
        icon="estoque"
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
                <SortableTableHeader
                  label="Produto"
                  field="produto_generico_nome"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Almoxarifado"
                  field="almoxarifado_nome"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Disponível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Unitário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estoques.map((estoque) => (
                <tr key={estoque.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {estoque.produto_generico_nome || '-'}
                    </div>
                    {estoque.produto_generico_codigo && (
                      <div className="text-xs text-gray-500">
                        {estoque.produto_generico_codigo}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {estoque.almoxarifado_nome || '-'}
                    </div>
                    {estoque.almoxarifado_codigo && (
                      <div className="text-xs text-gray-500">
                        {estoque.almoxarifado_codigo}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(estoque.quantidade_atual)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      estoque.quantidade_disponivel < (estoque.estoque_minimo || 0)
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    }`}>
                      {formatNumber(estoque.quantidade_disponivel)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(estoque.valor_unitario_medio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(estoque.valor_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      estoque.status === 'ATIVO'
                        ? 'bg-green-100 text-green-800' 
                        : estoque.status === 'BLOQUEADO'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(estoque.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView('almoxarifado_estoque') && onView}
                      canEdit={false}
                      canDelete={false}
                      onView={() => onView(estoque.id)}
                      item={estoque.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {estoques.map((estoque) => (
          <div key={estoque.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{estoque.produto_generico_nome || '-'}</h3>
                <p className="text-gray-600 text-sm">
                  {estoque.produto_generico_codigo && `Código: ${estoque.produto_generico_codigo}`}
                </p>
              </div>
              <ActionButtons
                canView={canView('almoxarifado_estoque') && onView}
                canEdit={false}
                canDelete={false}
                onView={() => onView(estoque.id)}
                item={estoque.id}
                size="xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Almoxarifado:</span>
                <p className="font-medium">{estoque.almoxarifado_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Quantidade:</span>
                <p className="font-medium">{formatNumber(estoque.quantidade_atual)}</p>
              </div>
              <div>
                <span className="text-gray-500">Disponível:</span>
                <p className={`font-medium ${
                  estoque.quantidade_disponivel < (estoque.estoque_minimo || 0)
                    ? 'text-red-600' 
                    : ''
                }`}>
                  {formatNumber(estoque.quantidade_disponivel)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Valor Total:</span>
                <p className="font-medium">{formatCurrency(estoque.valor_total)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  estoque.status === 'ATIVO'
                    ? 'bg-green-100 text-green-800' 
                    : estoque.status === 'BLOQUEADO'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(estoque.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default EstoqueTable;

