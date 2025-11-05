/**
 * Hook customizado para Solicitações de Compras
 * Gerencia estado e operações relacionadas a solicitações de compras
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SolicitacoesComprasService from '../services/solicitacoesCompras';
import PdfTemplatesService from '../services/pdfTemplatesService';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useSolicitacoesCompras = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('solicitacoes-compras', SolicitacoesComprasService, {
    initialItemsPerPage: 20,
    initialFilters: {
      status: '',
      filial_id: ''
    },
    enableStats: true,
    enableDelete: true,
    enableDebouncedSearch: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({
    status: '',
    filial_id: 'todos',
    data_inicio: '',
    data_fim: ''
  });

  // Estados locais
  const [loading, setLoading] = useState(false);
  
  // Estados de seleção em lote
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingPrint, setLoadingPrint] = useState(false);
  
  // Estados de seleção de template
  const [showTemplateSelectModal, setShowTemplateSelectModal] = useState(false);
  const [templatesDisponiveis, setTemplatesDisponiveis] = useState([]);
  const [pendingPrintIds, setPendingPrintIds] = useState([]);
  
  // Dados auxiliares
  const [filiais, setFiliais] = useState([]);
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  /**
   * Carrega dados auxiliares
   */
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [filiaisRes, produtosRes, unidadesRes] = await Promise.all([
        api.get('/filiais?limit=1000&status=1'),
        api.get('/produto-generico?limit=1000&status=1'),
        api.get('/unidades?limit=1000')
      ]);

      // Processar dados auxiliares
      const processData = (response) => {
        // Tentar diferentes estruturas de resposta
        if (response.data?.data?.items) return response.data.data.items;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        if (response.data?.data) return response.data.data;
        if (Array.isArray(response.data)) return response.data;
        return response.data || [];
      };

      setFiliais(processData(filiaisRes));
      setProdutosGenericos(processData(produtosRes));
      setUnidadesMedida(processData(unidadesRes));
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: baseEntity.searchTerm || undefined,
      status: customFilters.filters.status || undefined,
      filial_id: customFilters.filters.filial_id && customFilters.filters.filial_id !== 'todos' ? customFilters.filters.filial_id : undefined,
      data_inicio: customFilters.filters.data_inicio || undefined,
      data_fim: customFilters.filters.data_fim || undefined
    };

    // Remover parâmetros vazios
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === 'todos') {
        delete params[key];
      }
    });

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  // Carregar dados quando filtros ou paginação mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, customFilters.filters.status, customFilters.filters.filial_id, customFilters.filters.data_inicio, customFilters.filters.data_fim]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
  }, [baseEntity]);

  /**
   * Buscar semana de abastecimento
   */
  const buscarSemanaAbastecimento = useCallback(async (dataEntrega) => {
    try {
      const response = await SolicitacoesComprasService.buscarSemanaAbastecimento(dataEntrega);
      return response;
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
      return { success: false, error: 'Erro ao buscar semana de abastecimento' };
    }
  }, []);

  /**
   * Recalcular status
   */
  const recalcularStatus = useCallback(async (id) => {
    try {
      const response = await SolicitacoesComprasService.recalcularStatus(id);
      if (response.success) {
        await loadDataWithFilters(); // Recarregar lista
        return response;
      }
      return response;
    } catch (error) {
      console.error('Erro ao recalcular status:', error);
      return { success: false, error: 'Erro ao recalcular status' };
    }
  }, [loadDataWithFilters]);

  /**
   * Visualizar solicitação (busca dados completos com itens)
   */
  const handleViewSolicitacao = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await SolicitacoesComprasService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar solicitação');
      }
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      toast.error('Erro ao carregar dados da solicitação');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar solicitação (busca dados completos com itens)
   */
  const handleEditSolicitacao = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await SolicitacoesComprasService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar solicitação');
      }
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      toast.error('Erro ao carregar dados da solicitação');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Handle key press para buscar ao pressionar Enter
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

  /**
   * Limpar filtros
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.setSearchTerm('');
    customFilters.setFilters({
      status: '',
      filial_id: 'todos',
      data_inicio: '',
      data_fim: ''
    });
    baseEntity.handlePageChange(1);
  }, [baseEntity, customFilters]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  // Funções auxiliares para obter nomes
  const getFilialName = useCallback((filialId) => {
    const filial = filiais.find(f => f.id === filialId || f.id.toString() === filialId?.toString());
    return filial ? (filial.filial || filial.nome || `Filial ${filial.id}`) : '-';
  }, [filiais]);

  const getProdutoName = useCallback((produtoId) => {
    const produto = produtosGenericos.find(p => p.id === produtoId);
    return produto ? produto.nome : '-';
  }, [produtosGenericos]);

  const getUnidadeMedidaName = useCallback((unidadeId) => {
    const unidade = unidadesMedida.find(um => um.id === unidadeId);
    return unidade ? unidade.nome : '-';
  }, [unidadesMedida]);

  const getUnidadeMedidaSimbolo = useCallback((unidadeId) => {
    const unidade = unidadesMedida.find(um => um.id === unidadeId);
    return unidade ? (unidade.sigla || unidade.simbolo) : '-';
  }, [unidadesMedida]);

  const getStatusLabel = useCallback((status) => {
    const statusMap = {
      'aberto': { label: 'Aberto', color: 'bg-blue-100 text-blue-800' },
      'parcial': { label: 'Parcial', color: 'bg-yellow-100 text-yellow-800' },
      'finalizado': { label: 'Finalizado', color: 'bg-green-100 text-green-800' }
    };
    return statusMap[status] || { label: status || 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
  }, []);

  /**
   * Seleção de itens
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedIds(baseEntity.items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [baseEntity.items]);

  const handleSelectItem = useCallback((id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  }, []);

  /**
   * Buscar templates e decidir se mostra modal ou imprime direto
   */
  const buscarTemplatesEImprimir = useCallback(async (ids) => {
    try {
      // Buscar templates disponíveis para solicitações de compras
      const templatesResponse = await PdfTemplatesService.listarTemplatesPorTela('solicitacoes-compras');
      
      if (templatesResponse.success && templatesResponse.data && templatesResponse.data.length > 0) {
        // Se houver múltiplos templates, mostrar modal de seleção
        if (templatesResponse.data.length > 1) {
          setTemplatesDisponiveis(templatesResponse.data);
          setPendingPrintIds(ids);
          setShowTemplateSelectModal(true);
        } else {
          // Se houver apenas um template, usar ele automaticamente
          const templateId = templatesResponse.data[0].id;
          await imprimirComTemplate(ids, templateId);
        }
      } else {
        // Se não houver templates, usar geração padrão (sem template_id)
        await imprimirComTemplate(ids, null);
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      // Em caso de erro, usar geração padrão
      await imprimirComTemplate(ids, null);
    }
  }, []);

  /**
   * Imprimir usando template específico
   */
  const imprimirComTemplate = useCallback(async (ids, templateId) => {
    setLoadingPrint(true);
    try {
      // Gerar PDF para cada solicitação selecionada
      for (const id of ids) {
        const response = await SolicitacoesComprasService.gerarPDF(id, templateId);
        if (response) {
          // Abrir PDF em nova aba
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          window.URL.revokeObjectURL(url);
        }
      }
      toast.success(`${ids.length} solicitação(ões) impressa(s) com sucesso!`);
      setSelectedIds([]);
    } catch (error) {
      console.error('Erro ao imprimir solicitações:', error);
      toast.error('Erro ao gerar PDF das solicitações');
    } finally {
      setLoadingPrint(false);
    }
  }, []);

  /**
   * Imprimir solicitações selecionadas
   */
  const handleImprimirLote = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await buscarTemplatesEImprimir(selectedIds);
  }, [selectedIds, buscarTemplatesEImprimir]);

  /**
   * Imprimir uma solicitação individual
   */
  const handleImprimir = useCallback(async (id) => {
    await buscarTemplatesEImprimir([id]);
  }, [buscarTemplatesEImprimir]);

  /**
   * Selecionar template no modal
   */
  const handleSelecionarTemplate = useCallback(async (templateId) => {
    setShowTemplateSelectModal(false);
    await imprimirComTemplate(pendingPrintIds, templateId);
    setPendingPrintIds([]);
  }, [pendingPrintIds, imprimirComTemplate]);

  return {
    // Estados principais
    solicitacoes: baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: baseEntity.estatisticas,
    
    // Estados de modal
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingSolicitacao: baseEntity.editingItem,
    solicitacao: baseEntity.editingItem, // Alias para compatibilidade
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    solicitacaoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.filters.status,
    filialFilter: customFilters.filters.filial_id,
    dataInicioFilter: customFilters.filters.data_inicio,
    dataFimFilter: customFilters.filters.data_fim,
    
    // Estados de validação
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de dados auxiliares
    filiais,
    produtosGenericos,
    unidadesMedida,
    
    // Ações de modal
    handleAddSolicitacao: baseEntity.handleAdd,
    handleViewSolicitacao,
    handleEditSolicitacao,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress,
    setStatusFilter: (value) => customFilters.updateFilter('status', value),
    setFilialFilter: (value) => customFilters.updateFilter('filial_id', value),
    setDataInicioFilter: (value) => customFilters.updateFilter('data_inicio', value),
    setDataFimFilter: (value) => customFilters.updateFilter('data_fim', value),
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    
    // Ações de CRUD
    handleSubmitSolicitacao: onSubmitCustom,
    handleDeleteSolicitacao: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Ações específicas
    buscarSemanaAbastecimento,
    recalcularStatus,
    
    // Funções auxiliares
    getFilialName,
    getProdutoName,
    getUnidadeMedidaName,
    getUnidadeMedidaSimbolo,
    getStatusLabel,
    
    // Seleção e ações em lote
    selectedIds,
    handleSelectAll,
    handleSelectItem,
    handleImprimirLote,
    handleImprimir,
    loadingPrint,
    
    // Estados de seleção de template
    showTemplateSelectModal,
    templatesDisponiveis,
    handleSelecionarTemplate,
    handleCloseTemplateModal: () => {
      setShowTemplateSelectModal(false);
      setPendingPrintIds([]);
    }
  };
};

