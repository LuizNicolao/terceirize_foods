import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

const AnaliseEmptyState = ({ filtrosJaAplicados }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {filtrosJaAplicados ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma necessidade encontrada
          </h3>
          <p className="text-gray-600">
            Não há necessidades com status CONF para os filtros selecionados.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione os filtros para buscar necessidades
          </h3>
          <p className="text-gray-600">
            Selecione o <strong>Grupo de Produtos</strong> e a <strong>Semana de Abastecimento</strong> para visualizar as necessidades disponíveis para substituição.
          </p>
        </>
      )}
    </div>
  );
};

export default AnaliseEmptyState;

