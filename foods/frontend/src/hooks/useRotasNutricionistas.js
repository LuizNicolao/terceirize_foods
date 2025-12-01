import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RotasNutricionistasService from '../services/rotasNutricionistas';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useRotasNutricionistas = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('rotas-nutricionistas', RotasNutricionistasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({ filialFilter: 'todos' });

  // Estados para dados relacionados
  const [usuarios, setUsuarios] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async (customParams = {}) => {
    // Obter parâmetros de filtros customizados (sem status, pois vamos tratar separadamente)
    const filterParams = customFilters.getFilterParams();
    // Remover status do filterParams se existir, pois vamos tratar separadamente
    delete filterParams.status;
    
    const params = {
      ...baseEntity.getPaginationParams(),
      ...filterParams,
      search: customFilters.searchTerm || undefined,
      // Só enviar status se for 'ativo' ou 'inativo', não enviar se for 'todos' ou vazio
      // O backend espera string 'ativo' ou 'inativo', não número
      status: (customFilters.statusFilter && customFilters.statusFilter !== 'todos' && customFilters.statusFilter !== '') 
        ? customFilters.statusFilter 
        : undefined,
      usuario_id: customFilters.filters.usuarioFilter || undefined,
      supervisor_id: customFilters.filters.supervisorFilter || undefined,
      coordenador_id: customFilters.filters.coordenadorFilter || undefined,
      // Incluir parâmetros de ordenação do baseEntity se disponíveis
      sortField: customParams.sortField !== undefined ? customParams.sortField : baseEntity.sortField || undefined,
      sortDirection: customParams.sortDirection !== undefined ? customParams.sortDirection : baseEntity.sortDirection || undefined,
      ...customParams
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  // Hook de ordenação híbrida (depois de loadDataWithFilters para poder usá-lo no callback)
  // Usar itemsPerPage como threshold para garantir ordenação no backend quando há paginação
  const {
    sortedData: rotasOrdenadas,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: baseEntity.itemsPerPage || 20, // Usar itemsPerPage para garantir ordenação no backend quando há paginação
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      // Atualizar estados de ordenação no baseEntity
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      // Recarregar dados com nova ordenação, mantendo filtros customizados
      loadDataWithFilters({ sortField: field, sortDirection: direction });
    }
  });

  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
  }, [baseEntity]);

  /**
   * Carregar filiais para o filtro
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const response = await FiliaisService.buscarAtivas();
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : [];
        setFiliais(items);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  }, []);

  /**
   * Carregar usuários, supervisores e coordenadores
   */
  const loadUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      
      // Buscar usuários por tipo e unidades escolares
      const [usuariosResult, unidadesResult] = await Promise.all([
        RotasNutricionistasService.buscarUsuarios(),
        RotasNutricionistasService.buscarUnidadesEscolares()
      ]);
      
      if (usuariosResult.success) {
        // Garantir que sempre sejam arrays
        const usuarios = Array.isArray(usuariosResult.data.usuarios) ? usuariosResult.data.usuarios : [];
        const supervisores = Array.isArray(usuariosResult.data.supervisores) ? usuariosResult.data.supervisores : usuarios;
        const coordenadores = Array.isArray(usuariosResult.data.coordenadores) ? usuariosResult.data.coordenadores : usuarios;
        
        setUsuarios(usuarios);
        setSupervisores(supervisores);
        setCoordenadores(coordenadores);
      } else {
        // Em caso de erro, garantir arrays vazios
        setUsuarios([]);
        setSupervisores([]);
        setCoordenadores([]);
      }
      
      // Carregar unidades escolares
      if (unidadesResult.success) {
        setUnidadesEscolares(unidadesResult.data);
      } else {
        setUnidadesEscolares([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
      setSupervisores([]);
      setCoordenadores([]);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  /**
   * Filtrar usuários por filial
   */
  const filtrarUsuariosPorFilial = useCallback(async (tipo, filialId) => {
    if (!filialId) return [];
    
    try {
      const result = await RotasNutricionistasService.buscarUsuariosPorTipoEFilial(tipo, filialId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error(`Erro ao filtrar usuários do tipo ${tipo} por filial:`, error);
      return [];
    }
  }, []);

  /**
   * Filtrar unidades escolares por filial
   */
  const filtrarUnidadesEscolaresPorFilial = useCallback(async (filialId) => {
    if (!filialId) return [];
    
    try {
      const result = await RotasNutricionistasService.buscarUnidadesEscolaresPorFilial(filialId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error(`Erro ao filtrar unidades escolares por filial:`, error);
      return [];
    }
  }, []);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    customFilters.updateFilter('usuarioFilter', '');
    customFilters.updateFilter('supervisorFilter', '');
    customFilters.updateFilter('coordenadorFilter', '');
    customFilters.updateFilter('filialFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

  // Carregar usuários e filiais na inicialização
  useEffect(() => {
    loadUsuarios();
    loadFiliais();
  }, [loadUsuarios, loadFiliais]);

  // Carregar dados quando filtros ou paginação mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [
    customFilters.searchTerm,
    customFilters.statusFilter,
    customFilters.filters.usuarioFilter,
    customFilters.filters.supervisorFilter,
    customFilters.filters.coordenadorFilter,
    customFilters.filters.filialFilter,
    baseEntity.currentPage,
    baseEntity.itemsPerPage
  ]);

  return {
    // Estados principais (do hook base)
    rotas: isSortingLocally ? rotasOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    handleSort,
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    selectedRota: baseEntity.editingItem,
    modalMode: baseEntity.viewMode ? 'view' : (baseEntity.editingItem ? 'edit' : 'create'),
    
    // Estados de exclusão (do hook base)
    showDeleteModal: baseEntity.showDeleteConfirmModal,
    rotaToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: customFilters.searchTerm || baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter || '',
    usuarioFilter: customFilters.filters.usuarioFilter || '',
    supervisorFilter: customFilters.filters.supervisorFilter || '',
    coordenadorFilter: customFilters.filters.coordenadorFilter || '',
    filialFilter: customFilters.filters.filialFilter || 'todos',
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados para dados relacionados
    usuarios,
    supervisores,
    coordenadores,
    unidadesEscolares,
    filiais,
    loadingUsuarios,
    loadingFiliais,
    
    // Estados de estatísticas
    estatisticas: baseEntity.estatisticas,
    
    // Ações de modal (customizadas)
    openCreateModal: baseEntity.handleAdd,
    openViewModal: (rota) => baseEntity.handleView(rota),
    openEditModal: (rota) => baseEntity.handleEdit(rota),
    closeModal: baseEntity.handleCloseModal,
    handleSave: onSubmitCustom,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    handleLimitChange: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    
    // Ações de filtros
    handleSearch: customFilters.setSearchTerm,
    setSearchTerm: customFilters.setSearchTerm,
    handleKeyPress,
    handleStatusFilter: customFilters.setStatusFilter,
    handleUsuarioFilter: (value) => {
      customFilters.updateFilter('usuarioFilter', value);
      baseEntity.handlePageChange(1);
    },
    handleSupervisorFilter: (value) => {
      customFilters.updateFilter('supervisorFilter', value);
      baseEntity.handlePageChange(1);
    },
    handleCoordenadorFilter: (value) => {
      customFilters.updateFilter('coordenadorFilter', value);
      baseEntity.handlePageChange(1);
    },
    handleFilialFilter: (value) => {
      customFilters.updateFilter('filialFilter', value);
      baseEntity.handlePageChange(1);
    },
    setFilialFilter: (value) => customFilters.updateFilter('filialFilter', value),
    clearFilters: handleClearFilters,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDelete: handleDeleteCustom,
    openDeleteModal: baseEntity.handleDelete,
    closeDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções de carregamento
    loadUsuarios,
    loadRotas: loadDataWithFilters,
    
    // Filtros inteligentes
    filtrarUsuariosPorFilial,
    filtrarUnidadesEscolaresPorFilial,
    
    // Estados adicionais para compatibilidade
    saving: baseEntity.loading,
    error: null
  };
};

