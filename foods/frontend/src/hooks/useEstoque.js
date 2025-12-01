import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import EstoqueService from '../services/estoqueService';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useEstoque = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('almoxarifado-estoque', EstoqueService, {
    initialItemsPerPage: 20,
    initialFilters: { almoxarifadoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({ 
    almoxarifadoFilter: 'todos', 
    filialFilter: 'todos',
    grupoFilter: 'todos',
    subgrupoFilter: 'todos'
  });

  // Estados para dados auxiliares (para os filtros)
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);

  // Estado para termo de busca visual (o que o usuário digita)
  const [searchTermVisual, setSearchTermVisual] = useState('');
  
  // Estado para termo de busca aplicado (usado na busca real)
  const [searchTermApplied, setSearchTermApplied] = useState('');

  // Hook de ordenação híbrida
  const {
    sortedData: estoquesOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Extrair almoxarifados únicos dos estoques
  const almoxarifados = useMemo(() => {
    const estoquesList = isSortingLocally ? estoquesOrdenados : baseEntity.items;
    if (!Array.isArray(estoquesList) || estoquesList.length === 0) {
      return [];
    }
    
    const almoxarifadosMap = new Map();
    estoquesList.forEach(estoque => {
      if (estoque.almoxarifado_id && estoque.almoxarifado_nome) {
        if (!almoxarifadosMap.has(estoque.almoxarifado_id)) {
          almoxarifadosMap.set(estoque.almoxarifado_id, {
            id: estoque.almoxarifado_id,
            nome: estoque.almoxarifado_nome,
            codigo: estoque.almoxarifado_codigo
          });
        }
      }
    });
    
    return Array.from(almoxarifadosMap.values()).sort((a, b) => 
      (a.nome || '').localeCompare(b.nome || '')
    );
  }, [baseEntity.items, estoquesOrdenados, isSortingLocally]);

  // Extrair grupos únicos dos estoques
  const grupos = useMemo(() => {
    const estoquesList = isSortingLocally ? estoquesOrdenados : baseEntity.items;
    if (!Array.isArray(estoquesList) || estoquesList.length === 0) {
      return [];
    }
    
    const gruposMap = new Map();
    estoquesList.forEach(estoque => {
      if (estoque.grupo_id && estoque.grupo_nome) {
        if (!gruposMap.has(estoque.grupo_id)) {
          gruposMap.set(estoque.grupo_id, {
            id: estoque.grupo_id,
            nome: estoque.grupo_nome
          });
        }
      }
    });
    
    return Array.from(gruposMap.values()).sort((a, b) => 
      (a.nome || '').localeCompare(b.nome || '')
    );
  }, [baseEntity.items, estoquesOrdenados, isSortingLocally]);

  /**
   * Carrega dados com filtros customizados
   */
  // Função auxiliar para processar dados da API
  const processData = useCallback((response) => {
    // Tentar diferentes estruturas de resposta
    if (response?.data?.data?.items && Array.isArray(response.data.data.items)) {
      return response.data.data.items;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    // Se não é array, retornar array vazio
    console.warn('Resposta da API não é um array:', response);
    return [];
  }, []);

  /**
   * Carrega filiais para o filtro
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const response = await api.get('/filiais?limit=1000&status=1');
      setFiliais(processData(response));
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  }, [processData]);

  // Filtrar subgrupos do estoque quando um grupo está selecionado
  const subgrupos = useMemo(() => {
    const estoquesList = isSortingLocally ? estoquesOrdenados : baseEntity.items;
    if (!Array.isArray(estoquesList) || estoquesList.length === 0) {
      return [];
    }
    
    const grupoFilterId = customFilters.filters.grupoFilter;
    if (!grupoFilterId || grupoFilterId === 'todos') {
      // Se nenhum grupo está selecionado, retornar todos os subgrupos do estoque
      const subgruposMap = new Map();
      estoquesList.forEach(estoque => {
        if (estoque.subgrupo_id && estoque.subgrupo_nome) {
          if (!subgruposMap.has(estoque.subgrupo_id)) {
            subgruposMap.set(estoque.subgrupo_id, {
              id: estoque.subgrupo_id,
              nome: estoque.subgrupo_nome,
              grupo_id: estoque.grupo_id
            });
          }
        }
      });
      return Array.from(subgruposMap.values()).sort((a, b) => 
        (a.nome || '').localeCompare(b.nome || '')
      );
    } else {
      // Se um grupo está selecionado, retornar apenas subgrupos desse grupo no estoque
      const subgruposMap = new Map();
      estoquesList.forEach(estoque => {
        if (
          estoque.subgrupo_id && 
          estoque.subgrupo_nome && 
          estoque.grupo_id && 
          estoque.grupo_id.toString() === grupoFilterId.toString()
        ) {
          if (!subgruposMap.has(estoque.subgrupo_id)) {
            subgruposMap.set(estoque.subgrupo_id, {
              id: estoque.subgrupo_id,
              nome: estoque.subgrupo_nome,
              grupo_id: estoque.grupo_id
            });
          }
        }
      });
      return Array.from(subgruposMap.values()).sort((a, b) => 
        (a.nome || '').localeCompare(b.nome || '')
      );
    }
  }, [baseEntity.items, estoquesOrdenados, isSortingLocally, customFilters.filters.grupoFilter]);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: searchTermApplied || undefined,
      almoxarifado_id: customFilters.filters.almoxarifadoFilter !== 'todos' ? customFilters.filters.almoxarifadoFilter : undefined,
      filial_id: customFilters.filters.filialFilter !== 'todos' ? customFilters.filters.filialFilter : undefined,
      grupo_id: customFilters.filters.grupoFilter !== 'todos' ? customFilters.filters.grupoFilter : undefined,
      subgrupo_id: customFilters.filters.subgrupoFilter !== 'todos' ? customFilters.filters.subgrupoFilter : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters, searchTermApplied]);

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
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    setSearchTermVisual('');
    setSearchTermApplied('');
    customFilters.updateFilter('almoxarifadoFilter', 'todos');
    customFilters.updateFilter('filialFilter', 'todos');
    customFilters.updateFilter('grupoFilter', 'todos');
    customFilters.updateFilter('subgrupoFilter', 'todos');
    baseEntity.handlePageChange(1);
    // A busca será executada automaticamente pelo useEffect quando searchTermApplied mudar
  }, [customFilters, baseEntity]);

  const getStatusLabel = useCallback((status) => {
    const statusMap = {
      'ATIVO': 'Ativo',
      'BLOQUEADO': 'Bloqueado',
      'INATIVO': 'Inativo'
    };
    return statusMap[status] || status;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const formatCurrency = useCallback((value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const formatNumber = useCallback((value, decimals = 3) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, []);

  /**
   * Visualizar estoque (busca dados completos)
   */
  const handleViewEstoque = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await EstoqueService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar estoque');
      }
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar estoque (busca dados completos)
   */
  const handleEditEstoque = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await EstoqueService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar estoque');
      }
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Aplicar o termo de busca visual ao termo aplicado
      setSearchTermApplied(searchTermVisual);
      baseEntity.handlePageChange(1); // Reset para primeira página
    }
  }, [searchTermVisual, baseEntity]);

  // Função para atualizar o termo de busca visual
  const handleSearchTermChange = useCallback((value) => {
    setSearchTermVisual(value);
  }, []);

  // Carregar filiais na inicialização
  useEffect(() => {
    loadFiliais();
  }, [loadFiliais]);

  // Carregar dados quando filtros ou paginação mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [
    searchTermApplied,
    customFilters.filters.almoxarifadoFilter,
    customFilters.filters.filialFilter,
    customFilters.filters.grupoFilter,
    customFilters.filters.subgrupoFilter,
    baseEntity.currentPage,
    baseEntity.itemsPerPage
  ]);

  return {
    // Estados principais (do hook base)
    estoques: isSortingLocally ? estoquesOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    handleSort,
    
    // Estados de modal e visualização
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingEstoque: baseEntity.editingItem,
    
    // Estados de validação
    showValidationModal: baseEntity.showValidationModal,
    validationErrors: baseEntity.validationErrors,
    fieldErrors: baseEntity.fieldErrors,
    
    // Estados de paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: searchTermVisual,
    filialFilter: customFilters.filters.filialFilter,
    filiais,
    loadingFiliais,
    almoxarifadoFilter: customFilters.filters.almoxarifadoFilter,
    almoxarifados,
    grupoFilter: customFilters.filters.grupoFilter,
    grupos,
    subgrupoFilter: customFilters.filters.subgrupoFilter,
    subgrupos,
    
    // Estatísticas
    estatisticas: baseEntity.statistics,
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    estoqueToDelete: baseEntity.itemToDelete,
    
    // Funções
    onSubmit: onSubmitCustom,
    handleDeleteEstoque: baseEntity.handleDelete,
    confirmDeleteEstoque: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleViewEstoque,
    handleEditEstoque,
    handleCloseModal: baseEntity.handleCloseModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    setSearchTerm: handleSearchTermChange,
    handleKeyPress,
    setFilialFilter: (value) => customFilters.updateFilter('filialFilter', value),
    setAlmoxarifadoFilter: (value) => customFilters.updateFilter('almoxarifadoFilter', value),
    setGrupoFilter: (value) => {
      customFilters.updateFilter('grupoFilter', value);
      // Limpar subgrupo quando grupo mudar
      if (value === 'todos' || !value) {
        customFilters.updateFilter('subgrupoFilter', 'todos');
      }
    },
    setSubgrupoFilter: (value) => customFilters.updateFilter('subgrupoFilter', value),
    handleClearFilters,
    formatDate,
    formatCurrency,
    formatNumber,
    getStatusLabel,
    carregarEstoques: loadDataWithFilters,
    clearFieldError: baseEntity.clearFieldError,
    getFieldError: baseEntity.getFieldError
  };
};

