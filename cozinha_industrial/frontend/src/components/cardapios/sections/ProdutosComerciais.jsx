import React, { useState, useEffect } from 'react';
import FoodsApiService from '../../../services/FoodsApiService';
import contratosService from '../../../services/contratos';

/**
 * Seção de Produtos Comerciais (Tipos de Cardápio) do Cardápio (seleção múltipla)
 */
const ProdutosComerciais = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [produtosComerciais, setProdutosComerciais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Carregar produtos comerciais quando contratos estiverem selecionados
  useEffect(() => {
    if ((formData.contratos || []).length > 0) {
      carregarProdutosComerciais();
    } else {
      setProdutosComerciais([]);
      onInputChange('produtos_comerciais', []);
    }
  }, [formData.contratos]);

  const carregarProdutosComerciais = async () => {
    setLoading(true);
    try {
      const contratosIds = (formData.contratos || []).map(c => c.id);
      
      // Buscar produtos comerciais vinculados aos contratos selecionados
      // Primeiro, buscar produtos vinculados aos contratos
      const produtosVinculados = new Set();
      
      for (const contratoId of contratosIds) {
        try {
          const response = await contratosService.buscarProdutosVinculados(contratoId);
          if (response.success && response.data) {
            response.data.forEach(produto => {
              if (produto.produto_comercial_id) {
                produtosVinculados.add(produto.produto_comercial_id);
              }
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar produtos do contrato ${contratoId}:`, error);
        }
      }

      // Buscar informações dos produtos comerciais
      if (produtosVinculados.size > 0) {
        const produtosIds = Array.from(produtosVinculados);
        const produtosCompletos = [];
        
        for (const produtoId of produtosIds) {
          try {
            const response = await FoodsApiService.getProdutoComercialById(produtoId);
            if (response.success && response.data) {
              produtosCompletos.push(response.data);
            }
          } catch (error) {
            console.error(`Erro ao buscar produto comercial ${produtoId}:`, error);
          }
        }
        
        setProdutosComerciais(produtosCompletos);
      } else {
        setProdutosComerciais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos comerciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProdutoComercial = (produto) => {
    const produtosAtuais = formData.produtos_comerciais || [];
    const existe = produtosAtuais.find(p => p.id === produto.id);
    
    if (existe) {
      onInputChange('produtos_comerciais', produtosAtuais.filter(p => p.id !== produto.id));
    } else {
      onInputChange('produtos_comerciais', [...produtosAtuais, { 
        id: produto.id,
        nome_comercial: produto.nome_comercial || produto.nome || '',
        grupo_id: produto.grupo_id || null,
        grupo_nome: produto.grupo_nome || null,
        subgrupo_id: produto.subgrupo_id || null,
        subgrupo_nome: produto.subgrupo_nome || null,
        classe_id: produto.classe_id || null,
        classe_nome: produto.classe_nome || null
      }]);
    }
  };

  const produtosFiltrados = produtosComerciais.filter(p =>
    (p.nome_comercial || p.nome || '').toLowerCase().includes(search.toLowerCase())
  );

  if ((formData.contratos || []).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Selecione contratos na seção anterior para ver os produtos comerciais (tipos de cardápio) disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
        <input
          type="text"
          placeholder="Buscar produto comercial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isViewMode || loading}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
        />
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Carregando...</div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nenhum produto comercial encontrado</div>
          ) : (
            <div className="space-y-1">
              {produtosFiltrados.map((produto) => {
                const isSelected = (formData.produtos_comerciais || []).some(p => p.id === produto.id);
                return (
                  <label
                    key={produto.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProdutoComercial(produto)}
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {produto.nome_comercial || produto.nome || `Produto ${produto.id}`}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {(formData.produtos_comerciais || []).length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {formData.produtos_comerciais.length} produto(s) comercial(is) selecionado(s)
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutosComerciais;

