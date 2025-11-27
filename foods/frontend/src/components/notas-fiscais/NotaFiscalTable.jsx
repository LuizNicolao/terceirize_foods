import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const NotaFiscalTable = ({ 
  notasFiscais = [], 
  onView, 
  onEdit, 
  onDelete,
  onPrint,
  getFornecedorName,
  getFilialName,
  sortField,
  sortDirection,
  onSort
}) => {
  // Garantir que notasFiscais seja sempre um array
  const notasFiscaisArray = Array.isArray(notasFiscais) ? notasFiscais : [];

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'LANCADA': { label: 'Lançada', className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getTipoBadge = (tipo) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        tipo === 'ENTRADA' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
      </span>
    );
  };

  if (notasFiscaisArray.length === 0) {
    return (
      <EmptyState
        title="Nenhuma nota fiscal encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova nota fiscal"
        icon="document"
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
                  label="N Lancamento"
                  field="id"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Número"
                  field="numero_nota"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Série"
                  field="serie"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <SortableTableHeader
                  label="Data Emissão"
                  field="data_emissao"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Valor Total"
                  field="valor_total"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notasFiscaisArray.map((nota) => (
                <tr key={nota.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {nota.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {nota.numero_nota}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {nota.serie || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTipoBadge(nota.tipo_nota)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getFornecedorName(nota.fornecedor_id) || nota.fornecedor_nome || '-'}
                    </div>
                    {nota.fornecedor_fantasia && (
                      <div className="text-xs text-gray-500">
                        {nota.fornecedor_fantasia}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getFilialName(nota.filial_id) || nota.filial_nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(nota.data_emissao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(nota.valor_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(nota.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <ActionButtons
                        canView={!!onView}
                        canEdit={true}
                        canDelete={true}
                        canPrint={!!onPrint}
                        onView={onView}
                        onEdit={null}
                        onDelete={null}
                        onPrint={onPrint}
                        item={nota}
                        size="xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {notasFiscaisArray.map((nota) => (
          <div key={nota.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">N Lancamento:</span>
                  <span className="text-xs font-semibold text-gray-900">{nota.id}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  NF {nota.numero_nota} {nota.serie ? `Série ${nota.serie}` : ''}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {getFornecedorName(nota.fornecedor_id) || nota.fornecedor_nome || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {getStatusBadge(nota.status)}
                {getTipoBadge(nota.tipo_nota)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-gray-500">Filial:</span>
                <p className="font-medium">{getFilialName(nota.filial_id) || nota.filial_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Data Emissão:</span>
                <p className="font-medium">{formatDate(nota.data_emissao)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Valor Total:</span>
                <p className="font-medium text-lg">{formatCurrency(nota.valor_total)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t">
              <ActionButtons
                canView={!!onView}
                canEdit={true}
                canDelete={true}
                canPrint={!!onPrint}
                onView={onView}
                onEdit={null}
                onDelete={null}
                onPrint={onPrint}
                item={nota}
                size="xs"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotaFiscalTable;

