import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FornecedorCard, FornecedoresSearch } from './fornecedores';
import { useFornecedoresCalculos } from '../../../../hooks/useFornecedoresCalculos';

const FornecedoresList = ({ 
  fornecedores = [], 
  produtos = [], 
  errors = {}, 
  tiposFrete = [],
  updateFornecedor, 
  updateProdutoFornecedor, 
  removeFornecedor, 
  removeProduto, 
  addFornecedor,
  cotacaoId 
}) => {
  const [searchFornecedor, setSearchFornecedor] = useState('');
  const [searchProduto, setSearchProduto] = useState('');
  const [searchProdutoGlobal, setSearchProdutoGlobal] = useState('');

  // Hook para cálculos
  const { calcularValorComDifalEFrete, melhorPrecoPorProduto } = useFornecedoresCalculos(fornecedores, produtos);

  // Filtrar fornecedores
  const filteredFornecedores = (fornecedores || []).filter(fornecedor => {
    // Filtro por nome do fornecedor
    const matchFornecedor = fornecedor.nome.toLowerCase().includes(searchFornecedor.toLowerCase());
    
    // Se há busca global de produto, verificar se o fornecedor tem produtos que correspondem
    if (searchProdutoGlobal) {
      const hasMatchingProduto = (fornecedor.produtos || []).some(produto => {
        const produtoNome = produto.nome || produto.produto_nome || produto.descricao || '';
        return produtoNome.toLowerCase().includes(searchProdutoGlobal.toLowerCase());
      });
      return matchFornecedor && hasMatchingProduto;
    }
    
    return matchFornecedor;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🏢 Fornecedores
        </h2>
        <button
          type="button"
          onClick={addFornecedor}
          disabled={!produtos || produtos.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <FaPlus /> Adicionar Fornecedor
        </button>
      </div>
      
      {/* Erros */}
      {errors.fornecedores && (
        <div className="text-red-500 text-sm mb-4">{errors.fornecedores}</div>
      )}

      {/* Barras de pesquisa */}
      <FornecedoresSearch
        searchFornecedor={searchFornecedor}
        setSearchFornecedor={setSearchFornecedor}
        searchProdutoGlobal={searchProdutoGlobal}
        setSearchProdutoGlobal={setSearchProdutoGlobal}
        fornecedores={fornecedores || []}
      />

      {/* Lista de Fornecedores */}
      <div className="space-y-6">
        {filteredFornecedores.map((fornecedor, index) => (
          <FornecedorCard
            key={fornecedor.id}
            fornecedor={fornecedor}
            index={index}
            produtos={produtos || []}
            tiposFrete={tiposFrete || []}
            searchProduto={searchProduto}
            setSearchProduto={setSearchProduto}
            melhorPrecoPorProduto={melhorPrecoPorProduto}
            updateFornecedor={updateFornecedor}
            updateProdutoFornecedor={updateProdutoFornecedor}
            removeFornecedor={removeFornecedor}
            removeProduto={removeProduto}
            cotacaoId={cotacaoId}
            calcularValorComDifalEFrete={calcularValorComDifalEFrete}
          />
        ))}
      </div>
    </div>
  );
};

export default FornecedoresList;
