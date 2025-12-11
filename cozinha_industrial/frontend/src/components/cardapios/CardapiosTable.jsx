import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import ActionButtons from '../ui/ActionButtons';

/**
 * Componente de Tabela de Cardápios
 */
const CardapiosTable = ({
  cardapios = [],
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="text-gray-400" />;
    }
    return sortDirection === 'ASC' ? (
      <FaSortUp className="text-green-600" />
    ) : (
      <FaSortDown className="text-green-600" />
    );
  };

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-2">
                  Nome
                  {getSortIcon('nome')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('mes_referencia')}
              >
                <div className="flex items-center gap-2">
                  Mês/Ano
                  {getSortIcon('mes_referencia')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semanas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vínculos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pratos
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cardapios.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Nenhum cardápio encontrado
                </td>
              </tr>
            ) : (
              cardapios.map((cardapio) => (
                <tr key={cardapio.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cardapio.nome}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {meses[cardapio.mes_referencia] || cardapio.mes_referencia}/{cardapio.ano_referencia}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cardapio.numero_semanas || 4}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {cardapio.total_contratos || 0} contrato(s)
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {cardapio.total_pratos || 0} prato(s)
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cardapio.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cardapio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <ActionButtons
                        item={cardapio}
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardapiosTable;

