import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    enableDelete: true,
    autoLoad: false // Desabilitar carregamento automático - só carregar quando aplicar filtros
  });

  // Hook de filtros customizados
  const customFilters = useFilters({ 
    filialFilter: 'todos',
    centroCustoFilter: 'todos',
    almoxarifadoFilter: 'todos', 
    grupoFilter: 'todos',
    subgrupoFilter: 'todos',
    classeFilter: 'todos'
  });

  // Estados para dados auxiliares (para os filtros)
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // Estado para termo de busca visual (o que o usuário digita)
  const [searchTermVisual, setSearchTermVisual] = useState('');
  
  // Estado para termo de busca aplicado (usado na busca real)
  // Inicializar como null para indicar que ainda não foi aplicado nenhum filtro
  const [searchTermApplied, setSearchTermApplied] = useState(null);
  
  // Flag para indicar se os filtros já foram aplicados pela primeira vez
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Ajustar loading inicial para false quando autoLoad está desabilitado
  useEffect(() => {
    if (!filtersApplied && searchTermApplied === null) {
      baseEntity.setLoading(false);
    }
  }, [baseEntity, filtersApplied, searchTermApplied]);

  // Estados temporários para filtros (antes de aplicar)
  // Filial e Centro de Custo são obrigatórios (não podem ser 'todos' ou vazios)
  // grupoFilter agora é um array para permitir seleção múltipla
  const [tempFilters, setTempFilters] = useState({
    filialFilter: customFilters.filters.filialFilter || '',
    centroCustoFilter: customFilters.filters.centroCustoFilter || '',
    almoxarifadoFilter: customFilters.filters.almoxarifadoFilter || 'todos',
    grupoFilter: Array.isArray(customFilters.filters.grupoFilter) 
      ? customFilters.filters.grupoFilter 
      : (customFilters.filters.grupoFilter && customFilters.filters.grupoFilter !== 'todos' 
          ? [customFilters.filters.grupoFilter] 
          : []),
    subgrupoFilter: customFilters.filters.subgrupoFilter || 'todos',
    classeFilter: customFilters.filters.classeFilter || 'todos'
  });

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


  /**
   * Carrega opções de filtros do backend (apenas as que existem no banco)
   * Respeitando a hierarquia: Filial -> Centro de Custo -> Almoxarifado
   * E: Grupo -> Subgrupo -> Classes
   */
  const loadOpcoesFiltros = useCallback(async (filters = {}) => {
    try {
      setLoadingFiltros(true);
      const params = {};
      if (filters.filial_id) params.filial_id = filters.filial_id;
      if (filters.centro_custo_id) params.centro_custo_id = filters.centro_custo_id;
      if (filters.grupo_id) params.grupo_id = filters.grupo_id;
      if (filters.subgrupo_id) params.subgrupo_id = filters.subgrupo_id;
      
      const response = await EstoqueService.obterOpcoesFiltros(params);
      
      if (response.success && response.data) {
        setFiliais(response.data.filiais || []);
        setCentrosCusto(response.data.centrosCusto || []);
        setAlmoxarifados(response.data.almoxarifados || []);
        setGrupos(response.data.grupos || []);
        setSubgrupos(response.data.subgrupos || []);
        setClasses(response.data.classes || []);
      } else {
        toast.error(response.message || 'Erro ao carregar opções de filtros');
        setFiliais([]);
        setCentrosCusto([]);
        setAlmoxarifados([]);
        setGrupos([]);
        setSubgrupos([]);
        setClasses([]);
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtros:', error);
      toast.error('Erro ao carregar opções de filtros');
      setFiliais([]);
      setCentrosCusto([]);
      setAlmoxarifados([]);
      setGrupos([]);
      setSubgrupos([]);
      setClasses([]);
    } finally {
      setLoadingFiltros(false);
    }
  }, []);

  // Filtrar centros de custo quando uma filial está selecionada
  const centrosCustoFiltrados = useMemo(() => {
    const filialFilterId = tempFilters.filialFilter;
    if (!filialFilterId || filialFilterId === '' || filialFilterId === 'todos') {
      return [];
    } else {
      return centrosCusto.filter(cc => 
        cc.filial_id && cc.filial_id.toString() === filialFilterId.toString()
      );
    }
  }, [centrosCusto, tempFilters.filialFilter]);

  // Filtrar almoxarifados quando filial ou centro de custo está selecionado
  const almoxarifadosFiltrados = useMemo(() => {
    const filialFilterId = tempFilters.filialFilter;
    const centroCustoFilterId = tempFilters.centroCustoFilter;
    
    let filtrados = almoxarifados;
    
    if (filialFilterId && filialFilterId !== 'todos') {
      filtrados = filtrados.filter(a => 
        a.filial_id && a.filial_id.toString() === filialFilterId.toString()
      );
    }
    
    if (centroCustoFilterId && centroCustoFilterId !== 'todos') {
      filtrados = filtrados.filter(a => 
        a.centro_custo_id && a.centro_custo_id.toString() === centroCustoFilterId.toString()
      );
    }
    
    return filtrados;
  }, [almoxarifados, tempFilters.filialFilter, tempFilters.centroCustoFilter]);

  // Filtrar subgrupos quando grupos estão selecionados (agora suporta múltiplos grupos)
  const subgruposFiltrados = useMemo(() => {
    const gruposSelecionados = Array.isArray(tempFilters.grupoFilter) ? tempFilters.grupoFilter : [];
    if (gruposSelecionados.length === 0) {
      return subgrupos;
    } else {
      return subgrupos.filter(sg => 
        sg.grupo_id && gruposSelecionados.some(grupoId => 
          sg.grupo_id.toString() === grupoId.toString()
        )
      );
          }
  }, [subgrupos, tempFilters.grupoFilter]);

  // Filtrar classes quando um subgrupo está selecionado
  const classesFiltradas = useMemo(() => {
    const subgrupoFilterId = tempFilters.subgrupoFilter;
    if (!subgrupoFilterId || subgrupoFilterId === 'todos') {
      return classes;
    } else {
      return classes.filter(c => 
        c.subgrupo_id && c.subgrupo_id.toString() === subgrupoFilterId.toString()
      );
          }
  }, [classes, tempFilters.subgrupoFilter]);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    // Se os filtros ainda não foram aplicados, não carregar dados
    if (!filtersApplied && searchTermApplied === null) {
      return;
    }
    
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: searchTermApplied !== null ? (searchTermApplied || undefined) : undefined,
      filial_id: customFilters.filters.filialFilter && customFilters.filters.filialFilter !== '' && customFilters.filters.filialFilter !== 'todos' ? customFilters.filters.filialFilter : undefined,
      centro_custo_id: customFilters.filters.centroCustoFilter && customFilters.filters.centroCustoFilter !== '' && customFilters.filters.centroCustoFilter !== 'todos' ? customFilters.filters.centroCustoFilter : undefined,
      almoxarifado_id: customFilters.filters.almoxarifadoFilter !== 'todos' ? customFilters.filters.almoxarifadoFilter : undefined,
      grupo_id: Array.isArray(customFilters.filters.grupoFilter) && customFilters.filters.grupoFilter.length > 0 
        ? customFilters.filters.grupoFilter.join(',') 
        : (customFilters.filters.grupoFilter && customFilters.filters.grupoFilter !== 'todos' ? customFilters.filters.grupoFilter : undefined),
      subgrupo_id: customFilters.filters.subgrupoFilter !== 'todos' ? customFilters.filters.subgrupoFilter : undefined,
      classe_id: customFilters.filters.classeFilter !== 'todos' ? customFilters.filters.classeFilter : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters, searchTermApplied, filtersApplied]);

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
   * Aplicar filtros (copiar filtros temporários para aplicados)
   * Valida se Filial e Centro de Custo estão preenchidos (obrigatórios)
   */
  const handleApplyFilters = useCallback(() => {
    // Validar se Filial está preenchida (obrigatório)
    if (!tempFilters.filialFilter || tempFilters.filialFilter === '' || tempFilters.filialFilter === 'todos') {
      toast.error('Por favor, selecione uma Filial');
      return;
    }
    
    // Validar se Centro de Custo está preenchido (obrigatório)
    if (!tempFilters.centroCustoFilter || tempFilters.centroCustoFilter === '' || tempFilters.centroCustoFilter === 'todos') {
      toast.error('Por favor, selecione um Centro de Custo');
      return;
    }
    
    setSearchTermApplied(searchTermVisual || '');
    customFilters.updateFilter('filialFilter', tempFilters.filialFilter);
    customFilters.updateFilter('centroCustoFilter', tempFilters.centroCustoFilter);
    customFilters.updateFilter('almoxarifadoFilter', tempFilters.almoxarifadoFilter);
    customFilters.updateFilter('grupoFilter', tempFilters.grupoFilter);
    customFilters.updateFilter('subgrupoFilter', tempFilters.subgrupoFilter);
    customFilters.updateFilter('classeFilter', tempFilters.classeFilter);
    setFiltersApplied(true);
    baseEntity.handlePageChange(1);
  }, [searchTermVisual, tempFilters, customFilters, baseEntity]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    setSearchTermVisual('');
    setSearchTermApplied(null);
    setTempFilters({
      filialFilter: '',
      centroCustoFilter: '',
      almoxarifadoFilter: 'todos',
      grupoFilter: [], // Array vazio para seleção múltipla
      subgrupoFilter: 'todos',
      classeFilter: 'todos'
    });
    customFilters.updateFilter('filialFilter', '');
    customFilters.updateFilter('centroCustoFilter', '');
    customFilters.updateFilter('almoxarifadoFilter', 'todos');
    customFilters.updateFilter('grupoFilter', []); // Array vazio para seleção múltipla
    customFilters.updateFilter('subgrupoFilter', 'todos');
    customFilters.updateFilter('classeFilter', 'todos');
    setFiltersApplied(false);
    baseEntity.handlePageChange(1);
    // Limpar os dados da tela
    baseEntity.setItems([]);
    baseEntity.setEstatisticas({});
  }, [customFilters, baseEntity]);

  // Funções para atualizar filtros temporários (com reset de dependentes)
  const setTempFilialFilter = useCallback((value) => {
    setTempFilters(prev => ({ 
      ...prev, 
      filialFilter: value,
      centroCustoFilter: '', // Resetar centro de custo quando filial mudar (obrigatório)
      almoxarifadoFilter: 'todos' // Resetar almoxarifado quando filial mudar
    }));
  }, []);

  const setTempCentroCustoFilter = useCallback((value) => {
    setTempFilters(prev => ({ 
      ...prev, 
      centroCustoFilter: value,
      almoxarifadoFilter: 'todos' // Resetar almoxarifado quando centro de custo mudar
    }));
  }, []);

  const setTempAlmoxarifadoFilter = useCallback((value) => {
    setTempFilters(prev => ({ 
      ...prev, 
      almoxarifadoFilter: value,
      grupoFilter: [], // Resetar grupos quando almoxarifado mudar (array vazio)
      subgrupoFilter: 'todos', // Resetar subgrupo quando almoxarifado mudar
      classeFilter: 'todos' // Resetar classe quando almoxarifado mudar
    }));
  }, []);

  const setTempGrupoFilter = useCallback((value) => {
    // value agora é um array de IDs de grupos selecionados
    setTempFilters(prev => ({ 
      ...prev, 
      grupoFilter: Array.isArray(value) ? value : [],
      subgrupoFilter: 'todos', // Resetar subgrupo quando grupos mudarem
      classeFilter: 'todos' // Resetar classe quando grupos mudarem
    }));
  }, []);

  const setTempSubgrupoFilter = useCallback((value) => {
    setTempFilters(prev => ({ 
      ...prev, 
      subgrupoFilter: value,
      classeFilter: 'todos' // Resetar classe quando subgrupo mudar
    }));
  }, []);

  const setTempClasseFilter = useCallback((value) => {
    setTempFilters(prev => ({ ...prev, classeFilter: value }));
  }, []);

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
   * Visualizar estoque (busca variações do produto genérico)
   * O id passado é o produto_generico_id
   */
  const handleViewEstoque = useCallback(async (produtoGenericoId) => {
    try {
      baseEntity.setLoading(true);
      // Buscar todas as variações do produto genérico
      const response = await EstoqueService.buscarVariacoes(produtoGenericoId, {
        almoxarifado_id: customFilters.filters.almoxarifadoFilter !== 'todos' ? customFilters.filters.almoxarifadoFilter : undefined,
        filial_id: customFilters.filters.filialFilter !== 'todos' ? customFilters.filters.filialFilter : undefined
      });
      
      if (response.success && response.data && response.data.length > 0) {
        // Usar o primeiro item para informações gerais do produto
        const produtoInfo = response.data[0];
        // Criar objeto com informações do produto e todas as variações
        const estoqueCompleto = {
          produto_generico_id: produtoGenericoId,
          produto_generico_codigo: produtoInfo.produto_generico_codigo,
          produto_generico_nome: produtoInfo.produto_generico_nome,
          unidade_medida_sigla: produtoInfo.unidade_medida_sigla,
          unidade_medida_nome: produtoInfo.unidade_medida_nome,
          variacoes: response.data // Todas as variações (lotes e validades)
        };
        baseEntity.handleView(estoqueCompleto);
      } else {
        toast.error(response.message || 'Nenhuma variação encontrada para este produto');
      }
    } catch (error) {
      console.error('Erro ao buscar variações do estoque:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity, customFilters]);

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

  // Carregar opções de filtros na inicialização
  useEffect(() => {
    loadOpcoesFiltros();
  }, [loadOpcoesFiltros]);

  // Recarregar opções quando filtros hierárquicos mudarem
  useEffect(() => {
    if (tempFilters.filialFilter && tempFilters.filialFilter !== '' && tempFilters.filialFilter !== 'todos') {
      loadOpcoesFiltros({ filial_id: tempFilters.filialFilter });
    } else {
      // Se filial não está selecionada, carregar apenas filiais
      loadOpcoesFiltros();
    }
  }, [tempFilters.filialFilter, loadOpcoesFiltros]);

  useEffect(() => {
    if (tempFilters.centroCustoFilter && tempFilters.centroCustoFilter !== '' && tempFilters.centroCustoFilter !== 'todos') {
      loadOpcoesFiltros({ 
        filial_id: tempFilters.filialFilter && tempFilters.filialFilter !== '' && tempFilters.filialFilter !== 'todos' ? tempFilters.filialFilter : undefined,
        centro_custo_id: tempFilters.centroCustoFilter 
      });
    } else if (tempFilters.filialFilter && tempFilters.filialFilter !== '' && tempFilters.filialFilter !== 'todos') {
      loadOpcoesFiltros({ filial_id: tempFilters.filialFilter });
    }
  }, [tempFilters.centroCustoFilter, tempFilters.filialFilter, loadOpcoesFiltros]);

  useEffect(() => {
    if (tempFilters.almoxarifadoFilter && tempFilters.almoxarifadoFilter !== 'todos') {
      // Recarregar opções quando almoxarifado mudar para atualizar grupos
      const params = {};
      if (tempFilters.filialFilter && tempFilters.filialFilter !== '' && tempFilters.filialFilter !== 'todos') {
        params.filial_id = tempFilters.filialFilter;
      }
      if (tempFilters.centroCustoFilter && tempFilters.centroCustoFilter !== '' && tempFilters.centroCustoFilter !== 'todos') {
        params.centro_custo_id = tempFilters.centroCustoFilter;
      }
      loadOpcoesFiltros(params);
    }
  }, [tempFilters.almoxarifadoFilter, tempFilters.filialFilter, tempFilters.centroCustoFilter, loadOpcoesFiltros]);

  useEffect(() => {
    const gruposSelecionados = Array.isArray(tempFilters.grupoFilter) ? tempFilters.grupoFilter : [];
    if (gruposSelecionados.length > 0) {
      // Se há grupos selecionados, usar o primeiro para carregar subgrupos
      loadOpcoesFiltros({ grupo_id: gruposSelecionados[0] });
    } else if (tempFilters.almoxarifadoFilter && tempFilters.almoxarifadoFilter !== 'todos') {
      // Se grupos foram resetados mas almoxarifado está selecionado, recarregar opções
      const params = {};
      if (tempFilters.filialFilter && tempFilters.filialFilter !== '' && tempFilters.filialFilter !== 'todos') {
        params.filial_id = tempFilters.filialFilter;
      }
      if (tempFilters.centroCustoFilter && tempFilters.centroCustoFilter !== '' && tempFilters.centroCustoFilter !== 'todos') {
        params.centro_custo_id = tempFilters.centroCustoFilter;
      }
      loadOpcoesFiltros(params);
    }
  }, [tempFilters.grupoFilter, tempFilters.almoxarifadoFilter, tempFilters.filialFilter, tempFilters.centroCustoFilter, loadOpcoesFiltros]);

  useEffect(() => {
    if (tempFilters.subgrupoFilter && tempFilters.subgrupoFilter !== 'todos') {
      loadOpcoesFiltros({ 
        grupo_id: tempFilters.grupoFilter !== 'todos' ? tempFilters.grupoFilter : undefined,
        subgrupo_id: tempFilters.subgrupoFilter 
      });
    } else if (tempFilters.grupoFilter && tempFilters.grupoFilter !== 'todos') {
      loadOpcoesFiltros({ grupo_id: tempFilters.grupoFilter });
    }
  }, [tempFilters.subgrupoFilter, tempFilters.grupoFilter, loadOpcoesFiltros]);

  // Usar ref para armazenar a função e evitar loop
  const loadDataWithFiltersRef = useRef(loadDataWithFilters);
  loadDataWithFiltersRef.current = loadDataWithFilters;

  // Carregar dados quando filtros ou paginação mudam (apenas se filtros já foram aplicados)
  useEffect(() => {
    // Só carregar se os filtros já foram aplicados pelo menos uma vez
    if (filtersApplied) {
      loadDataWithFiltersRef.current();
    }
  }, [
    searchTermApplied,
    customFilters.filters.filialFilter,
    customFilters.filters.centroCustoFilter,
    customFilters.filters.almoxarifadoFilter,
    customFilters.filters.grupoFilter,
    customFilters.filters.subgrupoFilter,
    customFilters.filters.classeFilter,
    baseEntity.currentPage,
    baseEntity.itemsPerPage,
    filtersApplied
  ]);

  // Calcular estatísticas localmente se não vierem do backend
  const estatisticasCalculadas = useMemo(() => {
    const statsFromBackend = baseEntity.statistics;
    
    // Se já temos estatísticas do backend, usar elas
    if (statsFromBackend && (statsFromBackend.total > 0 || statsFromBackend.ativos > 0 || statsFromBackend.bloqueados > 0 || statsFromBackend.inativos > 0)) {
      return statsFromBackend;
    }
    
    // Caso contrário, calcular localmente baseado nos itens carregados
    const estoquesList = isSortingLocally ? estoquesOrdenados : baseEntity.items;
    if (!Array.isArray(estoquesList) || estoquesList.length === 0) {
      return statsFromBackend || {};
    }
    
    const total = estoquesList.length;
    const ativos = estoquesList.filter(e => e.status === 'ATIVO' || e.status === 'ativo' || e.status === 1).length;
    const bloqueados = estoquesList.filter(e => e.status === 'BLOQUEADO' || e.status === 'bloqueado').length;
    const inativos = estoquesList.filter(e => e.status === 'INATIVO' || e.status === 'inativo' || e.status === 0).length;
    
    // Calcular valor total e produtos abaixo do mínimo se possível
    const valorTotal = estoquesList
      .filter(e => e.status === 'ATIVO' || e.status === 'ativo' || e.status === 1)
      .reduce((sum, e) => sum + (parseFloat(e.valor_total) || 0), 0);
    
    const produtosAbaixoMinimo = estoquesList.filter(e => {
      const statusOk = e.status === 'ATIVO' || e.status === 'ativo' || e.status === 1;
      const qtdAtual = parseFloat(e.quantidade_atual) || 0;
      const estoqueMinimo = parseFloat(e.estoque_minimo) || 0;
      return statusOk && qtdAtual < estoqueMinimo;
    }).length;
    
    return {
      total: statsFromBackend?.total || total,
      ativos: statsFromBackend?.ativos || ativos,
      bloqueados: statsFromBackend?.bloqueados || bloqueados,
      inativos: statsFromBackend?.inativos || inativos,
      valor_total_estoque: statsFromBackend?.valor_total_estoque || valorTotal,
      produtos_abaixo_minimo: statsFromBackend?.produtos_abaixo_minimo || produtosAbaixoMinimo,
      ...statsFromBackend // Preservar outros campos do backend
    };
  }, [baseEntity.statistics, baseEntity.items, estoquesOrdenados, isSortingLocally]);

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
    
    // Estados de filtros (temporários - o que o usuário seleciona)
    searchTerm: searchTermVisual,
    filialFilter: tempFilters.filialFilter,
    filiais,
    centroCustoFilter: tempFilters.centroCustoFilter,
    centrosCusto: centrosCustoFiltrados,
    almoxarifadoFilter: tempFilters.almoxarifadoFilter,
    almoxarifados: almoxarifadosFiltrados,
    grupoFilter: tempFilters.grupoFilter,
    grupos,
    subgrupoFilter: tempFilters.subgrupoFilter,
    subgrupos: subgruposFiltrados,
    classeFilter: tempFilters.classeFilter,
    classes: classesFiltradas,
    loadingFiltros,
    
    // Estatísticas (com fallback para cálculo local)
    estatisticas: estatisticasCalculadas,
    
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
    handleApplyFilters,
    setFilialFilter: setTempFilialFilter,
    setCentroCustoFilter: setTempCentroCustoFilter,
    setAlmoxarifadoFilter: setTempAlmoxarifadoFilter,
    setGrupoFilter: setTempGrupoFilter,
    setSubgrupoFilter: setTempSubgrupoFilter,
    setClasseFilter: setTempClasseFilter,
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

