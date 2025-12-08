import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

const CoordenacaoEmptyState = ({ filtrosJaAplicados }) => {
  if (filtrosJaAplicados) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma necessidade encontrada
        </h3>
        <p className="text-gray-600">
          Não há necessidades liberadas para coordenação com os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Selecione os filtros para buscar necessidades
      </h3>
      <p className="text-gray-600">
        Selecione pelo menos um filtro (<strong>Tipo de Rota</strong>, <strong>Grupo de Produtos</strong> ou <strong>Semana de Abastecimento</strong>) para visualizar as necessidades liberadas para coordenação.
      </p>
    </div>
  );
};

export default CoordenacaoEmptyState;

