/**
 * Hook customizado para Produto Comercial
 * Gerencia estado e operações relacionadas a produtos comerciais
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutoComercialService from '../services/produtoComercial';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useProdutoComercial = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('produto-comercial', ProdutoComercialService, {
    initialItemsPerPage: 10,
    initialFilters: { 
      grupoFilter: 'todos', 
      subgrupoFilter: 'todos', 
      classeFilter: 'todos' 
    },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: produtosComerciaisOrdenados,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 50,
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      baseEntity.loadData({ sortField: field, sortDirection: direction });
    }
  });
  
  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;
  
  // Estados locais
  const [loading, setLoading] = useState(false);
  
  // Dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  /**
   * Carrega dados auxiliares
   */
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      // Buscar grupos do tipo venda diretamente do endpoint de produto-comercial
      const [gruposRes, subgruposRes, classesRes, unidadesRes] = await Promise.all([
        api.get('/produto-comercial/grupos'),
        api.get('/produto-comercial/subgrupos'),
        api.get('/produto-comercial/classes'),
        api.get('/produto-comercial/unidades-medida')
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
      setUnidadesMedida(processData(unidadesRes));
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  }, []);

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

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearSearch();
    baseEntity.setStatusFilter('todos');
    baseEntity.updateFilter('grupoFilter', '');
    baseEntity.updateFilter('subgrupoFilter', '');
    baseEntity.updateFilter('classeFilter', '');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  /**
   * Visualizar produto comercial (busca dados completos)
   */
  const handleViewProdutoComercial = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoComercialService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto comercial');
      }
    } catch (error) {
      console.error('Erro ao buscar produto comercial:', error);
      toast.error('Erro ao carregar dados do produto comercial');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar produto comercial (busca dados completos)
   */
  const handleEditProdutoComercial = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoComercialService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto comercial');
      }
    } catch (error) {
      console.error('Erro ao buscar produto comercial:', error);
      toast.error('Erro ao carregar dados do produto comercial');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  // Funções auxiliares para obter nomes
  const getGrupoName = useCallback((grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : '-';
  }, [grupos]);

  const getSubgrupoName = useCallback((subgrupoId) => {
    const subgrupo = subgrupos.find(sg => sg.id === subgrupoId);
    return subgrupo ? subgrupo.nome : '-';
  }, [subgrupos]);

  const getClasseName = useCallback((classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nome : '-';
  }, [classes]);

  const getUnidadeMedidaName = useCallback((unidadeId) => {
    const unidade = unidadesMedida.find(um => um.id === unidadeId);
    return unidade ? unidade.nome : '-';
  }, [unidadesMedida]);

  const getUnidadeMedidaSigla = useCallback((unidadeId) => {
    if (!unidadesMedida || unidadesMedida.length === 0) return '-';
    const unidade = unidadesMedida.find(um => um.id === unidadeId);
    return unidade ? unidade.sigla : '-';
  }, [unidadesMedida]);

  return {
    // Estados principais
    produtosComerciais: isSortingLocally ? produtosComerciaisOrdenados : baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: baseEntity.estatisticas,
    
    // Estados de modal
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingProdutoComercial: baseEntity.editingItem,
    produtoComercial: baseEntity.editingItem,
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    produtoComercialToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.statusFilter,
    grupoFilter: baseEntity.filters.grupoFilter,
    subgrupoFilter: baseEntity.filters.subgrupoFilter,
    classeFilter: baseEntity.filters.classeFilter,
    
    // Estados de validação
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de dados auxiliares
    grupos,
    subgrupos,
    classes,
    unidadesMedida,
    
    // Ações de modal
    handleAddProdutoComercial: baseEntity.handleAdd,
    handleViewProdutoComercial,
    handleEditProdutoComercial,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: baseEntity.handleKeyPress,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: baseEntity.setStatusFilter,
    setGrupoFilter: (value) => baseEntity.updateFilter('grupoFilter', value),
    setSubgrupoFilter: (value) => baseEntity.updateFilter('subgrupoFilter', value),
    setClasseFilter: (value) => baseEntity.updateFilter('classeFilter', value),
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    
    // Ações de CRUD
    handleSubmitProdutoComercial: onSubmitCustom,
    handleDeleteProdutoComercial: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções auxiliares
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla,
    
    // Ações de ordenação
    sortField,
    sortDirection,
    handleSort
  };
};

