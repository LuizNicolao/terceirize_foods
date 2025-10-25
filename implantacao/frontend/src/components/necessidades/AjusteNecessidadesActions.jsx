import React from 'react';
import { FaPlus, FaSave, FaPaperPlane } from 'react-icons/fa';
import { Button } from '../ui';

const AjusteNecessidadesActions = ({
  activeTab,
  statusAtual,
  canEdit,
  filtros,
  onIncluirProdutoExtra,
  onSalvarAjustes,
  onLiberarCoordenacao
}) => {
  const isSalvarDisabled = activeTab === 'nutricionista' && statusAtual === 'NEC NUTRI';
  const showIndicador = activeTab === 'coordenacao' && !filtros.escola_id;

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={onIncluirProdutoExtra}
          icon={<FaPlus />}
          title={showIndicador ? 'Selecione uma escola e clique em Filtrar antes de incluir produtos' : undefined}
        >
          Incluir Produto Extra
        </Button>
        {showIndicador && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        )}
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onSalvarAjustes}
        icon={<FaSave />}
        disabled={isSalvarDisabled}
      >
        Salvar Ajustes
      </Button>
      <Button
        variant="success"
        size="sm"
        onClick={onLiberarCoordenacao}
        icon={<FaPaperPlane />}
        disabled={isSalvarDisabled}
      >
        {activeTab === 'nutricionista' ? 'Liberar para Coordenação' : 'Liberar para Logística'}
      </Button>
    </div>
  );
};

export default AjusteNecessidadesActions;
