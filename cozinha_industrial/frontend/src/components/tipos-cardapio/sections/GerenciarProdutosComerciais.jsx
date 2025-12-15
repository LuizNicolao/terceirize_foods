import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchableSelect } from '../../ui';
import { FaPlus, FaTimes, FaTrash, FaSearch } from 'react-icons/fa';
import FoodsApiService from '../../../services/FoodsApiService';

/**
 * Seção de Gerenciamento de Produtos Comerciais
 * Busca produtos do foods e adiciona à lista
 */
const GerenciarProdutosComerciais = ({
  produtos,
  isViewMode,
  onAdicionarProduto,
  onRemoverProduto
}) => {
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtosComerciais, setProdutosComerciais] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);

  // Carregar produtos comerciais do foods
  useEffect(() => {
    carregarProdutosComerciais();
  }, []);

  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (!buscaProduto.trim()) {
      setProdutosFiltrados(produtosComerciais);
    } else {
      const termoBusca = buscaProduto.toLowerCase().trim();
      const filtrados = produtosComerciais.filter(produto => {
        const nomeProduto = (produto.nome_comercial || produto.nome || '').toLowerCase();
        const codigoProduto = (produto.codigo || String(produto.id)).toLowerCase();
        return nomeProduto.includes(termoBusca) || codigoProduto.includes(termoBusca);
      });
      setProdutosFiltrados(filtrados);
    }
  }, [buscaProduto, produtosComerciais]);

  const carregarProdutosComerciais = async () => {
    setLoadingProdutos(true);
    try {
      let todasProdutos = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;
      
      while (hasMore && page <= 50) {
        const response = await FoodsApiService.getProdutosComerciais({ 
          status: 1, 
          page, 
          limit 
        });
        
        if (response.success && response.data) {
          let items = [];
          if (response.data.items) {
            items = response.data.items;
          } else if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.data.data) {
            items = response.data.data;
          }
          
          todasProdutos = [...todasProdutos, ...items];
          hasMore = items.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setProdutosComerciais(todasProdutos);
      setProdutosFiltrados(todasProdutos);
    } catch (error) {
      console.error('Erro ao carregar produtos comerciais:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Filtrar produtos já adicionados
  const produtosDisponiveis = useMemo(() => {
    const produtosIdsAdicionados = new Set(produtos.map(p => p.produto_comercial_id).filter(Boolean));
    return produtosFiltrados.filter(p => !produtosIdsAdicionados.has(p.id));
  }, [produtosFiltrados, produtos]);

  const handleSelecionarProduto = (produtoId) => {
    if (!produtoId) return;
    
    const produto = produtosComerciais.find(p => p.id === parseInt(produtoId));
    if (!produto) return;

    // Verificar se já foi adicionado
    if (produtos.some(p => p.produto_comercial_id === produto.id)) {
      return;
    }

    onAdicionarProduto({
      produto_comercial_id: produto.id,
      nome: produto.nome_comercial || produto.nome,
      codigo: produto.codigo
    });
    setBuscaProduto('');
  };

  return (
    <>
      {/* Busca e Seleção de Produto */}
      {!isViewMode && (
        <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <SearchableSelect
                value=""
                onChange={handleSelecionarProduto}
                options={produtosDisponiveis.map(p => ({
                  value: String(p.id),
                  label: `${p.codigo || ''} - ${p.nome_comercial || p.nome}`
                }))}
                placeholder={loadingProdutos ? 'Carregando produtos...' : 'Buscar e adicionar produto comercial...'}
                disabled={loadingProdutos}
                usePortal={true}
                className="pl-10"
              />
            </div>
          </div>
          
          {buscaProduto && (
            <p className="text-xs text-gray-600">
              {produtosDisponiveis.length} produto(s) disponível(is)
            </p>
          )}
        </div>
      )}

      {/* Lista de Produtos Adicionados */}
      {produtos.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Produtos adicionados:</h4>
          <div className="flex flex-wrap gap-2">
            {produtos.map((produto, index) => {
              const produtoKey = produto.produto_comercial_id || `produto_${index}`;
              
              return (
                <div
                  key={produtoKey}
                  className="flex items-center gap-1"
                >
                  <div className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {produto.codigo ? `${produto.codigo} - ` : ''}
                      {produto.nome || `Produto ${produto.produto_comercial_id}`}
                    </span>
                  </div>
                  {!isViewMode && (
                    <Button
                      type="button"
                      onClick={() => onRemoverProduto(produto)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      <FaTrash className="text-xs" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default GerenciarProdutosComerciais;

