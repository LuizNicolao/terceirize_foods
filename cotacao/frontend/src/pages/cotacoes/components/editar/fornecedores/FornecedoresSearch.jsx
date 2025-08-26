import React from 'react';
import { ProdutoSearch } from '../../../../../components/ui';

const FornecedoresSearch = ({
  searchFornecedor,
  setSearchFornecedor,
  searchProdutoGlobal,
  setSearchProdutoGlobal,
  fornecedores
}) => {
  if (fornecedores.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Busca de fornecedores */}
        <div className="relative">
                      <input
              type="text"
              placeholder="🔍 Pesquisar fornecedor..."
              value={searchFornecedor}
              onChange={(e) => setSearchFornecedor(e.target.value)}
              className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
        </div>
        
        {/* Busca global de produtos */}
        <div className="relative">
          <ProdutoSearch
            value={searchProdutoGlobal}
            onChange={setSearchProdutoGlobal}
            placeholder="🔍 Buscar produto ..."
          />
        </div>
      </div>
    </div>
  );
};

export default FornecedoresSearch;
