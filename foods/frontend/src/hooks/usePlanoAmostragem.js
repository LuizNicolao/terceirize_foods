import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PlanoAmostragemService from '../services/planoAmostragem';

export const usePlanoAmostragem = () => {
  const [nqas, setNqas] = useState([]);
  const [nqasLoading, setNqasLoading] = useState(false);
  const [faixasPorNQA, setFaixasPorNQA] = useState({});
  const [gruposPorNQA, setGruposPorNQA] = useState({});
  const [vinculos, setVinculos] = useState([]);
  const [showModalFaixa, setShowModalFaixa] = useState(false);
  const [showModalGrupo, setShowModalGrupo] = useState(false);
  const [showModalNQA, setShowModalNQA] = useState(false);
  const [editingFaixa, setEditingFaixa] = useState(null);
  const [editingNQA, setEditingNQA] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [nqaSelecionado, setNqaSelecionado] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  /**
   * Carregar todos os NQAs
   */
  const carregarNQAs = useCallback(async () => {
    setNqasLoading(true);
    try {
      const response = await PlanoAmostragemService.listarNQAs({ status: 1 });
      if (response.success) {
        setNqas(response.data || []);
      } else {
        toast.error(response.message || 'Erro ao carregar NQAs');
      }
    } catch (error) {
      console.error('Erro ao carregar NQAs:', error);
      toast.error('Erro ao carregar NQAs');
    } finally {
      setNqasLoading(false);
    }
  }, []);

  /**
   * Carregar faixas de um NQA específico
   */
  const carregarFaixasPorNQA = useCallback(async (nqa_id) => {
    try {
      const response = await PlanoAmostragemService.buscarFaixasPorNQA(nqa_id);
      if (response.success) {
        setFaixasPorNQA(prev => ({
          ...prev,
          [nqa_id]: response.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar faixas:', error);
    }
  }, []);

  /**
   * Carregar grupos de um NQA específico
   */
  const carregarGruposPorNQA = useCallback(async (nqa_id) => {
    try {
      const response = await PlanoAmostragemService.listarGruposPorNQA(nqa_id);
      if (response.success) {
        setGruposPorNQA(prev => ({
          ...prev,
          [nqa_id]: response.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  }, []);

  /**
   * Carregar todos os vínculos
   */
  const carregarVinculos = useCallback(async () => {
    try {
      const response = await PlanoAmostragemService.listarTodosVinculos();
      if (response.success) {
        setVinculos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar vínculos:', error);
    }
  }, []);

  /**
   * Carregar dados completos (NQAs, faixas e grupos)
   */
  const carregarDadosCompletos = useCallback(async () => {
    await carregarNQAs();
    await carregarVinculos();
    
    // Depois de carregar NQAs, carregar faixas e grupos de cada um
    const response = await PlanoAmostragemService.listarNQAs({ status: 1 });
    if (response.success && response.data) {
      const nqasList = response.data;
      for (const nqa of nqasList) {
        await carregarFaixasPorNQA(nqa.id);
        await carregarGruposPorNQA(nqa.id);
      }
    }
  }, [carregarNQAs, carregarFaixasPorNQA, carregarGruposPorNQA, carregarVinculos]);

  /**
   * Adicionar nova faixa
   */
  const handleAddFaixa = useCallback((nqa_id) => {
    setNqaSelecionado(nqa_id);
    setEditingFaixa(null);
    setViewMode(false);
    setShowModalFaixa(true);
  }, []);

  /**
   * Editar faixa
   */
  const handleEditFaixa = useCallback((faixa) => {
    setEditingFaixa(faixa);
    setViewMode(false);
    setShowModalFaixa(true);
  }, []);

  /**
   * Visualizar faixa
   */
  const handleViewFaixa = useCallback((faixa) => {
    setEditingFaixa(faixa);
    setViewMode(true);
    setShowModalFaixa(true);
  }, []);

  /**
   * Excluir faixa
   */
  const handleDeleteFaixa = useCallback(async (faixa) => {
    if (!window.confirm(`Tem certeza que deseja excluir esta faixa de amostragem?`)) {
      return;
    }

    try {
      const response = await PlanoAmostragemService.excluirFaixa(faixa.id);
      if (response.success) {
        toast.success('Faixa excluída com sucesso!');
        // Recarregar faixas do NQA
        await carregarFaixasPorNQA(faixa.nqa_id);
        // Recarregar dados completos para atualizar contadores
        await carregarDadosCompletos();
      } else {
        toast.error(response.message || 'Erro ao excluir faixa');
      }
    } catch (error) {
      console.error('Erro ao excluir faixa:', error);
      toast.error('Erro ao excluir faixa');
    }
  }, [carregarFaixasPorNQA, carregarDadosCompletos]);

  /**
   * Salvar faixa (criar ou atualizar)
   */
  const handleSaveFaixa = useCallback(async (data) => {
    try {
      let response;
      if (editingFaixa) {
        response = await PlanoAmostragemService.atualizarFaixa(editingFaixa.id, data);
      } else {
        // Verificar se NQA existe, se não, criar automaticamente
        if (data.nqa_codigo && !data.nqa_id) {
          const nqaResponse = await PlanoAmostragemService.criarNQAAutomatico(data.nqa_codigo);
          if (nqaResponse.success) {
            data.nqa_id = nqaResponse.data.id;
          } else {
            toast.error(nqaResponse.message || 'Erro ao criar NQA automaticamente');
            return nqaResponse;
          }
        }
        
        if (!data.nqa_id) {
          toast.error('NQA é obrigatório');
          return { success: false, message: 'NQA é obrigatório' };
        }
        
        response = await PlanoAmostragemService.criarFaixa(data);
      }

      if (response.success) {
        toast.success(response.message || 'Faixa salva com sucesso!');
        setShowModalFaixa(false);
        setEditingFaixa(null);
        setValidationErrors(null);
        setShowValidationModal(false);
        
        // Recarregar dados
        const nqaId = data.nqa_id || editingFaixa?.nqa_id;
        if (nqaId) {
          await carregarFaixasPorNQA(nqaId);
          await carregarDadosCompletos();
        }
        return response;
      } else {
        // Se houver erros de validação, mostrar modal
        if (response.validationErrors) {
          setValidationErrors(response);
          setShowValidationModal(true);
        } else {
          toast.error(response.message || 'Erro ao salvar faixa');
        }
        return response;
      }
    } catch (error) {
      console.error('Erro ao salvar faixa:', error);
      toast.error('Erro ao salvar faixa');
      return { success: false };
    }
  }, [editingFaixa, carregarFaixasPorNQA, carregarDadosCompletos]);

  /**
   * Vincular grupo
   */
  const handleVincularGrupo = useCallback(() => {
    setEditingFaixa(null);
    setShowModalGrupo(true);
  }, []);

  /**
   * Salvar vinculação de grupo
   */
  const handleSaveVinculoGrupo = useCallback(async (data) => {
    try {
      const response = await PlanoAmostragemService.vincularGrupo(data);
      if (response.success) {
        toast.success(response.message || 'Grupo vinculado com sucesso!');
        setShowModalGrupo(false);
        await carregarDadosCompletos();
        return response;
      } else {
        toast.error(response.message || 'Erro ao vincular grupo');
        return response;
      }
    } catch (error) {
      console.error('Erro ao vincular grupo:', error);
      toast.error('Erro ao vincular grupo');
      return { success: false };
    }
  }, [carregarDadosCompletos]);

  /**
   * Adicionar novo NQA
   */
  const handleAddNQA = useCallback(() => {
    setEditingNQA(null);
    setViewMode(false);
    setShowModalNQA(true);
  }, []);

  /**
   * Editar NQA
   */
  const handleEditNQA = useCallback((nqa) => {
    setEditingNQA(nqa);
    setViewMode(false);
    setShowModalNQA(true);
  }, []);

  /**
   * Salvar NQA
   */
  const handleSaveNQA = useCallback(async (data) => {
    try {
      let response;
      if (editingNQA) {
        response = await PlanoAmostragemService.atualizarNQA(editingNQA.id, data);
      } else {
        response = await PlanoAmostragemService.criarNQA(data);
      }

      if (response.success) {
        toast.success(response.message || 'NQA salvo com sucesso!');
        setShowModalNQA(false);
        setEditingNQA(null);
        setValidationErrors(null);
        setShowValidationModal(false);
        await carregarDadosCompletos();
        return response;
      } else {
        // Se houver erros de validação, mostrar modal
        if (response.validationErrors) {
          setValidationErrors(response);
          setShowValidationModal(true);
        } else {
          toast.error(response.message || 'Erro ao salvar NQA');
        }
        return response;
      }
    } catch (error) {
      console.error('Erro ao salvar NQA:', error);
      toast.error('Erro ao salvar NQA');
      return { success: false };
    }
  }, [editingNQA, carregarDadosCompletos]);

  /**
   * Calcular estatísticas
   */
  const estatisticas = React.useMemo(() => {
    const totalNQAs = nqas.length;
    const nqasAtivos = nqas.filter(nqa => nqa.ativo === 1).length;
    let totalFaixas = 0;
    let totalGrupos = 0;

    Object.values(faixasPorNQA).forEach(faixas => {
      totalFaixas += faixas.length;
    });

    Object.values(gruposPorNQA).forEach(grupos => {
      totalGrupos += grupos.length;
    });

    return {
      total_nqas: totalNQAs,
      nqas_ativos: nqasAtivos,
      nqas_inativos: totalNQAs - nqasAtivos,
      total_faixas: totalFaixas,
      total_grupos: totalGrupos
    };
  }, [nqas, faixasPorNQA, gruposPorNQA]);

  /**
   * Carregar dados ao montar
   */
  useEffect(() => {
    carregarDadosCompletos();
  }, []);

  return {
    // Estados
    nqas,
    nqasLoading,
    faixasPorNQA,
    gruposPorNQA,
    vinculos,
    showModalFaixa,
    showModalGrupo,
    showModalNQA,
    editingFaixa,
    editingNQA,
    viewMode,
    nqaSelecionado,

    // Ações
    carregarNQAs,
    carregarDadosCompletos,
    handleAddFaixa,
    handleEditFaixa,
    handleViewFaixa,
    handleDeleteFaixa,
    handleSaveFaixa,
    handleVincularGrupo,
    handleSaveVinculoGrupo,
    handleAddNQA,
    handleEditNQA,
    handleSaveNQA,
    handleCloseValidationModal: () => {
      setShowValidationModal(false);
      setValidationErrors(null);
    },
    setShowModalFaixa,
    setShowModalGrupo,
    setShowModalNQA,
    validationErrors,
    showValidationModal,
    estatisticas
  };
};


