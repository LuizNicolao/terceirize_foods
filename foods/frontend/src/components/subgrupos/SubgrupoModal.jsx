import React from 'react';
import { Modal, Input, Button } from '../ui';

const SubgrupoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  subgrupo, 
  isViewMode,
  grupos = []
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Subgrupo' : subgrupo ? 'Editar Subgrupo' : 'Adicionar Subgrupo'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: formData.get('codigo'),
          descricao: formData.get('descricao'),
          grupo_id: formData.get('grupo_id'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome do Subgrupo *"
            name="nome"
            defaultValue={subgrupo?.nome}
            disabled={isViewMode}
            required
          />
          <Input
            label="Código do Subgrupo *"
            name="codigo"
            defaultValue={subgrupo?.codigo}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Grupo *"
            name="grupo_id"
            type="select"
            defaultValue={subgrupo?.grupo_id?.toString()}
            disabled={isViewMode}
            required
          >
            <option value="">Selecione um grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </Input>
          <Input
            label="Status"
            name="status"
            type="select"
            defaultValue={subgrupo?.status === 'ativo' ? '1' : '0'}
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
          defaultValue={subgrupo?.descricao}
          disabled={isViewMode}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {subgrupo ? 'Atualizar Subgrupo' : 'Cadastrar Subgrupo'}
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

export default SubgrupoModal;
