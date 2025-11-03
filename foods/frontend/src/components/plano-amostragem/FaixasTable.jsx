import React from 'react';
import { ActionButtons } from '../ui';

const FaixasTable = ({ 
  faixas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  if (!faixas || faixas.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Nenhuma faixa de amostragem cadastrada
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Faixa de Lote
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amostra
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AC
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RE
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {faixas.map((faixa) => (
            <tr key={faixa.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                {faixa.faixa_inicial} até {faixa.faixa_final}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                {faixa.tamanho_amostra}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                {faixa.ac}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                {faixa.re}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                <ActionButtons
                  canView={canView('plano_amostragem')}
                  canEdit={canEdit('plano_amostragem')}
                  canDelete={canDelete('plano_amostragem')}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  item={faixa}
                  size="xs"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FaixasTable;

