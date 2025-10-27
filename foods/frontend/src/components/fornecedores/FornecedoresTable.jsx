import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';
import { usePermissions } from '../../contexts/PermissionsContext';

const FornecedoresTable = ({ 
  fornecedores, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  canView,
  canEdit,
  canDelete,
  sortField,
  sortDirection,
  onSort
}) => {
  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

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

  if (fornecedores.length === 0) {
    return (
      <EmptyState
        title="Nenhum fornecedor encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo fornecedor"
        icon="fornecedores"
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
                  label="CNPJ"
                  field="cnpj"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Razão Social"
                  field="razao_social"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Município/UF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fornecedor.cnpj}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {fornecedor.razao_social}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {fornecedor.municipio && fornecedor.uf ? `${fornecedor.municipio}/${fornecedor.uf}` : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {fornecedor.email && <div>{fornecedor.email}</div>}
                      {fornecedor.telefone && <div>{fornecedor.telefone}</div>}
                      {!fornecedor.email && !fornecedor.telefone && '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      fornecedor.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(fornecedor.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={fornecedor}
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
        {fornecedores.map((fornecedor) => (
          <div key={fornecedor.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{fornecedor.razao_social}</h3>
                <p className="text-gray-600 text-xs">CNPJ: {fornecedor.cnpj}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={fornecedor}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Município/UF:</span>
                <p className="font-medium">{fornecedor.municipio && fornecedor.uf ? `${fornecedor.municipio}/${fornecedor.uf}` : 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{fornecedor.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Telefone:</span>
                <p className="font-medium">{fornecedor.telefone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  fornecedor.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(fornecedor.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FornecedoresTable;
