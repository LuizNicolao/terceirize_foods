import React from 'react';
import { Modal, Input, Button } from '../ui';

const GrupoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  grupo, 
  isViewMode 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Grupo' : grupo ? 'Editar Grupo' : 'Adicionar Grupo'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: formData.get('codigo'),
          descricao: formData.get('descricao'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome do Grupo *"
            name="nome"
            defaultValue={grupo?.nome}
            disabled={isViewMode}
            required
            placeholder="Ex: Frios, Eletrônicos, Roupas"
          />
          <Input
            label="Código do Grupo"
            name="codigo"
            defaultValue={grupo?.codigo}
            disabled={isViewMode}
            placeholder="Ex: FRIOS, ELET, ROUP"
            maxLength={20}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Descrição"
            name="descricao"
            type="textarea"
            defaultValue={grupo?.descricao}
            disabled={isViewMode}
            placeholder="Descrição detalhada do grupo"
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Status"
            name="status"
            type="select"
            defaultValue={grupo?.status === 'ativo' ? '1' : '0'}
            disabled={isViewMode}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </Input>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {grupo ? 'Atualizar Grupo' : 'Cadastrar Grupo'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GrupoModal;
