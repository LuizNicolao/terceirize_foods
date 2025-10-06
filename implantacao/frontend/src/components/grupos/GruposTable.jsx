import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const GruposTable = ({ 
  grupos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusLabel,
  formatDate,
  loading
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

  if (!grupos || grupos.length === 0) {
    return (
      <EmptyState
        title="Nenhum grupo encontrado"
        description="Não há grupos cadastrados no sistema Foods"
        icon="grupos"
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
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subgrupos
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
              {grupos.map((grupo) => (
                <tr key={grupo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {grupo.codigo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grupo.nome}
                    </div>
                    {grupo.descricao && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {grupo.descricao}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grupo.subgrupos_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                      grupo.status === 'ativo' || grupo.status === 1
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {grupo.status === 'ativo' || grupo.status === 1 ? 'Ativo' : 'Inativo'}
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
                      item={grupo}
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
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{grupo.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {grupo.id}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={grupo}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{grupo.codigo || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Subgrupos:</span>
                <p className="font-medium">{grupo.subgrupos_count || 0}</p>
              </div>
            </div>
            
            {grupo.descricao && (
              <div className="mt-3 text-xs">
                <span className="text-gray-500">Descrição:</span>
                <p className="text-gray-700 mt-1">{grupo.descricao}</p>
              </div>
            )}
            
            <div className="mt-3">
              <span className="text-gray-500 text-xs">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${
                grupo.status === 'ativo' || grupo.status === 1
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {grupo.status === 'ativo' || grupo.status === 1 ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GruposTable;
