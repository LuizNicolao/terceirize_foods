import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutosPerCapitaService from '../services/produtosPerCapita';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import { useExport } from './common/useExport';

/**
 * Hook customizado para Produtos Per Capita
 * Segue padrão de excelência do sistema (padrão foods)
 */
export const useProdutosPerCapita = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('Produto per capita', ProdutosPerCapitaService, {
    initialItemsPerPage: 20,
    initialFilters: {}
  });

  // Hook de filtros customizados para produtos per capita (padrão foods)
  const customFilters = useFilters({});


  // Hook para exportação
  const exportHook = useExport(ProdutosPerCapitaService);

  // Estados específicos para produtos per capita
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [loadingProdutosDisponiveis, setLoadingProdutosDisponiveis] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false);
  const [resumoPorPeriodo, setResumoPorPeriodo] = useState([]);

  /**
   * Carregar produtos disponíveis
   */
  const carregarProdutosDisponiveis = useCallback(async (filtros = {}) => {
    setLoadingProdutosDisponiveis(true);
    try {
      const result = await ProdutosPerCapitaService.buscarProdutosDisponiveis(filtros);
      if (result.success) {
        setProdutosDisponiveis(result.data);
      } else {
        toast.error(result.error || 'Erro ao carregar produtos disponíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos disponíveis:', error);
      toast.error('Erro ao carregar produtos disponíveis');
    } finally {
      setLoadingProdutosDisponiveis(false);
    }
  }, []);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    setLoadingEstatisticas(true);
    try {
      const result = await ProdutosPerCapitaService.obterEstatisticas();
      if (result.success) {
        setEstatisticas(result.data);
      } else {
        console.error('Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingEstatisticas(false);
    }
  }, []);

  /**
   * Carregar resumo por período
   */
  const carregarResumoPorPeriodo = useCallback(async () => {
    try {
      const result = await ProdutosPerCapitaService.obterResumoPorPeriodo();
      if (result.success) {
        setResumoPorPeriodo(result.data);
      } else {
        console.error('Erro ao carregar resumo por período:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo por período:', error);
    }
  }, []);

  /**
   * Buscar produtos per capita por produtos específicos
   */
  const buscarPorProdutos = useCallback(async (produtoIds) => {
    try {
      const result = await ProdutosPerCapitaService.buscarPorProdutos(produtoIds);
      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error || 'Erro ao buscar produtos per capita');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar produtos per capita:', error);
      toast.error('Erro ao buscar produtos per capita');
      return [];
    }
  }, []);

  /**
   * Formatar per capita para exibição
   */
  const formatarPerCapita = useCallback((valor) => {
    if (!valor || valor === 0) return '0,000';
    return parseFloat(valor).toFixed(3).replace('.', ',');
  }, []);

  /**
   * Formatar período para exibição
   */
  const formatarPeriodo = useCallback((periodo) => {
    const periodos = {
      'lanche_manha': 'Lanche Manhã',
      'almoco': 'Almoço',
      'lanche_tarde': 'Lanche Tarde',
      'parcial': 'Parcial',
      'eja': 'EJA'
    };
    return periodos[periodo] || periodo;
  }, []);

  /**
   * Obter períodos com per capita
   */
  const obterPeriodosComPerCapita = useCallback((produto) => {
    const periodos = [];
    
    if (produto.per_capita_lanche_manha > 0) {
      periodos.push({
        periodo: 'lanche_manha',
        nome: 'Lanche Manhã',
        valor: produto.per_capita_lanche_manha
      });
    }
    
    if (produto.per_capita_almoco > 0) {
      periodos.push({
        periodo: 'almoco',
        nome: 'Almoço',
        valor: produto.per_capita_almoco
      });
    }
    
    if (produto.per_capita_lanche_tarde > 0) {
      periodos.push({
        periodo: 'lanche_tarde',
        nome: 'Lanche Tarde',
        valor: produto.per_capita_lanche_tarde
      });
    }
    
    if (produto.per_capita_parcial > 0) {
      periodos.push({
        periodo: 'parcial',
        nome: 'Parcial',
        valor: produto.per_capita_parcial
      });
    }
    
    if (produto.per_capita_eja > 0) {
      periodos.push({
        periodo: 'eja',
        nome: 'EJA',
        valor: produto.per_capita_eja
      });
    }
    
    return periodos;
  }, []);

  /**
   * Validar dados do produto per capita
   */
  const validarProdutoPerCapita = useCallback((dados) => {
    const erros = [];

    if (!dados.produto_id) {
      erros.push('Produto é obrigatório');
    }

    // Verificar se pelo menos um per capita foi definido
    const temPerCapita = dados.per_capita_lanche_manha > 0 ||
                        dados.per_capita_almoco > 0 ||
                        dados.per_capita_lanche_tarde > 0 ||
                        dados.per_capita_parcial > 0 ||
                        dados.per_capita_eja > 0;

    if (!temPerCapita) {
      erros.push('Pelo menos um per capita deve ser definido');
    }

    // Validar valores numéricos
    const camposPerCapita = [
      'per_capita_lanche_manha',
      'per_capita_almoco',
      'per_capita_lanche_tarde',
      'per_capita_parcial',
      'per_capita_eja'
    ];

    camposPerCapita.forEach(campo => {
      if (dados[campo] !== undefined && dados[campo] !== null && dados[campo] !== '') {
        const valor = parseFloat(dados[campo]);
        if (isNaN(valor) || valor < 0 || valor > 999.999) {
          erros.push(`${formatarPeriodo(campo)} deve ser um número entre 0 e 999,999`);
        }
      }
    });

    return erros;
  }, [formatarPeriodo]);

  /**
   * Carrega dados com filtros customizados (padrão foods)
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.appliedSearchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Limpar todos os filtros
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    customFilters.clearFilters();
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarEstatisticas();
    carregarResumoPorPeriodo();
  }, []); // Remover dependências para evitar loop infinito

  // Carregar dados quando filtros customizados mudam (padrão foods)
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.appliedSearchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  return {
    // Estados principais (usa dados do baseEntity)
    produtos: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingItem: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    itemToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
      currentPage: baseEntity.currentPage,
      totalPages: baseEntity.totalPages,
      totalItems: baseEntity.totalItems,
      itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros (padrão foods)
    searchTerm: customFilters.searchTerm || baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter || baseEntity.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados específicos
    produtosDisponiveis,
    loadingProdutosDisponiveis,
    estatisticas: estatisticas || baseEntity.estatisticas,
    loadingEstatisticas,
    resumoPorPeriodo,
    
    // Ações de modal (do hook base)
    handleAdd: baseEntity.handleAdd,
    handleView: baseEntity.handleView,
    handleEdit: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros (padrão foods)
    setSearchTerm: customFilters.setSearchTerm,
    setStatusFilter: customFilters.setStatusFilter || baseEntity.setStatusFilter,
    applySearch: customFilters.applySearch,
    handleClearFilters,
    
    // Ações de CRUD (do hook base)
    onSubmit: baseEntity.onSubmit,
    handleDelete: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Exportação
    ...exportHook,
    
    // Funções específicas
    carregarProdutosDisponiveis,
    carregarEstatisticas,
    carregarResumoPorPeriodo,
    buscarPorProdutos,
    formatarPerCapita,
    formatarPeriodo,
    obterPeriodosComPerCapita,
    validarProdutoPerCapita,
    
    // Filtros customizados (padrão foods)
    grupoFilter: customFilters.filters.grupoFilter || '',
    setGrupoFilter: (value) => customFilters.updateFilter('grupoFilter', value),
    
    // Aliases para compatibilidade
    carregarProdutos: loadDataWithFilters,
    pagination: {
      currentPage: baseEntity.currentPage,
      totalPages: baseEntity.totalPages,
      totalItems: baseEntity.totalItems,
      itemsPerPage: baseEntity.itemsPerPage,
      hasNextPage: baseEntity.currentPage < baseEntity.totalPages,
      hasPrevPage: baseEntity.currentPage > 1
    }
  };
};
