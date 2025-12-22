/**
 * Componente da aba de Listagem de Necessidades
 * Exibe a tabela de necessidades agrupadas
 */

import React from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { ActionButtons, Pagination } from '../../../components/ui';
import { StatusBadge } from '../../../components/necessidades';

const NecessidadesListagemTab = ({
  necessidades = [],
  loading = false,
  pagination = null,
  onView = () => {}
}) => {
  // Agrupar necessidades por necessidade_id (se disponível) ou por escola, data e grupo
  const agrupadas = necessidades.reduce((acc, necessidade) => {
    // Se tem necessidade_id, usar ele. Senão, usar escola-data-grupo para diferenciar grupos
    const chave = necessidade.necessidade_id || `${necessidade.escola}-${necessidade.semana_consumo}-${necessidade.grupo || 'sem-grupo'}`;
    if (!acc[chave]) {
      acc[chave] = {
        necessidade_id: necessidade.necessidade_id,
        escola: necessidade.escola,
        rota: necessidade.escola_rota,
        grupo: necessidade.grupo,
        data_consumo: necessidade.semana_consumo,
        data_abastecimento: necessidade.semana_abastecimento,
        data_preenchimento: necessidade.data_preenchimento,
        status: necessidade.status,
        produtos: []
      };
    }
    acc[chave].produtos.push(necessidade);
    return acc;
  }, {});

  const gruposArray = Object.values(agrupadas);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <span className="text-gray-600">Carregando necessidades...</span>
      </div>
    );
  }

  if (gruposArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma necessidade encontrada
        </h3>
        <p className="text-gray-600">
          Gere uma nova necessidade usando o botão acima.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Tabela de Necessidades Agrupadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semana Consumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semana Abastecimento
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
              {gruposArray.map((grupo, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grupo.necessidade_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grupo.escola || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grupo.rota || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {grupo.grupo ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {grupo.grupo}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {grupo.produtos.length} produtos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grupo.data_consumo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grupo.data_abastecimento || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={grupo.status || grupo.produtos[0]?.status || 'NEC'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={true}
                      onView={() => onView(grupo)}
                      item={grupo}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {pagination && pagination.totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.handlePageChange}
            onItemsPerPageChange={pagination.handleItemsPerPageChange}
          />
        </div>
      )}
    </>
  );
};

export default NecessidadesListagemTab;
