import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutosService from '../services/produtos';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useProdutos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('produtos', ProdutosService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para produtos
  const customFilters = useFilters({});

  // Hook de busca com debounce
  
  // Hook de ordenação híbrida
  const {
    sortedData: produtosOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });
  
  // Estados de dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [produtoGenerico, setProdutoGenerico] = useState([]);
  const [produtoOrigem, setProdutoOrigem] = useState([]);

  // Estados de estatísticas específicas dos produtos
  const [estatisticasProdutos, setEstatisticasProdutos] = useState({
    total_produtos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    grupos_diferentes: 0
  });

  /**
   * Carrega dados auxiliares
   */
  const loadAuxiliaryData = useCallback(async () => {
    try {
      const [gruposRes, subgruposRes, classesRes, unidadesRes, marcasRes, produtoGenericoRes, produtoOrigemRes] = await Promise.all([
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/unidades?limit=1000'),
        api.get('/marcas?limit=1000'),
        api.get('/produto-generico?limit=1000'),
        api.get('/produto-origem?limit=1000')
      ]);

      // Processar dados auxiliares
      const processData = (response) => {
        if (response.data?.data?.items) return response.data.data.items;
        if (response.data?.data) return response.data.data;
        return response.data || [];
      };

      setGrupos(processData(gruposRes));
      setSubgrupos(processData(subgruposRes));
      setClasses(processData(classesRes));
      setUnidades(processData(unidadesRes));
      setMarcas(processData(marcasRes));
      setProdutoGenerico(processData(produtoGenericoRes));
      setProdutoOrigem(processData(produtoOrigemRes));
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  }, []);

  /**
   * Calcula estatísticas específicas dos produtos
   */
  const calculateEstatisticas = useCallback((produtos) => {
    if (!produtos || produtos.length === 0) {
      setEstatisticasProdutos({
        total_produtos: 0,
        produtos_ativos: 0,
        produtos_inativos: 0,
        grupos_diferentes: 0
      });
      return;
    }

    const total = produtos.length;
    const ativos = produtos.filter(p => p.status === 1).length;
    const inativos = produtos.filter(p => p.status === 0).length;
    const gruposUnicos = new Set(produtos.map(p => p.grupo_id)).size;

    setEstatisticasProdutos({
          total_produtos: total,
          produtos_ativos: ativos,
          produtos_inativos: inativos,
          grupos_diferentes: gruposUnicos
        });
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
    // Recalcular estatísticas após salvar
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Funções auxiliares
   */
  const getGrupoName = useCallback((grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : '-';
  }, [grupos]);

  const getUnidadeName = useCallback((unidadeId) => {
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : '-';
  }, [unidades]);

  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    loadAuxiliaryData();
  }, [loadAuxiliaryData]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (usa dados ordenados se ordenação local)
    produtos: isSortingLocally ? produtosOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasProdutos, // Usar estatísticas específicas dos produtos
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingProduto: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    produtoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de dados auxiliares
    grupos,
    subgrupos,
    classes,
    unidades,
    marcas,
    produtoGenerico,
    produtoOrigem,
    
    // Ações de modal (do hook base)
    handleAddProduto: baseEntity.handleAdd,
    handleViewProduto: baseEntity.handleView,
    handleEditProduto: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    handleClearFilters,
    
    // Ações de ordenação
    handleSort,
    
    // Ações de CRUD (customizadas)
    handleSubmitProduto: onSubmitCustom,
    handleDeleteProduto: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções auxiliares
    getGrupoName,
    getUnidadeName
  };
};