import React, { useState, useMemo } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FornecedorCard, FornecedoresSearch } from './fornecedores';
import { useFornecedoresCalculos } from '../../../../hooks/useFornecedoresCalculos';

const FornecedoresList = ({ fornecedores, produtos = [] }) => {
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Hook para cálculos
  const { calcularValorComDifalEFrete, melhorPrecoPorProduto } = useFornecedoresCalculos(fornecedores, produtos);

  if (!fornecedores || fornecedores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            🏢 Fornecedores ({fornecedores?.length || 0})
          </h2>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum fornecedor encontrado na cotação</p>
        </div>
      </div>
    );
  }

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj?.includes(searchTerm) ||
    fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🏢 Fornecedores ({fornecedores.length})
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6">
          {/* Barra de Busca */}
          <FornecedoresSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* Lista de Fornecedores */}
          {filteredFornecedores.map((fornecedor) => (
            <FornecedorCard
              key={fornecedor.id}
              fornecedor={fornecedor}
              melhorPrecoPorProduto={melhorPrecoPorProduto}
              calcularValorComDifalEFrete={calcularValorComDifalEFrete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FornecedoresList;
