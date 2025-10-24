import React from 'react';
import { FaTimes, FaCheck, FaSearch } from 'react-icons/fa';
import { Modal, Button, Input } from '../../ui';

const AjusteNecessidadesModal = ({
  isOpen,
  onClose,
  produtosDisponiveis,
  produtosSelecionados,
  searchProduto,
  loadingProdutos,
  onSearchChange,
  onToggleProduto,
  onSelecionarTodos,
  onDesmarcarTodos,
  onIncluirProdutos,
  onSearchProduto
}) => {
  const handleSearch = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    onSearchProduto(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Incluir Produto Extra"
      size="xl"
    >
      <div className="space-y-4">
        {/* Busca de Produtos */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar produto por nome ou código..."
              value={searchProduto}
              onChange={handleSearch}
              icon={<FaSearch />}
            />
          </div>
        </div>

        {/* Controles de Seleção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelecionarTodos}
              disabled={loadingProdutos}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDesmarcarTodos}
              disabled={loadingProdutos}
            >
              Desmarcar Todos
            </Button>
            <span className="text-sm text-gray-500">
              {produtosSelecionados.length} selecionados
            </span>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {loadingProdutos ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando produtos...</p>
            </div>
          ) : produtosDisponiveis.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Selecionar
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosDisponiveis.map((produto) => {
                  const isSelected = produtosSelecionados.some(p => p.produto_id === produto.produto_id);
                  
                  return (
                    <tr
                      key={produto.produto_id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-green-50 border-l-4 border-green-500 text-green-900' : ''
                      }`}
                      onClick={() => onToggleProduto(produto)}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleProduto(produto)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-900">
                        {produto.produto_codigo || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-xs font-medium text-gray-900">
                        {produto.produto_nome}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {produto.unidade_medida}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<FaTimes />}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onIncluirProdutos}
            disabled={produtosSelecionados.length === 0}
            icon={<FaCheck />}
          >
            Incluir {produtosSelecionados.length} Produto{produtosSelecionados.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AjusteNecessidadesModal;
