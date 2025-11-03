import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';
import GruposService from '../../services/grupos';
import PlanoAmostragemService from '../../services/planoAmostragem';

const VincularGrupoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [grupos, setGrupos] = useState([]);
  const [nqas, setNqas] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingNQAs, setLoadingNQAs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarGrupos();
      carregarNQAs();
    }
  }, [isOpen]);

  const carregarGrupos = async () => {
    setLoadingGrupos(true);
    try {
      const response = await GruposService.buscarAtivos();
      if (response.success) {
        setGrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const carregarNQAs = async () => {
    setLoadingNQAs(true);
    try {
      const response = await PlanoAmostragemService.buscarNQAsAtivos();
      if (response.success) {
        // Filtrar apenas NQAs que têm faixas cadastradas
        const nqasComFaixas = [];
        for (const nqa of response.data || []) {
          const faixasResponse = await PlanoAmostragemService.buscarFaixasPorNQA(nqa.id);
          if (faixasResponse.success && faixasResponse.data && faixasResponse.data.length > 0) {
            nqasComFaixas.push(nqa);
          }
        }
        setNqas(nqasComFaixas);
      }
    } catch (error) {
      console.error('Erro ao carregar NQAs:', error);
    } finally {
      setLoadingNQAs(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Grupo ao NQA"
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          grupo_id: parseInt(formData.get('grupo_id')),
          nqa_id: parseInt(formData.get('nqa_id')),
          observacoes: formData.get('observacoes')
        };
        onSubmit(data);
      }} className="space-y-4">
        <Input
          label="Grupo de Produto *"
          name="grupo_id"
          type="select"
          required
          disabled={loadingGrupos}
        >
          <option value="">Selecione um grupo</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.codigo} - {grupo.nome}
            </option>
          ))}
        </Input>

        <Input
          label="NQA *"
          name="nqa_id"
          type="select"
          required
          disabled={loadingNQAs}
        >
          <option value="">Selecione um NQA</option>
          {nqas.map(nqa => (
            <option key={nqa.id} value={nqa.id}>
              {nqa.codigo} - {nqa.nome} ({nqa.nivel_inspecao})
            </option>
          ))}
        </Input>

        <Input
          label="Observações"
          name="observacoes"
          type="textarea"
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button type="submit" variant="primary" size="lg">
            Vincular Grupo
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VincularGrupoModal;

