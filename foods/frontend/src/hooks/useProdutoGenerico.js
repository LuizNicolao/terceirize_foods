/**
 * Hook customizado para Produto Genérico
 * Gerencia estado e operações relacionadas a produtos genéricos
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import produtoGenericoService from '../services/produtoGenerico';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useProdutoGenerico = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('produto-generico', produtoGenericoService, {
    initialItemsPerPage: 20,
    initialFilters: { 
      grupoFilter: 'todos', 
      subgrupoFilter: 'todos', 
      classeFilter: 'todos', 
      produtoOrigemFilter: 'todos' 
    },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: produtosGenericosOrdenados,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 50,
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      // Atualizar estados de ordenação no baseEntity
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      // Recarregar dados com nova ordenação, passando os valores diretamente
      baseEntity.loadData({ sortField: field, sortDirection: direction });
    }
  });
  
  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  // Hook de busca com debounce removido - useBaseEntity já gerencia
  
  // Estados locais
  const [loading, setLoading] = useState(false);
  
  // Dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  
  // Estatísticas específicas
  const [estatisticasProdutoGenerico, setEstatisticasProdutoGenerico] = useState({
    total_produtos_genericos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    produtos_padrao: 0,
    com_produto_origem: 0,
    total_produtos_vinculados: 0
  });

  /**
   * Carrega dados auxiliares
   */
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [gruposRes, subgruposRes, classesRes, produtosOrigemRes, unidadesRes] = await Promise.all([
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/produto-origem?limit=1000'),
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
      setProdutosOrigem(processData(produtosOrigemRes));
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
    const cleanData = {
      ...data,
      nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
      descricao: data.descricao && data.descricao.trim() !== '' ? data.descricao.trim() : null
    };
    
    await baseEntity.onSubmit(cleanData);
    // Recalcular estatísticas após salvar
    setEstatisticasProdutoGenerico(baseEntity.estatisticas || { total_produtos_genericos: 0, produtos_ativos: 0, produtos_inativos: 0 });
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    setEstatisticasProdutoGenerico(baseEntity.estatisticas || { total_produtos_genericos: 0, produtos_ativos: 0, produtos_inativos: 0 });
  }, [baseEntity]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  // useEffect removidos - useBaseEntity já gerencia filtros e paginação automaticamente

  // Atualizar estatísticas quando os dados mudam
  useEffect(() => {
    if (baseEntity.estatisticas) {
      setEstatisticasProdutoGenerico({
        total_produtos_genericos: baseEntity.estatisticas.total || baseEntity.estatisticas.total_produtos_genericos || 0,
        produtos_ativos: baseEntity.estatisticas.ativos || baseEntity.estatisticas.produtos_ativos || 0,
        produtos_inativos: baseEntity.estatisticas.inativos || baseEntity.estatisticas.produtos_inativos || 0,
        produtos_padrao: baseEntity.estatisticas.produtos_padrao || 0,
        com_produto_origem: baseEntity.estatisticas.com_produto_origem || 0,
        total_produtos_vinculados: baseEntity.estatisticas.total_produtos_vinculados || 0
      });
    } else {
      setEstatisticasProdutoGenerico({
        total_produtos_genericos: 0,
        produtos_ativos: 0,
        produtos_inativos: 0,
        produtos_padrao: 0,
        com_produto_origem: 0,
        total_produtos_vinculados: 0
      });
    }
  }, [baseEntity.estatisticas]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearSearch();
    baseEntity.setStatusFilter('todos');
    baseEntity.updateFilter('grupoFilter', 'todos');
    baseEntity.updateFilter('subgrupoFilter', 'todos');
    baseEntity.updateFilter('classeFilter', 'todos');
    baseEntity.updateFilter('produtoOrigemFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  /**
   * Visualizar produto genérico (busca dados completos)
   */
  const handleViewProdutoGenerico = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await produtoGenericoService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto genérico');
      }
    } catch (error) {
      console.error('Erro ao buscar produto genérico:', error);
      toast.error('Erro ao carregar dados do produto genérico');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar produto genérico (busca dados completos)
   */
  const handleEditProdutoGenerico = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await produtoGenericoService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar produto genérico');
      }
    } catch (error) {
      console.error('Erro ao buscar produto genérico:', error);
      toast.error('Erro ao carregar dados do produto genérico');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  // Funções auxiliares
  const formatDate = useCallback((date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  }, []);

  const getStatusColor = useCallback((status) => {
    return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }, []);

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

  const getProdutoOrigemName = useCallback((produtoOrigemId) => {
    const produtoOrigem = produtosOrigem.find(po => po.id === produtoOrigemId);
    return produtoOrigem ? produtoOrigem.nome : '-';
  }, [produtosOrigem]);

  const getUnidadeMedidaName = useCallback((unidadeId) => {
    const unidade = unidadesMedida.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : '-';
  }, [unidadesMedida]);

  const getUnidadeMedidaSigla = useCallback((unidadeId) => {
    if (!unidadesMedida || unidadesMedida.length === 0) return '-';
    const unidade = unidadesMedida.find(u => u.id === unidadeId);
    return unidade ? unidade.sigla : '-';
  }, [unidadesMedida]);

  return {
    // Estados principais
    produtosGenericos: isSortingLocally ? produtosGenericosOrdenados : baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: estatisticasProdutoGenerico,
    
    // Estados de modal (compatibilidade com modal existente)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingProdutoGenerico: baseEntity.editingItem,
    produtoGenerico: baseEntity.editingItem, // Alias para compatibilidade com modal
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    produtoGenericoToDelete: baseEntity.itemToDelete,
    
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
    produtoOrigemFilter: baseEntity.filters.produtoOrigemFilter,
    
    // Estados de validação
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de dados auxiliares
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,
    
    // Ações de modal
    handleAddProdutoGenerico: baseEntity.handleAdd,
    handleViewProdutoGenerico,
    handleEditProdutoGenerico,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: baseEntity.setStatusFilter,
    setGrupoFilter: (value) => baseEntity.updateFilter('grupoFilter', value),
    setSubgrupoFilter: (value) => baseEntity.updateFilter('subgrupoFilter', value),
    setClasseFilter: (value) => baseEntity.updateFilter('classeFilter', value),
    setProdutoOrigemFilter: (value) => baseEntity.updateFilter('produtoOrigemFilter', value),
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    
    // Ações de CRUD
    onSubmit: onSubmitCustom,
    handleDeleteProdutoGenerico: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções auxiliares
    formatDate,
    getStatusLabel,
    getStatusColor,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getProdutoOrigemName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla,
    
    // Ações de ordenação
    sortField,
    sortDirection,
    handleSort
  };
};
