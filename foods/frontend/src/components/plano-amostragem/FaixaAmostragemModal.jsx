import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import PlanoAmostragemService from '../../services/planoAmostragem';

const FaixaAmostragemModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  faixa, 
  isViewMode,
  nqaSelecionado 
}) => {
  const [nqas, setNqas] = useState([]);
  const [nqaCodigo, setNqaCodigo] = useState('');
  const [nqaSelecionadoId, setNqaSelecionadoId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      carregarNQAs();
      if (faixa) {
        setNqaCodigo(faixa.nqa_codigo || '');
        setNqaSelecionadoId(faixa.nqa_id || null);
      } else if (nqaSelecionado) {
        setNqaSelecionadoId(nqaSelecionado);
      }
    } else {
      setNqaCodigo('');
      setNqaSelecionadoId(null);
    }
  }, [isOpen, faixa, nqaSelecionado]);

  const carregarNQAs = async () => {
    try {
      const response = await PlanoAmostragemService.buscarNQAsAtivos();
      if (response.success) {
        setNqas(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar NQAs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nqa_id: nqaSelecionadoId || null,
      nqa_codigo: nqaCodigo || null,
      faixa_inicial: parseInt(formData.get('faixa_inicial')),
      faixa_final: parseInt(formData.get('faixa_final')),
      tamanho_amostra: parseInt(formData.get('tamanho_amostra')),
      ac: parseInt(formData.get('ac')),
      re: parseInt(formData.get('re')),
      observacoes: formData.get('observacoes'),
      ativo: formData.get('ativo') || '1'
    };
    
    const result = await onSubmit(data);
    if (result && result.success) {
      setNqaCodigo('');
      setNqaSelecionadoId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Faixa de Amostragem' : faixa ? 'Editar Faixa de Amostragem' : 'Adicionar Faixa de Amostragem'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!faixa ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Input
                label="NQA (código) *"
                name="nqa_codigo"
                value={nqaCodigo}
                onChange={(e) => {
                  setNqaCodigo(e.target.value);
                  if (e.target.value) {
                    setNqaSelecionadoId(null);
                  }
                }}
                disabled={isViewMode || nqaSelecionadoId}
                placeholder="Ex: 2,5"
              />
            </div>
            <div>
              <SearchableSelect
                label="Ou selecionar NQA existente"
                value={nqaSelecionadoId || ''}
                onChange={(value) => {
                  setNqaSelecionadoId(value ? parseInt(value) : null);
                  if (value) {
                    const nqaSelecionado = nqas.find(n => n.id === parseInt(value));
                    if (nqaSelecionado) {
                      setNqaCodigo(nqaSelecionado.codigo);
                    }
                  }
                }}
                options={nqas.map(nqa => ({
                  value: nqa.id,
                  label: `${nqa.codigo} - ${nqa.nome}`,
                  description: `Nível: ${nqa.nivel_inspecao}`
                }))}
                placeholder="Digite para buscar um NQA..."
                disabled={isViewMode || !!nqaCodigo}
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
            </div>
          </div>
        ) : (
          <Input
            label="NQA"
            name="nqa_codigo"
            value={faixa.nqa_codigo || faixa.nqa_nome || '-'}
            disabled={true}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Faixa Inicial *"
            name="faixa_inicial"
            type="number"
            min="1"
            defaultValue={faixa?.faixa_inicial}
            disabled={isViewMode}
            required
          />
          <Input
            label="Faixa Final *"
            name="faixa_final"
            type="number"
            min="1"
            defaultValue={faixa?.faixa_final}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Input
            label="Tamanho da Amostra *"
            name="tamanho_amostra"
            type="number"
            min="1"
            defaultValue={faixa?.tamanho_amostra}
            disabled={isViewMode}
            required
          />
          <Input
            label="AC (Aceitação) *"
            name="ac"
            type="number"
            min="0"
            defaultValue={faixa?.ac}
            disabled={isViewMode}
            required
          />
          <Input
            label="RE (Rejeição) *"
            name="re"
            type="number"
            min="1"
            defaultValue={faixa?.re}
            disabled={isViewMode}
            required
          />
        </div>

        <Input
          label="Observações"
          name="observacoes"
          type="textarea"
          defaultValue={faixa?.observacoes}
          disabled={isViewMode}
          rows={3}
        />

        <Input
          label="Status"
          name="ativo"
          type="select"
          defaultValue={faixa ? (faixa.ativo === 1 ? '1' : '0') : '1'}
          disabled={isViewMode}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Input>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {faixa ? 'Atualizar Faixa' : 'Cadastrar Faixa'}
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

export default FaixaAmostragemModal;

