import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const FichaHomologacaoTable = ({
  fichasHomologacao,
  canView,
  canEdit,
  canDelete,
  canPrint,
  onView,
  onEdit,
  onDelete,
  onPrint,
  getStatusLabel,
  getStatusColor,
  getTipoLabel,
  getAvaliacaoLabel,
  getAvaliacaoColor,
  formatDate,
  sortField,
  sortDirection,
  onSort
}) => {
  if (!Array.isArray(fichasHomologacao) || fichasHomologacao.length === 0) {
    return (
      <EmptyState
        title="Nenhuma ficha de homologação encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova ficha de homologação"
        icon="ficha-homologacao"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableTableHeader
                  label="ID"
                  field="id"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Tipo"
                  field="tipo"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Data Análise"
                  field="data_analise"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Nome Genérico"
                  field="nome_generico_nome"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliador
                </th>
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fichasHomologacao.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ficha.id}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ficha.tipo === 'NOVO_PRODUTO' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {getTipoLabel ? getTipoLabel(ficha.tipo) : ficha.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate ? formatDate(ficha.data_analise) : (ficha.data_analise || '-')}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {ficha.nome_generico_nome || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ficha.marca_nome || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">
                      {ficha.fornecedor_nome || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ficha.avaliador_nome || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor ? `bg-${getStatusColor(ficha.status)}-100 text-${getStatusColor(ficha.status)}-800` : 
                      (ficha.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {getStatusLabel ? getStatusLabel(ficha.status) : ficha.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canPrint={canPrint}
                      onView={() => onView(ficha.id)}
                      onEdit={() => onEdit(ficha.id)}
                      onDelete={() => onDelete(ficha.id)}
                      onPrint={onPrint ? () => onPrint(ficha.id) : undefined}
                      item={ficha.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile */}
      <div className="xl:hidden space-y-4">
        {fichasHomologacao.map((ficha) => (
          <div key={ficha.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  #{ficha.id} - {ficha.nome_generico_nome || 'Sem nome genérico'}
                </h3>
                <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  ficha.tipo === 'NOVO_PRODUTO' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {getTipoLabel ? getTipoLabel(ficha.tipo) : ficha.tipo}
                </span>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                canPrint={canPrint}
                onView={() => onView(ficha.id)}
                onEdit={() => onEdit(ficha.id)}
                onDelete={() => onDelete(ficha.id)}
                onPrint={onPrint ? () => onPrint(ficha.id) : undefined}
                item={ficha.id}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
              <div>
                <span className="font-medium">Data:</span> {formatDate ? formatDate(ficha.data_analise) : (ficha.data_analise || '-')}
              </div>
              <div>
                <span className="font-medium">Marca:</span> {ficha.marca_nome || '-'}
              </div>
              <div>
                <span className="font-medium">Fornecedor:</span> {ficha.fornecedor_nome || '-'}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                  getStatusColor ? `bg-${getStatusColor(ficha.status)}-100 text-${getStatusColor(ficha.status)}-800` : 
                  (ficha.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')
                }`}>
                  {getStatusLabel ? getStatusLabel(ficha.status) : ficha.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FichaHomologacaoTable;

