/**
 * Modal para replicar frequências entre turnos
 */

import React, { useState } from 'react';
import { Modal, Button, SearchableSelect } from '../ui';
import MultiSelectCheckbox from 'foods-frontend/src/components/ui/MultiSelectCheckbox';
import { FaCopy, FaTimes } from 'react-icons/fa';

const NecessidadeModalReplicarFrequencias = ({
  isOpen,
  onClose,
  onReplicar,
  tiposDisponiveis = []
}) => {
  const [turnoOrigem, setTurnoOrigem] = useState('');
  const [turnosDestino, setTurnosDestino] = useState([]);

  const opcoesTurnos = tiposDisponiveis.map(tipo => ({
    value: tipo.key,
    label: tipo.label
  }));

  const opcoesTurnosDestino = tiposDisponiveis
    .filter(tipo => tipo.key !== turnoOrigem)
    .map(tipo => ({
      value: tipo.key,
      label: tipo.label
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!turnoOrigem) {
      return;
    }

    if (turnosDestino.length === 0) {
      return;
    }

    onReplicar(turnoOrigem, turnosDestino);
    
    // Limpar formulário
    setTurnoOrigem('');
    setTurnosDestino([]);
    onClose();
  };

  const handleClose = () => {
    setTurnoOrigem('');
    setTurnosDestino([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Replicar Frequências" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Selecione o turno de origem e os turnos de destino para replicar as frequências.
          </p>
        </div>

        <div>
          <SearchableSelect
            label="Turno de Origem"
            value={turnoOrigem}
            onChange={setTurnoOrigem}
            options={opcoesTurnos}
            placeholder="Selecione o turno de origem..."
            required
            usePortal={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turnos de Destino <span className="text-red-500">*</span>
          </label>
          <MultiSelectCheckbox
            value={turnosDestino}
            onChange={setTurnosDestino}
            options={opcoesTurnosDestino}
            placeholder="Selecione os turnos de destino..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Você pode selecionar múltiplos turnos de destino
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!turnoOrigem || turnosDestino.length === 0}
          >
            <FaCopy className="mr-2" />
            Replicar Frequências
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NecessidadeModalReplicarFrequencias;
