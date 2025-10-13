/**
 * Hook customizado para Produto Origem
 * Gerencia estado e operações relacionadas a produtos origem
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutoOrigemService from '../services/produtoOrigem';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useProdutoOrigem = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('produto-origem', ProdutoOrigemService, {
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
    sortedData: produtosOrigemOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });
  
  // Estados locais
  const [loading, setLoading] = useState(false);
  
  // Dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  
  // Estatísticas específicas
  const [estatisticasProdutoOrigem, setEstatisticasProdutoOrigem] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  /**
   * Carrega dados auxiliares
   */
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [gruposRes, subgruposRes, classesRes, unidadesRes] = await Promise.all([
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/unidades?limit=1000')
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

  // Função loadDataWithFilters removida - useBaseEntity gerencia automaticamente

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
    // Recalcular estatísticas após salvar
    setEstatisticasProdutoOrigem(baseEntity.statistics || { total: 0, ativos: 0, inativos: 0 });
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    setEstatisticasProdutoOrigem(baseEntity.statistics || { total: 0, ativos: 0, inativos: 0 });
  }, [baseEntity]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  // useBaseEntity já gerencia recarregamento automático quando filtros ou paginação mudam
  // Não é necessário adicionar useEffect extras para loadData

  // Atualizar estatísticas quando os dados mudam
  useEffect(() => {
    setEstatisticasProdutoOrigem(baseEntity.statistics || { total: 0, ativos: 0, inativos: 0 });
  }, [baseEntity.statistics]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.setSearchTerm('');
    baseEntity.setStatusFilter('todos');
    baseEntity.updateFilter('grupoFilter', '');
    baseEntity.updateFilter('subgrupoFilter', '');
    baseEntity.updateFilter('classeFilter', '');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  /**
   * Visualizar produto origem (busca dados completos)
   */
  const handleViewProdutoOrigem = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoOrigemService.buscarPorId(id);
      if (response.success) {
        // Usar o método handleView do baseEntity que já gerencia o modal
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto origem');
      }
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      toast.error('Erro ao carregar dados do produto origem');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar produto origem (busca dados completos)
   */
  const handleEditProdutoOrigem = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoOrigemService.buscarPorId(id);
      if (response.success) {
        // Usar o método handleEdit do baseEntity que já gerencia o modal
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto origem');
      }
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      toast.error('Erro ao carregar dados do produto origem');
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
    produtosOrigem: isSortingLocally ? produtosOrigemOrdenados : baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: estatisticasProdutoOrigem,
    
    // Estados de modal (compatibilidade com modal existente)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingProdutoOrigem: baseEntity.editingItem,
    produtoOrigem: baseEntity.editingItem, // Alias para compatibilidade com modal
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    produtoOrigemToDelete: baseEntity.itemToDelete,
    
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
    handleAddProdutoOrigem: baseEntity.handleAdd,
    handleViewProdutoOrigem,
    handleEditProdutoOrigem,
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
    handleSubmitProdutoOrigem: onSubmitCustom,
    handleDeleteProdutoOrigem: baseEntity.handleDelete,
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
    handleSort
  };
};
