import React from 'react';
import { FaCalendarTimes, FaPlus, FaList } from 'react-icons/fa';
import { Button } from '../../ui';
import DiaNaoUtilCard from './DiaNaoUtilCard';
import DiasNaoUteisResumoChips from './DiasNaoUteisResumoChips';

const DiasNaoUteisConfig = ({
  diasNaoUteisAgrupados,
  diasNaoUteisRecentes,
  diasNaoUteisConfigurados,
  resumoDiasNaoUteis,
  ano,
  onAdicionar,
  onEditar,
  onRemover,
  onVerListaCompleta,
  loading,
  loadingListas
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaCalendarTimes className="h-5 w-5 text-amber-600 mr-2" />
          Dias Não Úteis Personalizados
        </h3>
        <Button
          onClick={onAdicionar}
          variant="primary"
          size="sm"
          disabled={loadingListas || loading}
        >
          <FaPlus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-4">
        {diasNaoUteisAgrupados.length > 0 ? (
          <>
            <DiasNaoUteisResumoChips resumo={resumoDiasNaoUteis} />

            {diasNaoUteisRecentes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Últimos configurados
                  </span>
                  <span className="text-xs text-gray-500">
                    Exibindo {diasNaoUteisRecentes.length} de {diasNaoUteisAgrupados.length} {diasNaoUteisAgrupados.length === 1 ? 'dia não útil' : 'dias não úteis'} ({diasNaoUteisConfigurados.length} {diasNaoUteisConfigurados.length === 1 ? 'registro' : 'registros'})
                  </span>
                </div>
                <div className="space-y-2">
                  {diasNaoUteisRecentes.map((dia) => (
                    <DiaNaoUtilCard
                      key={`recent-${dia.id}`}
                      dia={dia}
                      onEditar={onEditar}
                      onRemover={onRemover}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            )}

            {diasNaoUteisAgrupados.length > 1 && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onVerListaCompleta}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaList className="h-4 w-4" />
                  Ver lista completa ({diasNaoUteisAgrupados.length})
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum dia não útil personalizado configurado para {ano}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiasNaoUteisConfig;

