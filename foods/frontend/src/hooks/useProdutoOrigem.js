/**
 * Hook customizado para Produto Origem
 * Gerencia estado e operações relacionadas a produtos origem
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutoOrigemService from '../services/produtoOrigem';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';

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

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.grupoFilter, customFilters.subgrupoFilter, customFilters.classeFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Atualizar estatísticas quando os dados mudam
  useEffect(() => {
    setEstatisticasProdutoOrigem(baseEntity.statistics || { total: 0, ativos: 0, inativos: 0 });
  }, [baseEntity.statistics]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    customFilters.setGrupoFilter('');
    customFilters.setSubgrupoFilter('');
    customFilters.setClasseFilter('');
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

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

  return {
    // Estados principais
    produtosOrigem: baseEntity.items,
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
    statusFilter: customFilters.statusFilter,
    grupoFilter: customFilters.grupoFilter,
    subgrupoFilter: customFilters.subgrupoFilter,
    classeFilter: customFilters.classeFilter,
    
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
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setGrupoFilter: customFilters.setGrupoFilter,
    setSubgrupoFilter: customFilters.setSubgrupoFilter,
    setClasseFilter: customFilters.setClasseFilter,
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
    getUnidadeMedidaName
  };
};
