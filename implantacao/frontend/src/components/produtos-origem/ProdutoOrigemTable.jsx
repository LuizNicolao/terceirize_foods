import React from 'react';
import { FaBox } from 'react-icons/fa';
import { ActionButtons, EmptyState } from '../ui';

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
  // Debug logs removidos
  
  if (!produtosOrigem || produtosOrigem.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto origem encontrado"
        description="Não há produtos origem cadastrados ou os filtros aplicados não retornaram resultados"
        icon="produto-origem"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  Produto Genérico Padrão
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
                    {produto.produto_generico_padrao_nome ? 
                      `${produto.produto_generico_padrao_codigo} - ${produto.produto_generico_padrao_nome}` : 
                      '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.fator_conversao ? parseFloat(produto.fator_conversao).toFixed(3) : '1.000'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.peso_liquido ? `${parseFloat(produto.peso_liquido).toFixed(3)} kg` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                      produto.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        item={produto.id}
                        size="xs"
                      />
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
        {produtosOrigem.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{produto.nome}</h3>
                <p className="text-gray-600 text-xs">
                  Código: {produto.codigo || '-'}
                </p>
                {produto.referencia_mercado && (
                  <p className="text-gray-500 text-xs">Ref: {produto.referencia_mercado}</p>
                )}
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={produto.id}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Unidade:</span>
                <p className="font-medium">{getUnidadeMedidaName(produto.unidade_medida_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Grupo:</span>
                <p className="font-medium">{getGrupoName(produto.grupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Subgrupo:</span>
                <p className="font-medium">{getSubgrupoName(produto.subgrupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Classe:</span>
                <p className="font-medium">{getClasseName(produto.classe_id)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Produto Genérico Padrão:</span>
                <p className="font-medium">
                  {produto.produto_generico_padrao_nome ? 
                    `${produto.produto_generico_padrao_codigo} - ${produto.produto_generico_padrao_nome}` : 
                    '-'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fator Conversão:</span>
                <p className="font-medium">{produto.fator_conversao ? parseFloat(produto.fator_conversao).toFixed(3) : '1.000'}</p>
              </div>
              <div>
                <span className="text-gray-500">Peso Líquido:</span>
                <p className="font-medium">{produto.peso_liquido ? `${parseFloat(produto.peso_liquido).toFixed(3)} kg` : '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${
                  produto.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.status === 1 ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProdutoOrigemTable;
