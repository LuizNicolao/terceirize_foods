import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PeriodosRefeicaoService from '../services/periodosRefeicao';
import UnidadesEscolaresService from '../services/unidadesEscolares';

export const usePeriodosRefeicaoUnidade = (unidadeEscolarId) => {
  // Estados principais
  const [periodosVinculados, setPeriodosVinculados] = useState([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState(null);

  // Carregar períodos de refeição
  const loadPeriodosRefeicao = async () => {
    if (!unidadeEscolarId) return;
    
    setLoading(true);
    try {
      // Carregar períodos vinculados à unidade
      const vinculadosResult = await UnidadesEscolaresService.getPeriodosRefeicao(unidadeEscolarId);
      if (vinculadosResult.success) {
        setPeriodosVinculados(vinculadosResult.data || []);
      }

      // Carregar períodos disponíveis para a filial da unidade
      // Primeiro precisamos buscar a unidade para obter o filial_id
      const unidadeResult = await UnidadesEscolaresService.buscarPorId(unidadeEscolarId);
      if (unidadeResult.success && unidadeResult.data.filial_id) {
        const disponiveisResult = await PeriodosRefeicaoService.listarPorFilial(unidadeResult.data.filial_id);
        if (disponiveisResult.success) {
          const disponiveis = disponiveisResult.data || [];
          // Filtrar apenas os que não estão vinculados
          const naoVinculados = disponiveis.filter(periodo => 
            !vinculadosResult.data?.some(vinculado => vinculado.id === periodo.id)
          );
          setPeriodosDisponiveis(naoVinculados);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar períodos de refeição:', error);
      toast.error('Erro ao carregar períodos de refeição');
    } finally {
      setLoading(false);
    }
  };

  // Vincular período de refeição
  const handleAddPeriodo = async (periodo) => {
    try {
      const result = await UnidadesEscolaresService.vincularPeriodoRefeicao(unidadeEscolarId, periodo.id);
      if (result.success) {
        toast.success('Período de refeição vinculado com sucesso!');
        await loadPeriodosRefeicao();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao vincular período de refeição:', error);
      toast.error('Erro ao vincular período de refeição');
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeletePeriodo = (periodo) => {
    setPeriodoToDelete(periodo);
    setShowDeleteModal(true);
  };

  // Confirmar exclusão
  const confirmDeletePeriodo = async () => {
    if (!periodoToDelete) return;

    try {
      const result = await UnidadesEscolaresService.desvincularPeriodoRefeicao(unidadeEscolarId, periodoToDelete.id);
      if (result.success) {
        toast.success('Período de refeição desvinculado com sucesso!');
        await loadPeriodosRefeicao();
        setShowDeleteModal(false);
        setPeriodoToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao desvincular período de refeição:', error);
      toast.error('Erro ao desvincular período de refeição');
    }
  };

  // Fechar modal de confirmação
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPeriodoToDelete(null);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadPeriodosRefeicao();
  }, [unidadeEscolarId]);

  return {
    // Estados
    periodosVinculados,
    periodosDisponiveis,
    loading,
    showDeleteModal,
    periodoToDelete,
    
    // Funções
    handleAddPeriodo,
    handleDeletePeriodo,
    confirmDeletePeriodo,
    closeDeleteModal,
    loadPeriodosRefeicao
  };
};
