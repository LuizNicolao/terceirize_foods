import React from 'react';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Button } from '../../../../components/ui';
import { ExportButtons } from '../../../../components/shared';

const AnaliseHeader = ({
  totalNecessidades,
  totalEscolas,
  necessidadesCount,
  ajustesAtivados,
  salvandoAjustes,
  onIniciarAjustes,
  onLiberarAnalise
}) => {
  if (necessidadesCount === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Produtos para Substituição ({necessidadesCount}) • {totalNecessidades} {totalNecessidades === 1 ? 'necessidade' : 'necessidades'} • {totalEscolas} {totalEscolas === 1 ? 'escola' : 'escolas'}
        </h2>
        
        {!ajustesAtivados ? (
          <Button
            variant="primary"
            onClick={onIniciarAjustes}
            disabled={salvandoAjustes || !necessidadesCount}
          >
            {salvandoAjustes ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Realizar Ajustes
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-3">
            <ExportButtons
              onExportXLSX={() => {}}
              onExportPDF={() => {}}
              size="sm"
              variant="outline"
              showLabels={true}
            />
            <Button
              variant="success"
              onClick={onLiberarAnalise}
              disabled={salvandoAjustes}
              className="flex items-center gap-2"
            >
              {salvandoAjustes ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Liberando...
                </>
              ) : (
                <>
                  <FaArrowRight className="w-4 h-4" />
                  Liberar Análise
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnaliseHeader;

