import React from 'react';
import { EmptyState } from '../ui';

const EfetivosGroupedTable = ({
  efetivos,
  canView,
  onView,
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

  // Agrupar efetivos por tipo + intolerância, somando quantidades e concatenando períodos
  const groupedEfetivos = efetivos.reduce((acc, efetivo) => {
    const key = `${efetivo.tipo_efetivo}-${efetivo.intolerancia_id || 'null'}`;
    
    if (!acc[key]) {
      acc[key] = {
        tipo_efetivo: efetivo.tipo_efetivo,
        quantidade: 0,
        intolerancia_id: efetivo.intolerancia_id,
        intolerancia_nome: efetivo.intolerancia_nome,
        periodos: new Set(),
        ids: []
      };
    }
    
    acc[key].quantidade += parseInt(efetivo.quantidade) || 0;
    acc[key].periodos.add(efetivo.periodo_refeicao_nome || 'Sem período');
    acc[key].ids.push(efetivo.id);
    
    return acc;
  }, {});

  if (!efetivos || efetivos.length === 0) {
    return <EmptyState message="Nenhum efetivo encontrado" />;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Tabela Agrupada */}
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
                Períodos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.values(groupedEfetivos).map((grupo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTipoEfetivoBadge(grupo.tipo_efetivo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {grupo.quantidade}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {grupo.intolerancia_nome || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {Array.from(grupo.periodos).join(', ')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EfetivosGroupedTable;
