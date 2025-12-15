import React from 'react';
import { Button } from '../../ui';

/**
 * Seção de Busca de Unidades
 */
const BuscaUnidades = ({
  buscaUnidade,
  loadingUnidades,
  onBuscaUnidadeChange,
  onBuscaUnidadeSubmit
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Buscar unidade por nome..."
        value={buscaUnidade}
        onChange={(e) => onBuscaUnidadeChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onBuscaUnidadeSubmit();
          }
        }}
        disabled={loadingUnidades}
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
      />
      <Button
        type="button"
        onClick={onBuscaUnidadeSubmit}
        disabled={loadingUnidades}
        size="sm"
      >
        Buscar
      </Button>
    </div>
  );
};

export default BuscaUnidades;

