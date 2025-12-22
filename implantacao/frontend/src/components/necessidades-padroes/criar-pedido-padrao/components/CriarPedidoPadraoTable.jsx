import React from 'react';
import { FaSchool } from 'react-icons/fa';
import { ActionButtons } from '../../../ui';

/**
 * Componente de tabela que exibe necessidades padrão agrupadas por escola
 * Mostra apenas resumo - produtos aparecem apenas no modal ao clicar em Visualizar/Editar
 */
const CriarPedidoPadraoTable = ({ 
  necessidadesAgrupadas, 
  onView,
  onEdit,
  onDelete,
  loading = false,
  canView = true,
  canEdit = true,
  canDelete = true
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando necessidades padrão...</p>
        </div>
      </div>
    );
  }

  if (!necessidadesAgrupadas || necessidadesAgrupadas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <FaSchool className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma necessidade padrão encontrada
        </h3>
        <p className="text-gray-600">
          Crie uma necessidade padrão para começar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo de Produtos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade de Produtos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {necessidadesAgrupadas.map((grupo) => (
              <tr key={`${grupo.escola_id}-${grupo.grupo_id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaSchool className="text-green-600 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      {grupo.escola_nome || `Escola ${grupo.escola_id}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {grupo.grupo_nome || `Grupo ${grupo.grupo_id}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {grupo.produtos.length} produto(s)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ActionButtons
                    canView={canView}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={() => onView && onView(grupo)}
                    onEdit={() => onEdit && onEdit(grupo)}
                    onDelete={() => onDelete && onDelete(grupo)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CriarPedidoPadraoTable;

