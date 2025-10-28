import React from 'react';
import { FaFilePdf, FaFileExcel, FaCheckCircle, FaDownload } from 'react-icons/fa';
import { Button } from '../../../components/ui';

const SubstituicoesActions = ({
  necessidades,
  ajustesAtivados,
  onIniciarAjustes,
  onLiberarCoordenacao,
  onAprovarTodas,
  onExportarPDF,
  onExportarXLSX,
  loading = false,
  exportando = false,
  tipo = 'nutricionista' // 'nutricionista' ou 'coordenacao'
}) => {
  const temNecessidades = necessidades && necessidades.length > 0;
  const temSubstituicoes = temNecessidades && necessidades.some(nec => 
    nec.escolas.some(escola => escola.substituicao)
  );

  if (!temNecessidades) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {tipo === 'nutricionista' ? 'Ajuste Nutricionista' : 'Ajuste Coordenação'} 
          ({necessidades.length} {necessidades.length === 1 ? 'necessidade' : 'necessidades'})
        </h2>
        
        <div className="flex gap-2">
          {/* Ações específicas do nutricionista */}
          {tipo === 'nutricionista' && (
            <>
              {!ajustesAtivados && (
                <Button
                  variant="primary"
                  onClick={onIniciarAjustes}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  {loading ? 'Iniciando...' : 'Realizar Ajustes'}
                </Button>
              )}
              
              {ajustesAtivados && temSubstituicoes && (
                <Button
                  variant="success"
                  onClick={onLiberarCoordenacao}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  {loading ? 'Liberando...' : 'Liberar para Coordenação'}
                </Button>
              )}
            </>
          )}

          {/* Ações específicas da coordenação */}
          {tipo === 'coordenacao' && temSubstituicoes && (
            <Button
              variant="success"
              onClick={onAprovarTodas}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FaCheckCircle className="w-4 h-4" />
              {loading ? 'Aprovando...' : 'Aprovar Todas'}
            </Button>
          )}

          {/* Botões de exportação */}
          {ajustesAtivados && (
            <>
              <Button
                variant="secondary"
                onClick={() => onExportarPDF(necessidades, tipo)}
                disabled={exportando}
                className="flex items-center gap-2"
              >
                <FaFilePdf className="w-4 h-4" />
                {exportando ? 'Exportando...' : 'PDF'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => onExportarXLSX(necessidades, tipo)}
                disabled={exportando}
                className="flex items-center gap-2"
              >
                <FaFileExcel className="w-4 h-4" />
                {exportando ? 'Exportando...' : 'XLSX'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubstituicoesActions;
