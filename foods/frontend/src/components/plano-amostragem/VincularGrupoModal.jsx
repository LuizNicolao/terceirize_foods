import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import GruposService from '../../services/grupos';
import PlanoAmostragemService from '../../services/planoAmostragem';

const VincularGrupoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [grupos, setGrupos] = useState([]);
  const [nqas, setNqas] = useState([]);
  const [gruposVinculados, setGruposVinculados] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingNQAs, setLoadingNQAs] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [nqaSelecionado, setNqaSelecionado] = useState(null);

  useEffect(() => {
    if (isOpen) {
      carregarGrupos();
      carregarNQAs();
      carregarGruposVinculados();
    } else {
      setGrupoSelecionado(null);
      setNqaSelecionado(null);
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

  const carregarGruposVinculados = async () => {
    try {
      const response = await PlanoAmostragemService.listarTodosVinculos();
      if (response.success) {
        setGruposVinculados(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos vinculados:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Grupo ao NQA"
      size="lg"
    >
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          grupo_id: grupoSelecionado ? parseInt(grupoSelecionado) : null,
          nqa_id: nqaSelecionado ? parseInt(nqaSelecionado) : null,
          observacoes: formData.get('observacoes')
        };
        
        if (!data.grupo_id || !data.nqa_id) {
          return;
        }
        
        const result = await onSubmit(data);
        if (result && result.success) {
          setGrupoSelecionado(null);
          setNqaSelecionado(null);
          // Recarregar grupos vinculados para atualizar o filtro
          await carregarGruposVinculados();
        }
      }} className="space-y-4">
        <SearchableSelect
          label="Grupo de Produto *"
          value={grupoSelecionado || ''}
          onChange={(value) => setGrupoSelecionado(value || null)}
          options={grupos
            .filter(grupo => {
              // Filtrar grupos que já estão vinculados a algum NQA
              const grupoJaVinculado = gruposVinculados.some(
                vinculo => vinculo.grupo_id === grupo.id
              );
              return !grupoJaVinculado;
            })
            .map(grupo => ({
              value: grupo.id,
              label: `${grupo.codigo} - ${grupo.nome}`,
              description: grupo.descricao || 'Sem descrição'
            }))}
          placeholder="Digite para buscar um grupo..."
          disabled={loadingGrupos}
          required
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

        <SearchableSelect
          label="NQA *"
          value={nqaSelecionado || ''}
          onChange={(value) => setNqaSelecionado(value || null)}
          options={nqas.map(nqa => ({
            value: nqa.id,
            label: `${nqa.codigo} - ${nqa.nome}`,
            description: `Nível: ${nqa.nivel_inspecao}`
          }))}
          placeholder="Digite para buscar um NQA..."
          disabled={loadingNQAs}
          required
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

