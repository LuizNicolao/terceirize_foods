import React from 'react';
import { Modal } from '../ui';
import RelatorioInspecaoForm from '../../pages/relatorio-inspecao/RelatorioInspecaoForm';

const RelatorioInspecaoModal = ({ isOpen, onClose, rirId, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rirId ? 'Editar Relatório de Inspeção' : 'Novo Relatório de Inspeção'}
      size="full"
    >
      <RelatorioInspecaoForm
        rirId={rirId}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default RelatorioInspecaoModal;

