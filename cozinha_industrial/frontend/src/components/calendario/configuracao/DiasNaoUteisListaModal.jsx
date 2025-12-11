import React from 'react';
import { Input, Modal } from '../../ui';
import DiaNaoUtilCard from './DiaNaoUtilCard';
import DiasNaoUteisResumoChips from './DiasNaoUteisResumoChips';

const DiasNaoUteisListaModal = ({
  isOpen,
  onClose,
  buscaDiaNaoUtil,
  onBuscaChange,
  diasNaoUteisFiltrados,
  diasNaoUteisAgrupados,
  diasNaoUteisConfigurados,
  resumoDiasNaoUteisFiltrados,
  onEditar,
  onRemover,
  loading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dias não úteis configurados"
      size="xl"
    >
      <div className="space-y-4">
        <Input
          label="Buscar dia não útil"
          value={buscaDiaNaoUtil}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Busque por descrição, destino ou observações..."
        />

        <DiasNaoUteisResumoChips resumo={resumoDiasNaoUteisFiltrados} />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Exibindo {diasNaoUteisFiltrados.length} de {diasNaoUteisAgrupados.length} {diasNaoUteisAgrupados.length === 1 ? 'dia não útil' : 'dias não úteis'} ({diasNaoUteisConfigurados.length} {diasNaoUteisConfigurados.length === 1 ? 'registro' : 'registros'})
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {diasNaoUteisFiltrados.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {diasNaoUteisFiltrados.map((dia) => (
                <DiaNaoUtilCard
                  key={`modal-${dia.id}`}
                  dia={dia}
                  onEditar={onEditar}
                  onRemover={onRemover}
                  disabled={loading}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhum registro encontrado para "{buscaDiaNaoUtil}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DiasNaoUteisListaModal;

