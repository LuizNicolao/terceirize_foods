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
      size="md"
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
          />
          <Input
            label="Código do Grupo *"
            name="codigo"
            defaultValue={grupo?.codigo}
            disabled={isViewMode}
            required
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

        <Input
          label="Descrição"
          name="descricao"
          type="textarea"
          defaultValue={grupo?.descricao}
          disabled={isViewMode}
          rows={3}
        />

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
