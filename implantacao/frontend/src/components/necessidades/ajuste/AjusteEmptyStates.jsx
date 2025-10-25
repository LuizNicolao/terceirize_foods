import React from 'react';
import { FaClipboardList, FaSearch } from 'react-icons/fa';
import { Button } from '../../ui';

const AjusteEmptyStates = ({ 
  type, 
  buscaProduto, 
  onClearSearch,
  message 
}) => {
  if (type === 'busca') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-600">
          Nenhum produto corresponde à busca "{buscaProduto}".
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClearSearch}
          className="mt-4"
        >
          Limpar busca
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message || 'Nenhuma necessidade encontrada'}
      </h3>
      <p className="text-gray-600">
        Não há necessidades disponíveis para ajuste no momento.
      </p>
    </div>
  );
};

export default AjusteEmptyStates;
