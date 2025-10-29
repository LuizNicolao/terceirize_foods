import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';
import toast from 'react-hot-toast';

const AdicionarProdutoModal = ({ 
  isOpen, 
  onClose, 
  onAdicionarProdutos, 
  grupoId,
  produtosJaAdicionados = [] 
}) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState({});
  const [filtrados, setFiltrados] = useState([]);

  // Carregar produtos do grupo quando modal abrir
  useEffect(() => {
    if (isOpen && grupoId) {
      carregarProdutos();
    }
  }, [isOpen, grupoId]);

  // Filtrar produtos quando searchTerm mudar
  useEffect(() => {
    if (searchTerm) {
      const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFiltrados(filtrados);
    } else {
      setFiltrados(produtos);
    }
  }, [searchTerm, produtos]);

  const carregarProdutos = async () => {
    if (!grupoId) return;
    
    setLoading(true);
    try {
      const response = await FoodsApiService.getProdutos({ grupo_id: grupoId });
      
      if (response.success) {
        // Filtrar produtos que já foram adicionados
        const produtosDisponiveis = response.data.filter(produto => 
          !produtosJaAdicionados.some(adicionado => adicionado.produto_id === produto.id)
        );
        setProdutos(produtosDisponiveis);
        setFiltrados(produtosDisponiveis);
      } else {
        toast.error('Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarProduto = (produtoId, selecionado) => {
    setProdutosSelecionados(prev => ({
      ...prev,
      [produtoId]: selecionado
    }));
  };

  const handleSelecionarTodos = () => {
    const todosSelecionados = filtrados.reduce((acc, produto) => {
      acc[produto.id] = true;
      return acc;
    }, {});
    setProdutosSelecionados(todosSelecionados);
  };

  const handleDesmarcarTodos = () => {
    setProdutosSelecionados({});
  };

  const handleAdicionar = () => {
    const produtosParaAdicionar = filtrados.filter(produto => 
      produtosSelecionados[produto.id]
    );

    if (produtosParaAdicionar.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    // Formatar produtos para o formato esperado
    const produtosFormatados = produtosParaAdicionar.map(produto => ({
      id: `temp_${Date.now()}_${produto.id}`,
      produto_id: produto.id,
      produto_nome: produto.nome,
      produto_codigo: produto.codigo,
      unidade_medida: produto.unidade_medida,
      quantidade: 0
    }));

    onAdicionarProdutos(produtosFormatados);
    setProdutosSelecionados({});
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setProdutosSelecionados({});
    onClose();
  };

  const produtosSelecionadosCount = Object.values(produtosSelecionados).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar Produtos"
      size="4xl"
    >
      <div className="space-y-4">
        {/* Barra de busca */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar produtos por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controles de seleção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelecionarTodos}
              disabled={loading || filtrados.length === 0}
            >
              <FaPlus className="w-4 h-4 mr-1" />
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDesmarcarTodos}
              disabled={loading}
            >
              <FaTimes className="w-4 h-4 mr-1" />
              Desmarcar Todos
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {produtosSelecionadosCount} de {filtrados.length} selecionados
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando produtos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filtrados.map((produto) => (
                <div key={produto.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={!!produtosSelecionados[produto.id]}
                      onChange={(e) => handleSelecionarProduto(produto.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {produto.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {produto.codigo} • Unidade: {produto.unidade_medida}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdicionar}
            disabled={produtosSelecionadosCount === 0}
          >
            Adicionar {produtosSelecionadosCount > 0 && `(${produtosSelecionadosCount})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdicionarProdutoModal;
