import React from 'react';
import { FaEye, FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import { Button } from '../ui';

const ProdutoOrigemTable = ({
  produtosOrigem,
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  getGrupoName,
  getSubgrupoName,
  getClasseName,
  getUnidadeMedidaName,
  getProdutoGenericoPadraoName
}) => {
  if (!produtosOrigem || produtosOrigem.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto origem encontrado</h3>
        <p className="text-gray-500">Não há produtos origem cadastrados ou os filtros aplicados não retornaram resultados.</p>
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
                Unidade
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
                Fator Conversão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso Líquido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtosOrigem.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {produto.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{produto.nome}</div>
                    {produto.referencia_mercado && (
                      <div className="text-xs text-gray-500">
                        Ref: {produto.referencia_mercado}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getUnidadeMedidaName(produto.unidade_medida_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getGrupoName(produto.grupo_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getSubgrupoName(produto.subgrupo_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getClasseName(produto.classe_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {produto.fator_conversao ? parseFloat(produto.fator_conversao).toFixed(3) : '1.000'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {produto.peso_liquido ? `${parseFloat(produto.peso_liquido).toFixed(3)} kg` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    produto.status === 1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {produto.status === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {canView && (
                      <Button
                        onClick={() => onView(produto.id)}
                        variant="ghost"
                        size="xs"
                        title="Visualizar"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        onClick={() => onEdit(produto.id)}
                        variant="ghost"
                        size="xs"
                        title="Editar"
                      >
                        <FaEdit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        onClick={() => onDelete(produto.id)}
                        variant="ghost"
                        size="xs"
                        title="Excluir"
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
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

export default ProdutoOrigemTable;
