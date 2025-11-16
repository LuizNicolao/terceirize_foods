import React from 'react';
import { FaPlus, FaQuestionCircle, FaUpload } from 'react-icons/fa';
import { Button } from '../ui';

const TipoAtendimentoEscolaHeader = ({
  canCreate,
  onAdd,
  onImport,
  onShowHelp,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tipo de Atendimento por Escola</h1>
      <div className="flex gap-2 sm:gap-3">
        {onShowHelp && (
          <Button
            onClick={onShowHelp}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
        )}
        {canCreate && onImport && (
          <Button
            onClick={onImport}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <FaUpload className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
        )}
        {canCreate && (
          <Button
            onClick={onAdd}
            disabled={loading}
            size="sm"
          >
            <FaPlus className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Adicionar Vínculo</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TipoAtendimentoEscolaHeader;

