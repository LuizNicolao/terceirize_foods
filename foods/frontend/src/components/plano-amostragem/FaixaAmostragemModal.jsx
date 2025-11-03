import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';
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

  useEffect(() => {
    if (isOpen) {
      carregarNQAs();
      if (faixa) {
        setNqaCodigo(faixa.nqa_codigo || '');
      } else if (nqaSelecionado) {
        // Buscar código do NQA selecionado
        const nqaSelecionadoObj = nqas.find(n => n.id === nqaSelecionado);
        if (nqaSelecionadoObj) {
          setNqaCodigo(nqaSelecionadoObj.codigo);
        }
      }
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
      nqa_id: formData.get('nqa_id') || null,
      nqa_codigo: formData.get('nqa_codigo') || nqaCodigo,
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
        {!faixa && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="NQA (código ou selecionar) *"
              name="nqa_codigo"
              value={nqaCodigo}
              onChange={(e) => setNqaCodigo(e.target.value)}
              disabled={isViewMode}
              placeholder="Ex: 2,5"
            />
            <Input
              label="Ou selecionar NQA existente"
              name="nqa_id"
              type="select"
              disabled={isViewMode || nqaCodigo}
              defaultValue={faixa?.nqa_id || nqaSelecionado || ''}
            >
              <option value="">Selecione um NQA</option>
              {nqas.map(nqa => (
                <option key={nqa.id} value={nqa.id}>
                  {nqa.codigo} - {nqa.nome}
                </option>
              ))}
            </Input>
          </div>
        )}

        {faixa && (
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

