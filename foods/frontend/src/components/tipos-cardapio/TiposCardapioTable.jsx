import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const TiposCardapioTable = ({ 
  tipos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  getStatusLabel,
  formatDate
}) => {
  if (tipos.length === 0) {
    return (
      <EmptyState
        title="Nenhum tipo de cardápio encontrado"
        description="Não há tipos de cardápio cadastrados ou que correspondam aos filtros aplicados."
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
                  Descrição
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
            {tipos.map((tipo) => (
              <tr key={tipo.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {tipo.codigo || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {tipo.nome}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {tipo.descricao || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    tipo.status === 'ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(tipo.status)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    canView={canView('tipos_cardapio')}
                    canEdit={canEdit('tipos_cardapio')}
                    canDelete={canDelete('tipos_cardapio')}
                    onView={() => onView(tipo)}
                    onEdit={() => onEdit(tipo)}
                    onDelete={() => onDelete(tipo)}
                    item={tipo}
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
        {tipos.map((tipo) => (
          <div key={tipo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{tipo.nome}</h3>
                {tipo.codigo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border mt-1">
                    {tipo.codigo}
                  </span>
                )}
              </div>
              <ActionButtons
                canView={canView('tipos_cardapio')}
                canEdit={canEdit('tipos_cardapio')}
                canDelete={canDelete('tipos_cardapio')}
                onView={() => onView(tipo)}
                onEdit={() => onEdit(tipo)}
                onDelete={() => onDelete(tipo)}
                item={tipo}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-xs">
              {tipo.descricao && (
                <div>
                  <span className="text-gray-500">Descrição:</span>
                  <p className="font-medium">{tipo.descricao}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  tipo.status === 'ativo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusLabel(tipo.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TiposCardapioTable;
