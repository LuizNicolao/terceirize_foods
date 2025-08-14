import React from 'react';
import { FaEye, FaEdit, FaTrash, FaStar, FaExchangeAlt } from 'react-icons/fa';
import { Button } from '../../components/ui';

const ProdutosGenericosTable = ({
  produtosGenericos,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getStatusLabel,
  getStatusColor,
  formatDate,
  getGrupoName,
  getSubgrupoName,
  getClasseName,
  getProdutoOrigemName,
  getUnidadeMedidaName
}) => {
  if (!Array.isArray(produtosGenericos) || produtosGenericos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Nenhum produto genérico encontrado</p>
        <p className="text-gray-400 text-sm mt-2">
          Tente ajustar os filtros de busca ou adicionar um novo produto genérico
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
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subgrupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Padrão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos Vinculados
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtosGenericos.map((produtoGenerico) => (
              <tr key={produtoGenerico.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {produtoGenerico.codigo || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {produtoGenerico.nome || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getGrupoName ? getGrupoName(produtoGenerico.grupo_id) : (produtoGenerico.grupo_nome || '-')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getSubgrupoName ? getSubgrupoName(produtoGenerico.subgrupo_id) : (produtoGenerico.subgrupo_nome || '-')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getClasseName ? getClasseName(produtoGenerico.classe_id) : (produtoGenerico.classe_nome || '-')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produtoGenerico.produto_padrao === 'Sim' ? (
                    <FaStar className="w-4 h-4 text-yellow-500" title="Produto Padrão" />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produtoGenerico.produto_origem_id ? (
                    <div className="flex items-center">
                      <FaExchangeAlt className="w-3 h-3 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">
                        {getProdutoOrigemName ? getProdutoOrigemName(produtoGenerico.produto_origem_id) : (produtoGenerico.produto_origem_nome || '-')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor ? getStatusColor(produtoGenerico.status) : 'bg-gray-100 text-gray-800'}`}>
                    {getStatusLabel ? getStatusLabel(produtoGenerico.status) : (produtoGenerico.status === 1 ? 'Ativo' : 'Inativo')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {produtoGenerico.total_produtos || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {canView && onView && (
                      <Button
                        onClick={() => onView(produtoGenerico.id)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canEdit && onEdit && (
                      <Button
                        onClick={() => onEdit(produtoGenerico.id)}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canDelete && onDelete && (
                      <Button
                        onClick={() => onDelete(produtoGenerico.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    )}
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

export default ProdutosGenericosTable;
