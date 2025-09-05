import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import TiposCardapioService from '../services/tiposCardapio';
import UnidadesEscolaresService from '../services/unidadesEscolares';

export const useTiposCardapioUnidade = (unidadeEscolarId) => {
  // Estados principais
  const [tiposVinculados, setTiposVinculados] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState(null);

  // Carregar tipos de cardápio
  const loadTiposCardapio = async () => {
    if (!unidadeEscolarId) return;
    
    setLoading(true);
    try {
      // Carregar tipos vinculados à unidade
      const vinculadosResult = await UnidadesEscolaresService.getTiposCardapio(unidadeEscolarId);
      if (vinculadosResult.success) {
        setTiposVinculados(vinculadosResult.data || []);
      }

      // Carregar tipos disponíveis para a filial da unidade
      // Primeiro precisamos buscar a unidade para obter o filial_id
      const unidadeResult = await UnidadesEscolaresService.buscarPorId(unidadeEscolarId);
      if (unidadeResult.success && unidadeResult.data.filial_id) {
        const disponiveisResult = await TiposCardapioService.listarPorFilial(unidadeResult.data.filial_id);
        if (disponiveisResult.success) {
          const disponiveis = disponiveisResult.data || [];
          // Filtrar apenas os que não estão vinculados
          const naoVinculados = disponiveis.filter(tipo => 
            !vinculadosResult.data?.some(vinculado => vinculado.id === tipo.id)
          );
          setTiposDisponiveis(naoVinculados);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de cardápio:', error);
      toast.error('Erro ao carregar tipos de cardápio');
    } finally {
      setLoading(false);
    }
  };

  // Vincular tipo de cardápio
  const handleAddTipo = async (tipo) => {
    try {
      const result = await UnidadesEscolaresService.vincularTipoCardapio(unidadeEscolarId, tipo.id);
      if (result.success) {
        toast.success('Tipo de cardápio vinculado com sucesso!');
        await loadTiposCardapio();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao vincular tipo de cardápio:', error);
      toast.error('Erro ao vincular tipo de cardápio');
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteTipo = (tipo) => {
    setTipoToDelete(tipo);
    setShowDeleteModal(true);
  };

  // Confirmar exclusão
  const confirmDeleteTipo = async () => {
    if (!tipoToDelete) return;

    try {
      const result = await UnidadesEscolaresService.desvincularTipoCardapio(unidadeEscolarId, tipoToDelete.id);
      if (result.success) {
        toast.success('Tipo de cardápio desvinculado com sucesso!');
        await loadTiposCardapio();
        setShowDeleteModal(false);
        setTipoToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao desvincular tipo de cardápio:', error);
      toast.error('Erro ao desvincular tipo de cardápio');
    }
  };

  // Fechar modal de confirmação
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTipoToDelete(null);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadTiposCardapio();
  }, [unidadeEscolarId]);

  return {
    // Estados
    tiposVinculados,
    tiposDisponiveis,
    loading,
    showDeleteModal,
    tipoToDelete,
    
    // Funções
    handleAddTipo,
    handleDeleteTipo,
    confirmDeleteTipo,
    closeDeleteModal,
    loadTiposCardapio
  };
};
