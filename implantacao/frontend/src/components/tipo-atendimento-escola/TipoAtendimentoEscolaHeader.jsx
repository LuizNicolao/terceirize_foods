import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { Button } from '../ui';

const TipoAtendimentoEscolaHeader = ({
  canCreate,
  onAdd,
  onShowHelp,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tipo de Atendimento por Escola
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie os tipos de atendimento vinculados às unidades escolares
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onShowHelp && (
          <Button
            onClick={onShowHelp}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <FaQuestionCircle className="mr-1" />
            Ajuda
          </Button>
        )}
        {canCreate && (
          <Button
            onClick={onAdd}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FaPlus className="mr-2" />
            Adicionar Vínculo
          </Button>
        )}
      </div>
    </div>
  );
};

export default TipoAtendimentoEscolaHeader;

