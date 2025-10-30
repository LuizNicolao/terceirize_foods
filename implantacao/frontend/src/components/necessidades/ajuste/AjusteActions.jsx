import React from 'react';
import { FaPlus, FaSave, FaPaperPlane } from 'react-icons/fa';
import { Button, Input } from '../../ui';

const AjusteActions = ({
  buscaProduto,
  onBuscaChange,
  onIncluirProduto,
  onSalvarAjustes,
  onLiberar,
  canEdit,
  activeTab,
  statusAtual,
  filtros,
  disabledSalvar,
  disabledLiberar,
  titleIncluir
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="w-full max-w-md">
            <Input
              type="text"
              value={buscaProduto}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Buscar por produto ou código..."
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Botões de Ação */}
          {canEdit && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onIncluirProduto}
                  icon={<FaPlus />}
                  title={titleIncluir}
                >
                  Incluir Produto Extra
                </Button>
                {activeTab === 'coordenacao' && !filtros.escola_id && (
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
                disabled={disabledSalvar}
              >
                Salvar Ajustes
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={onLiberar}
                icon={<FaPaperPlane />}
                disabled={disabledLiberar}
              >
                {activeTab === 'nutricionista'
                  ? 'Liberar para Coordenação'
                  : activeTab === 'logistica'
                  ? (statusAtual === 'CONF NUTRI' ? 'Confirmar (CONF)' : 'Liberar para Nutri')
                  : (statusAtual === 'NEC COORD' ? 'Enviar para Nutri (CONF NUTRI)'
                    : (statusAtual === 'CONF COORD' ? 'Confirmar (CONF)' : 'Liberar'))}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AjusteActions;
