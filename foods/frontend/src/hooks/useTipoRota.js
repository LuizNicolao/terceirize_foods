import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import TipoRotaService from '../services/tipoRota';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useTipoRota = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('tipo_rota', TipoRotaService, {
    initialItemsPerPage: 20,
    initialFilters: { filialFilter: 'todos', grupoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: tipoRotasOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Estados específicos dos tipos de rota
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  // Estados de estatísticas específicas
  const [estatisticasTipoRotas, setEstatisticasTipoRotas] = useState({
    total_tipo_rotas: 0,
    tipo_rotas_ativas: 0,
    tipo_rotas_inativas: 0,
    total_filiais: 0,
    total_grupos: 0,
    total_unidades_vinculadas: 0
  });

  /**
   * Carrega filiais
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const response = await api.get('/filiais');
      setFiliais(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  }, []);

  /**
   * Carrega grupos ativos
   */
  const loadGrupos = useCallback(async () => {
    try {
      setLoadingGrupos(true);
      const response = await api.get('/grupos/ativos', { params: { limit: 1000, dropdown: true } });
      setGrupos(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setGrupos([]);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  /**
   * Carrega estatísticas específicas
   */
  const loadEstatisticasTipoRotas = useCallback(async () => {
    try {
      const result = await TipoRotaService.buscarEstatisticas();
      if (result.success) {
        const stats = result.data || {};
        setEstatisticasTipoRotas({
          total_tipo_rotas: parseInt(stats.total_tipo_rotas) || 0,
          tipo_rotas_ativas: parseInt(stats.tipo_rotas_ativas) || 0,
          tipo_rotas_inativas: parseInt(stats.tipo_rotas_inativas) || 0,
          total_filiais: parseInt(stats.total_filiais) || 0,
          total_grupos: parseInt(stats.total_grupos) || 0,
          total_unidades_vinculadas: parseInt(stats.total_unidades_vinculadas) || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);


  /**
   * Submissão customizada que recarrega estatísticas
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
    await loadEstatisticasTipoRotas();
  }, [baseEntity, loadEstatisticasTipoRotas]);

  /**
   * Exclusão customizada que recarrega estatísticas e trata erros de vínculo
   */
  const handleDeleteCustom = useCallback(async () => {
    if (!baseEntity.itemToDelete) return;

    try {
      const TipoRotaService = (await import('../services/tipoRota')).default;
      const response = await TipoRotaService.excluir(baseEntity.itemToDelete.id);

      if (response.success) {
        toast.success(response.message || 'Tipo de rota excluído com sucesso!');
        baseEntity.setShowDeleteConfirmModal(false);
        baseEntity.setItemToDelete(null);
        await baseEntity.loadData();
        await loadEstatisticasTipoRotas();
      } else {
        // Verificar se há detalhes sobre rotas vinculadas
        if (response.details?.rotasVinculadas && response.details.rotasVinculadas.length > 0) {
          const rotasList = response.details.rotasVinculadas
            .map(r => `• "${r.nome}" (${r.codigo})`)
            .join('\n');
          
          toast.error(
            `${response.message}\n\nRotas vinculadas:\n${rotasList}`,
            {
              duration: 6000,
              style: {
                whiteSpace: 'pre-line',
                maxWidth: '500px'
              }
            }
          );
        } else {
          toast.error(response.message || response.error || 'Erro ao excluir tipo de rota');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de rota:', error);
      
      // Tratar erro de resposta com detalhes
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details?.rotasVinculadas && errorData.details.rotasVinculadas.length > 0) {
          const rotasList = errorData.details.rotasVinculadas
            .map(r => `• "${r.nome}" (${r.codigo})`)
            .join('\n');
          
          toast.error(
            `${errorData.message}\n\nRotas vinculadas:\n${rotasList}`,
            {
              duration: 6000,
              style: {
                whiteSpace: 'pre-line',
                maxWidth: '500px'
              }
            }
          );
        } else {
          toast.error(errorData.message || errorData.error || 'Erro ao excluir tipo de rota');
        }
      } else {
        toast.error('Erro ao excluir tipo de rota');
      }
    }
  }, [baseEntity, loadEstatisticasTipoRotas]);

  /**
   * Handlers customizados para modais
   */
  const handleViewTipoRota = useCallback((tipoRota) => {
    baseEntity.handleView(tipoRota);
  }, [baseEntity]);

  const handleEditTipoRota = useCallback((tipoRota) => {
    baseEntity.handleEdit(tipoRota);
  }, [baseEntity]);

  const handleCloseModalCustom = useCallback(() => {
    baseEntity.handleCloseModal();
  }, [baseEntity]);

  /**
   * Funções utilitárias
   */
  const getFilialName = useCallback((filialId) => {
    if (!filialId) return 'N/A';
    const filial = filiais.find(f => f.id === parseInt(filialId));
    return filial ? filial.filial : 'Filial não encontrada';
  }, [filiais]);

  const getGrupoName = useCallback((grupoId) => {
    if (!grupoId) return 'N/A';
    const grupo = grupos.find(g => g.id === parseInt(grupoId));
    return grupo ? grupo.nome : 'Grupo não encontrado';
  }, [grupos]);

  // Carregar dados iniciais
  useEffect(() => {
    loadFiliais();
    loadGrupos();
    loadEstatisticasTipoRotas();
  }, [loadFiliais, loadGrupos, loadEstatisticasTipoRotas]);

  return {
    // Estados principais
    tipoRotas: isSortingLocally ? tipoRotasOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
    estatisticas: estatisticasTipoRotas,
    
    // Estados de modal
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingTipoRota: baseEntity.editingItem,
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    tipoRotaToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    filialFilter: baseEntity.filters.filialFilter,
    grupoFilter: baseEntity.filters.grupoFilter,
    
    // Estados de validação
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados específicos
    filiais,
    loadingFiliais,
    grupos,
    loadingGrupos,
    
    // Ações de modal
    handleAddTipoRota: baseEntity.handleAdd,
    handleViewTipoRota,
    handleEditTipoRota,
    handleCloseModal: handleCloseModalCustom,
    
    // Ações de paginação
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setFilialFilter: (value) => baseEntity.updateFilter('filialFilter', value),
    setGrupoFilter: (value) => baseEntity.updateFilter('grupoFilter', value),
    
    // Ações de CRUD
    onSubmit: onSubmitCustom,
    handleDeleteTipoRota: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    getFilialName,
    getGrupoName,
    
    // Ações de ordenação
    handleSort
  };
};

