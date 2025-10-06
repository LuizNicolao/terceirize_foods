import React from 'react';
import { CadastroFilterBar } from '../ui';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';

const RecebimentosFilters = ({ 
  searchTerm,
  onSearchChange,
  semanaAbastecimento,
  onSemanaAbastecimentoChange,
  opcoesSemanas = [],
  additionalFilters = [],
  onClear,
  loading = false 
}) => {
  const { obterValorPadrao } = useSemanasAbastecimento();

  const handleSemanaAtual = () => {
    const semanaPadrao = obterValorPadrao();
    if (semanaPadrao) {
      onSemanaAbastecimentoChange(semanaPadrao);
    }
  };

  return (
    <div className="space-y-4">
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        semanaAbastecimento={semanaAbastecimento}
        onSemanaAbastecimentoChange={onSemanaAbastecimentoChange}
        opcoesSemanas={opcoesSemanas}
        additionalFilters={additionalFilters}
        onClear={onClear}
        placeholder="Buscar por escola ou produto..."
      />
      
      {/* Botões de ação */}
      <div className="flex gap-2">
        <button
          onClick={handleSemanaAtual}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          Semana Atual
        </button>
        {semanaAbastecimento && (
          <button
            onClick={() => onSemanaAbastecimentoChange('')}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            Limpar Semana
          </button>
        )}
      </div>
    </div>
  );
};

export default RecebimentosFilters;