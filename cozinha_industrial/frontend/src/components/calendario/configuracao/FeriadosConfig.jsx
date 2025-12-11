import React from 'react';
import { FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import { Button } from '../../ui';

const FeriadosConfig = ({ feriados, ano, onAdicionar, onRemover, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
          Feriados
        </h3>
        <Button
          onClick={onAdicionar}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaPlus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
      
      <div className="space-y-2">
        {feriados && feriados.length > 0 ? (
          feriados.map((feriado) => (
            <div key={feriado.data} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{feriado.nome_feriado}</div>
                <div className="text-sm text-gray-500">
                  {new Date(feriado.data).toLocaleDateString('pt-BR')}
                </div>
                {feriado.observacoes && (
                  <div className="text-xs text-gray-600 mt-1">{feriado.observacoes}</div>
                )}
              </div>
              <Button
                onClick={() => onRemover(feriado.data)}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum feriado configurado para {ano}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeriadosConfig;

