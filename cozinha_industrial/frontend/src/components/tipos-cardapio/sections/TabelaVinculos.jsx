import React from 'react';

/**
 * Seção de Tabela Matriz de Vínculos
 * Unidades nas linhas, Produtos Comerciais nas colunas
 */
const TabelaVinculos = ({
  produtos,
  unidades,
  loadingUnidades,
  filialId,
  vinculosSelecionados,
  isViewMode,
  loading,
  onProdutoToggle,
  onMarcarTodos,
  onDesmarcarTodos
}) => {
  const isProdutoSelecionado = (unidadeId, produtoId) => {
    const unidadeIdStr = String(unidadeId);
    return vinculosSelecionados[unidadeIdStr]?.includes(produtoId) || false;
  };

  return (
    <div className="space-y-4">
      {/* Botões de seleção em massa */}
      {!isViewMode && unidades.length > 0 && produtos.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onMarcarTodos}
            disabled={loading || loadingUnidades}
            className="px-4 py-2 text-sm font-medium text-green-600 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Marcar Todos
          </button>
          <button
            type="button"
            onClick={onDesmarcarTodos}
            disabled={loading || loadingUnidades}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border-2 border-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Desmarcar Todos
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Unidade Escolar
              </th>
              {produtos.map(produto => {
                const produtoId = produto.produto_comercial_id;
                return (
                  <th
                    key={produtoId}
                    className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]"
                    title={produto.nome}
                  >
                    <div className="truncate">
                      {produto.codigo ? `${produto.codigo} - ` : ''}
                      {produto.nome || `Produto ${produtoId}`}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingUnidades ? (
              <tr>
                <td colSpan={produtos.length + 1} className="px-3 py-6 text-center text-gray-500">
                  Carregando unidades...
                </td>
              </tr>
            ) : unidades.length === 0 ? (
              <tr>
                <td colSpan={produtos.length + 1} className="px-3 py-6 text-center text-gray-500">
                  {filialId ? 'Nenhuma unidade encontrada' : 'Selecione uma filial para ver as unidades'}
                </td>
              </tr>
            ) : (
              unidades.map(unidade => (
                <tr key={unidade.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900 sticky left-0 bg-white z-10">
                    <div className="font-medium">{unidade.nome_escola || unidade.nome}</div>
                    <div className="text-xs text-gray-500">ID: {unidade.id}</div>
                  </td>
                  {produtos.map(produto => {
                    const produtoId = produto.produto_comercial_id;
                    const isSelecionado = isProdutoSelecionado(unidade.id, produtoId);
                    return (
                      <td key={produtoId} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelecionado}
                          onChange={() => onProdutoToggle(unidade.id, produtoId)}
                          disabled={isViewMode || loading}
                          className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaVinculos;

