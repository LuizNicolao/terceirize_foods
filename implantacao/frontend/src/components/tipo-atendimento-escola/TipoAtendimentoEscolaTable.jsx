import React from 'react';
import { EmptyState, ActionButtons } from '../ui';

const TipoAtendimentoEscolaTable = ({ 
  vinculos, 
  loading, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  formatarTipoAtendimento
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

  if (!vinculos || vinculos.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <EmptyState
          title="Nenhum vínculo encontrado"
          description="Tente ajustar os filtros de busca ou adicionar um novo vínculo"
          icon="escola"
        />
      </div>
    );
  }

  const getStatusBadge = (ativo) => {
    const statusConfig = {
      1: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      0: { label: 'Inativo', className: 'bg-red-100 text-red-800' },
      true: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      false: { label: 'Inativo', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[ativo] || { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Atendimento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vinculos.map((vinculo) => (
                <tr key={vinculo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vinculo.nome_escola || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {vinculo.rota || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {vinculo.cidade || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatarTipoAtendimento(vinculo.tipo_atendimento)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(vinculo.ativo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView(vinculo)}
                      onEdit={() => onEdit(vinculo)}
                      onDelete={() => onDelete(vinculo)}
                      item={vinculo}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile/Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {vinculos.map((vinculo) => (
          <div key={vinculo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {vinculo.nome_escola || '-'}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {vinculo.rota ? `Rota: ${vinculo.rota}` : ''}
                </p>
                <p className="text-xs text-gray-500">
                  {vinculo.cidade || '-'}
                </p>
              </div>
              <div className="ml-4">
                {getStatusBadge(vinculo.ativo)}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-xs text-gray-500">Tipo de Atendimento:</span>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatarTipoAtendimento(vinculo.tipo_atendimento)}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={() => onView(vinculo)}
                onEdit={() => onEdit(vinculo)}
                onDelete={() => onDelete(vinculo)}
                item={vinculo}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TipoAtendimentoEscolaTable;

