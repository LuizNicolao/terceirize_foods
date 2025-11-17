import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Modal, Button, Input, Pagination } from '../../ui';
import toast from 'react-hot-toast';

const ModalProdutoExtra = ({
  isOpen,
  onClose,
  produtosDisponiveis,
  produtosSelecionados,
  onToggleProduto,
  onSelecionarTodos,
  onDesmarcarTodos,
  onIncluirProdutos,
  searchProduto,
  onSearchChange,
  grupoSelecionado,
  gruposDisponiveis = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [quantidades, setQuantidades] = useState({});

  // Reset página quando modal abrir ou produtos mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [isOpen, produtosDisponiveis]);

  const handleClose = () => {
    setCurrentPage(1);
    setQuantidades({});
    onClose();
  };

  const handleQuantidadeChange = (produto_id, valor) => {
    setQuantidades(prev => ({
      ...prev,
      [produto_id]: valor
    }));
  };

  const handleIncluirProdutos = () => {
    if (!grupoSelecionado || grupoSelecionado === 'todos' || grupoSelecionado === '') {
      toast.error('Selecione um grupo nos filtros principais antes de incluir produtos extras.');
      return;
    }

    // Validar se todos os produtos selecionados têm quantidade > 0
    const produtosSemQuantidade = produtosSelecionados.filter(p => {
      const qtd = quantidades[p.produto_id];
      return !qtd || qtd === '' || parseFloat(qtd) === 0;
    });

    if (produtosSemQuantidade.length > 0) {
      const nomes = produtosSemQuantidade.map(p => p.produto_nome).join(', ');
      toast.error(`Produtos devem ter quantidade maior que zero: ${nomes}`);
      return;
    }

    // Incluir quantidades nos produtos selecionados
    const produtosComQuantidade = produtosSelecionados.map(p => ({
      ...p,
      quantidade: parseFloat(quantidades[p.produto_id]) || 0
    }));

    onIncluirProdutos(produtosComQuantidade);
    setQuantidades({});
  };

  // Calcular produtos da página atual
  const totalPages = Math.ceil(produtosDisponiveis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const produtosDaPagina = produtosDisponiveis.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Incluir Produtos Extra"
      size="xl"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Produto
          </label>
          <Input
            type="text"
            value={searchProduto}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Digite o nome ou código do produto..."
          />
        </div>

        {/* Controles de seleção */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {produtosSelecionados.length} produto(s) selecionado(s)
          </div>
          <div className="space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSelecionarTodos}
              disabled={produtosDisponiveis.length === 0}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDesmarcarTodos}
              disabled={produtosSelecionados.length === 0}
            >
              Desmarcar Todos
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selecionar</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtosDaPagina.map((produto) => {
                const isSelected = produtosSelecionados.find(p => p.produto_id === produto.produto_id);
                return (
                  <tr 
                    key={produto.produto_id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : 'bg-white'
                    }`}
                    onClick={() => onToggleProduto(produto)}
                  >
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => onToggleProduto(produto)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-900 font-medium' : 'text-gray-900'}`}>
                      {produto.produto_codigo || 'N/A'}
                    </td>
                    <td className={`px-4 py-2 text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                      {produto.produto_nome}
                    </td>
                    <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                      {produto.unidade_medida}
                    </td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={quantidades[produto.produto_id] || ''}
                        onChange={(e) => handleQuantidadeChange(produto.produto_id, e.target.value)}
                        disabled={!isSelected}
                        className="w-24 text-sm"
                        placeholder="0.000"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={produtosDisponiveis.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleIncluirProdutos}
            disabled={produtosSelecionados.length === 0}
            icon={<FaPlus />}
          >
            Incluir {produtosSelecionados.length} Produto(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalProdutoExtra;
