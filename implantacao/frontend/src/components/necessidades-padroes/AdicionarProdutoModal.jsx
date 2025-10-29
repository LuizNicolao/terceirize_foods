import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { FaPlus } from 'react-icons/fa';
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
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
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
      const response = await FoodsApiService.getProdutosOrigem({ grupo_id: grupoId });
      
      if (response.success && response.data) {
        // A resposta pode ter data direto ou data.data
        const produtosData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data;
        
        if (Array.isArray(produtosData)) {
          // Filtrar produtos que já foram adicionados
          const produtosDisponiveis = produtosData.filter(produto => 
            !produtosJaAdicionados.some(adicionado => adicionado.produto_id === produto.id)
          );
          setProdutos(produtosDisponiveis);
          setFiltrados(produtosDisponiveis);
        } else {
          console.warn('Dados de produtos não são um array:', produtosData);
          setProdutos([]);
          setFiltrados([]);
        }
      } else {
        console.warn('Resposta de produtos inválida:', response);
        toast.error('Erro ao carregar produtos');
        setProdutos([]);
        setFiltrados([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduto = (produto) => {
    const isSelected = produtosSelecionados.find(p => p.produto_id === produto.id);
    if (isSelected) {
      setProdutosSelecionados(prev => prev.filter(p => p.produto_id !== produto.id));
    } else {
      setProdutosSelecionados(prev => [...prev, {
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo: produto.codigo,
        unidade_medida: produto.unidade_medida
      }]);
    }
  };

  const handleSelecionarTodos = () => {
    const todosSelecionados = filtrados.map(produto => ({
      produto_id: produto.id,
      produto_nome: produto.nome,
      produto_codigo: produto.codigo,
      unidade_medida: produto.unidade_medida
    }));
    setProdutosSelecionados(todosSelecionados);
  };

  const handleDesmarcarTodos = () => {
    setProdutosSelecionados([]);
  };

  const handleAdicionar = () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    // Formatar produtos para o formato esperado
    const produtosFormatados = produtosSelecionados.map(produto => ({
      id: `temp_${Date.now()}_${produto.produto_id}`,
      produto_id: produto.produto_id,
      produto_nome: produto.produto_nome,
      produto_codigo: produto.produto_codigo,
      unidade_medida: produto.unidade_medida,
      quantidade: 0
    }));

    onAdicionarProdutos(produtosFormatados);
    setProdutosSelecionados([]);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setProdutosSelecionados([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Incluir Produtos"
      size="xl"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Produto
          </label>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={handleSelecionarTodos}
              disabled={loading || filtrados.length === 0}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDesmarcarTodos}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando produtos...</p>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                  </td>
                </tr>
              ) : (
                filtrados.map((produto) => {
                  const isSelected = produtosSelecionados.find(p => p.produto_id === produto.id);
                  return (
                    <tr 
                      key={produto.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-green-50 border-l-4 border-green-500' 
                          : 'bg-white'
                      }`}
                      onClick={() => handleToggleProduto(produto)}
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleToggleProduto(produto)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-900 font-medium' : 'text-gray-900'}`}>
                        {produto.codigo || 'N/A'}
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                        {produto.nome}
                      </td>
                      <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                        {produto.unidade_medida}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
            onClick={handleAdicionar}
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

export default AdicionarProdutoModal;
