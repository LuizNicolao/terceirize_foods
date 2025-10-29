import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '../ui';
import SearchableSelect from '../ui/SearchableSelect';
import ClassesService from '../../services/classes';

const ClasseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classe, 
  isViewMode,
  subgrupos = []
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);

  useEffect(() => {
    const carregarProximoCodigo = async () => {
      if (!classe && isOpen) {
        setCarregandoCodigo(true);
        try {
          // Buscar próximo código disponível do backend
          const response = await ClassesService.obterProximoCodigo();
          if (response.success) {
            setCodigoGerado(response.data.proximoCodigo);
          } else {
            setCodigoGerado('Erro ao gerar código');
          }
        } catch (error) {
          console.error('Erro ao obter próximo código:', error);
          setCodigoGerado('Erro ao gerar código');
        } finally {
          setCarregandoCodigo(false);
        }
      } else if (classe) {
        setCodigoGerado(classe.codigo || '');
      }
    };

    carregarProximoCodigo();
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
            placeholder={carregandoCodigo ? "Carregando..." : "Código gerado automaticamente"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Subgrupo *"
              value={classe?.subgrupo_id?.toString() || ''}
              onChange={(value) => {
                // Atualizar o valor no formulário
                const form = document.querySelector('form');
                if (form) {
                  const subgrupoInput = form.querySelector('input[name="subgrupo_id"]');
                  if (subgrupoInput) {
                    subgrupoInput.value = value;
                  }
                }
              }}
              options={[
                { value: '', label: 'Selecione um subgrupo' },
                ...subgrupos.map((subgrupo) => ({
                  value: subgrupo.id.toString(),
                  label: subgrupo.nome,
                  description: subgrupo.descricao || subgrupo.grupo_nome || ''
                }))
              ]}
              placeholder="Digite para buscar um subgrupo..."
              disabled={isViewMode}
              filterBy={(option, searchTerm) => {
                const label = option.label.toLowerCase();
                const description = option.description?.toLowerCase() || '';
                const term = searchTerm.toLowerCase();
                return label.includes(term) || description.includes(term);
              }}
              renderOption={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                  )}
                </div>
              )}
            />
            {/* Campo hidden para o formulário */}
            <input type="hidden" name="subgrupo_id" value={classe?.subgrupo_id?.toString() || ''} />
          </div>
          <Input
            label="Status"
            name="status"
            type="select"
            defaultValue={classe ? (classe.status === 'ativo' ? '1' : '0') : '1'}
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
