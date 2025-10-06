import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '../ui';
// import { gerarCodigoClasse, gerarCodigoTemporario } from '../../utils/codigoGenerator';

const ClasseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classe, 
  isViewMode,
  subgrupos = []
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');

  useEffect(() => {
    if (!classe && isOpen) {
      // Gerar código temporário para mostrar ao usuário
      const codigo = 'CLASSE-' + Date.now().toString().slice(-6);
      setCodigoGerado(codigo);
    } else if (classe) {
      setCodigoGerado(classe.codigo || '');
    }
  }, [classe, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Classe' : classe ? 'Editar Classe' : 'Adicionar Classe'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: formData.get('codigo'),
          descricao: formData.get('descricao'),
          subgrupo_id: formData.get('subgrupo_id'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome da Classe *"
            name="nome"
            defaultValue={classe?.nome}
            disabled={isViewMode}
            required
          />
          <Input
            label="Código da Classe *"
            name="codigo"
            value={codigoGerado}
            disabled={true}
            required
            placeholder="Código gerado automaticamente"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Subgrupo *"
            name="subgrupo_id"
            type="select"
            defaultValue={classe?.subgrupo_id?.toString()}
            disabled={isViewMode}
            required
          >
            <option value="">Selecione um subgrupo</option>
            {subgrupos.map((subgrupo) => (
              <option key={subgrupo.id} value={subgrupo.id}>
                {subgrupo.nome}
              </option>
            ))}
          </Input>
          <Input
            label="Status"
            name="status"
            type="select"
            defaultValue={classe?.status === 'ativo' ? '1' : '0'}
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
          defaultValue={classe?.descricao}
          disabled={isViewMode}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {classe ? 'Atualizar Classe' : 'Cadastrar Classe'}
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

export default ClasseModal;
