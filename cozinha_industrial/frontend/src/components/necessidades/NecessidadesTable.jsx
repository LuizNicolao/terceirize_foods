import React from 'react';
import { FaSort, FaSortUp, FaSortDown, FaRedo, FaTrash, FaEye } from 'react-icons/fa';
import { Button } from '../ui';

/**
 * Componente de Tabela de Necessidades
 */
const NecessidadesTable = ({
  necessidades = [],
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onView,
  onRecalcular,
  onDelete,
  canView = true,
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
                onClick={() => handleSort('codigo')}
              >
                <div className="flex items-center gap-2">
                  Necessidade
                  {getSortIcon('codigo')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('filial_nome')}
              >
                <div className="flex items-center gap-2">
                  Filial
                  {getSortIcon('filial_nome')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('centro_custo_nome')}
              >
                <div className="flex items-center gap-2">
                  Centro de Custo
                  {getSortIcon('centro_custo_nome')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cardapio_nome')}
              >
                <div className="flex items-center gap-2">
                  Cardápio
                  {getSortIcon('cardapio_nome')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_cozinhas')}
              >
                <div className="flex items-center gap-2">
                  Total de Cozinhas
                  {getSortIcon('total_cozinhas')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mês/Ano
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {necessidades.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Nenhuma necessidade encontrada
                </td>
              </tr>
            ) : (
              necessidades.map((necessidade) => (
                <tr key={necessidade.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{necessidade.codigo}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{necessidade.filial_nome}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{necessidade.centro_custo_nome}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{necessidade.cardapio_nome}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">{necessidade.total_cozinhas || 0}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {meses[necessidade.mes_ref] || necessidade.mes_ref}/{necessidade.ano}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView && onView(necessidade)}
                          title="Visualizar"
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        >
                          <FaEye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRecalcular && onRecalcular(necessidade)}
                        title="Recalcular"
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                      >
                        <FaRedo className="w-3 h-3" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete && onDelete(necessidade)}
                          title="Excluir"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      )}
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

export default NecessidadesTable;
