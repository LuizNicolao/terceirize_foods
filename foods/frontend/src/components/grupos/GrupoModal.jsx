import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { gerarCodigoGrupo, gerarCodigoTemporario } from '../../utils/codigoGenerator';

const GrupoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  grupo, 
  isViewMode 
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');

  useEffect(() => {
    if (!grupo && isOpen) {
      // Gerar código de vitrine temporário para mostrar ao usuário
      const codigo = gerarCodigoTemporario('GRUPO');
      setCodigoGerado(codigo);
    } else if (grupo) {
      setCodigoGerado(grupo.codigo || '');
    }
  }, [grupo, isOpen]);

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
          />
          <Input
            label="Código do Grupo *"
            name="codigo"
            value={codigoGerado}
            disabled={true}
            required
            placeholder="Código gerado automaticamente"
          />
        </div>

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
