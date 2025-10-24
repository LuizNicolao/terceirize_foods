import React from 'react';
import { FaPlus, FaSave, FaPaperPlane } from 'react-icons/fa';
import { Button } from '../../ui';
import { ExportButtons } from '../../shared';

const AjusteNecessidadesActions = ({
  necessidadesFiltradas,
  statusAtual,
  modoCoordenacao,
  canEditAjuste,
  onExportarExcel,
  onExportarPDF,
  onAbrirModalProdutoExtra,
  onSalvarAjustes,
  onLiberarCoordenacao
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Botões de Exportação */}
      <ExportButtons
        onExportXLSX={onExportarExcel}
        onExportPDF={onExportarPDF}
        size="sm"
        variant="outline"
        showLabels={true}
        disabled={necessidadesFiltradas.length === 0}
      />

      {/* Botões de Ação */}
      {canEditAjuste && (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAbrirModalProdutoExtra}
            icon={<FaPlus />}
          >
            Incluir Produto Extra
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSalvarAjustes}
            icon={<FaSave />}
            disabled={statusAtual === 'CONF'}
          >
            Salvar Ajustes
          </Button>
          {modoCoordenacao ? (
            <Button
              variant="success"
              size="sm"
              onClick={onLiberarCoordenacao}
              icon={<FaPaperPlane />}
              disabled={statusAtual === 'CONF'}
            >
              Liberar para Logística
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={onLiberarCoordenacao}
              icon={<FaPaperPlane />}
              disabled={statusAtual === 'NEC COORD'}
            >
              Liberar para Coordenação
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AjusteNecessidadesActions;
