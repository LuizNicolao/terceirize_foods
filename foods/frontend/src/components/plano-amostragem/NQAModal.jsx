import React from 'react';
import { Modal, Input, Button } from '../ui';

const NQAModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  nqa, 
  isViewMode 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar NQA' : nqa ? 'Editar NQA' : 'Adicionar NQA'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: formData.get('codigo'),
          descricao: formData.get('descricao'),
          nivel_inspecao: formData.get('nivel_inspecao'),
          ativo: formData.get('ativo')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome do NQA *"
            name="nome"
            defaultValue={nqa?.nome}
            disabled={isViewMode}
            required
          />
          <Input
            label="Código do NQA *"
            name="codigo"
            defaultValue={nqa?.codigo}
            disabled={isViewMode}
            required
            placeholder="Ex: 2,5"
          />
        </div>

        <Input
          label="Nível de Inspeção"
          name="nivel_inspecao"
          type="select"
          defaultValue={nqa?.nivel_inspecao || 'II'}
          disabled={isViewMode}
        >
          <option value="I">I - Reduzida</option>
          <option value="II">II - Normal</option>
          <option value="III">III - Rigorosa</option>
        </Input>

        <Input
          label="Status"
          name="ativo"
          type="select"
          defaultValue={nqa ? (nqa.ativo === 1 ? '1' : '0') : '1'}
          disabled={isViewMode}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Input>

        <Input
          label="Descrição"
          name="descricao"
          type="textarea"
          defaultValue={nqa?.descricao}
          disabled={isViewMode}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {nqa ? 'Atualizar NQA' : 'Cadastrar NQA'}
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

export default NQAModal;

