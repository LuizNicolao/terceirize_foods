import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const EfetivosTable = ({
  efetivos,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  formatDate,
  viewMode = false
}) => {
  const getTipoEfetivoBadge = (tipo) => {
    const tipoConfig = {
      'PADRAO': { label: 'Padrão', className: 'bg-blue-100 text-blue-800' },
      'NAE': { label: 'NAE', className: 'bg-orange-100 text-orange-800' }
    };

    const config = tipoConfig[tipo] || { label: tipo, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!efetivos || efetivos.length === 0) {
    return <EmptyState message="Nenhum efetivo encontrado" />;
  }

  return (
    <>
      {/* Versão Desktop - Tabela */}
      <div className="hidden xl:block bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intolerância
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {efetivos.map((efetivo) => (
                <tr key={efetivo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTipoEfetivoBadge(efetivo.tipo_efetivo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {efetivo.quantidade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {efetivo.intolerancia_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {efetivo.periodo_refeicao_nome || '-'}
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
        {efetivos.map((efetivo) => (
          <div key={efetivo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">
                {getTipoEfetivoBadge(efetivo.tipo_efetivo)}
              </h3>
              <p className="text-xs text-gray-500">
                Quantidade: {efetivo.quantidade}
              </p>
            </div>
            
            <div className="text-xs">
              <div className="mb-2">
                <span className="text-gray-500">Intolerância:</span>
                <p className="font-medium">{efetivo.intolerancia_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Período:</span>
                <p className="font-medium">{efetivo.periodo_refeicao_nome || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default EfetivosTable;
