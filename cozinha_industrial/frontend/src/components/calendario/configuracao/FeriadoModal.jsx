import React from 'react';
import { FaSave } from 'react-icons/fa';
import { Button, Input, Modal } from '../../ui';

const FeriadoModal = ({ isOpen, onClose, formData, onChange, onSalvar, loading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Feriado"
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Data"
          type="date"
          value={formData.data}
          onChange={(e) => onChange({ ...formData, data: e.target.value })}
          required
        />
        
        <Input
          label="Nome do Feriado"
          value={formData.nome_feriado}
          onChange={(e) => onChange({ ...formData, nome_feriado: e.target.value })}
          placeholder="Ex: Natal, Ano Novo..."
          required
        />
        
        <Input
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => onChange({ ...formData, observacoes: e.target.value })}
          placeholder="Observações adicionais..."
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSalvar}
            variant="primary"
            disabled={loading}
          >
            <FaSave className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeriadoModal;

